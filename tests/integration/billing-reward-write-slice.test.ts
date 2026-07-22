import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import {
  advanceReferral,
  creditReward,
  trackReferral,
  type AdvanceReferralInput,
  type CreditRewardInput,
} from "../../src/modules/billing/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-12 [Wave-3 M7] — BC-BILL-6 WRITES: credit_reward (§HB-6.1) + track_referral / advance_referral
// (§HB-6.2). Actor-branched (User wired leg + System in-process) — exercised directly with an injected `ctx`.
// DB under `prisma` (superuser, RLS bypassed); `asRestrictedRole` proves the write-fences. points = POINTS.

const DEPS = { appendAuditRecord };

async function seedRewardAccount(organizationId: string, balance: number): Promise<string> {
  const id = uuidv7();
  await prisma.rewardAccount.create({ data: { id, organizationId, balance } });
  return id;
}

async function seedReferral(
  referrerOrganizationId: string,
  state: "pending" | "qualified" | "rewarded",
  referredOrganizationId: string = uuidv7(),
): Promise<string> {
  const id = uuidv7();
  await prisma.referral.create({
    data: { id, referrerOrganizationId, referredOrganizationId, state },
  });
  return id;
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
});

describe("billing.credit_reward.v1 (command) — Doc-4I §HB-6.1", () => {
  it("VALIDATION on bad direction / reason / non-positive points", async () => {
    const org = uuidv7();
    const badDirection = {
      direction: "nope",
      points: 5,
      reason: "review",
    } as unknown as CreditRewardInput;
    const ctx = {
      actorType: "system" as const,
      userId: null,
      organizationId: org,
      canManageBilling: false,
    };
    expect((await creditReward(badDirection, ctx, DEPS)).ok).toBe(false);
    expect(
      (await creditReward({ direction: "credit", points: 0, reason: "review" }, ctx, DEPS)).ok,
    ).toBe(false);
  });

  it("AUTHORIZATION when the User redeem leg lacks can_manage_billing", async () => {
    const org = uuidv7();
    const out = await creditReward(
      { direction: "redeem", points: 5, reason: "redemption" },
      { actorType: "user", userId: uuidv7(), organizationId: org, canManageBilling: false },
      DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("AUTHORIZATION");
  });

  it("System credit creates the account on first movement + credits the balance (system audit)", async () => {
    const org = uuidv7();
    const out = await creditReward(
      { direction: "credit", points: 100, reason: "profile_completion" },
      { actorType: "system", userId: null, organizationId: org, canManageBilling: false },
      DEPS,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result).toEqual({
      transactionId: expect.any(String),
      organizationId: org,
      direction: "credit",
      points: 100,
      balance: 100,
    });
    const account = await prisma.rewardAccount.findFirst({
      where: { organizationId: org },
      select: { balance: true },
    });
    expect(account?.balance.toString()).toBe("100");
    const audit = await prisma.auditRecord.findFirst({
      where: { entityId: out.result.transactionId, action: "reward_movement" },
      select: { actorType: true, actorId: true },
    });
    expect(audit).toEqual({ actorType: "system", actorId: null });
  });

  it("User redeem decrements the balance (debit txn); BUSINESS when insufficient", async () => {
    const org = uuidv7();
    const user = uuidv7();
    await seedRewardAccount(org, 50);
    const ok = await creditReward(
      { direction: "redeem", points: 30, reason: "redemption" },
      { actorType: "user", userId: user, organizationId: org, canManageBilling: true },
      DEPS,
    );
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.result.balance).toBe(20);
    const txn = await prisma.rewardTransaction.findFirst({
      where: { account: { organizationId: org }, txnType: "debit" },
      select: { amount: true },
    });
    expect(txn?.amount.toString()).toBe("30");

    const insufficient = await creditReward(
      { direction: "redeem", points: 1000, reason: "redemption" },
      { actorType: "user", userId: user, organizationId: org, canManageBilling: true },
      DEPS,
    );
    expect(insufficient.ok).toBe(false);
    if (!insufficient.ok) expect(insufficient.error.errorClass).toBe("BUSINESS");
  });
});

describe("billing.track_referral.v1 (command) — Doc-4I §HB-6.2", () => {
  const trackCtx = (org: string, user: string, canManageBilling = true) => ({
    userId: user,
    organizationId: org,
    canManageBilling,
  });

  it("VALIDATION on a malformed referred_organization_id", async () => {
    const out = await trackReferral(
      { referredOrganizationId: "nope" },
      trackCtx(uuidv7(), uuidv7()),
      DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("VALIDATION");
  });

  it("AUTHORIZATION without can_manage_billing", async () => {
    const out = await trackReferral(
      { referredOrganizationId: uuidv7() },
      trackCtx(uuidv7(), uuidv7(), false),
      DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("AUTHORIZATION");
  });

  it("creates a referral at pending + a referral audit; duplicate pair → BUSINESS", async () => {
    const org = uuidv7();
    const user = uuidv7();
    const referred = uuidv7();
    const out = await trackReferral(
      { referredOrganizationId: referred },
      trackCtx(org, user),
      DEPS,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.state).toBe("pending");
    const row = await prisma.referral.findUnique({
      where: { id: out.result.referralId },
      select: { state: true, referrerOrganizationId: true },
    });
    expect(row).toEqual({ state: "pending", referrerOrganizationId: org });
    expect(
      await prisma.auditRecord.count({
        where: { entityId: out.result.referralId, action: "referral_tracked" },
      }),
    ).toBe(1);

    const dup = await trackReferral(
      { referredOrganizationId: referred },
      trackCtx(org, user),
      DEPS,
    );
    expect(dup.ok).toBe(false);
    if (!dup.ok) expect(dup.error.errorClass).toBe("BUSINESS");
  });
});

describe("billing.advance_referral.v1 (command) — Doc-4I §HB-6.2", () => {
  const userCtx = (org: string, user: string, canManageBilling = true) => ({
    actorType: "user" as const,
    userId: user,
    organizationId: org,
    canManageBilling,
  });
  const systemCtx = { actorType: "system" as const, userId: null, canManageBilling: false };

  it("VALIDATION on a bad target/expected state", async () => {
    const bad = {
      referralId: uuidv7(),
      targetState: "nope",
      expectedState: "pending",
    } as unknown as AdvanceReferralInput;
    expect((await advanceReferral(bad, userCtx(uuidv7(), uuidv7()), DEPS)).ok).toBe(false);
  });

  it("NOT_FOUND (User) when the referral is absent or cross-org", async () => {
    const absent = await advanceReferral(
      { referralId: uuidv7(), targetState: "qualified", expectedState: "pending" },
      userCtx(uuidv7(), uuidv7()),
      DEPS,
    );
    expect(absent.ok).toBe(false);
    if (!absent.ok) expect(absent.error.errorClass).toBe("NOT_FOUND");

    const ref = await seedReferral(uuidv7(), "pending");
    const crossOrg = await advanceReferral(
      { referralId: ref, targetState: "qualified", expectedState: "pending" },
      userCtx(uuidv7(), uuidv7()),
      DEPS,
    );
    expect(crossOrg.ok).toBe(false);
    if (!crossOrg.ok) expect(crossOrg.error.errorClass).toBe("NOT_FOUND");
  });

  it("advances pending → qualified → rewarded (User leg) + a status-change audit", async () => {
    const org = uuidv7();
    const ref = await seedReferral(org, "pending");
    const q = await advanceReferral(
      { referralId: ref, targetState: "qualified", expectedState: "pending" },
      userCtx(org, uuidv7()),
      DEPS,
    );
    expect(q.ok).toBe(true);
    if (q.ok) expect(q.result.state).toBe("qualified");

    const r = await advanceReferral(
      { referralId: ref, targetState: "rewarded", expectedState: "qualified" },
      userCtx(org, uuidv7()),
      DEPS,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result.state).toBe("rewarded");
    expect(
      await prisma.auditRecord.count({ where: { entityId: ref, action: "referral_advanced" } }),
    ).toBe(2);
  });

  it("STATE on a terminal (rewarded) referral or an illegal edge (pending→rewarded)", async () => {
    const org = uuidv7();
    const rewarded = await seedReferral(org, "rewarded");
    const terminal = await advanceReferral(
      { referralId: rewarded, targetState: "rewarded", expectedState: "qualified" },
      userCtx(org, uuidv7()),
      DEPS,
    );
    expect(terminal.ok).toBe(false);
    if (!terminal.ok) expect(terminal.error.errorClass).toBe("STATE");

    const pending = await seedReferral(org, "pending");
    const skip = await advanceReferral(
      { referralId: pending, targetState: "rewarded", expectedState: "pending" }, // not a legal edge
      userCtx(org, uuidv7()),
      DEPS,
    );
    expect(skip.ok).toBe(false);
    if (!skip.ok) expect(skip.error.errorClass).toBe("STATE");
  });

  it("CONFLICT when expected_state does not match (lost race)", async () => {
    const org = uuidv7();
    const ref = await seedReferral(org, "pending"); // actual = pending
    const out = await advanceReferral(
      { referralId: ref, targetState: "rewarded", expectedState: "qualified" }, // stale
      userCtx(org, uuidv7()),
      DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("CONFLICT");
  });

  it("System leg advances without a slug; REFERENCE on an absent referral", async () => {
    const org = uuidv7();
    const ref = await seedReferral(org, "pending");
    const ok = await advanceReferral(
      { referralId: ref, targetState: "qualified", expectedState: "pending" },
      systemCtx,
      DEPS,
    );
    expect(ok.ok).toBe(true);

    const absent = await advanceReferral(
      { referralId: uuidv7(), targetState: "qualified", expectedState: "pending" },
      systemCtx,
      DEPS,
    );
    expect(absent.ok).toBe(false);
    if (!absent.ok) expect(absent.error.errorClass).toBe("REFERENCE");
  });
});

describe("rewards/referrals RLS write-fence (Doc-8B §5)", () => {
  it("a non-staff role in org B cannot INSERT a referral for org A (WITH CHECK rejects)", async () => {
    const orgA = uuidv7();
    await expect(
      asRestrictedRole({ activeOrg: uuidv7() }, async (tx) => {
        await tx.$executeRawUnsafe(
          `INSERT INTO billing.referrals (id, referrer_organization_id, state)
           VALUES ($1::uuid, $2::uuid, 'pending')`,
          uuidv7(),
          orgA,
        );
      }),
    ).rejects.toThrow();
  });
});
