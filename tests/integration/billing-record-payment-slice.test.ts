import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { recordPayment, type RecordPaymentInput } from "../../src/modules/billing/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-10 [Wave-3 M7] — BC-BILL-5 `record_payment` (Doc-4I §HB-5.3): the OUT-OF-WIRE gateway callback.
// System actor; writes/transitions `platform_payments`; on `succeeded` drives the invoice → paid. Exercised
// directly via the contract facade (no route/composition). DB under `prisma` (superuser, RLS bypassed);
// `asRestrictedRole` proves the staff-only write-fence. Append-only audit + immutable-gateway → FRESH ids.

const DEPS = { appendAuditRecord };

async function seedInvoice(
  organizationId: string,
  status: "issued" | "paid" | "overdue" | "void" = "issued",
): Promise<string> {
  const id = uuidv7();
  await prisma.platformInvoice.create({
    data: {
      id,
      humanRef: `INV-P-${id}`,
      organizationId,
      amount: "1000",
      currency: "BDT",
      status,
      purpose: "subscription",
    },
  });
  return id;
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
});

describe("billing.record_payment.v1 (out-of-wire gateway callback) — Doc-4I §HB-5.3", () => {
  it("VALIDATION on bad invoice_id / gateway / empty gateway_ref / bad target_status", async () => {
    const inv = uuidv7();
    // Type-invalid gateway/target, cast to exercise the runtime SYNTAX guard (a prettier-robust alternative
    // to a ts-expect-error directive, whose placement line-wrapping can break).
    const badGateway = {
      invoiceId: inv,
      gateway: "nope",
      gatewayRef: "R",
      targetStatus: "succeeded",
    } as unknown as RecordPaymentInput;
    const badTarget = {
      invoiceId: inv,
      gateway: "bkash",
      gatewayRef: "R",
      targetStatus: "initiated",
    } as unknown as RecordPaymentInput;
    expect((await recordPayment(badGateway, DEPS)).ok).toBe(false);
    expect(
      (
        await recordPayment(
          { invoiceId: inv, gateway: "bkash", gatewayRef: "", targetStatus: "succeeded" },
          DEPS,
        )
      ).ok,
    ).toBe(false);
    expect((await recordPayment(badTarget, DEPS)).ok).toBe(false);
  });

  it("REFERENCE when the invoice does not resolve", async () => {
    const out = await recordPayment(
      { invoiceId: uuidv7(), gateway: "bkash", gatewayRef: uuidv7(), targetStatus: "succeeded" },
      DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("REFERENCE");
  });

  it("succeeded: creates the payment, drives the invoice → paid, + payment & invoice audits", async () => {
    const org = uuidv7();
    const inv = await seedInvoice(org, "issued");
    const ref = uuidv7();
    const out = await recordPayment(
      { invoiceId: inv, gateway: "sslcommerz", gatewayRef: ref, targetStatus: "succeeded" },
      DEPS,
    );
    expect(out.ok).toBe(true);

    const payment = await prisma.platformPayment.findFirst({
      where: { platformInvoiceId: inv, gatewayRef: ref },
      select: { id: true, status: true, gateway: true },
    });
    expect(payment?.status).toBe("succeeded");
    expect(payment?.gateway).toBe("sslcommerz");

    const invoice = await prisma.platformInvoice.findUnique({
      where: { id: inv },
      select: { status: true },
    });
    expect(invoice?.status).toBe("paid"); // driven

    // System-attributed payment audit (§9 Financial "payment status change").
    const paymentAudit = await prisma.auditRecord.findFirst({
      where: { entityId: payment?.id, action: "payment_status_changed" },
      select: { actorType: true, actorId: true, organizationId: true },
    });
    expect(paymentAudit).toEqual({ actorType: "system", actorId: null, organizationId: org });
    // The driven invoice → paid ([ESC-BILL-AUDIT] status change).
    expect(
      await prisma.auditRecord.count({
        where: {
          entityType: "platform_invoices",
          entityId: inv,
          action: "platform_invoice_status_changed",
        },
      }),
    ).toBe(1);
  });

  it("failed: records the payment but does NOT drive the invoice", async () => {
    const org = uuidv7();
    const inv = await seedInvoice(org, "issued");
    const out = await recordPayment(
      { invoiceId: inv, gateway: "bkash", gatewayRef: uuidv7(), targetStatus: "failed" },
      DEPS,
    );
    expect(out.ok).toBe(true);
    const invoice = await prisma.platformInvoice.findUnique({
      where: { id: inv },
      select: { status: true },
    });
    expect(invoice?.status).toBe("issued"); // NOT driven
  });

  it("is idempotent on a replayed (invoice, gateway_ref, target) callback — one row, one audit", async () => {
    const org = uuidv7();
    const inv = await seedInvoice(org, "issued");
    const ref = uuidv7();
    await recordPayment(
      { invoiceId: inv, gateway: "nagad", gatewayRef: ref, targetStatus: "succeeded" },
      DEPS,
    );
    await recordPayment(
      { invoiceId: inv, gateway: "nagad", gatewayRef: ref, targetStatus: "succeeded" },
      DEPS,
    );

    expect(
      await prisma.platformPayment.count({ where: { platformInvoiceId: inv, gatewayRef: ref } }),
    ).toBe(1);
    const paymentId = (await prisma.platformPayment.findFirst({
      where: { platformInvoiceId: inv, gatewayRef: ref },
      select: { id: true },
    }))!.id;
    expect(
      await prisma.auditRecord.count({
        where: { entityId: paymentId, action: "payment_status_changed" },
      }),
    ).toBe(1); // no duplicate audit on replay
  });

  it("refund: succeeded → refunded transitions the same payment (refund audit)", async () => {
    const org = uuidv7();
    const inv = await seedInvoice(org, "issued");
    const ref = uuidv7();
    await recordPayment(
      { invoiceId: inv, gateway: "bank", gatewayRef: ref, targetStatus: "succeeded" },
      DEPS,
    );
    const out = await recordPayment(
      { invoiceId: inv, gateway: "bank", gatewayRef: ref, targetStatus: "refunded" },
      DEPS,
    );
    expect(out.ok).toBe(true);

    const payment = await prisma.platformPayment.findFirst({
      where: { platformInvoiceId: inv, gatewayRef: ref },
      select: { id: true, status: true },
    });
    expect(payment?.status).toBe("refunded");
    expect(
      await prisma.auditRecord.count({
        where: { entityId: payment?.id, action: "payment_refunded" },
      }),
    ).toBe(1);
  });

  it("STATE on an illegal payment transition (failed → succeeded)", async () => {
    const org = uuidv7();
    const inv = await seedInvoice(org, "issued");
    const ref = uuidv7();
    await recordPayment(
      { invoiceId: inv, gateway: "bkash", gatewayRef: ref, targetStatus: "failed" },
      DEPS,
    );
    const out = await recordPayment(
      { invoiceId: inv, gateway: "bkash", gatewayRef: ref, targetStatus: "succeeded" },
      DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("STATE");
  });

  it("a succeeded callback on a void invoice records the payment but leaves the invoice void", async () => {
    const org = uuidv7();
    const inv = await seedInvoice(org, "void");
    const out = await recordPayment(
      { invoiceId: inv, gateway: "bkash", gatewayRef: uuidv7(), targetStatus: "succeeded" },
      DEPS,
    );
    expect(out.ok).toBe(true);
    const invoice = await prisma.platformInvoice.findUnique({
      where: { id: inv },
      select: { status: true },
    });
    expect(invoice?.status).toBe("void"); // not driven (best-effort; the invoice is terminal)
  });
});

describe("platform_payments RLS write-fence (Doc-8B §5) — staff/System only", () => {
  it("a non-staff role cannot INSERT a payment (platform_payments_admin WITH CHECK rejects)", async () => {
    const org = uuidv7();
    const inv = await seedInvoice(org, "issued");
    await expect(
      asRestrictedRole({ activeOrg: org }, async (tx) => {
        await tx.$executeRawUnsafe(
          `INSERT INTO billing.platform_payments (id, platform_invoice_id, gateway, status)
           VALUES ($1::uuid, $2::uuid, 'bkash', 'succeeded')`,
          uuidv7(),
          inv,
        );
      }),
    ).rejects.toThrow();
  });
});
