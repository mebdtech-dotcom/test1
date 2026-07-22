import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import {
  cancelSubscription,
  listSubscriptionEvents,
  resolveEntitlements,
} from "../../src/modules/billing/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-5 [Wave-3 M7] — BC-BILL-2 COMPLETION: `cancel_subscription` (Doc-4I §HB-2.2), the
// `list_subscription_events` read (§HB-2.5), and the OUT-OF-WIRE `resolve_entitlements` internal authority
// (§HB-2.4 / Doc-5I §10). Org-scoped command/queries are exercised directly (an injected `ctx` / an
// `organizationId` — the composition's `withActiveOrg` + `hasPermission` are M1-tested machinery). DB writes
// run under `prisma` (superuser, RLS bypassed) proving the app-layer + persistence; `asRestrictedRole` proves
// the `subscriptions_tenant` write-fence. Append-only tables → FRESH ids per case (no cleanup, no collisions).

const CANCEL_DEPS = { appendAuditRecord };

function cancelCtx(orgId: string, userId: string, canManageBilling = true) {
  return { userId, activeOrgId: orgId, canManageBilling };
}

async function seedPlan(isActive = true): Promise<string> {
  const id = uuidv7();
  await prisma.plan.create({
    data: {
      id,
      name: `zzz_bill_${id.slice(0, 8)}`,
      billingCycle: "monthly",
      price: "1000",
      currency: "BDT",
      isActive,
    },
  });
  return id;
}

async function seedSubscription(
  organizationId: string,
  planId: string,
  state: "pending_payment" | "active" | "expired",
  autoRenew: boolean,
): Promise<string> {
  const id = uuidv7();
  await prisma.subscription.create({
    data: { id, organizationId, planId, state, autoRenew },
  });
  return id;
}

async function seedEvent(
  subscriptionId: string,
  eventType: "purchase" | "renew" | "expire" | "cancel",
  occurredAt: Date,
): Promise<void> {
  await prisma.subscriptionEvent.create({
    data: { id: uuidv7(), subscriptionId, eventType, occurredAt },
  });
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
});

describe("billing.cancel_subscription.v1 (command) — Doc-4I §HB-2.2", () => {
  it("VALIDATION on a malformed subscription_id", async () => {
    const out = await cancelSubscription(
      { subscriptionId: "nope", expectedStatus: "active" },
      cancelCtx(uuidv7(), uuidv7()),
      CANCEL_DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("VALIDATION");
  });

  it("VALIDATION when expected_status is not 'active'", async () => {
    const out = await cancelSubscription(
      // @ts-expect-error — deliberately illegal expected_status (the wire enum<active> guard).
      { subscriptionId: uuidv7(), expectedStatus: "expired" },
      cancelCtx(uuidv7(), uuidv7()),
      CANCEL_DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("VALIDATION");
  });

  it("AUTHORIZATION when can_manage_billing is not held", async () => {
    const out = await cancelSubscription(
      { subscriptionId: uuidv7(), expectedStatus: "active" },
      cancelCtx(uuidv7(), uuidv7(), false),
      CANCEL_DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("AUTHORIZATION");
  });

  it("NOT_FOUND when the subscription does not exist", async () => {
    const out = await cancelSubscription(
      { subscriptionId: uuidv7(), expectedStatus: "active" },
      cancelCtx(uuidv7(), uuidv7()),
      CANCEL_DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("NOT_FOUND");
  });

  it("NOT_FOUND (protected-fact collapse) when the subscription belongs to another org", async () => {
    const plan = await seedPlan();
    const orgA = uuidv7();
    const sub = await seedSubscription(orgA, plan, "active", true);
    // Acting as orgB — the subscription is orgA's; existence must NOT be confirmed to a non-owner.
    const out = await cancelSubscription(
      { subscriptionId: sub, expectedStatus: "active" },
      cancelCtx(uuidv7(), uuidv7()),
      CANCEL_DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("NOT_FOUND");
  });

  it("STATE when the subscription is pending_payment (not active)", async () => {
    const plan = await seedPlan();
    const org = uuidv7();
    const sub = await seedSubscription(org, plan, "pending_payment", true);
    const out = await cancelSubscription(
      { subscriptionId: sub, expectedStatus: "active" },
      cancelCtx(org, uuidv7()),
      CANCEL_DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("STATE");
  });

  it("STATE when the subscription is already expired", async () => {
    const plan = await seedPlan();
    const org = uuidv7();
    const sub = await seedSubscription(org, plan, "expired", true);
    const out = await cancelSubscription(
      { subscriptionId: sub, expectedStatus: "active" },
      cancelCtx(org, uuidv7()),
      CANCEL_DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("STATE");
  });

  it("cancels an active subscription: auto_renew=false, status stays active, cancel event + user audit", async () => {
    const plan = await seedPlan();
    const org = uuidv7();
    const user = uuidv7();
    const sub = await seedSubscription(org, plan, "active", true);

    const out = await cancelSubscription(
      { subscriptionId: sub, expectedStatus: "active" },
      cancelCtx(org, user),
      CANCEL_DEPS,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.subscriptionId).toBe(sub);
    expect(out.result.status).toBe("active"); // status UNCHANGED (Doc-4I §HB-2.2)

    const row = await prisma.subscription.findUnique({
      where: { id: sub },
      select: { state: true, autoRenew: true, updatedBy: true },
    });
    expect(row?.state).toBe("active");
    expect(row?.autoRenew).toBe(false);
    expect(row?.updatedBy).toBe(user);

    expect(
      await prisma.subscriptionEvent.findFirst({
        where: { subscriptionId: sub, eventType: "cancel" },
      }),
    ).not.toBeNull();

    const audit = await prisma.auditRecord.findFirst({
      where: { entityType: "subscriptions", entityId: sub, action: "subscription_cancelled" },
      select: { actorType: true, actorId: true, organizationId: true },
    });
    expect(audit?.actorType).toBe("user");
    expect(audit?.actorId).toBe(user);
    expect(audit?.organizationId).toBe(org);
  });

  it("is idempotent on an already-cancelled (auto_renew=false) active subscription — no new event", async () => {
    const plan = await seedPlan();
    const org = uuidv7();
    const sub = await seedSubscription(org, plan, "active", false); // already cancelled

    const out = await cancelSubscription(
      { subscriptionId: sub, expectedStatus: "active" },
      cancelCtx(org, uuidv7()),
      CANCEL_DEPS,
    );
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.result.status).toBe("active");

    // Idempotent: NO cancel event and NO audit are appended on the no-op repeat.
    expect(
      await prisma.subscriptionEvent.count({ where: { subscriptionId: sub, eventType: "cancel" } }),
    ).toBe(0);
    expect(
      await prisma.auditRecord.count({
        where: { entityId: sub, action: "subscription_cancelled" },
      }),
    ).toBe(0);
  });
});

describe("billing.list_subscription_events.v1 (query) — Doc-4I §HB-2.5", () => {
  it("VALIDATION on a malformed subscription_id", async () => {
    const out = await listSubscriptionEvents({ subscriptionId: "nope" }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("VALIDATION when page_size exceeds the billing.list_page_size_max bound", async () => {
    const out = await listSubscriptionEvents({ subscriptionId: uuidv7(), pageSize: 101 }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("VALIDATION on an undecodable cursor", async () => {
    const out = await listSubscriptionEvents(
      { subscriptionId: uuidv7(), cursor: "!!!not-base64url!!!" },
      uuidv7(),
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("NOT_FOUND when the subscription is absent", async () => {
    const out = await listSubscriptionEvents({ subscriptionId: uuidv7() }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("NOT_FOUND");
  });

  it("NOT_FOUND when the subscription belongs to another org (protected-fact collapse)", async () => {
    const plan = await seedPlan();
    const orgA = uuidv7();
    const sub = await seedSubscription(orgA, plan, "active", true);
    const out = await listSubscriptionEvents({ subscriptionId: sub }, uuidv7()); // acting as orgB
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("NOT_FOUND");
  });

  it("returns the event history newest-first and paginates by keyset", async () => {
    const plan = await seedPlan();
    const org = uuidv7();
    const sub = await seedSubscription(org, plan, "active", false);
    await seedEvent(sub, "purchase", new Date("2026-01-01T00:00:00.000Z"));
    await seedEvent(sub, "renew", new Date("2026-02-01T00:00:00.000Z"));
    await seedEvent(sub, "cancel", new Date("2026-03-01T00:00:00.000Z"));

    // Page 1 (size 2) — DESC by occurred_at: [cancel, renew] + a next cursor.
    const p1 = await listSubscriptionEvents({ subscriptionId: sub, pageSize: 2 }, org);
    expect(p1.ok).toBe(true);
    if (!p1.ok) return;
    expect(p1.result.items.map((i) => i.eventType)).toEqual(["cancel", "renew"]);
    expect(p1.result.items[0].occurredAt).toBe("2026-03-01T00:00:00.000Z");
    expect(p1.result.pageInfo.hasMore).toBe(true);
    expect(p1.result.pageInfo.nextCursor).toBeDefined();

    // Page 2 (cursor) — the remaining [purchase], no more.
    const p2 = await listSubscriptionEvents(
      { subscriptionId: sub, pageSize: 2, cursor: p1.result.pageInfo.nextCursor },
      org,
    );
    expect(p2.ok).toBe(true);
    if (!p2.ok) return;
    expect(p2.result.items.map((i) => i.eventType)).toEqual(["purchase"]);
    expect(p2.result.pageInfo.hasMore).toBe(false);
    expect(p2.result.pageInfo.nextCursor).toBeUndefined();
  });
});

describe("billing.resolve_entitlements.v1 (out-of-wire internal authority) — Doc-4I §HB-2.4", () => {
  async function seedEntitlement(
    slug: string,
    type: "boolean" | "numeric" | "enum_",
  ): Promise<string> {
    const id = uuidv7();
    await prisma.entitlement.create({ data: { id, slug, type } });
    return id;
  }

  it("resolves the active subscription's plan bundle (source active_subscription)", async () => {
    const plan = await seedPlan();
    const org = uuidv7();
    const eBool = await seedEntitlement(`w3b5_bool_${uuidv7()}`, "boolean");
    const eNum = await seedEntitlement(`w3b5_num_${uuidv7()}`, "numeric");
    const eEnum = await seedEntitlement(`w3b5_enum_${uuidv7()}`, "enum_");
    await prisma.planEntitlement.createMany({
      data: [
        { planId: plan, entitlementId: eBool, valueJsonb: true },
        { planId: plan, entitlementId: eNum, valueJsonb: 50 },
        { planId: plan, entitlementId: eEnum, valueJsonb: "gold" },
      ],
    });
    await seedSubscription(org, plan, "active", true);

    const res = await resolveEntitlements({ organizationId: org });
    expect(res.source).toBe("active_subscription");
    expect(res.organizationId).toBe(org);
    expect(res.entitlements).toHaveLength(3);

    const byType = Object.fromEntries(res.entitlements.map((e) => [e.type, e.value]));
    expect(byType.boolean).toBe(true);
    expect(byType.numeric).toBe(50);
    // The Prisma-client `enum_` type is mapped back to the wire `enum` on resolution (W3-BILL-3 convention).
    expect(res.entitlements.some((e) => e.type === "enum")).toBe(true);
    expect(byType.enum).toBe("gold");
  });

  it("returns the Basic profile (empty) when the org has no active subscription (A-11)", async () => {
    const res = await resolveEntitlements({ organizationId: uuidv7() });
    expect(res.source).toBe("basic_profile");
    expect(res.entitlements).toEqual([]);
  });

  it("a pending_payment-only org still falls back to the Basic profile (only `active` resolves)", async () => {
    const plan = await seedPlan();
    const org = uuidv7();
    await seedSubscription(org, plan, "pending_payment", true);
    const res = await resolveEntitlements({ organizationId: org });
    expect(res.source).toBe("basic_profile");
    expect(res.entitlements).toEqual([]);
  });

  it("narrows to a single entitlement when entitlement_slug is supplied", async () => {
    const plan = await seedPlan();
    const org = uuidv7();
    const keepSlug = `w3b5_keep_${uuidv7()}`;
    const eKeep = await seedEntitlement(keepSlug, "numeric");
    const eDrop = await seedEntitlement(`w3b5_drop_${uuidv7()}`, "boolean");
    await prisma.planEntitlement.createMany({
      data: [
        { planId: plan, entitlementId: eKeep, valueJsonb: 10 },
        { planId: plan, entitlementId: eDrop, valueJsonb: false },
      ],
    });
    await seedSubscription(org, plan, "active", true);

    const res = await resolveEntitlements({ organizationId: org, entitlementSlug: keepSlug });
    expect(res.source).toBe("active_subscription");
    expect(res.entitlements).toHaveLength(1);
    expect(res.entitlements[0]?.slug).toBe(keepSlug);
    expect(res.entitlements[0]?.value).toBe(10);
  });
});

describe("subscriptions_tenant RLS write-fence (Doc-8B §5) — cancel cannot cross orgs at the DB level", () => {
  it("a non-staff role in org B's context cannot UPDATE org A's subscription (0 rows, fail-closed)", async () => {
    const plan = await seedPlan();
    const orgA = uuidv7();
    const sub = await seedSubscription(orgA, plan, "active", true);

    // Act as the restricted RLS role pinned to org B — the CAS UPDATE org A's row must affect 0 rows
    // (the RLS `USING`/`WITH CHECK` scopes it), never a permission-denied (the UPDATE grant is held).
    const affected = await asRestrictedRole({ activeOrg: uuidv7() }, async (tx) => {
      return tx.$executeRawUnsafe(
        "UPDATE billing.subscriptions SET auto_renew = false WHERE id = $1::uuid AND state = 'active'",
        sub,
      );
    });
    expect(affected).toBe(0);

    // Superuser confirms the row was untouched (auto_renew still true).
    const row = await prisma.subscription.findUnique({
      where: { id: sub },
      select: { autoRenew: true },
    });
    expect(row?.autoRenew).toBe(true);
  });
});
