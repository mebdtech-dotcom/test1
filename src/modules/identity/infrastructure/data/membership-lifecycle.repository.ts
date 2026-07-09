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

/**
 * Resolve the Last-Owner-Protection facts for a proposed Owner-disabling mutation on `targetMembershipId` in
 * `orgId` (Doc-4C §C5/§C6 BUSINESS gate; Master Architecture §5.5). "Owner" = an ACTIVE membership bound to
 * the seeded Owner system-bundle role. Returns `targetIsActiveOwner` + the count of OTHER active Owners
 * (excluding the target). When the Owner system-bundle role is unresolvable, fail CLOSED by throwing
 * `UnresolvableOwnerRoleError` — NEVER fabricate never-block facts, which would let the sole real Owner be
 * disabled (fail-open on a lockout surface). The W2-IDN-6.2 commands call this, hand the facts to
 * `evaluateLastOwnerProtection`, and enforce the verdict (an unresolvable prerequisite aborts the mutation).
 */
export async function resolveOwnerRemovalFacts(
  orgId: string,
  targetMembershipId: string,
  db: DbExecutor = prisma,
): Promise<LastOwnerProtectionFacts> {
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
