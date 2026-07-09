import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { appendAuditRecord, configValueQuery } from "../../src/modules/core/contracts";
import {
  activateMembership,
  assertMembershipTransition,
  assertOrganizationTransition,
  assertUserTransition,
  canTransitionMembership,
  canTransitionOrganization,
  canTransitionUser,
  evaluateLastOwnerProtection,
  evaluateOwnershipSuccession,
  expireInvitations,
  IllegalMembershipTransitionError,
  IllegalOrganizationTransitionError,
  IllegalUserTransitionError,
  membershipParticipatesInAccessFormula,
  organizationParticipatesInAccessFormula,
  resolveOwnerRemovalFacts,
  TERMINAL_MEMBERSHIP_STATES,
  TERMINAL_ORGANIZATION_STATUSES,
  TERMINAL_USER_STATUSES,
  UnresolvableOwnerRoleError,
  type MembershipState,
  type OrganizationStatus,
  type UserStatus,
} from "../../src/modules/identity/contracts";

// W2-IDN-5 — the org + membership + user state machines (Doc-2 §5.1/§5.2 + Doc-4C §C4/§C5/§C6 authored State Effects),
// their service-layer guards (Last-Owner Protection, Ownership Succession, only-active-participates), and the
// two out-of-wire System timers (`activate_membership` `pending → active`; `expire_invitation` `invited →
// removed`) — every timer mutation an AUDITED, ATOMIC, System-attributed write (the D7 pattern). Proven vs
// REAL PostgreSQL through the M1 CONTRACT surface ONLY (the frozen boundary rule — tests never import module
// internals; the machines/guards are pure and re-exported on the contracts face, exactly as `check_permission`
// exposes the permission policy). The wired transition COMMANDS (invite/accept/suspend/remove/transfer) are
// W2-IDN-6.2's; the matrices below prove EVERY legal/illegal edge on the machine, which those commands consult.

// ── Deterministic fixtures (UUIDv7-shaped: version nibble 7, variant 8..b; 0xd5 = W2-IDN-5 namespace). ──
const ORG_ACTIVE = "01920000-0000-7000-8000-0000000d5a01"; // an `active` org (membership lifecycle)
const ORG_SUSPENDED = "01920000-0000-7000-8000-0000000d5a02"; // a `suspended` org (activate precondition)
const CUSTOM_ROLE = "01920000-0000-7000-8000-0000000d5a03"; // a non-Owner custom role in ORG_ACTIVE
const USER_SUSPENDED = "01920000-0000-7000-8000-0000000d5a04"; // a `suspended` user (activate precondition)

const FIXED_NOW = new Date("2400-06-01T00:00:00.000Z");
const LAPSED_CREATED = new Date("2400-01-01T00:00:00.000Z"); // ~5 months before NOW → past a 7d window
const FRESH_CREATED = new Date("2400-05-30T00:00:00.000Z"); // 2 days before NOW → inside a 7d window

// The `system_configuration` STORE key (natural key = `<domain>.<key_name>`; the reader strips the fixed
// `core.system_configuration.` reference prefix). Bound by pointer to Doc-4C §C6 `[DC-5]`
// (`identity.membership_invite_expiry_window`); UNSEEDED until W2-IDN-7 — seeded test-scoped only, swept in
// afterAll (never pre-empting the IDN-7 seed).
const INVITE_WINDOW_KEY = "identity.membership_invite_expiry_window";

let ownerRoleId: string;

/** Mint a fresh active user (fresh UUIDv7) — avoids the `(user_id, organization_id)` partial-unique collision
 *  when a test seeds several memberships in one org. */
async function freshUser(
  status: "active" | "suspended" | "soft_deleted" = "active",
): Promise<string> {
  const id = uuidv7();
  await prisma.user.create({ data: { id, status } });
  return id;
}

/** Seed one membership (fresh UUIDv7) at `state`. When `userId` is omitted a fresh active user is minted. */
async function seedMembership(params: {
  organizationId: string;
  roleId: string;
  state: MembershipState;
  userId?: string;
  createdAt?: Date;
}): Promise<{ id: string; userId: string; updatedAt: Date }> {
  const userId = params.userId ?? (await freshUser());
  const id = uuidv7();
  const row = await prisma.membership.create({
    data: {
      id,
      organizationId: params.organizationId,
      userId,
      roleId: params.roleId,
      state: params.state,
      ...(params.createdAt !== undefined ? { createdAt: params.createdAt } : {}),
    },
  });
  return { id: row.id, userId, updatedAt: row.updatedAt };
}

async function auditFor(membershipId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType: "membership", entityId: membershipId },
    orderBy: { eventTime: "asc" },
  });
}

/** All seeded test users/memberships hang off the two test orgs — clean them between and after runs. */
async function cleanupMembershipsAndUsers() {
  const memberships = await prisma.membership.findMany({
    where: { organizationId: { in: [ORG_ACTIVE, ORG_SUSPENDED] } },
    select: { userId: true },
  });
  await prisma.membership.deleteMany({
    where: { organizationId: { in: [ORG_ACTIVE, ORG_SUSPENDED] } },
  });
  const userIds = [...new Set(memberships.map((m) => m.userId))].filter(
    (u) => u !== USER_SUSPENDED,
  );
  if (userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
}

describe("W2-IDN-5 org/membership/user lifecycle machines, guards + System timers (real PostgreSQL)", () => {
  beforeAll(async () => {
    await prisma.organization.create({
      data: {
        id: ORG_ACTIVE,
        humanRef: `ORG-D5-${ORG_ACTIVE.slice(-6)}`,
        name: "IDN5 Active Org",
        slug: `idn5-${ORG_ACTIVE.slice(-6)}`,
        orgStatus: "active",
      },
    });
    await prisma.organization.create({
      data: {
        id: ORG_SUSPENDED,
        humanRef: `ORG-D5-${ORG_SUSPENDED.slice(-6)}`,
        name: "IDN5 Suspended Org",
        slug: `idn5-${ORG_SUSPENDED.slice(-6)}`,
        orgStatus: "suspended",
      },
    });
    await prisma.role.create({
      data: {
        id: CUSTOM_ROLE,
        organizationId: ORG_ACTIVE,
        name: "IDN5 Officer",
        isSystemBundle: false,
      },
    });
    await prisma.user.create({ data: { id: USER_SUSPENDED, status: "suspended" } });

    // The seeded Owner system-bundle role (migration seed §5.2): name='Owner', org_id NULL, bundle=true.
    const ownerRole = await prisma.role.findFirstOrThrow({
      where: { name: "Owner", organizationId: null, isSystemBundle: true, deletedAt: null },
      select: { id: true },
    });
    ownerRoleId = ownerRole.id;
  });

  beforeEach(cleanupMembershipsAndUsers);

  afterAll(async () => {
    await cleanupMembershipsAndUsers();
    await prisma.user.deleteMany({ where: { id: USER_SUSPENDED } });
    await prisma.role.deleteMany({ where: { id: CUSTOM_ROLE } });
    await prisma.organization.deleteMany({ where: { id: { in: [ORG_ACTIVE, ORG_SUSPENDED] } } });
    await prisma.systemConfiguration.deleteMany({ where: { key: INVITE_WINDOW_KEY } });
    await prisma.$disconnect();
  });

  // ── Organization state machine (Doc-2 §5.1) — full matrix ────────────────────────────────────
  it("ORG machine: every legal edge true, every illegal edge false; NO terminal state (restore reopens)", () => {
    const states: OrganizationStatus[] = ["active", "suspended", "soft_deleted"];
    // Doc-2 §5.1 VERBATIM legal set (5 edges).
    const legal = new Set([
      "active>suspended",
      "suspended>active",
      "active>soft_deleted",
      "suspended>soft_deleted",
      "soft_deleted>active",
    ]);
    for (const from of states) {
      for (const to of states) {
        expect(canTransitionOrganization(from, to)).toBe(legal.has(`${from}>${to}`));
      }
    }
    // No terminal state — `soft_deleted → active` (restore) keeps every state reopenable (§5.1).
    expect([...TERMINAL_ORGANIZATION_STATUSES]).toEqual([]);
    expect(canTransitionOrganization("soft_deleted", "active")).toBe(true);
    // `assertOrganizationTransition` throws the typed error on an illegal edge (fail-closed).
    expect(() => assertOrganizationTransition("soft_deleted", "suspended")).toThrow(
      IllegalOrganizationTransitionError,
    );
    expect(() => assertOrganizationTransition("active", "suspended")).not.toThrow();
  });

  // ── Membership state machine (Doc-2 §5.2) — full matrix ──────────────────────────────────────
  it("MEMBERSHIP machine: every legal edge true, every illegal edge false; `removed` is terminal", () => {
    const states: MembershipState[] = ["invited", "pending", "active", "suspended", "removed"];
    // Doc-2 §5.2 VERBATIM legal set (7 edges).
    const legal = new Set([
      "invited>pending",
      "pending>active",
      "active>suspended",
      "suspended>active",
      "active>removed",
      "suspended>removed",
      "invited>removed",
    ]);
    for (const from of states) {
      for (const to of states) {
        expect(canTransitionMembership(from, to)).toBe(legal.has(`${from}>${to}`));
      }
    }
    // `removed` is terminal — no outgoing legal edge (never reopens).
    expect([...TERMINAL_MEMBERSHIP_STATES]).toEqual(["removed"]);
    for (const to of states) expect(canTransitionMembership("removed", to)).toBe(false);
    expect(() => assertMembershipTransition("removed", "active")).toThrow(
      IllegalMembershipTransitionError,
    );
    // The two System-timer edges are present.
    expect(canTransitionMembership("pending", "active")).toBe(true); // activate_membership
    expect(canTransitionMembership("invited", "removed")).toBe(true); // expire_invitation
    // `invited → active` (Doc-4M's collapsed paraphrase) is NOT a real edge — activation is a separate step.
    expect(canTransitionMembership("invited", "active")).toBe(false);
  });

  // ── User state machine (Doc-4C §C4 authored State Effects) — full matrix ─────────────────────
  it("USER machine: every legal edge true, every illegal edge false; `soft_deleted` terminal (no restore)", () => {
    const states: UserStatus[] = ["active", "suspended", "soft_deleted"];
    // Doc-4C §C4 authored edges (4): active⇄suspended, active|suspended→soft_deleted.
    const legal = new Set([
      "active>suspended",
      "suspended>active",
      "active>soft_deleted",
      "suspended>soft_deleted",
    ]);
    for (const from of states) {
      for (const to of states) {
        expect(canTransitionUser(from, to)).toBe(legal.has(`${from}>${to}`));
      }
    }
    expect([...TERMINAL_USER_STATUSES]).toEqual(["soft_deleted"]);
    // NO user-restore edge is authored (asymmetric to Organization §5.1) — fail-closed.
    expect(canTransitionUser("soft_deleted", "active")).toBe(false);
    expect(() => assertUserTransition("soft_deleted", "active")).toThrow(
      IllegalUserTransitionError,
    );
    expect(() => assertUserTransition("active", "suspended")).not.toThrow();
  });

  // ── Guard: only `active` participates (Doc-2 §5.2 / Doc-4A §6.1) ──────────────────────────────
  it("GUARD only-active-participates: only `active` membership/org participates; all else fails closed", () => {
    const memStates: MembershipState[] = ["invited", "pending", "active", "suspended", "removed"];
    for (const s of memStates) {
      expect(membershipParticipatesInAccessFormula(s)).toBe(s === "active");
    }
    const orgStates: OrganizationStatus[] = ["active", "suspended", "soft_deleted"];
    for (const s of orgStates) {
      expect(organizationParticipatesInAccessFormula(s)).toBe(s === "active");
    }
  });

  // ── Guard: Last-Owner Protection (pure policy discrimination) ─────────────────────────────────
  it("GUARD last-owner (policy): blocks disabling the SOLE active Owner; permits when another Owner remains", () => {
    // Sole active Owner (target is Owner, no other) → BLOCKED (org would become ownerless).
    expect(
      evaluateLastOwnerProtection({ targetIsActiveOwner: true, otherActiveOwnerCount: 0 }).blocked,
    ).toBe(true);
    // Another active Owner remains → permitted (deleting the branch would flip this to blocked=false only if
    // the count check is dropped — the discriminator is the `=== 0`).
    expect(
      evaluateLastOwnerProtection({ targetIsActiveOwner: true, otherActiveOwnerCount: 1 }).blocked,
    ).toBe(false);
    // Target is NOT an active Owner → never blocked (a non-Owner removal can never orphan the org).
    expect(
      evaluateLastOwnerProtection({ targetIsActiveOwner: false, otherActiveOwnerCount: 0 }).blocked,
    ).toBe(false);
  });

  // ── Guard: Ownership Succession (pure policy discrimination) ──────────────────────────────────
  it("GUARD succession (policy): permitted only with an active new owner AND ≥1 resulting active Owner", () => {
    expect(
      evaluateOwnershipSuccession({
        newOwnerHasActiveMembership: true,
        resultingActiveOwnerCount: 1,
      }).permitted,
    ).toBe(true);
    // Inactive nominee → rejected (succession requires an active new owner).
    expect(
      evaluateOwnershipSuccession({
        newOwnerHasActiveMembership: false,
        resultingActiveOwnerCount: 1,
      }).permitted,
    ).toBe(false);
    // A result of 0 active Owners → rejected (org must never become ownerless).
    expect(
      evaluateOwnershipSuccession({
        newOwnerHasActiveMembership: true,
        resultingActiveOwnerCount: 0,
      }).permitted,
    ).toBe(false);
  });

  // ── Guard: Last-Owner facts resolved against real PostgreSQL (service-layer) ──────────────────
  it("GUARD last-owner (repo): resolves sole-Owner → block; second-Owner → permit; non-Owner → permit", async () => {
    // One active Owner in ORG_ACTIVE.
    const owner1 = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: ownerRoleId,
      state: "active",
    });
    let facts = await resolveOwnerRemovalFacts(ORG_ACTIVE, owner1.id);
    expect(facts).toEqual({ targetIsActiveOwner: true, otherActiveOwnerCount: 0 });
    expect(evaluateLastOwnerProtection(facts).blocked).toBe(true); // sole Owner → blocked

    // Add a second active Owner → the first is no longer sole.
    await seedMembership({ organizationId: ORG_ACTIVE, roleId: ownerRoleId, state: "active" });
    facts = await resolveOwnerRemovalFacts(ORG_ACTIVE, owner1.id);
    expect(facts).toEqual({ targetIsActiveOwner: true, otherActiveOwnerCount: 1 });
    expect(evaluateLastOwnerProtection(facts).blocked).toBe(false); // another Owner remains → permitted

    // A non-Owner (custom-role) member is never an active Owner target.
    const nonOwner = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: CUSTOM_ROLE,
      state: "active",
    });
    facts = await resolveOwnerRemovalFacts(ORG_ACTIVE, nonOwner.id);
    expect(facts.targetIsActiveOwner).toBe(false);
    expect(evaluateLastOwnerProtection(facts).blocked).toBe(false);
  });

  // ── Guard: Last-Owner resolver fail-CLOSED on a corrupt prerequisite (RV-0150 F2) ────────────
  it("GUARD last-owner (repo) fail-closed: an unresolvable seeded Owner role THROWS (never fabricates never-block facts)", async () => {
    // A real sole active Owner so the ONLY thing that can make the resolver misbehave is the missing role seed.
    const owner = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: ownerRoleId,
      state: "active",
    });
    // Soft-delete the seeded Owner system-bundle role INSIDE a transaction, resolve within the SAME tx, and let
    // the throw roll the deletion back (the global migration seed is never persisted away). If someone restores
    // the old silent `{ targetIsActiveOwner: false, otherActiveOwnerCount: 0 }` never-block return, the callback
    // RESOLVES (no throw) and this `.rejects` assertion FAILS — the discriminator is the loud throw on a corrupt
    // guard prerequisite, which on a lockout surface must never fail open (Master Architecture §5.5).
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.role.updateMany({
          where: { name: "Owner", organizationId: null, isSystemBundle: true, deletedAt: null },
          data: { deletedAt: FIXED_NOW },
        });
        return resolveOwnerRemovalFacts(ORG_ACTIVE, owner.id, tx);
      }),
    ).rejects.toThrow(UnresolvableOwnerRoleError);

    // The rollback restored the seed — the resolver works again (sole Owner → block), proving no persistent harm.
    const facts = await resolveOwnerRemovalFacts(ORG_ACTIVE, owner.id);
    expect(evaluateLastOwnerProtection(facts).blocked).toBe(true);
  });

  // ── System timer: expire_invitation (invited → removed) ──────────────────────────────────────
  it("EXPIRE_INVITATION: sweeps invited+lapsed → removed (System audit); leaves fresh/non-invited; idempotent", async () => {
    // Seed the invite-window POLICY test-scoped (unseeded until W2-IDN-7; swept in afterAll).
    await prisma.systemConfiguration.deleteMany({ where: { key: INVITE_WINDOW_KEY } });
    await prisma.systemConfiguration.create({
      data: { id: uuidv7(), key: INVITE_WINDOW_KEY, valueJsonb: "7d", valueType: "duration" },
    });

    const lapsed = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: CUSTOM_ROLE,
      state: "invited",
      createdAt: LAPSED_CREATED,
    });
    // A fresh invited membership (inside the window) — MUST NOT be swept.
    const fresh = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: CUSTOM_ROLE,
      state: "invited",
      createdAt: FRESH_CREATED,
    });
    // A pending (accepted, not yet activated) membership also aged — MUST NOT be swept (invited-only).
    const pending = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: CUSTOM_ROLE,
      state: "pending",
      createdAt: LAPSED_CREATED,
    });

    const first = await expireInvitations({
      appendAuditRecord,
      configValueQuery,
      now: () => FIXED_NOW,
    });
    expect(first.expired).toBe(1);
    expect((await prisma.membership.findFirst({ where: { id: lapsed.id } }))?.state).toBe(
      "removed",
    );
    expect((await prisma.membership.findFirst({ where: { id: fresh.id } }))?.state).toBe("invited");
    expect((await prisma.membership.findFirst({ where: { id: pending.id } }))?.state).toBe(
      "pending",
    );

    const audit = await auditFor(lapsed.id);
    expect(audit.map((a) => a.action)).toEqual(["membership_removed"]);
    expect(audit[0]!.actorType).toBe("system");
    expect(audit[0]!.actorId).toBeNull();
    expect(audit[0]!.organizationId).toBe(ORG_ACTIVE); // business context = the invitation's org
    expect(audit[0]!.oldValue).toMatchObject({ state: "invited" });
    expect(audit[0]!.newValue).toMatchObject({ state: "removed" });
    // The fresh + pending memberships carry NO audit row (no write ⇒ no audit).
    expect(await auditFor(fresh.id)).toHaveLength(0);
    expect(await auditFor(pending.id)).toHaveLength(0);

    // Idempotent — a removed invitation is never re-expired.
    const second = await expireInvitations({
      appendAuditRecord,
      configValueQuery,
      now: () => FIXED_NOW,
    });
    expect(second.expired).toBe(0);
  });

  it("EXPIRE_INVITATION window is POLICY-derived: an absent window key aborts the sweep (never a literal)", async () => {
    await prisma.systemConfiguration.deleteMany({ where: { key: INVITE_WINDOW_KEY } });
    await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: CUSTOM_ROLE,
      state: "invited",
      createdAt: LAPSED_CREATED,
    });
    // With NO window seeded, the config read yields no value → durationToMs throws → the sweep aborts rather
    // than expiring on an invented window (the "never a literal fallback" precedent).
    await expect(
      expireInvitations({ appendAuditRecord, configValueQuery, now: () => FIXED_NOW }),
    ).rejects.toThrow();
  });

  it("EXPIRE_INVITATION atomicity (dir 1): a failing audit append rolls back the state write (unchanged, unaudited)", async () => {
    await prisma.systemConfiguration.deleteMany({ where: { key: INVITE_WINDOW_KEY } });
    await prisma.systemConfiguration.create({
      data: { id: uuidv7(), key: INVITE_WINDOW_KEY, valueJsonb: "7d", valueType: "duration" },
    });
    const lapsed = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: CUSTOM_ROLE,
      state: "invited",
      createdAt: LAPSED_CREATED,
    });
    const failingAppend = (() =>
      Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;
    await expect(
      expireInvitations({
        appendAuditRecord: failingAppend,
        configValueQuery,
        now: () => FIXED_NOW,
      }),
    ).rejects.toThrow(/audit append failed/);
    // The whole pass transaction rolled back — the invitation is still invited and carries NO audit row.
    expect((await prisma.membership.findFirst({ where: { id: lapsed.id } }))?.state).toBe(
      "invited",
    );
    expect(await auditFor(lapsed.id)).toHaveLength(0);
  });

  // ── System timer: activate_membership (pending → active) ─────────────────────────────────────
  it("ACTIVATE_MEMBERSHIP: pending → active + a `membership_activated` System audit row (atomic)", async () => {
    const m = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: CUSTOM_ROLE,
      state: "pending",
    });
    const outcome = await activateMembership({ membershipId: m.id }, { appendAuditRecord });
    expect(outcome).toEqual({ activated: true });
    expect((await prisma.membership.findFirst({ where: { id: m.id } }))?.state).toBe("active");

    const audit = await auditFor(m.id);
    expect(audit.map((a) => a.action)).toEqual(["membership_activated"]);
    expect(audit[0]!.actorType).toBe("system");
    expect(audit[0]!.actorId).toBeNull();
    expect(audit[0]!.organizationId).toBe(ORG_ACTIVE);
    expect(audit[0]!.oldValue).toMatchObject({ state: "pending" });
    expect(audit[0]!.newValue).toMatchObject({ state: "active" });
  });

  it("ACTIVATE_MEMBERSHIP idempotent: an already-active membership is a no-op (no write, no new audit)", async () => {
    const m = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: CUSTOM_ROLE,
      state: "active",
    });
    const outcome = await activateMembership({ membershipId: m.id }, { appendAuditRecord });
    expect(outcome).toEqual({ activated: false, reason: "already_active" });
    expect(await auditFor(m.id)).toHaveLength(0);
  });

  it("ACTIVATE_MEMBERSHIP illegal state: a non-pending, non-active source is rejected (no write, no audit)", async () => {
    for (const state of ["invited", "suspended", "removed"] as const) {
      const m = await seedMembership({ organizationId: ORG_ACTIVE, roleId: CUSTOM_ROLE, state });
      const outcome = await activateMembership({ membershipId: m.id }, { appendAuditRecord });
      expect(outcome).toEqual({ activated: false, reason: "illegal_state" });
      expect((await prisma.membership.findFirst({ where: { id: m.id } }))?.state).toBe(state);
      expect(await auditFor(m.id)).toHaveLength(0);
    }
  });

  it("ACTIVATE_MEMBERSHIP precondition: a suspended org OR suspended user blocks activation (no write)", async () => {
    // Suspended ORG → precondition fails (org not `active`).
    const inSuspendedOrg = await seedMembership({
      organizationId: ORG_SUSPENDED,
      roleId: ownerRoleId, // any role; the org is the blocker here
      state: "pending",
    });
    const orgBlocked = await activateMembership(
      { membershipId: inSuspendedOrg.id },
      { appendAuditRecord },
    );
    expect(orgBlocked).toEqual({ activated: false, reason: "precondition" });
    expect((await prisma.membership.findFirst({ where: { id: inSuspendedOrg.id } }))?.state).toBe(
      "pending",
    );
    expect(await auditFor(inSuspendedOrg.id)).toHaveLength(0);

    // Suspended USER (in an active org) → precondition fails (user not `active`).
    const suspendedUserMembership = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: CUSTOM_ROLE,
      state: "pending",
      userId: USER_SUSPENDED,
    });
    const userBlocked = await activateMembership(
      { membershipId: suspendedUserMembership.id },
      { appendAuditRecord },
    );
    expect(userBlocked).toEqual({ activated: false, reason: "precondition" });
    expect(
      (await prisma.membership.findFirst({ where: { id: suspendedUserMembership.id } }))?.state,
    ).toBe("pending");
  });

  it("ACTIVATE_MEMBERSHIP not_found: an unknown membership id → not_found (no write)", async () => {
    const outcome = await activateMembership(
      { membershipId: "01920000-0000-7000-8000-0000000d5fee" },
      { appendAuditRecord },
    );
    expect(outcome).toEqual({ activated: false, reason: "not_found" });
  });

  it("ACTIVATE_MEMBERSHIP atomicity (dir 1): a failing audit append rolls back the state write (still pending)", async () => {
    const m = await seedMembership({
      organizationId: ORG_ACTIVE,
      roleId: CUSTOM_ROLE,
      state: "pending",
    });
    const failingAppend = (() =>
      Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;
    await expect(
      activateMembership({ membershipId: m.id }, { appendAuditRecord: failingAppend }),
    ).rejects.toThrow(/audit append failed/);
    // The activation rolled back — the membership is still pending and carries NO audit row.
    expect((await prisma.membership.findFirst({ where: { id: m.id } }))?.state).toBe("pending");
    expect(await auditFor(m.id)).toHaveLength(0);
  });
});
