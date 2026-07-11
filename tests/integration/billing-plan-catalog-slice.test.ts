import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { handleGetPlan, handleListPlans } from "../../src/server/billing";
import type { AuthSession } from "../../src/server/auth/provisioning";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-1 [Wave-3 M7 pilot slice] — the wired `billing.get_plan.v1` / `billing.list_plans.v1`
// vertical-slice integration test (Doc-4I §HB-1.4 / Doc-5I §4 / Doc-6I §3.1). Authenticated
// Platform-Public catalog reads — session→401 gate, no org/tenant context; exercised through the wired
// composition (`handleGetPlan`/`handleListPlans`, `src/server/billing`) against a real Postgres.
//
// RLS NOTE: same posture as the M2 slices — the local/CI connection is `postgres` (rolbypassrls=true),
// so the wired-composition assertions exercise the APP-LAYER non-retired scope (`deleted_at IS NULL` in
// the repo WHERE); the dedicated `asRestrictedRole` cases separately prove the DB-level RLS backstop
// (`plans_public_read` hides retired from non-staff; `plans_admin` shows all to staff — the
// ESC-BILL-RETIRE-VIS boundary).

// Fixed UUIDv7-format ids (never minted at runtime — the seed-PK convention).
const PLAN_BASIC = "01930000-0000-7000-8000-00000000b001"; // "Basic"       active  (is_active=true)
const PLAN_DRAFT = "01930000-0000-7000-8000-00000000b002"; // "Draft Plan"  draft   (is_active=false)
const PLAN_PRO = "01930000-0000-7000-8000-00000000b003"; //   "Pro"         active  + entitlement bundle
const PLAN_RETIRED = "01930000-0000-7000-8000-00000000b004"; // "Retired Plan" retired (soft-deleted)

const ENT_RFQ = "01930000-0000-7000-8000-00000000e001"; // numeric
const ENT_SEATS = "01930000-0000-7000-8000-00000000e002"; // numeric
const ENT_API = "01930000-0000-7000-8000-00000000e003"; // boolean
const ENT_TIER = "01930000-0000-7000-8000-00000000e004"; // enum (client value `enum_`) — maps to wire `enum`

const ABSENT_ID = "01930000-0000-7000-8000-0000000009ff"; // never seeded

const ALL_PLAN_IDS = [PLAN_BASIC, PLAN_DRAFT, PLAN_PRO, PLAN_RETIRED];
const ALL_ENT_IDS = [ENT_RFQ, ENT_SEATS, ENT_API, ENT_TIER];

const SESSION: AuthSession = {
  authUserId: "01930000-0000-7000-8000-0000000000a1",
  email: "buyer@example.test",
};
const authed = async (): Promise<AuthSession | null> => SESSION; // an authenticated caller
const anon = async (): Promise<AuthSession | null> => null; // unauthenticated → 401

/** Narrow a success body to its `result` (throws with the real body if it is an error/401 — clearer failures). */
function resultOf<T>(body: unknown): T {
  if (typeof body === "object" && body !== null && "result" in body) {
    return (body as { result: T }).result;
  }
  throw new Error(`expected a success envelope, got: ${JSON.stringify(body)}`);
}

function errorOf(body: unknown): { error_class: string; error_code: string } {
  if (typeof body === "object" && body !== null && "error" in body) {
    return (body as { error: { error_class: string; error_code: string } }).error;
  }
  throw new Error(`expected an error envelope, got: ${JSON.stringify(body)}`);
}

async function seedFixture(): Promise<void> {
  await prisma.entitlement.createMany({
    data: [
      { id: ENT_RFQ, slug: "w3bill_rfq_quota", type: "numeric", defaultValue: 10 },
      { id: ENT_SEATS, slug: "w3bill_seats", type: "numeric", defaultValue: 3 },
      { id: ENT_API, slug: "w3bill_api_access", type: "boolean", defaultValue: false },
      { id: ENT_TIER, slug: "w3bill_support_tier", type: "enum_", defaultValue: "standard" },
    ],
  });

  await prisma.plan.createMany({
    data: [
      {
        id: PLAN_BASIC,
        name: "W3BILL Basic",
        billingCycle: "monthly",
        price: "0",
        currency: "BDT",
        isActive: true,
      },
      {
        id: PLAN_DRAFT,
        name: "W3BILL Draft Plan",
        billingCycle: "annual",
        price: "9999",
        currency: "BDT",
        isActive: false,
      },
      {
        id: PLAN_PRO,
        name: "W3BILL Pro",
        billingCycle: "monthly",
        price: "5000",
        currency: "BDT",
        isActive: true,
      },
      // Retired = soft-deleted (Doc-2 §10.8 "SD = retire"); is_active is irrelevant to the derived status.
      {
        id: PLAN_RETIRED,
        name: "W3BILL Retired Plan",
        billingCycle: "monthly",
        price: "1",
        currency: "BDT",
        isActive: true,
        deletedAt: new Date(),
      },
    ],
  });

  // Bundle PLAN_PRO with all four entitlements (per-plan value_jsonb).
  await prisma.planEntitlement.createMany({
    data: [
      { planId: PLAN_PRO, entitlementId: ENT_RFQ, valueJsonb: 100 },
      { planId: PLAN_PRO, entitlementId: ENT_SEATS, valueJsonb: 10 },
      { planId: PLAN_PRO, entitlementId: ENT_API, valueJsonb: true },
      { planId: PLAN_PRO, entitlementId: ENT_TIER, valueJsonb: "priority" },
    ],
  });
}

async function cleanupFixture(): Promise<void> {
  await prisma.planEntitlement.deleteMany({ where: { planId: { in: ALL_PLAN_IDS } } });
  await prisma.plan.deleteMany({ where: { id: { in: ALL_PLAN_IDS } } });
  await prisma.entitlement.deleteMany({ where: { id: { in: ALL_ENT_IDS } } });
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
  await cleanupFixture(); // idempotent re-run guard
  await seedFixture();
});

afterAll(async () => {
  await cleanupFixture();
});

describe("billing.get_plan.v1 (wired) — Doc-4I §HB-1.4 / Doc-5I §4", () => {
  it("401 when unauthenticated (Doc-5I §3.6 — authentication only)", async () => {
    const { status, body } = await handleGetPlan({ planId: PLAN_PRO }, { resolveSession: anon });
    expect(status).toBe(401);
    // Auth-boundary body carries only reference_id (no error_class) — DC-4.
    expect(body).toHaveProperty("reference_id");
    expect(body).not.toHaveProperty("error");
    expect(body).not.toHaveProperty("result");
  });

  it("200 + full projection (status derived, entitlements incl. enum→enum, price string) for an active plan", async () => {
    const { status, body } = await handleGetPlan({ planId: PLAN_PRO }, { resolveSession: authed });
    expect(status).toBe(200);
    const plan = resultOf<{
      planId: string;
      name: string;
      billingCycle: string;
      price: unknown;
      currency: string;
      status: string;
      isActive: boolean;
      entitlements: Array<{ entitlementId: string; slug: string; type: string; value: unknown }>;
    }>(body);

    expect(plan.planId).toBe(PLAN_PRO);
    expect(plan.name).toBe("W3BILL Pro");
    expect(plan.billingCycle).toBe("monthly");
    expect(plan.status).toBe("active"); // derived: is_active=true, deleted_at null
    expect(plan.isActive).toBe(true);
    expect(plan.currency).toBe("BDT");
    // price is the money-safe decimal STRING realization of Doc-2 §10.8 `numeric`.
    expect(typeof plan.price).toBe("string");
    expect(Number(plan.price)).toBe(5000);

    // Entitlements ordered by entitlement_id (deterministic); the `enum` type maps back from `enum_`.
    const tier = plan.entitlements.find((e) => e.entitlementId === ENT_TIER);
    expect(tier).toBeDefined();
    expect(tier?.type).toBe("enum"); // NOT the Prisma-client `enum_`
    expect(tier?.slug).toBe("w3bill_support_tier");
    expect(tier?.value).toBe("priority");

    const api = plan.entitlements.find((e) => e.entitlementId === ENT_API);
    expect(api?.type).toBe("boolean");
    expect(api?.value).toBe(true);

    const rfq = plan.entitlements.find((e) => e.entitlementId === ENT_RFQ);
    expect(rfq?.type).toBe("numeric");
    expect(rfq?.value).toBe(100);

    expect(plan.entitlements).toHaveLength(4);
  });

  it("200 + status 'draft' for a non-active, non-deleted plan", async () => {
    const { status, body } = await handleGetPlan(
      { planId: PLAN_DRAFT },
      { resolveSession: authed },
    );
    expect(status).toBe(200);
    const plan = resultOf<{ status: string; isActive: boolean; entitlements: unknown[] }>(body);
    expect(plan.status).toBe("draft");
    expect(plan.isActive).toBe(false);
    expect(plan.entitlements).toEqual([]); // no bundle
  });

  it("404 for a RETIRED (soft-deleted) plan — non-retired scope (ESC-BILL-RETIRE-VIS interim)", async () => {
    const { status, body } = await handleGetPlan(
      { planId: PLAN_RETIRED },
      { resolveSession: authed },
    );
    expect(status).toBe(404);
    expect(errorOf(body).error_code).toBe("billing_plan_not_found");
  });

  it("404 for an absent plan (platform-owned catalog — non-disclosure N/A)", async () => {
    const { status, body } = await handleGetPlan({ planId: ABSENT_ID }, { resolveSession: authed });
    expect(status).toBe(404);
    expect(errorOf(body).error_class).toBe("NOT_FOUND");
  });

  it("400 for a malformed plan_id (SYNTAX)", async () => {
    const { status, body } = await handleGetPlan(
      { planId: "not-a-uuid" },
      { resolveSession: authed },
    );
    expect(status).toBe(400);
    expect(errorOf(body).error_code).toBe("billing_plan_invalid_input");
  });
});

describe("billing.list_plans.v1 (wired) — Doc-4I §HB-1.4 / Doc-5I §4", () => {
  it("401 when unauthenticated", async () => {
    const { status } = await handleListPlans({ filters: {} }, { resolveSession: anon });
    expect(status).toBe(401);
  });

  it("200 lists the non-retired catalog, name asc, list items carry no entitlements", async () => {
    const { status, body } = await handleListPlans({ filters: {} }, { resolveSession: authed });
    expect(status).toBe(200);
    const result = resultOf<{
      items: Array<{ planId: string; name: string; status: string }>;
      pageInfo: { hasMore: boolean };
    }>(body);

    const seededOrder = result.items
      .filter((i) => ALL_PLAN_IDS.includes(i.planId))
      .map((i) => i.planId);
    // Retired excluded; the three visible plans sorted by name (Basic < Draft Plan < Pro).
    expect(seededOrder).toEqual([PLAN_BASIC, PLAN_DRAFT, PLAN_PRO]);
    expect(seededOrder).not.toContain(PLAN_RETIRED);
    for (const item of result.items) {
      expect(item).not.toHaveProperty("entitlements");
    }
  });

  it("filter billing_cycle=annual returns only the annual (draft) plan among the seed", async () => {
    const { status, body } = await handleListPlans(
      { filters: { billing_cycle: "annual" } },
      { resolveSession: authed },
    );
    expect(status).toBe(200);
    const result = resultOf<{ items: Array<{ planId: string }> }>(body);
    const seeded = result.items.filter((i) => ALL_PLAN_IDS.includes(i.planId)).map((i) => i.planId);
    expect(seeded).toEqual([PLAN_DRAFT]);
  });

  it("filter is_active=false returns only the draft plan among the seed", async () => {
    const { status, body } = await handleListPlans(
      { filters: { is_active: "false" } },
      { resolveSession: authed },
    );
    expect(status).toBe(200);
    const result = resultOf<{ items: Array<{ planId: string }> }>(body);
    const seeded = result.items.filter((i) => ALL_PLAN_IDS.includes(i.planId)).map((i) => i.planId);
    expect(seeded).toEqual([PLAN_DRAFT]);
  });

  it("filter status=active returns the active plans among the seed (Basic, Pro)", async () => {
    const { status, body } = await handleListPlans(
      { filters: { status: "active" } },
      { resolveSession: authed },
    );
    expect(status).toBe(200);
    const result = resultOf<{ items: Array<{ planId: string }> }>(body);
    const seeded = result.items.filter((i) => ALL_PLAN_IDS.includes(i.planId)).map((i) => i.planId);
    expect(seeded).toEqual([PLAN_BASIC, PLAN_PRO]);
  });

  it("filter status=retired returns an empty page (non-retired scope — ESC-BILL-RETIRE-VIS)", async () => {
    const { status, body } = await handleListPlans(
      { filters: { status: "retired" } },
      { resolveSession: authed },
    );
    expect(status).toBe(200);
    const result = resultOf<{ items: unknown[]; pageInfo: { hasMore: boolean } }>(body);
    expect(result.items).toEqual([]);
    expect(result.pageInfo.hasMore).toBe(false);
  });

  it("400 for an undeclared filter field (SYNTAX allowlist)", async () => {
    const { status, body } = await handleListPlans(
      { filters: { nonsense: "x" } },
      { resolveSession: authed },
    );
    expect(status).toBe(400);
    expect(errorOf(body).error_code).toBe("billing_plan_invalid_input");
  });

  it("400 for a malformed cursor and an out-of-bound page_size", async () => {
    const bad = await handleListPlans(
      { filters: {}, cursor: "!!!not-base64!!!" },
      { resolveSession: authed },
    );
    expect(bad.status).toBe(400);
    const over = await handleListPlans(
      { filters: {}, pageSize: "100000" },
      { resolveSession: authed },
    );
    expect(over.status).toBe(400);
  });

  it("paginates by keyset (page_size=2) — no overlap, has_more then final", async () => {
    const page1 = await handleListPlans({ filters: {}, pageSize: "2" }, { resolveSession: authed });
    expect(page1.status).toBe(200);
    const r1 = resultOf<{
      items: Array<{ planId: string; name: string }>;
      pageInfo: { hasMore: boolean; nextCursor?: string };
    }>(page1.body);
    // NOTE: other suites may seed plans on the shared DB; assert cursor mechanics rather than exact global counts.
    expect(r1.items.length).toBe(2);
    expect(r1.pageInfo.hasMore).toBe(true);
    expect(typeof r1.pageInfo.nextCursor).toBe("string");

    const page2 = await handleListPlans(
      { filters: {}, pageSize: "2", cursor: r1.pageInfo.nextCursor },
      { resolveSession: authed },
    );
    expect(page2.status).toBe(200);
    const r2 = resultOf<{ items: Array<{ planId: string }> }>(page2.body);
    // Keyset continuation: page 2 strictly follows page 1 — no id overlap.
    const p1ids = new Set(r1.items.map((i) => i.planId));
    for (const item of r2.items) {
      expect(p1ids.has(item.planId)).toBe(false);
    }
  });
});

describe("plan-catalog RLS backstop (DB-role-switch, Doc-8B §5) — Doc-6I §3.x", () => {
  it("a non-staff role sees NON-retired plans only (plans_public_read = deleted_at IS NULL)", async () => {
    const visibleSeeded = await asRestrictedRole({}, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM billing.plans WHERE id = ANY($1::uuid[])`,
        ALL_PLAN_IDS,
      );
      return rows.map((r) => r.id);
    });
    expect(visibleSeeded).toContain(PLAN_BASIC);
    expect(visibleSeeded).toContain(PLAN_DRAFT);
    expect(visibleSeeded).toContain(PLAN_PRO);
    expect(visibleSeeded).not.toContain(PLAN_RETIRED); // retired = soft-deleted → hidden from non-staff
  });

  it("the entitlement catalog is fully public-readable to a non-staff role", async () => {
    const seenEnts = await asRestrictedRole({}, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM billing.entitlements WHERE id = ANY($1::uuid[])`,
        ALL_ENT_IDS,
      );
      return rows.length;
    });
    expect(seenEnts).toBe(ALL_ENT_IDS.length);
  });

  it("a platform-staff role DOES see the retired plan (plans_admin FOR ALL) — the ESC-BILL-RETIRE-VIS boundary", async () => {
    const staffSees = await asRestrictedRole({ isPlatformStaff: true }, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM billing.plans WHERE id = $1::uuid`,
        PLAN_RETIRED,
      );
      return rows.length;
    });
    expect(staffSees).toBe(1);
  });
});
