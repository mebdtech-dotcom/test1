// App-layer PLATFORM-STAFF context resolution (REPOSITORY_STRUCTURE §5 `src/server/context`) —
// W2-IDN-6.1.
//
// Doc-5C §3.2 (actor-type determination): "Admin vs User is distinguished by the SERVER from the
// platform-role basis … never by the wire." The Admin governance surface (Doc-5C §4.1 row 4
// `set_user_account_status`, later rows 10–11) carries NO org context; its authority derives solely
// from `staff_*` + declared admin scope (DC-3).
//
// DC-3 CARRIED — FAIL-CLOSED PRODUCTION DEFAULT: the `staff_*` slug space is seeded (Doc-2 §7 /
// W2-IDN-2), but the corpus realizes NO staff-principal roster in Wave 2 — there is no frozen table
// binding a person to a staff slug (the DC-3 interim; same posture as `resolveActiveOrg`'s
// hard-false `isPlatformStaff`). The production resolver below therefore resolves NO staff
// principal, EVER — every caller falls to the non-staff deny leg (which is delegated to
// `identity.check_permission`, whose staff-space firewall denies `staff_*` through org roles —
// RV-0147 B8). The resolver is an INJECTABLE PORT (the `VendorProfileStateReader` precedent): the
// real staff channel lands via the DC-3 resolution + a future additive, replacing ONLY this
// default; tests inject a staff context to exercise the allow leg. NEVER client-inferred; no
// header/body field can assert staffness (Doc-4A §9.7).

import { prisma, type Prisma } from "@/shared/db";
import type { AuthSession } from "@/server/auth/provisioning";

/** A SERVER-DERIVED platform-staff principal (Doc-5C §3.2). Never constructed from client input. */
export interface StaffContext {
  /** The staff principal's `identity.users` id (audit attribution — Doc-2 §9 `actor_id`). */
  userId: string;
  /** Always `true` — the type only exists for a resolved staff principal. */
  isPlatformStaff: true;
}

/** The injectable staff-principal resolution port (the composition edge supplies it; tests may
 *  inject a stand-in). `null` = not a staff principal (fail-closed). */
export type ResolveStaffContext = (session: AuthSession) => Promise<StaffContext | null>;

/**
 * The PRODUCTION staff-principal resolver — DC-3 interim, FAIL-CLOSED: no staff roster exists in
 * Wave 2, so no principal ever resolves as platform staff. The Admin wire surface is therefore
 * live-but-unreachable until the DC-3 staff channel lands (deliberate: fail-closed beats a coined
 * staff roster). The session is intentionally not consulted — there is nothing to resolve against.
 */
export const resolveStaffContext: ResolveStaffContext = async () => null;

/** The transaction client handed to staff-context work — `app.is_platform_staff = true` pinned; no org. */
export type StaffTx = Prisma.TransactionClient;

/**
 * Run `fn` inside ONE transaction whose RLS context is a PLATFORM-STAFF principal: `app.user_id` pinned
 * to `userId` (audit attribution), `app.is_platform_staff` pinned `true` (the staff RLS backstop leg),
 * and `app.active_org` deliberately UNSET (Admin governance carries no org context — Doc-4A §5.6 / Doc-5C
 * §4.5). GUCs are transaction-local (`set_config(.,.,true)`) — never session-global (no context bleed on
 * pooled connections). Used by the M6 support-ticket Admin (Support Staff) leg (Doc-5H §7.3): the staff
 * RLS leg admits every ticket in scope, and the audit `WITH CHECK` staff leg admits the Admin-attributed
 * (`actor_type = 'admin'`) audit row. The `userId` MUST be a SERVER-RESOLVED staff principal (from
 * `resolveStaffContext` — never client input).
 *
 * @param userId the SERVER-RESOLVED platform-staff principal (audit attribution).
 * @param fn     the staff-scoped work; receives the transaction client.
 */
export async function withStaffContext<T>(
  userId: string,
  fn: (tx: StaffTx) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.user_id', ${userId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true'::text, true)`;
    return fn(tx);
  });
}
