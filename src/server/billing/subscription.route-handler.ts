// App-layer COMPOSITION for BC-BILL-2 (Doc-5I §5). ORG-SCOPED (Users Act, Orgs Own) — the
// `upsert_buyer_profile` precedent: resolve session → provision → run inside `withActiveOrg` (RLS-scoped
// tenant tx). The commands (`purchase`, `cancel`) authorize `can_manage_billing`; the reads
// (`get_subscription`, `list_subscription_events`) authorize `can_view_billing` — both via `hasPermission`
// (M1 `check_permission`) ON the tenant tx (Doc-4I §HB-2.x; Doc-5I §5.3 is User-only — no Admin actor). No
// client org id (Invariant #5).
//
//   - purchase → 201 + Location + `SubscriptionPurchased` (W3-BILL-4).
//   - cancel   → 200 (auto_renew=false; status stays active); no §8 event (W3-BILL-5).
//   - get      → 200 / 404; list_subscription_events → 200 / 404 (W3-BILL-4 read + W3-BILL-5 events read).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { hasPermission } from "@/server/authz";
import { appendAuditRecord, writeOutboxEvent } from "@/modules/core/contracts";
import {
  cancelSubscription,
  catalogWriteInvalidInput,
  getSubscription,
  listSubscriptionEvents,
  mapCancelSubscription,
  mapGetSubscription,
  mapListSubscriptionEvents,
  mapPurchaseSubscription,
  purchaseSubscription,
  subscriptionForbidden,
  validateCancelSubscriptionInput,
  validatePurchaseSubscriptionInput,
  SUBSCRIPTION_FORBIDDEN,
  SUBSCRIPTION_INVALID_INPUT,
  SUBSCRIPTION_VIEW_FORBIDDEN,
  type CancelSubscriptionInput,
  type CancelSubscriptionResult,
  type ListSubscriptionEventsRequest,
  type ListSubscriptionEventsResult,
  type PurchaseSubscriptionInput,
  type PurchaseSubscriptionResult,
  type SubscriptionView,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the subscription compositions. All injectable (defaults bind production wiring). */
export interface SubscriptionHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** The Doc-2 §7 slugs these surfaces authorize — bound by pointer, never a role name. */
const CAN_MANAGE_BILLING = "can_manage_billing"; // Owner — the subscription COMMANDS.
const CAN_VIEW_BILLING = "can_view_billing"; // Owner, Delegate — the subscription READS.

/**
 * `POST /billing/subscriptions` — `billing.purchase_subscription.v1`. `201` (§5.6 + Location) · `401`
 * (unauthenticated) · `400` (SYNTAX) · `403` (no active org / `can_manage_billing` denied) · `409` STATE
 * (one-active) · `422` REFERENCE (plan not active).
 */
export async function handlePurchaseSubscription(
  input: PurchaseSubscriptionInput,
  deps: SubscriptionHandlerDeps,
): Promise<WireResponse<PurchaseSubscriptionResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX FIRST (§11.2 order) — 400 for every caller, before the org/permission gate.
  const syntaxFailure = validatePurchaseSubscriptionInput(input);
  if (syntaxFailure !== null) {
    return catalogWriteInvalidInput(SUBSCRIPTION_INVALID_INPUT, syntaxFailure);
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    // AUTHZ resolution — `can_manage_billing` via M1 check_permission ON the tenant tx (the command enforces).
    const canManageBilling = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_MANAGE_BILLING,
      },
      undefined,
      tx,
    );
    return purchaseSubscription(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        canManageBilling,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord, writeOutboxEvent },
      tx,
    );
  });

  // No active-org context (fail-closed) → 403: there is no org to subscribe (never all-orgs, never a leak).
  if (!ran.resolved) {
    return subscriptionForbidden(
      SUBSCRIPTION_FORBIDDEN,
      "An active organization context and can_manage_billing are required.",
    );
  }
  return mapPurchaseSubscription(ran.value);
}

/**
 * `POST /billing/subscriptions/{subscription_id}/cancel-subscription` — `billing.cancel_subscription.v1`.
 * `200` (§5.6; status stays `active`, `auto_renew=false`) · `401` · `400` (SYNTAX) · `403` (no active org /
 * `can_manage_billing` denied) · `404` (absent/cross-org) · `409` STATE (not active) / CONFLICT (lost race).
 */
export async function handleCancelSubscription(
  input: CancelSubscriptionInput,
  deps: SubscriptionHandlerDeps,
): Promise<WireResponse<CancelSubscriptionResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX FIRST (§11.2 order) — 400 before the org/permission gate.
  const syntaxFailure = validateCancelSubscriptionInput(input);
  if (syntaxFailure !== null) {
    return catalogWriteInvalidInput(SUBSCRIPTION_INVALID_INPUT, syntaxFailure);
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canManageBilling = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_MANAGE_BILLING,
      },
      undefined,
      tx,
    );
    return cancelSubscription(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        canManageBilling,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
  });

  if (!ran.resolved) {
    return subscriptionForbidden(
      SUBSCRIPTION_FORBIDDEN,
      "An active organization context and can_manage_billing are required.",
    );
  }
  return mapCancelSubscription(ran.value);
}

/**
 * `GET /billing/subscriptions/current` — `billing.get_subscription.v1`. `200` (§5.6) · `401` · `403`
 * (`can_view_billing` denied) · `404` (the org has no subscription, or no active-org context resolves).
 */
export async function handleGetSubscription(
  deps: SubscriptionHandlerDeps,
): Promise<WireResponse<SubscriptionView>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    // AUTHZ — `can_view_billing` (Owner, Delegate) via M1 check_permission ON the tenant tx (Doc-4I §HB-2.5).
    const canView = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_VIEW_BILLING,
      },
      undefined,
      tx,
    );
    if (!canView) return { denied: true as const };
    return { denied: false as const, result: await getSubscription(context.activeOrgId, tx) };
  });

  if (!ran.resolved) {
    return mapGetSubscription({ found: false });
  }
  if (ran.value.denied) {
    return subscriptionForbidden(
      SUBSCRIPTION_VIEW_FORBIDDEN,
      "can_view_billing is required to read subscription details.",
    );
  }
  return mapGetSubscription(ran.value.result);
}

/**
 * `GET /billing/subscriptions/{subscription_id}/events` — `billing.list_subscription_events.v1`. `200`
 * (§5.6 list envelope) · `401` · `400` (SYNTAX) · `403` (`can_view_billing` denied) · `404` (the parent
 * subscription is absent/cross-org, or no active-org context resolves).
 */
export async function handleListSubscriptionEvents(
  request: ListSubscriptionEventsRequest,
  deps: SubscriptionHandlerDeps,
): Promise<WireResponse<ListSubscriptionEventsResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canView = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_VIEW_BILLING,
      },
      undefined,
      tx,
    );
    if (!canView) return { denied: true as const };
    return {
      denied: false as const,
      outcome: await listSubscriptionEvents(request, context.activeOrgId, tx),
    };
  });

  // No active-org context (fail-closed) → 404: no org means no subscription to enumerate (never a leak).
  if (!ran.resolved) {
    return mapListSubscriptionEvents({ ok: false, errorClass: "NOT_FOUND" });
  }
  if (ran.value.denied) {
    return subscriptionForbidden(
      SUBSCRIPTION_VIEW_FORBIDDEN,
      "can_view_billing is required to read subscription events.",
    );
  }
  return mapListSubscriptionEvents(ran.value.outcome);
}
