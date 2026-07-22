// M7 application (PRIVATE) — `billing.cancel_subscription.v1` (Doc-4I §HB-2.2 / Doc-5I §5
// `POST /billing/subscriptions/{subscription_id}/cancel-subscription` · 200). W3-BILL-5. ORG-SCOPED
// audited write (Users Act, Orgs Own) — actor User (Owner) with `can_manage_billing`. Sets
// `auto_renew=false` on the org's `active` subscription; the state is UNCHANGED (`active`) — the
// subscription runs to period end, where the out-of-wire `expire_subscription` System job (§10) drives
// `active → expired`. NO §8 event at cancel (Doc-4I §H.7/R9 — the expiry event fires at period end).
//
// Runs INSIDE the composition's `withActiveOrg` tenant transaction (`db` = that tx) — the CAS update, the
// `subscription_events` (cancel) log, and the audit all ride the ONE tenant tx (atomic — D7). Validation
// (Doc-4I §HB-2.2): SYNTAX → AUTHZ (`can_manage_billing`, resolved by the composition) → REFERENCE/SCOPE
// (the subscription resolves within the Controlling Org, else NOT_FOUND — protected-fact collapse §3.5) →
// STATE (must be `active`) / CONFLICT (`expected_status` lost race at the CAS). Idempotent: cancelling an
// already-cancelled (`auto_renew=false`) active subscription returns the current status, no side effect.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  appendSubscriptionEvent,
  cancelSubscriptionCas,
  loadSubscriptionScoped,
} from "../../infrastructure/data/subscription.repository";
import { SUBSCRIPTION_ENTITY_TYPE, SubscriptionAuditAction } from "../../domain/audit-actions";
import type {
  CancelSubscriptionInput,
  CancelSubscriptionOutcome,
  SubscriptionWriteError,
} from "../../contracts/types";

const INVALID_INPUT = "billing_subscription_invalid_input";
const FORBIDDEN = "billing_subscription_forbidden";
const NOT_FOUND = "billing_subscription_not_found";
const NOT_ACTIVE = "billing_subscription_not_active"; // STATE — cancel applies to an `active` subscription only
const LOST_RACE = "billing_subscription_conflict"; // CONFLICT — expected_status mismatch (lost race at the CAS)

/** The server-resolved org-scoped request context (from the composition's `withActiveOrg` — never client input). */
export interface CancelSubscriptionContext {
  /** The acting user (Invariant #5 — users act). */
  userId: string;
  /** The server-validated active org (organizations own). */
  activeOrgId: string;
  /** Resolved by the composition via `hasPermission(can_manage_billing)` on the tenant tx (never client). */
  canManageBilling: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Injected M0 services (D7 rule 4) — cancel emits NO §8 event, so only the audit-write surface. */
export interface CancelSubscriptionDeps {
  appendAuditRecord: AppendAuditRecord;
}

function err(
  errorClass: SubscriptionWriteError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: SubscriptionWriteError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** SYNTAX validation (Doc-4A §11.2 category 1). `expected_status` is `enum<active>` — the only legal value. */
export function validateCancelSubscriptionInput(input: CancelSubscriptionInput): string | null {
  if (typeof input.subscriptionId !== "string" || !UUID_PATTERN.test(input.subscriptionId)) {
    return "subscription_id must be a valid UUID.";
  }
  if (input.expectedStatus !== "active") {
    return "expected_status must be 'active'.";
  }
  return null;
}

/**
 * Cancel a subscription for the active org (Doc-4I §HB-2.2). Sets `auto_renew=false` on the `active`
 * subscription (status unchanged), logs the cancel event, and audits — all in the ONE tenant transaction
 * the composition supplies (`db`). No §8 event. Idempotent on an already-cancelled active subscription.
 */
export async function cancelSubscriptionCommand(
  input: CancelSubscriptionInput,
  ctx: CancelSubscriptionContext,
  deps: CancelSubscriptionDeps,
  db: DbExecutor = prisma,
): Promise<CancelSubscriptionOutcome> {
  const invalid = validateCancelSubscriptionInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // AUTHZ — `can_manage_billing` (Owner). Resolved by the composition (fail-closed defense-in-depth here).
  if (ctx.canManageBilling !== true) {
    return err(
      "AUTHORIZATION",
      FORBIDDEN,
      "can_manage_billing is required to cancel a subscription.",
    );
  }

  // SCOPE / REFERENCE — the subscription must resolve within the actor's Controlling Org. Absent OR
  // cross-org alike collapse to NOT_FOUND (§3.5 non-disclosure — never confirm existence to a non-owner).
  const sub = await loadSubscriptionScoped(input.subscriptionId, ctx.activeOrgId, db);
  if (sub === null) {
    return err("NOT_FOUND", NOT_FOUND, "No such subscription for this organization.");
  }

  // STATE — cancel applies ONLY to an `active` subscription (pending_payment / expired → illegal from-state).
  if (sub.state !== "active") {
    return err("STATE", NOT_ACTIVE, "Only an active subscription can be cancelled.");
  }

  // IDEMPOTENT — already cancelled (auto_renew=false, still active): return current status, no side effect.
  if (sub.autoRenew === false) {
    return { ok: true, result: { subscriptionId: sub.id, status: "active" } };
  }

  // CAS — set auto_renew=false only while STILL active ∧ auto_renew=true. count===0 ⇒ a lost race
  // (the row left `active`, or a concurrent cancel won) → CONFLICT (expected_status mismatch — §HB-2.2).
  const affected = await cancelSubscriptionCas(sub.id, ctx.activeOrgId, ctx.userId, db);
  if (affected === 0) {
    return err("CONFLICT", LOST_RACE, "The subscription changed concurrently; re-read and retry.");
  }

  // subscription_events lifecycle log (cancel) — append-only.
  await appendSubscriptionEvent(
    { subscriptionId: sub.id, eventType: "cancel", actorUserId: ctx.userId },
    db,
  );

  // AUDIT — user-attributed; §9 Financial "subscription cancel" (ENUMERATED — no [ESC-BILL-AUDIT]);
  // organization_id = the Controlling Org (the tenant audit-context leg).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: SUBSCRIPTION_ENTITY_TYPE,
      entityId: sub.id,
      action: SubscriptionAuditAction.CANCELLED,
      oldValue: { auto_renew: true },
      newValue: { auto_renew: false, status: "active" },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { subscriptionId: sub.id, status: "active" } };
}
