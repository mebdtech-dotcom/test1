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

/** Load a subscription SCOPED to the org (its state + auto_renew) — drives the cancel STATE/idempotency
 *  check and the `list_subscription_events` parent existence/NOT_FOUND gate. `null` ⇒ absent OR cross-org
 *  (the `subscriptions_tenant` RLS already scopes; the explicit `organizationId` filter is the twin). */
export async function loadSubscriptionScoped(
  subscriptionId: string,
  organizationId: string,
  db: DbExecutor,
): Promise<{
  id: string;
  state: "pending_payment" | "active" | "expired";
  autoRenew: boolean;
} | null> {
  const row = await db.subscription.findFirst({
    where: { id: subscriptionId, organizationId, deletedAt: null },
    select: { id: true, state: true, autoRenew: true },
  });
  if (row === null) return null;
  return { id: row.id, state: row.state, autoRenew: row.autoRenew };
}

/** CAS: set `auto_renew=false` on the org's `active` subscription that is STILL `active` ∧ `auto_renew=true`
 *  (Doc-4I §HB-2.2). Returns the affected-row count: `1` ⇒ cancelled; `0` ⇒ a lost race (state left `active`
 *  or another cancel won concurrently) → the command maps that to `CONFLICT`. State is UNCHANGED (§HB-2.2). */
export async function cancelSubscriptionCas(
  subscriptionId: string,
  organizationId: string,
  actorUserId: string,
  db: DbExecutor,
): Promise<number> {
  const result = await db.subscription.updateMany({
    where: {
      id: subscriptionId,
      organizationId,
      state: "active",
      autoRenew: true,
      deletedAt: null,
    },
    data: { autoRenew: false, updatedBy: actorUserId, updatedAt: new Date() },
  });
  return result.count;
}

/** One keyset-paginated page of a subscription's `subscription_events` (DESC by `occurred_at`, `id`
 *  tiebreak — Doc-5I §5.3), up to `limit` rows. `after` is the decoded cursor position (exclusive). */
export async function findSubscriptionEventsPage(
  subscriptionId: string,
  after: { occurredAt: Date; id: string } | null,
  limit: number,
  db: DbExecutor,
): Promise<
  Array<{ id: string; eventType: "purchase" | "renew" | "expire" | "cancel"; occurredAt: Date }>
> {
  const rows = await db.subscriptionEvent.findMany({
    where: {
      subscriptionId,
      ...(after !== null
        ? {
            OR: [
              { occurredAt: { lt: after.occurredAt } },
              { AND: [{ occurredAt: after.occurredAt }, { id: { lt: after.id } }] },
            ],
          }
        : {}),
    },
    orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    take: limit,
    select: { id: true, eventType: true, occurredAt: true },
  });
  return rows.map((r) => ({ id: r.id, eventType: r.eventType, occurredAt: r.occurredAt }));
}

/** The org's `active` subscription's `plan_id` (for `resolve_entitlements`), or `null` if none is active. */
export async function loadActiveSubscriptionPlanId(
  organizationId: string,
  db: DbExecutor,
): Promise<string | null> {
  const row = await db.subscription.findFirst({
    where: { organizationId, state: "active", deletedAt: null },
    select: { planId: true },
  });
  return row?.planId ?? null;
}

/** Load a plan's bundled entitlement values (`plan_entitlements` ⋈ `entitlements`) for `resolve_entitlements`
 *  — NO `deleted_at` filter on the plan (a retired plan's existing `active` subscriptions still resolve;
 *  retirement blocks NEW subscriptions only — Doc-5I §4). Optional single-`slug` narrow (Doc-4I §HB-2.4). */
export async function loadPlanEntitlementBundle(
  planId: string,
  entitlementSlug: string | undefined,
  db: DbExecutor,
): Promise<Array<{ slug: string; type: "boolean" | "numeric" | "enum_"; value: unknown }>> {
  const rows = await db.planEntitlement.findMany({
    where: {
      planId,
      ...(entitlementSlug !== undefined ? { entitlement: { slug: entitlementSlug } } : {}),
    },
    orderBy: { entitlementId: "asc" },
    select: { valueJsonb: true, entitlement: { select: { slug: true, type: true } } },
  });
  return rows.map((r) => ({
    slug: r.entitlement.slug,
    type: r.entitlement.type,
    value: r.valueJsonb,
  }));
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
