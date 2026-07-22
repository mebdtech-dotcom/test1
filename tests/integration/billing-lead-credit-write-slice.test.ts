import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { leadCreditMovement } from "../../src/modules/billing/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-13 [Wave-3 M7] — BC-BILL-4 WRITES: credit_lead_account / debit_lead_account (§HB-4.1).
// Actor-branched (User wired leg + System in-process) — exercised directly with an injected `ctx` (one
// command; `direction` fixed per the contract slug). DB under `prisma` (superuser, RLS bypassed);
// `asRestrictedRole` proves the write-fence. amount/balance = lead CREDITS (numbers).

const DEPS = { appendAuditRecord };

function ctx(
  org: string,
  direction: "credit" | "debit",
  opts: { actorType?: "user" | "system"; userId?: string | null; canManageBilling?: boolean } = {},
) {
  const actorType = opts.actorType ?? "user";
  return {
    actorType,
    userId: actorType === "system" ? null : (opts.userId ?? uuidv7()),
    organizationId: org,
    direction,
    canManageBilling: opts.canManageBilling ?? true,
  };
}

async function seedAccount(organizationId: string, balance: number): Promise<void> {
  await prisma.leadCreditAccount.create({ data: { id: uuidv7(), organizationId, balance } });
}

async function seedInvoice(organizationId: string): Promise<string> {
  const id = uuidv7();
  await prisma.platformInvoice.create({
    data: {
      id,
      humanRef: `INV-P-${id}`,
      organizationId,
      amount: "5000",
      currency: "BDT",
      purpose: "lead_package",
    },
  });
  return id;
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
});

describe("billing.credit_lead_account.v1 (command) — Doc-4I §HB-4.1", () => {
  it("VALIDATION on non-positive amount / bad source_invoice_id", async () => {
    const org = uuidv7();
    expect((await leadCreditMovement({ amount: 0 }, ctx(org, "credit"), DEPS)).ok).toBe(false);
    expect(
      (await leadCreditMovement({ amount: 10, sourceInvoiceId: "nope" }, ctx(org, "credit"), DEPS))
        .ok,
    ).toBe(false);
  });

  it("AUTHORIZATION when the User leg lacks can_manage_billing", async () => {
    const out = await leadCreditMovement(
      { amount: 10 },
      ctx(uuidv7(), "credit", { canManageBilling: false }),
      DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("AUTHORIZATION");
  });

  it("credits: creates the account on first movement + increments balance (user audit)", async () => {
    const org = uuidv7();
    const user = uuidv7();
    const out = await leadCreditMovement(
      { amount: 100 },
      ctx(org, "credit", { userId: user }),
      DEPS,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result).toEqual({
      transactionId: expect.any(String),
      organizationId: org,
      direction: "credit",
      amount: 100,
      balance: 100,
    });
    const account = await prisma.leadCreditAccount.findFirst({
      where: { organizationId: org },
      select: { balance: true },
    });
    expect(account?.balance.toString()).toBe("100");
    const audit = await prisma.auditRecord.findFirst({
      where: { entityId: out.result.transactionId, action: "lead_credit_movement" },
      select: { actorType: true, actorId: true, organizationId: true },
    });
    expect(audit).toEqual({ actorType: "user", actorId: user, organizationId: org });
  });

  it("links a valid source_invoice_id; REFERENCE when it does not resolve for the org", async () => {
    const org = uuidv7();
    const invoice = await seedInvoice(org);
    const ok = await leadCreditMovement(
      { amount: 50, sourceInvoiceId: invoice },
      ctx(org, "credit"),
      DEPS,
    );
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      const txn = await prisma.leadCreditTransaction.findUnique({
        where: { id: ok.result.transactionId },
        select: { sourceInvoiceId: true },
      });
      expect(txn?.sourceInvoiceId).toBe(invoice);
    }

    // A random uuid → REFERENCE; another org's invoice → REFERENCE (does not resolve for this org).
    const absent = await leadCreditMovement(
      { amount: 10, sourceInvoiceId: uuidv7() },
      ctx(org, "credit"),
      DEPS,
    );
    expect(absent.ok).toBe(false);
    if (!absent.ok) expect(absent.error.errorClass).toBe("REFERENCE");

    const otherOrgInvoice = await seedInvoice(uuidv7());
    const crossOrg = await leadCreditMovement(
      { amount: 10, sourceInvoiceId: otherOrgInvoice },
      ctx(org, "credit"),
      DEPS,
    );
    expect(crossOrg.ok).toBe(false);
    if (!crossOrg.ok) expect(crossOrg.error.errorClass).toBe("REFERENCE");
  });

  it("System credit leg has no slug requirement (system audit)", async () => {
    const org = uuidv7();
    const out = await leadCreditMovement(
      { amount: 40 },
      ctx(org, "credit", { actorType: "system", canManageBilling: false }),
      DEPS,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const audit = await prisma.auditRecord.findFirst({
      where: { entityId: out.result.transactionId },
      select: { actorType: true, actorId: true },
    });
    expect(audit).toEqual({ actorType: "system", actorId: null });
  });
});

describe("billing.debit_lead_account.v1 (command) — Doc-4I §HB-4.1", () => {
  it("AUTHORIZATION when the User leg lacks can_manage_billing", async () => {
    const out = await leadCreditMovement(
      { amount: 10 },
      ctx(uuidv7(), "debit", { canManageBilling: false }),
      DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("AUTHORIZATION");
  });

  it("debits within balance (debit txn); BUSINESS when it exceeds the balance (no overdraft)", async () => {
    const org = uuidv7();
    await seedAccount(org, 50);
    const ok = await leadCreditMovement({ amount: 30 }, ctx(org, "debit"), DEPS);
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.result.balance).toBe(20);
    const txn = await prisma.leadCreditTransaction.findFirst({
      where: { account: { organizationId: org }, txnType: "debit" },
      select: { amount: true },
    });
    expect(txn?.amount.toString()).toBe("30");

    const insufficient = await leadCreditMovement({ amount: 1000 }, ctx(org, "debit"), DEPS);
    expect(insufficient.ok).toBe(false);
    if (!insufficient.ok) expect(insufficient.error.errorClass).toBe("BUSINESS");
  });
});

describe("lead_credit_accounts RLS write-fence (Doc-8B §5)", () => {
  it("a non-staff role in org B cannot INSERT an account for org A (WITH CHECK rejects)", async () => {
    const orgA = uuidv7();
    await expect(
      asRestrictedRole({ activeOrg: uuidv7() }, async (tx) => {
        await tx.$executeRawUnsafe(
          `INSERT INTO billing.lead_credit_accounts (id, organization_id, balance) VALUES ($1::uuid, $2::uuid, 0)`,
          uuidv7(),
          orgA,
        );
      }),
    ).rejects.toThrow();
  });
});
