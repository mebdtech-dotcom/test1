import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { concurrencyEtag } from "../../src/shared/http";
import type { ensureProvisioned } from "../../src/server/auth";
import {
  handleCreateDelegationGrant,
  handleGetDelegationGrant,
  handleListDelegationGrants,
  handleReinstateDelegationGrant,
  handleRevokeDelegationGrant,
  handleSuspendDelegationGrant,
  handleUpdateUser2faSettings,
  handleUpdateUserProfile,
} from "../../src/server/identity";
import {
  delegationGrantErrorResponse,
  type VendorProfileControlReader,
} from "../../src/modules/identity/contracts";

// W2-IDN-6.5 — the §C9 Delegation WIRED surface (Doc-5C §5.1, all 6 contracts) + the §B.6
// command-dedup replay store + the 6.1 §C4 Idempotency-Key retro-fit, Doc-8 band 8C:
// envelope (Doc-5A §5.6/§6.1/§8.6) · error class+status (§6.2, frozen §C9 registers) · idempotency
// INCL. the NEW §B.6 replay semantics (same key+window → the STORED response, single execution,
// ONE audit row — the §14.3 joint rule; different key → independent execution; post-window →
// re-execution; actor-scoped keys — the §7.5 poisoning guard) · prohibited fields (server-resolved
// context; unknown keys never reach a write) · actor-scope dual-party (reads both parties;
// writes controller-only; non-party byte-identical collapse) · the call-13 ETag leg discipline
// (losing-write carries the token; machine-illegal/boundary legs do not), vs REAL PostgreSQL
// through the composition surfaces ONLY (never module internals).

// ── Deterministic fixtures (UUIDv7-shaped: version nibble 7, variant 8..b; 0xd65 = W2-IDN-6.5). ──
const CTRL_ORG = "01920000-0000-7000-8000-0000000d6501";
const REP_ORG = "01920000-0000-7000-8000-0000000d6502";
const THIRD_ORG = "01920000-0000-7000-8000-0000000d6503";
const CTRL_ROLE = "01920000-0000-7000-8000-0000000d6511"; // holds can_manage_delegations
const REP_ROLE = "01920000-0000-7000-8000-0000000d6512"; // holds can_manage_delegations
const THIRD_ROLE = "01920000-0000-7000-8000-0000000d6513"; // holds can_manage_delegations
const CTRL_USER = "01920000-0000-7000-8000-0000000d6521";
const CTRL_USER_2 = "01920000-0000-7000-8000-0000000d6522"; // second ctrl-org manager (scope guard)
const REP_USER = "01920000-0000-7000-8000-0000000d6523";
const THIRD_USER = "01920000-0000-7000-8000-0000000d6524";
const CTRL_AUTH = "01920000-0000-7000-8000-0000000d6531";
const CTRL_AUTH_2 = "01920000-0000-7000-8000-0000000d6532";
const REP_AUTH = "01920000-0000-7000-8000-0000000d6533";
const THIRD_AUTH = "01920000-0000-7000-8000-0000000d6534";
const VENDOR_PROFILE = "01920000-0000-7000-8000-0000000d65f1"; // M2 bare UUID — controlled by CTRL_ORG

const FUTURE = new Date("2999-01-01T00:00:00.000Z");
const PAST_FROM = new Date("2020-01-01T00:00:00.000Z");
const PAST_TO = new Date("2020-06-01T00:00:00.000Z");

// The `[DC-5]` window keys' STORE natural keys (`<domain>.<key_name>` — the reader strips the fixed
// `core.system_configuration.` reference prefix). Bound by pointer to Doc-3 v1.9; UNSEEDED until
// W2-IDN-7 — seeded TEST-SCOPED here (the IDN-4/RV-0149-F4 posture) and swept in afterAll.
const COMMAND_DEDUP_STORE_KEY = "identity.command_dedup_window";
const USER_UPDATE_DEDUP_STORE_KEY = "identity.user_update_dedup_window";
const HOUR_MS = 3_600_000;

/** The M2 Vendor Service port stub (read-validation only): CTRL_ORG controls VENDOR_PROFILE. */
const control: VendorProfileControlReader = async (vp, org) =>
  vp === VENDOR_PROFILE && org === CTRL_ORG ? "controls" : "not_found";

/** The provisioning stub — fixtures are pre-seeded; the hook must not mint a personal org. */
const noProvision: typeof ensureProvisioned = async () => ({
  created: false,
  userId: "",
  organizationId: null,
  organizationHumanRef: null,
  ownerMembershipId: null,
});

const asSession = (authUserId: string) => async () => ({ authUserId });

function createDeps(authUserId: string, key: string | null | undefined) {
  return {
    resolveSession: asSession(authUserId),
    ensureProvisioned: noProvision,
    idempotencyKey: key,
    vendorProfileControlReader: control,
  };
}

function lifecycleDeps(authUserId: string, key: string | null | undefined) {
  return {
    resolveSession: asSession(authUserId),
    ensureProvisioned: noProvision,
    idempotencyKey: key,
  };
}

const readDeps = (authUserId: string) => ({
  resolveSession: asSession(authUserId),
  ensureProvisioned: noProvision,
});

/** The WIRE-SERIALIZED view of a response body (what `NextResponse.json` emits). The §9.3 replay
 *  identity is a WIRE property: the stored envelope round-trips jsonb (Date → ISO string), so the
 *  in-process comparison serializes both sides exactly as the transport would. */
const wireJson = (b: unknown): unknown => JSON.parse(JSON.stringify(b));

/** A plain timer sleep — the deliberate interleave window the §14.3 race test uses (the RV-0150
 *  serialization-test idiom) so the second request enters while the first is still in-flight. */
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const CREATE_INPUT = {
  representativeOrganizationId: REP_ORG,
  vendorProfileId: VENDOR_PROFILE,
  permissionSet: ["can_submit_quote"],
  validTo: FUTURE,
};

async function slugId(s: string): Promise<string> {
  return (await prisma.permission.findFirstOrThrow({ where: { slug: s } })).id;
}

async function grantAudits(grantId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType: "delegation_grant", entityId: grantId },
    orderBy: { eventTime: "asc" },
  });
}

async function seedGrant(params: {
  status: "draft" | "active" | "suspended" | "revoked" | "expired";
  validFrom?: Date;
  validTo?: Date | null;
}): Promise<{ id: string; updatedAt: Date }> {
  const row = await prisma.delegationGrant.create({
    data: {
      id: uuidv7(),
      controllingOrganizationId: CTRL_ORG,
      representativeOrganizationId: REP_ORG,
      vendorProfileId: VENDOR_PROFILE,
      permissionSetJsonb: ["can_submit_quote"],
      validFrom: params.validFrom ?? PAST_FROM,
      ...(params.validTo !== undefined && params.validTo !== null
        ? { validTo: params.validTo }
        : {}),
      grantedBy: CTRL_USER,
      status: params.status,
    },
  });
  return { id: row.id, updatedAt: row.updatedAt };
}

describe("W2-IDN-6.5 §C9 delegation wired surface + §B.6 replay store — 8C (real PostgreSQL)", () => {
  beforeAll(async () => {
    for (const [id, name] of [
      [CTRL_ORG, "IDN65 Controlling"],
      [REP_ORG, "IDN65 Representative"],
      [THIRD_ORG, "IDN65 Third"],
    ] as const) {
      await prisma.organization.create({
        data: { id, humanRef: `ORG-D65-${id.slice(-4)}`, name, slug: `idn65-${id.slice(-4)}` },
      });
    }
    for (const [id, auth] of [
      [CTRL_USER, CTRL_AUTH],
      [CTRL_USER_2, CTRL_AUTH_2],
      [REP_USER, REP_AUTH],
      [THIRD_USER, THIRD_AUTH],
    ] as const) {
      await prisma.user.create({ data: { id, authUserId: auth, status: "active" } });
    }
    for (const [id, orgId, name] of [
      [CTRL_ROLE, CTRL_ORG, "IDN65 Ctrl"],
      [REP_ROLE, REP_ORG, "IDN65 Rep"],
      [THIRD_ROLE, THIRD_ORG, "IDN65 Third"],
    ] as const) {
      await prisma.role.create({
        data: { id, organizationId: orgId, name, isSystemBundle: false },
      });
    }
    for (const [userId, orgId, roleId] of [
      [CTRL_USER, CTRL_ORG, CTRL_ROLE],
      [CTRL_USER_2, CTRL_ORG, CTRL_ROLE],
      [REP_USER, REP_ORG, REP_ROLE],
      [THIRD_USER, THIRD_ORG, THIRD_ROLE],
    ] as const) {
      await prisma.membership.create({
        data: { id: uuidv7(), organizationId: orgId, userId, roleId, state: "active" },
      });
    }
    // can_manage_delegations everywhere (so non-party probes pass AUTHZ and reach SCOPE) +
    // can_submit_quote in CTRL_ORG (the ⊆-held anchor for the issued permission_set).
    for (const [roleId, orgId, slugs] of [
      [CTRL_ROLE, CTRL_ORG, ["can_manage_delegations", "can_submit_quote"]],
      [REP_ROLE, REP_ORG, ["can_manage_delegations"]],
      [THIRD_ROLE, THIRD_ORG, ["can_manage_delegations"]],
    ] as const) {
      for (const s of slugs) {
        await prisma.rolePermission.create({
          data: { roleId, permissionId: await slugId(s), organizationId: orgId },
        });
      }
    }
    // TEST-SCOPED `[DC-5]` window seeds (unseeded until W2-IDN-7; swept in afterAll).
    for (const key of [COMMAND_DEDUP_STORE_KEY, USER_UPDATE_DEDUP_STORE_KEY]) {
      await prisma.systemConfiguration.deleteMany({ where: { key } });
      await prisma.systemConfiguration.create({
        data: { id: uuidv7(), key, valueJsonb: "24h", valueType: "duration" },
      });
    }
  });

  afterAll(async () => {
    await prisma.commandDedup.deleteMany({
      where: { actorUserId: { in: [CTRL_USER, CTRL_USER_2, REP_USER, THIRD_USER] } },
    });
    await prisma.systemConfiguration.deleteMany({
      where: { key: { in: [COMMAND_DEDUP_STORE_KEY, USER_UPDATE_DEDUP_STORE_KEY] } },
    });
    await prisma.delegationGrant.deleteMany({
      where: { controllingOrganizationId: { in: [CTRL_ORG, REP_ORG, THIRD_ORG] } },
    });
    await prisma.rolePermission.deleteMany({
      where: { roleId: { in: [CTRL_ROLE, REP_ROLE, THIRD_ROLE] } },
    });
    await prisma.membership.deleteMany({
      where: { userId: { in: [CTRL_USER, CTRL_USER_2, REP_USER, THIRD_USER] } },
    });
    await prisma.role.deleteMany({ where: { id: { in: [CTRL_ROLE, REP_ROLE, THIRD_ROLE] } } });
    await prisma.user.deleteMany({
      where: { id: { in: [CTRL_USER, CTRL_USER_2, REP_USER, THIRD_USER] } },
    });
    await prisma.organization.deleteMany({ where: { id: { in: [CTRL_ORG, REP_ORG, THIRD_ORG] } } });
    await prisma.$disconnect();
  });

  // ════ A. CREATE wire + the §B.6 replay store ════

  it("CREATE wire: 201 + Location + §5.6 envelope; §B.6 same-key replay → the STORED response (same reference_id), ONE grant, ONE audit; different key → an independent second execution", async () => {
    const key = `iv-k-${uuidv7()}`;
    const first = await handleCreateDelegationGrant(CREATE_INPUT, createDeps(CTRL_AUTH, key));
    expect(first.status).toBe(201);
    const firstBody = first.body as {
      result: { delegationGrantId: string; status: string };
      reference_id: string;
    };
    expect(firstBody.result.status).toBe("active");
    const grantId = firstBody.result.delegationGrantId;
    expect(first.headers?.Location).toBe(`/identity/delegation_grants/${grantId}`);
    expect((await grantAudits(grantId)).map((a) => a.action)).toEqual(["delegation_grant_issued"]);

    // SAFE REPLAY (Doc-5A §9.3 / §14.3 joint rule): same key within the window → the stored result,
    // the same status, the SAME ORIGINAL reference_id; NO second grant; NO second audit row.
    const replay = await handleCreateDelegationGrant(CREATE_INPUT, createDeps(CTRL_AUTH, key));
    expect(replay.status).toBe(201);
    expect(wireJson(replay.body)).toEqual(wireJson(first.body)); // byte-equal wire envelope incl. reference_id
    expect(replay.headers?.Location).toBe(first.headers?.Location);
    expect(
      await prisma.delegationGrant.count({
        where: { controllingOrganizationId: CTRL_ORG, status: "active" },
      }),
    ).toBe(1);
    expect((await grantAudits(grantId)).map((a) => a.action)).toEqual(["delegation_grant_issued"]);

    // DUPLICATE SUBMISSION (different key — Doc-5A §9.4 row 2): two INDEPENDENT executions.
    const other = await handleCreateDelegationGrant(
      CREATE_INPUT,
      createDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(other.status).toBe(201);
    const otherBody = other.body as { result: { delegationGrantId: string } };
    expect(otherBody.result.delegationGrantId).not.toBe(grantId);
    await prisma.delegationGrant.deleteMany({
      where: { id: { in: [grantId, otherBody.result.delegationGrantId] } },
    });
  });

  it("§14.3 IN-FLIGHT protection (RV-0153 F2): two RACING same-key creates — exactly ONE grant, ONE audit, both callers receive the byte-equal stored envelope, and the loser's business logic NEVER begins", async () => {
    // Doc-4A §14.3 (Pass4:159) verbatim: "A replay arriving while the original execution is still
    // in-flight MUST NOT begin a second execution of the command's business logic … duplicate
    // business outcomes … are prohibited under all timing conditions (completed, in-progress, or
    // concurrent)." The race shape (RV-0150 serialization-test idiom): T1 claims the key then
    // stalls INSIDE its command (a slow M2 reader — post-claim, pre-commit); T2 enters that
    // window, misses the lookup (T1 uncommitted), and hits the claim — where it must BLOCK on
    // T1's uncommitted claim row, LOSE, re-read, and return T1's stored §9.3 payload WITHOUT ever
    // running its own command. UNDER THE PRE-FIX (96a31eb) CODE this test goes RED on four
    // independent assertions: T2's reader is called (its business logic ran), TWO grants exist,
    // the bodies differ (two reference_ids), and the winner's dedup record is overwritten by the
    // loser (red-direction verified live before the fix landed).
    await prisma.delegationGrant.deleteMany({ where: { controllingOrganizationId: CTRL_ORG } });
    const key = `iv-k-${uuidv7()}`;
    let winnerReaderCalls = 0;
    let loserReaderCalls = 0;
    const slowWinnerReader: VendorProfileControlReader = async (vp, org) => {
      winnerReaderCalls += 1;
      await sleep(400); // hold the claim in-flight while T2 arrives
      return control(vp, org);
    };
    const loserReader: VendorProfileControlReader = async (vp, org) => {
      loserReaderCalls += 1;
      return control(vp, org);
    };
    const run = (reader: VendorProfileControlReader) =>
      handleCreateDelegationGrant(CREATE_INPUT, {
        resolveSession: asSession(CTRL_AUTH),
        ensureProvisioned: noProvision,
        idempotencyKey: key,
        vendorProfileControlReader: reader,
      });

    const p1 = run(slowWinnerReader);
    await sleep(120); // T2 enters while T1 is in-flight (post-claim, pre-commit)
    const p2 = run(loserReader);
    const [r1, r2] = await Promise.all([p1, p2]);

    // Both callers receive the SINGLE execution's outcome (§14.3: the in-flight original IS the
    // execution for this key) — same status, byte-equal wire envelope incl. the ORIGINAL
    // reference_id, same Location.
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    expect(wireJson(r2.body)).toEqual(wireJson(r1.body));
    expect(r2.headers?.Location).toBe(r1.headers?.Location);

    // Exactly ONE grant and ONE `delegation_grant_issued` audit row exist (joint-rule legs 1+2).
    const grants = await prisma.delegationGrant.findMany({
      where: { controllingOrganizationId: CTRL_ORG },
    });
    expect(grants).toHaveLength(1);
    expect((await grantAudits(grants[0]!.id)).map((a) => a.action)).toEqual([
      "delegation_grant_issued",
    ]);

    // The sharp §14.3 letter: the loser's business logic NEVER BEGAN — its injected M2 reader
    // (the command's SCOPE/REFERENCE stage) was never invoked; the winner's ran exactly once.
    expect(winnerReaderCalls).toBe(1);
    expect(loserReaderCalls).toBe(0);

    await prisma.delegationGrant.deleteMany({ where: { id: grants[0]!.id } });
  });

  it("CREATE wire §B.6 mandatory key: an ABSENT Idempotency-Key → 400 identity_delegation_invalid_input; nothing written", async () => {
    const before = await prisma.delegationGrant.count({
      where: { controllingOrganizationId: CTRL_ORG },
    });
    const res = await handleCreateDelegationGrant(CREATE_INPUT, createDeps(CTRL_AUTH, null));
    expect(res.status).toBe(400);
    const body = res.body as {
      error: { error_class: string; error_code: string; message: string };
    };
    expect(body.error.error_class).toBe("VALIDATION");
    expect(body.error.error_code).toBe("identity_delegation_invalid_input");
    expect(body.error.message).toMatch(/Idempotency-Key/);
    expect(
      await prisma.delegationGrant.count({ where: { controllingOrganizationId: CTRL_ORG } }),
    ).toBe(before);
  });

  it("§B.6 post-window: a stale cache row is NOT replayed — the command re-executes and the row is overwritten (executed_at re-anchored)", async () => {
    const key = `iv-k-${uuidv7()}`;
    const first = await handleCreateDelegationGrant(CREATE_INPUT, createDeps(CTRL_AUTH, key));
    expect(first.status).toBe(201);
    const firstId = (first.body as { result: { delegationGrantId: string } }).result
      .delegationGrantId;

    // Backdate the stored row past the 24h window (25h) — post-window, Doc-5A §9.4 asserts no
    // outcome; this realization re-executes and overwrites.
    await prisma.commandDedup.updateMany({
      where: { actorUserId: CTRL_USER, idempotencyKey: key },
      data: { executedAt: new Date(Date.now() - 25 * HOUR_MS) },
    });

    const second = await handleCreateDelegationGrant(CREATE_INPUT, createDeps(CTRL_AUTH, key));
    expect(second.status).toBe(201);
    const secondId = (second.body as { result: { delegationGrantId: string } }).result
      .delegationGrantId;
    expect(secondId).not.toBe(firstId); // re-executed (a NEW grant)

    // ONE row per scope key (upsert overwrote in place; the new response is now the cached one).
    const rows = await prisma.commandDedup.findMany({
      where: { actorUserId: CTRL_USER, idempotencyKey: key },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.executedAt.getTime()).toBeGreaterThan(Date.now() - HOUR_MS);
    await prisma.delegationGrant.deleteMany({ where: { id: { in: [firstId, secondId] } } });
  });

  it("§B.6 scope guard (§7.5 replay-cache poisoning): the SAME key from a DIFFERENT actor is NOT a replay — each principal gets its own execution", async () => {
    const key = `iv-k-${uuidv7()}`;
    const first = await handleCreateDelegationGrant(CREATE_INPUT, createDeps(CTRL_AUTH, key));
    expect(first.status).toBe(201);
    const firstId = (first.body as { result: { delegationGrantId: string } }).result
      .delegationGrantId;

    // A second controlling-org manager reuses the same key string — MUST NOT receive the first
    // actor's stored response (no cross-principal replay), MUST execute independently.
    const second = await handleCreateDelegationGrant(CREATE_INPUT, createDeps(CTRL_AUTH_2, key));
    expect(second.status).toBe(201);
    const secondId = (second.body as { result: { delegationGrantId: string } }).result
      .delegationGrantId;
    expect(secondId).not.toBe(firstId);
    expect(second.body).not.toEqual(first.body);
    await prisma.delegationGrant.deleteMany({ where: { id: { in: [firstId, secondId] } } });
  });

  // ════ B. Lifecycle wires (suspend / reinstate / revoke) ════

  it("LIFECYCLE wires: suspend 200 → reinstate 200 → suspend 200 → revoke 200 (frozen responses; revoke body has NO updated_at); each leg audited once", async () => {
    const g = await seedGrant({ status: "active", validTo: FUTURE });

    const suspended = await handleSuspendDelegationGrant(
      { delegationGrantId: g.id, updatedAt: g.updatedAt },
      lifecycleDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(suspended.status).toBe(200);
    const sBody = suspended.body as unknown as {
      result: { delegationGrantId: string; status: string; updatedAt: Date };
    };
    expect(sBody.result.status).toBe("suspended");
    expect(sBody.result.updatedAt).toBeDefined(); // frozen suspend response carries updated_at

    const reinstated = await handleReinstateDelegationGrant(
      { delegationGrantId: g.id, updatedAt: new Date(sBody.result.updatedAt) },
      lifecycleDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(reinstated.status).toBe(200);
    const rBody = reinstated.body as unknown as {
      result: { delegationGrantId: string; status: string; updatedAt: Date };
    };
    expect(rBody.result.status).toBe("active");

    const resuspended = await handleSuspendDelegationGrant(
      { delegationGrantId: g.id, updatedAt: new Date(rBody.result.updatedAt) },
      lifecycleDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(resuspended.status).toBe(200);
    const s2Body = resuspended.body as unknown as { result: { updatedAt: Date } };

    const revoked = await handleRevokeDelegationGrant(
      { delegationGrantId: g.id, updatedAt: new Date(s2Body.result.updatedAt) },
      lifecycleDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(revoked.status).toBe(200);
    const vBody = revoked.body as unknown as { result: Record<string, unknown> };
    expect(vBody.result).toEqual({ delegationGrantId: g.id, status: "revoked" });
    expect("updatedAt" in vBody.result).toBe(false); // frozen §C9 revoke response omits it

    expect((await grantAudits(g.id)).map((a) => a.action)).toEqual([
      "delegation_grant_suspended",
      "delegation_grant_reinstated",
      "delegation_grant_suspended",
      "delegation_grant_revoked",
    ]);
  });

  it("SUSPEND wire §B.6 replay discrimination: the same key re-POST returns the STORED 200 even though re-execution would reject (stale token / illegal edge) — single execution proven", async () => {
    const g = await seedGrant({ status: "active", validTo: FUTURE });
    const key = `iv-k-${uuidv7()}`;

    const first = await handleSuspendDelegationGrant(
      { delegationGrantId: g.id, updatedAt: g.updatedAt },
      lifecycleDeps(CTRL_AUTH, key),
    );
    expect(first.status).toBe(200);

    // Re-POST with the SAME key and the ORIGINAL (now stale) token: a re-execution would fail
    // (stale token → 400 / suspended→suspended → 409) — the stored 200 coming back IS the proof
    // of no-re-execution (the §14.3 discrimination), with the SAME original reference_id.
    const replay = await handleSuspendDelegationGrant(
      { delegationGrantId: g.id, updatedAt: g.updatedAt },
      lifecycleDeps(CTRL_AUTH, key),
    );
    expect(replay.status).toBe(200);
    expect(wireJson(replay.body)).toEqual(wireJson(first.body));
    expect((await grantAudits(g.id)).map((a) => a.action)).toEqual(["delegation_grant_suspended"]);
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "suspended",
    );
  });

  it("REINSTATE wire after lapse (patch rule 3): 409 STATE identity_delegation_state_invalid, NO ETag (a boundary rejection is not a losing write — call-13)", async () => {
    const g = await seedGrant({ status: "suspended", validFrom: PAST_FROM, validTo: PAST_TO });
    const res = await handleReinstateDelegationGrant(
      { delegationGrantId: g.id, updatedAt: g.updatedAt },
      lifecycleDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(res.status).toBe(409);
    const body = res.body as { error: { error_class: string; error_code: string } };
    expect(body.error.error_class).toBe("STATE");
    expect(body.error.error_code).toBe("identity_delegation_state_invalid");
    expect(res.headers?.ETag).toBeUndefined();
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "suspended",
    );
  });

  it("LIFECYCLE wire error legs: machine-illegal edge → 409 STATE no ETag · stale token → 400 VALIDATION (in-register — §C9 authors no CONFLICT code) · absent updated_at → 400 · non-party → 404 collapse", async () => {
    // Machine-illegal edge: suspend a REVOKED grant → 409 STATE, ETag ABSENT (call-13).
    const revoked = await seedGrant({ status: "revoked", validTo: FUTURE });
    const illegal = await handleSuspendDelegationGrant(
      { delegationGrantId: revoked.id, updatedAt: revoked.updatedAt },
      lifecycleDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(illegal.status).toBe(409);
    expect((illegal.body as { error: { error_class: string } }).error.error_class).toBe("STATE");
    expect(illegal.headers?.ETag).toBeUndefined();

    // Stale token on a legal edge: the IDN-4-ratified in-register VALIDATION 400 (the frozen §C9
    // registers author NO CONFLICT code; the lifecycle contracts declare no `Concurrency:
    // optimistic` — PassB:597/610/623 vs the §C4/§C10 declarations — so the §9.5 CONFLICT/ETag
    // stale-precondition leg does NOT attach here; W2-IDN-6.5 judgment call, report §8).
    const active = await seedGrant({ status: "active", validTo: FUTURE });
    const stale = await handleSuspendDelegationGrant(
      { delegationGrantId: active.id, updatedAt: new Date(0) },
      lifecycleDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(stale.status).toBe(400);
    expect((stale.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_delegation_invalid_input",
    );
    expect(stale.headers?.ETag).toBeUndefined(); // the token rides 409s only (§9.5)

    // Absent/unparseable updated_at (a required §C9 body field) → SYNTAX 400, with the EXACT
    // call-19 message text pinned (RV-0153 NIT-4 fold — previously status-level only).
    const noToken = await handleSuspendDelegationGrant(
      { delegationGrantId: active.id, updatedAt: new Date(Number.NaN) },
      lifecycleDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(noToken.status).toBe(400);
    expect((noToken.body as { error: { message: string } }).error.message).toBe(
      "updated_at is required.",
    );

    // Non-party caller probing a REAL grant vs a RANDOM id: byte-identical 404 (modulo the
    // per-response reference_id — platform-assigned per request, Doc-4A §22.1).
    const probeReal = await handleSuspendDelegationGrant(
      { delegationGrantId: active.id, updatedAt: active.updatedAt },
      lifecycleDeps(THIRD_AUTH, `iv-k-${uuidv7()}`),
    );
    const probeRandom = await handleSuspendDelegationGrant(
      { delegationGrantId: "01920000-0000-7000-8000-0000000d65ee", updatedAt: active.updatedAt },
      lifecycleDeps(THIRD_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(probeReal.status).toBe(404);
    expect(probeRandom.status).toBe(404);
    const strip = (b: unknown) => {
      const rest = { ...(b as Record<string, unknown>) };
      delete rest.reference_id;
      return rest;
    };
    expect(strip(probeReal.body)).toEqual(strip(probeRandom.body));
    expect((await prisma.delegationGrant.findFirst({ where: { id: active.id } }))?.status).toBe(
      "active",
    );

    // Representative-party caller (can read, not the controller) → 403 forbidden (dual-party
    // reads, controller-only writes).
    const rep = await handleSuspendDelegationGrant(
      { delegationGrantId: active.id, updatedAt: active.updatedAt },
      lifecycleDeps(REP_AUTH, `iv-k-${uuidv7()}`),
    );
    expect(rep.status).toBe(403);
    expect((rep.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_delegation_forbidden",
    );
  });

  // RV-0153 NIT-4 fold — the REVOKE face's own register rows (previously shared-path inference
  // only): each frozen §C9 error leg exercised THROUGH the revoke wire face (PassB:621 register).
  it.each([
    {
      leg: "invalid_input (malformed id → 400)",
      run: () =>
        handleRevokeDelegationGrant(
          { delegationGrantId: "not-a-uuid", updatedAt: new Date() },
          lifecycleDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
        ),
      status: 400,
      code: "identity_delegation_invalid_input",
    },
    {
      leg: "forbidden (representative party may read, not revoke → 403)",
      run: async () => {
        const g = await seedGrant({ status: "active", validFrom: PAST_FROM, validTo: FUTURE });
        return handleRevokeDelegationGrant(
          { delegationGrantId: g.id, updatedAt: g.updatedAt },
          lifecycleDeps(REP_AUTH, `iv-k-${uuidv7()}`),
        );
      },
      status: 403,
      code: "identity_delegation_forbidden",
    },
    {
      leg: "not_found (nonexistent id → 404 collapse)",
      run: () =>
        handleRevokeDelegationGrant(
          { delegationGrantId: "01920000-0000-7000-8000-0000000d65ed", updatedAt: new Date() },
          lifecycleDeps(CTRL_AUTH, `iv-k-${uuidv7()}`),
        ),
      status: 404,
      code: "identity_delegation_not_found",
    },
  ])("REVOKE face register leg: $leg", async ({ run, status, code }) => {
    const res = await run();
    expect(res.status).toBe(status);
    expect((res.body as { error: { error_code: string } }).error.error_code).toBe(code);
  });

  it("§9.5 ETag leg discipline (call-13, mapper-level): a losing-write STATE 409 carrying the current token emits ETag; a machine-illegal STATE 409 without one emits none", () => {
    const now = new Date("2026-07-10T00:00:00.000Z");
    // The LOSING-WRITE shape (CAS lost a race on a legal edge — the command attaches the token).
    const losing = delegationGrantErrorResponse({
      errorClass: "STATE",
      errorCode: "identity_delegation_state_invalid",
      message: "the grant was already transitioned; reload and retry.",
      currentUpdatedAt: now,
    });
    expect(losing.status).toBe(409);
    expect(losing.headers?.ETag).toBe(concurrencyEtag(now));

    // The MACHINE-ILLEGAL shape (no token attached — a token there would be a false retry signal).
    const illegal = delegationGrantErrorResponse({
      errorClass: "STATE",
      errorCode: "identity_delegation_state_invalid",
      message: "illegal transition revoked → suspended.",
    });
    expect(illegal.status).toBe(409);
    expect(illegal.headers?.ETag).toBeUndefined();
  });

  it("PROHIBITED FIELDS: smuggled org/actor/status keys on the typed seam never reach the write — the controlling org stays the SERVER-RESOLVED active org", async () => {
    const key = `iv-k-${uuidv7()}`;
    // A hostile caller shapes extra keys onto the input object (the route seam maps declared keys
    // only; this drives the same typed surface with the smuggle attempt forced through a cast).
    const smuggled = {
      ...CREATE_INPUT,
      controlling_organization_id: THIRD_ORG,
      controllingOrganizationId: THIRD_ORG,
      status: "revoked",
      created_by: THIRD_USER,
    } as unknown as typeof CREATE_INPUT;
    const res = await handleCreateDelegationGrant(smuggled, createDeps(CTRL_AUTH, key));
    expect(res.status).toBe(201);
    const grantId = (res.body as { result: { delegationGrantId: string } }).result
      .delegationGrantId;
    const row = await prisma.delegationGrant.findFirstOrThrow({ where: { id: grantId } });
    expect(row.controllingOrganizationId).toBe(CTRL_ORG); // server-resolved — never the smuggle
    expect(row.status).toBe("active");
    expect(row.createdBy).toBe(CTRL_USER);
    await prisma.delegationGrant.deleteMany({ where: { id: grantId } });
  });

  // ════ C. Read wires (get / list) ════

  it("GET wire: both party orgs read the FROZEN §C9 projection exactly; a non-party caller gets a 404 byte-identical to a nonexistent id; malformed id → 400", async () => {
    const g = await seedGrant({ status: "active", validFrom: PAST_FROM, validTo: FUTURE });

    for (const auth of [CTRL_AUTH, REP_AUTH]) {
      const res = await handleGetDelegationGrant(g.id, readDeps(auth));
      expect(res.status).toBe(200);
      const body = res.body as { result: Record<string, unknown>; reference_id: string };
      // EXACTLY the frozen §C9 field set (PassB:648) — nothing added (no updated_at), nothing missing.
      expect(Object.keys(body.result).sort()).toEqual(
        [
          "controllingOrganizationId",
          "delegationGrantId",
          "permissionSet",
          "representativeOrganizationId",
          "status",
          "validFrom",
          "validTo",
          "vendorProfileId",
        ].sort(),
      );
      expect(body.result).toMatchObject({
        delegationGrantId: g.id,
        controllingOrganizationId: CTRL_ORG,
        representativeOrganizationId: REP_ORG,
        vendorProfileId: VENDOR_PROFILE,
        permissionSet: ["can_submit_quote"],
        status: "active",
      });
    }

    const nonParty = await handleGetDelegationGrant(g.id, readDeps(THIRD_AUTH));
    const nonExistent = await handleGetDelegationGrant(
      "01920000-0000-7000-8000-0000000d65ef",
      readDeps(THIRD_AUTH),
    );
    expect(nonParty.status).toBe(404);
    expect(nonExistent.status).toBe(404);
    const strip = (b: unknown) => {
      const rest = { ...(b as Record<string, unknown>) };
      delete rest.reference_id;
      return rest;
    };
    expect(strip(nonParty.body)).toEqual(strip(nonExistent.body));

    const malformed = await handleGetDelegationGrant("not-a-uuid", readDeps(CTRL_AUTH));
    expect(malformed.status).toBe(400);
  });

  it("LIST wire: party scope + frozen filters + deterministic valid_from order; a third org sees []; page_size/cursor/sort are FAIL-CLOSED 400 (ESC-IDN-LIST-PAGESIZE); bad enum → 400", async () => {
    // A clean party universe for the order/filter pins (earlier tests leave terminal grants behind).
    await prisma.delegationGrant.deleteMany({
      where: { controllingOrganizationId: CTRL_ORG },
    });
    // Three grants with distinct valid_from for the order pin.
    const g1 = await seedGrant({
      status: "active",
      validFrom: new Date("2001-01-01Z"),
      validTo: FUTURE,
    });
    const g2 = await seedGrant({
      status: "suspended",
      validFrom: new Date("2002-01-01Z"),
      validTo: FUTURE,
    });
    const g3 = await seedGrant({
      status: "active",
      validFrom: new Date("2003-01-01Z"),
      validTo: FUTURE,
    });

    const asCtrl = await handleListDelegationGrants({}, readDeps(CTRL_AUTH));
    expect(asCtrl.status).toBe(200);
    const ctrlBody = asCtrl.body as {
      result: { items: { delegationGrantId: string }[]; pageInfo: { hasMore: boolean } };
    };
    expect(ctrlBody.result.items.map((i) => i.delegationGrantId)).toEqual([g1.id, g2.id, g3.id]);
    expect(ctrlBody.result.pageInfo).toEqual({ hasMore: false });

    // The representative party sees the same grants through its role filter…
    const asRep = await handleListDelegationGrants(
      { roleFilter: "as_representative" },
      readDeps(REP_AUTH),
    );
    expect((asRep.body as { result: { items: unknown[] } }).result.items).toHaveLength(3);
    // …and its as_controlling view is empty (REP_ORG controls nothing).
    const asRepCtrl = await handleListDelegationGrants(
      { roleFilter: "as_controlling" },
      readDeps(REP_AUTH),
    );
    expect((asRepCtrl.body as { result: { items: unknown[] } }).result.items).toHaveLength(0);

    // status_filter + vendor_profile_id narrow within party scope (never widen).
    const suspendedOnly = await handleListDelegationGrants(
      { statusFilter: "suspended" },
      readDeps(CTRL_AUTH),
    );
    expect(
      (
        suspendedOnly.body as { result: { items: { delegationGrantId: string }[] } }
      ).result.items.map((i) => i.delegationGrantId),
    ).toEqual([g2.id]);
    const byVendor = await handleListDelegationGrants(
      { vendorProfileId: VENDOR_PROFILE },
      readDeps(CTRL_AUTH),
    );
    expect((byVendor.body as { result: { items: unknown[] } }).result.items).toHaveLength(3);

    // A THIRD org (non-party) sees an EMPTY list — grants are simply absent (§7.5).
    const asThird = await handleListDelegationGrants({}, readDeps(THIRD_AUTH));
    expect((asThird.body as { result: { items: unknown[] } }).result.items).toHaveLength(0);

    // FAIL-CLOSED pagination dimension (no registered identity page-size POLICY key — Doc-3 v1.9
    // §Notes; handle ESC-IDN-LIST-PAGESIZE) + the undeclared-sort rejection (Doc-5A §8.4).
    for (const dim of [{ pageSize: "10" }, { cursor: "abc" }, { sort: "valid_from:desc" }]) {
      const rejected = await handleListDelegationGrants(dim, readDeps(CTRL_AUTH));
      expect(rejected.status).toBe(400);
      expect((rejected.body as { error: { error_code: string } }).error.error_code).toBe(
        "identity_delegation_invalid_input",
      );
    }
    const pageSizeMsg = await handleListDelegationGrants({ pageSize: "10" }, readDeps(CTRL_AUTH));
    expect((pageSizeMsg.body as { error: { message: string } }).error.message).toMatch(
      /ESC-IDN-LIST-PAGESIZE/,
    );

    // Enum allowlist (Doc-4A §9.6): an undeclared filter value is a SYNTAX failure.
    const badEnum = await handleListDelegationGrants(
      { roleFilter: "as_owner" },
      readDeps(CTRL_AUTH),
    );
    expect(badEnum.status).toBe(400);

    await prisma.delegationGrant.deleteMany({ where: { id: { in: [g1.id, g2.id, g3.id] } } });
  });

  // ════ D. The 6.1 §C4 retro-fit (RV-0152 close carry) ════

  it("RETRO-FIT 2FA: same-key replay returns the STORED 200 (same reference_id) with ONE audit row; absent key → 400; the §C4 window key (user_update_dedup_window) governs", async () => {
    const authUserId = uuidv7();
    const userId = uuidv7();
    const user = await prisma.user.create({ data: { id: userId, authUserId, status: "active" } });
    await prisma.membership.create({
      data: {
        id: uuidv7(),
        organizationId: CTRL_ORG,
        userId,
        roleId: CTRL_ROLE,
        state: "active",
      },
    });
    try {
      const key = `iv-k-${uuidv7()}`;
      const deps = {
        resolveSession: asSession(authUserId),
        ensureProvisioned: noProvision,
        idempotencyKey: key as string | null,
      };
      const input = { targetUserId: userId, twoFaEnabled: true, updatedAt: user.updatedAt };

      const first = await handleUpdateUser2faSettings(input, deps);
      expect(first.status).toBe(200);

      // Replay with the same key + the ORIGINAL (now stale) token: re-execution would 409 — the
      // stored 200 proves single execution; ONE audit row (the §14.3 joint rule).
      const replay = await handleUpdateUser2faSettings(input, deps);
      expect(replay.status).toBe(200);
      expect(wireJson(replay.body)).toEqual(wireJson(first.body));
      const audits = await prisma.auditRecord.findMany({
        where: { entityType: "user", entityId: userId, action: "user_2fa_settings_updated" },
      });
      expect(audits).toHaveLength(1);

      // Absent key → the mandatory-header 400 (Doc-5C §4.3).
      const missing = await handleUpdateUser2faSettings(input, { ...deps, idempotencyKey: null });
      expect(missing.status).toBe(400);
      expect((missing.body as { error: { message: string } }).error.message).toMatch(
        /Idempotency-Key/,
      );

      // The stored row rides the §C4-declared window key's scope (contract id pinned on the row).
      const row = await prisma.commandDedup.findFirstOrThrow({
        where: { actorUserId: userId, idempotencyKey: key },
      });
      expect(row.contractId).toBe("identity.update_user_2fa_settings.v1");
      expect(row.organizationId).toBeNull(); // self-op scope — org-less
    } finally {
      // RV-0153 NIT-3 fold: the dedup cleanup rides `finally` (a failed assertion above must not
      // orphan the stored row into later runs — the prior-session-orphan class).
      await prisma.commandDedup.deleteMany({ where: { actorUserId: userId } });
      await prisma.membership.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    }
  });

  it("RETRO-FIT profile update: absent Idempotency-Key → 400 identity_user_invalid_input (the §C4 wire honors the mandatory header)", async () => {
    const authUserId = uuidv7();
    const userId = uuidv7();
    const user = await prisma.user.create({ data: { id: userId, authUserId, status: "active" } });
    try {
      const res = await handleUpdateUserProfile(
        { targetUserId: userId, displayName: "X", updatedAt: user.updatedAt },
        {
          resolveSession: asSession(authUserId),
          ensureProvisioned: noProvision,
          idempotencyKey: null,
        },
      );
      expect(res.status).toBe(400);
      const body = res.body as { error: { error_code: string; message: string } };
      expect(body.error.error_code).toBe("identity_user_invalid_input");
      expect(body.error.message).toMatch(/Idempotency-Key/);
      expect(
        (await prisma.user.findFirstOrThrow({ where: { id: userId } })).displayName,
      ).toBeNull();
    } finally {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
  });
});
