import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { handleResolveVendorSlug } from "../../src/server/marketplace";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-MKT-1 [Wave-3 M2 pilot slice] — the wired `marketplace.resolve_vendor_slug.v1` vertical-slice
// integration test (Doc-4D_VendorSlugResolve_Patch_v1.0.4 / Doc-5D_VendorSlugResolve_Patch_v1.0.2).
// Anonymous PUBLIC read — no session, no active-org context; exercised through the wired HTTP-handler
// core (`handleResolveVendorSlug`, `src/server/marketplace`) against a real Postgres.
//
// RLS NOTE (same posture as identity's WP-1.5/1.7 split — see `get-buyer-profile-route.test.ts`): the
// local/CI test connection runs as `postgres` (rolbypassrls=true), so the WIRED-composition
// assertions below exercise the APP-LAYER visibility predicate (`vendor-visibility.policy.ts`) — the
// authorization model. The dedicated `asRestrictedRole` cases at the end separately prove the DB-level
// RLS backstop (Doc-6D §3.1.9 / 6D-VSS-01.3) on the same fixtures.

const VP_LIVE = "01930000-0000-7000-8000-000000001001";
const VP_MIGRATED_TARGET_LIVE = "01930000-0000-7000-8000-000000001002";
const VP_MIGRATED_TARGET_BANNED = "01930000-0000-7000-8000-000000001003";
const VP_BANNED_LIVE_SLUG = "01930000-0000-7000-8000-000000001004";
const VP_SOFT_DELETED = "01930000-0000-7000-8000-000000001005";
const VP_MIGRATED_TARGET_SOFT_DELETED = "01930000-0000-7000-8000-000000001006";
const VP_MIGRATED_TARGET_SUSPENDED = "01930000-0000-7000-8000-000000001007";
const VP_LIVE_WITH_HISTORY = "01930000-0000-7000-8000-000000001008";
const VP_MULTI_HOP_TARGET = "01930000-0000-7000-8000-000000001009";
// `vendor_profiles_org_live_uq` (partial-unique, WHERE deleted_at IS NULL) admits ONE live profile
// per controlling org — each seeded vendor gets its OWN org id (bare UUID, no cross-schema FK).
const ORG_LIVE = "01930000-0000-7000-8000-0000000000a1";
const ORG_MIGRATED_TARGET_LIVE = "01930000-0000-7000-8000-0000000000a2";
const ORG_MIGRATED_TARGET_BANNED = "01930000-0000-7000-8000-0000000000a3";
const ORG_BANNED_LIVE_SLUG = "01930000-0000-7000-8000-0000000000a4";
const ORG_SOFT_DELETED = "01930000-0000-7000-8000-0000000000a5";
const ORG_MIGRATED_TARGET_SOFT_DELETED = "01930000-0000-7000-8000-0000000000a6";
const ORG_MIGRATED_TARGET_SUSPENDED = "01930000-0000-7000-8000-0000000000a7";
const ORG_LIVE_WITH_HISTORY = "01930000-0000-7000-8000-0000000000a8";
const ORG_MULTI_HOP_TARGET = "01930000-0000-7000-8000-0000000000a9";
const ADMIN_APPROVER = "01930000-0000-7000-8000-0000000000ab";
const VSH_MIGRATED_LIVE = "01930000-0000-7000-8000-000000002001";
const VSH_MIGRATED_BANNED = "01930000-0000-7000-8000-000000002002";
const VSH_MIGRATED_SOFT_DELETED = "01930000-0000-7000-8000-000000002003";
const VSH_MIGRATED_SUSPENDED = "01930000-0000-7000-8000-000000002004";
const VSH_LIVE_WITH_HISTORY = "01930000-0000-7000-8000-000000002005";
const VSH_MULTI_HOP_1 = "01930000-0000-7000-8000-000000002006";
const VSH_MULTI_HOP_2 = "01930000-0000-7000-8000-000000002007";

const SLUG_LIVE = "w3mkt-rvs-live";
const SLUG_TARGET_CURRENT = "w3mkt-rvs-target-current";
const SLUG_TARGET_OLD = "w3mkt-rvs-target-old";
const SLUG_TARGET_BANNED_CURRENT = "w3mkt-rvs-target-banned-current";
const SLUG_TARGET_BANNED_OLD = "w3mkt-rvs-target-banned-old";
const SLUG_BANNED_LIVE = "w3mkt-rvs-banned-live-slug";
const SLUG_SOFT_DELETED = "w3mkt-rvs-soft-deleted";
const SLUG_ABSENT = "w3mkt-rvs-absent-vendor";
// Fix 2 (Review-A MINOR-1 / Review-B coverage gaps): the two-hop non-disclosure case, covered beyond
// the existing `status: 'banned'` migration target — a soft-deleted target and a `status: 'suspended'`
// target must ALSO collapse byte-identically to absent.
const SLUG_TARGET_DELETED_CURRENT = "w3mkt-rvs-target-deleted-current";
const SLUG_TARGET_DELETED_OLD = "w3mkt-rvs-target-deleted-old";
const SLUG_TARGET_SUSPENDED_CURRENT = "w3mkt-rvs-target-suspended-current";
const SLUG_TARGET_SUSPENDED_OLD = "w3mkt-rvs-target-suspended-old";
// A slug that is BOTH live AND separately referenced as a history row's `new_slug` (some other old
// slug once migrated to it) — proves the live-first branch short-circuits before history is ever
// consulted for an already-live slug.
const SLUG_LIVE_WITH_HISTORY = "w3mkt-rvs-live-with-history";
const SLUG_LIVE_WITH_HISTORY_OLD = "w3mkt-rvs-live-with-history-old";
// Fix 3 (Review-B MAJOR): a genuine multi-hop migration A→B→C. The FIRST history row's `new_slug` is
// the STALE intermediate slug B, never the vendor's actual current live slug C — the one fixture that
// can distinguish a correct `row.vendorProfile.slug` (current) join from a `row.newSlug` (stale) bug.
const SLUG_MULTI_HOP_A = "w3mkt-rvs-multihop-a";
const SLUG_MULTI_HOP_B = "w3mkt-rvs-multihop-b";
const SLUG_MULTI_HOP_C = "w3mkt-rvs-multihop-c";

const ALL_VP_IDS = [
  VP_LIVE,
  VP_MIGRATED_TARGET_LIVE,
  VP_MIGRATED_TARGET_BANNED,
  VP_BANNED_LIVE_SLUG,
  VP_SOFT_DELETED,
  VP_MIGRATED_TARGET_SOFT_DELETED,
  VP_MIGRATED_TARGET_SUSPENDED,
  VP_LIVE_WITH_HISTORY,
  VP_MULTI_HOP_TARGET,
];

/** Strip the platform-minted `reference_id` (always distinct per call) before a byte-equivalence diff. */
function withoutReferenceId(body: unknown): unknown {
  if (typeof body !== "object" || body === null) return body;
  const clone = { ...(body as Record<string, unknown>) };
  delete clone.reference_id;
  return clone;
}

async function seedFixture(): Promise<void> {
  await prisma.vendorProfile.createMany({
    data: [
      {
        id: VP_LIVE,
        humanRef: "VENDOR-2026-900001",
        controllingOrganizationId: ORG_LIVE,
        name: "W3MKT RVS Live Vendor",
        slug: SLUG_LIVE,
        status: "active",
      },
      {
        id: VP_MIGRATED_TARGET_LIVE,
        humanRef: "VENDOR-2026-900002",
        controllingOrganizationId: ORG_MIGRATED_TARGET_LIVE,
        name: "W3MKT RVS Migrated Target (Live)",
        slug: SLUG_TARGET_CURRENT,
        status: "active",
      },
      {
        id: VP_MIGRATED_TARGET_BANNED,
        humanRef: "VENDOR-2026-900003",
        controllingOrganizationId: ORG_MIGRATED_TARGET_BANNED,
        name: "W3MKT RVS Migrated Target (Banned)",
        slug: SLUG_TARGET_BANNED_CURRENT,
        status: "banned",
      },
      {
        id: VP_BANNED_LIVE_SLUG,
        humanRef: "VENDOR-2026-900004",
        controllingOrganizationId: ORG_BANNED_LIVE_SLUG,
        name: "W3MKT RVS Banned (own live slug)",
        slug: SLUG_BANNED_LIVE,
        status: "banned",
      },
      {
        id: VP_SOFT_DELETED,
        humanRef: "VENDOR-2026-900005",
        controllingOrganizationId: ORG_SOFT_DELETED,
        name: "W3MKT RVS Soft-deleted",
        slug: SLUG_SOFT_DELETED,
        status: "active",
        deletedAt: new Date(),
      },
      {
        id: VP_MIGRATED_TARGET_SOFT_DELETED,
        humanRef: "VENDOR-2026-900006",
        controllingOrganizationId: ORG_MIGRATED_TARGET_SOFT_DELETED,
        name: "W3MKT RVS Migrated Target (Soft-deleted)",
        slug: SLUG_TARGET_DELETED_CURRENT,
        status: "active",
        deletedAt: new Date(),
      },
      {
        id: VP_MIGRATED_TARGET_SUSPENDED,
        humanRef: "VENDOR-2026-900007",
        controllingOrganizationId: ORG_MIGRATED_TARGET_SUSPENDED,
        name: "W3MKT RVS Migrated Target (Suspended)",
        slug: SLUG_TARGET_SUSPENDED_CURRENT,
        status: "suspended",
      },
      {
        id: VP_LIVE_WITH_HISTORY,
        humanRef: "VENDOR-2026-900008",
        controllingOrganizationId: ORG_LIVE_WITH_HISTORY,
        name: "W3MKT RVS Live-with-history Vendor",
        slug: SLUG_LIVE_WITH_HISTORY,
        status: "active",
      },
      {
        id: VP_MULTI_HOP_TARGET,
        humanRef: "VENDOR-2026-900009",
        controllingOrganizationId: ORG_MULTI_HOP_TARGET,
        name: "W3MKT RVS Multi-hop Target",
        slug: SLUG_MULTI_HOP_C,
        status: "active",
      },
    ],
  });

  // `vendor_slug_history` has NO write path in this slice ([ESC-MKT-SUBDOMAIN-MIGRATE] out of scope)
  // — migrated-slug cases seed history directly (per the plan's step 11 instruction).
  await prisma.vendorSlugHistory.createMany({
    data: [
      {
        id: VSH_MIGRATED_LIVE,
        vendorProfileId: VP_MIGRATED_TARGET_LIVE,
        oldSlug: SLUG_TARGET_OLD,
        newSlug: SLUG_TARGET_CURRENT,
        reason: "test migration — target still live",
        approvedBy: ADMIN_APPROVER,
      },
      {
        id: VSH_MIGRATED_BANNED,
        vendorProfileId: VP_MIGRATED_TARGET_BANNED,
        oldSlug: SLUG_TARGET_BANNED_OLD,
        newSlug: SLUG_TARGET_BANNED_CURRENT,
        reason: "test migration — target later banned",
        approvedBy: ADMIN_APPROVER,
      },
      {
        id: VSH_MIGRATED_SOFT_DELETED,
        vendorProfileId: VP_MIGRATED_TARGET_SOFT_DELETED,
        oldSlug: SLUG_TARGET_DELETED_OLD,
        newSlug: SLUG_TARGET_DELETED_CURRENT,
        reason: "test migration — target later soft-deleted",
        approvedBy: ADMIN_APPROVER,
      },
      {
        id: VSH_MIGRATED_SUSPENDED,
        vendorProfileId: VP_MIGRATED_TARGET_SUSPENDED,
        oldSlug: SLUG_TARGET_SUSPENDED_OLD,
        newSlug: SLUG_TARGET_SUSPENDED_CURRENT,
        reason: "test migration — target later suspended",
        approvedBy: ADMIN_APPROVER,
      },
      {
        id: VSH_LIVE_WITH_HISTORY,
        vendorProfileId: VP_LIVE_WITH_HISTORY,
        oldSlug: SLUG_LIVE_WITH_HISTORY_OLD,
        newSlug: SLUG_LIVE_WITH_HISTORY,
        reason: "test migration — old slug once migrated to what is now the live slug",
        approvedBy: ADMIN_APPROVER,
      },
      // Multi-hop A→B→C: the FIRST hop's `newSlug` (B) is deliberately NOT the vendor's current live
      // slug (C) — only the SECOND hop's `newSlug` matches. A `row.newSlug`-based bug looking up A
      // would return the stale B; the correct join-to-current-slug behavior returns C.
      {
        id: VSH_MULTI_HOP_1,
        vendorProfileId: VP_MULTI_HOP_TARGET,
        oldSlug: SLUG_MULTI_HOP_A,
        newSlug: SLUG_MULTI_HOP_B,
        reason: "test migration — multi-hop, first hop A to B",
        approvedBy: ADMIN_APPROVER,
      },
      {
        id: VSH_MULTI_HOP_2,
        vendorProfileId: VP_MULTI_HOP_TARGET,
        oldSlug: SLUG_MULTI_HOP_B,
        newSlug: SLUG_MULTI_HOP_C,
        reason: "test migration — multi-hop, second hop B to C (C is the current live slug)",
        approvedBy: ADMIN_APPROVER,
      },
    ],
  });
}

const ALL_VSH_IDS = [
  VSH_MIGRATED_LIVE,
  VSH_MIGRATED_BANNED,
  VSH_MIGRATED_SOFT_DELETED,
  VSH_MIGRATED_SUSPENDED,
  VSH_LIVE_WITH_HISTORY,
  VSH_MULTI_HOP_1,
  VSH_MULTI_HOP_2,
];

async function teardownFixture(): Promise<void> {
  // TEST-ONLY hard-delete (production never hard-deletes — Invariant #8; the test DB is ephemeral).
  await prisma.vendorSlugHistory.deleteMany({ where: { id: { in: ALL_VSH_IDS } } });
  await prisma.vendorProfile.deleteMany({ where: { id: { in: ALL_VP_IDS } } });
}

describe("W3-MKT-1 marketplace.resolve_vendor_slug.v1 wired slice (GET /marketplace/vendor_slug_resolutions/{slug})", () => {
  beforeAll(async () => {
    await ensureRestrictedRlsRole();
    await teardownFixture(); // clean any residue from a prior aborted run (deterministic fixtures).
    await seedFixture();
  });

  afterAll(async () => {
    await teardownFixture();
    await prisma.$disconnect();
  });

  it("current-slug match: a live, visible vendor → 200 { status: 'current', vendorProfileId }", async () => {
    const res = await handleResolveVendorSlug(SLUG_LIVE);
    expect(res.status).toBe(200);
    expect("result" in res.body).toBe(true);
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    expect(res.body.result).toEqual({ status: "current", vendorProfileId: VP_LIVE });
    expect(res.body.reference_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("migrated-slug match, target still live → 200 { status: 'migrated', currentSlug: <target's CURRENT slug> }", async () => {
    const res = await handleResolveVendorSlug(SLUG_TARGET_OLD);
    expect(res.status).toBe(200);
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    expect(res.body.result).toEqual({ status: "migrated", currentSlug: SLUG_TARGET_CURRENT });
  });

  it("live-first short-circuit: a slug that is BOTH live AND separately referenced as a history row's `new_slug` → 200 { status: 'current' } (history is never consulted for an already-live slug)", async () => {
    const res = await handleResolveVendorSlug(SLUG_LIVE_WITH_HISTORY);
    expect(res.status).toBe(200);
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    expect(res.body.result).toEqual({
      status: "current",
      vendorProfileId: VP_LIVE_WITH_HISTORY,
    });
  });

  it("multi-hop migration A→B→C: looking up the FIRST old slug resolves to the vendor's ACTUAL CURRENT live slug (C), never the stale intermediate (B) a `row.newSlug`-based bug would return", async () => {
    const res = await handleResolveVendorSlug(SLUG_MULTI_HOP_A);
    expect(res.status).toBe(200);
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    expect(res.body.result).toEqual({ status: "migrated", currentSlug: SLUG_MULTI_HOP_C });
  });

  it("the two-hop non-disclosure case: migrated-slug match whose target is NOW banned → BYTE-IDENTICAL to absent not_found", async () => {
    const migratedButHidden = await handleResolveVendorSlug(SLUG_TARGET_BANNED_OLD);
    const absent = await handleResolveVendorSlug(SLUG_ABSENT);

    expect(migratedButHidden.status).toBe(404);
    expect(absent.status).toBe(404);
    // Diff the full response BODY (minus the always-distinct reference_id) — not just the status code.
    expect(withoutReferenceId(migratedButHidden.body)).toEqual(withoutReferenceId(absent.body));
  });

  it("the two-hop non-disclosure case: migrated-slug match whose target is NOW soft-deleted → BYTE-IDENTICAL to absent not_found", async () => {
    const migratedButHidden = await handleResolveVendorSlug(SLUG_TARGET_DELETED_OLD);
    const absent = await handleResolveVendorSlug(SLUG_ABSENT);

    expect(migratedButHidden.status).toBe(404);
    expect(absent.status).toBe(404);
    expect(withoutReferenceId(migratedButHidden.body)).toEqual(withoutReferenceId(absent.body));
  });

  it("the two-hop non-disclosure case: migrated-slug match whose target is NOW suspended → BYTE-IDENTICAL to absent not_found", async () => {
    const migratedButHidden = await handleResolveVendorSlug(SLUG_TARGET_SUSPENDED_OLD);
    const absent = await handleResolveVendorSlug(SLUG_ABSENT);

    expect(migratedButHidden.status).toBe(404);
    expect(absent.status).toBe(404);
    expect(withoutReferenceId(migratedButHidden.body)).toEqual(withoutReferenceId(absent.body));
  });

  it("not-found: an absent slug → 404 NOT_FOUND", async () => {
    const res = await handleResolveVendorSlug(SLUG_ABSENT);
    expect(res.status).toBe(404);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("NOT_FOUND");
    expect(res.body.error.error_code).toBe("marketplace_vendor_slug_not_found");
    expect(res.body.error.retryable).toBe(false);
  });

  it("not-found: an existing-but-banned vendor's OWN live slug → BYTE-IDENTICAL to absent (never 'current')", async () => {
    const bannedLive = await handleResolveVendorSlug(SLUG_BANNED_LIVE);
    const absent = await handleResolveVendorSlug(SLUG_ABSENT);

    expect(bannedLive.status).toBe(404);
    expect(withoutReferenceId(bannedLive.body)).toEqual(withoutReferenceId(absent.body));
  });

  it("invalid_input: a malformed slug (uppercase / too short) → 400 VALIDATION", async () => {
    const tooShort = await handleResolveVendorSlug("ab");
    expect(tooShort.status).toBe(400);
    if (!("error" in tooShort.body)) throw new Error("unreachable: expected an error envelope");
    expect(tooShort.body.error.error_class).toBe("VALIDATION");
    expect(tooShort.body.error.error_code).toBe("marketplace_vendor_slug_invalid_input");

    const uppercase = await handleResolveVendorSlug("Padma-Valve");
    expect(uppercase.status).toBe(400);
  });

  // ── Anonymous-role RLS positive/negative (Doc-8B §5 DB-role-switch backstop) ──────────────────────
  // The DB-level RLS policy itself, asserted through the NON-privileged restricted role (NOBYPASSRLS) —
  // independent of the app-layer predicate exercised above.

  it("RLS POSITIVE: restricted role with NO GUCs (anonymous) sees a live vendor_profiles row", async () => {
    const rows = await asRestrictedRole({}, (tx) =>
      tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM marketplace.vendor_profiles WHERE id = $1::uuid`,
        VP_LIVE,
      ),
    );
    expect(rows.map((r) => r.id)).toEqual([VP_LIVE]);
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

  it("RLS POSITIVE: vendor_slug_history is fully public-readable (6D-VSS-01.3) — anonymous role sees the history row", async () => {
    const rows = await asRestrictedRole({}, (tx) =>
      tx.$queryRawUnsafe<Array<{ old_slug: string }>>(
        `SELECT old_slug FROM marketplace.vendor_slug_history WHERE old_slug = $1`,
        SLUG_TARGET_OLD,
      ),
    );
    expect(rows.map((r) => r.old_slug)).toEqual([SLUG_TARGET_OLD]);
  });
});
