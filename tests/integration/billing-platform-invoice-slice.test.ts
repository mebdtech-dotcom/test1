import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { getPlatformInvoice, listPlatformInvoices } from "../../src/modules/billing/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-8 [Wave-3 M7] — BC-BILL-5 platform-invoice READS: `get_platform_invoice` (Doc-4I §HB-5.4) +
// `list_platform_invoices` (§HB-5.4). The issue/update writes + record_payment land next slice, so these
// tests SEED `platform_invoices` + `platform_payments` directly (superuser, RLS bypassed). The org-scoped
// queries take the server-resolved active org. `asRestrictedRole` proves `platform_invoices_tenant`
// (debtor reads) + `platform_payments_read` (org reads payments via the parent invoice). `amount` = money
// STRING (platform revenue). Immutable + no-SD → FRESH ids per case (no cleanup).

async function seedInvoice(
  organizationId: string,
  opts: {
    status?: "issued" | "paid" | "overdue" | "void";
    purpose?: "subscription" | "lead_package" | "advertising" | "microsite" | "service";
    amount?: string;
    createdAt?: Date;
  } = {},
): Promise<string> {
  const id = uuidv7();
  await prisma.platformInvoice.create({
    data: {
      id,
      humanRef: `INV-P-${id}`,
      organizationId,
      amount: opts.amount ?? "5000",
      currency: "BDT",
      status: opts.status ?? "issued",
      purpose: opts.purpose ?? "subscription",
      ...(opts.createdAt !== undefined ? { createdAt: opts.createdAt } : {}),
    },
  });
  return id;
}

async function seedPayment(
  platformInvoiceId: string,
  gateway: "sslcommerz" | "bkash" | "nagad" | "bank",
  status: "initiated" | "succeeded" | "failed" | "refunded",
  gatewayRef: string | null = null,
): Promise<string> {
  const id = uuidv7();
  await prisma.platformPayment.create({
    data: {
      id,
      platformInvoiceId,
      gateway,
      status,
      ...(gatewayRef !== null ? { gatewayRef } : {}),
    },
  });
  return id;
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
});

describe("billing.get_platform_invoice.v1 (query) — Doc-4I §HB-5.4", () => {
  it("VALIDATION on a malformed invoice_id", async () => {
    const out = await getPlatformInvoice("nope", uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("NOT_FOUND when the invoice does not exist", async () => {
    const out = await getPlatformInvoice(uuidv7(), uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("NOT_FOUND");
  });

  it("NOT_FOUND (protected-fact collapse) when the invoice debtor is another org", async () => {
    const orgA = uuidv7();
    const invoice = await seedInvoice(orgA);
    const out = await getPlatformInvoice(invoice, uuidv7()); // acting as orgB
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("NOT_FOUND");
  });

  it("returns the invoice head + its payment records (money as a string)", async () => {
    const org = uuidv7();
    const invoice = await seedInvoice(org, {
      purpose: "lead_package",
      amount: "2500",
      status: "paid",
    });
    await seedPayment(invoice, "bkash", "succeeded", "BKASH-REF-1");

    const out = await getPlatformInvoice(invoice, org);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result).toEqual({
      invoiceId: invoice,
      humanRef: `INV-P-${invoice}`,
      organizationId: org,
      purpose: "lead_package",
      amount: "2500",
      currency: "BDT",
      status: "paid",
      payments: [{ gateway: "bkash", gatewayRef: "BKASH-REF-1", status: "succeeded" }],
    });
  });

  it("returns an empty payments list for an invoice with no payments", async () => {
    const org = uuidv7();
    const invoice = await seedInvoice(org);
    const out = await getPlatformInvoice(invoice, org);
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.result.payments).toEqual([]);
  });
});

describe("billing.list_platform_invoices.v1 (query) — Doc-4I §HB-5.4", () => {
  it("VALIDATION on an undeclared filter field", async () => {
    const out = await listPlatformInvoices({ filters: { unknown: "x" } }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("VALIDATION on a bad status enum value", async () => {
    const out = await listPlatformInvoices({ filters: { status: "nope" } }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("VALIDATION on a bad purpose enum value", async () => {
    const out = await listPlatformInvoices({ filters: { purpose: "nope" } }, uuidv7());
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.errorClass).toBe("VALIDATION");
  });

  it("VALIDATION when page_size exceeds the bound / on a bad cursor", async () => {
    expect((await listPlatformInvoices({ pageSize: 101 }, uuidv7())).ok).toBe(false);
    expect((await listPlatformInvoices({ cursor: "!!!bad!!!" }, uuidv7())).ok).toBe(false);
  });

  it("returns the org's invoices newest-first with the frozen item shape (no org/payments)", async () => {
    const org = uuidv7();
    const older = await seedInvoice(org, {
      amount: "100",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const newer = await seedInvoice(org, {
      amount: "200",
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
    });

    const out = await listPlatformInvoices({}, org);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.items.map((i) => i.invoiceId)).toEqual([newer, older]); // DESC by created_at
    expect(out.result.items[0]).toEqual({
      invoiceId: newer,
      humanRef: `INV-P-${newer}`,
      purpose: "subscription",
      amount: "200",
      currency: "BDT",
      status: "issued",
    });
    expect(out.result.items[0]).not.toHaveProperty("payments");
    expect(out.result.items[0]).not.toHaveProperty("organizationId");
  });

  it("filters by status and by purpose (within the org)", async () => {
    const org = uuidv7();
    const paid = await seedInvoice(org, { status: "paid", purpose: "advertising" });
    await seedInvoice(org, { status: "issued", purpose: "subscription" });

    const byStatus = await listPlatformInvoices({ filters: { status: "paid" } }, org);
    expect(byStatus.ok).toBe(true);
    if (byStatus.ok) expect(byStatus.result.items.map((i) => i.invoiceId)).toEqual([paid]);

    const byPurpose = await listPlatformInvoices({ filters: { purpose: "advertising" } }, org);
    expect(byPurpose.ok).toBe(true);
    if (byPurpose.ok) expect(byPurpose.result.items.map((i) => i.invoiceId)).toEqual([paid]);
  });

  it("paginates by keyset", async () => {
    const org = uuidv7();
    await seedInvoice(org, { createdAt: new Date("2026-01-01T00:00:00.000Z") });
    await seedInvoice(org, { createdAt: new Date("2026-02-01T00:00:00.000Z") });
    await seedInvoice(org, { createdAt: new Date("2026-03-01T00:00:00.000Z") });

    const p1 = await listPlatformInvoices({ pageSize: 2 }, org);
    expect(p1.ok).toBe(true);
    if (!p1.ok) return;
    expect(p1.result.items).toHaveLength(2);
    expect(p1.result.pageInfo.hasMore).toBe(true);

    const p2 = await listPlatformInvoices(
      { pageSize: 2, cursor: p1.result.pageInfo.nextCursor },
      org,
    );
    expect(p2.ok).toBe(true);
    if (!p2.ok) return;
    expect(p2.result.items).toHaveLength(1);
    expect(p2.result.pageInfo.hasMore).toBe(false);
  });
});

describe("platform-invoicing RLS (Doc-8B §5) — debtor-org isolation", () => {
  it("platform_invoices_tenant scopes a non-staff role to its OWN org", async () => {
    const orgA = uuidv7();
    const orgB = uuidv7();
    const invA = await seedInvoice(orgA);
    const invB = await seedInvoice(orgB);

    const visibleForA = await asRestrictedRole({ activeOrg: orgA }, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        "SELECT id FROM billing.platform_invoices WHERE id = ANY($1::uuid[])",
        [invA, invB],
      );
      return rows.map((r) => r.id);
    });
    expect(visibleForA).toContain(invA);
    expect(visibleForA).not.toContain(invB);
  });

  it("platform_payments_read scopes a non-staff role via the parent invoice's org", async () => {
    const orgA = uuidv7();
    const orgB = uuidv7();
    const invA = await seedInvoice(orgA);
    const invB = await seedInvoice(orgB);
    const payA = await seedPayment(invA, "bank", "initiated");
    const payB = await seedPayment(invB, "bank", "initiated");

    const visibleForA = await asRestrictedRole({ activeOrg: orgA }, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        "SELECT id FROM billing.platform_payments WHERE id = ANY($1::uuid[])",
        [payA, payB],
      );
      return rows.map((r) => r.id);
    });
    expect(visibleForA).toContain(payA); // own invoice's payment
    expect(visibleForA).not.toContain(payB); // cross-org payment hidden
  });
});
