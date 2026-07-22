// App-layer COMPOSITION for BC-BILL-3 `billing.get_usage.v1` (Doc-5I §6.2 — `GET /billing/usage` · 200).
// ORG-SELF read (Own-Org, User-only — Doc-5I §3.6): resolve session → provision → run inside `withActiveOrg`
// (RLS-scoped tenant tx), authorize `can_view_billing` via `hasPermission` (M1 `check_permission`) ON the
// tenant tx. Org = server-validated active org — NO caller `org_id` (Doc-5I §6.2 / Invariant #5).
//
// `enforce_quota` (§HB-3.2) is OUT-OF-WIRE (Doc-5I §10) — no composition here; consumers reach it via
// `@/modules/billing/contracts`.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { hasPermission } from "@/server/authz";
import {
  getUsage,
  mapGetUsage,
  usageViewForbidden,
  type GetUsageRequest,
  type GetUsageResult,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the usage composition. All injectable (defaults bind production wiring). */
export interface UsageHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/** The Doc-2 §7 slug `get_usage` authorizes (Owner, Delegate) — bound by pointer, never a role name. */
const CAN_VIEW_BILLING = "can_view_billing";

/**
 * `GET /billing/usage` — `billing.get_usage.v1`. `200` (§6.2 list + totals) · `401` · `400` (SYNTAX:
 * undeclared filter / malformed period/cursor / page_size) · `403` (no active org / `can_view_billing`
 * denied) · `422` BUSINESS (future period).
 */
export async function handleGetUsage(
  request: GetUsageRequest,
  deps: UsageHandlerDeps,
): Promise<WireResponse<GetUsageResult>> {
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
    return { denied: false as const, outcome: await getUsage(request, context.activeOrgId, tx) };
  });

  // No active-org context (fail-closed) → 403 (Doc-4I §HB-3.3 Stage-2 CONTEXT; org-self read, no NOT_FOUND).
  if (!ran.resolved) {
    return usageViewForbidden();
  }
  if (ran.value.denied) {
    return usageViewForbidden();
  }
  return mapGetUsage(ran.value.outcome);
}
