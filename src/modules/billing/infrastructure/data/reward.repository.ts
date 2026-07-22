// M7 infrastructure (PRIVATE) — thin Prisma repository over `billing.reward_accounts` + `billing.referrals`
// for BC-BILL-6 `get_reward_balance` / `list_referrals` (Doc-4I §HB-6.3 / Doc-6I §3.6). M7 reading its OWN
// schema. Calls run under the caller's `withActiveOrg` tenant transaction — `reward_accounts_tenant` /
// `referrals_tenant` RLS scope them to `app.active_org`. READ-ONLY: the writes (credit_reward /
// track_referral / advance_referral) land in the next slice.
//
// `balance` is Doc-6I §3.6 `numeric` = reward POINTS (units, NOT money — BL-CR10) → handled as a JS number.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";

/** Coerce a Prisma `Decimal` (points — not money) to a JS number; `null` → 0. */
function toNum(value: { toString(): string } | null): number {
  return value === null ? 0 : Number(value.toString());
}

/** One `referrals` row projected for `list_referrals` items. `createdAt` is carried for the keyset cursor. */
export interface ReferralReadModel {
  id: string;
  referredOrganizationId: string | null;
  state: "pending" | "qualified" | "rewarded";
  createdAt: Date;
}

/** The org's current reward-points balance (the live account head). `0` when the org has no account yet
 *  (an org always has a — possibly zero — balance; Doc-4I §HB-6.3 is org-self, no NOT_FOUND). */
export async function loadRewardBalance(
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<number> {
  const row = await db.rewardAccount.findFirst({
    where: { organizationId, deletedAt: null },
    select: { balance: true },
  });
  return row === null ? 0 : toNum(row.balance);
}

/** One keyset-paginated page of the referrer org's referrals (DESC by `created_at`, `id` tiebreak — newest
 *  first), up to `limit` rows. Scoped to the referrer org (referrals anchor). `after` = decoded cursor pos. */
export async function findReferralsPage(
  organizationId: string,
  after: { createdAt: Date; id: string } | null,
  limit: number,
  db: DbExecutor = prisma,
): Promise<ReferralReadModel[]> {
  const rows = await db.referral.findMany({
    where: {
      referrerOrganizationId: organizationId,
      ...(after !== null
        ? {
            OR: [
              { createdAt: { lt: after.createdAt } },
              { AND: [{ createdAt: after.createdAt }, { id: { lt: after.id } }] },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    select: { id: true, referredOrganizationId: true, state: true, createdAt: true },
  });
  return rows.map((r) => ({
    id: r.id,
    referredOrganizationId: r.referredOrganizationId,
    state: r.state,
    createdAt: r.createdAt,
  }));
}

// ── W3-BILL-12 — BC-BILL-6 WRITES: credit_reward (§HB-6.1) + track_referral/advance_referral (§HB-6.2). ──

/** The org's live reward account head (`{ id, balance }`), or `null` when none exists yet. */
export async function findLiveRewardAccount(
  organizationId: string,
  db: DbExecutor,
): Promise<{ id: string; balance: number } | null> {
  const row = await db.rewardAccount.findFirst({
    where: { organizationId, deletedAt: null },
    select: { id: true, balance: true },
  });
  return row === null ? null : { id: row.id, balance: toNum(row.balance) };
}

/** Create the org's reward account head at balance 0 (created on first movement — Doc-4I §HB-6.1). */
export async function createRewardAccount(
  organizationId: string,
  actorUserId: string | null,
  db: DbExecutor,
): Promise<string> {
  const id = uuidv7();
  await db.rewardAccount.create({
    data: {
      id,
      organizationId,
      balance: 0,
      ...(actorUserId !== null ? { createdBy: actorUserId, updatedBy: actorUserId } : {}),
    },
  });
  return id;
}

/** CREDIT the balance head (atomic increment); returns the new balance. */
export async function creditRewardBalance(
  accountId: string,
  points: number,
  actorUserId: string | null,
  db: DbExecutor,
): Promise<number> {
  const row = await db.rewardAccount.update({
    where: { id: accountId },
    data: {
      balance: { increment: points },
      ...(actorUserId !== null ? { updatedBy: actorUserId } : {}),
    },
    select: { balance: true },
  });
  return toNum(row.balance);
}

/** REDEEM points from the balance head only while `balance >= points` (atomic conditional decrement).
 *  Returns the new balance, or `null` when insufficient (the command maps `null` → BUSINESS). */
export async function redeemRewardBalance(
  accountId: string,
  points: number,
  actorUserId: string | null,
  db: DbExecutor,
): Promise<number | null> {
  const res = await db.rewardAccount.updateMany({
    where: { id: accountId, balance: { gte: points } },
    data: {
      balance: { decrement: points },
      ...(actorUserId !== null ? { updatedBy: actorUserId } : {}),
    },
  });
  if (res.count === 0) return null; // insufficient balance
  const row = await db.rewardAccount.findUnique({
    where: { id: accountId },
    select: { balance: true },
  });
  return row === null ? null : toNum(row.balance);
}

/** Append one `reward_transactions` row (append-only). Returns the minted id. */
export async function insertRewardTransaction(
  input: {
    accountId: string;
    txnType: "credit" | "debit";
    points: number;
    reason: string;
    actorUserId: string | null;
  },
  db: DbExecutor,
): Promise<string> {
  const id = uuidv7();
  await db.rewardTransaction.create({
    data: {
      id,
      rewardAccountId: input.accountId,
      txnType: input.txnType,
      amount: input.points,
      reason: input.reason,
      ...(input.actorUserId !== null ? { createdBy: input.actorUserId } : {}),
    },
  });
  return id;
}

/** Does a referral already exist for the `(referrer, referred)` pair? (the duplicate-pair BUSINESS check). */
export async function referralPairExists(
  referrerOrganizationId: string,
  referredOrganizationId: string,
  db: DbExecutor,
): Promise<boolean> {
  const row = await db.referral.findFirst({
    where: { referrerOrganizationId, referredOrganizationId },
    select: { id: true },
  });
  return row !== null;
}

/** Insert a referral at `pending` (Doc-4I §HB-6.2 track). Returns the minted id. */
export async function insertReferral(
  input: {
    referrerOrganizationId: string;
    referredOrganizationId: string;
    actorUserId: string | null;
  },
  db: DbExecutor,
): Promise<string> {
  const id = uuidv7();
  await db.referral.create({
    data: {
      id,
      referrerOrganizationId: input.referrerOrganizationId,
      referredOrganizationId: input.referredOrganizationId,
      state: "pending",
      ...(input.actorUserId !== null
        ? { createdBy: input.actorUserId, updatedBy: input.actorUserId }
        : {}),
    },
  });
  return id;
}

/** Load a referral's `{ referrerOrganizationId, state }` for the advance STATE/scope check. `null` ⇒ absent. */
export async function loadReferralHead(
  referralId: string,
  db: DbExecutor,
): Promise<{ referrerOrganizationId: string; state: "pending" | "qualified" | "rewarded" } | null> {
  const row = await db.referral.findFirst({
    where: { id: referralId },
    select: { referrerOrganizationId: true, state: true },
  });
  if (row === null) return null;
  return { referrerOrganizationId: row.referrerOrganizationId, state: row.state };
}

/** CAS: advance a referral `state` from `expectedState` to `targetState` (Doc-4I §HB-6.2). When
 *  `referrerOrganizationId` is supplied (User branch) the referrer-org match is part of the CAS. Returns the
 *  affected-row count (`1` ⇒ advanced; `0` ⇒ lost race → CONFLICT). */
export async function advanceReferralCas(
  input: {
    referralId: string;
    expectedState: "pending" | "qualified";
    targetState: "qualified" | "rewarded";
    referrerOrganizationId?: string;
    actorUserId: string | null;
  },
  db: DbExecutor,
): Promise<number> {
  const res = await db.referral.updateMany({
    where: {
      id: input.referralId,
      state: input.expectedState,
      ...(input.referrerOrganizationId !== undefined
        ? { referrerOrganizationId: input.referrerOrganizationId }
        : {}),
    },
    data: {
      state: input.targetState,
      updatedAt: new Date(),
      ...(input.actorUserId !== null ? { updatedBy: input.actorUserId } : {}),
    },
  });
  return res.count;
}
