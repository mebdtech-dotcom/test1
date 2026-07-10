// M1 application (PRIVATE) — the three §C6 membership LIFECYCLE commands (W2-IDN-6.3):
//   `identity.set_membership_status.v1` (Doc-4C §C6 PassB:387–399; Doc-5C §5.1 row 14) — `active ⇄ suspended`
//   `identity.remove_member.v1`         (Doc-4C §C6 PassB:401–413; Doc-5C §5.1 row 15) — `active|suspended → removed`
//   `identity.revoke_invitation.v1`     (Doc-4C §C6 PassB:415–427; Doc-5C §5.1 row 16) — `invited → removed`
// One shared shape (the 6.5 delegation-lifecycle house shape): SYNTAX → AUTHZ (`can_manage_users`
// via the wired `check_permission` root; Delegation NOT eligible — membership path only) → SCOPE
// (membership in the caller's active org; byte-identical NOT_FOUND collapse otherwise) → stale
// body-token check → STATE (each command drives ONLY its frozen edge set) → [guarded legs: the
// RV-0150 FOR-UPDATE resolver + the pure §5.5 policy] → CAS write → atomic audit (D7).
//
// THE FROZEN-DERIVED §5.5 GUARDED SET (re-derived verbatim this WP — never trusted from a packet):
//   • `remove_member`         — GUARDED: PassB:407 "BUSINESS (Last Owner Protection, §5.5)";
//                               register `identity_org_last_owner_block` (PassB:408).
//   • `set_membership_status` — GUARDED on the SUSPEND leg ONLY: PassB:393 "BUSINESS (Last Owner
//                               Protection — cannot suspend the sole active Owner, §5.5)"; register
//                               `identity_org_last_owner_block` (PassB:394). The REINSTATE leg
//                               (`suspended → active`) ADDS an active member — it cannot reduce the
//                               active-Owner set and carries NO frozen §5.5 stage; adding a guard or
//                               a lock there would be an unfrozen conjunct (RV-0155 OBS-Δ2 lesson).
//   • `revoke_invitation`     — NOT guarded: PassB:421–422 authors NO §5.5 stage and NO last-owner
//                               code — an `invited` row grants no access (Doc-2 §5.2) and is never
//                               in the active-Owner set.
//
// SERIALIZATION (RV-0150 T6-F1 contract, the 6.2 transfer/recovery house shape): each GUARDED leg
// resolves the §5.5 facts via `resolveOwnerRemovalFacts` — which takes the SET-LEVEL `FOR UPDATE`
// lock on the org's active-Owner membership rows — ON THIS COMMAND'S OWN TRANSACTION (the
// composition's `withActiveOrg` tx, passed straight through as `db`), decides via the PURE
// `evaluateLastOwnerProtection` policy over those POST-LOCK facts, and applies the guarded write in
// that SAME transaction. Two concurrent Owner-disabling mutations on one org (distinct target rows
// — per-row CAS cannot help) serialize on the lock: the second blocks, re-reads the committed
// facts, and is BLOCKED by the guard — never an ownerless org.
//
// EMPTY-LOCK-SET PREMISE (RV-0155 O1 — the resolver's PREMISE block, checked for THIS WP): the
// FOR-UPDATE serialization presumes a NON-EMPTY lock set. Neither leg realized here can empty a
// LIVE org's active-Owner ROW set: the guard BLOCKS suspending/removing the SOLE active Owner
// (`otherActiveOwnerCount === 0` ⇒ 422), so every permitted mutation leaves ≥ 1 active-Owner row
// behind — the premise HOLDS; no Flag-and-Halt condition arises.
//
// `updated_at` carriage (the RV-0153 call-1 discipline): NO §C6 contract declares `Concurrency:
// optimistic` and NO §C6 register authors a CONFLICT code — `updated_at` is the frozen REQUIRED
// request-BODY field; a stale arrival view is the in-register VALIDATION 400; a LOSING concurrent
// write (lost CAS) is the in-register `identity_membership_state_invalid` STATE 409 CARRYING the
// current token (`ETag`, Doc-5A §9.5/§9.6 — the call-13 losing-write-only leg discipline).
//
// Events: none (§8 — [DC-1]). Idempotency (§B.6): required; window
// `identity.command_dedup_window` (Doc-3 v1.9 key #1) — replay legs at the composition; no claim
// (CAS/machine-covered — the 6.1/6.5 ratified posture).

import type { AppendAuditRecord } from "@/modules/core/contracts";
import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  findMembershipInOrg,
  readMembershipUpdatedAt,
  resolveOwnerRemovalFacts,
  transitionMembershipState,
} from "../../infrastructure/data/membership-lifecycle.repository";
import { evaluateLastOwnerProtection } from "../../domain/policies/last-owner-protection.policy";
import {
  assertMembershipTransition,
  type MembershipState,
} from "../../domain/state-machines/membership.state-machine";
import {
  MEMBERSHIP_ENTITY_TYPE,
  MembershipAuditAction,
  type MembershipAuditActionToken,
} from "../../domain/audit-actions";
import { checkPermission } from "../queries/check-permission.query";
import { MANAGE_USERS_SLUG } from "./invite-member.command";
import type {
  CheckPermissionInput,
  CheckPermissionResult,
  MembershipError,
  RemoveMemberInput,
  RemoveMemberOutcome,
  RevokeInvitationInput,
  RevokeInvitationOutcome,
  SetMembershipStatusInput,
  SetMembershipStatusOutcome,
} from "../../contracts/types";

// Doc-4C §C6 lifecycle error registers (PassB:394/:408/:422 — frozen codes; bound by pointer).
const INVALID_INPUT_CODE = "identity_membership_invalid_input";
const FORBIDDEN_CODE = "identity_membership_forbidden";
const NOT_FOUND_CODE = "identity_membership_not_found";
const STATE_INVALID_CODE = "identity_membership_state_invalid";
const LAST_OWNER_BLOCK_CODE = "identity_org_last_owner_block";

/** `reason : string : optional` — bounded [realization convention] (the ADMIN_REASON precedent). */
export const MEMBERSHIP_REASON_MAX_LENGTH = 500;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The server-resolved request context (shared by the three lifecycle commands). */
export interface MembershipLifecycleContext {
  /** The acting `identity.users` id (Invariant #5). */
  userId: string;
  /** The SERVER-RESOLVED active org — must own the target membership. */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected services (D7 rule 4). `authorize` is injectable for tests; the production default is
 *  the M1 `check_permission` root itself (never a shadow check). */
export interface MembershipLifecycleDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** The authorization root (defaults to `identity.check_permission` — the single decider). */
  authorize?: (input: CheckPermissionInput, db?: DbExecutor) => Promise<CheckPermissionResult>;
}

interface LifecycleSpec {
  /** The frozen edge this command drives: legal SOURCE states → the single target. Each command
   *  drives ONLY its authored edge set (the RV-0150 Adjudication-3 source-gate discipline —
   *  machine-legal is necessary, not sufficient). */
  allowedSources: readonly MembershipState[];
  to: MembershipState;
  /** §5.5-guarded leg? (the frozen-derived set — see header). */
  guarded: boolean;
  /** The audit action token (Doc-2 §9 by pointer — never invented). */
  action: MembershipAuditActionToken;
  /** The STATE-rejection message (frozen-truthful per contract). */
  stateMessage: string;
  /** Optional operator reason to record in the audit payload. */
  reason?: string | undefined;
}

type LifecycleFailure = { ok: false; error: MembershipError };
type LifecycleSuccess = {
  ok: true;
  membershipId: string;
  state: MembershipState;
  updatedAt: Date;
};

/** The shared §C6 lifecycle transition (see header). The CALLER-facing commands below bind each
 *  contract's frozen input/result shape onto this core. */
async function membershipTransitionCore(
  targetMembershipId: string,
  updatedAt: Date,
  ctx: MembershipLifecycleContext,
  deps: MembershipLifecycleDeps,
  spec: LifecycleSpec,
  db: DbExecutor,
): Promise<LifecycleFailure | LifecycleSuccess> {
  // (1) SYNTAX — the path `{id}` (uuid); the REQUIRED body `updated_at`; the bounded reason.
  if (typeof targetMembershipId !== "string" || !UUID_PATTERN.test(targetMembershipId)) {
    return fail("VALIDATION", INVALID_INPUT_CODE, "id must be a UUID.");
  }
  if (!(updatedAt instanceof Date) || Number.isNaN(updatedAt.getTime())) {
    return fail("VALIDATION", INVALID_INPUT_CODE, "updated_at is required.");
  }
  if (
    spec.reason !== undefined &&
    (typeof spec.reason !== "string" ||
      spec.reason.length === 0 ||
      spec.reason.length > MEMBERSHIP_REASON_MAX_LENGTH)
  ) {
    return fail(
      "VALIDATION",
      INVALID_INPUT_CODE,
      `reason must be 1..${MEMBERSHIP_REASON_MAX_LENGTH} characters when supplied.`,
    );
  }

  // (2) AUTHZ — `can_manage_users` (§11.2 category 3 precedes SCOPE — a caller without the slug
  //     learns nothing about the target). Delegation NOT eligible: membership path only.
  const authorize =
    deps.authorize ??
    ((i: CheckPermissionInput, d?: DbExecutor) => checkPermission(i, undefined, d));
  const decision = await authorize(
    { userId: ctx.userId, organizationId: ctx.activeOrgId, permissionSlug: MANAGE_USERS_SLUG },
    db,
  );
  if (decision.decision !== "allow" || decision.satisfiedBy !== "membership") {
    return fail("AUTHORIZATION", FORBIDDEN_CODE, "Not permitted to manage members.");
  }

  // (3) SCOPE — the membership must live INSIDE the caller's active org. Absent OR foreign →
  //     byte-identical NOT_FOUND (§B.4 SCOPE→NOT_FOUND disclosure collapse; §7.5).
  const row = await findMembershipInOrg(targetMembershipId, ctx.activeOrgId, db);
  if (row === null) {
    return fail("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
  }

  // (4) Stale arrival view — the REQUIRED body token vs the live row (VALIDATION 400; the
  //     ratified §C9/restore posture — no §C6 CONFLICT code exists).
  if (row.updatedAt.getTime() !== updatedAt.getTime()) {
    return fail(
      "VALIDATION",
      INVALID_INPUT_CODE,
      "the membership was modified concurrently; reload and retry.",
    );
  }

  // (5) STATE — this command's frozen edge ONLY (machine-legal is necessary, not sufficient: e.g.
  //     `pending → active` is machine-legal but belongs to the System `activate_membership`, and
  //     `invited → removed` belongs to revoke/expire, not `remove_member`). Machine-illegal /
  //     wrong-contract legs carry NO current token (call-13).
  if (!spec.allowedSources.includes(row.state)) {
    return fail("STATE", STATE_INVALID_CODE, spec.stateMessage);
  }
  assertMembershipTransition(row.state, spec.to); // defensive — the machine is the single authority.

  // (6) BUSINESS (§5.5) — GUARDED legs only (the frozen-derived set, header): the RV-0150
  //     FOR-UPDATE resolver ON THIS TRANSACTION, then the PURE policy over the POST-LOCK facts.
  //     While this command blocked on a concurrent Owner-mutation's lock, the target row itself
  //     may have moved — the CAS at (7), keyed on the pre-lock source state, converts that into
  //     the losing-write leg (never a decision on stale facts; the facts consumed HERE are
  //     post-lock by construction).
  if (spec.guarded) {
    const facts = await resolveOwnerRemovalFacts(ctx.activeOrgId, row.id, db);
    if (evaluateLastOwnerProtection(facts).blocked) {
      return fail(
        "BUSINESS",
        LAST_OWNER_BLOCK_CODE,
        "the mutation would leave the organization without an active Owner (Last Owner Protection).",
      );
    }
  }

  // (7) WRITE — compare-and-set on the source state. A lost race (0 rows) is the LOSING WRITE:
  //     the in-register STATE 409 CARRYING the current token (`ETag` — §9.5/§9.6).
  const write = await transitionMembershipState(
    { id: row.id, from: row.state, to: spec.to, actorUserId: ctx.userId },
    db,
  );
  if (write === null) {
    const current = await readMembershipUpdatedAt(row.id, db);
    return {
      ok: false,
      error: {
        errorClass: "STATE",
        errorCode: STATE_INVALID_CODE,
        message: "the membership was already transitioned; reload and retry.",
        ...(current !== null ? { currentUpdatedAt: current } : {}),
      },
    };
  }

  // (8) AUDIT — atomic with the write (SAME tx; D7), via the M0 facade ONLY. Reason recorded when
  //     supplied (ids + meta only — Doc-6A §12).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: MEMBERSHIP_ENTITY_TYPE,
      entityId: row.id,
      action: spec.action,
      oldValue: write.oldValue,
      newValue: {
        ...write.newValue,
        ...(spec.reason !== undefined ? { reason: spec.reason } : {}),
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, membershipId: row.id, state: spec.to, updatedAt: write.updatedAt };
}

/**
 * `identity.set_membership_status.v1` (Doc-4C §C6) — suspend/reinstate. The SUSPEND leg is
 * §5.5-GUARDED + RV-0150-serialized; the REINSTATE leg is not (frozen-derived — header). MUST be
 * invoked INSIDE `withActiveOrgContext` (that tx IS the lock tx).
 */
export async function setMembershipStatusCommand(
  input: SetMembershipStatusInput,
  ctx: MembershipLifecycleContext,
  deps: MembershipLifecycleDeps,
  db: DbExecutor = prisma,
): Promise<SetMembershipStatusOutcome> {
  // SYNTAX (contract-specific): `target_status : enum(suspended|active) : required`.
  if (input.targetStatus !== "suspended" && input.targetStatus !== "active") {
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message: "target_status must be 'suspended' or 'active'.",
      },
    };
  }
  const suspending = input.targetStatus === "suspended";
  const outcome = await membershipTransitionCore(
    input.targetMembershipId,
    input.updatedAt,
    ctx,
    deps,
    {
      // The frozen `active ⇄ suspended` pair (PassB:393/:395): suspend FROM active; reinstate FROM
      // suspended. `pending → active` is machine-legal but is the System activation edge — NOT
      // this contract's (source-gate discipline).
      allowedSources: suspending ? ["active"] : ["suspended"],
      to: input.targetStatus,
      guarded: suspending, // §5.5 guards the SUSPEND direction only (PassB:393).
      action: suspending ? MembershipAuditAction.SUSPENDED : MembershipAuditAction.REINSTATED,
      stateMessage: suspending
        ? "only an active membership can be suspended."
        : "only a suspended membership can be reinstated.",
      reason: input.reason,
    },
    db,
  );
  if (!outcome.ok) return outcome;
  return {
    ok: true,
    result: {
      membershipId: outcome.membershipId,
      state: input.targetStatus,
      updatedAt: outcome.updatedAt,
    },
  };
}

/**
 * `identity.remove_member.v1` (Doc-4C §C6) — `active|suspended → removed` (terminal; audit
 * retained; never reopens). §5.5-GUARDED + RV-0150-serialized. MUST be invoked INSIDE
 * `withActiveOrgContext` (that tx IS the lock tx).
 */
export async function removeMemberCommand(
  input: RemoveMemberInput,
  ctx: MembershipLifecycleContext,
  deps: MembershipLifecycleDeps,
  db: DbExecutor = prisma,
): Promise<RemoveMemberOutcome> {
  const outcome = await membershipTransitionCore(
    input.targetMembershipId,
    input.updatedAt,
    ctx,
    deps,
    {
      // Frozen STATE (PassB:407): `active|suspended → removed`. An `invited` row is revoke's /
      // expire's edge, NOT this contract's ("only valid on invited — use remove_member for
      // active/suspended", PassB:427 read inversely); `pending` has no legal `→ removed` edge.
      allowedSources: ["active", "suspended"],
      to: "removed",
      guarded: true, // §5.5 (PassB:407) — the RV-0150 lock + policy.
      action: MembershipAuditAction.REMOVED,
      stateMessage: "only an active or suspended membership can be removed.",
      reason: input.reason,
    },
    db,
  );
  if (!outcome.ok) return outcome;
  return { ok: true, result: { membershipId: outcome.membershipId, state: "removed" } };
}

/**
 * `identity.revoke_invitation.v1` (Doc-4C §C6) — `invited → removed` (terminal). NOT §5.5-guarded
 * (frozen-derived — header). MUST be invoked INSIDE `withActiveOrgContext`.
 */
export async function revokeInvitationCommand(
  input: RevokeInvitationInput,
  ctx: MembershipLifecycleContext,
  deps: MembershipLifecycleDeps,
  db: DbExecutor = prisma,
): Promise<RevokeInvitationOutcome> {
  const outcome = await membershipTransitionCore(
    input.targetMembershipId,
    input.updatedAt,
    ctx,
    deps,
    {
      // Frozen STATE (PassB:421): `invited → removed`; "only valid on `invited` (use
      // `remove_member` for active/suspended)" (PassB:427).
      allowedSources: ["invited"],
      to: "removed",
      guarded: false, // no frozen §5.5 stage (PassB:421-422) — an invited row is never an active Owner.
      action: MembershipAuditAction.REMOVED,
      stateMessage:
        "only an invitation still awaiting acceptance can be revoked (already accepted or removed).",
    },
    db,
  );
  if (!outcome.ok) return outcome;
  return { ok: true, result: { membershipId: outcome.membershipId, state: "removed" } };
}

function fail(
  errorClass: "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "STATE" | "BUSINESS",
  errorCode: string,
  message: string,
): LifecycleFailure {
  return { ok: false, error: { errorClass, errorCode, message } };
}
