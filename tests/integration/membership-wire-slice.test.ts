import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { concurrencyEtag } from "../../src/shared/http";
import type { ensureProvisioned } from "../../src/server/auth";
import { withActiveOrgContext } from "../../src/server/context";
import {
  activateMembership,
  checkPermission,
  setMembershipStatus,
} from "../../src/modules/identity/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";
import {
  handleAcceptInvitation,
  handleInviteMember,
  handleRemoveMember,
  handleRevokeInvitation,
  handleSetMembershipStatus,
} from "../../src/server/identity";

// W2-IDN-6.3 — the §C6 Membership WIRED surface (Doc-5C §5.1 rows 12–16, all 5 contracts),
// Doc-8 bands 8C + 8E:
//   8C — envelope (Doc-5A §5.6/§6.1; 201+Location on invite) · error class+status (§6.2; the frozen
//   §C6 registers re-derived per contract, PassB:351/:366/:394/:408/:422) · idempotency (§B.6
//   REQUIRED-key deps + the INVITE claim leg [RV-0153 F2] + replay identity, per-contract window
//   keys) · actor-scope (active-org management / PRE-membership invitee) · non-disclosure
//   (byte-identical 404 collapse on foreign/absent probes; invitee existence never enriched beyond
//   the frozen register).
//   8E — membership machine edges THROUGH the wire (each contract drives ONLY its frozen edge set —
//   machine-legal-but-wrong-contract edges rejected, status byte-untouched) + the §5.5 Last-Owner
//   guard DISCRIMINATING-TESTED on the frozen-derived guarded set (remove_member + the
//   set_membership_status SUSPEND leg; revoke NOT guarded — pinned), incl. the RV-0150 concurrency
//   race shapes rebuilt INTERLEAVE-REAL (probe-held locks + observed pg_stat_activity waiters —
//   the RV-0155 F-B1 house shape; NO sleep-offset probes).
// All vs REAL PostgreSQL through the composition surfaces ONLY (never module internals), except the
// D7 rollback-direction leg which injects a failing audit port through the CONTRACTS face.

// ── Deterministic fixtures (UUIDv7-shaped: version nibble 7, variant 8..b; 0xd63 = W2-IDN-6.3). ──
const COMMAND_DEDUP_STORE_KEY = "identity.command_dedup_window";
const INVITE_DEDUP_STORE_KEY = "identity.membership_invite_dedup_window";

let ownerRoleId: string;
let managerRoleId: string;
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

/** The WIRE-SERIALIZED view of a response body (the §9.3 replay identity is a wire property). */
const wireJson = (b: unknown): unknown => JSON.parse(JSON.stringify(b));

const strip = (b: unknown) => {
  const rest = { ...(b as Record<string, unknown>) };
  delete rest.reference_id;
  return rest;
};

const key = () => `iv-k63-${uuidv7()}`;

const createdOrgIds: string[] = [];
const createdUserIds: string[] = [];

/** Mint a fresh user (with a resolvable live email — the invitee identifier). */
async function freshUser(params?: { status?: "active" | "suspended"; email?: string }) {
  const id = uuidv7();
  const authUserId = uuidv7();
  const email = params?.email ?? `d63-${id.slice(-12)}@invitee.example`;
  const row = await prisma.user.create({
    data: { id, authUserId, email, status: params?.status ?? "active" },
  });
  createdUserIds.push(id);
  return { id, authUserId, email, updatedAt: row.updatedAt };
}

/** Mint a fresh org (direct seed — NOT via the wire) with the given members. Returns row facts. */
async function freshOrg(params: {
  tag?: string;
  members?: Array<{
    userId: string;
    roleId: string;
    state?: "active" | "suspended" | "invited" | "pending" | "removed";
  }>;
}) {
  const id = uuidv7();
  const humanRef = `ORG-D63-${id.slice(-8)}`;
  await prisma.organization.create({
    data: {
      id,
      humanRef,
      name: `IDN63 ${params.tag ?? "Org"}`,
      slug: humanRef.toLowerCase(),
      orgStatus: "active",
      isPersonalOrg: false,
    },
  });
  createdOrgIds.push(id);
  const members: Array<{ membershipId: string; updatedAt: Date }> = [];
  for (const m of params.members ?? []) {
    const mid = uuidv7();
    const row = await prisma.membership.create({
      data: {
        id: mid,
        organizationId: id,
        userId: m.userId,
        roleId: m.roleId,
        state: m.state ?? "active",
        joinedAt: new Date(),
      },
    });
    members.push({ membershipId: mid, updatedAt: row.updatedAt });
  }
  return { id, humanRef, members };
}

async function membershipAudits(entityIds: string[]) {
  return prisma.auditRecord.findMany({
    where: { entityType: "membership", entityId: { in: entityIds } },
    orderBy: { eventTime: "asc" },
  });
}

async function reloadMembership(id: string) {
  return prisma.membership.findUniqueOrThrow({ where: { id } });
}

/** Count the org's LIVE ACTIVE Owner-bundle memberships (the §5.5 invariant probe). */
async function activeOwnerCount(orgId: string): Promise<number> {
  return prisma.membership.count({
    where: { organizationId: orgId, roleId: ownerRoleId, state: "active", deletedAt: null },
  });
}

const deps = (auth: string, k: string | null | undefined) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
  idempotencyKey: k,
});

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Poll `pg_stat_activity` (this worker's OWN ephemeral DB) until ≥ `min` backends are
 *  lock-waiting — the interleave-real observability leg (RV-0155 F-B1 house shape; the 6.2
 *  rebuilt-probe idiom: gate every step on an OBSERVED state, never a sleep offset). */
async function waitForLockWaiters(min: number, label: string): Promise<void> {
  for (let i = 0; i < 400; i++) {
    const rows = await prisma.$queryRaw<Array<{ waiting: number }>>`
      SELECT count(*)::int AS waiting FROM pg_stat_activity
      WHERE datname = current_database() AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()`;
    if ((rows[0]?.waiting ?? 0) >= min) return;
    await sleep(10);
  }
  throw new Error(`interleave probe: never observed ${min} lock-waiting backend(s) (${label})`);
}

/** Open a probe transaction HOLDING `FOR UPDATE` row locks on the given membership rows until
 *  released (then ROLLS BACK — zero residue). Resolves only after the locks are ACQUIRED. */
async function holdMembershipRowLocks(membershipIds: string[]) {
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  let acquired!: () => void;
  const ready = new Promise<void>((r) => (acquired = r));
  const done = prisma
    .$transaction(
      async (ptx) => {
        for (const id of membershipIds) {
          await ptx.$queryRaw`SELECT id FROM identity.memberships WHERE id = ${id}::uuid FOR UPDATE`;
        }
        acquired();
        await held;
        throw new Error("probe-rollback");
      },
      { timeout: 20_000 },
    )
    .catch((e: unknown) => {
      if (!(e instanceof Error) || e.message !== "probe-rollback") throw e;
    });
  await ready;
  return { release, done };
}

describe("W2-IDN-6.3 §C6 membership wired surface — 8C + 8E (real PostgreSQL)", () => {
  beforeAll(async () => {
    // The seeded system bundles (migration seed — Doc-6C §5.2; org_id NULL composition rows).
    // `can_manage_users` bundle membership per the catalog seed: Owner, Director, Manager
    // (Officer does NOT hold it — the 403 actor).
    for (const [name, setter] of [
      ["Owner", (id: string) => (ownerRoleId = id)],
      ["Manager", (id: string) => (managerRoleId = id)],
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
    // TEST-SCOPED `[DC-5]` window seeds (unseeded until W2-IDN-7; swept in afterAll — the IDN-4
    // precedent). BOTH frozen per-contract windows: the generic key + the invite-specific key.
    for (const k of [COMMAND_DEDUP_STORE_KEY, INVITE_DEDUP_STORE_KEY]) {
      await prisma.systemConfiguration.deleteMany({ where: { key: k } });
      await prisma.systemConfiguration.create({
        data: { id: uuidv7(), key: k, valueJsonb: "24h", valueType: "duration" },
      });
    }
  });

  afterAll(async () => {
    await prisma.commandDedup.deleteMany({ where: { actorUserId: { in: createdUserIds } } });
    await prisma.systemConfiguration.deleteMany({
      where: { key: { in: [COMMAND_DEDUP_STORE_KEY, INVITE_DEDUP_STORE_KEY] } },
    });
    await prisma.membership.deleteMany({
      where: {
        OR: [{ organizationId: { in: createdOrgIds } }, { userId: { in: createdUserIds } }],
      },
    });
    await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  // ════ A. `invite_member` — POST /identity/memberships (create; §B.6 claim leg) ════

  it("INVITE wire: 201 + Location + §5.6 envelope; `→ invited` row (grants no access); audit membership_invited (User, §9 enumerated, no email value in payload); §B.6 same-key replay → the STORED response (same reference_id), ONE row, ONE audit; different-key duplicate → the frozen 409 already_exists", async () => {
    const owner = await freshUser();
    const invitee = await freshUser();
    const org = await freshOrg({
      tag: "InviteWire",
      members: [{ userId: owner.id, roleId: ownerRoleId }],
    });

    const k = key();
    const res = await handleInviteMember(
      { email: invitee.email, roleId: officerRoleId, department: "QA" },
      deps(owner.authUserId, k),
    );
    expect(res.status).toBe(201);
    const result = (res.body as { result: { membershipId: string; state: string } }).result;
    expect(result.state).toBe("invited");
    expect(res.headers?.Location).toBe(`/identity/memberships/${result.membershipId}`);
    expect((res.body as { reference_id?: string }).reference_id).toBeTruthy();

    // The row: `→ invited` in the ACTIVE org, bound to the resolved invitee + same-tenant role.
    const row = await reloadMembership(result.membershipId);
    expect(row.state).toBe("invited");
    expect(row.organizationId).toBe(org.id);
    expect(row.userId).toBe(invitee.id);
    expect(row.roleId).toBe(officerRoleId);
    expect(row.department).toBe("QA");
    expect(row.deletedAt).toBeNull();

    // Audit: the ENUMERATED §9 "membership invite" action; User-attributed; ids+meta only (the
    // invitee's EMAIL VALUE never enters the immutable ledger).
    const audits = await membershipAudits([result.membershipId]);
    expect(audits).toHaveLength(1);
    expect(audits[0]!.action).toBe("membership_invited");
    expect(audits[0]!.actorType).toBe("user");
    expect(audits[0]!.actorId).toBe(owner.id);
    expect(audits[0]!.organizationId).toBe(org.id);
    expect(JSON.stringify(audits[0]!.newValue)).not.toContain(invitee.email);

    // §B.6 same-key replay: the STORED response — same status, same body, same ORIGINAL
    // reference_id; NO second row, NO second audit (§14.3 joint rule).
    const replay = await handleInviteMember(
      { email: invitee.email, roleId: officerRoleId, department: "QA" },
      deps(owner.authUserId, k),
    );
    expect(replay.status).toBe(201);
    expect(wireJson(replay.body)).toEqual(wireJson(res.body));
    expect(
      await prisma.membership.count({
        where: { userId: invitee.id, organizationId: org.id, deletedAt: null },
      }),
    ).toBe(1);
    expect(await membershipAudits([result.membershipId])).toHaveLength(1);

    // DIFFERENT key = an independent duplicate submission → the frozen register's CONFLICT
    // `identity_membership_already_exists` (the §C6-declared class; Doc-4A §14.4 row 2).
    const dup = await handleInviteMember(
      { email: invitee.email, roleId: officerRoleId },
      deps(owner.authUserId, key()),
    );
    expect(dup.status).toBe(409);
    expect((dup.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_membership_already_exists",
    );
  });

  it("INVITE register legs + non-disclosure: absent key → 400; malformed email/role/department → 400; Officer (no can_manage_users) → 403; foreign-org role → 422 role_not_found; non-resolving email → 400 FAIL-CLOSED (no row; fixed register shape); suspended/invited member → 409; unauthenticated → 401; unresolved context → 404", async () => {
    const owner = await freshUser();
    const officer = await freshUser();
    const invitee = await freshUser();
    const orphan = await freshUser(); // no memberships anywhere → unresolved active-org context.
    const org = await freshOrg({
      tag: "InviteGuards",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: officer.id, roleId: officerRoleId },
      ],
    });

    // §B.6 mandatory key (Doc-5C §4.3) — the wire said ABSENT.
    const noKey = await handleInviteMember(
      { email: invitee.email, roleId: officerRoleId },
      deps(owner.authUserId, null),
    );
    expect(noKey.status).toBe(400);

    // SYNTAX legs (category 1 — before any semantic work).
    for (const bad of [
      { email: "not-an-email", roleId: officerRoleId },
      { email: invitee.email, roleId: "nope" },
      { email: invitee.email, roleId: officerRoleId, department: "x".repeat(201) },
    ]) {
      const res = await handleInviteMember(bad, deps(owner.authUserId, key()));
      expect(res.status).toBe(400);
      expect((res.body as { error: { error_code: string } }).error.error_code).toBe(
        "identity_membership_invalid_input",
      );
    }

    // AUTHZ precedes semantics: the Officer bundle does NOT hold `can_manage_users` (catalog
    // seed: Owner/Director/Manager only) → uniform 403, nothing about the invitee disclosed.
    const forbidden = await handleInviteMember(
      { email: invitee.email, roleId: officerRoleId },
      deps(officer.authUserId, key()),
    );
    expect(forbidden.status).toBe(403);
    expect((forbidden.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_membership_forbidden",
    );

    // REFERENCE — a FOREIGN org's custom role resolves to the SAME code as nonexistent (§B.9
    // same-tenant rule; no cross-tenant role disclosure).
    const otherOrg = await freshOrg({ tag: "ForeignRoleHome" });
    const foreignRoleId = uuidv7();
    await prisma.role.create({
      data: {
        id: foreignRoleId,
        organizationId: otherOrg.id,
        name: "Foreign Custom",
        isSystemBundle: false,
      },
    });
    const foreignRole = await handleInviteMember(
      { email: invitee.email, roleId: foreignRoleId },
      deps(owner.authUserId, key()),
    );
    expect(foreignRole.status).toBe(422);
    expect((foreignRole.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_role_not_found",
    );
    await prisma.role.delete({ where: { id: foreignRoleId } });

    // Invitee resolution — a NON-RESOLVING email fails CLOSED as the in-register VALIDATION 400
    // (fixed shape — the register's own code+class; no enrichment beyond it), and NO row is
    // minted (Mutation-Scope honored).
    const before = await prisma.membership.count({ where: { organizationId: org.id } });
    const noAccount = await handleInviteMember(
      { email: `no-account-${uuidv7().slice(-8)}@nowhere.example`, roleId: officerRoleId },
      deps(owner.authUserId, key()),
    );
    expect(noAccount.status).toBe(400);
    expect((noAccount.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_membership_invalid_input",
    );
    expect(await prisma.membership.count({ where: { organizationId: org.id } })).toBe(before);

    // BUSINESS — a live SUSPENDED membership row blocks a re-invite (a membership already
    // exists; reinstate is the path), and a live INVITED row blocks a duplicate invite.
    const suspended = await freshUser();
    const invited = await freshUser();
    await freshOrg({ tag: "unused" }); // spacing org-id namespace only
    await prisma.membership.create({
      data: {
        id: uuidv7(),
        organizationId: org.id,
        userId: suspended.id,
        roleId: officerRoleId,
        state: "suspended",
      },
    });
    await prisma.membership.create({
      data: {
        id: uuidv7(),
        organizationId: org.id,
        userId: invited.id,
        roleId: officerRoleId,
        state: "invited",
      },
    });
    for (const email of [suspended.email, invited.email]) {
      const res = await handleInviteMember(
        { email, roleId: officerRoleId },
        deps(owner.authUserId, key()),
      );
      expect(res.status).toBe(409);
      expect((res.body as { error: { error_code: string } }).error.error_code).toBe(
        "identity_membership_already_exists",
      );
    }

    // DC-4 auth boundary + the §6.6 unresolved-context collapse.
    const unauth = await handleInviteMember(
      { email: invitee.email, roleId: officerRoleId },
      { resolveSession: async () => null, ensureProvisioned: noProvision, idempotencyKey: key() },
    );
    expect(unauth.status).toBe(401);
    const noContext = await handleInviteMember(
      { email: invitee.email, roleId: officerRoleId },
      deps(orphan.authUserId, key()),
    );
    expect(noContext.status).toBe(404);
    expect((noContext.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_membership_not_found",
    );
  });

  it("INVITE re-invite after removal (the frozen 'removed is terminal — re-invite creates a NEW membership'): the live removed row is TOMBSTONED (marker only; state byte-untouched) and a NEW invited row is minted; audit carries superseded_membership_id", async () => {
    const owner = await freshUser();
    const former = await freshUser();
    const org = await freshOrg({
      tag: "ReInvite",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: former.id, roleId: officerRoleId, state: "removed" },
      ],
    });
    const removedRowId = org.members[1]!.membershipId;

    const res = await handleInviteMember(
      { email: former.email, roleId: officerRoleId },
      deps(owner.authUserId, key()),
    );
    expect(res.status).toBe(201);
    const newId = (res.body as { result: { membershipId: string } }).result.membershipId;
    expect(newId).not.toBe(removedRowId);

    // The NEW membership (never a reopened terminal row — Inv #8: IDs never reused).
    const fresh = await reloadMembership(newId);
    expect(fresh.state).toBe("invited");
    expect(fresh.deletedAt).toBeNull();

    // The OLD row: tombstone MARKER only — the terminal `removed` state byte-untouched; audit
    // rows retained (Doc-2 §10.2).
    const old = await reloadMembership(removedRowId);
    expect(old.state).toBe("removed");
    expect(old.deletedAt).not.toBeNull();
    expect(old.deletedBy).toBe(owner.id);

    const audits = await membershipAudits([newId]);
    expect(audits).toHaveLength(1);
    expect(audits[0]!.action).toBe("membership_invited");
    expect(audits[0]!.newValue).toMatchObject({ superseded_membership_id: removedRowId });
  });

  it("INVITE race — interleave-real (RV-0155 F-B1 house shape): the WINNER is held open POST-claim (its membership INSERT blocked on a probe-held uncommitted row) while the CONTENDER demonstrably passes its replay lookup and blocks ON THE CLAIM; release → ONE execution, byte-identical §9.3 payloads, ONE row, ONE audit", async () => {
    const owner = await freshUser();
    const invitee = await freshUser();
    const org = await freshOrg({
      tag: "InviteRace",
      members: [{ userId: owner.id, roleId: ownerRoleId }],
    });

    // The probe holds an UNCOMMITTED conflicting membership row for (invitee, org): the winner's
    // INSERT queues on the partial-unique-live index BEHIND it — pinned INSIDE its own tx, after
    // its claim, before its commit. The contender then blocks on the winner's uncommitted CLAIM
    // row (same §B.6 scope). Both waits are OBSERVED via pg_stat_activity — no sleep offsets.
    let release!: () => void;
    const held = new Promise<void>((r) => (release = r));
    let pinned!: () => void;
    const ready = new Promise<void>((r) => (pinned = r));
    const probe = prisma
      .$transaction(
        async (ptx) => {
          await ptx.membership.create({
            data: {
              id: uuidv7(),
              organizationId: org.id,
              userId: invitee.id,
              roleId: officerRoleId,
              state: "invited",
            },
          });
          pinned();
          await held;
          throw new Error("probe-rollback"); // zero residue — the conflicting row never commits.
        },
        { timeout: 20_000 },
      )
      .catch((e: unknown) => {
        if (!(e instanceof Error) || e.message !== "probe-rollback") throw e;
      });
    await ready;

    const k = key();
    const fire = () =>
      handleInviteMember(
        { email: invitee.email, roleId: officerRoleId },
        deps(owner.authUserId, k),
      );
    const p1 = fire();
    const p2 = fire();

    // OBSERVED interleave: winner blocked on the probe row (post-claim) + contender blocked on
    // the winner's uncommitted claim — BOTH in flight before any commit.
    await waitForLockWaiters(2, "invite winner INSERT + contender claim");
    release();
    await probe;

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    // §9.3 replay identity: byte-identical bodies INCLUDING the original reference_id — exactly
    // one execution; the loser returned the winner's stored payload.
    expect(wireJson(r1.body)).toEqual(wireJson(r2.body));

    const live = await prisma.membership.findMany({
      where: { userId: invitee.id, organizationId: org.id, deletedAt: null },
    });
    expect(live).toHaveLength(1);
    expect(await membershipAudits([live[0]!.id])).toHaveLength(1);
  });

  // ════ B. `accept_invitation` — POST …/{id}/accept_invitation (pre-membership) ════

  it("ACCEPT wire: the invitee (NO membership in the org) accepts → 200 invited→pending; audit membership_accepted USER-attributed; pending grants NO access (live check_permission deny); §B.6 replay → stored response; activation is the SEPARATE IDN-5 System step (composed, never duplicated)", async () => {
    const owner = await freshUser();
    const invitee = await freshUser();
    const org = await freshOrg({
      tag: "AcceptWire",
      members: [{ userId: owner.id, roleId: ownerRoleId }],
    });
    // Invite through the WIRE (the real `→ invited` leg) — with a MANAGER role so the
    // access-formula pin below is discriminating (Manager holds can_manage_users when ACTIVE).
    const invited = await handleInviteMember(
      { email: invitee.email, roleId: managerRoleId },
      deps(owner.authUserId, key()),
    );
    expect(invited.status).toBe(201);
    const mid = (invited.body as { result: { membershipId: string } }).result.membershipId;

    const k = key();
    const res = await handleAcceptInvitation(
      { targetMembershipId: mid },
      deps(invitee.authUserId, k),
    );
    expect(res.status).toBe(200);
    expect((res.body as { result: { membershipId: string; state: string } }).result).toEqual({
      membershipId: mid,
      state: "pending",
    });
    expect((await reloadMembership(mid)).state).toBe("pending");

    // `pending` grants no business access — the LIVE authorization path denies (Doc-2 §5.2:
    // "only `active` participates in the access formula").
    const denied = await checkPermission({
      userId: invitee.id,
      organizationId: org.id,
      permissionSlug: "can_manage_users",
    });
    expect(denied.decision).toBe("deny");

    // Audit: the ENUMERATED §9 "membership accept"; USER-attributed (the invitee) — the §6.2a
    // staff GUC is mechanism, never attribution.
    const audits = await membershipAudits([mid]);
    const accepts = audits.filter((a) => a.action === "membership_accepted");
    expect(accepts).toHaveLength(1);
    expect(accepts[0]!.actorType).toBe("user");
    expect(accepts[0]!.actorId).toBe(invitee.id);
    expect(accepts[0]!.organizationId).toBe(org.id);
    expect(accepts[0]!.oldValue).toMatchObject({ state: "invited" });
    expect(accepts[0]!.newValue).toMatchObject({ state: "pending" });

    // §B.6 same-key replay — stored response, ONE accept audit (§14.3 joint rule).
    const replay = await handleAcceptInvitation(
      { targetMembershipId: mid },
      deps(invitee.authUserId, k),
    );
    expect(replay.status).toBe(200);
    expect(wireJson(replay.body)).toEqual(wireJson(res.body));
    expect(
      (await membershipAudits([mid])).filter((a) => a.action === "membership_accepted"),
    ).toHaveLength(1);

    // COMPOSE with the IDN-5 System step (never duplicate it): `pending → active` happens ONLY
    // via `activate_membership` (the DC-4 verification-complete consumer) — accept left the row
    // `pending`; the System command completes it.
    const activated = await activateMembership({ membershipId: mid }, { appendAuditRecord });
    expect(activated.activated).toBe(true);
    expect((await reloadMembership(mid)).state).toBe("active");
    const allowed = await checkPermission({
      userId: invitee.id,
      organizationId: org.id,
      permissionSlug: "can_manage_users",
    });
    expect(allowed.decision).toBe("allow");
  });

  it("ACCEPT register legs + non-disclosure: a FOREIGN invitation collapses 404 BYTE-IDENTICAL to a nonexistent id; stale optional updated_at → 400; already accepted → 409; revoked/expired (removed) → 409; absent key → 400", async () => {
    const owner = await freshUser();
    const invitee = await freshUser();
    const stranger = await freshUser();
    const org = await freshOrg({
      tag: "AcceptGuards",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: invitee.id, roleId: officerRoleId, state: "invited" },
      ],
    });
    const mid = org.members[1]!.membershipId;
    const row = await reloadMembership(mid);

    // Non-disclosure: someone ELSE probing this invitation id vs probing a nonexistent id —
    // byte-identical 404 (status + body shape; §7.5 timing-uniform path).
    const foreign = await handleAcceptInvitation(
      { targetMembershipId: mid },
      deps(stranger.authUserId, key()),
    );
    const absent = await handleAcceptInvitation(
      { targetMembershipId: uuidv7() },
      deps(stranger.authUserId, key()),
    );
    expect(foreign.status).toBe(404);
    expect(absent.status).toBe(404);
    expect(strip(foreign.body)).toEqual(strip(absent.body));
    expect((await reloadMembership(mid)).state).toBe("invited"); // untouched.

    // The OPTIONAL body token, supplied stale → the in-register VALIDATION 400.
    const stale = await handleAcceptInvitation(
      { targetMembershipId: mid, updatedAt: new Date(row.updatedAt.getTime() - 1000) },
      deps(invitee.authUserId, key()),
    );
    expect(stale.status).toBe(400);

    // Absent Idempotency-Key → 400 (Doc-5C §4.3 mandatory header).
    const noKey = await handleAcceptInvitation(
      { targetMembershipId: mid },
      deps(invitee.authUserId, null),
    );
    expect(noKey.status).toBe(400);

    // Accept (fresh token view) → 200; accept AGAIN (new key) → 409 (already accepted).
    const ok = await handleAcceptInvitation(
      { targetMembershipId: mid },
      deps(invitee.authUserId, key()),
    );
    expect(ok.status).toBe(200);
    const again = await handleAcceptInvitation(
      { targetMembershipId: mid },
      deps(invitee.authUserId, key()),
    );
    expect(again.status).toBe(409);
    expect((again.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_membership_state_invalid",
    );

    // Revoked invitation (the `removed` terminal — the frozen "already accepted/expired" STATE
    // binding): revoke through the wire, then accept → 409.
    const invitee2 = await freshUser();
    const invited2 = await handleInviteMember(
      { email: invitee2.email, roleId: officerRoleId },
      deps(owner.authUserId, key()),
    );
    const mid2 = (invited2.body as { result: { membershipId: string } }).result.membershipId;
    const row2 = await reloadMembership(mid2);
    const revoked = await handleRevokeInvitation(
      { targetMembershipId: mid2, updatedAt: row2.updatedAt },
      deps(owner.authUserId, key()),
    );
    expect(revoked.status).toBe(200);
    const acceptRevoked = await handleAcceptInvitation(
      { targetMembershipId: mid2 },
      deps(invitee2.authUserId, key()),
    );
    expect(acceptRevoked.status).toBe(409);
    expect((acceptRevoked.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_membership_state_invalid",
    );
  });

  // ════ C. `set_membership_status` — suspend ⇄ reinstate (§5.5-guarded SUSPEND leg) ════

  it("SET-STATUS wire: suspend → 200 + membership_suspended audit (reason recorded) + LIVE check_permission flips allow→deny; reinstate → 200 + membership_reinstated + allow again; the SUSPEND-direction guard: sole active Owner → 422 last_owner_block (row unchanged, zero audit) but permitted with a second active Owner", async () => {
    const owner = await freshUser();
    const manager = await freshUser();
    const org = await freshOrg({
      tag: "SetStatus",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: manager.id, roleId: managerRoleId },
      ],
    });
    const managerRow = org.members[1]!;

    // Before: the Manager bundle holds can_manage_users → allow through the LIVE path.
    expect(
      (
        await checkPermission({
          userId: manager.id,
          organizationId: org.id,
          permissionSlug: "can_manage_users",
        })
      ).decision,
    ).toBe("allow");

    // Suspend (by the Owner) — 200; state + fresh token in the §C6 response.
    const suspended = await handleSetMembershipStatus(
      {
        targetMembershipId: managerRow.membershipId,
        targetStatus: "suspended",
        reason: "leave of absence",
        updatedAt: managerRow.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(suspended.status).toBe(200);
    const suspendedResult = (
      suspended.body as { result: { membershipId: string; state: string; updatedAt: Date } }
    ).result;
    expect(suspendedResult.state).toBe("suspended");
    expect(suspendedResult.updatedAt).toBeTruthy();

    // 8E: suspended ∉ the access formula — the LIVE authorization path now DENIES (Doc-2 §5.2).
    expect(
      (
        await checkPermission({
          userId: manager.id,
          organizationId: org.id,
          permissionSlug: "can_manage_users",
        })
      ).decision,
    ).toBe("deny");

    const afterSuspend = await membershipAudits([managerRow.membershipId]);
    expect(afterSuspend).toHaveLength(1);
    expect(afterSuspend[0]!.action).toBe("membership_suspended");
    expect(afterSuspend[0]!.actorType).toBe("user");
    expect(afterSuspend[0]!.newValue).toMatchObject({
      state: "suspended",
      reason: "leave of absence",
    });

    // Reinstate — 200; the DISTINCT serialization token of the ONE §9 "membership suspend"
    // action (reinstate covered-by-suspend, PassB:397/PA-02); allow restored.
    const fresh = await reloadMembership(managerRow.membershipId);
    const reinstated = await handleSetMembershipStatus(
      {
        targetMembershipId: managerRow.membershipId,
        targetStatus: "active",
        updatedAt: fresh.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(reinstated.status).toBe(200);
    expect(
      (
        await checkPermission({
          userId: manager.id,
          organizationId: org.id,
          permissionSlug: "can_manage_users",
        })
      ).decision,
    ).toBe("allow");
    const afterReinstate = await membershipAudits([managerRow.membershipId]);
    expect(afterReinstate.map((a) => a.action)).toEqual([
      "membership_suspended",
      "membership_reinstated",
    ]);

    // ── THE §5.5 SUSPEND-DIRECTION GUARD (discriminating pair — Master Architecture §5.5). ──
    const ownerRow = await reloadMembership(org.members[0]!.membershipId);
    const blocked = await handleSetMembershipStatus(
      {
        targetMembershipId: ownerRow.id,
        targetStatus: "suspended",
        updatedAt: ownerRow.updatedAt,
      },
      deps(manager.authUserId, key()),
    );
    expect(blocked.status).toBe(422);
    expect((blocked.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_last_owner_block",
    );
    expect((await reloadMembership(ownerRow.id)).state).toBe("active"); // untouched.
    expect(
      (await membershipAudits([ownerRow.id])).filter((a) => a.action === "membership_suspended"),
    ).toHaveLength(0); // zero phantom audit on the blocked path.

    // With a SECOND active Owner the same mutation is PERMITTED (the guard's other conjunct).
    const secondOwner = await freshUser();
    await prisma.membership.create({
      data: {
        id: uuidv7(),
        organizationId: org.id,
        userId: secondOwner.id,
        roleId: ownerRoleId,
        state: "active",
      },
    });
    const permitted = await handleSetMembershipStatus(
      {
        targetMembershipId: ownerRow.id,
        targetStatus: "suspended",
        updatedAt: (await reloadMembership(ownerRow.id)).updatedAt,
      },
      deps(manager.authUserId, key()),
    );
    expect(permitted.status).toBe(200);
    expect(await activeOwnerCount(org.id)).toBe(1); // ≥1 active Owner ALWAYS remains (§5.5).
  });

  it("SET-STATUS register + contract-edge gating: `pending → active` (the System activation edge) is NOT drivable through this contract → 409 (machine-legal, contract-illegal); suspend an invited row → 409 (no ETag); reinstate an active row → 409; stale token → 400; foreign id → 404 byte-identical; Officer → 403; bogus enum → 400", async () => {
    const owner = await freshUser();
    const officer = await freshUser();
    const pendingUser = await freshUser();
    const invitedUser = await freshUser();
    const org = await freshOrg({
      tag: "SetStatusGuards",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: officer.id, roleId: officerRoleId },
        { userId: pendingUser.id, roleId: officerRoleId, state: "pending" },
        { userId: invitedUser.id, roleId: officerRoleId, state: "invited" },
      ],
    });
    const officerRow = org.members[1]!;
    const pendingRow = org.members[2]!;
    const invitedRow = org.members[3]!;

    // THE KEY 8E DISCRIMINATION (RV-0150 Adjudication-3 class): `pending → active` IS a legal
    // Doc-2 §5.2 machine edge — but it belongs to the System `activate_membership` (IDN-5), NOT
    // to this contract (§C6 PassB:395: `active ⇄ suspended` only). The wire must NOT activate.
    const activatePending = await handleSetMembershipStatus(
      {
        targetMembershipId: pendingRow.membershipId,
        targetStatus: "active",
        updatedAt: pendingRow.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(activatePending.status).toBe(409);
    expect(activatePending.headers?.ETag).toBeUndefined(); // contract-illegal leg: NO token (call-13).
    expect((await reloadMembership(pendingRow.membershipId)).state).toBe("pending");

    // Suspend an INVITED row → 409 (not an `active ⇄ suspended` source); no ETag.
    const suspendInvited = await handleSetMembershipStatus(
      {
        targetMembershipId: invitedRow.membershipId,
        targetStatus: "suspended",
        updatedAt: invitedRow.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(suspendInvited.status).toBe(409);
    expect(suspendInvited.headers?.ETag).toBeUndefined();

    // Reinstate an ACTIVE row → 409 (wrong direction).
    const reinstateActive = await handleSetMembershipStatus(
      {
        targetMembershipId: officerRow.membershipId,
        targetStatus: "active",
        updatedAt: officerRow.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(reinstateActive.status).toBe(409);

    // Stale body token → the in-register VALIDATION 400 (no §C6 CONFLICT code exists).
    const stale = await handleSetMembershipStatus(
      {
        targetMembershipId: officerRow.membershipId,
        targetStatus: "suspended",
        updatedAt: new Date(officerRow.updatedAt.getTime() - 1000),
      },
      deps(owner.authUserId, key()),
    );
    expect(stale.status).toBe(400);

    // Foreign membership id → 404 BYTE-IDENTICAL to nonexistent (§7.5 collapse).
    const foreignOrg = await freshOrg({
      tag: "SetStatusForeign",
      members: [{ userId: (await freshUser()).id, roleId: ownerRoleId }],
    });
    const foreign = await handleSetMembershipStatus(
      {
        targetMembershipId: foreignOrg.members[0]!.membershipId,
        targetStatus: "suspended",
        updatedAt: foreignOrg.members[0]!.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    const absent = await handleSetMembershipStatus(
      { targetMembershipId: uuidv7(), targetStatus: "suspended", updatedAt: new Date() },
      deps(owner.authUserId, key()),
    );
    expect(foreign.status).toBe(404);
    expect(absent.status).toBe(404);
    expect(strip(foreign.body)).toEqual(strip(absent.body));

    // AUTHZ: Officer → uniform 403. SYNTAX: bogus enum → 400.
    const forbidden = await handleSetMembershipStatus(
      {
        targetMembershipId: officerRow.membershipId,
        targetStatus: "suspended",
        updatedAt: officerRow.updatedAt,
      },
      deps(officer.authUserId, key()),
    );
    expect(forbidden.status).toBe(403);
    const bogus = await handleSetMembershipStatus(
      {
        targetMembershipId: officerRow.membershipId,
        // @ts-expect-error — the wire can carry anything; SYNTAX must reject it.
        targetStatus: "banned",
        updatedAt: officerRow.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(bogus.status).toBe(400);
  });

  // ════ D. `remove_member` — active|suspended → removed (terminal; §5.5-guarded) ════

  it("REMOVE wire: active AND suspended sources → 200 removed (terminal; deletedAt NULL — state is the authority, audit retained); audit membership_removed (User; old state discriminates); an INVITED row is NOT removable here (revoke's edge) → 409; guard: sole active Owner → 422 (zero audit) but permitted with a second Owner", async () => {
    const owner = await freshUser();
    const activeMember = await freshUser();
    const suspendedMember = await freshUser();
    const invitedMember = await freshUser();
    const org = await freshOrg({
      tag: "Remove",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: activeMember.id, roleId: officerRoleId },
        { userId: suspendedMember.id, roleId: officerRoleId, state: "suspended" },
        { userId: invitedMember.id, roleId: officerRoleId, state: "invited" },
      ],
    });
    const [ownerRow, activeRow, suspendedRow, invitedRow] = org.members as [
      { membershipId: string; updatedAt: Date },
      { membershipId: string; updatedAt: Date },
      { membershipId: string; updatedAt: Date },
      { membershipId: string; updatedAt: Date },
    ];

    // `active → removed` (frozen source 1).
    const r1 = await handleRemoveMember(
      {
        targetMembershipId: activeRow.membershipId,
        reason: "offboarded",
        updatedAt: activeRow.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(r1.status).toBe(200);
    expect((r1.body as { result: { state: string } }).result.state).toBe("removed");
    const removedRow = await reloadMembership(activeRow.membershipId);
    expect(removedRow.state).toBe("removed");
    expect(removedRow.deletedAt).toBeNull(); // terminal STATE, not a soft-delete marker (IDN-5 posture).
    const a1 = await membershipAudits([activeRow.membershipId]);
    expect(a1).toHaveLength(1);
    expect(a1[0]!.action).toBe("membership_removed");
    expect(a1[0]!.actorType).toBe("user");
    expect(a1[0]!.oldValue).toMatchObject({ state: "active" });
    expect(a1[0]!.newValue).toMatchObject({ state: "removed", reason: "offboarded" });

    // `suspended → removed` (frozen source 2).
    const r2 = await handleRemoveMember(
      { targetMembershipId: suspendedRow.membershipId, updatedAt: suspendedRow.updatedAt },
      deps(owner.authUserId, key()),
    );
    expect(r2.status).toBe(200);

    // An INVITED row is NOT this contract's edge (revoke/expire own `invited → removed`) —
    // machine-legal, contract-illegal → 409; row untouched.
    const r3 = await handleRemoveMember(
      { targetMembershipId: invitedRow.membershipId, updatedAt: invitedRow.updatedAt },
      deps(owner.authUserId, key()),
    );
    expect(r3.status).toBe(409);
    expect(r3.headers?.ETag).toBeUndefined();
    expect((await reloadMembership(invitedRow.membershipId)).state).toBe("invited");

    // ── THE §5.5 GUARD (discriminating pair). Sole active Owner → 422; nothing written. ──
    const blocked = await handleRemoveMember(
      {
        targetMembershipId: ownerRow.membershipId,
        updatedAt: (await reloadMembership(ownerRow.membershipId)).updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(blocked.status).toBe(422);
    expect((blocked.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_last_owner_block",
    );
    expect((await reloadMembership(ownerRow.membershipId)).state).toBe("active");
    expect(
      (await membershipAudits([ownerRow.membershipId])).filter(
        (a) => a.action === "membership_removed",
      ),
    ).toHaveLength(0);

    // Second active Owner present → the SAME mutation is permitted; ≥1 active Owner remains.
    const secondOwner = await freshUser();
    await prisma.membership.create({
      data: {
        id: uuidv7(),
        organizationId: org.id,
        userId: secondOwner.id,
        roleId: ownerRoleId,
        state: "active",
      },
    });
    const permitted = await handleRemoveMember(
      {
        targetMembershipId: ownerRow.membershipId,
        updatedAt: (await reloadMembership(ownerRow.membershipId)).updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(permitted.status).toBe(200);
    expect(await activeOwnerCount(org.id)).toBe(1);
  });

  // ════ E. `revoke_invitation` — invited → removed (terminal; NOT guarded) ════

  it("REVOKE wire: invited → 200 removed (terminal; audit membership_removed, old state invited); an ACTIVE membership is NOT revocable (use remove_member) → 409; revoke again → 409; stale → 400; foreign → 404; NOT §5.5-guarded — an invitation in a SOLE-Owner org revokes clean (200, no 422)", async () => {
    const owner = await freshUser();
    const invitedUser = await freshUser();
    const activeMember = await freshUser();
    const org = await freshOrg({
      tag: "Revoke",
      members: [
        { userId: owner.id, roleId: ownerRoleId }, // the SOLE active Owner — the not-guarded pin.
        { userId: invitedUser.id, roleId: officerRoleId, state: "invited" },
        { userId: activeMember.id, roleId: officerRoleId },
      ],
    });
    const invitedRow = org.members[1]!;
    const activeRow = org.members[2]!;

    // NOT-GUARDED DISCRIMINATION (frozen derivation pin): the org has exactly ONE active Owner,
    // yet the revoke is clean — the frozen §C6 revoke register authors NO §5.5 stage (an
    // `invited` row is never in the active-Owner set).
    expect(await activeOwnerCount(org.id)).toBe(1);
    const revoked = await handleRevokeInvitation(
      { targetMembershipId: invitedRow.membershipId, updatedAt: invitedRow.updatedAt },
      deps(owner.authUserId, key()),
    );
    expect(revoked.status).toBe(200);
    expect((revoked.body as { result: { state: string } }).result.state).toBe("removed");
    const row = await reloadMembership(invitedRow.membershipId);
    expect(row.state).toBe("removed");
    const audits = await membershipAudits([invitedRow.membershipId]);
    expect(audits).toHaveLength(1);
    expect(audits[0]!.action).toBe("membership_removed");
    expect(audits[0]!.actorType).toBe("user");
    expect(audits[0]!.oldValue).toMatchObject({ state: "invited" });

    // Revoke AGAIN (terminal) → 409; an ACTIVE membership → 409 ("use remove_member").
    const again = await handleRevokeInvitation(
      { targetMembershipId: invitedRow.membershipId, updatedAt: row.updatedAt },
      deps(owner.authUserId, key()),
    );
    expect(again.status).toBe(409);
    const wrongState = await handleRevokeInvitation(
      { targetMembershipId: activeRow.membershipId, updatedAt: activeRow.updatedAt },
      deps(owner.authUserId, key()),
    );
    expect(wrongState.status).toBe(409);
    expect((await reloadMembership(activeRow.membershipId)).state).toBe("active");

    // Stale token → 400; foreign id → 404 byte-identical to nonexistent.
    const stale = await handleRevokeInvitation(
      {
        targetMembershipId: activeRow.membershipId,
        updatedAt: new Date(activeRow.updatedAt.getTime() - 1000),
      },
      deps(owner.authUserId, key()),
    );
    expect(stale.status).toBe(400);
    const foreignOrg = await freshOrg({
      tag: "RevokeForeign",
      members: [{ userId: (await freshUser()).id, roleId: officerRoleId, state: "invited" }],
    });
    const foreign = await handleRevokeInvitation(
      {
        targetMembershipId: foreignOrg.members[0]!.membershipId,
        updatedAt: foreignOrg.members[0]!.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    const absent = await handleRevokeInvitation(
      { targetMembershipId: uuidv7(), updatedAt: new Date() },
      deps(owner.authUserId, key()),
    );
    expect(foreign.status).toBe(404);
    expect(absent.status).toBe(404);
    expect(strip(foreign.body)).toEqual(strip(absent.body));
  });

  // ════ F. The RV-0150 guarded-set race shapes — interleave-real (probe-held locks) ════

  it("RACE PROBE (remove ∥ remove, distinct Owners — the T6-F1 shape): both commands OBSERVED lock-waiting at the FOR-UPDATE resolver before either commits; release → they SERIALIZE — exactly one wins, the loser re-reads committed facts and hits the §5.5 block; the org NEVER goes ownerless", async () => {
    const ownerA = await freshUser();
    const ownerB = await freshUser();
    const org = await freshOrg({
      tag: "RemoveRace",
      members: [
        { userId: ownerA.id, roleId: ownerRoleId },
        { userId: ownerB.id, roleId: ownerRoleId },
      ],
    });
    const rowA = org.members[0]!;
    const rowB = org.members[1]!;

    // The probe holds FOR UPDATE on BOTH active-Owner rows: each command's `lockActiveOwnerRows`
    // (the RV-0150 set-level lock) blocks behind it — both mutations are IN FLIGHT and OBSERVED
    // waiting before either can decide. (Sabotage direction: with the resolver lock deleted, the
    // commands would instead block at their CAS UPDATEs on the probe's row locks, then BOTH
    // commit after release → 0 active Owners → this probe reds on the invariant.)
    const probe = await holdMembershipRowLocks([rowA.membershipId, rowB.membershipId]);

    const removeBbyA = handleRemoveMember(
      { targetMembershipId: rowB.membershipId, updatedAt: rowB.updatedAt },
      deps(ownerA.authUserId, key()),
    );
    const removeAbyB = handleRemoveMember(
      { targetMembershipId: rowA.membershipId, updatedAt: rowA.updatedAt },
      deps(ownerB.authUserId, key()),
    );
    await waitForLockWaiters(2, "two owner-removals at the FOR-UPDATE resolver");
    probe.release();
    await probe.done;

    const [r1, r2] = await Promise.all([removeBbyA, removeAbyB]);
    const statuses = [r1.status, r2.status].sort((a, b) => a - b);
    expect(statuses).toEqual([200, 422]); // exactly-one-wins — never both.
    const loser = r1.status === 422 ? r1 : r2;
    expect((loser.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_last_owner_block",
    );

    // THE §5.5 INVARIANT (the discriminating post-state): exactly ONE live active Owner remains.
    expect(await activeOwnerCount(org.id)).toBe(1);
    // Exactly ONE removal audit across the two owner rows (the loser wrote nothing).
    const audits = await membershipAudits([rowA.membershipId, rowB.membershipId]);
    expect(audits.filter((a) => a.action === "membership_removed")).toHaveLength(1);
  });

  it("RACE PROBE (suspend ∥ suspend, distinct Owners — the suspend-leg lock discriminator): both suspends OBSERVED waiting at the resolver; release → serialize — exactly one 200, the loser 422; never zero active Owners", async () => {
    const ownerA = await freshUser();
    const ownerB = await freshUser();
    const org = await freshOrg({
      tag: "SuspendRace",
      members: [
        { userId: ownerA.id, roleId: ownerRoleId },
        { userId: ownerB.id, roleId: ownerRoleId },
      ],
    });
    const rowA = org.members[0]!;
    const rowB = org.members[1]!;

    // Without the suspend leg's resolver lock, both guards would read `otherActiveOwnerCount = 1`
    // while the probe holds both rows (both commands pre-read before blocking at their CAS), then
    // BOTH would commit after release → 0 active Owners — this probe reds deterministically.
    const probe = await holdMembershipRowLocks([rowA.membershipId, rowB.membershipId]);

    const suspendBbyA = handleSetMembershipStatus(
      {
        targetMembershipId: rowB.membershipId,
        targetStatus: "suspended",
        updatedAt: rowB.updatedAt,
      },
      deps(ownerA.authUserId, key()),
    );
    const suspendAbyB = handleSetMembershipStatus(
      {
        targetMembershipId: rowA.membershipId,
        targetStatus: "suspended",
        updatedAt: rowA.updatedAt,
      },
      deps(ownerB.authUserId, key()),
    );
    await waitForLockWaiters(2, "two owner-suspends at the FOR-UPDATE resolver");
    probe.release();
    await probe.done;

    const [r1, r2] = await Promise.all([suspendBbyA, suspendAbyB]);
    const statuses = [r1.status, r2.status].sort((a, b) => a - b);
    expect(statuses).toEqual([200, 422]);
    const loser = r1.status === 422 ? r1 : r2;
    expect((loser.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_org_last_owner_block",
    );
    expect(await activeOwnerCount(org.id)).toBe(1);
  });

  it("RACE PROBE (same-row remove ∥ remove — the losing-write leg): both removals of ONE member serialize on the owner-row lock set; the loser's CAS matches zero rows → the in-register STATE 409 CARRYING the current token as `ETag` (Doc-5A §9.5/§9.6); exactly one removal, one audit", async () => {
    const owner = await freshUser();
    const member = await freshUser();
    const org = await freshOrg({
      tag: "SameRowRace",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: member.id, roleId: officerRoleId },
      ],
    });
    const ownerRow = org.members[0]!;
    const memberRow = org.members[1]!;

    // Hold the OWNER row (the resolver's lock set — the non-owner target is not in it): both
    // removals block at the resolver, both demonstrably in flight, then serialize on release.
    const probe = await holdMembershipRowLocks([ownerRow.membershipId]);

    const fire = () =>
      handleRemoveMember(
        { targetMembershipId: memberRow.membershipId, updatedAt: memberRow.updatedAt },
        deps(owner.authUserId, key()), // DIFFERENT keys — two real submissions, not a replay.
      );
    const p1 = fire();
    const p2 = fire();
    await waitForLockWaiters(2, "two same-row removals at the FOR-UPDATE resolver");
    probe.release();
    await probe.done;

    const [r1, r2] = await Promise.all([p1, p2]);
    const statuses = [r1.status, r2.status].sort((a, b) => a - b);
    expect(statuses).toEqual([200, 409]);
    const loser = r1.status === 409 ? r1 : r2;
    expect((loser.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_membership_state_invalid",
    );
    // The LOSING-WRITE leg carries the CURRENT token as `ETag` (call-13: losing-write ONLY).
    const finalRow = await reloadMembership(memberRow.membershipId);
    expect(finalRow.state).toBe("removed");
    expect(loser.headers?.ETag).toBe(concurrencyEtag(finalRow.updatedAt));
    expect(
      (await membershipAudits([memberRow.membershipId])).filter(
        (a) => a.action === "membership_removed",
      ),
    ).toHaveLength(1);
  });

  // ════ G. D7 rollback direction (the audited-write invariant) ════

  it("D7 rollback direction: a failing audit append inside the tenant tx rolls the membership write back — no write without an audit row", async () => {
    const owner = await freshUser();
    const member = await freshUser();
    const org = await freshOrg({
      tag: "D7Rollback",
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: member.id, roleId: managerRoleId },
      ],
    });
    const memberRow = org.members[1]!;

    await expect(
      withActiveOrgContext(
        { userId: owner.id, activeOrgId: org.id, isPlatformStaff: false },
        (tx) =>
          setMembershipStatus(
            {
              targetMembershipId: memberRow.membershipId,
              targetStatus: "suspended",
              updatedAt: memberRow.updatedAt,
            },
            { userId: owner.id, activeOrgId: org.id },
            {
              appendAuditRecord: async () => {
                throw new Error("injected audit failure (D7 direction-1 probe)");
              },
            },
            tx,
          ),
      ),
    ).rejects.toThrow("injected audit failure");

    // The write rolled back WITH the failed audit: state untouched, zero audit rows.
    expect((await reloadMembership(memberRow.membershipId)).state).toBe("active");
    expect(await membershipAudits([memberRow.membershipId])).toHaveLength(0);
  });
});
