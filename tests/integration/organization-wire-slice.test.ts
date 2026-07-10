import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { concurrencyEtag } from "../../src/shared/http";
import type { ensureProvisioned } from "../../src/server/auth";
import { withActiveOrgContext, type ResolveStaffContext } from "../../src/server/context";
import {
  createOrganization,
  updateOrganizationProfile,
} from "../../src/modules/identity/contracts";
import { allocateHumanReference, appendAuditRecord } from "../../src/modules/core/contracts";
import {
  handleAdminRecoverOwnership,
  handleCreateOrganization,
  handleDeactivateOwnAccount,
  handleRestoreOrganization,
  handleSetOrganizationStatus,
  handleSoftDeleteOrganization,
  handleTransferOwnership,
  handleUpdateOrganizationProfile,
} from "../../src/server/identity";

// W2-IDN-6.2 — the §C5 Organization WIRED surface (Doc-5C §4.1 rows 5–11, all 7 contracts),
// Doc-8 bands 8C + 8E:
//   8C — envelope (Doc-5A §5.6/§6.1; 201+Location on create) · error class+status (§6.2, frozen
//   §C5 registers re-derived per contract) · idempotency (§B.6 REQUIRED-key deps + the CREATE
//   claim leg [RV-0153 F2] + replay identity) · actor-scope (User bootstrap / active-org tenant /
//   Owner-slug / Admin-staff / dual-leg restore) · non-disclosure (byte-identical 404 collapse on
//   foreign/non-member probes) · prohibited fields (server-resolved context; smuggled keys never
//   reach a write).
//   8E — org machine edges THROUGH the wire (illegal edges rejected-status-unchanged — the matrix
//   idiom) + the §5.5 Last-Owner/succession guards DISCRIMINATING-TESTED, incl. the RV-0150
//   concurrency race shapes (one probe per guarded command class: transfer-vs-owner-departure ·
//   recovery-vs-recovery — exactly-one-wins, never an ownerless org).
// All vs REAL PostgreSQL through the composition surfaces ONLY (never module internals).

// ── Deterministic fixtures (UUIDv7-shaped: version nibble 7, variant 8..b; 0xd62 = W2-IDN-6.2). ──
const ADMIN_USER = "01920000-0000-7000-8000-000000d62a01";
const ADMIN_AUTH = "01920000-0000-7000-8000-000000d62a02";

const COMMAND_DEDUP_STORE_KEY = "identity.command_dedup_window";

let ownerRoleId: string;
let directorRoleId: string;
let officerRoleId: string;

/** The provisioning stub — fixtures are pre-seeded; the hook must not mint a personal org. */
const noProvision: typeof ensureProvisioned = async () => ({
  created: false,
  userId: "",
  organizationId: null,
  organizationHumanRef: null,
  ownerMembershipId: null,
});

const asSession = (authUserId: string) => async () => ({ authUserId });

/** Injected staff context (the DC-3 production resolver is fail-closed; tests exercise the allow
 *  leg by injection — the 6.1 house pattern). */
const asStaff: ResolveStaffContext = async () => ({ userId: ADMIN_USER, isPlatformStaff: true });

/** The WIRE-SERIALIZED view of a response body (the §9.3 replay identity is a wire property). */
const wireJson = (b: unknown): unknown => JSON.parse(JSON.stringify(b));

const strip = (b: unknown) => {
  const rest = { ...(b as Record<string, unknown>) };
  delete rest.reference_id;
  return rest;
};

const key = () => `iv-k-${uuidv7()}`;

/** Mint a fresh user. */
async function freshUser(params?: { status?: "active" | "suspended" }) {
  const id = uuidv7();
  const authUserId = uuidv7();
  const row = await prisma.user.create({
    data: { id, authUserId, status: params?.status ?? "active" },
  });
  createdUserIds.push(id);
  return { id, authUserId, updatedAt: row.updatedAt };
}

/** Mint a fresh org (direct seed — NOT via the wire) with the given members. Returns row facts. */
async function freshOrg(params: {
  tag?: string;
  orgStatus?: "active" | "suspended" | "soft_deleted";
  isPersonalOrg?: boolean;
  slug?: string;
  members?: Array<{ userId: string; roleId: string; state?: "active" | "suspended" | "invited" }>;
}) {
  const id = uuidv7();
  const humanRef = `ORG-D62-${id.slice(-8)}`;
  const row = await prisma.organization.create({
    data: {
      id,
      humanRef,
      name: `IDN62 ${params.tag ?? "Org"}`,
      slug: params.slug ?? humanRef.toLowerCase(),
      orgStatus: params.orgStatus ?? "active",
      isPersonalOrg: params.isPersonalOrg ?? false,
    },
  });
  createdOrgIds.push(id);
  const membershipIds: string[] = [];
  for (const m of params.members ?? []) {
    const mid = uuidv7();
    await prisma.membership.create({
      data: {
        id: mid,
        organizationId: id,
        userId: m.userId,
        roleId: m.roleId,
        state: m.state ?? "active",
        joinedAt: new Date(),
      },
    });
    membershipIds.push(mid);
  }
  return { id, humanRef, slug: row.slug, updatedAt: row.updatedAt, membershipIds };
}

async function orgAudits(orgId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType: "organization", entityId: orgId },
    orderBy: { eventTime: "asc" },
  });
}

async function reloadOrg(orgId: string) {
  return prisma.organization.findUniqueOrThrow({ where: { id: orgId } });
}

/** Count the org's LIVE ACTIVE Owner-bundle memberships (the §5.5 invariant probe). */
async function activeOwnerCount(orgId: string): Promise<number> {
  return prisma.membership.count({
    where: { organizationId: orgId, roleId: ownerRoleId, state: "active", deletedAt: null },
  });
}

const createDeps = (auth: string, k: string | null | undefined) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
  idempotencyKey: k,
});

const tenantDeps = (auth: string, k: string | null | undefined) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
  idempotencyKey: k,
});

const restoreDeps = (auth: string, k: string | null | undefined, staff?: ResolveStaffContext) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
  idempotencyKey: k,
  ...(staff !== undefined ? { resolveStaffContext: staff } : {}),
});

const adminDeps = (auth: string, k: string | null | undefined, staff?: ResolveStaffContext) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
  idempotencyKey: k,
  ...(staff !== undefined ? { resolveStaffContext: staff } : {}),
});

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const createdOrgIds: string[] = [];
const createdUserIds: string[] = [];

describe("W2-IDN-6.2 §C5 organization wired surface — 8C + 8E (real PostgreSQL)", () => {
  beforeAll(async () => {
    // The seeded system bundles (migration seed — Doc-6C §5.2; org_id NULL composition rows).
    for (const [name, setter] of [
      ["Owner", (id: string) => (ownerRoleId = id)],
      ["Director", (id: string) => (directorRoleId = id)],
      ["Officer", (id: string) => (officerRoleId = id)],
    ] as const) {
      setter(
        (
          await prisma.role.findFirstOrThrow({
            where: { name, organizationId: null, isSystemBundle: true, deletedAt: null },
            select: { id: true },
          })
        ).id,
      );
    }
    await prisma.user.create({
      data: { id: ADMIN_USER, authUserId: ADMIN_AUTH, status: "active" },
    });
    // TEST-SCOPED `[DC-5]` window seed (unseeded until W2-IDN-7; swept in afterAll — the IDN-4 precedent).
    await prisma.systemConfiguration.deleteMany({ where: { key: COMMAND_DEDUP_STORE_KEY } });
    await prisma.systemConfiguration.create({
      data: {
        id: uuidv7(),
        key: COMMAND_DEDUP_STORE_KEY,
        valueJsonb: "24h",
        valueType: "duration",
      },
    });
  });

  afterAll(async () => {
    await prisma.commandDedup.deleteMany({
      where: { actorUserId: { in: [...createdUserIds, ADMIN_USER] } },
    });
    await prisma.systemConfiguration.deleteMany({ where: { key: COMMAND_DEDUP_STORE_KEY } });
    await prisma.membership.deleteMany({
      where: {
        OR: [
          { organizationId: { in: createdOrgIds } },
          { userId: { in: [...createdUserIds, ADMIN_USER] } },
        ],
      },
    });
    await prisma.organization.deleteMany({
      where: {
        OR: [{ id: { in: createdOrgIds } }, { createdBy: { in: createdUserIds } }],
      },
    });
    await prisma.user.deleteMany({ where: { id: { in: [...createdUserIds, ADMIN_USER] } } });
    await prisma.$disconnect();
  });

  // ════ A. `create_organization` — POST /identity/organizations (bootstrap; claim leg) ════

  it("CREATE wire: 201 + Location + §5.6 envelope; org + founding Owner membership + ORG- human_ref atomic; audit organization_created; §B.6 same-key replay → the STORED response (same reference_id), ONE org, ONE audit", async () => {
    const caller = await freshUser();
    // The caller needs SOME live footprint for `ensureProvisioned` parity — none required: create
    // is the bootstrap (no org context). Fire the wire.
    const k = key();
    const first = await handleCreateOrganization(
      { name: "Meghna Fabrication Works" },
      createDeps(caller.authUserId, k),
    );
    expect(first.status).toBe(201);
    const body = first.body as {
      result: {
        organizationId: string;
        humanRef: string;
        orgStatus: string;
        ownerMembershipId: string;
      };
      reference_id: string;
    };
    createdOrgIds.push(body.result.organizationId);
    expect(first.headers?.Location).toBe(`/identity/organizations/${body.result.organizationId}`);
    expect(body.result.orgStatus).toBe("active");
    expect(body.result.humanRef).toMatch(/^ORG-\d{4}-/); // M0 allocator (Doc-2 §0.1), never local.

    // Row facts: org active, non-personal (server-set), founding Owner membership ACTIVE + Owner bundle.
    const orgRow = await reloadOrg(body.result.organizationId);
    expect(orgRow.orgStatus).toBe("active");
    expect(orgRow.isPersonalOrg).toBe(false);
    expect(orgRow.createdBy).toBe(caller.id); // server-populated attribution (Doc-4A §9.7).
    const founding = await prisma.membership.findUniqueOrThrow({
      where: { id: body.result.ownerMembershipId },
    });
    expect(founding.userId).toBe(caller.id);
    expect(founding.roleId).toBe(ownerRoleId);
    expect(founding.state).toBe("active");

    // ONE enumerated §9 "create" audit row, USER-attributed, org-anchored.
    const audits = await orgAudits(body.result.organizationId);
    expect(audits).toHaveLength(1);
    expect(audits[0]!.action).toBe("organization_created");
    expect(audits[0]!.actorType).toBe("user");
    expect(audits[0]!.actorId).toBe(caller.id);
    expect(audits[0]!.organizationId).toBe(body.result.organizationId);

    // §B.6 safe replay: same key + same caller → the STORED 201 (same reference_id, same body) —
    // NO second org, NO second human_ref ("no second ref on replay"), NO second audit.
    const replay = await handleCreateOrganization(
      { name: "Meghna Fabrication Works" },
      createDeps(caller.authUserId, k),
    );
    expect(replay.status).toBe(201);
    expect(wireJson(replay.body)).toEqual(wireJson(first.body));
    expect(await prisma.organization.count({ where: { createdBy: caller.id } })).toBe(1);
    expect(await orgAudits(body.result.organizationId)).toHaveLength(1);
  });

  it("CREATE guards: missing/over-bound name → 400; absent Idempotency-Key → 400; client-asserted is_personal_org=true → 409 personal_exists (personal org live) / 400 (server-set otherwise); deferred org_type/address/contact_info → 400; smuggled keys never reach the write", async () => {
    const caller = await freshUser();

    // SYNTAX — missing name (the exported validator; category-1 before any context work).
    const noName = await handleCreateOrganization(
      { name: undefined as unknown as string },
      createDeps(caller.authUserId, key()),
    );
    expect(noName.status).toBe(400);
    expect((noName.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_invalid_input",
    );

    // §B.6 mandatory key (Doc-5C §4.3).
    const noKey = await handleCreateOrganization(
      { name: "X Ltd" },
      createDeps(caller.authUserId, null),
    );
    expect(noKey.status).toBe(400);
    expect((noKey.body as { error: { message: string } }).error.message).toMatch(/Idempotency-Key/);

    // is_personal_org NOT client-trusted: no live personal org → VALIDATION 400 (server-set).
    const assertedPersonal = await handleCreateOrganization(
      { name: "My Personal", isPersonalOrg: true },
      createDeps(caller.authUserId, key()),
    );
    expect(assertedPersonal.status).toBe(400);

    // …and with a live personal org → the frozen duplicate-personal-org guard (CONFLICT 409).
    await freshOrg({
      tag: "Personal",
      isPersonalOrg: true,
      members: [{ userId: caller.id, roleId: ownerRoleId }],
    });
    const dupPersonal = await handleCreateOrganization(
      { name: "My Personal Again", isPersonalOrg: true },
      createDeps(caller.authUserId, key()),
    );
    expect(dupPersonal.status).toBe(409);
    expect((dupPersonal.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_personal_exists",
    );

    // Deferred fields FAIL CLOSED (no frozen organizations column — never silently dropped).
    const deferred = await handleCreateOrganization(
      { name: "Deferred Fields Ltd" },
      { ...createDeps(caller.authUserId, key()), deferredFields: { orgTypeSupplied: true } },
    );
    expect(deferred.status).toBe(400);
    expect((deferred.body as { error: { message: string } }).error.message).toMatch(/deferred/);

    // Prohibited-field smuggle (Doc-4A §9.7): extra keys forced through a cast never reach the
    // write — attribution/status stay server-resolved.
    const smuggled = {
      name: "Smuggle Probe Ltd",
      org_status: "suspended",
      created_by: ADMIN_USER,
      organization_id: uuidv7(),
    } as unknown as { name: string };
    const created = await handleCreateOrganization(smuggled, createDeps(caller.authUserId, key()));
    expect(created.status).toBe(201);
    const orgId = (created.body as { result: { organizationId: string } }).result.organizationId;
    createdOrgIds.push(orgId);
    const row = await reloadOrg(orgId);
    expect(row.orgStatus).toBe("active");
    expect(row.createdBy).toBe(caller.id);
  });

  it("CREATE race (the RV-0150/RV-0153 claim idiom): two concurrent SAME-KEY creates → exactly ONE org; the loser returns the winner's stored §9.3 payload without executing", async () => {
    const caller = await freshUser();
    const k = key();
    const fire = () =>
      handleCreateOrganization({ name: "Race Create Ltd" }, createDeps(caller.authUserId, k));
    const [a, b] = await Promise.all([fire(), (async () => (await sleep(5), fire()))()]);
    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    // Byte-equality (incl. reference_id) — the §9.3 stored-replay identity: one execution, two wires.
    expect(wireJson(a.body)).toEqual(wireJson(b.body));
    const orgId = (a.body as { result: { organizationId: string } }).result.organizationId;
    createdOrgIds.push(orgId);
    expect(await prisma.organization.count({ where: { createdBy: caller.id } })).toBe(1);
    expect(await orgAudits(orgId)).toHaveLength(1);
  });

  it("CREATE post-mint org GUC (RV-0155 F1 pin): the command sets app.active_org to the minted org id TRANSACTION-LOCAL (the WP-1.3 step) — founding INSERT + audit then admit via their PRIMARY tenant legs (ADR-021), the staff GUC covering only the pre-mint window", async () => {
    const caller = await freshUser();
    // Drive the CONTRACTS FACADE on a manual bootstrap transaction (the composition's exact GUC
    // preamble) and read the GUC back AFTER the command returns — removing the command's post-mint
    // `set_config('app.active_org', …)` turns this red (the discriminating narrowing pin).
    const ran = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.user_id', ${caller.id}::text, true)`;
      await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
      const outcome = await createOrganization(
        { name: "GUC Pin Ltd" },
        { userId: caller.id },
        { appendAuditRecord, allocateHumanReference },
        tx,
      );
      const guc = await tx.$queryRaw<
        Array<{ v: string | null }>
      >`SELECT current_setting('app.active_org', true) AS v`;
      return { outcome, activeOrgGuc: guc[0]?.v ?? null };
    });

    expect(ran.outcome.ok).toBe(true);
    if (!ran.outcome.ok) return;
    const orgId = ran.outcome.result.organizationId;
    createdOrgIds.push(orgId);
    // The GUC is pinned to the MINTED org id inside the same transaction (WP-1.3 precedent) — so
    // the founding-membership INSERT (`memberships_insert` WITH CHECK org = active_org) and the
    // audit row (ADR-021 tenant leg: org = active_org ∧ actor = user_id ∧ actor_type 'user')
    // admitted via their PRIMARY tenant legs, not the staff backstop alone.
    expect(ran.activeOrgGuc).toBe(orgId);
    const founding = await prisma.membership.findUniqueOrThrow({
      where: { id: ran.outcome.result.ownerMembershipId },
    });
    expect(founding.organizationId).toBe(orgId);
    const audits = await orgAudits(orgId);
    expect(audits).toHaveLength(1);
    expect(audits[0]!.organizationId).toBe(orgId); // = the GUC value → the ADR-021 tenant leg holds.
    expect(audits[0]!.actorId).toBe(caller.id);
    expect(audits[0]!.actorType).toBe("user"); // attribution unchanged — User, never System.
  });

  // ════ B. `update_organization_profile` — PATCH /identity/organizations/{id} (If-Match) ════

  it("PATCH: Owner AND Director allowed (200; name persisted; audit organization_profile_updated with old/new); Officer → 403; foreign id → 404 byte-identical to nonexistent; stale If-Match → 409 + ETag; deferred fields → 400; empty patch → 400", async () => {
    const owner = await freshUser();
    const director = await freshUser();
    const officer = await freshUser();
    const org = await freshOrg({
      tag: "Patch",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: director.id, roleId: directorRoleId },
        { userId: officer.id, roleId: officerRoleId },
      ],
    });

    // Owner leg.
    const first = await handleUpdateOrganizationProfile(
      { targetOrganizationId: org.id, name: "Renamed by Owner", updatedAt: org.updatedAt },
      tenantDeps(owner.authUserId, key()),
    );
    expect(first.status).toBe(200);
    const token1 = (first.body as { result: { updatedAt: Date } }).result.updatedAt;
    expect((await reloadOrg(org.id)).name).toBe("Renamed by Owner");

    // Director leg (the [ESC-IDN-SLUG] interim Owner/Director authority — D7 precedent).
    const second = await handleUpdateOrganizationProfile(
      { targetOrganizationId: org.id, name: "Renamed by Director", updatedAt: token1 },
      tenantDeps(director.authUserId, key()),
    );
    expect(second.status).toBe(200);

    // Audit: old/new name diff, [ESC-IDN-AUDIT] pointer token (order-insensitive — eventTime ties).
    const audits = await orgAudits(org.id);
    expect(audits).toHaveLength(2);
    expect(new Set(audits.map((a) => a.action))).toEqual(new Set(["organization_profile_updated"]));
    const ownerAudit = audits.find(
      (a) => (a.newValue as { name?: string } | null)?.name === "Renamed by Owner",
    );
    expect(ownerAudit).toBeDefined();
    expect(ownerAudit!.oldValue).toEqual({ name: "IDN62 Patch" });

    // Officer → the frozen 403 (caller's own permission gap; nothing about any target).
    const forbidden = await handleUpdateOrganizationProfile(
      {
        targetOrganizationId: org.id,
        name: "Officer Rename",
        updatedAt: (await reloadOrg(org.id)).updatedAt,
      },
      tenantDeps(officer.authUserId, key()),
    );
    expect(forbidden.status).toBe(403);
    expect((forbidden.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_forbidden",
    );

    // Foreign {id} (another org) vs nonexistent id — byte-identical 404 collapse (§7.5).
    const foreign = await freshOrg({ tag: "Foreign" });
    const probeForeign = await handleUpdateOrganizationProfile(
      { targetOrganizationId: foreign.id, name: "X", updatedAt: new Date() },
      tenantDeps(owner.authUserId, key()),
    );
    const probeRandom = await handleUpdateOrganizationProfile(
      {
        targetOrganizationId: "01920000-0000-7000-8000-000000d62eee",
        name: "X",
        updatedAt: new Date(),
      },
      tenantDeps(owner.authUserId, key()),
    );
    expect(probeForeign.status).toBe(404);
    expect(probeRandom.status).toBe(404);
    expect(strip(probeForeign.body)).toEqual(strip(probeRandom.body));

    // Stale If-Match → the frozen CONFLICT (§C5 optimistic) + the §9.5 ETag current token.
    const current = await reloadOrg(org.id);
    const stale = await handleUpdateOrganizationProfile(
      { targetOrganizationId: org.id, name: "Stale Rename", updatedAt: new Date(0) },
      tenantDeps(owner.authUserId, key()),
    );
    expect(stale.status).toBe(409);
    expect((stale.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_update_conflict",
    );
    expect(stale.headers?.ETag).toBe(concurrencyEtag(current.updatedAt));

    // Deferred fields FAIL CLOSED; empty patch (no realizable field) → 400.
    const deferred = await handleUpdateOrganizationProfile(
      { targetOrganizationId: org.id, name: "Y", updatedAt: current.updatedAt },
      { ...tenantDeps(owner.authUserId, key()), deferredFields: { addressSupplied: true } },
    );
    expect(deferred.status).toBe(400);
    const empty = await handleUpdateOrganizationProfile(
      { targetOrganizationId: org.id, updatedAt: current.updatedAt },
      tenantDeps(owner.authUserId, key()),
    );
    expect(empty.status).toBe(400);
  });

  // ════ C. `transfer_ownership` — the §5.5-guarded succession command ════

  it("TRANSFER: Owner → active member: 200; nominee bound to the Owner bundle; the Owner-bound actor takes the nominee's former role (the Owner role MOVES); response updated_at = the org row token; audit ownership_transferred with reason_code + approver", async () => {
    const ownerA = await freshUser();
    const memberB = await freshUser();
    const approver = await freshUser();
    const org = await freshOrg({
      tag: "Transfer",
      members: [
        { userId: ownerA.id, roleId: ownerRoleId },
        { userId: memberB.id, roleId: officerRoleId },
        { userId: approver.id, roleId: directorRoleId },
      ],
    });
    const [aMembership, bMembership, approverMembership] = org.membershipIds;

    const res = await handleTransferOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: memberB.id,
        reasonCode: "succession: owner retirement",
        approverMembershipId: approverMembership!,
        updatedAt: org.updatedAt,
      },
      tenantDeps(ownerA.authUserId, key()),
    );
    expect(res.status).toBe(200);
    const body = res.body as {
      result: { organizationId: string; newOwnerMembershipId: string; updatedAt: Date };
    };
    expect(body.result.newOwnerMembershipId).toBe(bMembership);

    // The Owner role MOVED: B → Owner bundle; A → B's former role (Officer).
    const bRow = await prisma.membership.findUniqueOrThrow({ where: { id: bMembership! } });
    const aRow = await prisma.membership.findUniqueOrThrow({ where: { id: aMembership! } });
    expect(bRow.roleId).toBe(ownerRoleId);
    expect(aRow.roleId).toBe(officerRoleId);
    expect(await activeOwnerCount(org.id)).toBe(1); // never ownerless; exactly the successor.

    // Response token = the org aggregate's CURRENT updated_at (the frozen `updated_at : always`).
    const orgRow = await reloadOrg(org.id);
    expect(new Date(body.result.updatedAt).getTime()).toBe(orgRow.updatedAt.getTime());

    // Audit: the ENUMERATED §9 succession action with reason + approver (§5.5).
    const audits = await orgAudits(org.id);
    expect(audits).toHaveLength(1);
    expect(audits[0]!.action).toBe("organization_ownership_transferred");
    expect(audits[0]!.newValue).toMatchObject({
      new_owner_membership_id: bMembership,
      new_owner_user_id: memberB.id,
      reason_code: "succession: owner retirement",
      approver_membership_id: approverMembership,
    });
  });

  it("TRANSFER register legs: non-owner caller → 403 (AUTHZ before SCOPE); nominee without active membership → 422 identity_membership_not_found; bad approver → 422; foreign id → 404; missing reason_code / 'updated_at is required.' → 400; stale updated_at → 409 update_conflict + ETag", async () => {
    const ownerA = await freshUser();
    const officerC = await freshUser();
    const outsider = await freshUser();
    const org = await freshOrg({
      tag: "TransferLegs",
      members: [
        { userId: ownerA.id, roleId: ownerRoleId },
        { userId: officerC.id, roleId: officerRoleId },
      ],
    });

    // AUTHZ (can_transfer_ownership is Owner-only in the Doc-2 §7 seed) → 403.
    const forbidden = await handleTransferOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: ownerA.id,
        reasonCode: "r",
        updatedAt: org.updatedAt,
      },
      tenantDeps(officerC.authUserId, key()),
    );
    expect(forbidden.status).toBe(403);

    // REFERENCE — nominee has no active membership in the org.
    const noMember = await handleTransferOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: outsider.id,
        reasonCode: "r",
        updatedAt: org.updatedAt,
      },
      tenantDeps(ownerA.authUserId, key()),
    );
    expect(noMember.status).toBe(422);
    expect((noMember.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_membership_not_found",
    );

    // REFERENCE — approver must resolve inside the org.
    const badApprover = await handleTransferOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: officerC.id,
        reasonCode: "r",
        approverMembershipId: uuidv7(),
        updatedAt: org.updatedAt,
      },
      tenantDeps(ownerA.authUserId, key()),
    );
    expect(badApprover.status).toBe(422);

    // SCOPE — foreign {id} → 404 collapse.
    const foreign = await freshOrg({ tag: "TransferForeign" });
    const probeForeign = await handleTransferOwnership(
      {
        targetOrganizationId: foreign.id,
        newOwnerUserId: officerC.id,
        reasonCode: "r",
        updatedAt: org.updatedAt,
      },
      tenantDeps(ownerA.authUserId, key()),
    );
    expect(probeForeign.status).toBe(404);

    // SYNTAX — missing reason / missing body updated_at (the pinned message text).
    const noReason = await handleTransferOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: officerC.id,
        reasonCode: "",
        updatedAt: org.updatedAt,
      },
      tenantDeps(ownerA.authUserId, key()),
    );
    expect(noReason.status).toBe(400);
    const noToken = await handleTransferOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: officerC.id,
        reasonCode: "r",
        updatedAt: new Date(Number.NaN),
      },
      tenantDeps(ownerA.authUserId, key()),
    );
    expect(noToken.status).toBe(400);
    expect((noToken.body as { error: { message: string } }).error.message).toBe(
      "updated_at is required.",
    );

    // Stale body token → the register's CONFLICT + the §9.5 ETag current token; NO role moved.
    const stale = await handleTransferOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: officerC.id,
        reasonCode: "r",
        updatedAt: new Date(0),
      },
      tenantDeps(ownerA.authUserId, key()),
    );
    expect(stale.status).toBe(409);
    expect((stale.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_update_conflict",
    );
    expect(stale.headers?.ETag).toBe(concurrencyEtag((await reloadOrg(org.id)).updatedAt));
    expect(await activeOwnerCount(org.id)).toBe(1);
    expect(await orgAudits(org.id)).toHaveLength(0); // every rejection wrote nothing.
  });

  it("RACE PROBE (transfer class — RV-0150 idiom): transfer(A→B) racing deactivate(B) serialize on the FOR-UPDATE owner-row lock: exactly one wins, the org NEVER goes ownerless", async () => {
    const ownerA = await freshUser();
    const memberB = await freshUser();
    const org = await freshOrg({
      tag: "TransferRace",
      members: [
        { userId: ownerA.id, roleId: ownerRoleId },
        { userId: memberB.id, roleId: officerRoleId },
      ],
    });

    // T1: A transfers ownership to B. T2: B departs (deactivate_own_account — the 6.1 guarded
    // command; it locks the SAME active-Owner rows). WITHOUT the RV-0150 serialization both legs
    // read compatible facts (B is not an owner; B holds an active membership) and both commit —
    // the org's only Owner would be a departed user (ownerless). WITH it: exactly one wins —
    //   transfer first ⇒ B is sole Owner ⇒ the departure hits the §5.5 last-owner block (422);
    //   departure first ⇒ B's membership is removed ⇒ the transfer hits REFERENCE 422.
    const t1 = handleTransferOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: memberB.id,
        reasonCode: "race probe",
        updatedAt: org.updatedAt,
      },
      tenantDeps(ownerA.authUserId, key()),
    );
    const t2 = (async () => {
      await sleep(5); // widen the interleave window (the RV-0150 race-shape idiom).
      return handleDeactivateOwnAccount(
        { targetUserId: memberB.id, confirmation: true, updatedAt: memberB.updatedAt },
        {
          resolveSession: asSession(memberB.authUserId),
          ensureProvisioned: noProvision,
          idempotencyKey: key(),
        },
      );
    })();
    const [transferRes, departRes] = await Promise.all([t1, t2]);

    const transferWon = transferRes.status === 200;
    const departWon = departRes.status === 200;
    expect(transferWon && departWon).toBe(false); // exactly-one-wins — never both.
    expect(transferWon || departWon).toBe(true);

    // THE §5.5 INVARIANT (the discriminating post-state): ≥1 LIVE ACTIVE Owner whose user can act.
    const owners = await prisma.membership.findMany({
      where: { organizationId: org.id, roleId: ownerRoleId, state: "active", deletedAt: null },
      select: { userId: true },
    });
    expect(owners.length).toBeGreaterThanOrEqual(1);
    for (const o of owners) {
      const u = await prisma.user.findUniqueOrThrow({ where: { id: o.userId } });
      expect(u.status).toBe("active"); // never a departed/soft-deleted Owner.
    }
  });

  // ════ D. `soft_delete_organization` + `restore_organization` (DC-1 cascade discipline) ════

  it("DELETE: Owner soft-deletes (active AND suspended sources — the §5.1 edges): 200; org SD tuple carries the caller's reason; ALL live memberships cascade-marked (state untouched); ONE audit with the cascade count; register legs (403 / 404 / confirmation 400 / stale 409+ETag)", async () => {
    const owner = await freshUser();
    const officer = await freshUser();
    const org = await freshOrg({
      tag: "Delete",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: officer.id, roleId: officerRoleId },
      ],
    });

    // Officer → 403 (AUTHZ; can_delete_organization is Owner-only in the seed).
    const forbidden = await handleSoftDeleteOrganization(
      { targetOrganizationId: org.id, confirmation: true, reason: "r", updatedAt: org.updatedAt },
      tenantDeps(officer.authUserId, key()),
    );
    expect(forbidden.status).toBe(403);

    // Foreign id → 404 collapse; confirmation false → 400; stale token → 409 + ETag.
    const foreign = await freshOrg({ tag: "DeleteForeign" });
    expect(
      (
        await handleSoftDeleteOrganization(
          {
            targetOrganizationId: foreign.id,
            confirmation: true,
            reason: "r",
            updatedAt: org.updatedAt,
          },
          tenantDeps(owner.authUserId, key()),
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await handleSoftDeleteOrganization(
          {
            targetOrganizationId: org.id,
            confirmation: false,
            reason: "r",
            updatedAt: org.updatedAt,
          },
          tenantDeps(owner.authUserId, key()),
        )
      ).status,
    ).toBe(400);
    const stale = await handleSoftDeleteOrganization(
      { targetOrganizationId: org.id, confirmation: true, reason: "r", updatedAt: new Date(0) },
      tenantDeps(owner.authUserId, key()),
    );
    expect(stale.status).toBe(409);
    expect((stale.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_update_conflict",
    );
    expect(stale.headers?.ETag).toBe(concurrencyEtag((await reloadOrg(org.id)).updatedAt));

    // The happy path — from a SUSPENDED source (the second legal §5.1 edge; suspension does not
    // block the tenant wire in Wave 2 — org-suspension live-path enforcement binds 6.6, RV-0150
    // OBS-B1; noted, not realized here).
    await prisma.organization.update({ where: { id: org.id }, data: { orgStatus: "suspended" } });
    const current = await reloadOrg(org.id);
    const res = await handleSoftDeleteOrganization(
      {
        targetOrganizationId: org.id,
        confirmation: true,
        reason: "winding down operations",
        updatedAt: current.updatedAt,
      },
      tenantDeps(owner.authUserId, key()),
    );
    expect(res.status).toBe(200);
    expect((res.body as { result: { orgStatus: string } }).result.orgStatus).toBe("soft_deleted");

    const orgRow = await reloadOrg(org.id);
    expect(orgRow.orgStatus).toBe("soft_deleted");
    expect(orgRow.deletedAt).not.toBeNull();
    expect(orgRow.deleteReason).toBe("winding down operations");

    // The IN-MODULE cascade: every live membership SD-marked with the CASCADE marker; state
    // untouched (Doc-2 §5.2 has no soft-deleted membership state). Cross-module: NOTHING (DC-1).
    const memberships = await prisma.membership.findMany({
      where: { organizationId: org.id },
    });
    expect(memberships).toHaveLength(2);
    for (const m of memberships) {
      expect(m.deletedAt).not.toBeNull();
      expect(m.deleteReason).toBe("organization soft delete cascade (Doc-2 §5.1)");
      expect(m.state).toBe("active");
    }

    // ONE org-level audit (the ENUMERATED "soft delete/restore" family) with the cascade count.
    const audits = await orgAudits(org.id);
    expect(audits).toHaveLength(1);
    expect(audits[0]!.action).toBe("organization_soft_deleted");
    expect(audits[0]!.newValue).toMatchObject({
      org_status: "soft_deleted",
      cascaded_membership_count: 2,
    });
  });

  it("RESTORE (self leg): the Owner of a soft-deleted org restores it: 200 (active, slug_regenerated=false); ONLY cascade-marked memberships un-deleted (a pre-existing SD row stays); audit organization_restored; register legs (non-member 404 byte-identical / member-without-slug 403 / not-soft-deleted 409 / stale 400)", async () => {
    const owner = await freshUser();
    const officer = await freshUser();
    const outsider = await freshUser();
    const org = await freshOrg({
      tag: "Restore",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: officer.id, roleId: officerRoleId },
      ],
    });
    // A pre-existing SD membership (NOT the cascade's) — must stay deleted after restore.
    const preDeleted = uuidv7();
    await prisma.membership.create({
      data: {
        id: preDeleted,
        organizationId: org.id,
        userId: outsider.id,
        roleId: officerRoleId,
        state: "active",
        deletedAt: new Date(),
        deleteReason: "removed before the org delete",
      },
    });

    // Not soft-deleted yet → STATE 409 (illegal restore source; status unchanged — matrix idiom).
    const notDeleted = await handleRestoreOrganization(
      { targetOrganizationId: org.id, updatedAt: org.updatedAt },
      restoreDeps(owner.authUserId, key()),
    );
    expect(notDeleted.status).toBe(409);
    expect((await reloadOrg(org.id)).orgStatus).toBe("active");

    // Soft-delete via the wire (Owner).
    const del = await handleSoftDeleteOrganization(
      { targetOrganizationId: org.id, confirmation: true, reason: "r", updatedAt: org.updatedAt },
      tenantDeps(owner.authUserId, key()),
    );
    expect(del.status).toBe(200);
    const deletedRow = await reloadOrg(org.id);

    // Non-member probe vs nonexistent id — byte-identical 404 (the org's existence is protected).
    const probeReal = await handleRestoreOrganization(
      { targetOrganizationId: org.id, updatedAt: deletedRow.updatedAt },
      restoreDeps(outsider.authUserId, key()),
    );
    const probeRandom = await handleRestoreOrganization(
      {
        targetOrganizationId: "01920000-0000-7000-8000-000000d62eef",
        updatedAt: deletedRow.updatedAt,
      },
      restoreDeps(outsider.authUserId, key()),
    );
    expect(probeReal.status).toBe(404);
    expect(probeRandom.status).toBe(404);
    expect(strip(probeReal.body)).toEqual(strip(probeRandom.body));

    // Cascade-marked member WITHOUT the slug (Officer) → 403 (their own org; permission gap).
    const officerTry = await handleRestoreOrganization(
      { targetOrganizationId: org.id, updatedAt: deletedRow.updatedAt },
      restoreDeps(officer.authUserId, key()),
    );
    expect(officerTry.status).toBe(403);

    // Stale body token → in-register VALIDATION 400 (no CONFLICT code on the restore register).
    const staleRestore = await handleRestoreOrganization(
      { targetOrganizationId: org.id, updatedAt: new Date(0) },
      restoreDeps(owner.authUserId, key()),
    );
    expect(staleRestore.status).toBe(400);

    // The Owner self-restore (their membership is cascade-SD'd — the frozen dual-leg authority).
    const res = await handleRestoreOrganization(
      { targetOrganizationId: org.id, reason: "back in business", updatedAt: deletedRow.updatedAt },
      restoreDeps(owner.authUserId, key()),
    );
    expect(res.status).toBe(200);
    const body = res.body as { result: { orgStatus: string; slugRegenerated: boolean } };
    expect(body.result.orgStatus).toBe("active");
    expect(body.result.slugRegenerated).toBe(false);

    const restored = await reloadOrg(org.id);
    expect(restored.orgStatus).toBe("active");
    expect(restored.deletedAt).toBeNull();

    // Cascade rows reversed; the pre-existing SD row UNTOUCHED (marker-scoped reversal).
    const live = await prisma.membership.findMany({
      where: { organizationId: org.id, deletedAt: null },
    });
    expect(live).toHaveLength(2);
    const untouched = await prisma.membership.findUniqueOrThrow({ where: { id: preDeleted } });
    expect(untouched.deletedAt).not.toBeNull();
    expect(untouched.deleteReason).toBe("removed before the org delete");

    // Audit trail: soft-delete then restore (the enumerated §9 family, two distinct tokens).
    const audits = await orgAudits(org.id);
    expect(audits.map((a) => a.action)).toEqual([
      "organization_soft_deleted",
      "organization_restored",
    ]);
  });

  it("RESTORE slug regeneration (§5.1 restore-conflict rule): a live org reusing the slug forces a deterministic regeneration (slug_regenerated=true; no live collision remains)", async () => {
    const owner = await freshUser();
    const org = await freshOrg({
      tag: "SlugClash",
      slug: `idn62-clash-${uuidv7().slice(-6)}`,
      members: [{ userId: owner.id, roleId: ownerRoleId }],
    });
    const del = await handleSoftDeleteOrganization(
      { targetOrganizationId: org.id, confirmation: true, reason: "r", updatedAt: org.updatedAt },
      tenantDeps(owner.authUserId, key()),
    );
    expect(del.status).toBe(200);

    // A NEW live org takes the slug while ours is soft-deleted (legal — the unique is live-only).
    await freshOrg({ tag: "SlugTaker", slug: org.slug });

    const res = await handleRestoreOrganization(
      { targetOrganizationId: org.id, updatedAt: (await reloadOrg(org.id)).updatedAt },
      restoreDeps(owner.authUserId, key()),
    );
    expect(res.status).toBe(200);
    expect((res.body as { result: { slugRegenerated: boolean } }).result.slugRegenerated).toBe(
      true,
    );
    const restored = await reloadOrg(org.id);
    expect(restored.slug).not.toBe(org.slug);
    expect(restored.slug).toBe(org.humanRef.toLowerCase()); // the canonical never-reused derivation.
  });

  // ════ E. Admin surface — `set_organization_status` + `admin_recover_ownership` ════

  it("ADMIN-STATE: staff suspend → 200 + admin-attributed organization_suspended audit; reinstate → 200 + organization_reinstated; same-state replay → 409 STATE (no ETag; status unchanged); stale token → 409 status_conflict + ETag; absent target → 404; SYNTAX before AUTHZ; non-staff → uniform 403", async () => {
    const owner = await freshUser();
    const org = await freshOrg({
      tag: "AdminState",
      members: [{ userId: owner.id, roleId: ownerRoleId }],
    });

    // Non-staff (org member, even the Owner) → the uniform deny-by-construction 403.
    const nonStaff = await handleSetOrganizationStatus(
      {
        targetOrganizationId: org.id,
        targetStatus: "suspended",
        reason: "r",
        updatedAt: org.updatedAt,
      },
      adminDeps(owner.authUserId, key()),
    );
    expect(nonStaff.status).toBe(403);
    expect((nonStaff.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_forbidden",
    );

    // SYNTAX before AUTHZ — a malformed request is 400 for EVERY caller (staff or not).
    const badBody = await handleSetOrganizationStatus(
      {
        targetOrganizationId: org.id,
        targetStatus: "banned" as unknown as "suspended",
        reason: "r",
        updatedAt: org.updatedAt,
      },
      adminDeps(owner.authUserId, key()),
    );
    expect(badBody.status).toBe(400);

    // Staff suspend (injected staff context — the DC-3 allow leg).
    const suspend = await handleSetOrganizationStatus(
      {
        targetOrganizationId: org.id,
        targetStatus: "suspended",
        reason: "compliance hold",
        updatedAt: org.updatedAt,
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(suspend.status).toBe(200);
    expect((await reloadOrg(org.id)).orgStatus).toBe("suspended");

    // Same-state replay (suspend → suspended): machine-illegal edge → STATE 409, NO ETag,
    // status unchanged (the matrix idiom; rejected-status-unchanged).
    const sameState = await handleSetOrganizationStatus(
      {
        targetOrganizationId: org.id,
        targetStatus: "suspended",
        reason: "again",
        updatedAt: (await reloadOrg(org.id)).updatedAt,
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(sameState.status).toBe(409);
    expect((sameState.body as { error: { error_class: string } }).error.error_class).toBe("STATE");
    expect(sameState.headers?.ETag).toBeUndefined();
    expect((await reloadOrg(org.id)).orgStatus).toBe("suspended");

    // Stale token on a LEGAL edge → the register's status_conflict CONFLICT + the ETag token.
    const staleToken = await handleSetOrganizationStatus(
      { targetOrganizationId: org.id, targetStatus: "active", reason: "r", updatedAt: new Date(0) },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(staleToken.status).toBe(409);
    expect((staleToken.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_status_conflict",
    );
    expect(staleToken.headers?.ETag).toBe(concurrencyEtag((await reloadOrg(org.id)).updatedAt));

    // Reinstate (the §5.1 reinstate edge).
    const reinstate = await handleSetOrganizationStatus(
      {
        targetOrganizationId: org.id,
        targetStatus: "active",
        reason: "hold lifted",
        updatedAt: (await reloadOrg(org.id)).updatedAt,
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(reinstate.status).toBe(200);

    // Absent target → the frozen 404 (staff path).
    const absent = await handleSetOrganizationStatus(
      {
        targetOrganizationId: "01920000-0000-7000-8000-000000d62efe",
        targetStatus: "suspended",
        reason: "r",
        updatedAt: new Date(),
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(absent.status).toBe(404);

    // Audits: suspend + reinstate, ADMIN-attributed (never System), reason recorded.
    const audits = await orgAudits(org.id);
    expect(audits.map((a) => a.action)).toEqual([
      "organization_suspended",
      "organization_reinstated",
    ]);
    for (const a of audits) {
      expect(a.actorType).toBe("admin");
      expect(a.actorId).toBe(ADMIN_USER);
    }
    expect(audits[0]!.newValue).toMatchObject({
      org_status: "suspended",
      reason: "compliance hold",
    });
  });

  it("ADMIN-RECOVER: orphaned org (sole Owner's user suspended): staff recovers to an active member (role → Owner) AND to a membership-less user (active Owner membership CREATED); guards: acting owner present → 422; missing user → 422 REFERENCE; suspended-membership nominee → 422; non-staff → 403; stale → 400", async () => {
    const dormantOwner = await freshUser({ status: "suspended" }); // owner who cannot act (§5.5)
    const nomineeMember = await freshUser();
    const nomineeOutside = await freshUser();
    const suspendedMember = await freshUser();
    const org = await freshOrg({
      tag: "Recover",
      members: [
        { userId: dormantOwner.id, roleId: ownerRoleId },
        { userId: nomineeMember.id, roleId: officerRoleId },
        { userId: suspendedMember.id, roleId: officerRoleId, state: "suspended" },
      ],
    });

    // Non-staff → uniform 403.
    const nonStaff = await handleAdminRecoverOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: nomineeMember.id,
        reasonCode: "r",
        updatedAt: org.updatedAt,
      },
      adminDeps(nomineeMember.authUserId, key()),
    );
    expect(nonStaff.status).toBe(403);

    // Nominee user missing → REFERENCE 422 (identity_user_not_found).
    const missing = await handleAdminRecoverOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: "01920000-0000-7000-8000-000000d62eff",
        reasonCode: "r",
        updatedAt: org.updatedAt,
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(missing.status).toBe(422);
    expect((missing.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_user_not_found",
    );

    // Suspended-membership nominee → neither creatable nor active → 422 recovery_invalid.
    const badNominee = await handleAdminRecoverOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: suspendedMember.id,
        reasonCode: "r",
        updatedAt: org.updatedAt,
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(badNominee.status).toBe(422);
    expect((badNominee.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_recovery_invalid",
    );

    // Stale body token → in-register VALIDATION 400 (no CONFLICT code on the recovery register).
    const stale = await handleAdminRecoverOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: nomineeMember.id,
        reasonCode: "r",
        updatedAt: new Date(0),
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(stale.status).toBe(400);

    // RECOVER leg 1 — active-member nominee: role reassigned to the Owner bundle.
    const res = await handleAdminRecoverOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: nomineeMember.id,
        reasonCode: "legal recovery: owner unreachable",
        updatedAt: org.updatedAt,
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(res.status).toBe(200);
    const newOwnerMembershipId = (res.body as { result: { newOwnerMembershipId: string } }).result
      .newOwnerMembershipId;
    const m = await prisma.membership.findUniqueOrThrow({ where: { id: newOwnerMembershipId } });
    expect(m.userId).toBe(nomineeMember.id);
    expect(m.roleId).toBe(ownerRoleId);

    // "recovery only where no active Owner can act" — an ACTING owner now exists → 422.
    const second = await handleAdminRecoverOwnership(
      {
        targetOrganizationId: org.id,
        newOwnerUserId: nomineeOutside.id,
        reasonCode: "r",
        updatedAt: (await reloadOrg(org.id)).updatedAt,
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(second.status).toBe(422);
    expect((second.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_recovery_invalid",
    );

    // RECOVER leg 2 — membership-less nominee on a SECOND orphaned org: an ACTIVE Owner
    // membership is CREATED (the frozen "membership creatable" REFERENCE leg).
    const dormant2 = await freshUser({ status: "suspended" });
    const org2 = await freshOrg({
      tag: "Recover2",
      members: [{ userId: dormant2.id, roleId: ownerRoleId }],
    });
    const created = await handleAdminRecoverOwnership(
      {
        targetOrganizationId: org2.id,
        newOwnerUserId: nomineeOutside.id,
        reasonCode: "recovery with membership creation",
        updatedAt: org2.updatedAt,
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(created.status).toBe(200);
    const createdMembershipId = (created.body as { result: { newOwnerMembershipId: string } })
      .result.newOwnerMembershipId;
    const cm = await prisma.membership.findUniqueOrThrow({ where: { id: createdMembershipId } });
    expect(cm.userId).toBe(nomineeOutside.id);
    expect(cm.roleId).toBe(ownerRoleId);
    expect(cm.state).toBe("active");

    // Audits: ADMIN-attributed enumerated succession token with reason + approver identity (§5.5).
    const audits = await orgAudits(org.id);
    expect(audits).toHaveLength(1);
    expect(audits[0]!.action).toBe("organization_ownership_recovered");
    expect(audits[0]!.actorType).toBe("admin");
    expect(audits[0]!.newValue).toMatchObject({
      new_owner_user_id: nomineeMember.id,
      reason_code: "legal recovery: owner unreachable",
      approver_user_id: ADMIN_USER,
    });
  });

  it("RACE PROBE (recovery class — RV-0150 idiom): two concurrent recoveries on one orphaned org serialize on the FOR-UPDATE lock: exactly one wins; the loser re-reads the committed Owner and fails the no-acting-owner precondition", async () => {
    const dormant = await freshUser({ status: "suspended" });
    const nomineeC = await freshUser();
    const nomineeD = await freshUser();
    const org = await freshOrg({
      tag: "RecoverRace",
      members: [
        { userId: dormant.id, roleId: ownerRoleId },
        { userId: nomineeC.id, roleId: officerRoleId },
        { userId: nomineeD.id, roleId: officerRoleId },
      ],
    });

    // WITHOUT the RV-0150 lock both recoveries read actingActiveOwnerCount = 0 (the recovery does
    // not touch the org row, so no CAS discriminates them) and BOTH commit — a double recovery.
    // WITH it: the second resolver blocks on the first's uncommitted lock, re-reads, sees the
    // committed acting Owner, and rejects with the frozen recovery_invalid.
    const fire = (nominee: string) =>
      handleAdminRecoverOwnership(
        {
          targetOrganizationId: org.id,
          newOwnerUserId: nominee,
          reasonCode: "race probe",
          updatedAt: org.updatedAt,
        },
        adminDeps(ADMIN_AUTH, key(), asStaff),
      );
    const [r1, r2] = await Promise.all([
      fire(nomineeC.id),
      (async () => (await sleep(5), fire(nomineeD.id)))(),
    ]);

    const statuses = [r1.status, r2.status].sort();
    expect(statuses).toEqual([200, 422]); // exactly-one-wins.
    const loser = r1.status === 422 ? r1 : r2;
    expect((loser.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_recovery_invalid",
    );

    // Exactly ONE recovered Owner beyond the dormant one; exactly one recovery audit row.
    const owners = await prisma.membership.findMany({
      where: { organizationId: org.id, roleId: ownerRoleId, state: "active", deletedAt: null },
      select: { userId: true },
    });
    const recoveredOwners = owners.filter((o) => o.userId !== dormant.id);
    expect(recoveredOwners).toHaveLength(1);
    const audits = await orgAudits(org.id);
    expect(audits.filter((a) => a.action === "organization_ownership_recovered")).toHaveLength(1);
  });

  // ════ F. 8E — the org machine THROUGH the wire (illegal edges rejected-status-unchanged) ════

  it("8E matrix idiom: illegal wire edges leave the status byte-untouched — restore on active → 409; suspend on suspended → 409; delete on soft_deleted → 404 collapse (context gone — the frozen cascade removed the caller's live membership)", async () => {
    const owner = await freshUser();
    const org = await freshOrg({
      tag: "Matrix",
      members: [{ userId: owner.id, roleId: ownerRoleId }],
    });

    // restore on an ACTIVE org (illegal source) → 409; status unchanged.
    const badRestore = await handleRestoreOrganization(
      { targetOrganizationId: org.id, updatedAt: org.updatedAt },
      restoreDeps(owner.authUserId, key()),
    );
    expect(badRestore.status).toBe(409);
    expect((await reloadOrg(org.id)).orgStatus).toBe("active");

    // suspend → suspended (admin), then suspend AGAIN (illegal same-state) → 409; unchanged.
    const s1 = await handleSetOrganizationStatus(
      {
        targetOrganizationId: org.id,
        targetStatus: "suspended",
        reason: "r",
        updatedAt: org.updatedAt,
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(s1.status).toBe(200);
    const s2 = await handleSetOrganizationStatus(
      {
        targetOrganizationId: org.id,
        targetStatus: "suspended",
        reason: "r",
        updatedAt: (await reloadOrg(org.id)).updatedAt,
      },
      adminDeps(ADMIN_AUTH, key(), asStaff),
    );
    expect(s2.status).toBe(409);
    expect((await reloadOrg(org.id)).orgStatus).toBe("suspended");

    // soft-delete (legal from suspended), then DELETE again: the cascade removed the caller's live
    // membership, so the second call has NO resolvable active-org context for this org → the §6.6
    // 404 collapse (fail-closed; never a second transition, never an existence leak).
    const del = await handleSoftDeleteOrganization(
      {
        targetOrganizationId: org.id,
        confirmation: true,
        reason: "r",
        updatedAt: (await reloadOrg(org.id)).updatedAt,
      },
      tenantDeps(owner.authUserId, key()),
    );
    expect(del.status).toBe(200);
    const delAgain = await handleSoftDeleteOrganization(
      {
        targetOrganizationId: org.id,
        confirmation: true,
        reason: "r",
        updatedAt: (await reloadOrg(org.id)).updatedAt,
      },
      tenantDeps(owner.authUserId, key()),
    );
    expect(delAgain.status).toBe(404);
    expect((await reloadOrg(org.id)).orgStatus).toBe("soft_deleted");
  });

  // ════ G. D7 atomicity — audit-failure rolls the business write back ════

  it("D7 rollback direction: a failing audit append inside the tenant tx rolls the org write back (no write without an audit row)", async () => {
    const owner = await freshUser();
    const org = await freshOrg({
      tag: "Rollback",
      members: [{ userId: owner.id, roleId: ownerRoleId }],
    });

    // The composition binds the real M0 facade, so the rollback direction is proven at the
    // CONTRACTS-FACADE layer per the D7 checklist: invoke the public facade with a THROWING
    // appendAuditRecord on a real RLS-scoped transaction (boundary-legal — contracts only).
    await expect(
      withActiveOrgContext(
        { userId: owner.id, activeOrgId: org.id, isPlatformStaff: false },
        async (tx) =>
          updateOrganizationProfile(
            { targetOrganizationId: org.id, name: "Never Persisted", updatedAt: org.updatedAt },
            { userId: owner.id, activeOrgId: org.id },
            {
              appendAuditRecord: async () => {
                throw new Error("audit facade down (D7 probe)");
              },
            },
            tx,
          ),
      ),
    ).rejects.toThrow(/audit facade down/);
    expect((await reloadOrg(org.id)).name).toBe("IDN62 Rollback"); // the write rolled back.
    expect(await orgAudits(org.id)).toHaveLength(0);
  });
});
