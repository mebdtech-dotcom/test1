// M7 application (PRIVATE) — `billing.get_platform_invoice.v1` (Doc-4I §HB-5.4 / Doc-5I §8
// `GET /billing/invoices/{invoice_id}` · 200). W3-BILL-8. ORG-SELF read (Own-Org debtor, User-only — Doc-5I
// §3.6; `can_view_billing` resolved at the composition edge). Runs INSIDE the composition's `withActiveOrg`
// tenant transaction; `platform_invoices_tenant` + `platform_payments_read` RLS scope it to the debtor
// `app.active_org`. `organizationId` is the server-validated active org — NEVER a caller `org_id`.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import { findInvoiceForOrg } from "../../infrastructure/data/platform-invoice.repository";
import type { GetPlatformInvoiceOutcome } from "../../contracts/types";

/**
 * `billing.get_platform_invoice.v1` — read one platform invoice (+ its payment records) by id, scoped to the
 * debtor org. SYNTAX (uuid) → NOT_FOUND (absent or cross-org — protected-fact collapse §3.5).
 */
export async function getPlatformInvoice(
  invoiceId: string,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<GetPlatformInvoiceOutcome> {
  if (typeof invoiceId !== "string" || !UUID_PATTERN.test(invoiceId)) {
    return { ok: false, errorClass: "VALIDATION" };
  }

  const invoice = await findInvoiceForOrg(invoiceId, organizationId, db);
  if (invoice === null) {
    return { ok: false, errorClass: "NOT_FOUND" };
  }

  return {
    ok: true,
    result: {
      invoiceId: invoice.id,
      humanRef: invoice.humanRef,
      organizationId: invoice.organizationId,
      purpose: invoice.purpose,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      payments: invoice.payments,
    },
  };
}
