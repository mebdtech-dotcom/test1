// M7 application (PRIVATE) — `billing.get_reward_balance.v1` (Doc-4I §HB-6.3 / Doc-5I §9
// `GET /billing/reward-account` · 200). W3-BILL-11. ORG-SELF read (Own-Org singleton, User-only — Doc-5I
// §3.6; `can_view_billing` resolved at the composition edge). Runs INSIDE the composition's `withActiveOrg`
// tenant transaction; `reward_accounts_tenant` RLS scopes it to `app.active_org`. `organizationId` is the
// server-validated active org — NEVER a caller `org_id` (Doc-5I §9 / Invariant #5).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { loadRewardBalance } from "../../infrastructure/data/reward.repository";
import type { RewardBalanceView } from "../../contracts/types";

/**
 * Read the active org's reward-points balance head (Doc-4I §HB-6.3). Org-self — `balance` is `0` when the
 * org has no reward account yet (no NOT_FOUND leg: an org always has a — possibly zero — balance).
 */
export async function getRewardBalance(
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<RewardBalanceView> {
  const balance = await loadRewardBalance(organizationId, db);
  return { organizationId, balance };
}
