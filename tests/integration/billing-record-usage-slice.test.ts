import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { recordUsage, type RecordUsageInput } from "../../src/modules/billing/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-14 [Wave-3 M7] — BC-BILL-3 `record_usage` (Doc-4I §HB-3.1): the OUT-OF-WIRE System metering write.
// entitlement_id is caller-supplied ([ESC-BILL-USAGE-ENTID] Option B). Exercised directly via the contract
// facade (no route/composition). DB under `prisma` (superuser, RLS bypassed); `asRestrictedRole` proves the
// write-fence. The FINAL M7 contract — all 33 realized after this.

const DEPS = { appendAuditRecord };
const PERIOD = "2026-07"; // YYYY-MM (the module-wide window; coherent with enforce_quota / get_usage)

async function seedEntitlement(): Promise<string> {
  const id = uuidv7();
  await prisma.entitlement.create({ data: { id, slug: `usage_ent_${id}`, type: "numeric" } });
  return id;
}

function baseInput(org: string, entitlementId: string): RecordUsageInput {
  return {
    organizationId: org,
    entitlementId,
    quotaKey: "rfq_responses",
    amount: 1,
    period: PERIOD,
    source: "rfq_response",
    sourceEventId: uuidv7(),
  };
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
});

describe("billing.record_usage.v1 (out-of-wire System metering) — Doc-4I §HB-3.1", () => {
  it("VALIDATION on bad ids / amount / period / source", async () => {
    const org = uuidv7();
    const ent = uuidv7();
    expect((await recordUsage({ ...baseInput(org, ent), organizationId: "nope" }, DEPS)).ok).toBe(
      false,
    );
    expect((await recordUsage({ ...baseInput(org, ent), amount: 0 }, DEPS)).ok).toBe(false);
    expect((await recordUsage({ ...baseInput(org, ent), period: "2026/07" }, DEPS)).ok).toBe(false);
    const badSource = { ...baseInput(org, ent), source: "nope" } as unknown as RecordUsageInput;
    expect((await recordUsage(badSource, DEPS)).ok).toBe(false);
  });

  it("REFERENCE when entitlement_id does not resolve", async () => {
    const out = await recordUsage(baseInput(uuidv7(), uuidv7()), DEPS);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("REFERENCE");
  });

  it("appends a usage_ledger row attributed to the Controlling Org + a System audit", async () => {
    const org = uuidv7();
    const ent = await seedEntitlement();
    const out = await recordUsage(
      { ...baseInput(org, ent), amount: 5, quotaKey: "rfq_responses" },
      DEPS,
    );
    expect(out.ok).toBe(true);

    const row = await prisma.usageLedger.findFirst({
      where: { organizationId: org, entitlementId: ent },
      select: { quotaKey: true, amount: true, period: true, source: true, actingUserId: true },
    });
    expect(row?.quotaKey).toBe("rfq_responses");
    expect(row?.amount.toString()).toBe("5");
    expect(row?.period).toBe(PERIOD);
    expect(row?.source).toBe("rfq_response");

    const audit = await prisma.auditRecord.findFirst({
      where: { entityType: "usage_ledger", action: "usage_recorded", organizationId: org },
      select: { actorType: true, actorId: true },
    });
    expect(audit).toEqual({ actorType: "system", actorId: null });
  });

  it("captures acting_user_id + consuming_entity_id when supplied (source lead_access)", async () => {
    const org = uuidv7();
    const ent = await seedEntitlement();
    const actingUser = uuidv7();
    const consuming = uuidv7();
    const out = await recordUsage(
      {
        ...baseInput(org, ent),
        source: "lead_access",
        quotaKey: "lead_credits",
        actingUserId: actingUser,
        consumingEntityId: consuming,
      },
      DEPS,
    );
    expect(out.ok).toBe(true);
    const row = await prisma.usageLedger.findFirst({
      where: { organizationId: org, entitlementId: ent },
      select: { actingUserId: true, consumingEntityId: true, source: true },
    });
    expect(row).toEqual({
      actingUserId: actingUser,
      consumingEntityId: consuming,
      source: "lead_access",
    });
  });
});

describe("usage_ledger RLS write-fence (Doc-8B §5) — record_usage attribution is org-fenced", () => {
  it("a non-staff role in org B cannot INSERT a usage row for org A (WITH CHECK rejects)", async () => {
    const orgA = uuidv7();
    const ent = await seedEntitlement();
    await expect(
      asRestrictedRole({ activeOrg: uuidv7() }, async (tx) => {
        await tx.$executeRawUnsafe(
          `INSERT INTO billing.usage_ledger (id, entitlement_id, organization_id, quota_key, amount, period, source)
           VALUES ($1::uuid, $2::uuid, $3::uuid, 'k', 1, '2026-07', 'rfq_response')`,
          uuidv7(),
          ent,
          orgA,
        );
      }),
    ).rejects.toThrow();
  });
});
