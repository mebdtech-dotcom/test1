import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { getRewardBalance, listReferrals } from "../../src/modules/billing/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-11 [Wave-3 M7] — BC-BILL-6 reward/referral READS: `get_reward_balance` (Doc-4I §HB-6.3) +
// `list_referrals` (§HB-6.3). The credit_reward / track/advance_referral WRITES land next slice, so these
// tests SEED `reward_accounts` + `referrals` directly (superuser, RLS bypassed). The org-scoped queries take
// the server-resolved active org. `asRestrictedRole` proves `reward_accounts_tenant` / `referrals_tenant`
// scoping. `balance` = reward POINTS (number). Referrals anchor on the REFERRER org.

async function seedRewardAccount(organizationId: string, balance: number): Promise<string> {
  const id = uuidv7();
  await prisma.rewardAccount.create({ data: { id, organizationId, balance } });
  return id;
}

async function seedReferral(
  referrerOrganizationId: string,
  state: "pending" | "qualified" | "rewarded",
  createdAt: Date,
  referredOrganizationId: string | null = uuidv7(),
): Promise<string> {
  const id = uuidv7();
  await prisma.referral.create({
    data: {
      id,
      referrerOrganizationId,
      state,
      createdAt,
      ...(referredOrganizationId !== null ? { referredOrganizationId } : {}),
    },
  });
  return id;
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
});

describe("billing.get_reward_balance.v1 (query) — Doc-4I §HB-6.3", () => {
  it("balance 0 when the org has no reward account (org-self, no NOT_FOUND)", async () => {
    const org = uuidv7();
    expect(await getRewardBalance(org)).toEqual({ organizationId: org, balance: 0 });
  });

  it("returns the account balance head (points) for the org", async () => {
    const org = uuidv7();
    await seedRewardAccount(org, 1500);
    expect(await getRewardBalance(org)).toEqual({ organizationId: org, balance: 1500 });
  });
});

describe("billing.list_referrals.v1 (query) — Doc-4I §HB-6.3", () => {
  it("VALIDATION on an out-of-bound page_size / a bad cursor", async () => {
    expect((await listReferrals({ pageSize: 101 }, uuidv7())).ok).toBe(false);
    expect((await listReferrals({ cursor: "!!!bad!!!" }, uuidv7())).ok).toBe(false);
  });

  it("empty items for an org with no referrals", async () => {
    const out = await listReferrals({}, uuidv7());
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.items).toEqual([]);
    expect(out.result.pageInfo.hasMore).toBe(false);
  });

  it("returns the referrer's referrals newest-first with the frozen item shape", async () => {
    const org = uuidv7();
    const referred = uuidv7();
    await seedReferral(org, "pending", new Date("2026-01-01T00:00:00.000Z"), referred);
    const newer = await seedReferral(org, "qualified", new Date("2026-02-01T00:00:00.000Z"), null);

    const out = await listReferrals({}, org);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.items).toHaveLength(2);
    expect(out.result.items[0]).toEqual({
      referralId: newer,
      referredOrganizationId: null, // nullable — an unresolved referred org
      state: "qualified",
    });
    expect(out.result.items[1].referredOrganizationId).toBe(referred);
    expect(out.result.items[1].state).toBe("pending");
  });

  it("paginates by keyset", async () => {
    const org = uuidv7();
    await seedReferral(org, "pending", new Date("2026-01-01T00:00:00.000Z"));
    await seedReferral(org, "pending", new Date("2026-02-01T00:00:00.000Z"));
    await seedReferral(org, "pending", new Date("2026-03-01T00:00:00.000Z"));

    const p1 = await listReferrals({ pageSize: 2 }, org);
    expect(p1.ok).toBe(true);
    if (!p1.ok) return;
    expect(p1.result.items).toHaveLength(2);
    expect(p1.result.pageInfo.hasMore).toBe(true);

    const p2 = await listReferrals({ pageSize: 2, cursor: p1.result.pageInfo.nextCursor }, org);
    expect(p2.ok).toBe(true);
    if (!p2.ok) return;
    expect(p2.result.items).toHaveLength(1);
    expect(p2.result.pageInfo.hasMore).toBe(false);
  });
});

describe("rewards/referrals RLS (Doc-8B §5) — org isolation", () => {
  it("reward_accounts_tenant scopes a non-staff role to its OWN org", async () => {
    const orgA = uuidv7();
    const orgB = uuidv7();
    await seedRewardAccount(orgA, 5);
    await seedRewardAccount(orgB, 9);
    const visibleForA = await asRestrictedRole({ activeOrg: orgA }, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ organization_id: string }>>(
        "SELECT organization_id FROM billing.reward_accounts WHERE organization_id = ANY($1::uuid[])",
        [orgA, orgB],
      );
      return rows.map((r) => r.organization_id);
    });
    expect(visibleForA).toContain(orgA);
    expect(visibleForA).not.toContain(orgB);
  });

  it("referrals_tenant scopes a non-staff role to its OWN referrer org", async () => {
    const orgA = uuidv7();
    const orgB = uuidv7();
    const refA = await seedReferral(orgA, "pending", new Date("2026-01-01T00:00:00.000Z"));
    const refB = await seedReferral(orgB, "pending", new Date("2026-01-01T00:00:00.000Z"));
    const visibleForA = await asRestrictedRole({ activeOrg: orgA }, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        "SELECT id FROM billing.referrals WHERE id = ANY($1::uuid[])",
        [refA, refB],
      );
      return rows.map((r) => r.id);
    });
    expect(visibleForA).toContain(refA);
    expect(visibleForA).not.toContain(refB);
  });
});
