// App-layer COMPOSITION for `identity.accept_invitation.v1` (W2-IDN-6.3; Doc-5C §5.1 row 13 —
// `POST /identity/memberships/{id}/accept_invitation` · 200; User (invitee), PRE-membership —
// "N (pre-membership)", Doc-5C §2.5 note 13: "the invitation scopes it server-side").
//
// Composition (the create-organization §6.2a-transaction shape — NOT `withActiveOrg`, because the
// invitee holds NO active membership in the invitation's org, so no active-org context can be
// established for it; Invariant #5 forbids trusting any client-supplied org):
//   1. Resolve session → `401` (DC-4 pre-contract boundary).
//   2. The §B.6 mandatory Idempotency-Key leg (Doc-5C §4.3) → `400`.
//   3. `ensureProvisioned(session)` + `resolveSelfUser` (the acting invitee; fail-closed collapse).
//   4. ONE composition-owned transaction realizing the frozen Doc-6C §6.2a staff-GUC mechanism
//      (`app.user_id` = the invitee + `app.is_platform_staff = 'true'` TRANSACTION-LOCAL — the
//      deactivate/create-org precedent): required because the tenant `memberships_update` RLS leg
//      keys on `app.active_org`, which a PRE-membership invitee cannot hold. A MECHANISM, not
//      attribution — the command's identity-match (membership.user_id = the session subject) is
//      the PRIMARY authorization (Doc-6C §6.2a) and the audit row stays USER-attributed.
//      INSIDE it: §B.6 replay lookup → the M1 command (SCOPE identity-match → STATE
//      `invited → pending` CAS → audit, atomic) → wire mapping → §B.6 persist (success-only,
//      same tx — the §14.3 joint rule). No claim leg: the CAS on the `invited` source state is the
//      in-flight single-execution guard (the 6.1/6.5 CAS-covered posture).
//
// Dedup scope: (contract, actor, org = null, key) — pre-membership carries NO org context (the
// bootstrap org-less-scope precedent). Window POLICY: `identity.command_dedup_window`
// (Doc-4C §C6 PassB:368; unseeded until W2-IDN-7 — real read, never a literal).
// Zero §8 events ([DC-1]).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveSelfUser } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  acceptInvitation,
  COMMAND_DEDUP_WINDOW_KEY,
  mapAcceptInvitation,
  membershipInvalidInput,
  type AcceptInvitationInput,
  type AcceptInvitationResult,
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

const CONTRACT_ID = "identity.accept_invitation.v1" as const;

/** Dependencies for the accept-invitation composition (defaults bind production wiring). */
export interface AcceptInvitationHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`). Routes always pass string|null.
   *  REQUIRED-field dep shape (RV-0153 OBS-2 — never optional on a new composition). */
  idempotencyKey: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `POST /identity/memberships/{id}/accept_invitation`. Returns `200` (§5.6
 * envelope: membership_id · state = pending) · `401` auth-boundary · `400` validation · `404`
 * byte-identical collapse (absent OR foreign invitation) · `409` STATE (already accepted /
 * revoked / expired; the losing-write leg carries `ETag`).
 */
export async function handleAcceptInvitation(
  input: AcceptInvitationInput,
  deps: AcceptInvitationHandlerDeps,
): Promise<WireResponse<AcceptInvitationResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // §B.6 mandatory-key SYNTAX leg (Doc-5C §4.3) — before any semantic processing.
  if (deps.idempotencyKey === null) {
    return membershipInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const self = await resolveSelfUser(session);
  if (self === null) {
    // No resolvable subject — fail-closed §6.6 collapse (never an existence-leaking error).
    return mapAcceptInvitation(null);
  }

  return prisma.$transaction(async (tx) => {
    // ── The frozen Doc-6C §6.2a mechanism (see header). Transaction-local — never leaks. ──
    await tx.$executeRaw`SELECT set_config('app.user_id', ${self.userId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const scope = key !== undefined ? dedupScope(CONTRACT_ID, self.userId, null, key) : undefined;

    if (scope !== undefined) {
      // §B.6 replay lookup (within-window same-key → the stored response; NO re-execution).
      const replay = await findStoredReplay<AcceptInvitationResult>(
        scope,
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }
    }

    const outcome = await acceptInvitation(
      input,
      {
        userId: self.userId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
    const wire = mapAcceptInvitation(outcome);

    if (outcome.ok && scope !== undefined) {
      // §B.6 persist — SUCCESS-ONLY, same tx as the audited write (the §14.3 joint rule).
      await persistWireReplay(scope, wire, tx);
    }
    return wire;
  });
}
