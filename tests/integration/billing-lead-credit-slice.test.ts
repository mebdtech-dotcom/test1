import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { getLeadBalance, listLeadTransactions } from "../../src/modules/billing/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-7 [Wave-3 M7] — BC-BILL-4 lead-credit READS: `get_lead_balance` (Doc-4I §HB-4.2) +
// `list_lead_transactions` (§HB-4.2). The credit/debit WRITES (§HB-4.1) land next slice, so these tests
// SEED `lead_credit_accounts` + `lead_credit_transactions` directly (superuser, RLS bypassed). The
// org-scoped queries take the server-resolved active org (the composition's withActiveOrg + can_view_billing
// are M1-tested machinery). `asRestrictedRole` proves the `lead_credit_*_tenant` RLS scoping.
// APPEND-ONLY transactions → FRESH ids per case (no cleanup).

async function seedAccount(organizationId: string, balance: number): Promise<string> {
  const id = uuidv7();
  await prisma.leadCreditAccount.create({ data: { id, organizationId, balance } });
  return id;
}

async function seedTxn(
  leadCreditAccountId: string,
  direction: "credit" | "debit",
  amount: number,
  createdAt: Date,
  sourceInvoiceId: string | null = null,
): Promise<string> {
  const id = uuidv7();
  await prisma.leadCreditTransaction.create({
    data: {
      id,
      leadCreditAccountId,
      txnType: direction,
      amount,
      createdAt,
      ...(sourceInvoiceId !== null ? { sourceInvoiceId } : {}),
    },
  });
  return id;
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
});

describe("billing.get_lead_balance.v1 (query) — Doc-4I §HB-4.2", () => {
  it("balance 0 when the org has no lead-credit account (org-self, no NOT_FOUND)", async () => {
    const org = uuidv7();
    const view = await getLeadBalance(org);
    expect(view).toEqual({ organizationId: org, balance: 0 });
  });

  it("returns the account balance head for the org", async () => {
    const org = uuidv7();
    await seedAccount(org, 250);
    const view = await getLeadBalance(org);
    expect(view).toEqual({ organizationId: org, balance: 250 });
  });
});

describe("billing.list_lead_transactions.v1 (query) — Doc-4I §HB-4.2", () => {
  it("VALIDATION when page_size exceeds the billing.list_page_size_max bound", async () => {
    const out = await listLeadTransactions({ pageSize: 101 }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("VALIDATION on an undecodable cursor", async () => {
    const out = await listLeadTransactions({ cursor: "!!!not-base64url!!!" }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("empty items for an org whose account has no transactions", async () => {
    const org = uuidv7();
    await seedAccount(org, 0);
    const out = await listLeadTransactions({}, org);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.items).toEqual([]);
    expect(out.result.pageInfo.hasMore).toBe(false);
  });

  it("returns the transaction history newest-first with the frozen item shape", async () => {
    const org = uuidv7();
    const account = await seedAccount(org, 100);
    // A credit purchase links to a real platform invoice — the source_invoice_id FK (added W3-BILL-8)
    // requires it to resolve to an existing `platform_invoices` row (a lead_package invoice for this org).
    const invoice = uuidv7();
    await prisma.platformInvoice.create({
      data: {
        id: invoice,
        humanRef: `INV-P-${invoice}`,
        organizationId: org,
        amount: "5000",
        currency: "BDT",
        purpose: "lead_package",
      },
    });
    await seedTxn(account, "credit", 100, new Date("2026-01-01T00:00:00.000Z"), invoice);
    await seedTxn(account, "debit", 1, new Date("2026-02-01T00:00:00.000Z"));

    const out = await listLeadTransactions({}, org);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.items.map((i) => i.direction)).toEqual(["debit", "credit"]); // DESC by occurred_at
    const [debit, credit] = out.result.items;
    expect(debit).toEqual({
      transactionId: expect.any(String),
      direction: "debit",
      amount: 1,
      sourceInvoiceId: null,
      occurredAt: "2026-02-01T00:00:00.000Z",
    });
    expect(credit.direction).toBe("credit");
    expect(credit.amount).toBe(100);
    expect(credit.sourceInvoiceId).toBe(invoice);
  });

  it("paginates by keyset", async () => {
    const org = uuidv7();
    const account = await seedAccount(org, 10);
    await seedTxn(account, "credit", 1, new Date("2026-01-01T00:00:00.000Z"));
    await seedTxn(account, "credit", 2, new Date("2026-02-01T00:00:00.000Z"));
    await seedTxn(account, "credit", 3, new Date("2026-03-01T00:00:00.000Z"));

    const p1 = await listLeadTransactions({ pageSize: 2 }, org);
    expect(p1.ok).toBe(true);
    if (!p1.ok) return;
    expect(p1.result.items).toHaveLength(2);
    expect(p1.result.pageInfo.hasMore).toBe(true);
    expect(p1.result.pageInfo.nextCursor).toBeDefined();

    const p2 = await listLeadTransactions(
      { pageSize: 2, cursor: p1.result.pageInfo.nextCursor },
      org,
    );
    expect(p2.ok).toBe(true);
    if (!p2.ok) return;
    expect(p2.result.items).toHaveLength(1);
    expect(p2.result.pageInfo.hasMore).toBe(false);
  });
});

describe("lead_credit RLS (Doc-8B §5) — org isolation for balance + transaction reads", () => {
  it("lead_credit_accounts_tenant scopes a non-staff role to its OWN org", async () => {
    const orgA = uuidv7();
    const orgB = uuidv7();
    await seedAccount(orgA, 5);
    await seedAccount(orgB, 9);

    const visibleForA = await asRestrictedRole({ activeOrg: orgA }, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ organization_id: string }>>(
        "SELECT organization_id FROM billing.lead_credit_accounts WHERE organization_id = ANY($1::uuid[])",
        [orgA, orgB],
      );
      return rows.map((r) => r.organization_id);
    });
    expect(visibleForA).toContain(orgA);
    expect(visibleForA).not.toContain(orgB);
  });

  it("lead_credit_transactions_tenant scopes via the parent account's org", async () => {
    const orgA = uuidv7();
    const orgB = uuidv7();
    const accountA = await seedAccount(orgA, 5);
    const accountB = await seedAccount(orgB, 9);
    const txnA = await seedTxn(accountA, "credit", 5, new Date("2026-01-01T00:00:00.000Z"));
    const txnB = await seedTxn(accountB, "credit", 9, new Date("2026-01-01T00:00:00.000Z"));

    const visibleForA = await asRestrictedRole({ activeOrg: orgA }, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        "SELECT id FROM billing.lead_credit_transactions WHERE id = ANY($1::uuid[])",
        [txnA, txnB],
      );
      return rows.map((r) => r.id);
    });
    expect(visibleForA).toContain(txnA);
    expect(visibleForA).not.toContain(txnB);
  });
});
