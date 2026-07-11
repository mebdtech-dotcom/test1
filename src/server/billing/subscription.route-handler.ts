// App-layer COMPOSITION for BC-BILL-2 (W3-BILL-4; Doc-5I §5 — `POST /billing/subscriptions` · 201,
// `GET /billing/subscriptions/current` · 200). ORG-SCOPED (Users Act, Orgs Own) — the `upsert_buyer_profile`
// precedent: resolve session → provision → run inside `withActiveOrg` (RLS-scoped tenant tx). The purchase
// authorizes `can_manage_billing` via `hasPermission` (M1 `check_permission`) ON the tenant tx, injects the
// M0 `appendAuditRecord` + `writeOutboxEvent` concretes (the boundary-legal wiring), and emits
// `SubscriptionPurchased` atomically. No client org id (Invariant #5).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { hasPermission } from "@/server/authz";
import { appendAuditRecord, writeOutboxEvent } from "@/modules/core/contracts";
import {
  catalogWriteForbidden,
  catalogWriteInvalidInput,
  getSubscription,
  mapGetSubscription,
  mapPurchaseSubscription,
  purchaseSubscription,
  validatePurchaseSubscriptionInput,
  SUBSCRIPTION_FORBIDDEN,
  SUBSCRIPTION_INVALID_INPUT,
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

/** The Doc-2 §7 slug `purchase_subscription` authorizes (Owner) — bound by pointer, never a role name. */
const CAN_MANAGE_BILLING = "can_manage_billing";

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
    return catalogWriteForbidden(SUBSCRIPTION_FORBIDDEN);
  }
  return mapPurchaseSubscription(ran.value);
}

/**
 * `GET /billing/subscriptions/current` — `billing.get_subscription.v1`. `200` (§5.6) · `401` · `404`
 * (the org has no subscription, or no active-org context resolves).
 */
export async function handleGetSubscription(
  deps: SubscriptionHandlerDeps,
): Promise<WireResponse<SubscriptionView>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, (tx, context) =>
    getSubscription(context.activeOrgId, tx),
  );
  if (!ran.resolved) {
    return mapGetSubscription({ found: false });
  }
  return mapGetSubscription(ran.value);
}
