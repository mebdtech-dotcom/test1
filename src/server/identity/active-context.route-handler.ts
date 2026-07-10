// App-layer COMPOSITION for `identity.get_active_context.v1` (W2-IDN-6.6; Doc-5C §6.1 row 30 —
// `GET /identity/active_context` · `200`). Resolves the caller's CURRENT active context — SELF only.
//
// Composition: session → 401 · provision · `withActiveOrg` (MEMBERSHIP-ONLY context resolution, Doc-5C
// §3.3 — it does NOT gate org_status, so a suspended org CAN resolve here; `!resolved` = no active
// membership → the `404` no-context collapse) → query → wire map. Reads carry no Idempotency-Key (§B.6:
// queries are `not-applicable`) and are unaudited (§17.1). Org-not-suspended is enforced ONLY at the
// `switch` (§C8 BUSINESS), never in this resolver — the open `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` residual.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import {
  getActiveContext,
  mapGetActiveContext,
  type ActiveContextView,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

export interface GetActiveContextHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/**
 * The HTTP face for `GET /identity/active_context`. Returns `200` (§5.6 envelope — the frozen §C8
 * projection: org id + membership {state, role_id} + effective_permission_summary) · `401` auth-boundary ·
 * `404` collapse (no ACTIVE MEMBERSHIP / no active context — Doc-5C §3.3; NOT an org_status check: a
 * suspended org whose membership is active still resolves — the `switch` is the org-not-suspended gate).
 */
export async function handleGetActiveContext(
  deps: GetActiveContextHandlerDeps,
): Promise<WireResponse<ActiveContextView>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, (tx, context) =>
    getActiveContext({ userId: context.userId, activeOrgId: context.activeOrgId }, tx),
  );
  return mapGetActiveContext(ran.resolved ? ran.value : null);
}
