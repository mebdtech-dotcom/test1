import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { getSubscription, purchaseSubscription } from "../../src/modules/billing/contracts";
import { appendAuditRecord, writeOutboxEvent } from "../../src/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-4 [Wave-3 M7] — BC-BILL-2 `purchase_subscription` (Doc-4I §HB-2.1) + `get_subscription`
// (§HB-2.5), plus the M0 `core.write_outbox_event.v1` primitive (Doc-4B §16) that carries the platform's
// FIRST §8 event (`SubscriptionPurchased`). The org-scoped COMMAND/QUERY are exercised directly (an
// injected `ctx` — the composition's `withActiveOrg` + `hasPermission` are M1-tested machinery); the DB
// writes run under `prisma` (superuser, RLS bypassed) proving the app-layer + the actual persistence.
// The `asRestrictedRole` cases prove the tenant-context guarantees: the SECURITY DEFINER outbox write is
// admitted from a non-staff tenant context, and `subscriptions_tenant` scopes reads to the org.
//
// NOTE: subscriptions / subscription_events / outbox_events / audit_records are APPEND-ONLY (immutability
// triggers block DELETE) — the test mints FRESH ids per case (no cleanup, no collisions).

const DEPS = { appendAuditRecord, writeOutboxEvent };

function ctxFor(orgId: string, userId: string, canManageBilling = true) {
  return { userId, activeOrgId: orgId, canManageBilling };
}

async function seedPlan(isActive: boolean): Promise<string> {
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

beforeAll(async () => {
  await ensureRestrictedRlsRole();
});

describe("billing.purchase_subscription.v1 (command) — Doc-4I §HB-2.1", () => {
  it("VALIDATION on a malformed plan_id", async () => {
    const out = await purchaseSubscription({ planId: "nope" }, ctxFor(uuidv7(), uuidv7()), DEPS);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("VALIDATION");
  });

  it("AUTHORIZATION when can_manage_billing is not held", async () => {
    const plan = await seedPlan(true);
    const out = await purchaseSubscription(
      { planId: plan },
      ctxFor(uuidv7(), uuidv7(), false),
      DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("AUTHORIZATION");
  });

  it("REFERENCE when the plan is not active (draft)", async () => {
    const plan = await seedPlan(false); // draft
    const out = await purchaseSubscription({ planId: plan }, ctxFor(uuidv7(), uuidv7()), DEPS);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("REFERENCE");
  });

  it("creates pending_payment + purchase event + SubscriptionPurchased outbox + user audit", async () => {
    const plan = await seedPlan(true);
    const org = uuidv7();
    const user = uuidv7();
    const out = await purchaseSubscription(
      { planId: plan, autoRenew: true },
      ctxFor(org, user),
      DEPS,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const subId = out.result.subscriptionId;
    expect(out.result.status).toBe("pending_payment");

    const sub = await prisma.subscription.findUnique({
      where: { id: subId },
      select: { state: true, organizationId: true, planId: true, periodEnd: true },
    });
    expect(sub?.state).toBe("pending_payment");
    expect(sub?.organizationId).toBe(org);
    expect(sub?.planId).toBe(plan);
    expect(sub?.periodEnd).not.toBeNull(); // period derived from the plan cycle

    expect(
      await prisma.subscriptionEvent.findFirst({
        where: { subscriptionId: subId, eventType: "purchase" },
      }),
    ).not.toBeNull();

    // The platform's FIRST §8 event — written to the outbox (pending) via the M0 SECURITY DEFINER primitive.
    const outbox = await prisma.outboxEvent.findFirst({
      where: { aggregateId: subId, eventName: "SubscriptionPurchased" },
      select: { payloadJsonb: true, status: true, eventVersion: true },
    });
    expect(outbox).not.toBeNull();
    expect(outbox?.status).toBe("pending");
    expect(outbox?.eventVersion).toBe(1);
    expect(outbox?.payloadJsonb).toEqual({
      subscription_id: subId,
      organization_id: org,
      plan_id: plan,
    });

    // Audit — USER-attributed (not admin), org-scoped, enumerated §9 Financial "subscription purchase".
    const audit = await prisma.auditRecord.findFirst({
      where: { entityType: "subscriptions", entityId: subId, action: "subscription_purchased" },
      select: { actorType: true, actorId: true, organizationId: true },
    });
    expect(audit?.actorType).toBe("user");
    expect(audit?.actorId).toBe(user);
    expect(audit?.organizationId).toBe(org);
  });

  it("STATE when the org already has an active subscription (one-active-per-org)", async () => {
    const plan = await seedPlan(true);
    const org = uuidv7();
    await prisma.subscription.create({
      data: { id: uuidv7(), organizationId: org, planId: plan, state: "active" },
    });
    const out = await purchaseSubscription({ planId: plan }, ctxFor(org, uuidv7()), DEPS);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("STATE");
  });
});

describe("billing.get_subscription.v1 (query) — Doc-4I §HB-2.5", () => {
  it("found: the org's current subscription head", async () => {
    const plan = await seedPlan(true);
    const org = uuidv7();
    await purchaseSubscription({ planId: plan }, ctxFor(org, uuidv7()), DEPS);
    const res = await getSubscription(org);
    expect(res.found).toBe(true);
    if (res.found) {
      expect(res.subscription.status).toBe("pending_payment");
      expect(res.subscription.planId).toBe(plan);
    }
  });

  it("not found: an org with no subscription", async () => {
    const res = await getSubscription(uuidv7());
    expect(res.found).toBe(false);
  });
});

describe("core.write_outbox_event.v1 (M0) + subscriptions RLS backstop (Doc-8B §5)", () => {
  it("outbox RLS backstop: a non-staff tenant CANNOT write core.outbox_events directly (no SD; the real emit uses the privileged app connection — [ESC-CORE-OUTBOX-MECH] Option A)", async () => {
    // Option A (owner-ruled 2026-07-12) withdrew the SECURITY DEFINER `core.write_outbox_event`
    // function. The canonical primitive is a non-`RETURNING` insert on the CALLER's executor; in the
    // app path it runs on the privileged (RLS-bypassing) connection — proven by the purchase_subscription
    // flow tests above. Here we assert the defense-in-depth backstop: a non-staff NOBYPASSRLS tenant
    // context is REJECTED writing the outbox directly (`core.outbox_events` stays staff-only).
    await expect(
      asRestrictedRole({ activeOrg: uuidv7() }, async (tx) => {
        await tx.$executeRawUnsafe(
          `INSERT INTO core.outbox_events (id, aggregate_id, event_name, event_version, payload_jsonb, status, attempts)
           VALUES ($1::uuid, $2::uuid, 'SubscriptionPurchased', 1, $3::jsonb, 'pending', 0)`,
          uuidv7(),
          uuidv7(),
          JSON.stringify({ subscription_id: uuidv7() }),
        );
      }),
    ).rejects.toThrow();
  });

  it("subscriptions_tenant RLS scopes a non-staff role to its OWN org", async () => {
    const plan = await seedPlan(true);
    const orgA = uuidv7();
    const orgB = uuidv7();
    await prisma.subscription.create({
      data: { id: uuidv7(), organizationId: orgA, planId: plan, state: "pending_payment" },
    });
    await prisma.subscription.create({
      data: { id: uuidv7(), organizationId: orgB, planId: plan, state: "pending_payment" },
    });
    const visibleForA = await asRestrictedRole({ activeOrg: orgA }, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ organization_id: string }>>(
        "SELECT organization_id FROM billing.subscriptions WHERE organization_id = ANY($1::uuid[])",
        [orgA, orgB],
      );
      return rows.map((r) => r.organization_id);
    });
    expect(visibleForA).toContain(orgA);
    expect(visibleForA).not.toContain(orgB);
  });
});
