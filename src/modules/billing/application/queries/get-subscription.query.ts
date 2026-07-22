// M7 application (PRIVATE) — `billing.get_subscription.v1` (Doc-4I §HB-2.5 / Doc-5I §5
// `GET /billing/subscriptions/current` · 200). W3-BILL-4. ORG-SELF read (Own-Org, User-only — Doc-5I §3.6
// [ESC-BILL-ADMINSCOPE]). Runs INSIDE the composition's `withActiveOrg` tenant transaction; the
// `subscriptions_tenant` RLS scopes it to `app.active_org`, and the query's own `organization_id` filter
// is the belt-and-suspenders twin. No client org id (Invariant #5).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { loadCurrentSubscription } from "../../infrastructure/data/subscription.repository";
import type { GetSubscriptionResult } from "../../contracts/types";

/**
 * Read the active org's current subscription head (most-recent non-deleted). `found: false` when the org
 * has no subscription. `organizationId` is the server-validated active org (from the composition — never input).
 */
export async function getSubscription(
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<GetSubscriptionResult> {
  const head = await loadCurrentSubscription(organizationId, db);
  if (head === null) return { found: false };
  return {
    found: true,
    subscription: {
      subscriptionId: head.id,
      planId: head.planId,
      status: head.status,
      periodStart: head.periodStart?.toISOString() ?? null,
      periodEnd: head.periodEnd?.toISOString() ?? null,
      autoRenew: head.autoRenew,
    },
  };
}
