import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import {
  issuePlatformInvoice,
  updateInvoiceStatus,
  type IssuePlatformInvoiceInput,
  type UpdateInvoiceStatusInput,
} from "../../src/modules/billing/contracts";
import { allocateHumanReference, appendAuditRecord } from "../../src/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-9 [Wave-3 M7] — BC-BILL-5 invoice WRITES: `issue_platform_invoice` (Doc-4I §HB-5.1) +
// `update_invoice_status` (§HB-5.2). Actor-branched (User wired leg + System in-process) — exercised
// directly with an injected `ctx` (the composition's withActiveOrg + hasPermission are M1-tested). DB
// writes run under `prisma` (superuser, RLS bypassed); `asRestrictedRole` proves the write-fence. `amount`
// = money STRING. No-SD + immutable-money → FRESH ids per case.

const ISSUE_DEPS = { appendAuditRecord, allocateHumanReference };
const CURRENT_YEAR = new Date().getUTCFullYear();

function issueCtx(org: string, user: string, canManageBilling = true) {
  return { actorType: "user" as const, userId: user, organizationId: org, canManageBilling };
}

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

describe("billing.issue_platform_invoice.v1 (command) — Doc-4I §HB-5.1", () => {
  it("VALIDATION on a bad purpose / non-positive amount / bad currency", async () => {
    const org = uuidv7();
    const user = uuidv7();
    // A type-invalid purpose, cast to exercise the runtime SYNTAX guard (a prettier-robust alternative to a
    // ts-expect-error directive, whose placement line-wrapping can break).
    const badPurpose = {
      purpose: "nope",
      amount: "100",
      currency: "BDT",
    } as unknown as IssuePlatformInvoiceInput;
    expect((await issuePlatformInvoice(badPurpose, issueCtx(org, user), ISSUE_DEPS)).ok).toBe(
      false,
    );
    expect(
      (
        await issuePlatformInvoice(
          { purpose: "service", amount: "0", currency: "BDT" },
          issueCtx(org, user),
          ISSUE_DEPS,
        )
      ).ok,
    ).toBe(false);
    expect(
      (
        await issuePlatformInvoice(
          { purpose: "service", amount: "100", currency: "bd" },
          issueCtx(org, user),
          ISSUE_DEPS,
        )
      ).ok,
    ).toBe(false);
  });

  it("AUTHORIZATION when can_manage_billing is not held (User leg)", async () => {
    const out = await issuePlatformInvoice(
      { purpose: "lead_package", amount: "500", currency: "BDT" },
      issueCtx(uuidv7(), uuidv7(), false),
      ISSUE_DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("AUTHORIZATION");
  });

  it("REFERENCE when a linked subscription_id does not resolve", async () => {
    const out = await issuePlatformInvoice(
      { purpose: "subscription", amount: "500", currency: "BDT", subscriptionId: uuidv7() },
      issueCtx(uuidv7(), uuidv7()),
      ISSUE_DEPS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("REFERENCE");
  });

  it("issues an invoice at `issued` with an INV-P-… human_ref + a user-attributed audit", async () => {
    const org = uuidv7();
    const user = uuidv7();
    const out = await issuePlatformInvoice(
      { purpose: "advertising", amount: "2500.50", currency: "BDT" },
      issueCtx(org, user),
      ISSUE_DEPS,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.status).toBe("issued");
    expect(out.result.amount).toBe("2500.50");
    expect(out.result.humanRef).toMatch(new RegExp(`^INV-P-${CURRENT_YEAR}-\\d{6}$`));

    const row = await prisma.platformInvoice.findUnique({
      where: { id: out.result.invoiceId },
      select: { status: true, organizationId: true, purpose: true, humanRef: true },
    });
    expect(row?.status).toBe("issued");
    expect(row?.organizationId).toBe(org);
    expect(row?.humanRef).toBe(out.result.humanRef);

    const audit = await prisma.auditRecord.findFirst({
      where: {
        entityType: "platform_invoices",
        entityId: out.result.invoiceId,
        action: "platform_invoice_created",
      },
      select: { actorType: true, actorId: true, organizationId: true },
    });
    expect(audit?.actorType).toBe("user");
    expect(audit?.actorId).toBe(user);
    expect(audit?.organizationId).toBe(org);
  });

  it("System leg issues without a slug (subscription-driven), audit attributed to System", async () => {
    const org = uuidv7();
    const out = await issuePlatformInvoice(
      { purpose: "subscription", amount: "1000", currency: "BDT" },
      { actorType: "system", userId: null, organizationId: org, canManageBilling: false },
      ISSUE_DEPS,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const audit = await prisma.auditRecord.findFirst({
      where: { entityType: "platform_invoices", entityId: out.result.invoiceId },
      select: { actorType: true, actorId: true },
    });
    expect(audit?.actorType).toBe("system");
    expect(audit?.actorId).toBeNull();
  });
});

describe("billing.update_invoice_status.v1 (command) — Doc-4I §HB-5.2", () => {
  it("VALIDATION on a bad target/expected status", async () => {
    const badTarget = {
      invoiceId: uuidv7(),
      targetStatus: "nope",
      expectedStatus: "issued",
    } as unknown as UpdateInvoiceStatusInput;
    expect(
      (await updateInvoiceStatus(badTarget, issueCtx(uuidv7(), uuidv7()), { appendAuditRecord }))
        .ok,
    ).toBe(false);
  });

  it("AUTHORIZATION when a User targets a non-void status (paid/overdue are System-only)", async () => {
    const out = await updateInvoiceStatus(
      { invoiceId: uuidv7(), targetStatus: "paid", expectedStatus: "issued" },
      issueCtx(uuidv7(), uuidv7()),
      { appendAuditRecord },
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("AUTHORIZATION");
  });

  it("NOT_FOUND (User void) when the invoice is absent or cross-org", async () => {
    const absent = await updateInvoiceStatus(
      { invoiceId: uuidv7(), targetStatus: "void", expectedStatus: "issued" },
      issueCtx(uuidv7(), uuidv7()),
      { appendAuditRecord },
    );
    expect(absent.ok).toBe(false);
    if (!absent.ok) expect(absent.error.errorClass).toBe("NOT_FOUND");

    const orgA = uuidv7();
    const inv = await seedInvoice(orgA, "issued");
    const crossOrg = await updateInvoiceStatus(
      { invoiceId: inv, targetStatus: "void", expectedStatus: "issued" },
      issueCtx(uuidv7(), uuidv7()), // acting as orgB
      { appendAuditRecord },
    );
    expect(crossOrg.ok).toBe(false);
    if (!crossOrg.ok) expect(crossOrg.error.errorClass).toBe("NOT_FOUND");
  });

  it("voids an issued invoice (User leg) + a status-change audit", async () => {
    const org = uuidv7();
    const user = uuidv7();
    const inv = await seedInvoice(org, "issued");
    const out = await updateInvoiceStatus(
      { invoiceId: inv, targetStatus: "void", expectedStatus: "issued" },
      issueCtx(org, user),
      { appendAuditRecord },
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.status).toBe("void");
    const row = await prisma.platformInvoice.findUnique({
      where: { id: inv },
      select: { status: true },
    });
    expect(row?.status).toBe("void");
    expect(
      await prisma.auditRecord.count({
        where: { entityId: inv, action: "platform_invoice_status_changed" },
      }),
    ).toBe(1);
  });

  it("STATE when the invoice is already settled (terminal paid)", async () => {
    const org = uuidv7();
    const inv = await seedInvoice(org, "paid");
    const out = await updateInvoiceStatus(
      { invoiceId: inv, targetStatus: "void", expectedStatus: "issued" },
      issueCtx(org, uuidv7()),
      { appendAuditRecord },
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("STATE");
  });

  it("CONFLICT when expected_status does not match (lost race)", async () => {
    const org = uuidv7();
    const inv = await seedInvoice(org, "issued"); // actual = issued
    const out = await updateInvoiceStatus(
      { invoiceId: inv, targetStatus: "void", expectedStatus: "overdue" }, // stale assertion
      issueCtx(org, uuidv7()),
      { appendAuditRecord },
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("CONFLICT");
  });

  it("System leg drives issued → paid (no slug); REFERENCE on an absent invoice", async () => {
    const org = uuidv7();
    const inv = await seedInvoice(org, "issued");
    const paid = await updateInvoiceStatus(
      { invoiceId: inv, targetStatus: "paid", expectedStatus: "issued" },
      { actorType: "system", userId: null, canManageBilling: false },
      { appendAuditRecord },
    );
    expect(paid.ok).toBe(true);
    if (paid.ok) expect(paid.result.status).toBe("paid");

    const absent = await updateInvoiceStatus(
      { invoiceId: uuidv7(), targetStatus: "paid", expectedStatus: "issued" },
      { actorType: "system", userId: null, canManageBilling: false },
      { appendAuditRecord },
    );
    expect(absent.ok).toBe(false);
    if (!absent.ok) expect(absent.error.errorClass).toBe("REFERENCE");
  });
});

describe("platform_invoices_tenant RLS write-fence (Doc-8B §5)", () => {
  it("a non-staff role in org B's context cannot INSERT an invoice for org A (WITH CHECK rejects)", async () => {
    const orgA = uuidv7();
    await expect(
      asRestrictedRole({ activeOrg: uuidv7() }, async (tx) => {
        await tx.$executeRawUnsafe(
          `INSERT INTO billing.platform_invoices (id, human_ref, organization_id, amount, currency, purpose)
           VALUES ($1::uuid, $2, $3::uuid, 100, 'BDT', 'service')`,
          uuidv7(),
          `INV-P-${uuidv7()}`,
          orgA,
        );
      }),
    ).rejects.toThrow();
  });

  it("a non-staff role in org B's context cannot UPDATE org A's invoice status (0 rows, fail-closed)", async () => {
    const orgA = uuidv7();
    const inv = await seedInvoice(orgA, "issued");
    const affected = await asRestrictedRole({ activeOrg: uuidv7() }, async (tx) => {
      return tx.$executeRawUnsafe(
        "UPDATE billing.platform_invoices SET status = 'void' WHERE id = $1::uuid AND status = 'issued'",
        inv,
      );
    });
    expect(affected).toBe(0);
    const row = await prisma.platformInvoice.findUnique({
      where: { id: inv },
      select: { status: true },
    });
    expect(row?.status).toBe("issued");
  });
});
