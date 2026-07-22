import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { handleGetPublicVendorProfile } from "../../src/server/marketplace";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-MKT-1 [Wave-3 M2 pilot slice] — the wired `marketplace.get_public_vendor_profile.v1`
// vertical-slice integration test (Doc-4D_Content_v1.0_PassB_Discovery.md §BC-MKT-6 /
// Doc-5D_Content_v1.0_Pass1.md row 64). Anonymous PUBLIC read — no session, no active-org context;
// exercised through the wired HTTP-handler core (`handleGetPublicVendorProfile`,
// `src/server/marketplace`) against a real Postgres.
//
// RLS NOTE: same posture as `resolve-vendor-slug-slice.test.ts` — the local/CI connection is
// `postgres` (rolbypassrls=true), so the wired-composition assertions exercise the APP-LAYER
// visibility predicate; the dedicated `asRestrictedRole` cases separately prove the DB-level RLS
// backstop on the same fixtures.

const CAT_L1 = "01930000-0000-7000-8000-000000003001"; // "Valves & Fittings" (level 1, root)
const CAT_L2 = "01930000-0000-7000-8000-000000003002"; // "Butterfly Valves" (level 2, child of CAT_L1)
const CAT_L3 = "01930000-0000-7000-8000-000000003003"; // "Gate Valves" (level 2, child of CAT_L1) — holds ONLY the removed assignment

const VP_FOUND = "01930000-0000-7000-8000-000000004001";
const VP_BANNED = "01930000-0000-7000-8000-000000004002";
const VP_SUSPENDED = "01930000-0000-7000-8000-000000004003";
const VP_SOFT_DELETED = "01930000-0000-7000-8000-000000004004";
// `vendor_profiles_org_live_uq` (partial-unique, WHERE deleted_at IS NULL) admits ONE live profile
// per controlling org — each seeded vendor gets its OWN org id (bare UUID, no cross-schema FK).
const ORG_FOUND = "01930000-0000-7000-8000-0000000000b1";
const ORG_BANNED = "01930000-0000-7000-8000-0000000000b2";
const ORG_SUSPENDED = "01930000-0000-7000-8000-0000000000b3";
const ORG_SOFT_DELETED = "01930000-0000-7000-8000-0000000000b4";

const CA_PRIMARY = "01930000-0000-7000-8000-000000005001"; // VP_FOUND -> CAT_L2, primary, active
const CA_SECONDARY = "01930000-0000-7000-8000-000000005002"; // VP_FOUND -> CAT_L1, secondary, active
const CA_REMOVED = "01930000-0000-7000-8000-000000005003"; // VP_FOUND -> CAT_L3, secondary, REMOVED (must be excluded)
const CA_ON_DELETED_VENDOR = "01930000-0000-7000-8000-000000005004"; // VP_SOFT_DELETED -> CAT_L1 (RLS parent-visibility probe)

const HUMAN_REF_FOUND = "VENDOR-2026-900010";
const HUMAN_REF_BANNED = "VENDOR-2026-900011";
const HUMAN_REF_SUSPENDED = "VENDOR-2026-900012";
const HUMAN_REF_SOFT_DELETED = "VENDOR-2026-900013";

const ABSENT_ID = "01930000-0000-7000-8000-0000000009ff"; // never seeded
const ABSENT_HUMAN_REF = "VENDOR-2026-999999"; // never seeded

const ALL_VP_IDS = [VP_FOUND, VP_BANNED, VP_SUSPENDED, VP_SOFT_DELETED];
const ALL_CA_IDS = [CA_PRIMARY, CA_SECONDARY, CA_REMOVED, CA_ON_DELETED_VENDOR];
const ALL_CAT_IDS = [CAT_L1, CAT_L2, CAT_L3];

/** Strip the platform-minted `reference_id` (always distinct per call) before a byte-equivalence diff. */
function withoutReferenceId(body: unknown): unknown {
  if (typeof body !== "object" || body === null) return body;
  const clone = { ...(body as Record<string, unknown>) };
  delete clone.reference_id;
  return clone;
}

async function seedFixture(): Promise<void> {
  await prisma.category.createMany({
    data: [
      {
        id: CAT_L1,
        parentId: null,
        name: "Valves & Fittings",
        slug: "w3mkt-cat-valves",
        level: 1,
        path: "valves",
      },
      {
        id: CAT_L2,
        parentId: CAT_L1,
        name: "Butterfly Valves",
        slug: "w3mkt-cat-butterfly",
        level: 2,
        path: "valves.butterfly",
      },
      {
        id: CAT_L3,
        parentId: CAT_L1,
        name: "Gate Valves",
        slug: "w3mkt-cat-gate",
        level: 2,
        path: "valves.gate",
      },
    ],
  });

  await prisma.vendorProfile.createMany({
    data: [
      {
        id: VP_FOUND,
        humanRef: HUMAN_REF_FOUND,
        controllingOrganizationId: ORG_FOUND,
        name: "W3MKT GPVP Found Vendor",
        slug: "w3mkt-gpvp-found",
        status: "active",
        canSupply: true,
        canService: false,
        canFabricate: true,
        canConsult: false,
        country: "Bangladesh",
        division: "Dhaka",
        district: "Tejgaon",
        industrialZone: "Tejgaon I/A",
      },
      {
        id: VP_BANNED,
        humanRef: HUMAN_REF_BANNED,
        controllingOrganizationId: ORG_BANNED,
        name: "W3MKT GPVP Banned Vendor",
        slug: "w3mkt-gpvp-banned",
        status: "banned",
      },
      {
        id: VP_SUSPENDED,
        humanRef: HUMAN_REF_SUSPENDED,
        controllingOrganizationId: ORG_SUSPENDED,
        name: "W3MKT GPVP Suspended Vendor",
        slug: "w3mkt-gpvp-suspended",
        status: "suspended",
      },
      {
        id: VP_SOFT_DELETED,
        humanRef: HUMAN_REF_SOFT_DELETED,
        controllingOrganizationId: ORG_SOFT_DELETED,
        name: "W3MKT GPVP Soft-deleted Vendor",
        slug: "w3mkt-gpvp-deleted",
        status: "active",
        deletedAt: new Date(),
      },
    ],
  });

  await prisma.categoryAssignment.createMany({
    data: [
      {
        id: CA_PRIMARY,
        vendorProfileId: VP_FOUND,
        categoryId: CAT_L2,
        level: "primary",
        status: "active",
      },
      {
        id: CA_SECONDARY,
        vendorProfileId: VP_FOUND,
        categoryId: CAT_L1,
        level: "secondary",
        status: "active",
      },
      {
        id: CA_REMOVED,
        vendorProfileId: VP_FOUND,
        categoryId: CAT_L3,
        level: "secondary",
        status: "removed",
      },
      {
        id: CA_ON_DELETED_VENDOR,
        vendorProfileId: VP_SOFT_DELETED,
        categoryId: CAT_L1,
        level: "primary",
        status: "active",
      },
    ],
  });
}

async function teardownFixture(): Promise<void> {
  // TEST-ONLY hard-delete (production never hard-deletes — Invariant #8; the test DB is ephemeral).
  await prisma.categoryAssignment.deleteMany({ where: { id: { in: ALL_CA_IDS } } });
  await prisma.vendorProfile.deleteMany({ where: { id: { in: ALL_VP_IDS } } });
  await prisma.category.deleteMany({ where: { id: { in: ALL_CAT_IDS } } });
}

describe("W3-MKT-1 marketplace.get_public_vendor_profile.v1 wired slice (GET /marketplace/public_vendor_profiles/{id})", () => {
  beforeAll(async () => {
    await ensureRestrictedRlsRole();
    await teardownFixture(); // clean any residue from a prior aborted run (deterministic fixtures).
    await seedFixture();
  });

  afterAll(async () => {
    await teardownFixture();
    await prisma.$disconnect();
  });

  it("found by vendorProfileId → 200 + the frozen public projection (no declaredTier/vendorTypePreset keys)", async () => {
    const res = await handleGetPublicVendorProfile({ vendorProfileId: VP_FOUND });
    expect(res.status).toBe(200);
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");

    expect(res.body.result).toEqual({
      vendorProfileId: VP_FOUND,
      humanRef: HUMAN_REF_FOUND,
      name: "W3MKT GPVP Found Vendor",
      capabilityFlags: {
        canSupply: true,
        canService: false,
        canFabricate: true,
        canConsult: false,
      },
      geography: {
        country: "Bangladesh",
        division: "Dhaka",
        district: "Tejgaon",
        industrialZone: "Tejgaon I/A",
      },
      // Active assignments only (CA_REMOVED excluded); primary before secondary.
      categories: [
        { categoryId: CAT_L2, name: "Butterfly Valves", parentCategoryId: CAT_L1 },
        { categoryId: CAT_L1, name: "Valves & Fittings", parentCategoryId: null },
      ],
    });
    expect(res.body.reference_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    // Explicit DTO-conformance check: the dropped fields never resurface on the wire.
    expect(res.body.result).not.toHaveProperty("declaredTier");
    expect(res.body.result).not.toHaveProperty("vendorTypePreset");
  });

  it("found by humanRef → 200, the SAME profile (separately, the other lookup mode)", async () => {
    const byId = await handleGetPublicVendorProfile({ vendorProfileId: VP_FOUND });
    const byRef = await handleGetPublicVendorProfile({ humanRef: HUMAN_REF_FOUND });
    expect(byRef.status).toBe(200);
    expect(withoutReferenceId(byRef.body)).toEqual(withoutReferenceId(byId.body));
  });

  it("not-found: an absent id → 404 NOT_FOUND", async () => {
    const res = await handleGetPublicVendorProfile({ vendorProfileId: ABSENT_ID });
    expect(res.status).toBe(404);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("NOT_FOUND");
    expect(res.body.error.error_code).toBe("marketplace_vendor_not_found");
    expect(res.body.error.retryable).toBe(false);
  });

  it("not-found: an absent humanRef → 404, BYTE-IDENTICAL to the absent-id case", async () => {
    const absentById = await handleGetPublicVendorProfile({ vendorProfileId: ABSENT_ID });
    const absentByRef = await handleGetPublicVendorProfile({ humanRef: ABSENT_HUMAN_REF });
    expect(absentByRef.status).toBe(404);
    expect(withoutReferenceId(absentByRef.body)).toEqual(withoutReferenceId(absentById.body));
  });

  it("non-disclosure: soft-deleted / banned / suspended vendors ALL collapse BYTE-IDENTICALLY to the absent 404", async () => {
    const absent = await handleGetPublicVendorProfile({ vendorProfileId: ABSENT_ID });
    const softDeleted = await handleGetPublicVendorProfile({ vendorProfileId: VP_SOFT_DELETED });
    const banned = await handleGetPublicVendorProfile({ vendorProfileId: VP_BANNED });
    const suspended = await handleGetPublicVendorProfile({ vendorProfileId: VP_SUSPENDED });

    for (const res of [softDeleted, banned, suspended]) {
      expect(res.status).toBe(404);
      expect(withoutReferenceId(res.body)).toEqual(withoutReferenceId(absent.body));
    }
  });

  it("invalid_input: NEITHER identifier supplied → 400 VALIDATION", async () => {
    const res = await handleGetPublicVendorProfile({});
    expect(res.status).toBe(400);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("VALIDATION");
    expect(res.body.error.error_code).toBe("marketplace_discovery_invalid_input");
  });

  it("invalid_input: BOTH identifiers supplied → 400 VALIDATION", async () => {
    const res = await handleGetPublicVendorProfile({
      vendorProfileId: VP_FOUND,
      humanRef: HUMAN_REF_FOUND,
    });
    expect(res.status).toBe(400);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("VALIDATION");
  });

  it("invalid_input: a malformed vendorProfileId → 400 VALIDATION", async () => {
    const res = await handleGetPublicVendorProfile({ vendorProfileId: "not-a-uuid" });
    expect(res.status).toBe(400);
  });

  it("invalid_input: a malformed humanRef → 400 VALIDATION", async () => {
    const res = await handleGetPublicVendorProfile({ humanRef: "not-a-human-ref" });
    expect(res.status).toBe(400);
  });

  // ── Anonymous-role RLS positive/negative (Doc-8B §5 DB-role-switch backstop) ──────────────────────

  it("RLS POSITIVE: restricted role with NO GUCs (anonymous) sees the live, public vendor_profiles row", async () => {
    const rows = await asRestrictedRole({}, (tx) =>
      tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM marketplace.vendor_profiles WHERE id = $1::uuid`,
        VP_FOUND,
      ),
    );
    expect(rows.map((r) => r.id)).toEqual([VP_FOUND]);
  });

  it("RLS NEGATIVE: restricted role with NO GUCs (anonymous) does NOT see a soft-deleted vendor_profiles row", async () => {
    const rows = await asRestrictedRole({}, (tx) =>
      tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM marketplace.vendor_profiles WHERE id = $1::uuid`,
        VP_SOFT_DELETED,
      ),
    );
    expect(rows).toEqual([]);
  });

  it("RLS POSITIVE: category_assignments of a public/live vendor are visible (parent-anchored EXISTS)", async () => {
    const rows = await asRestrictedRole({}, (tx) =>
      tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM marketplace.category_assignments WHERE vendor_profile_id = $1::uuid ORDER BY id`,
        VP_FOUND,
      ),
    );
    // All THREE rows (incl. the removed one — RLS anchors on the PARENT's visibility only; the
    // app-layer query, not RLS, filters by `status='active'`, per Doc-6D §3.1.9's own pattern).
    expect(rows.map((r) => r.id).sort()).toEqual([CA_PRIMARY, CA_REMOVED, CA_SECONDARY].sort());
  });

  it("RLS NEGATIVE: category_assignments of a soft-deleted (parent-invisible) vendor are hidden", async () => {
    const rows = await asRestrictedRole({}, (tx) =>
      tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM marketplace.category_assignments WHERE vendor_profile_id = $1::uuid`,
        VP_SOFT_DELETED,
      ),
    );
    expect(rows).toEqual([]);
  });
});
