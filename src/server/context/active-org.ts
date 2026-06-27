// App-layer ACTIVE-ORG CONTEXT guard (REPOSITORY_STRUCTURE §5 `src/server/context` — "server-validated
// active-org context, client org ID never trusted"). This is the realization of the load-bearing
// tenancy mechanism: the server resolves the active organization from a CONFIRMED ACTIVE MEMBERSHIP —
// NEVER from request/client input (Invariant #5 "Users act; Organizations own"; Doc-5C §3.3 + CHK-5A-061
// "Iv-Active-Organization server-validated, never client-trusted"; Doc-6C §2.1 "after the guard queries
// identity.memberships and confirms an active membership before setting the GUC").
//
// FAIL-CLOSED (Doc-6C §2.1 RLS-2 / §2.5): no user / no active membership ⇒ NO active org. We surface that
// as a non-throwing "no context" result (the GUCs simply go unset → `current_setting(..., true)` is NULL →
// every tenant RLS predicate is false → zero rows). The absence of context is never an error that could
// leak existence, and it is never the all-orgs fallback.
//
// BOUNDARY: this guard reads ONLY M1's OWN data... but `src/server` MUST NOT touch another module's
// internals or schema (REPOSITORY_STRUCTURE §9 — no cross-module table reads, no cross-schema SQL). The
// membership/user resolution therefore runs over the shared Prisma client against M1's tables here ONLY
// because `src/server` is the app-layer composition edge that already wires Supabase Auth ↔ identity; the
// authoritative resolution semantics (active-membership requirement) are M1's (Doc-4C §C8). [ESC-W1-CONTEXT-RESOLVE]
// flags that a dedicated `identity.resolveActiveContext` CONTRACT service is the long-term home for this
// read (Doc-5C §C8 `get_active_context` is the wire face; its out-of-wire in-process form is not yet
// coined as an M1 contract). Until that contract lands, the resolution lives at the app edge against M1's
// own tables via the shared client — boundary-legal as an app-layer read of the tenant directory, NOT a
// cross-module table access from a *different* module. No M1 business rule is re-derived here beyond the
// frozen "active membership ⇒ active org" predicate (Doc-6C §2.1).

import { prisma, type DbExecutor } from "@/shared/db";
import type { AuthSession } from "@/server/auth/provisioning";

/**
 * The server-resolved active-organization context for an authenticated principal. Produced ONLY from a
 * confirmed active membership; never from client input.
 */
export interface ActiveOrgContext {
  /** The resolved `identity.users` id (UUIDv7) — looked up from the session's `auth_user_id`. */
  userId: string;
  /** The resolved active organization id (UUIDv7) — the tenant anchor for this request. */
  activeOrgId: string;
  /**
   * Platform-staff flag for this principal. False for normal requests (Doc-6C §2.1 — `app.is_platform_staff`
   * gates platform-owned reads; never inferred from client input). Wave-1 personal-org users are never
   * platform staff; the flag is carried for the GUC seam and is hard-false here.
   */
  isPlatformStaff: false;
}

/**
 * Outcome of active-org resolution. `resolved: false` is the FAIL-CLOSED outcome (no user, or no active
 * membership) — NOT an error, NOT all-orgs. The caller MUST treat it as "no tenant context" (deny / empty).
 */
export type ResolveActiveOrgResult =
  | { resolved: true; context: ActiveOrgContext }
  | { resolved: false; reason: "no-user" | "no-active-membership" };

/**
 * Resolve the active organization for an authenticated Supabase session.
 *
 * 1. Resolve the user: `identity.users` by `auth_user_id` (the live, non-deleted record).
 * 2. Load the user's CONFIRMED ACTIVE memberships (`state = 'active'`, not soft-deleted).
 * 3. Resolve `active_org` deterministically (see Wave-1 selection rule below).
 *
 * Fail-closed at every step: a missing user or zero active memberships yields `{ resolved: false }`.
 *
 * @param session the authenticated subject (`auth_user_id` from the Supabase session — authentication only).
 * @param db      executor; defaults to the shared client (read-only resolution; no transaction needed).
 */
export async function resolveActiveOrg(
  session: AuthSession,
  db: DbExecutor = prisma,
): Promise<ResolveActiveOrgResult> {
  // (1) Resolve the user from the auth-boundary linkage (Doc-6C §3.1 / DC-4). Live record only.
  const user = await db.user.findFirst({
    where: { authUserId: session.authUserId, deletedAt: null },
    select: { id: true },
  });
  if (user === null) {
    return { resolved: false, reason: "no-user" };
  }

  // (2) Load the user's CONFIRMED ACTIVE memberships (Doc-6C §2.1 — "confirms an active membership").
  //     Deterministic order so the Wave-1 selection (below) is reproducible: oldest active membership
  //     first (joinedAt asc, then id asc as a stable tiebreaker).
  const activeMemberships = await db.membership.findMany({
    where: { userId: user.id, state: "active", deletedAt: null },
    select: { id: true, organizationId: true, joinedAt: true },
    orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
  });

  if (activeMemberships.length === 0) {
    // FAIL-CLOSED: authenticated, but no active membership ⇒ no active org (deny/empty, never all-orgs).
    return { resolved: false, reason: "no-active-membership" };
  }

  // (3) Resolve active_org from a confirmed active membership.
  //
  // Wave-1 selection rule (DOCUMENTED): a Wave-1 user holds exactly ONE membership — the founding Owner
  // membership in their personal org (WP-1.3 provisioning). When >1 active membership exists (a future
  // multi-org user before `switch_active_organization` lands — Doc-5C §C8), pick the DETERMINISTIC
  // DEFAULT: the OLDEST active membership (first in the `joinedAt asc, id asc` order above — the personal
  // org, created at provisioning, is the earliest). This is a default-context selector, not a stored
  // preference; the authoritative active-context state model is M1-owned (Doc-4C §C8 / Doc-5C §3.3), and
  // an explicit `switch_active_organization` (a future wave) overrides this default. The client NEVER
  // supplies the choice (CHK-5A-061).
  const selected = activeMemberships[0]!;

  return {
    resolved: true,
    context: {
      userId: user.id,
      activeOrgId: selected.organizationId,
      isPlatformStaff: false,
    },
  };
}
