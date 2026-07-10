// App-layer COMPOSITIONS for the four ACTIVE-ORG §C6 membership commands (W2-IDN-6.3; Doc-5C §5.1):
//   `identity.invite_member.v1`          — `POST /identity/memberships` · 201 + Location
//   `identity.set_membership_status.v1`  — `POST …/{id}/set_membership_status` · 200
//   `identity.remove_member.v1`          — `POST …/{id}/remove_member` · 200
//   `identity.revoke_invitation.v1`      — `POST …/{id}/revoke_invitation` · 200
// (`accept_invitation` is PRE-membership — its composition lives in
// `accept-invitation.route-handler.ts` under the §6.2a mechanism.)
//
// The three lifecycle commands share the 6.2 tenant composition shape:
//   session → 401 · Idempotency-Key REQUIRED (Doc-5C §4.3) → 400 · provision · `withActiveOrg`
//   (unresolved context → the §6.6 404 collapse) → §B.6 replay lookup → command → wire map →
//   §B.6 persist (success-only, same tx — the §14.3 joint rule).
//
// INVITE adds the CREATE legs (the create-organization precedent): SYNTAX FIRST (the exported
// validator on the same category-1 slot), and the §14.3 PRE-EXECUTION CLAIM inside the tenant tx
// (a create has no CAS/machine leg — the claim is the single-execution guard, RV-0153 F2; a lost
// claim returns the concurrent winner's stored §9.3 payload WITHOUT executing). Window POLICY:
// `identity.membership_invite_dedup_window` (invite — its OWN frozen key, Doc-4C §C6 PassB:353) ·
// `identity.command_dedup_window` (the other three — PassB:396/:410/:424). Both UNSEEDED until
// W2-IDN-7 (real read, never a literal).
//
// SERIALIZATION (RV-0150 T6-F1): the `withActiveOrg` transaction IS each command's OWN transaction
// — the §5.5-GUARDED legs (`remove_member` · `set_membership_status` suspend) pass it straight to
// the FOR-UPDATE fact resolver and apply the guarded write on it (facts and writes never split).
// Zero §8 events ([DC-1] — the invite notification fan-out has NO emitter; nothing is dispatched).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  COMMAND_DEDUP_WINDOW_KEY,
  inviteMember,
  mapInviteMember,
  mapRemoveMember,
  mapRevokeInvitation,
  mapSetMembershipStatus,
  MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY,
  membershipInvalidInput,
  removeMember,
  revokeInvitation,
  setMembershipStatus,
  validateInviteMemberInput,
  type InviteMemberInput,
  type InviteMemberResult,
  type RemoveMemberInput,
  type RemoveMemberResult,
  type RevokeInvitationInput,
  type RevokeInvitationResult,
  type SetMembershipStatusInput,
  type SetMembershipStatusResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";
import {
  claimStoredReplay,
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  releaseStoredClaim,
  type WireIdempotencyKey,
} from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for a tenant membership composition (uniform across the four commands). */
export interface MembershipTenantHandlerDeps {
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

type TenantContext = {
  userId: string;
  activeOrgId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type TenantTx = Parameters<Parameters<typeof withActiveOrg>[1]>[0];

/** The shared tenant composition for the three LIFECYCLE commands (the 6.2 house shape). */
async function handleTenantMembershipCommand<TOutcome, TResult>(
  contractId: string,
  run: (ctx: TenantContext, tx: TenantTx) => Promise<TOutcome>,
  mapper: (outcome: TOutcome | null) => WireResponse<TResult>,
  isOk: (outcome: TOutcome) => boolean,
  deps: MembershipTenantHandlerDeps,
): Promise<WireResponse<TResult>> {
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

  const ran = await withActiveOrg(session, async (tx, context) => {
    if (key !== undefined) {
      const replay = await findStoredReplay<TResult>(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }
    }

    const outcome = await run(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      tx,
    );
    const wire = mapper(outcome);

    if (isOk(outcome) && key !== undefined) {
      // §B.6 persist — SUCCESS-ONLY, same tx as the audited write (the §14.3 joint rule).
      await persistWireReplay(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        wire,
        tx,
      );
    }
    return wire;
  });

  if (!ran.resolved) {
    return mapper(null); // §6.6 collapse (no user / no active membership).
  }
  return ran.value;
}

/**
 * The HTTP face for `POST /identity/memberships` (`201` + `Location`) — `identity.invite_member.v1`
 * with the §14.3 CREATE claim leg (see header). Returns the §9.3 stored replay on a within-window
 * same-key re-submission.
 */
export async function handleInviteMember(
  input: InviteMemberInput,
  deps: MembershipTenantHandlerDeps,
): Promise<WireResponse<InviteMemberResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX FIRST (Doc-4A §11.2 fixed order — the command re-runs the same exported validator;
  // single source, no re-derivation), then the §B.6 mandatory-key leg on the same category-1 slot.
  const syntaxFailure = validateInviteMemberInput(input);
  if (syntaxFailure !== null) {
    return membershipInvalidInput(syntaxFailure);
  }
  if (deps.idempotencyKey === null) {
    return membershipInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const contractId = "identity.invite_member.v1";
  const ran = await withActiveOrg(session, async (tx, context) => {
    const scope =
      key !== undefined
        ? dedupScope(contractId, context.userId, context.activeOrgId, key)
        : undefined;

    if (scope !== undefined) {
      // §B.6 replay lookup (within-window same-key → the stored response; NO re-execution).
      const replay = await findStoredReplay<InviteMemberResult>(
        scope,
        MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }

      // Doc-4A §14.3 IN-FLIGHT protection (RV-0153 F2): CLAIM the key BEFORE the command — the
      // create has no CAS/machine leg, so the claim is the single-execution guard; a concurrent
      // same-key contender blocks on this transaction's uncommitted claim, LOSES once it commits,
      // and returns the stored winner below.
      const claim = await claimStoredReplay(scope, MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY, tx);
      if (claim === "lost") {
        const winner = await findStoredReplay<InviteMemberResult>(
          scope,
          MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY,
          tx,
        );
        if (winner !== null) {
          return winner; // the §9.3 stored payload — this caller's business logic never began.
        }
        // Unreachable by construction (pending rows never commit — claim/complete/release share
        // one tx). Fail CLOSED rather than risk a second execution under one key (§14.3).
        throw new Error(
          "command-dedup: claim lost but no stored record resolved (unreachable; failing closed per Doc-4A §14.3).",
        );
      }
    }

    const outcome = await inviteMember(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
    const wire = mapInviteMember(outcome);

    if (scope !== undefined) {
      if (outcome.ok) {
        // §B.6 persist — SUCCESS-ONLY, same tx as the audited write (the §14.3 joint rule).
        await persistWireReplay(scope, wire, tx);
      } else {
        // Error OUTCOME (the tx will commit): release the claim — errors are never cached and the
        // key never wedges (§9.6 retry stays live). A THROWN failure rolls the claim back.
        await releaseStoredClaim(scope, tx);
      }
    }
    return wire;
  });

  if (!ran.resolved) {
    return mapInviteMember(null); // §6.6 collapse (no user / no active membership).
  }
  return ran.value;
}

/** The HTTP face for `POST /identity/memberships/{id}/set_membership_status` (`200`) — the
 *  §5.5-guarded suspend leg / the unguarded reinstate leg (RV-0150: the `withActiveOrg` tx IS the
 *  lock tx). */
export async function handleSetMembershipStatus(
  input: SetMembershipStatusInput,
  deps: MembershipTenantHandlerDeps,
): Promise<WireResponse<SetMembershipStatusResult>> {
  return handleTenantMembershipCommand(
    "identity.set_membership_status.v1",
    (ctx, tx) => setMembershipStatus(input, ctx, { appendAuditRecord }, tx),
    mapSetMembershipStatus,
    (o) => o.ok,
    deps,
  );
}

/** The HTTP face for `POST /identity/memberships/{id}/remove_member` (`200`) — the §5.5-guarded
 *  terminal removal (RV-0150: the `withActiveOrg` tx IS the lock tx). */
export async function handleRemoveMember(
  input: RemoveMemberInput,
  deps: MembershipTenantHandlerDeps,
): Promise<WireResponse<RemoveMemberResult>> {
  return handleTenantMembershipCommand(
    "identity.remove_member.v1",
    (ctx, tx) => removeMember(input, ctx, { appendAuditRecord }, tx),
    mapRemoveMember,
    (o) => o.ok,
    deps,
  );
}

/** The HTTP face for `POST /identity/memberships/{id}/revoke_invitation` (`200`) — `invited →
 *  removed` (terminal; NOT §5.5-guarded — no frozen §5.5 stage). */
export async function handleRevokeInvitation(
  input: RevokeInvitationInput,
  deps: MembershipTenantHandlerDeps,
): Promise<WireResponse<RevokeInvitationResult>> {
  return handleTenantMembershipCommand(
    "identity.revoke_invitation.v1",
    (ctx, tx) => revokeInvitation(input, ctx, { appendAuditRecord }, tx),
    mapRevokeInvitation,
    (o) => o.ok,
    deps,
  );
}
