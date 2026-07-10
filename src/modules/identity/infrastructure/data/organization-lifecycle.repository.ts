// M1 infrastructure (PRIVATE) — the `identity.organizations` lifecycle repository for the §C5 wired
// organization commands (W2-IDN-6.2; Doc-2 §10.2 / Doc-6C §3.2). M1 reading/writing its OWN schema
// (allowed); other modules reach this only via the M1 contracts facade.
//
// D7 pattern (REFERENCE_Audited_Write_Pattern_v1.0 rules 2–3): this repository OWNS the SQL and knows
// NOTHING of audit policy — it returns DATA (old/new field sets + the new `updated_at`) so the COMMAND
// chooses the audit action and the M0 facade performs the append. App-layer checks are PRIMARY; the
// Doc-6C §6.2a org-anchor RLS (tenant leg + staff backstop) is the row backstop, never the model.
//
// CONCURRENCY: every org-row mutation is a WRITE-TIME compare-and-set on `updated_at` (+ the source
// status where a §5.1 edge is written) — the `user-account.repository` CAS shape. Each CAS-conflict
// outcome re-reads and returns the row's CURRENT `updated_at` (Doc-5A §9.5 current-token carriage →
// the wire `ETag`) so the caller can re-read-retry (§9.6).
//
// SOFT-DELETE CASCADE (Doc-2 §5.1 / Doc-4C §C5): ONLY the in-module `identity.memberships` leg is
// realized ("memberships → soft-deleted"); every cross-module leg (vendor profile → suspended, RFQs →
// archived) is OUT-OF-WIRE and DC-1-BLOCKED (Doc-5C §7.4) — no identity event, no cross-module write.
// The cascade marks each membership's soft-delete tuple with `ORG_SOFT_DELETE_CASCADE_REASON` so the
// §5.1 restore can reverse EXACTLY the rows this cascade touched (membership `state` is untouched —
// Doc-2 §5.2 defines no `soft_deleted` membership state; the SD tuple is the cascade vehicle).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { OrganizationStatus } from "../../domain/state-machines/organization.state-machine";

/**
 * The cascade marker written into `memberships.delete_reason` by the org soft-delete (Doc-2 §0.2
 * `delete_reason` is free text — a stable operational marker, not a coined business enum; the
 * deactivate command's `DEPARTURE_DELETE_REASON` precedent). Restore reverses ONLY rows carrying it.
 */
export const ORG_SOFT_DELETE_CASCADE_REASON =
  "organization soft delete cascade (Doc-2 §5.1)" as const;

/** A CAS-conflict outcome carrying the org row's CURRENT concurrency token (Doc-5A §9.5); absent
 *  only when the live row vanished mid-flight (the caller's response simply omits `ETag`). */
export interface OrgCasConflict {
  outcome: "conflict";
  currentUpdatedAt?: Date;
}

/** Re-read the live org row's current `updated_at` for a §9.5 conflict response. */
async function currentOrgToken(orgId: string, db: DbExecutor): Promise<OrgCasConflict> {
  const row = await db.organization.findFirst({
    where: { id: orgId, deletedAt: null },
    select: { updatedAt: true },
  });
  return row === null
    ? { outcome: "conflict" }
    : { outcome: "conflict", currentUpdatedAt: row.updatedAt };
}

/** An `identity.organizations` row loaded for a §C5 mutation (the Doc-2 §10.2 field set the
 *  commands need — identity, lifecycle, the concurrency token, slug facts). */
export interface OrganizationRow {
  organizationId: string;
  humanRef: string;
  name: string;
  slug: string;
  orgStatus: OrganizationStatus;
  isPersonalOrg: boolean;
  updatedAt: Date;
  /** Non-null ⇒ the row is soft-deleted (the §5.1 `soft_deleted` state's SD tuple). */
  deletedAt: Date | null;
}

function rowOf(row: {
  id: string;
  humanRef: string;
  name: string;
  slug: string;
  orgStatus: string;
  isPersonalOrg: boolean;
  updatedAt: Date;
  deletedAt: Date | null;
}): OrganizationRow {
  return {
    organizationId: row.id,
    humanRef: row.humanRef,
    name: row.name,
    slug: row.slug,
    orgStatus: row.orgStatus as OrganizationStatus,
    isPersonalOrg: row.isPersonalOrg,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

const ORG_SELECT = {
  id: true,
  humanRef: true,
  name: true,
  slug: true,
  orgStatus: true,
  isPersonalOrg: true,
  updatedAt: true,
  deletedAt: true,
} as const;

/**
 * Load an organization row for a §C5 mutation. `includeSoftDeleted` widens to the `soft_deleted`
 * state (the restore contract's ONLY legal source — every other command loads live rows). `null` ⇒
 * absent / outside the requested liveness (the caller collapses per its register).
 */
export async function loadOrganizationRow(
  orgId: string,
  opts: { includeSoftDeleted: boolean },
  db: DbExecutor = prisma,
): Promise<OrganizationRow | null> {
  const row = await db.organization.findFirst({
    where: { id: orgId, ...(opts.includeSoftDeleted ? {} : { deletedAt: null }) },
    select: ORG_SELECT,
  });
  return row === null ? null : rowOf(row);
}

/** The caller's live PERSONAL org (the Solo-Trader auto-created org the user is a member of) — the
 *  §C5 duplicate-personal-org guard's fact (the provisioning idempotent-path shape). */
export async function findLivePersonalOrgForUser(
  userId: string,
  db: DbExecutor = prisma,
): Promise<{ organizationId: string } | null> {
  const row = await db.organization.findFirst({
    where: {
      isPersonalOrg: true,
      deletedAt: null,
      memberships: { some: { userId, deletedAt: null } },
    },
    select: { id: true },
  });
  return row === null ? null : { organizationId: row.id };
}

/**
 * Derive the org slug from the never-reused `human_ref` (`ORG-YYYY-NNNNNN` → lowercase) — the
 * WP-1.3 provisioning derivation, reused verbatim (unique-forever because Module 0 never reuses a
 * ref, Doc-2 §0.1; a collision is reachable only against a soft-deleted row's slug, which the §5.1
 * restore-conflict regeneration rule owns).
 */
export function deriveOrgSlugFromHumanRef(humanRef: string): string {
  return humanRef.toLowerCase();
}

/**
 * Insert the organization row + the founding Owner membership IN THE CALLER'S TRANSACTION
 * (Doc-4C §C5: "founding `memberships` Owner row created in the same transaction"; Doc-2 §5.1
 * `→ active`). The caller has already: allocated `humanRef` via the M0 contract service on the
 * SAME executor (atomic — "no second ref on replay"), resolved the seeded Owner role, MINTED
 * `organizationId` (M0 UUIDv7), and set `app.active_org` to it TRANSACTION-LOCAL (RV-0155 F1 —
 * the WP-1.3 post-mint GUC precedent, `provision-identity.command.ts`), so the founding-membership
 * INSERT is admitted by its PRIMARY tenant leg (`memberships_insert` WITH CHECK
 * `org = active_org`) and the audit row by the ADR-021 tenant leg (`org = active_org AND
 * actor = user_id AND actor_type = 'user'`) — never the staff backstop alone.
 */
export async function insertOrganizationWithFoundingOwner(
  params: {
    /** Minted by the COMMAND (M0 UUIDv7) — `app.active_org` is already pinned to it (see above). */
    organizationId: string;
    creatorUserId: string;
    ownerRoleId: string;
    humanRef: string;
    name: string;
    isPersonalOrg: boolean;
  },
  db: DbExecutor = prisma,
): Promise<{ organizationId: string; ownerMembershipId: string; orgStatus: "active" }> {
  const { organizationId } = params;
  await db.organization.create({
    data: {
      id: organizationId,
      humanRef: params.humanRef,
      name: params.name,
      slug: deriveOrgSlugFromHumanRef(params.humanRef),
      orgStatus: "active",
      isPersonalOrg: params.isPersonalOrg,
      verificationLevel: "unverified",
      createdBy: params.creatorUserId,
      updatedBy: params.creatorUserId,
    },
  });

  const ownerMembershipId = uuidv7();
  await db.membership.create({
    data: {
      id: ownerMembershipId,
      organizationId,
      userId: params.creatorUserId,
      roleId: params.ownerRoleId,
      state: "active", // the founding-membership class (WP-1.3 precedent; Doc-4C §C5 bootstrap)
      joinedAt: new Date(),
      createdBy: params.creatorUserId,
      updatedBy: params.creatorUserId,
    },
  });

  return { organizationId, ownerMembershipId, orgStatus: "active" };
}

/** The org-profile fields `update_organization_profile` may write (Doc-4C §C5 PassB:257). ONLY
 *  `name` has a realized Doc-2 §10.2 / Doc-6C §3.2 column — `address`/`contact_info`/
 *  `brand_assets_ref` have NO organizations column and are FAIL-CLOSED at the command (the
 *  `approval_settings`/`ESC-IDN-PREF-KEYS` deferred-field posture; carried in the report). */
export interface OrganizationProfilePatch {
  name?: string;
}

/**
 * Apply the `update_organization_profile` partial write under a CAS on `updated_at` (the §C5
 * `Concurrency: optimistic` contract — the ONE §C5 contract declaring it). Returns the new token on
 * success; `"conflict"` (+ the current token, §9.5) when stale; `"not_found"` when no live row.
 */
export async function updateOrganizationProfileFields(
  params: {
    orgId: string;
    actorUserId: string;
    expectedUpdatedAt: Date;
    patch: OrganizationProfilePatch;
  },
  db: DbExecutor = prisma,
): Promise<
  | { outcome: "updated"; updatedAt: Date; oldValue: { name: string }; newValue: { name: string } }
  | OrgCasConflict
  | { outcome: "not_found" }
> {
  const current = await db.organization.findFirst({
    where: { id: params.orgId, deletedAt: null },
    select: { name: true },
  });
  if (current === null) return { outcome: "not_found" };

  const data: Record<string, unknown> = { updatedBy: params.actorUserId };
  if (params.patch.name !== undefined) data.name = params.patch.name;

  const written = await db.organization.updateMany({
    where: { id: params.orgId, deletedAt: null, updatedAt: params.expectedUpdatedAt },
    data,
  });
  if (written.count !== 1) return currentOrgToken(params.orgId, db);

  const after = await db.organization.findFirst({
    where: { id: params.orgId },
    select: { updatedAt: true, name: true },
  });
  if (after === null) return { outcome: "conflict" }; // unreachable; fail closed.
  return {
    outcome: "updated",
    updatedAt: after.updatedAt,
    oldValue: { name: current.name },
    newValue: { name: after.name },
  };
}

/**
 * Apply the ownership-transfer writes (Doc-4C §C5 `transfer_ownership` State Effects: "no
 * `organizations` §5.1 transition; reassigns the Owner role on `memberships` in-transaction").
 * MUST run inside the SAME transaction that resolved the §5.5 facts under the RV-0150 lock.
 *
 *   • the nominee's membership role → the seeded Owner system-bundle role;
 *   • the acting membership — WHEN it is itself Owner-bound — takes the nominee's former role (the
 *     least-coining "reassigns the Owner role" realization: the Owner role MOVES; a non-Owner-bound
 *     actor merely exercising the slug keeps its role — logged judgment call);
 *   • the ORG ROW's concurrency token is CAS-advanced (aggregate-root touch: ownership is an
 *     org-level fact; the frozen response's `updated_at : always` is this new token, and the CAS
 *     realizes the register's `identity_org_update_conflict` losing-write leg).
 */
export async function applyOwnershipTransfer(
  params: {
    orgId: string;
    actorUserId: string;
    actorMembershipId: string;
    actorRoleId: string;
    nomineeMembershipId: string;
    nomineeRoleId: string;
    ownerRoleId: string;
    expectedUpdatedAt: Date;
  },
  db: DbExecutor = prisma,
): Promise<{ outcome: "transferred"; updatedAt: Date } | OrgCasConflict> {
  // Aggregate-root CAS first — a stale token / losing writer never touches the membership rows.
  const touched = await db.organization.updateMany({
    where: { id: params.orgId, deletedAt: null, updatedAt: params.expectedUpdatedAt },
    data: { updatedBy: params.actorUserId },
  });
  if (touched.count !== 1) return currentOrgToken(params.orgId, db);

  await db.membership.updateMany({
    where: { id: params.nomineeMembershipId, organizationId: params.orgId, deletedAt: null },
    data: { roleId: params.ownerRoleId, updatedBy: params.actorUserId },
  });

  if (
    params.actorRoleId === params.ownerRoleId &&
    params.actorMembershipId !== params.nomineeMembershipId
  ) {
    await db.membership.updateMany({
      where: { id: params.actorMembershipId, organizationId: params.orgId, deletedAt: null },
      data: { roleId: params.nomineeRoleId, updatedBy: params.actorUserId },
    });
  }

  const after = await db.organization.findFirst({
    where: { id: params.orgId },
    select: { updatedAt: true },
  });
  if (after === null) return { outcome: "conflict" }; // unreachable; fail closed.
  return { outcome: "transferred", updatedAt: after.updatedAt };
}

/**
 * Apply the org soft-delete (Doc-2 §5.1 `active|suspended → soft_deleted`) + the IN-MODULE
 * membership cascade, under a CAS on (source status × `updated_at`). The org row takes the caller's
 * Doc-2 §0.2 SD tuple (`delete_reason` = the request `reason`); each LIVE membership takes the
 * CASCADE marker tuple (state untouched — see header). Cross-module legs: NONE (DC-1).
 */
export async function softDeleteOrganizationWithCascade(
  params: {
    orgId: string;
    actorUserId: string;
    from: OrganizationStatus;
    expectedUpdatedAt: Date;
    reason: string;
  },
  db: DbExecutor = prisma,
): Promise<
  { outcome: "soft_deleted"; cascadedMembershipCount: number; updatedAt: Date } | OrgCasConflict
> {
  const now = new Date();
  const written = await db.organization.updateMany({
    where: {
      id: params.orgId,
      orgStatus: params.from,
      deletedAt: null,
      updatedAt: params.expectedUpdatedAt,
    },
    data: {
      orgStatus: "soft_deleted",
      deletedAt: now,
      deletedBy: params.actorUserId,
      deleteReason: params.reason,
      updatedBy: params.actorUserId,
    },
  });
  if (written.count !== 1) return currentOrgToken(params.orgId, db);

  // In-module cascade (the ONLY authored leg — Doc-4C §C5 State Effects): memberships → soft-deleted.
  const cascaded = await db.membership.updateMany({
    where: { organizationId: params.orgId, deletedAt: null },
    data: {
      deletedAt: now,
      deletedBy: params.actorUserId,
      deleteReason: ORG_SOFT_DELETE_CASCADE_REASON,
      updatedBy: params.actorUserId,
    },
  });

  const after = await db.organization.findFirst({
    where: { id: params.orgId },
    select: { updatedAt: true },
  });
  return {
    outcome: "soft_deleted",
    cascadedMembershipCount: cascaded.count,
    updatedAt: after?.updatedAt ?? now,
  };
}

/**
 * Apply the org restore (Doc-2 §5.1 `soft_deleted → active`; restore-conflict rule: "regenerate
 * reused slugs") + reverse the in-module membership cascade (ONLY rows carrying the cascade marker —
 * pre-existing removed/soft-deleted memberships stay untouched). Cross-module reactivation is DC-1
 * (not authored). CAS on `updated_at` guards the losing concurrent restore (→ STATE, the register's
 * `identity_org_state_invalid`, carrying the current token for the wire `ETag`).
 */
export async function restoreOrganizationWithCascade(
  params: { orgId: string; actorUserId: string; expectedUpdatedAt: Date },
  db: DbExecutor = prisma,
): Promise<
  | {
      outcome: "restored";
      slugRegenerated: boolean;
      restoredMembershipCount: number;
      updatedAt: Date;
    }
  | { outcome: "lost_race"; currentUpdatedAt?: Date }
> {
  const row = await db.organization.findFirst({
    where: { id: params.orgId },
    select: { slug: true, humanRef: true },
  });
  if (row === null) return { outcome: "lost_race" };

  // §5.1 restore-conflict rule: if a LIVE org now holds this slug, regenerate deterministically from
  // the never-reused human_ref (canonical derivation; suffixed with the org id tail if even that is
  // held — unreachable while slugs derive from unique-forever refs, but fail-closed regardless).
  let slug = row.slug;
  let slugRegenerated = false;
  const liveCollision = await db.organization.findFirst({
    where: { slug: row.slug, deletedAt: null, id: { not: params.orgId } },
    select: { id: true },
  });
  if (liveCollision !== null) {
    const canonical = deriveOrgSlugFromHumanRef(row.humanRef);
    const canonicalTaken =
      canonical === row.slug ||
      (await db.organization.findFirst({
        where: { slug: canonical, deletedAt: null, id: { not: params.orgId } },
        select: { id: true },
      })) !== null;
    slug = canonicalTaken ? `${canonical}-${params.orgId.slice(-6)}` : canonical;
    slugRegenerated = true;
  }

  const written = await db.organization.updateMany({
    where: {
      id: params.orgId,
      orgStatus: "soft_deleted",
      updatedAt: params.expectedUpdatedAt,
    },
    data: {
      orgStatus: "active",
      slug,
      deletedAt: null,
      deletedBy: null,
      deleteReason: null,
      updatedBy: params.actorUserId,
    },
  });
  if (written.count !== 1) {
    const current = await db.organization.findFirst({
      where: { id: params.orgId },
      select: { updatedAt: true },
    });
    return current === null
      ? { outcome: "lost_race" }
      : { outcome: "lost_race", currentUpdatedAt: current.updatedAt };
  }

  // Reverse EXACTLY the cascade's rows (marker-scoped — never a pre-existing SD tuple).
  const restored = await db.membership.updateMany({
    where: {
      organizationId: params.orgId,
      deletedAt: { not: null },
      deleteReason: ORG_SOFT_DELETE_CASCADE_REASON,
    },
    data: {
      deletedAt: null,
      deletedBy: null,
      deleteReason: null,
      updatedBy: params.actorUserId,
    },
  });

  const after = await db.organization.findFirst({
    where: { id: params.orgId },
    select: { updatedAt: true },
  });
  return {
    outcome: "restored",
    slugRegenerated,
    restoredMembershipCount: restored.count,
    updatedAt: after?.updatedAt ?? new Date(),
  };
}

/**
 * Apply the Admin `set_organization_status` transition `from → to` under a CAS on BOTH the source
 * status AND `updated_at` (the command has already asserted the edge on the IDN-5 org machine —
 * this only writes the legal edge; the `setUserStatus` shape). A zero-row CAS is the Doc-5A §9.4
 * losing-request case ⇒ carry the current token (§9.5 → wire `ETag`; §9.6 re-read-retry).
 */
export async function setOrganizationStatus(
  params: {
    orgId: string;
    from: OrganizationStatus;
    to: OrganizationStatus;
    expectedUpdatedAt: Date;
    actorUserId: string | null;
  },
  db: DbExecutor = prisma,
): Promise<{ outcome: "updated"; updatedAt: Date } | OrgCasConflict> {
  const written = await db.organization.updateMany({
    where: {
      id: params.orgId,
      orgStatus: params.from,
      deletedAt: null,
      updatedAt: params.expectedUpdatedAt,
    },
    data: { orgStatus: params.to, updatedBy: params.actorUserId },
  });
  if (written.count !== 1) return currentOrgToken(params.orgId, db);

  const after = await db.organization.findFirst({
    where: { id: params.orgId },
    select: { updatedAt: true },
  });
  if (after === null) return { outcome: "conflict" }; // unreachable; fail closed.
  return { outcome: "updated", updatedAt: after.updatedAt };
}

/**
 * Apply the `admin_recover_ownership` (re)assignment (Doc-4C §C5 State Effects: "membership Owner
 * (re)assignment (§5.2); no `organizations` §5.1 transition") — MUST run inside the SAME transaction
 * that resolved `resolveOwnershipRecoveryFacts` (the RV-0150 lock is still held):
 *   • nominee holds a live ACTIVE membership → reassign its role to the Owner bundle;
 *   • nominee holds NO live membership → CREATE an active Owner membership (the frozen "membership
 *     creatable" REFERENCE leg; the WP-1.3 founding-membership class).
 * The command has already rejected every other nominee shape (fail-closed).
 */
export async function applyOwnershipRecovery(
  params: {
    orgId: string;
    adminUserId: string;
    newOwnerUserId: string;
    ownerRoleId: string;
    existingMembershipId: string | null;
  },
  db: DbExecutor = prisma,
): Promise<{ newOwnerMembershipId: string }> {
  if (params.existingMembershipId !== null) {
    await db.membership.updateMany({
      where: { id: params.existingMembershipId, organizationId: params.orgId, deletedAt: null },
      data: { roleId: params.ownerRoleId, updatedBy: params.adminUserId },
    });
    return { newOwnerMembershipId: params.existingMembershipId };
  }

  const membershipId = uuidv7();
  await db.membership.create({
    data: {
      id: membershipId,
      organizationId: params.orgId,
      userId: params.newOwnerUserId,
      roleId: params.ownerRoleId,
      state: "active",
      joinedAt: new Date(),
      createdBy: params.adminUserId,
      updatedBy: params.adminUserId,
    },
  });
  return { newOwnerMembershipId: membershipId };
}

/** Resolve a LIVE, ACTIVE membership row by id WITHIN an org (the transfer contract's SCOPE leg —
 *  "org owns both memberships": the optional §5.5 approver identity must resolve inside the org). */
export async function findLiveActiveMembershipById(
  membershipId: string,
  orgId: string,
  db: DbExecutor = prisma,
): Promise<{ membershipId: string } | null> {
  const row = await db.membership.findFirst({
    where: { id: membershipId, organizationId: orgId, state: "active", deletedAt: null },
    select: { id: true },
  });
  return row === null ? null : { membershipId: row.id };
}

/** The caller's membership in a SOFT-DELETED org, admitting the org-delete CASCADE-marked rows (the
 *  restore contract's self-leg authority substrate — Doc-4C §C5 `restore_organization` Actor "User
 *  (Owner)": the frozen contract grants the Owner restore authority over an org whose memberships
 *  the frozen cascade has, by definition, soft-deleted; a live-rows-only predicate would make the
 *  self-restore leg unreachable). Pre-cascade `state` is retained — only `state = 'active'` rows
 *  participate. Returns the bound role for the slug resolution. */
export async function findRestoreEligibleMembership(
  userId: string,
  orgId: string,
  db: DbExecutor = prisma,
): Promise<{ membershipId: string; roleId: string } | null> {
  const row = await db.membership.findFirst({
    where: {
      userId,
      organizationId: orgId,
      state: "active",
      OR: [{ deletedAt: null }, { deleteReason: ORG_SOFT_DELETE_CASCADE_REASON }],
    },
    select: { id: true, roleId: true },
  });
  return row === null ? null : { membershipId: row.id, roleId: row.roleId };
}
