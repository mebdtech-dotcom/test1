// App-layer COMPOSITION for `identity.restore_organization.v1` (W2-IDN-6.2; Doc-5C §4.1 row 9 —
// `POST /identity/organizations/{id}/restore_organization` · 200; Actor: User (Owner) OR Admin —
// the frozen DUAL-LEG contract, §C5 PassB:298).
//
// TWO DISCRIMINATED LEGS (the 6.1 admin-composition lineage):
//   • ADMIN leg (first): the server-derived platform-staff basis via the injectable
//     `resolveStaffContext` port (Doc-5C §3.2; DC-3 — the PRODUCTION default resolver is
//     FAIL-CLOSED: no staff roster exists in Wave 2, no principal ever resolves; tests inject).
//     No org context (§5.6).
//   • SELF leg (every non-staff caller): the session subject restores their OWN soft-deleted org.
//     A soft-deleted org has NO resolvable active-org context (its memberships are, by the frozen
//     §5.1 cascade, soft-deleted) — so this composition does NOT use `withActiveOrg`; the command
//     authorizes via the restore-eligible-membership + `can_delete_organization` slug resolution
//     over M1's own substrate (documented in the command header). A non-member caller collapses to
//     the byte-identical §6.6 404 inside the command — no org fact is disclosed.
//
// TRANSACTION & RLS CONTEXT (the frozen Doc-6C §6.2a mechanism — the `deactivate_own_account`
// precedent): ONE composition-owned transaction with `app.user_id` = the acting principal and
// `app.is_platform_staff = 'true'` TRANSACTION-LOCAL — required because no tenant context can
// exist for a soft-deleted org; a MECHANISM, not attribution (the audit row is User-attributed on
// the self leg, Admin-attributed on the admin leg). §B.6 dedup rides the same tx (scope org = null —
// no active-org context exists on either leg; the admin org-less-scope precedent). No claim leg:
// the restore is CAS/state-covered (a post-commit re-execution is a same-state STATE 409 — safe).
// Zero §8 events ([DC-1]); cross-module reactivation stays out-of-wire (Doc-5C §7.4).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveSelfUser, resolveStaffContext, type ResolveStaffContext } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  COMMAND_DEDUP_WINDOW_KEY,
  mapRestoreOrganization,
  orgInvalidInput,
  restoreOrganization,
  type RestoreOrganizationContext,
  type RestoreOrganizationInput,
  type RestoreOrganizationResult,
} from "@/modules/identity/contracts";
import { prisma } from "@/shared/db";
import { authChallengeResponse, type WireResponse } from "@/shared/http";
import {
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  type WireIdempotencyKey,
} from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

const CONTRACT_ID = "identity.restore_organization.v1" as const;

/** Dependencies for the restore composition (defaults bind production wiring). */
export interface RestoreOrganizationHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The server-side staff-principal resolution port (default: the DC-3 FAIL-CLOSED resolver). */
  resolveStaffContext?: ResolveStaffContext;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`). Routes always pass string|null. */
  idempotencyKey: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `POST /identity/organizations/{id}/restore_organization`. Returns `200`
 * (§5.6 envelope) · `401` auth-boundary · `400`/`403`/`404`/`409` (§C5 register) · the §9.3
 * stored replay on a within-window same-key re-submission.
 */
export async function handleRestoreOrganization(
  input: RestoreOrganizationInput,
  deps: RestoreOrganizationHandlerDeps,
): Promise<WireResponse<RestoreOrganizationResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // §B.6 mandatory-key SYNTAX leg (Doc-5C §4.3) — before any semantic processing.
  if (deps.idempotencyKey === null) {
    return orgInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  // ── Leg resolution (admin first — the 6.1 shape; the production staff resolver is DC-3
  //    fail-closed, so every real Wave-2 caller takes the self leg). ──
  const staff = await (deps.resolveStaffContext ?? resolveStaffContext)(session);
  let commandCtx: RestoreOrganizationContext;
  let actorUserId: string;
  if (staff !== null) {
    commandCtx = {
      admin: { adminUserId: staff.userId, isPlatformStaff: true },
      ipAddress: deps.ipAddress ?? null,
      userAgent: deps.userAgent ?? null,
    };
    actorUserId = staff.userId;
  } else {
    const self = await resolveSelfUser(session);
    if (self === null) {
      // No resolvable subject — the §6.6 collapse (never an existence-leaking error).
      return mapRestoreOrganization(null);
    }
    commandCtx = {
      userId: self.userId,
      ipAddress: deps.ipAddress ?? null,
      userAgent: deps.userAgent ?? null,
    };
    actorUserId = self.userId;
  }

  return prisma.$transaction(async (tx) => {
    // ── The frozen Doc-6C §6.2a context (see header). Transaction-local — never leaks. ──
    await tx.$executeRaw`SELECT set_config('app.user_id', ${actorUserId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const scope = key !== undefined ? dedupScope(CONTRACT_ID, actorUserId, null, key) : undefined;

    if (scope !== undefined) {
      const replay = await findStoredReplay<RestoreOrganizationResult>(
        scope,
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }
    }

    const outcome = await restoreOrganization(input, commandCtx, { appendAuditRecord }, tx);
    const wire = mapRestoreOrganization(outcome);

    if (scope !== undefined && outcome.ok) {
      // §B.6 persist — SUCCESS-ONLY, same tx as the audited write (the §14.3 joint rule).
      await persistWireReplay(scope, wire, tx);
    }
    return wire;
  });
}
