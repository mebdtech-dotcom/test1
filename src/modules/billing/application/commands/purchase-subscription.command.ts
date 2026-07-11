// M7 application (PRIVATE) — `billing.purchase_subscription.v1` (Doc-4I §HB-2.1 / Doc-5I §5
// `POST /billing/subscriptions` · 201 + Location). W3-BILL-4. ORG-SCOPED audited write (Users Act, Orgs
// Own) — actor User (Owner) with `can_manage_billing`, no platform-staff. Emits the platform's FIRST §8
// event `SubscriptionPurchased` (Doc-2 §8; at pending_payment creation — Doc-5I §5.1/R9) via the M0 outbox.
//
// Runs INSIDE the composition's `withActiveOrg` tenant transaction (`db` = that tx) — it opens NO tx of its
// own; the insert, the `subscription_events` log, the outbox event, and the audit all ride the ONE tenant
// tx (atomic — Doc-4B §16.2 / D7). Validation (Doc-4I §HB-2.1): SYNTAX → AUTHZ (`can_manage_billing`,
// resolved by the composition) → REFERENCE (plan active) → STATE (one active subscription per org).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import type { AppendAuditRecord, WriteOutboxEvent } from "@/modules/core/contracts";
import {
  appendSubscriptionEvent,
  findActiveSubscriptionId,
  insertSubscription,
  loadPurchasablePlan,
} from "../../infrastructure/data/subscription.repository";
import { SUBSCRIPTION_ENTITY_TYPE, SubscriptionAuditAction } from "../../domain/audit-actions";
import { BillingEventName, SUBSCRIPTION_EVENT_VERSION } from "../../contracts/events";
import type {
  PlanWriteError,
  PurchaseSubscriptionInput,
  PurchaseSubscriptionOutcome,
} from "../../contracts/types";

const INVALID_INPUT = "billing_subscription_invalid_input";
const FORBIDDEN = "billing_subscription_forbidden";
const ACTIVE_CONFLICT = "billing_subscription_active_exists"; // STATE — one-active-per-org
const REFERENCE = "billing_subscription_reference";

/** The server-resolved org-scoped request context (from the composition's `withActiveOrg` — never client input). */
export interface PurchaseSubscriptionContext {
  /** The acting user (Invariant #5 — users act). */
  userId: string;
  /** The server-validated active org (organizations own). */
  activeOrgId: string;
  /** Resolved by the composition via `hasPermission(can_manage_billing)` on the tenant tx (never client). */
  canManageBilling: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Injected M0 services (D7 rule 4) — the audit-write + the outbox event-write surfaces. */
export interface PurchaseSubscriptionDeps {
  appendAuditRecord: AppendAuditRecord;
  writeOutboxEvent: WriteOutboxEvent;
}

function err(
  errorClass: PlanWriteError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: PlanWriteError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** SYNTAX validation (Doc-4A §11.2 category 1). */
export function validatePurchaseSubscriptionInput(input: PurchaseSubscriptionInput): string | null {
  if (typeof input.planId !== "string" || !UUID_PATTERN.test(input.planId)) {
    return "plan_id must be a valid UUID.";
  }
  if (input.autoRenew !== undefined && typeof input.autoRenew !== "boolean") {
    return "auto_renew must be a boolean.";
  }
  return null;
}

function computePeriodEnd(start: Date, cycle: "monthly" | "annual"): Date {
  const end = new Date(start);
  if (cycle === "monthly") end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);
  return end;
}

/**
 * Purchase a subscription for the active org (Doc-4I §HB-2.1). Creates it at `pending_payment`, logs the
 * purchase event, emits `SubscriptionPurchased`, and audits — all in the ONE tenant transaction the
 * composition supplies (`db`). Activation (`pending_payment → active`) is the out-of-wire `record_payment`.
 */
export async function purchaseSubscriptionCommand(
  input: PurchaseSubscriptionInput,
  ctx: PurchaseSubscriptionContext,
  deps: PurchaseSubscriptionDeps,
  db: DbExecutor = prisma,
): Promise<PurchaseSubscriptionOutcome> {
  const invalid = validatePurchaseSubscriptionInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // AUTHZ — `can_manage_billing` (Owner). Resolved by the composition (fail-closed defense-in-depth here).
  if (ctx.canManageBilling !== true) {
    return err(
      "AUTHORIZATION",
      FORBIDDEN,
      "can_manage_billing is required to purchase a subscription.",
    );
  }

  // REFERENCE — the plan must resolve to an ACTIVE plan (Model B: is_active ∧ live).
  const plan = await loadPurchasablePlan(input.planId, db);
  if (plan === null) {
    return err("REFERENCE", REFERENCE, "plan_id does not resolve to an active plan.");
  }

  // STATE — one active subscription per org (the partial-unique is the DB backstop; this pre-check is
  // the clean rejection). A concurrent race would surface at the unique index (a pending_payment insert
  // does not hit it — only `active` rows are constrained).
  const existingActive = await findActiveSubscriptionId(ctx.activeOrgId, db);
  if (existingActive !== null) {
    return err("STATE", ACTIVE_CONFLICT, "the organization already has an active subscription.");
  }

  // WRITE — insert at `pending_payment`; the period is derived from the plan's billing cycle.
  const periodStart = new Date();
  const periodEnd = computePeriodEnd(periodStart, plan.billingCycle);
  const autoRenew = input.autoRenew ?? true;
  const { subscriptionId } = await insertSubscription(
    {
      organizationId: ctx.activeOrgId,
      planId: input.planId,
      autoRenew,
      periodStart,
      periodEnd,
      actorUserId: ctx.userId,
    },
    db,
  );

  // subscription_events lifecycle log (purchase).
  await appendSubscriptionEvent(
    {
      subscriptionId,
      eventType: "purchase",
      payload: { plan_id: input.planId },
      actorUserId: ctx.userId,
    },
    db,
  );

  // EVENT — SubscriptionPurchased (Doc-2 §8; emitted at creation — Doc-5I §5.1/R9). Atomic via the M0
  // outbox write on the SAME tenant tx (Doc-4B §16.2). Thin payload (IDs only — §16.5).
  await deps.writeOutboxEvent(
    {
      eventName: BillingEventName.SUBSCRIPTION_PURCHASED,
      eventVersion: SUBSCRIPTION_EVENT_VERSION,
      aggregateId: subscriptionId,
      payload: {
        subscription_id: subscriptionId,
        organization_id: ctx.activeOrgId,
        plan_id: input.planId,
      },
    },
    db,
  );

  // AUDIT — user-attributed; §9 Financial "subscription purchase" (ENUMERATED — no [ESC-BILL-AUDIT]);
  // organization_id = the Controlling Org (the tenant audit-context leg).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: SUBSCRIPTION_ENTITY_TYPE,
      entityId: subscriptionId,
      action: SubscriptionAuditAction.PURCHASED,
      oldValue: null,
      newValue: { plan_id: input.planId, status: "pending_payment", auto_renew: autoRenew },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: { subscriptionId, status: "pending_payment", planId: input.planId },
  };
}
