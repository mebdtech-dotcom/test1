import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { ensureProvisioned, type AuthSession } from "../../src/server/auth";
import { withActiveOrgContext } from "../../src/server/context";
import {
  handleCreateVendorProfile,
  handleGetOwnVendorProfile,
  handleUpdateVendorProfile,
} from "../../src/server/marketplace";
import { createVendorProfile } from "../../src/modules/marketplace/contracts";
import type { CreateVendorProfileInput } from "../../src/modules/marketplace/contracts";
import {
  allocateHumanReference,
  appendAuditRecord,
  configValueQuery,
  writeOutboxEvent,
} from "../../src/modules/core/contracts";
import { checkPermission } from "../../src/modules/identity/contracts";

// Test-local oracle for the FIXED Vendor Slug format law (Doc-2 v1.0.5 D2-04.2, stated VERBATIM as
// the expected law — an independent assertion, deliberately NOT an import of the module-internal
// issuance policy, so a policy regression cannot self-validate; the boundary linter also forbids a
// test → module-internal import).
function conformsToSlugLaw(slug: string): boolean {
  return (
    slug.length >= 3 &&
    slug.length <= 40 &&
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug) &&
    !slug.startsWith("xn--")
  );
}

// W3-MKT-3 — the `marketplace` vendor-profile WRITE-vertical conformance slice (Doc-8C):
// `create_vendor_profile.v1` / `update_vendor_profile.v1` / `get_vendor_profile.v1` (Controlling-Org
// leg) against a REAL PostgreSQL. Proves the full D7 pipeline EXTENDED with the §16.2 producer-emit
// twin — Command → checkPermission (M1) → allocate_human_reference (M0) → Repository →
// appendAuditRecord (M0) → writeOutboxEvent (M0) — ALL on one transaction, and the THREE invariants:
//   • No business write without its audit row (audit-failure ⇒ full rollback).
//   • No business write without its outbox row (emit-failure ⇒ full rollback — Doc-4B §16.2).
//   • No audit/outbox row without a successful business write.
// Audit actions are the canonical M2 constants (`vendor_profile_created` / `vendor_profile_updated`
// — Doc-2 §9 Vendor-profile "create" / "capability/override change", bound by pointer). The event is
// the Doc-2 §8 `VendorClaimed` (create only; update emits NOTHING — Doc-4D §D4).
//
// Fixture discipline: FULL UUID literals (sliced UUIDs collide on the shared Postgres);
// `core.audit_records` / `core.outbox_events` are append-only — asserted by entity/aggregate id,
// NEVER swept; vendor_profiles fixture rows are deleted in cleanup (no immutability trigger).

// Deterministic fixture ids — FULL, valid, distinct UUIDv7-shaped literals (version nibble 7).
const AUTH_A = "01980722-0000-7000-8000-0000000003a1";
const AUTH_B = "01980722-0000-7000-8000-0000000003b1";
const EMAIL_A = "w3mkt3-vendor-a@example.com";
const EMAIL_B = "w3mkt3-vendor-b@example.com";

// Hand-built FORBIDDEN fixture (a role with NO `can_manage_vendor_profile` mapping).
const FB_USER_ID = "01980722-0000-7000-8000-0000000003f1";
const FB_ORG_ID = "01980722-0000-7000-8000-0000000003f2";
const FB_ROLE_ID = "01980722-0000-7000-8000-0000000003f3";

const CREATE_INPUT: CreateVendorProfileInput = {
  name: "W3MKT3 Steel Works",
  capabilityFlags: { canSupply: true, canService: false, canFabricate: true, canConsult: false },
  geography: { country: "BD", division: "Dhaka", district: "Gazipur", industrialZone: null },
  vendorTypePreset: null,
};

function seededSession(session: AuthSession): () => Promise<AuthSession | null> {
  return async () => session;
}

async function auditRowsFor(vendorProfileId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType: "vendor_profile", entityId: vendorProfileId },
    orderBy: { eventTime: "asc" },
  });
}

async function outboxRowsFor(vendorProfileId: string) {
  return prisma.outboxEvent.findMany({
    where: { aggregateId: vendorProfileId },
    orderBy: { createdAt: "asc" },
  });
}

/** Teardown a provisioned identity + its vendor profile (audit/outbox rows are immutable — kept). */
async function cleanupProvisioned(authUserId: string): Promise<void> {
  const user = await prisma.user.findFirst({ where: { authUserId } });
  if (user === null) return;
  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  const orgIds = [...new Set(memberships.map((m) => m.organizationId))];
  if (orgIds.length > 0) {
    await prisma.vendorProfile.deleteMany({
      where: { controllingOrganizationId: { in: orgIds } },
    });
    await prisma.buyerProfile.deleteMany({ where: { organizationId: { in: orgIds } } });
  }
  await prisma.membership.deleteMany({ where: { userId: user.id } });
  if (orgIds.length > 0) await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
  await prisma.user.deleteMany({ where: { id: user.id } });
}

async function cleanupForbiddenFixture(): Promise<void> {
  await prisma.vendorProfile.deleteMany({ where: { controllingOrganizationId: FB_ORG_ID } });
  await prisma.membership.deleteMany({ where: { userId: FB_USER_ID } });
  await prisma.role.deleteMany({ where: { id: FB_ROLE_ID } });
  await prisma.organization.deleteMany({ where: { id: FB_ORG_ID } });
  await prisma.user.deleteMany({ where: { id: FB_USER_ID } });
}

describe("W3-MKT-3 — marketplace vendor-profile write vertical (audit + outbox atomic, real PostgreSQL)", () => {
  beforeEach(async () => {
    await cleanupProvisioned(AUTH_A);
    await cleanupProvisioned(AUTH_B);
    await cleanupForbiddenFixture();
  });

  afterAll(async () => {
    await cleanupProvisioned(AUTH_A);
    await cleanupProvisioned(AUTH_B);
    await cleanupForbiddenFixture();
    await prisma.$disconnect();
  });

  it("CREATE: 201 + envelope + claimed/active + VENDOR human_ref + law-conformant slug + audit + VendorClaimed outbox (one tx)", async () => {
    const session: AuthSession = { authUserId: AUTH_A, email: EMAIL_A };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const res = await handleCreateVendorProfile(CREATE_INPUT, {
      resolveSession: seededSession(session),
      ensureProvisioned,
    });

    expect(res.status).toBe(201);
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    expect(res.body).toHaveProperty("reference_id");
    const { vendorProfileId, humanRef, claimState, status, controllingOrganizationId } =
      res.body.result;
    expect(claimState).toBe("claimed"); // Doc-2 §5.3 direct registration (BR-M-02) — never `seeded`
    expect(status).toBe("active");
    expect(controllingOrganizationId).toBe(orgId);
    expect(humanRef).toMatch(/^VENDOR-\d{4}-\d{6}$/); // Doc-6D MK-CR11 ('VENDOR' [§2.5] prefix)

    // Business row persisted under the active org with the platform-issued slug (format law FIXED).
    const row = await prisma.vendorProfile.findFirst({ where: { id: vendorProfileId } });
    expect(row?.controllingOrganizationId).toBe(orgId);
    expect(row?.claimState).toBe("claimed");
    expect(row?.status).toBe("active");
    expect(row?.visibility).toBe("public");
    expect(row?.canSupply).toBe(true);
    expect(row?.canFabricate).toBe(true);
    expect(row?.canService).toBe(false);
    expect(conformsToSlugLaw(row!.slug)).toBe(true);

    // Exactly ONE audit row — the canonical `vendor_profile_created`, correctly attributed.
    const audit = await auditRowsFor(vendorProfileId);
    expect(audit).toHaveLength(1);
    expect(audit[0]!.action).toBe("vendor_profile_created");
    expect(audit[0]!.actorType).toBe("user");
    expect(audit[0]!.actorId).toBe(provisioned.userId);
    expect(audit[0]!.organizationId).toBe(orgId);
    expect(audit[0]!.oldValue).toBeNull();
    expect(audit[0]!.newValue).toMatchObject({ name: "W3MKT3 Steel Works" });

    // Exactly ONE outbox row — the Doc-2 §8 `VendorClaimed`, pending, thin payload (write-plus-emit).
    const outbox = await outboxRowsFor(vendorProfileId);
    expect(outbox).toHaveLength(1);
    expect(outbox[0]!.eventName).toBe("VendorClaimed");
    expect(outbox[0]!.status).toBe("pending");
    expect(outbox[0]!.payloadJsonb).toMatchObject({
      vendor_profile_id: vendorProfileId,
      controlling_organization_id: orgId,
      claim_state: "claimed",
      source: "registration",
    });
  });

  it("CONFLICT: one profile per org — second create → 409 `marketplace_vendor_already_exists`, no extra audit/outbox", async () => {
    const session: AuthSession = { authUserId: AUTH_A, email: EMAIL_A };
    await ensureProvisioned(session);

    const first = await handleCreateVendorProfile(CREATE_INPUT, {
      resolveSession: seededSession(session),
      ensureProvisioned,
    });
    if (!("result" in first.body)) throw new Error("unreachable: expected create success");
    const vendorProfileId = first.body.result.vendorProfileId;

    const second = await handleCreateVendorProfile(
      { ...CREATE_INPUT, name: "W3MKT3 Second Attempt" },
      { resolveSession: seededSession(session), ensureProvisioned },
    );

    expect(second.status).toBe(409);
    if (!("error" in second.body)) throw new Error("unreachable: expected a conflict error");
    expect(second.body.error.error_class).toBe("CONFLICT");
    expect(second.body.error.error_code).toBe("marketplace_vendor_already_exists");

    // Still exactly one audit row and one outbox row (the rejected attempt wrote nothing).
    expect(await auditRowsFor(vendorProfileId)).toHaveLength(1);
    expect(await outboxRowsFor(vendorProfileId)).toHaveLength(1);
  });

  it("UPDATE: 200 + `vendor_profile_updated` audit (old/new) + NO outbox event; stale token → 409, no write", async () => {
    const session: AuthSession = { authUserId: AUTH_A, email: EMAIL_A };
    await ensureProvisioned(session);

    const created = await handleCreateVendorProfile(CREATE_INPUT, {
      resolveSession: seededSession(session),
      ensureProvisioned,
    });
    if (!("result" in created.body)) throw new Error("unreachable: expected create success");
    const vendorProfileId = created.body.result.vendorProfileId;

    // Fetch the concurrency token via the Controlling-Org read (row 6).
    const read = await handleGetOwnVendorProfile(
      { vendorProfileId },
      { resolveSession: seededSession(session), ensureProvisioned },
    );
    expect(read.status).toBe(200);
    if (!("result" in read.body)) throw new Error("unreachable: expected read success");
    const token = new Date(read.body.result.updatedAt);

    const updated = await handleUpdateVendorProfile(
      {
        vendorProfileId,
        name: "W3MKT3 Steel Works (Renamed)",
        capabilityFlags: { canConsult: true },
        expectedUpdatedAt: token,
      },
      { resolveSession: seededSession(session), ensureProvisioned },
    );

    expect(updated.status).toBe(200);
    if (!("result" in updated.body)) throw new Error("unreachable: expected update success");
    expect(updated.body.result.vendorProfileId).toBe(vendorProfileId);

    const row = await prisma.vendorProfile.findFirst({ where: { id: vendorProfileId } });
    expect(row?.name).toBe("W3MKT3 Steel Works (Renamed)");
    expect(row?.canConsult).toBe(true);
    expect(row?.canSupply).toBe(true); // untouched flag survives the partial update

    // Audit ledger: created then updated (old/new diff); outbox: STILL only the create's event
    // (update emits none — Doc-4D §D4 Events row: attribute edit → internal rebuild, not an event).
    const audit = await auditRowsFor(vendorProfileId);
    expect(audit.map((a) => a.action)).toEqual([
      "vendor_profile_created",
      "vendor_profile_updated",
    ]);
    expect(audit[1]!.oldValue).toMatchObject({ name: "W3MKT3 Steel Works" });
    expect(audit[1]!.newValue).toMatchObject({ name: "W3MKT3 Steel Works (Renamed)" });
    expect(await outboxRowsFor(vendorProfileId)).toHaveLength(1);

    // Stale token → 409 CONFLICT; no third audit row; value not overwritten.
    const conflict = await handleUpdateVendorProfile(
      { vendorProfileId, name: "W3MKT3 Stale Write", expectedUpdatedAt: token },
      { resolveSession: seededSession(session), ensureProvisioned },
    );
    expect(conflict.status).toBe(409);
    if (!("error" in conflict.body)) throw new Error("unreachable: expected a conflict error");
    expect(conflict.body.error.error_code).toBe("marketplace_vendor_update_conflict");
    expect((await auditRowsFor(vendorProfileId)).map((a) => a.action)).toEqual([
      "vendor_profile_created",
      "vendor_profile_updated",
    ]);
    expect((await prisma.vendorProfile.findFirst({ where: { id: vendorProfileId } }))?.name).toBe(
      "W3MKT3 Steel Works (Renamed)",
    );
  });

  it("NON-DISCLOSURE (R9/§3.6): another org's read of the profile id collapses to the SAME 404 as absent", async () => {
    const sessionA: AuthSession = { authUserId: AUTH_A, email: EMAIL_A };
    await ensureProvisioned(sessionA);
    const created = await handleCreateVendorProfile(CREATE_INPUT, {
      resolveSession: seededSession(sessionA),
      ensureProvisioned,
    });
    if (!("result" in created.body)) throw new Error("unreachable: expected create success");
    const vendorProfileId = created.body.result.vendorProfileId;

    const sessionB: AuthSession = { authUserId: AUTH_B, email: EMAIL_B };
    await ensureProvisioned(sessionB);

    // Cross-tenant read → 404 (byte-identical error shape to a genuinely-absent id).
    const crossTenant = await handleGetOwnVendorProfile(
      { vendorProfileId },
      { resolveSession: seededSession(sessionB), ensureProvisioned },
    );
    const absent = await handleGetOwnVendorProfile(
      { vendorProfileId: uuidv7() },
      { resolveSession: seededSession(sessionB), ensureProvisioned },
    );
    expect(crossTenant.status).toBe(404);
    expect(absent.status).toBe(404);
    if (!("error" in crossTenant.body) || !("error" in absent.body)) {
      throw new Error("unreachable: expected error envelopes");
    }
    expect(crossTenant.body.error).toEqual(absent.body.error); // identical body (reference_id aside)

    // A cross-tenant UPDATE collapses identically (never a distinguishable 403 — §3.6/R9).
    const crossUpdate = await handleUpdateVendorProfile(
      { vendorProfileId, name: "W3MKT3 Hijack", expectedUpdatedAt: new Date() },
      { resolveSession: seededSession(sessionB), ensureProvisioned },
    );
    expect(crossUpdate.status).toBe(404);
    if (!("error" in crossUpdate.body)) throw new Error("unreachable: expected an error envelope");
    expect(crossUpdate.body.error.error_code).toBe("marketplace_vendor_not_found");
  });

  it("FORBIDDEN: a member whose role lacks `can_manage_vendor_profile` → AUTHORIZATION, no write, no audit, no outbox", async () => {
    await prisma.user.create({
      data: {
        id: FB_USER_ID,
        authUserId: "01980722-0000-7000-8000-0000000003fa",
        status: "active",
      },
    });
    await prisma.organization.create({
      data: {
        id: FB_ORG_ID,
        humanRef: "ORG-MKT3TEST-0003F2",
        name: "W3MKT3 Forbidden Org",
        slug: "w3mkt3-forbidden-org-0003f2",
        orgStatus: "active",
      },
    });
    // A custom role with NO role_permissions rows — `check_permission` must resolve deny.
    await prisma.role.create({
      data: { id: FB_ROLE_ID, organizationId: FB_ORG_ID, name: "Officer", isSystemBundle: false },
    });
    await prisma.membership.create({
      data: {
        id: uuidv7(),
        userId: FB_USER_ID,
        organizationId: FB_ORG_ID,
        roleId: FB_ROLE_ID,
        state: "active",
      },
    });

    const outcome = await withActiveOrgContext(
      { userId: FB_USER_ID, activeOrgId: FB_ORG_ID, isPlatformStaff: false },
      (tx) =>
        createVendorProfile(
          CREATE_INPUT,
          { userId: FB_USER_ID, activeOrgId: FB_ORG_ID },
          {
            checkPermission,
            allocateHumanReference,
            appendAuditRecord,
            writeOutboxEvent,
            configValueQuery,
          },
          tx,
        ),
    );

    expect(outcome.ok).toBe(false);
    if (outcome.ok) throw new Error("unreachable: expected an authorization failure");
    expect(outcome.error.errorClass).toBe("AUTHORIZATION");
    expect(outcome.error.errorCode).toBe("marketplace_vendor_forbidden");

    expect(
      await prisma.vendorProfile.findFirst({ where: { controllingOrganizationId: FB_ORG_ID } }),
    ).toBeNull();
  });

  it("VALIDATION: missing capability flags → 400 `marketplace_vendor_invalid_input` (before any write)", async () => {
    const session: AuthSession = { authUserId: AUTH_A, email: EMAIL_A };
    await ensureProvisioned(session);

    const badInput = {
      name: "W3MKT3 Invalid",
      capabilityFlags: { canSupply: true }, // missing the other three flags
      geography: { country: "BD", division: null, district: null, industrialZone: null },
    } as unknown as CreateVendorProfileInput;

    const res = await handleCreateVendorProfile(badInput, {
      resolveSession: seededSession(session),
      ensureProvisioned,
    });

    expect(res.status).toBe(400);
    if (!("error" in res.body)) throw new Error("unreachable: expected a validation error");
    expect(res.body.error.error_class).toBe("VALIDATION");
    expect(res.body.error.error_code).toBe("marketplace_vendor_invalid_input");
  });

  it("INVARIANT — audit failure rolls back the business write AND the outbox emit (nothing persists)", async () => {
    const session: AuthSession = { authUserId: AUTH_A, email: EMAIL_A };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const failingAppend = (() =>
      Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;

    await expect(
      withActiveOrgContext(
        { userId: provisioned.userId, activeOrgId: orgId, isPlatformStaff: false },
        (tx) =>
          createVendorProfile(
            CREATE_INPUT,
            { userId: provisioned.userId, activeOrgId: orgId },
            {
              checkPermission,
              allocateHumanReference,
              appendAuditRecord: failingAppend,
              writeOutboxEvent,
              configValueQuery,
            },
            tx,
          ),
      ),
    ).rejects.toThrow(/audit append failed/);

    // No business row, and no leaked `VendorClaimed` for this org (emit shared the rolled-back tx).
    expect(
      await prisma.vendorProfile.findFirst({ where: { controllingOrganizationId: orgId } }),
    ).toBeNull();
    const claimed = await prisma.outboxEvent.findMany({ where: { eventName: "VendorClaimed" } });
    const leaked = claimed.filter(
      (e) =>
        typeof e.payloadJsonb === "object" &&
        e.payloadJsonb !== null &&
        (e.payloadJsonb as Record<string, unknown>)["controlling_organization_id"] === orgId,
    );
    expect(leaked).toHaveLength(0);
  });

  it("INVARIANT — outbox-emit failure rolls back the business write AND the audit (§16.2 write-plus-emit)", async () => {
    const session: AuthSession = { authUserId: AUTH_A, email: EMAIL_A };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const failingEmit = (() =>
      Promise.reject(new Error("outbox emit failed (injected)"))) as typeof writeOutboxEvent;

    await expect(
      withActiveOrgContext(
        { userId: provisioned.userId, activeOrgId: orgId, isPlatformStaff: false },
        (tx) =>
          createVendorProfile(
            CREATE_INPUT,
            { userId: provisioned.userId, activeOrgId: orgId },
            {
              checkPermission,
              allocateHumanReference,
              appendAuditRecord,
              writeOutboxEvent: failingEmit,
              configValueQuery,
            },
            tx,
          ),
      ),
    ).rejects.toThrow(/outbox emit failed/);

    // No business row AND no orphan audit row for this org's vendor-profile writes.
    expect(
      await prisma.vendorProfile.findFirst({ where: { controllingOrganizationId: orgId } }),
    ).toBeNull();
    const orphanAudit = await prisma.auditRecord.findMany({
      where: { entityType: "vendor_profile", organizationId: orgId },
    });
    expect(orphanAudit).toHaveLength(0);
  });
});
