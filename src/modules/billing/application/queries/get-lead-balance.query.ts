// M7 application (PRIVATE) — `billing.get_lead_balance.v1` (Doc-4I §HB-4.2 / Doc-5I §7
// `GET /billing/lead-account` · 200). W3-BILL-7. ORG-SELF read (Own-Org singleton, User-only — Doc-5I §3.6;
// `can_view_billing` resolved at the composition edge). Runs INSIDE the composition's `withActiveOrg`
// tenant transaction; `lead_credit_accounts_tenant` RLS scopes it to `app.active_org`. `organizationId` is
// the server-validated active org — NEVER a caller `org_id` (Doc-5I §7 / Invariant #5).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { loadLeadBalance } from "../../infrastructure/data/lead-credit.repository";
import type { LeadBalanceView } from "../../contracts/types";

/**
 * Read the active org's lead-credit balance head (Doc-4I §HB-4.2). Org-self and total — `balance` is `0`
 * when the org has no lead-credit account yet (no NOT_FOUND leg: an org always has a — possibly zero — balance).
 */
export async function getLeadBalance(
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<LeadBalanceView> {
  const balance = await loadLeadBalance(organizationId, db);
  return { organizationId, balance };
}
