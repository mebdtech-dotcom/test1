// App-layer REQUEST-TRANSACTION wrapper (REPOSITORY_STRUCTURE §5 `src/server/context`). This is the
// mechanism that makes the org-anchor RLS actually ENFORCE per request: it opens ONE Prisma transaction,
// sets the three server-set GUCs TRANSACTION-LOCAL (Doc-6C §2.1), then runs the supplied work UNDER RLS.
//
// The GUCs (Doc-6C §2.1 / §6.2a) are the contract every `identity` RLS policy reads:
//   - app.user_id          — the resolved principal (platform-owned `users` self-scope)
//   - app.active_org        — the server-RESOLVED active organization (the tenant anchor; never client input)
//   - app.is_platform_staff — the staff backstop leg (FALSE for normal requests — never client-inferred)
//
// TRANSACTION-LOCAL ONLY: every GUC is set with `set_config(name, value, true)` (the `is_local = true`
// third argument). The value is scoped to THIS transaction and is discarded at commit/rollback — it never
// leaks to the next request on a pooled/reused connection (no privilege/context bleed). NEVER session-global.
//
// The active org passed in MUST come from `resolveActiveOrg` (a confirmed active membership), NEVER from a
// client-supplied org id (Invariant #5; CHK-5A-061). This wrapper does not itself resolve — it carries the
// already-server-validated context into the RLS-scoped transaction.
//
// BOUNDARY: `set_config` via the tx executor is app-layer infrastructure (the RLS GUC seam), NOT a
// cross-module table access and NOT cross-schema raw SQL against another module's tables (it touches no
// table at all). This is the explicitly-permitted app-layer mechanism (Doc-6C §2.1 "set by the app-layer
// org-context guard (src/server/)").

import { prisma, type Prisma } from "@/shared/db";
import type { AuthSession } from "@/server/auth/provisioning";
import { resolveActiveOrg, type ActiveOrgContext } from "./active-org";

/** The transaction client handed to the work function — fully RLS-scoped by the GUCs set above. */
export type ActiveOrgTx = Prisma.TransactionClient;

/**
 * Run `fn` inside ONE transaction whose RLS GUCs are pinned to `context`. The three GUCs are set
 * transaction-local before `fn` executes; `fn` therefore runs under per-request tenant isolation.
 *
 * Use this overload when the active-org context is already resolved (e.g. resolved once per request).
 *
 * @param context the SERVER-RESOLVED active-org context (from `resolveActiveOrg` — never client input).
 * @param fn      the RLS-scoped work; receives the transaction client.
 */
export async function withActiveOrgContext<T>(
  context: ActiveOrgContext,
  fn: (tx: ActiveOrgTx) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Set the three server-set GUCs TRANSACTION-LOCAL (Doc-6C §2.1 / §6.2a). Parameterized via
    // $executeRaw (never string-interpolated) — the values are UUIDs/booleans, bound as params.
    await tx.$executeRaw`SELECT set_config('app.user_id', ${context.userId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.active_org', ${context.activeOrgId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', ${context.isPlatformStaff ? "true" : "false"}::text, true)`;

    // From here on, `tx` is RLS-scoped to `app.active_org` / `app.user_id` (Doc-6C §6.2a). WP-1.5 reads
    // run INSIDE this callback.
    return fn(tx);
  });
}

/**
 * Resolve the active org for `session` (server-validated, from a confirmed active membership) and, when
 * resolved, run `fn` inside the RLS-scoped transaction. FAIL-CLOSED: if no active org resolves (no user /
 * no active membership), `fn` is NEVER invoked and the result is `{ resolved: false }` — the caller maps
 * that to deny/empty, never all-orgs, never a leaking error.
 *
 * This is the primary request-composition entry point: one call resolves context AND enforces it.
 *
 * @param session the authenticated Supabase subject (authentication only).
 * @param fn      the RLS-scoped work; receives the transaction client + the resolved context.
 */
export async function withActiveOrg<T>(
  session: AuthSession,
  fn: (tx: ActiveOrgTx, context: ActiveOrgContext) => Promise<T>,
): Promise<
  { resolved: true; value: T } | { resolved: false; reason: "no-user" | "no-active-membership" }
> {
  const resolution = await resolveActiveOrg(session);
  if (!resolution.resolved) {
    // FAIL-CLOSED: never open a transaction without a validated active org.
    return { resolved: false, reason: resolution.reason };
  }

  const value = await withActiveOrgContext(resolution.context, (tx) => fn(tx, resolution.context));
  return { resolved: true, value };
}
