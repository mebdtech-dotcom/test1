// M7 infrastructure (PRIVATE) — thin Prisma repository over `billing.subscriptions` +
// `billing.subscription_events` for BC-BILL-2 (Doc-4I §HB-2.1/§HB-2.5 / Doc-6I §3.2). M7 reading/writing
// its OWN schema (allowed). All calls run under the caller's `withActiveOrg` tenant transaction — the
// `subscriptions_tenant` / `subscription_events_tenant` RLS scopes them to `app.active_org`.

import { Prisma, prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { SubscriptionHeadReadModel } from "../../domain/read-models/subscription.read-model";

/** Does the org already have an ACTIVE subscription? (the one-active-per-org pre-check — Doc-4I §HB-2.1). */
export async function findActiveSubscriptionId(
  organizationId: string,
  db: DbExecutor,
): Promise<string | null> {
  const row = await db.subscription.findFirst({
    where: { organizationId, state: "active", deletedAt: null },
    select: { id: true },
  });
  return row?.id ?? null;
}

/** Load a PURCHASABLE (active, non-retired) plan's billing cycle (for the period), or `null` if it does
 *  not resolve to an active plan (Doc-4I §HB-2.1 REFERENCE — Model B: active ⟺ is_active ∧ live). */
export async function loadPurchasablePlan(
  planId: string,
  db: DbExecutor,
): Promise<{ billingCycle: "monthly" | "annual" } | null> {
  const row = await db.plan.findFirst({
    where: { id: planId, isActive: true, deletedAt: null },
    select: { billingCycle: true },
  });
  return row === null ? null : { billingCycle: row.billingCycle };
}

/** The org's CURRENT subscription head (most-recent non-deleted) for `get_subscription`. `null` ⇒ none. */
export async function loadCurrentSubscription(
  organizationId: string,
  db: DbExecutor,
): Promise<SubscriptionHeadReadModel | null> {
  const row = await db.subscription.findFirst({
    where: { organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      planId: true,
      state: true,
      periodStart: true,
      periodEnd: true,
      autoRenew: true,
    },
  });
  if (row === null) return null;
  return {
    id: row.id,
    planId: row.planId,
    status: row.state,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    autoRenew: row.autoRenew,
  };
}

/** Insert a subscription at `pending_payment` (Doc-4I §HB-2.1). Returns the minted id. */
export async function insertSubscription(
  input: {
    organizationId: string;
    planId: string;
    autoRenew: boolean;
    periodStart: Date;
    periodEnd: Date;
    actorUserId: string;
  },
  db: DbExecutor,
): Promise<{ subscriptionId: string }> {
  const subscriptionId = uuidv7();
  await db.subscription.create({
    data: {
      id: subscriptionId,
      organizationId: input.organizationId,
      planId: input.planId,
      state: "pending_payment",
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      autoRenew: input.autoRenew,
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
    },
  });
  return { subscriptionId };
}

/** Append one `subscription_events` row (append-only; the immutability trigger blocks UPDATE/DELETE). */
export async function appendSubscriptionEvent(
  input: {
    subscriptionId: string;
    eventType: "purchase" | "renew" | "expire" | "cancel";
    payload?: unknown;
    actorUserId: string;
  },
  db: DbExecutor,
): Promise<void> {
  await db.subscriptionEvent.create({
    data: {
      id: uuidv7(),
      subscriptionId: input.subscriptionId,
      eventType: input.eventType,
      ...(input.payload !== undefined
        ? { payloadJsonb: input.payload as Prisma.InputJsonValue }
        : {}),
      createdBy: input.actorUserId,
    },
  });
}
