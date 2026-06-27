// App-layer auth wiring (REPOSITORY_STRUCTURE §5) — first-login identity provisioning hook.
//
// `ensureProvisioned(session, deps)` is the request/auth-layer entry point that guarantees an
// authenticated Supabase user has an `identity.users` record + a default Personal Organization +
// the founding Owner membership (Invariant #5; Architecture §5.2 Solo-Trader Rule). Provisioning is
// OUT-OF-BAND (Doc-7E §2 / [ESC-7-API-SIGNUP]): no `create_user` wire contract is coined.
//
// BOUNDARY (REPOSITORY_STRUCTURE §3/§9): `src/server/` imports another module ONLY through its
// `contracts/`. This file calls the M1 `provisionIdentity` contract via `@/modules/identity/contracts`
// (boundary-legal) — the authoritative atomic/idempotent provisioning lives behind that contract, in
// M1's private command. The Module 0 `core.allocate_human_reference.v1` service flows through contracts
// too: WP-1.4 closes the WP-1.3 deferred MINOR by binding the CONCRETE M0 facade
// (`@/modules/core/contracts` now exports the concrete `allocateHumanReference`, not just its TYPE) as
// the DEFAULT dependency here — so provisioning is fully concrete end-to-end at the composition edge,
// still strictly contracts/-only (never a cross-module value imported from an internal layer). A caller
// may still inject a stand-in (tests). This file owns the AUTHENTICATION→provisioning seam only —
// authorization (active-org context, check_permission, guards) is NOT here (Doc-7C §3.3).

import {
  allocateHumanReference as coreAllocateHumanReference,
  type AllocateHumanReference,
} from "@/modules/core/contracts";
import { provisionIdentity, type ProvisionIdentityResult } from "@/modules/identity/contracts";

/**
 * The authenticated subject handed to provisioning — distilled from a Supabase Auth session
 * (authentication only — Doc-7C §3.1). Carries the auth-boundary linkage + email, never a secret.
 */
export interface AuthSession {
  /** The Supabase `auth.users` id (the identity linkage — Doc-6C §3.1 / DC-4). */
  authUserId: string;
  /** The subject's email (auth-managed identifier). */
  email?: string | null;
}

/** Dependencies for provisioning. Optional — defaults bind the CONCRETE M0 contract facade (WP-1.4). */
export interface EnsureProvisionedDeps {
  /**
   * The Module 0 `core.allocate_human_reference.v1` contract service (Doc-4B §A7), passed straight
   * into the M1 `provisionIdentity` contract. Defaults to the concrete M0 facade from
   * `@/modules/core/contracts` (the composition wire is now fully concrete end-to-end); a caller may
   * override it (e.g. a test stand-in). Always consumed via contracts — never a cross-module internal value.
   */
  allocateHumanReference: AllocateHumanReference;
}

/** The fully-concrete default deps — the M0 contract facade bound at the composition edge (WP-1.4). */
const defaultDeps: EnsureProvisionedDeps = {
  allocateHumanReference: coreAllocateHumanReference,
};

/**
 * Ensure the authenticated user is provisioned (idempotent + atomic — the guarantees live behind the
 * M1 contract). Safe to call on every first-touch authenticated request: a second/concurrent call
 * creates nothing.
 *
 * @param session the authenticated Supabase subject (authentication established upstream).
 * @param deps    Module 0 `allocateHumanReference` service; defaults to the concrete M0 contract facade.
 */
export async function ensureProvisioned(
  session: AuthSession,
  deps: EnsureProvisionedDeps = defaultDeps,
): Promise<ProvisionIdentityResult> {
  return provisionIdentity(
    { authUserId: session.authUserId, email: session.email ?? null },
    { allocateHumanReference: deps.allocateHumanReference },
  );
}

export type { ProvisionIdentityResult };
