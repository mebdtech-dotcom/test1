// M1 application (PRIVATE) — `identity.accept_invitation.v1` (Doc-4C §C6 PassB:359–371;
// Doc-5C §5.1 row 13: `POST /identity/memberships/{id}/accept_invitation` · 200;
// actor = User (invitee), "N (pre-membership)" — NO active-org context, Doc-5C §2.5 note 13).
//
// Frozen validation chain (§C6 PassB:365): SYNTAX (token present — realized as the path `{id}`,
// see below) → CONTEXT (authenticated invitee — upstream) → SCOPE (invitation belongs to caller;
// `NOT_FOUND` collapse otherwise) → STATE (Doc-2 §5.2 `invited → pending`) → BUSINESS (invitation
// not expired/revoked).
//
// IDENTITY-MATCH LEG [frozen-sanctioned alternative]: the frozen Request Contract offers
// `invitation_token … (or membership_id + identity match)` (PassB:363). The frozen Doc-6C §3.3
// schema realizes NO invitation-token column, so the token leg is unrealizable; this realization
// binds the frozen ALTERNATIVE verbatim — the path `{id}` + the authenticated caller's identity
// (`memberships.user_id` must equal the session subject). A wrong/foreign invitation collapses to
// the byte-identical `NOT_FOUND` (PassB:366; §7.5 — invitee/invitation existence never disclosed).
//
// EXPIRED/REVOKED (BUSINESS) — realized VIA STATE, per the frozen register itself: PassB:366 binds
// "already accepted/expired" to `identity_membership_state_invalid` (STATE), and expiry's ONLY
// frozen realization is the `expire_invitation` System sweep's `invited → removed` edge
// (PassB:429–442) — so a revoked OR expired invitation IS a `removed` row and fails the STATE
// stage; no separate wall-clock window check is authored here (the sweep owns expiry; a lapsed
// but-not-yet-swept invitation is still `invited` and remains acceptable until the sweep runs)
// [logged judgment call].
//
// STATE EFFECTS (PassB:367): `invited → pending` ONLY — `pending` still grants no business access;
// activation to `active` is the SEPARATE System step (`activate_membership`, IDN-5 — consumed,
// never duplicated; PassB:371 "activation … is a separate System step, not part of accept").
//
// TRANSACTION & RLS CONTEXT [logged judgment call — the §6.2a mechanism]: the invitee holds NO
// active-org standing in the invitation's org (pre-membership — active-org context REQUIRES an
// active membership, Doc-5C §3.3), so the tenant `memberships_update` RLS leg
// (`organization_id = app.active_org`) cannot admit this write. The composition owns ONE
// transaction under the frozen Doc-6C §6.2a staff-GUC leg (`app.user_id` = the invitee +
// `app.is_platform_staff = 'true'` TRANSACTION-LOCAL — the deactivate/create-org precedent): a
// MECHANISM, not attribution — the app-layer identity match above is the PRIMARY authorization
// (Doc-6C §6.2a) and the audit row stays USER-attributed (the invitee).
//
// Events: none (§8). Idempotency (§B.6): required; window `identity.command_dedup_window`
// (Doc-3 v1.9 key #1) — the composition owns the replay legs; no claim (the `invited → pending`
// CAS is the in-flight single-execution guard — the 6.1/6.5 CAS-covered posture).

import type { AppendAuditRecord } from "@/modules/core/contracts";
import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  findMembershipForInvitee,
  readMembershipUpdatedAt,
  transitionMembershipState,
} from "../../infrastructure/data/membership-lifecycle.repository";
import { assertMembershipTransition } from "../../domain/state-machines/membership.state-machine";
import { MEMBERSHIP_ENTITY_TYPE, MembershipAuditAction } from "../../domain/audit-actions";
import type { AcceptInvitationInput, AcceptInvitationOutcome } from "../../contracts/types";

// Doc-4C §C6 accept error register (PassB:366 — frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_membership_invalid_input";
const NOT_FOUND_CODE = "identity_membership_not_found";
const STATE_INVALID_CODE = "identity_membership_state_invalid";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The server-resolved request context (from the composition edge — never client input). */
export interface AcceptInvitationContext {
  /** The authenticated INVITEE's `identity.users` id (the identity-match subject; Invariant #5). */
  userId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (D7 rule 4). */
export interface AcceptInvitationDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

/**
 * Accept an invitation (Doc-4C §C6 — `invited → pending`). MUST be invoked on the composition's
 * §6.2a transaction (see header) so the CAS write and the audit are atomic (D7).
 */
export async function acceptInvitationCommand(
  input: AcceptInvitationInput,
  ctx: AcceptInvitationContext,
  deps: AcceptInvitationDeps,
  db: DbExecutor = prisma,
): Promise<AcceptInvitationOutcome> {
  // (1) SYNTAX — the path `{id}` (uuid); the OPTIONAL `updated_at`, when supplied, must parse.
  if (
    typeof input.targetMembershipId !== "string" ||
    !UUID_PATTERN.test(input.targetMembershipId)
  ) {
    return err("VALIDATION", INVALID_INPUT_CODE, "id must be a UUID.");
  }
  if (
    input.updatedAt !== undefined &&
    (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime()))
  ) {
    return err("VALIDATION", INVALID_INPUT_CODE, "updated_at must be a timestamp when supplied.");
  }

  // (2) SCOPE — the invitation must BELONG TO the authenticated caller (the frozen identity-match
  //     leg). Absent OR foreign → the byte-identical NOT_FOUND collapse (PassB:366; §7.5 —
  //     nothing about someone else's invitation, or its existence, is disclosed).
  const row = await findMembershipForInvitee(input.targetMembershipId, ctx.userId, db);
  if (row === null) {
    return err("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
  }

  // (3) The OPTIONAL stale-view check — `updated_at : optional` (PassB:363): supplied-and-stale is
  //     the in-register VALIDATION 400 (the ratified §C9 body-token posture, RV-0153 call-1).
  if (input.updatedAt !== undefined && row.updatedAt.getTime() !== input.updatedAt.getTime()) {
    return err(
      "VALIDATION",
      INVALID_INPUT_CODE,
      "the invitation was modified concurrently; reload and retry.",
    );
  }

  // (4) STATE — accept drives the SINGLE frozen edge `invited → pending` (Doc-2 §5.2). Any other
  //     source — `pending`/`active` (already accepted) or `removed` (revoked/expired — the frozen
  //     register's "already accepted/expired" binding, see header) — is the STATE rejection.
  //     Machine-illegal-at-arrival leg: NO current-token carriage (the call-13 discipline).
  if (row.state !== "invited") {
    return err(
      "STATE",
      STATE_INVALID_CODE,
      "the invitation is not acceptable (already accepted, revoked, or expired).",
    );
  }
  assertMembershipTransition("invited", "pending"); // defensive — the machine is the single authority.

  // (5) WRITE — compare-and-set on the source state (`invited`). A lost race (0 rows) is a LOSING
  //     WRITE: the in-register STATE 409 CARRYING the current token (Doc-5A §9.5 `ETag`; §9.6
  //     re-read-retry) — the 6.5 losing-write leg discipline.
  const write = await transitionMembershipState(
    { id: row.id, from: "invited", to: "pending", actorUserId: ctx.userId },
    db,
  );
  if (write === null) {
    const current = await readMembershipUpdatedAt(row.id, db);
    return {
      ok: false,
      error: {
        errorClass: "STATE",
        errorCode: STATE_INVALID_CODE,
        message: "the invitation was already transitioned; reload and retry.",
        ...(current !== null ? { currentUpdatedAt: current } : {}),
      },
    };
  }

  // (6) AUDIT — the ENUMERATED §9 "membership accept" action, atomic (same tx; D7). USER-attributed
  //     (the invitee) — the §6.2a staff GUC is transport mechanism, never attribution.
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: row.organizationId,
      entityType: MEMBERSHIP_ENTITY_TYPE,
      entityId: row.id,
      action: MembershipAuditAction.ACCEPTED,
      oldValue: write.oldValue,
      newValue: write.newValue,
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { membershipId: row.id, state: "pending" } };
}

function err(
  errorClass: "VALIDATION" | "NOT_FOUND" | "STATE",
  errorCode: string,
  message: string,
): AcceptInvitationOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
