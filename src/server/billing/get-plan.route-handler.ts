// App-layer COMPOSITION for `billing.get_plan.v1` (W3-BILL-1; Doc-5I §4 — `GET /billing/plans/{plan_id}`
// · 200). REPOSITORY_STRUCTURE §5/§8: `src/server` wires Supabase Auth ↔ module contracts; the thin
// HTTP entry delegates here. Marketplace precedent: `src/server/marketplace/*.route-handler.ts` (anonymous)
// + `src/server/identity/get-buyer-profile.route-handler.ts` (the session→401 gate).
//
// Composition:
//   1. Resolve the Supabase session (injectable). Unauthenticated → the DC-4 auth-boundary `401`
//      (Doc-5I §3.6 "authentication only" — the ONLY authorization requirement; no billing slug, no org).
//   2. Read the platform-owned catalog via the M7 contract (context-free — the read touches NO
//      user/tenant data, so NO `ensureProvisioned` and NO active-org context is composed; the RLS
//      `plans_public_read` needs no GUC). `getPlan` owns SYNTAX (`plan_id` uuid) → REFERENCE.
//
// UNAUDITED (reads — Doc-5A §17.1). No events. BOUNDARY: imports `src/server/auth` (type) + the M7
// `contracts/` + `@/shared/http` only.

import type { AuthSession } from "@/server/auth";
import {
  getPlan,
  mapGetPlan,
  type GetPlanKey,
  type GetPlanOutcome,
  type PlanView,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable — tests seed one). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the get-plan composition. Injectable (the default binds the live session in the route). */
export interface GetPlanHandlerDeps {
  resolveSession: ResolveSession;
}

/**
 * The HTTP face for `GET /billing/plans/{plan_id}` — `billing.get_plan.v1`. Returns a transport-agnostic
 * `WireResponse`: `200` (§5.6 envelope) · `401` auth-boundary (unauthenticated) · `400` (malformed
 * `plan_id`) · `404` (absent/retired — platform-owned catalog, non-disclosure N/A).
 */
export async function handleGetPlan(
  key: GetPlanKey,
  deps: GetPlanHandlerDeps,
): Promise<WireResponse<PlanView>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  const outcome: GetPlanOutcome = await getPlan(key);
  return mapGetPlan(outcome);
}
