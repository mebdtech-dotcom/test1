import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { enforceQuota, getUsage } from "../../src/modules/billing/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-6 [Wave-3 M7] — BC-BILL-3 read/enforcement authorities: `enforce_quota` (Doc-4I §HB-3.2,
// out-of-wire) + `get_usage` (§HB-3.3, wired). The sole WRITER `record_usage` is DEFERRED on
// [ESC-BILL-USAGE-ENTID] — so these tests SEED `usage_ledger` rows directly (superuser, RLS bypassed),
// always with a valid `entitlement_id` FK. `enforce_quota` binds the quota_key to a NUMERIC entitlement via
// BC-BILL-2 `resolve_entitlements` (needs an active subscription on a plan that bundles the entitlement).
// The `asRestrictedRole` cases prove `usage_ledger_tenant` scoping (read) + WITH CHECK (cross-org write).

// The current metering period as YYYY-MM (UTC) — identical to the module's `currentPeriod()` (which tests
// may not import — it is module-internal). `toISOString()` is always UTC, so `slice(0,7)` = `YYYY-MM`.
const CURRENT_PERIOD = new Date().toISOString().slice(0, 7);
const PAST_PERIOD = "2020-01";
const FUTURE_PERIOD = "2099-01";

async function seedPlan(): Promise<string> {
  const id = uuidv7();
  await prisma.plan.create({
    data: {
      id,
      name: `zzz_bill_${id.slice(0, 8)}`,
      billingCycle: "monthly",
      price: "1000",
      currency: "BDT",
      isActive: true,
    },
  });
  return id;
}

async function seedEntitlement(
  slug: string,
  type: "boolean" | "numeric" | "enum_",
): Promise<string> {
  const id = uuidv7();
  await prisma.entitlement.create({ data: { id, slug, type } });
  return id;
}

/** Seed an org whose ACTIVE subscription bundles a numeric entitlement `slug`=limit (for enforce_quota).
 *  Returns { org, entitlementId, slug }. */
async function seedOrgWithQuota(
  limit: number,
): Promise<{ org: string; entitlementId: string; slug: string }> {
  const org = uuidv7();
  const plan = await seedPlan();
  // Full uuid — uuidv7's leading chars are the ms-timestamp prefix, so `.slice(0,8)` collides on the
  // entitlements `slug UNIQUE` for rows seeded in the same millisecond.
  const slug = `quota_${uuidv7()}`;
  const entitlementId = await seedEntitlement(slug, "numeric");
  await prisma.planEntitlement.create({
    data: { planId: plan, entitlementId, valueJsonb: limit },
  });
  await prisma.subscription.create({
    data: { id: uuidv7(), organizationId: org, planId: plan, state: "active" },
  });
  return { org, entitlementId, slug };
}

async function seedUsage(
  organizationId: string,
  entitlementId: string,
  quotaKey: string,
  amount: number,
  period: string,
  source: "rfq_response" | "lead_access" | "ad_launch" = "rfq_response",
): Promise<string> {
  const id = uuidv7();
  await prisma.usageLedger.create({
    data: { id, entitlementId, organizationId, quotaKey, amount, period, source },
  });
  return id;
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
});

describe("billing.enforce_quota.v1 (out-of-wire authority) — Doc-4I §HB-3.2", () => {
  it("VALIDATION on a malformed organization_id", async () => {
    const out = await enforceQuota({ organizationId: "nope", quotaKey: "k" });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("VALIDATION on an empty quota_key", async () => {
    const out = await enforceQuota({ organizationId: uuidv7(), quotaKey: "" });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("allows a request within the entitlement-bounded quota", async () => {
    const { org, entitlementId, slug } = await seedOrgWithQuota(50);
    await seedUsage(org, entitlementId, slug, 10, CURRENT_PERIOD);
    const out = await enforceQuota({ organizationId: org, quotaKey: slug, requestedAmount: 5 });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result).toEqual({
      allowed: true,
      quotaKey: slug,
      limit: 50,
      used: 10,
      remaining: 40,
    });
  });

  it("denies a request that exceeds the remaining quota (allowed=false, no error)", async () => {
    const { org, entitlementId, slug } = await seedOrgWithQuota(50);
    await seedUsage(org, entitlementId, slug, 10, CURRENT_PERIOD);
    const out = await enforceQuota({ organizationId: org, quotaKey: slug, requestedAmount: 45 });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.allowed).toBe(false); // 45 > (50 − 10)
    expect(out.result.remaining).toBe(40);
  });

  it("defaults requested_amount to 1 and denies when the quota is exhausted", async () => {
    const { org, entitlementId, slug } = await seedOrgWithQuota(10);
    await seedUsage(org, entitlementId, slug, 10, CURRENT_PERIOD); // fully used
    const out = await enforceQuota({ organizationId: org, quotaKey: slug });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.allowed).toBe(false); // 1 > (10 − 10)
    expect(out.result.remaining).toBe(0);
  });

  it("limit 0 (no matching numeric entitlement / no active subscription) → denied", async () => {
    // Org with no active subscription → resolve_entitlements = Basic (empty) → limit 0.
    const out = await enforceQuota({
      organizationId: uuidv7(),
      quotaKey: "anything",
      requestedAmount: 1,
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result).toEqual({
      allowed: false,
      quotaKey: "anything",
      limit: 0,
      used: 0,
      remaining: 0,
    });
  });

  it("only the CURRENT period counts toward `used` (past-period usage is excluded)", async () => {
    const { org, entitlementId, slug } = await seedOrgWithQuota(50);
    await seedUsage(org, entitlementId, slug, 30, PAST_PERIOD); // last period — must NOT count
    await seedUsage(org, entitlementId, slug, 5, CURRENT_PERIOD);
    const out = await enforceQuota({ organizationId: org, quotaKey: slug, requestedAmount: 1 });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.used).toBe(5); // only the current period
    expect(out.result.remaining).toBe(45);
  });
});

describe("billing.get_usage.v1 (query) — Doc-4I §HB-3.3 / Doc-5I §6.2", () => {
  it("VALIDATION on an undeclared filter field", async () => {
    const out = await getUsage({ filters: { unknown_field: "x" } }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("VALIDATION on a malformed period", async () => {
    const out = await getUsage({ filters: { period: "2026/07" } }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("BUSINESS on a future period", async () => {
    const out = await getUsage({ filters: { period: FUTURE_PERIOD } }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("BUSINESS");
  });

  it("returns items + a totals facet for the current period, filtered by quota_key", async () => {
    const { org, entitlementId, slug } = await seedOrgWithQuota(100);
    await seedUsage(org, entitlementId, slug, 3, CURRENT_PERIOD, "rfq_response");
    await seedUsage(org, entitlementId, slug, 7, CURRENT_PERIOD, "lead_access");

    const out = await getUsage({ filters: { quota_key: slug } }, org);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.items).toHaveLength(2);
    expect(out.result.items.every((i) => i.quotaKey === slug)).toBe(true);
    expect(out.result.items.every((i) => i.period === CURRENT_PERIOD)).toBe(true);
    expect(out.result.totals).toEqual({ quotaKey: slug, used: 10 });
    expect(out.result.pageInfo.hasMore).toBe(false);
  });

  it("a past period with no rows → 200 with empty items and zero totals", async () => {
    const { org, entitlementId, slug } = await seedOrgWithQuota(100);
    await seedUsage(org, entitlementId, slug, 5, CURRENT_PERIOD); // current only
    const out = await getUsage({ filters: { quota_key: slug, period: PAST_PERIOD } }, org);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.items).toEqual([]);
    expect(out.result.totals).toEqual({ quotaKey: slug, used: 0 });
  });

  it("paginates by keyset (totals sum the FULL filtered set, not just the page)", async () => {
    const { org, entitlementId, slug } = await seedOrgWithQuota(100);
    await seedUsage(org, entitlementId, slug, 1, CURRENT_PERIOD);
    await seedUsage(org, entitlementId, slug, 2, CURRENT_PERIOD);
    await seedUsage(org, entitlementId, slug, 4, CURRENT_PERIOD);

    const p1 = await getUsage({ filters: { quota_key: slug }, pageSize: 2 }, org);
    expect(p1.ok).toBe(true);
    if (!p1.ok) return;
    expect(p1.result.items).toHaveLength(2);
    expect(p1.result.totals.used).toBe(7); // full set, not just this page
    expect(p1.result.pageInfo.hasMore).toBe(true);
    expect(p1.result.pageInfo.nextCursor).toBeDefined();

    const p2 = await getUsage(
      { filters: { quota_key: slug }, pageSize: 2, cursor: p1.result.pageInfo.nextCursor },
      org,
    );
    expect(p2.ok).toBe(true);
    if (!p2.ok) return;
    expect(p2.result.items).toHaveLength(1);
    expect(p2.result.pageInfo.hasMore).toBe(false);
  });
});

describe("usage_ledger_tenant RLS (Doc-8B §5) — org isolation for reads and cross-org writes", () => {
  it("SELECT scopes a non-staff role to its OWN org", async () => {
    const orgA = uuidv7();
    const orgB = uuidv7();
    const entA = await seedEntitlement(`ent_${uuidv7()}`, "numeric");
    await seedUsage(orgA, entA, "k", 1, CURRENT_PERIOD);
    await seedUsage(orgB, entA, "k", 1, CURRENT_PERIOD);

    const visibleForA = await asRestrictedRole({ activeOrg: orgA }, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ organization_id: string }>>(
        "SELECT organization_id FROM billing.usage_ledger WHERE organization_id = ANY($1::uuid[])",
        [orgA, orgB],
      );
      return rows.map((r) => r.organization_id);
    });
    expect(visibleForA).toContain(orgA);
    expect(visibleForA).not.toContain(orgB);
  });

  it("WITH CHECK rejects a cross-org INSERT (org B context inserting an org A row)", async () => {
    const orgA = uuidv7();
    const ent = await seedEntitlement(`ent_${uuidv7()}`, "numeric");
    // Acting as org B, attempt to insert a usage row attributed to org A → RLS WITH CHECK rejects (throws).
    await expect(
      asRestrictedRole({ activeOrg: uuidv7() }, async (tx) => {
        await tx.$executeRawUnsafe(
          `INSERT INTO billing.usage_ledger (id, entitlement_id, organization_id, quota_key, amount, source)
           VALUES ($1::uuid, $2::uuid, $3::uuid, 'k', 1, 'rfq_response')`,
          uuidv7(),
          ent,
          orgA,
        );
      }),
    ).rejects.toThrow();
  });
});
