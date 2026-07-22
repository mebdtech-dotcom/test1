import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { handleListVendorDirectory } from "../../src/server/marketplace";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// Wave-3 M2 SECOND slice — the wired `marketplace.list_vendor_directory.v1` vertical-slice
// integration test (Doc-4D_Content_v1.0_PassB_Discovery.md §D6 line 21 / field-level realization
// Doc-5D_VendorDirectoryProjection_Patch_v1.0.3 / PATCH-5D-VLD-01). Anonymous PUBLIC read — no
// session, no active-org context; exercised through the wired HTTP-handler core
// (`handleListVendorDirectory`, `src/server/marketplace`) against a real Postgres.
//
// ISOLATION: `list_vendor_directory` has no test-scoping parameter and reads the FULL table — every
// fixture below shares `country: COUNTRY_MARKER` (a value no other test/fixture ever uses), and every
// assertion that needs an EXACT page/set filters by it, so this file's assertions cannot be
// contaminated by another test file's concurrently-live fixtures (Doc-8B — real Postgres, no per-file
// schema reset).
//
// RLS NOTE (same posture as the sibling W3-MKT-1 slice tests): the local/CI test connection runs as
// `postgres` (rolbypassrls=true), so the wired-composition assertions exercise the APP-LAYER
// visibility predicate (`vendor-visibility.policy.ts`) — the authorization model. The dedicated
// `asRestrictedRole` cases at the end separately prove the DB-level RLS backstop on the same fixtures.

const COUNTRY_MARKER = "W3MKT-LVD-Testland";
// A SECOND, independent country marker isolating the keyset-tiebreak fixture (below) from the main 8
// vendors — so the tiebreak test and the existing exclusion/pagination tests never contaminate each
// other's exact-set assertions (same isolation discipline as COUNTRY_MARKER; see file-top ISOLATION).
const COUNTRY_MARKER_TIE = "W3MKT-LVD-Tieland";

const CAT_A = "01930000-0000-7000-8000-000000007001"; // "W3MKT LVD Category A"
const CAT_B = "01930000-0000-7000-8000-000000007002"; // "W3MKT LVD Category B"

// Numeric-prefixed names fix a deterministic total order and let excluded rows (banned/suspended/
// soft-deleted) sit BETWEEN visible ones — directly exercising Doc-5A §8.7 exclusion-consistency
// (no gap/overlap at a page boundary straddling an excluded row).
const VP_ALPHA = "01930000-0000-7000-8000-000000006001"; // "01 Alpha" — visible
const VP_BRAVO = "01930000-0000-7000-8000-000000006002"; // "02 Bravo" — visible
const VP_BANNED = "01930000-0000-7000-8000-000000006003"; // "03 Banned" — EXCLUDED (status=banned)
const VP_CHARLIE = "01930000-0000-7000-8000-000000006004"; // "04 Charlie" — visible
const VP_SUSPENDED = "01930000-0000-7000-8000-000000006005"; // "05 Suspended" — EXCLUDED (status=suspended)
const VP_DELTA = "01930000-0000-7000-8000-000000006006"; // "06 Delta" — visible
const VP_SOFT_DELETED = "01930000-0000-7000-8000-000000006007"; // "07 SoftDeleted" — EXCLUDED (deleted_at)
const VP_ECHO = "01930000-0000-7000-8000-000000006008"; // "08 Echo" — visible

// ── Keyset-tiebreak fixture (COUNTRY_MARKER_TIE) — the compound `name > X OR (name = X AND id > Y)`
//    comparison PROOF. Two vendors share the EXACT name "MMM Same Name"; their ids are seeded in a
//    NON-sorted insertion order (the higher id is inserted first) so a page boundary that splits the
//    pair must rely on the (name, id) tiebreak — NOT insertion order — to return them without a gap.
//    A naive `name > X AND id > Y` keyset would DROP the higher-id twin at the boundary (its name is
//    not strictly greater), leaving a gap this test detects.
const VP_TIE_ANCHOR_FIRST = "01930000-0000-7000-8000-00000000a010"; // "AAA Anchor First" — visible
const VP_TIE_SAME_HI = "01930000-0000-7000-8000-00000000a002"; // "MMM Same Name" (HIGHER id) — visible
const VP_TIE_SAME_LO = "01930000-0000-7000-8000-00000000a001"; // "MMM Same Name" (LOWER id) — visible
const VP_TIE_ANCHOR_LAST = "01930000-0000-7000-8000-00000000a020"; // "ZZZ Anchor Last" — visible

const ORG = (n: number) => `01930000-0000-7000-8000-0000000000c${n}`;

const ALL_VP_IDS = [
  VP_ALPHA,
  VP_BRAVO,
  VP_BANNED,
  VP_CHARLIE,
  VP_SUSPENDED,
  VP_DELTA,
  VP_SOFT_DELETED,
  VP_ECHO,
  VP_TIE_ANCHOR_FIRST,
  VP_TIE_SAME_HI,
  VP_TIE_SAME_LO,
  VP_TIE_ANCHOR_LAST,
];
const ALL_CAT_IDS = [CAT_A, CAT_B];
const CA_ALPHA_A = "01930000-0000-7000-8000-000000008001";
const CA_BRAVO_B = "01930000-0000-7000-8000-000000008002";
const CA_CHARLIE_A = "01930000-0000-7000-8000-000000008003";
const CA_CHARLIE_B = "01930000-0000-7000-8000-000000008004";
const ALL_CA_IDS = [CA_ALPHA_A, CA_BRAVO_B, CA_CHARLIE_A, CA_CHARLIE_B];

async function seedFixture(): Promise<void> {
  await prisma.category.createMany({
    data: [
      {
        id: CAT_A,
        parentId: null,
        name: "W3MKT LVD Category A",
        slug: "w3mkt-lvd-cat-a",
        level: 1,
        path: "cat-a",
      },
      {
        id: CAT_B,
        parentId: null,
        name: "W3MKT LVD Category B",
        slug: "w3mkt-lvd-cat-b",
        level: 1,
        path: "cat-b",
      },
    ],
  });

  await prisma.vendorProfile.createMany({
    data: [
      {
        id: VP_ALPHA,
        humanRef: "VENDOR-2026-910001",
        controllingOrganizationId: ORG(1),
        name: "01 Alpha",
        slug: "w3mkt-lvd-01-alpha",
        status: "active",
        country: COUNTRY_MARKER,
        division: "Dhaka",
        district: "TejgaonLVD",
        industrialZone: "ZoneA-LVD",
        canSupply: true,
      },
      {
        id: VP_BRAVO,
        humanRef: "VENDOR-2026-910002",
        controllingOrganizationId: ORG(2),
        name: "02 Bravo",
        slug: "w3mkt-lvd-02-bravo",
        status: "active",
        country: COUNTRY_MARKER,
        division: "Dhaka",
        district: "MirpurLVD",
        industrialZone: "ZoneA-LVD",
        canService: true,
      },
      {
        id: VP_BANNED,
        humanRef: "VENDOR-2026-910003",
        controllingOrganizationId: ORG(3),
        name: "03 Banned",
        slug: "w3mkt-lvd-03-banned",
        status: "banned",
        country: COUNTRY_MARKER,
        canSupply: true,
      },
      {
        id: VP_CHARLIE,
        humanRef: "VENDOR-2026-910004",
        controllingOrganizationId: ORG(4),
        name: "04 Charlie",
        slug: "w3mkt-lvd-04-charlie",
        status: "active",
        country: COUNTRY_MARKER,
        division: "Chattogram",
        district: "KalurghatLVD",
        industrialZone: "ZoneB-LVD",
        canSupply: true,
        canService: true,
      },
      {
        id: VP_SUSPENDED,
        humanRef: "VENDOR-2026-910005",
        controllingOrganizationId: ORG(5),
        name: "05 Suspended",
        slug: "w3mkt-lvd-05-suspended",
        status: "suspended",
        country: COUNTRY_MARKER,
      },
      {
        id: VP_DELTA,
        humanRef: "VENDOR-2026-910006",
        controllingOrganizationId: ORG(6),
        name: "06 Delta",
        slug: "w3mkt-lvd-06-delta",
        status: "active",
        country: COUNTRY_MARKER,
        division: "Chattogram",
        district: "KalurghatLVD",
        industrialZone: "ZoneB-LVD",
        canFabricate: true,
      },
      {
        id: VP_SOFT_DELETED,
        humanRef: "VENDOR-2026-910007",
        controllingOrganizationId: ORG(7),
        name: "07 SoftDeleted",
        slug: "w3mkt-lvd-07-softdeleted",
        status: "active",
        country: COUNTRY_MARKER,
        deletedAt: new Date(),
      },
      {
        id: VP_ECHO,
        humanRef: "VENDOR-2026-910008",
        controllingOrganizationId: ORG(8),
        name: "08 Echo",
        slug: "w3mkt-lvd-08-echo",
        status: "active",
        country: COUNTRY_MARKER,
        division: "Sylhet",
        district: "SylhetSadarLVD",
        industrialZone: "ZoneC-LVD",
        canConsult: true,
      },
      // ── Keyset-tiebreak fixture (COUNTRY_MARKER_TIE). Insertion order is DELIBERATELY not id order:
      //    the anchor-first row, then the HIGHER-id twin, then the LOWER-id twin, then the anchor-last
      //    row — so a passing walk cannot be an accident of insertion order (Doc-5D §3 (name, id) order).
      {
        id: VP_TIE_ANCHOR_FIRST,
        humanRef: "VENDOR-2026-920001",
        controllingOrganizationId: "01930000-0000-7000-8000-0000000000d1",
        name: "AAA Anchor First",
        slug: "w3mkt-lvd-tie-anchor-first",
        status: "active",
        country: COUNTRY_MARKER_TIE,
      },
      {
        id: VP_TIE_SAME_HI,
        humanRef: "VENDOR-2026-920002",
        controllingOrganizationId: "01930000-0000-7000-8000-0000000000d2",
        name: "MMM Same Name",
        slug: "w3mkt-lvd-tie-same-hi",
        status: "active",
        country: COUNTRY_MARKER_TIE,
      },
      {
        id: VP_TIE_SAME_LO,
        humanRef: "VENDOR-2026-920003",
        controllingOrganizationId: "01930000-0000-7000-8000-0000000000d3",
        name: "MMM Same Name",
        slug: "w3mkt-lvd-tie-same-lo",
        status: "active",
        country: COUNTRY_MARKER_TIE,
      },
      {
        id: VP_TIE_ANCHOR_LAST,
        humanRef: "VENDOR-2026-920004",
        controllingOrganizationId: "01930000-0000-7000-8000-0000000000d4",
        name: "ZZZ Anchor Last",
        slug: "w3mkt-lvd-tie-anchor-last",
        status: "active",
        country: COUNTRY_MARKER_TIE,
      },
    ],
  });

  await prisma.categoryAssignment.createMany({
    data: [
      {
        id: CA_ALPHA_A,
        vendorProfileId: VP_ALPHA,
        categoryId: CAT_A,
        level: "primary",
        status: "active",
      },
      {
        id: CA_BRAVO_B,
        vendorProfileId: VP_BRAVO,
        categoryId: CAT_B,
        level: "primary",
        status: "active",
      },
      {
        id: CA_CHARLIE_A,
        vendorProfileId: VP_CHARLIE,
        categoryId: CAT_A,
        level: "secondary",
        status: "active",
      },
      {
        id: CA_CHARLIE_B,
        vendorProfileId: VP_CHARLIE,
        categoryId: CAT_B,
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

/** Assert a `200` success envelope and return its `result`. */
function expectSuccess(res: Awaited<ReturnType<typeof handleListVendorDirectory>>) {
  expect(res.status).toBe(200);
  if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
  return res.body.result;
}

function names(items: Array<{ name: string }>): string[] {
  return items.map((i) => i.name);
}

describe("Wave-3 M2 marketplace.list_vendor_directory.v1 wired slice (GET /marketplace/vendor_directory)", () => {
  beforeAll(async () => {
    await ensureRestrictedRlsRole();
    await teardownFixture(); // clean any residue from a prior aborted run (deterministic fixtures).
    await seedFixture();
  });

  afterAll(async () => {
    await teardownFixture();
    await prisma.$disconnect();
  });

  // ── Basic pagination: page 1 → cursor → page 2 → cursor → page 3, no overlap/gaps ────────────────

  it("pagination: page_size=2 across 3 pages covers all 5 visible vendors exactly once, in name order", async () => {
    const page1 = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER },
        pageSize: "2",
      }),
    );
    expect(names(page1.items)).toEqual(["01 Alpha", "02 Bravo"]);
    expect(page1.pageInfo.hasMore).toBe(true);
    expect(typeof page1.pageInfo.nextCursor).toBe("string");

    // The excluded "03 Banned" row sits BETWEEN "02 Bravo" and "04 Charlie" in raw table order — the
    // next page must skip it cleanly (Doc-5A §8.7: no gap, no leaked excluded row).
    const page2 = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER },
        pageSize: "2",
        cursor: page1.pageInfo.nextCursor,
      }),
    );
    expect(names(page2.items)).toEqual(["04 Charlie", "06 Delta"]);
    expect(page2.pageInfo.hasMore).toBe(true);
    expect(typeof page2.pageInfo.nextCursor).toBe("string");

    // The excluded "05 Suspended" and "07 SoftDeleted" rows sit either side of this boundary too.
    const page3 = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER },
        pageSize: "2",
        cursor: page2.pageInfo.nextCursor,
      }),
    );
    expect(names(page3.items)).toEqual(["08 Echo"]);
    expect(page3.pageInfo.hasMore).toBe(false);
    expect(page3.pageInfo.nextCursor).toBeUndefined();

    // No overlap, no gaps: the concatenation is EXACTLY the 5 visible vendors, each exactly once.
    const combined = [...page1.items, ...page2.items, ...page3.items];
    expect(names(combined)).toEqual(["01 Alpha", "02 Bravo", "04 Charlie", "06 Delta", "08 Echo"]);
    expect(new Set(combined.map((i) => i.vendorProfileId)).size).toBe(5);
  });

  it("a single unbounded page (country filter only) returns the SAME 5 visible vendors, in order, with a real slug", async () => {
    const result = expectSuccess(
      await handleListVendorDirectory({ filters: { country: COUNTRY_MARKER } }),
    );
    expect(names(result.items)).toEqual([
      "01 Alpha",
      "02 Bravo",
      "04 Charlie",
      "06 Delta",
      "08 Echo",
    ]);
    expect(result.pageInfo).toEqual({ hasMore: false });
    // Every item carries the flagged `slug` sibling field (see `contracts/types.ts`).
    expect(result.items[0]).toMatchObject({
      vendorProfileId: VP_ALPHA,
      slug: "w3mkt-lvd-01-alpha",
    });
  });

  it("keyset tiebreak: two SAME-name vendors straddling a page boundary come back in ascending-id order with no gap (proves `name>X OR (name=X AND id>Y)`, not a naive AND)", async () => {
    // page_size=2 lands the boundary MID-pair: page 1's last row is the LOWER-id "MMM Same Name" and
    // page 2's first row is its HIGHER-id twin — the exact split a naive `name > X AND id > Y` keyset
    // drops (the twin's name is not strictly greater than the cursor's, so AND excludes it → a gap).
    const page1 = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER_TIE },
        pageSize: "2",
      }),
    );
    expect(names(page1.items)).toEqual(["AAA Anchor First", "MMM Same Name"]);
    expect(page1.items[1]?.vendorProfileId).toBe(VP_TIE_SAME_LO); // the LOWER-id twin ends page 1
    expect(page1.pageInfo.hasMore).toBe(true);
    expect(typeof page1.pageInfo.nextCursor).toBe("string");

    const page2 = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER_TIE },
        pageSize: "2",
        cursor: page1.pageInfo.nextCursor,
      }),
    );
    expect(names(page2.items)).toEqual(["MMM Same Name", "ZZZ Anchor Last"]);
    expect(page2.items[0]?.vendorProfileId).toBe(VP_TIE_SAME_HI); // the HIGHER-id twin opens page 2
    expect(page2.pageInfo.hasMore).toBe(false);

    // No gap / no overlap across the boundary: exactly the 4 tie-fixture rows, each once.
    const combined = [...page1.items, ...page2.items];
    expect(names(combined)).toEqual([
      "AAA Anchor First",
      "MMM Same Name",
      "MMM Same Name",
      "ZZZ Anchor Last",
    ]);
    expect(new Set(combined.map((i) => i.vendorProfileId)).size).toBe(4);

    // The two SAME-name rows appear in ascending vendor_profile_id order (the id tiebreak) — the exact
    // assertion a naive-AND keyset fails (it would have dropped VP_TIE_SAME_HI, leaving a gap).
    const sameName = combined
      .filter((i) => i.name === "MMM Same Name")
      .map((i) => i.vendorProfileId);
    expect(sameName).toEqual([VP_TIE_SAME_LO, VP_TIE_SAME_HI]);
  });

  // ── Filters — individually and combined ─────────────────────────────────────────────────────────

  it("filter: category_id (each of the 2 categories, individually)", async () => {
    const catA = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, category_id: CAT_A },
      }),
    );
    expect(names(catA.items)).toEqual(["01 Alpha", "04 Charlie"]);

    const catB = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, category_id: CAT_B },
      }),
    );
    expect(names(catB.items)).toEqual(["02 Bravo", "04 Charlie"]);
  });

  it("filter: geography (division / district / industrial_zone, each individually)", async () => {
    const dhaka = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, division: "Dhaka" },
      }),
    );
    expect(names(dhaka.items)).toEqual(["01 Alpha", "02 Bravo"]);

    const tejgaon = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, district: "TejgaonLVD" },
      }),
    );
    expect(names(tejgaon.items)).toEqual(["01 Alpha"]);

    const zoneB = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, industrial_zone: "ZoneB-LVD" },
      }),
    );
    expect(names(zoneB.items)).toEqual(["04 Charlie", "06 Delta"]);
  });

  it("filter: capability (each of the 4 flags, individually — ONE flag per call, Doc-5D §2)", async () => {
    const canSupply = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, capability: "can_supply" },
      }),
    );
    expect(names(canSupply.items)).toEqual(["01 Alpha", "04 Charlie"]);

    const canService = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, capability: "can_service" },
      }),
    );
    expect(names(canService.items)).toEqual(["02 Bravo", "04 Charlie"]);

    const canFabricate = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, capability: "can_fabricate" },
      }),
    );
    expect(names(canFabricate.items)).toEqual(["06 Delta"]);

    const canConsult = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, capability: "can_consult" },
      }),
    );
    expect(names(canConsult.items)).toEqual(["08 Echo"]);
  });

  it("filter: combined (division + capability; category_id + capability)", async () => {
    const chattogramSuppliers = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, division: "Chattogram", capability: "can_supply" },
      }),
    );
    // "06 Delta" is Chattogram but canFabricate (not canSupply) — excluded by the combined filter.
    expect(names(chattogramSuppliers.items)).toEqual(["04 Charlie"]);

    const catASuppliers = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, category_id: CAT_A, capability: "can_supply" },
      }),
    );
    expect(names(catASuppliers.items)).toEqual(["01 Alpha", "04 Charlie"]);
  });

  // ── Non-disclosure + exclusion-consistency (Doc-5A §8.7) ────────────────────────────────────────

  it("non-disclosure: a banned / suspended / soft-deleted vendor never appears in items, regardless of page_size", async () => {
    const result = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER },
        pageSize: "8",
      }),
    );
    expect(names(result.items)).toEqual([
      "01 Alpha",
      "02 Bravo",
      "04 Charlie",
      "06 Delta",
      "08 Echo",
    ]);
    expect(result.items.map((i) => i.vendorProfileId)).not.toContain(VP_BANNED);
    expect(result.items.map((i) => i.vendorProfileId)).not.toContain(VP_SUSPENDED);
    expect(result.items.map((i) => i.vendorProfileId)).not.toContain(VP_SOFT_DELETED);
    // 5 visible rows fit inside page_size=8 — has_more correctly reflects the EXCLUSION-GATED set,
    // never the raw (8 seeded, 3 excluded) row count.
    expect(result.pageInfo.hasMore).toBe(false);
  });

  it("exclusion-consistency: has_more/cursor continuation stay correct straddling an excluded row (page_size=1)", async () => {
    // "02 Bravo" is immediately followed by the EXCLUDED "03 Banned" in raw table order; the next
    // page must still correctly report has_more and land past it, never surface/count "03 Banned"
    // and never leave a gap.
    const alphaPage = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, division: "Dhaka" },
        pageSize: "1",
      }),
    );
    expect(names(alphaPage.items)).toEqual(["01 Alpha"]);
    expect(alphaPage.pageInfo.hasMore).toBe(true);
    expect(typeof alphaPage.pageInfo.nextCursor).toBe("string");

    const bravoPage = expectSuccess(
      await handleListVendorDirectory({
        filters: { country: COUNTRY_MARKER, division: "Dhaka" },
        pageSize: "1",
        cursor: alphaPage.pageInfo.nextCursor,
      }),
    );
    expect(names(bravoPage.items)).toEqual(["02 Bravo"]);
    // Bravo is Dhaka's LAST visible row (Charlie/Delta/Echo are outside the division=Dhaka filter) —
    // has_more is false even though "03 Banned" (also excluded from this filter's SQL WHERE) follows
    // it in the raw table.
    expect(bravoPage.pageInfo.hasMore).toBe(false);
  });

  // ── page_size validation (Doc-5A §8.5 — POLICY-bound; over-max is a SYNTAX 400, never clamped) ───

  it("page_size at the marketplace.list_page_size_max boundary (100) succeeds", async () => {
    const res = await handleListVendorDirectory({
      filters: { country: COUNTRY_MARKER },
      pageSize: "100",
    });
    expect(res.status).toBe(200);
  });

  it("page_size over marketplace.list_page_size_max (101) → 400 VALIDATION, never silently clamped", async () => {
    const res = await handleListVendorDirectory({
      filters: { country: COUNTRY_MARKER },
      pageSize: "101",
    });
    expect(res.status).toBe(400);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("VALIDATION");
    expect(res.body.error.error_code).toBe("marketplace_discovery_invalid_input");
  });

  it("page_size zero / non-integer → 400 VALIDATION", async () => {
    const zero = await handleListVendorDirectory({
      filters: { country: COUNTRY_MARKER },
      pageSize: "0",
    });
    expect(zero.status).toBe(400);

    const nonInteger = await handleListVendorDirectory({
      filters: { country: COUNTRY_MARKER },
      pageSize: "abc",
    });
    expect(nonInteger.status).toBe(400);
  });

  // ── SYNTAX — undeclared filter / malformed field / malformed cursor ────────────────────────────

  it("an undeclared filter field → 400 VALIDATION (Doc-5A §8.3)", async () => {
    const res = await handleListVendorDirectory({
      filters: { country: COUNTRY_MARKER, vendor_type_preset: "distributor" },
    });
    expect(res.status).toBe(400);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_code).toBe("marketplace_discovery_invalid_input");
  });

  it("a malformed category_id (not a uuid) → 400 VALIDATION", async () => {
    const res = await handleListVendorDirectory({
      filters: { country: COUNTRY_MARKER, category_id: "not-a-uuid" },
    });
    expect(res.status).toBe(400);
  });

  it("an unrecognized capability value → 400 VALIDATION", async () => {
    const res = await handleListVendorDirectory({
      filters: { country: COUNTRY_MARKER, capability: "can_teleport" },
    });
    expect(res.status).toBe(400);
  });

  it("a malformed (non-decodable) cursor → 400 VALIDATION", async () => {
    const res = await handleListVendorDirectory({
      filters: { country: COUNTRY_MARKER },
      cursor: "not-a-real-cursor!!",
    });
    expect(res.status).toBe(400);
  });

  // ── Anonymous-role RLS positive/negative (Doc-8B §5 DB-role-switch backstop) ──────────────────────

  it("RLS POSITIVE: restricted role with NO GUCs (anonymous) sees a live vendor_profiles row", async () => {
    const rows = await asRestrictedRole({}, (tx) =>
      tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM marketplace.vendor_profiles WHERE id = $1::uuid`,
        VP_ALPHA,
      ),
    );
    expect(rows.map((r) => r.id)).toEqual([VP_ALPHA]);
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
});
