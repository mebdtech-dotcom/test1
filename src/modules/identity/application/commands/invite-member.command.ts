// M1 application (PRIVATE) — `identity.invite_member.v1` (Doc-4C §C6 PassB:344–357;
// Doc-5C §5.1 row 12: `POST /identity/memberships` · 201 + Location). W2-IDN-6.3.
//
// Frozen validation chain (§C6 PassB:350): SYNTAX (email format; `role_id` uuid) → CONTEXT
// (active-org — upstream) → AUTHZ (`can_manage_users` via the wired `check_permission` root;
// Delegation: NOT eligible — only the `membership` granting path is accepted, fail-closed) →
// SCOPE (caller's active org — the server-resolved context IS the inviting org; Invariant #5) →
// REFERENCE (`role_id` exists & same-tenant, §B.9) → BUSINESS (not already an active/pending
// member; seat rules if configured — NO identity seat POLICY key is registered [Doc-3 v1.9 = 7
// keys], so the seat leg is UNREALIZABLE and deliberately absent, the 6.2 org-count-QUOTA
// precedent).
//
// STATE EFFECTS (§C6 PassB:352): Doc-2 §5.2 `→ invited` — a NEW `identity.memberships` row;
// Mutation-Scope `identity.memberships` ONLY (no other table is written). `invited` grants no
// access (∉ the access formula, Doc-2 §5.2).
//
// INVITEE RESOLUTION [logged judgment call — fail-closed]: the frozen `email` field is the
// "invitee identifier (auth-managed)". The frozen Doc-6C §3.3 schema requires `user_id NOT NULL`
// on every membership row, so an invitation is only realizable for an email that resolves to a
// LIVE `identity.users` row. No frozen §C6 leg covers a non-resolving email; minting a users row
// here would exceed the frozen Mutation-Scope, cross the DC-4 auth boundary (users materialize via
// provisioning), and collide with the WP-1.3 email partial-unique provisioning path — so a
// non-resolving email is REJECTED fail-closed as the in-register VALIDATION `invalid_input`
// (the RV-0152 F1 / ESC-IDN-PREF-KEYS posture; escalation handle proposed in the completion
// report). The response/error surface discloses NOTHING about the invitee beyond this frozen
// register (no user id, no profile, no other-org membership — §7.5).
//
// RE-INVITE AFTER REMOVAL [logged judgment call]: §C6 PassB:413/:427 — "removed is terminal —
// never reopen (re-invite creates a NEW membership)". A prior `removed` row that is still LIVE
// under the Doc-2 §10.2 partial-unique index `(user_id, organization_id) WHERE deleted_at IS NULL`
// would foreclose the frozen NEW row — so the removed row is TOMBSTONED (marker tuple ONLY; the
// terminal `removed` state stays byte-untouched — the 6.2 org-cascade marker precedent; audit rows
// retained) and the new `invited` row is inserted in the SAME transaction.
//
// Events: none (§8) — "notification dispatch is NOT an identity event → [DC-1]" (PassB:355). The
// invite notification fan-out has NO §8 emitter and stays UNBUILT (nothing is dispatched here).
// Idempotency (§B.6): required; window `identity.membership_invite_dedup_window` (Doc-3 v1.9 key
// #3) — the composition owns the replay/claim legs (create-class: the RV-0153 F2 claim pattern).

import type { AppendAuditRecord } from "@/modules/core/contracts";
import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  findInvitableRole,
  findLiveMembershipForUserInOrg,
  findLiveUserIdByEmail,
  insertInvitedMembership,
  tombstoneRemovedMembership,
} from "../../infrastructure/data/membership-lifecycle.repository";
import { MEMBERSHIP_ENTITY_TYPE, MembershipAuditAction } from "../../domain/audit-actions";
import { checkPermission } from "../queries/check-permission.query";
import type {
  CheckPermissionInput,
  CheckPermissionResult,
  InviteMemberInput,
  InviteMemberOutcome,
} from "../../contracts/types";

/** The Doc-2 §7 slug every §C6 management command binds (Doc-4C §C6 PassB:342/:346 — "Management
 *  commands require `can_manage_users` (Doc-2 §7)"). A CATALOG token by pointer — never invented. */
export const MANAGE_USERS_SLUG = "can_manage_users" as const;

// Doc-4C §C6 invite error register (PassB:351 — frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_membership_invalid_input";
const FORBIDDEN_CODE = "identity_membership_forbidden";
const ROLE_NOT_FOUND_CODE = "identity_role_not_found";
const ALREADY_EXISTS_CODE = "identity_membership_already_exists";

/** `department : string : optional` — bounded [realization convention] (the `ADMIN_REASON_MAX_
 *  LENGTH` precedent; the frozen field declares no bound, an unbounded write is a hazard). */
export const INVITE_DEPARTMENT_MAX_LENGTH = 200;

/** Email format + length ceiling (SYNTAX only — "email is an auth identifier (DC-4), validated
 *  for format only here", §C6 PassB:357). RFC-5321 total-length ceiling; shape check minimal. */
export const INVITE_EMAIL_MAX_LENGTH = 320;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The tombstone `delete_reason` for a superseded `removed` row (free-text operational marker —
 *  Doc-2 §0.2; not a coined business enum). */
const REINVITE_TOMBSTONE_REASON =
  "superseded by re-invite (Doc-4C §C6 — re-invite creates a new membership)";

/**
 * SYNTAX validation (Doc-4A §11.2 category 1) — exported so the composition edge runs the SAME
 * validator FIRST (the create-organization precedent; single source, no re-derivation).
 * Returns the failure message, or `null` when syntactically valid.
 */
export function validateInviteMemberInput(input: InviteMemberInput): string | null {
  if (
    typeof input.email !== "string" ||
    input.email.trim().length === 0 ||
    input.email.length > INVITE_EMAIL_MAX_LENGTH ||
    !EMAIL_PATTERN.test(input.email.trim())
  ) {
    return "email must be a valid email address.";
  }
  if (typeof input.roleId !== "string" || !UUID_PATTERN.test(input.roleId)) {
    return "role_id must be a UUID.";
  }
  if (
    input.department !== undefined &&
    (typeof input.department !== "string" ||
      input.department.length === 0 ||
      input.department.length > INVITE_DEPARTMENT_MAX_LENGTH)
  ) {
    return `department must be 1..${INVITE_DEPARTMENT_MAX_LENGTH} characters when supplied.`;
  }
  return null;
}

/** Normalize the invitee email for resolution (trim + lower-case — the auth layer stores
 *  lower-cased emails; provisioning persists the session email as delivered). Micro-call logged. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** The server-resolved request context (from the composition edge — never client input). */
export interface InviteMemberContext {
  /** The acting `identity.users` id (Invariant #5 — users act). */
  userId: string;
  /** The SERVER-RESOLVED active org — the inviting org (organizations own). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected services (D7 rule 4). `authorize` is injectable for tests; the production default is
 *  the M1 `check_permission` root itself (never a shadow check). */
export interface InviteMemberDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** The authorization root (defaults to `identity.check_permission` — the single decider). */
  authorize?: (input: CheckPermissionInput, db?: DbExecutor) => Promise<CheckPermissionResult>;
}

/**
 * Invite a member (Doc-4C §C6). MUST be invoked INSIDE `withActiveOrgContext` — `db` is the
 * composition's tenant transaction; the insert (+ any tombstone) and the audit ride it atomically
 * (D7). The §B.6 claim leg lives at the composition (create-class — RV-0153 F2).
 */
export async function inviteMemberCommand(
  input: InviteMemberInput,
  ctx: InviteMemberContext,
  deps: InviteMemberDeps,
  db: DbExecutor = prisma,
): Promise<InviteMemberOutcome> {
  // (1) SYNTAX (§B.4 category 1) — the same exported validator the composition ran.
  const syntaxFailure = validateInviteMemberInput(input);
  if (syntaxFailure !== null) {
    return err("VALIDATION", INVALID_INPUT_CODE, syntaxFailure);
  }

  // (2) AUTHZ — `can_manage_users` via the wired authorization root (§11.2 category 3 precedes
  //     SCOPE/semantics). Delegation: NOT eligible (§C6 PassB:346) — only the `membership`
  //     granting path is accepted; a delegation-satisfied allow is rejected fail-closed (the 6.2
  //     F-B4b discipline).
  const authorize =
    deps.authorize ??
    ((i: CheckPermissionInput, d?: DbExecutor) => checkPermission(i, undefined, d));
  const decision = await authorize(
    { userId: ctx.userId, organizationId: ctx.activeOrgId, permissionSlug: MANAGE_USERS_SLUG },
    db,
  );
  if (decision.decision !== "allow" || decision.satisfiedBy !== "membership") {
    return err("AUTHORIZATION", FORBIDDEN_CODE, "Not permitted to manage members.");
  }

  // (3) REFERENCE — `role_id` exists & same-tenant (§B.9): the active org's own role OR a platform
  //     system bundle (the seeded composition rows memberships already reference — Doc-6C §5.2).
  //     A foreign org's role resolves to the SAME code as nonexistent (no cross-tenant role).
  const role = await findInvitableRole(input.roleId, ctx.activeOrgId, db);
  if (role === null) {
    return err(
      "REFERENCE",
      ROLE_NOT_FOUND_CODE,
      "role_id does not resolve to a role of this organization.",
    );
  }

  // (4) Invitee resolution — the frozen `email` invitee identifier against the LIVE
  //     `identity.users` email (see header: fail-closed; no frozen leg covers a non-resolving
  //     email; the reject discloses nothing beyond "not invitable").
  const invitee = await findLiveUserIdByEmail(normalizeEmail(input.email), db);
  if (invitee === null) {
    return err(
      "VALIDATION",
      INVALID_INPUT_CODE,
      "email does not identify an invitable platform account.",
    );
  }

  // (5) BUSINESS — "not already an active/pending member" (§C6 PassB:350, verbatim conjunct) →
  //     the frozen CONFLICT `identity_membership_already_exists`. A live `invited`/`suspended`
  //     row is ALSO a standing membership row under the Doc-2 §10.2 partial-unique-live index —
  //     same frozen code (a membership already exists; reinstate/accept are the paths, not a
  //     duplicate invite) [logged judgment call]. A live `removed` row is the frozen re-invite
  //     case: tombstone it (marker only) and mint the NEW membership (header).
  let supersededMembershipId: string | null = null;
  const existing = await findLiveMembershipForUserInOrg(invitee.userId, ctx.activeOrgId, db);
  if (existing !== null) {
    if (existing.state !== "removed") {
      return err(
        "CONFLICT",
        ALREADY_EXISTS_CODE,
        "a membership already exists for this member in this organization.",
      );
    }
    const tombstoned = await tombstoneRemovedMembership(
      {
        membershipId: existing.membershipId,
        actorUserId: ctx.userId,
        reason: REINVITE_TOMBSTONE_REASON,
      },
      db,
    );
    if (!tombstoned) {
      // The removed row moved/vanished under a concurrent writer — losing duplicate (frozen code).
      return err(
        "CONFLICT",
        ALREADY_EXISTS_CODE,
        "a membership already exists for this member in this organization.",
      );
    }
    supersededMembershipId = existing.membershipId;
  }

  // (6) WRITE — the `→ invited` row (Doc-2 §5.2; Mutation-Scope `identity.memberships` only). A
  //     concurrent different-key duplicate racing past (5) hits the partial-unique-live index —
  //     mapped to the frozen CONFLICT code (the register itself assigns the class).
  let created: Awaited<ReturnType<typeof insertInvitedMembership>>;
  try {
    created = await insertInvitedMembership(
      {
        organizationId: ctx.activeOrgId,
        userId: invitee.userId,
        roleId: role.roleId,
        department: input.department?.trim() ?? null,
        actorUserId: ctx.userId,
      },
      db,
    );
  } catch (e) {
    if (isUniqueViolation(e)) {
      return err(
        "CONFLICT",
        ALREADY_EXISTS_CODE,
        "a membership already exists for this member in this organization.",
      );
    }
    throw e;
  }

  // (7) AUDIT — the ENUMERATED §9 "membership invite" action, atomic (same tx; D7). Payload =
  //     ids + the membership field set only (no email/PII value — Doc-6A §12 ids+meta).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: MEMBERSHIP_ENTITY_TYPE,
      entityId: created.membershipId,
      action: MembershipAuditAction.INVITED,
      oldValue: null,
      newValue: {
        ...created.fieldSet,
        ...(supersededMembershipId !== null
          ? { superseded_membership_id: supersededMembershipId }
          : {}),
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { membershipId: created.membershipId, state: "invited" } };
}

/** Prisma P2002 (unique-constraint violation) discrimination — the partial-unique-live index. */
function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" && e !== null && "code" in e && (e as { code?: unknown }).code === "P2002"
  );
}

function err(
  errorClass: "VALIDATION" | "AUTHORIZATION" | "REFERENCE" | "CONFLICT",
  errorCode: string,
  message: string,
): InviteMemberOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
