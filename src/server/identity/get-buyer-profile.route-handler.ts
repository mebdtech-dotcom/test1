// App-layer COMPOSITION for the active-org buyer-profile read (REPOSITORY_STRUCTURE §5/§8 —
// `src/server` is the composition edge that wires Supabase Auth ↔ active-org context ↔ module
// contracts). This file owns the SINGLE composed CORE and TWO thin faces over it:
//
//   1. `loadActiveOrgBuyerProfileOutcome(deps)` — the shared CORE. Composes the merged WP-1.3
//      (auth + lazy provision) and WP-1.4 (active-org context guard) pieces with the M1
//      `identity.get_buyer_profile.v1` contract, returning a transport-agnostic DATA outcome
//      (authenticated? + `BuyerProfileView | null`). No HTTP, no envelope.
//   2. `handleGetBuyerProfile(deps)` — the HTTP face (WP-1.5). Maps the core outcome to the M1 wire
//      (`WireResponse`): present → `200`; absent / cross-tenant / no-context → `404` (non-disclosure);
//      unauthenticated → the DC-4 auth-boundary `401`. Consumed by the thin Next.js route.
//   3. `loadActiveOrgBuyerProfile(deps)` — the DATA face (WP-1.6). Returns the `BuyerProfileView | null`
//      DATA (plus an `authenticated` flag) for SERVER-RENDERED consumers (the Doc-7E `(app)/account`
//      page reads via this, not a client self-fetch of its own HTTP API — Doc-7C server-side data layer).
//
// BOTH faces consume the SAME core (no logic duplication): the route (WP-1.5) and the account page
// (WP-1.6) share one composition, one non-disclosure collapse, one active-org enforcement.
//
// Composition (Doc-5C §6.1/§6.3 realized via Doc-5A §5.6/§6.1/§6.2/§6.6):
//   1. Resolve the Supabase session (injectable — `src/server/auth`). Unauthenticated → the HTTP face
//      returns `401` (the DC-4 AUTH-BOUNDARY response — pre-contract, NOT a Doc-5A contract error);
//      the DATA face returns `{ authenticated: false, profile: null }`.
//   2. `ensureProvisioned(session)` — lazy first-login identity materialization (WP-1.3).
//   3. `withActiveOrg(session, (tx) => getBuyerProfile(tx))` — run the M1 read INSIDE the active-org
//      context transaction so RLS scopes it to `app.active_org` (WP-1.4). NO client-supplied org filter.
//   4. Collapse the outcome: present → the profile DTO; absent / cross-tenant / no-context → `null`
//      (non-disclosure, indistinguishable — Doc-5C §6.3 / Doc-5A §6.6).
//
// BOUNDARY: imports `src/server/*` + `@/modules/identity/contracts` + `@/shared/http` only. No module
// internals, no cross-schema SQL (the RLS GUC seam lives in `withActiveOrg`).
//
// AUTH-BOUNDARY 401 (DC-4 / pre-contract): authentication is INFRASTRUCTURE (Doc-5C §3.1 — "the wire
// carries `Authorization` only; the auth mechanism is infrastructure"). An UNAUTHENTICATED request never
// reaches a Doc-5A contract, so it is NOT dressed in a Doc-5A contract `error_class` — the Doc-5A closed
// class set is contract-level / post-auth and has no authentication/401 class by design. The 401 is the
// transport-level auth-boundary response (`authChallengeResponse()` — top-level `reference_id` only, no
// `error`). See `governanceReviews/ESC-W1-AUTH-401_v1.0.md`. [Board ruling: realize-never-redecide;
// Doc-5A unamended; 403 NOT used — that would conflate "no credential" with an authorization denial.]

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import {
  getBuyerProfile,
  mapGetBuyerProfile,
  type BuyerProfileView,
  type GetBuyerProfileResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/**
 * Resolve the authenticated Supabase subject for this request, or `null` when unauthenticated.
 * INJECTABLE: the live cookie-bound resolution (build-local-park-deploy) is the default; tests pass a
 * test-scoped seeded session resolver so the handler runs against a real provisioned user without a
 * live Supabase round-trip.
 */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the buyer-profile composition core. All injectable (defaults bind production wiring). */
export interface GetBuyerProfileHandlerDeps {
  /** Resolve the authenticated subject (default: the live Supabase cookie session — see route entry). */
  resolveSession: ResolveSession;
  /** Lazy first-login provisioning (default: the concrete WP-1.3 hook). */
  ensureProvisioned: typeof ensureProvisioned;
}

/**
 * The transport-agnostic DATA outcome of the active-org buyer-profile read (the DATA face shape).
 *
 * - `authenticated: false` — no session (pre-contract; the HTTP face maps this to the DC-4 `401`, the
 *   DATA face to a login affordance). `profile` is always `null` here.
 * - `authenticated: true` + `profile: BuyerProfileView` — the active org HAS a buyer profile.
 * - `authenticated: true` + `profile: null` — absent / cross-tenant / no-active-org context, COLLAPSED
 *   to the SAME `null` (non-disclosure — Doc-5C §6.3; absence is indistinguishable from a cross-tenant
 *   target). Callers must render absent and cross-tenant IDENTICALLY (no existence leak).
 */
export type ActiveOrgBuyerProfileOutcome =
  | { authenticated: false; profile: null }
  | { authenticated: true; profile: BuyerProfileView | null };

/**
 * The NORMALIZED core outcome (shared by both faces): the `authenticated` flag + the in-process M1 read
 * result, where "no active-org context" (fail-closed) is collapsed to `null` exactly as the WP-1.5 wire
 * mapper expects (`GetBuyerProfileResult | null`). Kept internal so the wire face passes the read result
 * straight to `mapGetBuyerProfile` (preserving WP-1.5 behavior) and the DATA face extracts the DTO.
 */
type CoreOutcome =
  | { authenticated: false; read: null }
  | { authenticated: true; read: GetBuyerProfileResult | null };

/**
 * The composed CORE — resolves the active-org buyer-profile read (no HTTP). Both the HTTP route face
 * (`handleGetBuyerProfile`) and the server-rendered DATA face (`loadActiveOrgBuyerProfile`) consume this
 * so the composition, the active-org enforcement, and the non-disclosure collapse live in ONE place.
 */
async function resolveActiveOrgBuyerProfileRead(
  deps: GetBuyerProfileHandlerDeps,
): Promise<CoreOutcome> {
  // (1) Authentication (only) — Doc-5C §3.1. No session ⇒ pre-contract (no active-org).
  const session = await deps.resolveSession();
  if (session === null) {
    return { authenticated: false, read: null };
  }

  // (2) Lazy first-login provisioning (WP-1.3) — idempotent + atomic behind the M1 contract.
  await deps.ensureProvisioned(session);

  // (3) Run the M1 read INSIDE the server-validated active-org context (WP-1.4). RLS scopes it to
  //     `app.active_org`; no client org filter. Fail-closed: no active org ⇒ `fn` never runs.
  const outcome = await withActiveOrg(session, (tx) => getBuyerProfile(tx));

  // (4) Collapse `resolved:false` (no active-org context) to `null` — the same value the wire mapper
  //     treats as the indistinguishable NOT_FOUND (Doc-5C §6.3 / Doc-5A §6.6). A genuinely-absent
  //     profile is `{ found: false }`; the mapper / DATA face collapse both to the empty render.
  return { authenticated: true, read: outcome.resolved ? outcome.value : null };
}

/**
 * The HTTP face (WP-1.5) for `GET /identity/buyer_profiles`. Returns a transport-agnostic
 * `WireResponse` — `200` with the Doc-5A §5.6 envelope (buyer-profile DTO + `reference_id`), the DC-4
 * auth-boundary `401` when unauthenticated (no contract `error_class`), or `404` (non-disclosure) for
 * absent / cross-tenant / unresolved-context.
 */
export async function handleGetBuyerProfile(
  deps: GetBuyerProfileHandlerDeps,
): Promise<WireResponse<BuyerProfileView>> {
  const core = await resolveActiveOrgBuyerProfileRead(deps);

  // Unauthenticated → the DC-4 auth-boundary 401 (pre-contract; NO Doc-5A `error_class`).
  if (!core.authenticated) {
    return authChallengeResponse();
  }

  // Present → `200` envelope; absent/cross-tenant/no-context (`read` found:false or null) → `404`
  //           (non-disclosure). The mapper owns the §6.2 status — WP-1.5 behavior unchanged.
  return mapGetBuyerProfile(core.read);
}

/**
 * The SERVER-RENDERED DATA face (WP-1.6) for the Doc-7E `(app)/account` page. Returns the
 * `BuyerProfileView | null` DATA (the page reads via this server composition, NOT a client self-fetch
 * of its own HTTP API — Doc-7C server-side wired data layer). The `authenticated` flag lets the page
 * route to the `(auth)` login affordance (Doc-7C) without conflating "no session" with "no profile".
 *
 * Reuses the SAME composition core as the HTTP route (no logic duplication): one active-org enforcement,
 * one non-disclosure collapse (absent and cross-tenant return the SAME `null` — no existence leak).
 */
export async function loadActiveOrgBuyerProfile(
  deps: GetBuyerProfileHandlerDeps,
): Promise<ActiveOrgBuyerProfileOutcome> {
  const core = await resolveActiveOrgBuyerProfileRead(deps);
  if (!core.authenticated) {
    return { authenticated: false, profile: null };
  }
  // Extract the DTO: present → the buyer-profile DTO; `{ found: false }` / no-context (`null`) → `null`
  //                  (the SAME empty render — non-disclosure; absent and cross-tenant are identical).
  const profile = core.read !== null && core.read.found ? core.read.profile : null;
  return { authenticated: true, profile };
}
