// M1 infrastructure (PRIVATE) — the `identity.memberships` lifecycle repository (Doc-2 §10.2 / Doc-6C §3.3).
// M1 reading/writing its OWN schema (allowed); other modules reach this only via the M1 contracts facade.
//
// The app-layer authorization checks are PRIMARY (Doc-4C §C6; Doc-6C §6.2a). RLS (org-anchor + staff leg) is
// the backstop proven at IDN-1. The two System timers run under `app.is_platform_staff = 'true'` (set
// transaction-local by their commands — the M0 outbox-worker pattern), so the memberships-write RLS + the
// audit `WITH CHECK` System/staff leg both admit the write. This repository owns the SQL and knows NOTHING of
// audit policy — it returns DATA (the old/new field sets + resolved owner facts) so the COMMAND appends the
// audit and the POLICY module DECIDES.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { MembershipState } from "../../domain/state-machines/membership.state-machine";
import type { OrganizationStatus } from "../../domain/state-machines/organization.state-machine";
import type { UserStatus } from "../../domain/state-machines/user.state-machine";
import type { LastOwnerProtectionFacts } from "../../domain/policies/last-owner-protection.policy";

/** The seeded Owner system-bundle role identity (Doc-6C §5.2 / migration seed): `name = 'Owner'`,
 *  `organization_id IS NULL`, `is_system_bundle = true`. Bound by its FROZEN seed identity, never coined. */
const OWNER_SYSTEM_BUNDLE_ROLE_NAME = "Owner" as const;

/**
 * Thrown when the seeded Owner system-bundle role cannot be resolved while computing Last-Owner-Protection
 * facts. The role is migration-seeded and always present (IDN-1); its absence is an IMPOSSIBLE state that
 * corrupts the guard's prerequisite. We surface it loudly (the `durationToMs` idiom) rather than fabricate
 * "no owner" facts — fabricating them would fail OPEN on a lockout surface (Master Architecture §5.5:
 * "Organizations must never become ownerless"). The owning command lets this abort the mutation.
 */
export class UnresolvableOwnerRoleError extends Error {
  constructor() {
    super(
      `Last-Owner-Protection prerequisite unresolvable: the seeded Owner system-bundle role ` +
        `(name='${OWNER_SYSTEM_BUNDLE_ROLE_NAME}', organization_id IS NULL, is_system_bundle=true) ` +
        `was not found (IDN-1 seed missing/corrupted).`,
    );
    this.name = "UnresolvableOwnerRoleError";
  }
}

/** The audited membership field set (Doc-2 §10.2) — the `old_value`/`new_value` audit shape. */
export interface MembershipFieldSet {
  state: MembershipState;
  userId: string;
  roleId: string;
  department: string | null;
}

/** A membership row the invite-expiry sweep found lapsed (`invited`, `created_at` past the window). */
export interface ExpirableInvitationRow {
  id: string;
  organizationId: string;
  fieldSet: MembershipFieldSet;
}

/** A `pending` membership loaded for activation, with the org/user status the precondition needs. */
export interface ActivatableMembershipRow {
  id: string;
  organizationId: string;
  state: MembershipState;
  /** The owning org's lifecycle status (the "org not suspended" activation precondition, Doc-4C §C6). */
  orgStatus: OrganizationStatus;
  /** The bound user's lifecycle status (the "user not suspended" activation precondition, Doc-4C §C6). */
  userStatus: UserStatus;
  fieldSet: MembershipFieldSet;
}

function fieldSetOf(row: {
  state: MembershipState;
  userId: string;
  roleId: string;
  department: string | null;
}): MembershipFieldSet {
  return { state: row.state, userId: row.userId, roleId: row.roleId, department: row.department };
}

/**
 * Find `invited` memberships whose invite window has lapsed: `state = 'invited'`, live, and `created_at` at or
 * BEFORE the cutoff (`now − windowMs`). The window is the POLICY value the command resolves
 * (`identity.membership_invite_expiry_window`) — this repo never invents a window; it takes the computed
 * `cutoff`. The `state = 'invited'`-only filter IS the idempotency guard (a removed invitation is never
 * re-expired). Ordered oldest-first; capped at `batchSize`.
 */
export async function findExpirableInvitations(
  cutoff: Date,
  batchSize: number,
  db: DbExecutor = prisma,
): Promise<ExpirableInvitationRow[]> {
  const rows = await db.membership.findMany({
    where: { state: "invited", deletedAt: null, createdAt: { lte: cutoff } },
    orderBy: { createdAt: "asc" },
    take: batchSize,
    select: {
      id: true,
      organizationId: true,
      state: true,
      userId: true,
      roleId: true,
      department: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    fieldSet: fieldSetOf({ ...row, state: row.state as MembershipState }),
  }));
}

/**
 * Load a membership for activation (`activate_membership`), joined to its org + user status for the
 * verification-complete BUSINESS precondition. `null` ⇒ no such live membership. The caller checks
 * `state === 'pending'` on the machine and the org/user-not-suspended precondition; a membership already
 * `active` is the idempotent no-op (Doc-4C §C6).
 */
export async function loadMembershipForActivation(
  membershipId: string,
  db: DbExecutor = prisma,
): Promise<ActivatableMembershipRow | null> {
  const row = await db.membership.findFirst({
    where: { id: membershipId, deletedAt: null },
    select: {
      id: true,
      organizationId: true,
      state: true,
      userId: true,
      roleId: true,
      department: true,
      organization: { select: { orgStatus: true } },
      user: { select: { status: true } },
    },
  });
  if (row === null) return null;
  return {
    id: row.id,
    organizationId: row.organizationId,
    state: row.state as MembershipState,
    orgStatus: row.organization.orgStatus as OrganizationStatus,
    userStatus: row.user.status as UserStatus,
    fieldSet: fieldSetOf({ ...row, state: row.state as MembershipState }),
  };
}

/**
 * Advance a membership's state `from → to` under a WRITE-TIME compare-and-set on the source state (the
 * concurrency + terminal-state guard: a row already moved on by a concurrent pass matches zero rows). The
 * COMMAND has already asserted `from → to` on the state machine; this only writes the legal edge. Returns
 * `null` when zero rows matched (lost race / state already changed) so the command surfaces STATE / a no-op.
 * On success returns the new `updated_at` + the old/new field sets. `actorUserId = null` for System timers.
 * On the `→ removed` edge the row's soft-delete markers are NOT set — `removed` is a lifecycle state, and
 * "removed retains audit" (Doc-2 §10.2); the state column is the authority.
 */
export async function transitionMembershipState(
  params: {
    id: string;
    from: MembershipState;
    to: MembershipState;
    actorUserId: string | null;
  },
  db: DbExecutor = prisma,
): Promise<{
  updatedAt: Date;
  oldValue: MembershipFieldSet;
  newValue: MembershipFieldSet;
} | null> {
  const current = await db.membership.findFirst({
    where: { id: params.id, state: params.from, deletedAt: null },
    select: { state: true, userId: true, roleId: true, department: true },
  });
  if (current === null) return null;
  const oldValue = fieldSetOf({ ...current, state: current.state as MembershipState });

  const advanced = await db.membership.updateMany({
    where: { id: params.id, state: params.from, deletedAt: null },
    data: { state: params.to, updatedBy: params.actorUserId },
  });
  if (advanced.count !== 1) return null;

  const after = await db.membership.findFirst({
    where: { id: params.id },
    select: { state: true, updatedAt: true, userId: true, roleId: true, department: true },
  });
  if (after === null) return null;
  return {
    updatedAt: after.updatedAt,
    oldValue,
    newValue: fieldSetOf({ ...after, state: after.state as MembershipState }),
  };
}

/** Resolve the seeded Owner system-bundle role (Doc-6C §5.2 migration seed) or throw the loud
 *  fail-closed `UnresolvableOwnerRoleError` (never fabricate never-block facts — see class doc).
 *  Shared by every §5.5 fact resolver AND the W2-IDN-6.2 ownership commands (transfer/recovery need
 *  the role id for the Owner (re)assignment write itself). */
export async function findOwnerSystemBundleRole(db: DbExecutor = prisma): Promise<{ id: string }> {
  const ownerRole = await db.role.findFirst({
    where: {
      name: OWNER_SYSTEM_BUNDLE_ROLE_NAME,
      organizationId: null,
      isSystemBundle: true,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (ownerRole === null) {
    throw new UnresolvableOwnerRoleError();
  }
  return ownerRole;
}

/**
 * The RV-0150 T6-F1 SET-LEVEL LOCK — `SELECT … FOR UPDATE` over the org's ACTIVE Owner membership
 * rows, inside the caller-supplied transaction. ONE statement shared by every §5.5 fact resolver
 * (removal, transfer succession, admin recovery) so ALL Owner-disabling/Owner-assigning mutations on
 * one org serialize on the SAME lock set. A no-op outside an interactive transaction — callers MUST
 * pass their OWN `tx` (the documented serialization contract). Same-schema, module-own table; the
 * only raw statements in this repo; values bound as params, never interpolated.
 */
async function lockActiveOwnerRows(
  orgId: string,
  ownerRoleId: string,
  db: DbExecutor,
): Promise<void> {
  await db.$queryRaw`
    SELECT id
    FROM identity.memberships
    WHERE organization_id = ${orgId}::uuid
      AND role_id = ${ownerRoleId}::uuid
      AND state = 'active'
      AND deleted_at IS NULL
    FOR UPDATE
  `;
}

/**
 * Resolve the Last-Owner-Protection facts for a proposed Owner-disabling mutation on `targetMembershipId` in
 * `orgId` (Doc-4C §C5/§C6 BUSINESS gate; Master Architecture §5.5). "Owner" = an ACTIVE membership bound to
 * the seeded Owner system-bundle role. Returns `targetIsActiveOwner` + the count of OTHER active Owners
 * (excluding the target). When the Owner system-bundle role is unresolvable, fail CLOSED by throwing
 * `UnresolvableOwnerRoleError` — NEVER fabricate never-block facts, which would let the sole real Owner be
 * disabled (fail-open on a lockout surface).
 *
 * SERIALIZATION CONTRACT (RV-0150 T6-F1): the facts MUST be resolved AND the guarded write applied within
 * ONE transaction. The resolver LOCKS the org's active-Owner membership rows (`SELECT … FOR UPDATE`) before
 * counting, so concurrent Owner-disabling mutations against the same org SERIALIZE — the second transaction
 * blocks until the first commits, then re-reads and cannot race a check-then-act to an ownerless org (per-row
 * compare-and-set alone cannot help when two removals target DISTINCT owner rows). The lock is a no-op
 * outside an interactive transaction, so the W2-IDN-6.2 commands MUST pass their OWN `tx` as `db` and hand
 * the facts to `evaluateLastOwnerProtection` (and, for a transfer, `evaluateOwnershipSuccession`, whose
 * `resultingActiveOwnerCount` inherits the same class) inside that SAME transaction; an unresolvable
 * prerequisite aborts the mutation.
 */
export async function resolveOwnerRemovalFacts(
  orgId: string,
  targetMembershipId: string,
  db: DbExecutor = prisma,
): Promise<LastOwnerProtectionFacts> {
  const ownerRole = await findOwnerSystemBundleRole(db);

  // SERIALIZATION (RV-0150 T6-F1) — lock the org's active-Owner membership rows FOR UPDATE inside the
  // caller-supplied transaction BEFORE counting. Without this, two concurrent Owner-disabling mutations on
  // the same org each read `otherActiveOwnerCount = 1` and both proceed → ownerless org; distinct target rows
  // defeat per-row compare-and-set, so a SET-level lock on the org's active Owners is what serializes them
  // (the second tx blocks here until the first commits, then observes the committed removal). Same-schema,
  // module-own table; values bound as params, never interpolated.
  await lockActiveOwnerRows(orgId, ownerRole.id, db);

  const target = await db.membership.findFirst({
    where: {
      id: targetMembershipId,
      organizationId: orgId,
      roleId: ownerRole.id,
      state: "active",
      deletedAt: null,
    },
    select: { id: true },
  });

  const otherActiveOwnerCount = await db.membership.count({
    where: {
      organizationId: orgId,
      roleId: ownerRole.id,
      state: "active",
      deletedAt: null,
      id: { not: targetMembershipId },
    },
  });

  return { targetIsActiveOwner: target !== null, otherActiveOwnerCount };
}

/** The facts `admin_recover_ownership` resolves under the RV-0150 lock (Doc-4C §C5 BUSINESS:
 *  "recovery only where no active Owner can act, §5.5; result satisfies Last Owner Protection"). */
export interface OwnershipRecoveryFacts {
  /** ACTIVE Owner memberships whose bound USER is itself `active` (an Owner who "can act" — §5.5:
   *  succession applies when "an owner account becomes disabled, deleted, or suspended"). */
  actingActiveOwnerCount: number;
  /** The Owner system-bundle role id (for the recovery (re)assignment write). */
  ownerRoleId: string;
  /** The nominee's live membership in the org, when one exists (`null` ⇒ none — the frozen
   *  "membership creatable" REFERENCE leg applies). */
  nomineeMembership: { membershipId: string; state: MembershipState } | null;
  /** The nominee user's lifecycle status; `null` ⇒ no live `identity.users` row (REFERENCE failure). */
  nomineeUserStatus: UserStatus | null;
}

/**
 * Resolve the `admin_recover_ownership` facts (Doc-4C §C5; Master Architecture §5.5 succession).
 *
 * SERIALIZATION CONTRACT (RV-0150 T6-F1 — the recovery leg): takes the SAME set-level FOR-UPDATE lock
 * on the org's active-Owner rows as `resolveOwnerRemovalFacts`, inside the caller-supplied
 * transaction, so a recovery serializes against every concurrent Owner-disabling/Owner-assigning
 * mutation on the org (two racing recoveries: the second blocks, re-reads, sees the first's committed
 * Owner and fails the "no active Owner can act" precondition — never a double recovery). The owning
 * command MUST pass its OWN `tx` and decide via the pure §5.5 policies inside that SAME transaction.
 * An unresolvable Owner role fails CLOSED (`UnresolvableOwnerRoleError`).
 *
 * PREMISE (RV-0155 O1 — named for every future consumer, esp. the 6.3 `remove_member` /
 * `set_membership_status` builder): the FOR-UPDATE serialization presumes a NON-EMPTY lock set —
 * `SELECT … FOR UPDATE` over ZERO rows locks nothing, so two concurrent mutations on an org whose
 * active-Owner ROW set is empty would not block each other on this statement. Safety today is
 * carried by the Last-Owner INVARIANT itself: every reachable LIVE org retains ≥ 1 active-state
 * Owner membership ROW (creation mints the founding Owner; the §5.5-guarded departure can remove
 * only a NON-sole owner's row, leaving ≥ 1 behind; a disabled owner ACCOUNT leaves its membership
 * row `active` and therefore IN the lock set — the orphaned-org recovery case still locks; the
 * org-delete cascade touches only an already-soft-deleted org). A future command that empties the
 * active-Owner ROW set of a LIVE org (e.g. a 6.3 owner-membership suspend/remove realization)
 * breaks this premise for CONCURRENT recoveries — Flag-and-Halt / extend the lock strategy first,
 * never ship it unguarded.
 */
export async function resolveOwnershipRecoveryFacts(
  orgId: string,
  newOwnerUserId: string,
  db: DbExecutor = prisma,
): Promise<OwnershipRecoveryFacts> {
  const ownerRole = await findOwnerSystemBundleRole(db);

  // The RV-0150 lock — same statement, same lock set as the removal/transfer resolvers.
  await lockActiveOwnerRows(orgId, ownerRole.id, db);

  // Owners who CAN ACT: active Owner membership × active user (§5.5 — a suspended/departed owner
  // cannot act; a departed owner's membership is already `removed` by the deactivate command).
  const actingActiveOwnerCount = await db.membership.count({
    where: {
      organizationId: orgId,
      roleId: ownerRole.id,
      state: "active",
      deletedAt: null,
      user: { status: "active", deletedAt: null },
    },
  });

  const nomineeUser = await db.user.findFirst({
    where: { id: newOwnerUserId, deletedAt: null },
    select: { status: true },
  });

  const nomineeMembership = await db.membership.findFirst({
    where: { userId: newOwnerUserId, organizationId: orgId, deletedAt: null },
    select: { id: true, state: true },
  });

  return {
    actingActiveOwnerCount,
    ownerRoleId: ownerRole.id,
    nomineeMembership:
      nomineeMembership === null
        ? null
        : {
            membershipId: nomineeMembership.id,
            state: nomineeMembership.state as MembershipState,
          },
    nomineeUserStatus: nomineeUser === null ? null : (nomineeUser.status as UserStatus),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// W2-IDN-6.3 — the §C6 wired-command legs (Doc-4C §C6; Doc-5C §5.1 rows 12–16). Read/write SQL only;
// the commands own the frozen validation order, the machine consult, and the audit append.
// ─────────────────────────────────────────────────────────────────────────────

/** A live membership row loaded for a §C6 command (SCOPE + concurrency + state inputs). */
export interface MembershipRow {
  id: string;
  organizationId: string;
  state: MembershipState;
  /** The row's `updated_at` (the caller's stale-view check + the losing-write ETag re-read). */
  updatedAt: Date;
  fieldSet: MembershipFieldSet;
}

function toMembershipRow(row: {
  id: string;
  organizationId: string;
  state: string;
  updatedAt: Date;
  userId: string;
  roleId: string;
  department: string | null;
}): MembershipRow {
  return {
    id: row.id,
    organizationId: row.organizationId,
    state: row.state as MembershipState,
    updatedAt: row.updatedAt,
    fieldSet: fieldSetOf({ ...row, state: row.state as MembershipState }),
  };
}

const MEMBERSHIP_ROW_SELECT = {
  id: true,
  organizationId: true,
  state: true,
  updatedAt: true,
  userId: true,
  roleId: true,
  department: true,
} as const;

/** The tenant SCOPE load (set_membership_status / remove_member / revoke_invitation): the live
 *  membership `{id}` INSIDE `orgId` (the caller's server-resolved active org). `null` = absent OR
 *  foreign — the caller collapses both to the byte-identical `NOT_FOUND` (§B.4 SCOPE / §7.5). */
export async function findMembershipInOrg(
  membershipId: string,
  orgId: string,
  db: DbExecutor = prisma,
): Promise<MembershipRow | null> {
  const row = await db.membership.findFirst({
    where: { id: membershipId, organizationId: orgId, deletedAt: null },
    select: MEMBERSHIP_ROW_SELECT,
  });
  return row === null ? null : toMembershipRow(row);
}

/** The invitee SCOPE load (`accept_invitation` — the frozen "membership_id + identity match" leg,
 *  Doc-4C §C6 PassB:363): the live membership `{id}` BOUND TO the authenticated caller. `null` =
 *  absent OR someone else's invitation — byte-identical `NOT_FOUND` collapse (PassB:366 "wrong/
 *  foreign invitation collapses"). */
export async function findMembershipForInvitee(
  membershipId: string,
  inviteeUserId: string,
  db: DbExecutor = prisma,
): Promise<MembershipRow | null> {
  const row = await db.membership.findFirst({
    where: { id: membershipId, userId: inviteeUserId, deletedAt: null },
    select: MEMBERSHIP_ROW_SELECT,
  });
  return row === null ? null : toMembershipRow(row);
}

/** Resolve the invitee's live `identity.users` row by email (`invite_member` — the frozen
 *  `email : invitee identifier (auth-managed)` resolution; Doc-2 §10.2 `email UNIQUE WHERE
 *  deleted_at IS NULL`). `null` = no live account for that email (the command fails CLOSED). */
export async function findLiveUserIdByEmail(
  email: string,
  db: DbExecutor = prisma,
): Promise<{ userId: string } | null> {
  const row = await db.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true },
  });
  return row === null ? null : { userId: row.id };
}

/** The `invite_member` role REFERENCE (§B.9 "role_id same-tenant existence"): a live role owned by
 *  `orgId` OR a platform system bundle (`organization_id IS NULL AND is_system_bundle` — the seeded
 *  Owner/Director/Manager/Officer composition rows memberships already reference, Doc-6C §5.2).
 *  A foreign org's role resolves `null` — same code as nonexistent (no cross-tenant role, §C6). */
export async function findInvitableRole(
  roleId: string,
  orgId: string,
  db: DbExecutor = prisma,
): Promise<{ roleId: string } | null> {
  const row = await db.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null,
      OR: [{ organizationId: orgId }, { organizationId: null, isSystemBundle: true }],
    },
    select: { id: true },
  });
  return row === null ? null : { roleId: row.id };
}

/** The `invite_member` BUSINESS probe: the (user × org) LIVE membership row, any state (the
 *  Doc-2 §10.2 `UNIQUE(user_id, organization_id) WHERE deleted_at IS NULL` subject). */
export async function findLiveMembershipForUserInOrg(
  userId: string,
  orgId: string,
  db: DbExecutor = prisma,
): Promise<{ membershipId: string; state: MembershipState } | null> {
  const row = await db.membership.findFirst({
    where: { userId, organizationId: orgId, deletedAt: null },
    select: { id: true, state: true },
  });
  return row === null ? null : { membershipId: row.id, state: row.state as MembershipState };
}

/**
 * Tombstone a LIVE `removed` membership row so a re-invite can mint the frozen "NEW membership"
 * (Doc-4C §C6 PassB:413 "re-invite creates a new membership" against the Doc-2 §10.2 partial-unique
 * live index). MARKER TUPLE ONLY — the `removed` state is terminal and stays byte-untouched (the
 * 6.2 org-cascade marker precedent); audit rows are retained (Doc-2 §10.2). Compare-and-set on
 * `state = 'removed'` + live: a row that moved/vanished matches zero rows (`false`).
 */
export async function tombstoneRemovedMembership(
  params: { membershipId: string; actorUserId: string; reason: string },
  db: DbExecutor = prisma,
): Promise<boolean> {
  const written = await db.membership.updateMany({
    where: { id: params.membershipId, state: "removed", deletedAt: null },
    data: {
      deletedAt: new Date(),
      deletedBy: params.actorUserId,
      deleteReason: params.reason,
    },
  });
  return written.count === 1;
}

/** Insert the `→ invited` membership row (`invite_member` State Effects — Doc-2 §5.2 `→ invited`;
 *  Mutation-Scope `identity.memberships` ONLY). Throws Prisma P2002 on the partial-unique-live
 *  index when a concurrent invite won the (user × org) row — the command maps it to the frozen
 *  `identity_membership_already_exists` CONFLICT. */
export async function insertInvitedMembership(
  params: {
    organizationId: string;
    userId: string;
    roleId: string;
    department: string | null;
    actorUserId: string;
  },
  db: DbExecutor = prisma,
): Promise<{ membershipId: string; fieldSet: MembershipFieldSet }> {
  const membershipId = uuidv7(); // M0 ID generator — never a raw UUID in app code.
  const row = await db.membership.create({
    data: {
      id: membershipId,
      organizationId: params.organizationId,
      userId: params.userId,
      roleId: params.roleId,
      state: "invited",
      department: params.department,
      createdBy: params.actorUserId,
      updatedBy: params.actorUserId,
    },
    select: { state: true, userId: true, roleId: true, department: true },
  });
  return {
    membershipId,
    fieldSet: fieldSetOf({ ...row, state: row.state as MembershipState }),
  };
}

/** Re-read a membership's CURRENT `updated_at` (the Doc-5A §9.5 current-token carriage on a
 *  losing-write leg — the 6.5 lost-CAS re-read precedent). `null` when the row is gone. */
export async function readMembershipUpdatedAt(
  membershipId: string,
  db: DbExecutor = prisma,
): Promise<Date | null> {
  const row = await db.membership.findFirst({
    where: { id: membershipId },
    select: { updatedAt: true },
  });
  return row === null ? null : row.updatedAt;
}
