// M7 infrastructure (PRIVATE) — thin Prisma repository over `billing.platform_invoices` (+
// `billing.platform_payments`) for BC-BILL-5 `get_platform_invoice` / `list_platform_invoices`
// (Doc-4I §HB-5.4 / Doc-6I §3.5). M7 reading its OWN schema. Calls run under the caller's `withActiveOrg`
// tenant transaction — the `platform_invoices_tenant` / `platform_payments_read` RLS scope them to the
// debtor `app.active_org`. READ-ONLY: the issue/update writes + record_payment land in the next slice.
//
// `amount` is Doc-6I §3.5 `numeric` = REAL MONEY (platform revenue) → rendered as a precision-preserving
// decimal STRING (the `plans.price` convention), NOT a number (unlike usage/lead-credit units).

import { prisma, type DbExecutor } from "../../../../shared/db";

/** Invoice status / purpose / payment enums (Doc-2 §10.8 client values — identical to the wire strings). */
type InvoiceStatus = "issued" | "paid" | "overdue" | "void";
type InvoicePurpose = "subscription" | "lead_package" | "advertising" | "microsite" | "service";
type PaymentGateway = "sslcommerz" | "bkash" | "nagad" | "bank";
type PaymentStatus = "initiated" | "succeeded" | "failed" | "refunded";

/** One `platform_payments` row projected for the `get_platform_invoice` `payments` sub-list. */
export interface InvoicePaymentReadModel {
  gateway: PaymentGateway;
  gatewayRef: string | null;
  status: PaymentStatus;
}

/** The full `platform_invoices` head (+ payments) for `get_platform_invoice`. `amount` is a money string. */
export interface InvoiceDetailReadModel {
  id: string;
  humanRef: string;
  organizationId: string;
  purpose: InvoicePurpose;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  payments: InvoicePaymentReadModel[];
}

/** One `platform_invoices` row projected for `list_platform_invoices` (no payments). `createdAt` is carried
 *  for the keyset cursor; the query strips it from the wire item. */
export interface InvoiceListItemReadModel {
  id: string;
  humanRef: string;
  purpose: InvoicePurpose;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  createdAt: Date;
}

/** Repo-level list filters (already validated by the caller). */
export interface InvoiceFilter {
  status?: InvoiceStatus;
  purpose?: InvoicePurpose;
}

/** Insert a platform invoice at `issued` (Doc-4I §HB-5.1). `humanRef` is the M0-allocated `INV-P-…`.
 *  Returns the minted id. */
export async function insertInvoice(
  input: {
    id: string;
    humanRef: string;
    organizationId: string;
    purpose: InvoicePurpose;
    amount: string;
    currency: string;
    subscriptionId?: string;
    actorUserId: string | null;
  },
  db: DbExecutor,
): Promise<void> {
  await db.platformInvoice.create({
    data: {
      id: input.id,
      humanRef: input.humanRef,
      organizationId: input.organizationId,
      purpose: input.purpose,
      amount: input.amount,
      currency: input.currency,
      status: "issued",
      ...(input.subscriptionId !== undefined ? { subscriptionId: input.subscriptionId } : {}),
      ...(input.actorUserId !== null
        ? { createdBy: input.actorUserId, updatedBy: input.actorUserId }
        : {}),
    },
  });
}

/** Load an invoice's `{ organizationId, status }` for the `update_invoice_status` STATE/scope check.
 *  `null` ⇒ absent. Scope (User-void branch: debtor-org match) is applied by the command. */
export async function loadInvoiceHead(
  invoiceId: string,
  db: DbExecutor,
): Promise<{ organizationId: string; status: InvoiceStatus } | null> {
  const row = await db.platformInvoice.findFirst({
    where: { id: invoiceId },
    select: { organizationId: true, status: true },
  });
  if (row === null) return null;
  return { organizationId: row.organizationId, status: row.status };
}

/** CAS: transition `status` from `expectedStatus` to `targetStatus` (Doc-4I §HB-5.2). When `organizationId`
 *  is supplied (User-void branch) the debtor-org match is part of the CAS. Returns the affected-row count:
 *  `1` ⇒ transitioned; `0` ⇒ a lost race (the row left `expectedStatus`) → the command maps that to CONFLICT. */
export async function transitionInvoiceStatusCas(
  input: {
    invoiceId: string;
    expectedStatus: InvoiceStatus;
    targetStatus: InvoiceStatus;
    organizationId?: string;
    actorUserId: string | null;
  },
  db: DbExecutor,
): Promise<number> {
  const result = await db.platformInvoice.updateMany({
    where: {
      id: input.invoiceId,
      status: input.expectedStatus,
      ...(input.organizationId !== undefined ? { organizationId: input.organizationId } : {}),
    },
    data: {
      status: input.targetStatus,
      updatedAt: new Date(),
      ...(input.actorUserId !== null ? { updatedBy: input.actorUserId } : {}),
    },
  });
  return result.count;
}

/** Load ONE invoice (+ its payment records) scoped to the debtor org. `null` ⇒ absent OR cross-org (the
 *  `platform_invoices_tenant` RLS already scopes; the explicit `organizationId` filter is the twin) → NOT_FOUND. */
export async function findInvoiceForOrg(
  invoiceId: string,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<InvoiceDetailReadModel | null> {
  const row = await db.platformInvoice.findFirst({
    where: { id: invoiceId, organizationId },
    select: {
      id: true,
      humanRef: true,
      organizationId: true,
      purpose: true,
      amount: true,
      currency: true,
      status: true,
      payments: {
        orderBy: { createdAt: "asc" },
        select: { gateway: true, gatewayRef: true, status: true },
      },
    },
  });
  if (row === null) return null;
  return {
    id: row.id,
    humanRef: row.humanRef,
    organizationId: row.organizationId,
    purpose: row.purpose,
    amount: row.amount.toString(),
    currency: row.currency,
    status: row.status,
    payments: row.payments.map((p) => ({
      gateway: p.gateway,
      gatewayRef: p.gatewayRef,
      status: p.status,
    })),
  };
}

/** One keyset-paginated page of the debtor org's invoices (DESC by `created_at`, `id` tiebreak — newest
 *  first), matching `filter`, up to `limit` rows. `after` is the decoded cursor position (exclusive). */
export async function findInvoicesPage(
  organizationId: string,
  filter: InvoiceFilter,
  after: { createdAt: Date; id: string } | null,
  limit: number,
  db: DbExecutor = prisma,
): Promise<InvoiceListItemReadModel[]> {
  const rows = await db.platformInvoice.findMany({
    where: {
      organizationId,
      ...(filter.status !== undefined ? { status: filter.status } : {}),
      ...(filter.purpose !== undefined ? { purpose: filter.purpose } : {}),
      ...(after !== null
        ? {
            OR: [
              { createdAt: { lt: after.createdAt } },
              { AND: [{ createdAt: after.createdAt }, { id: { lt: after.id } }] },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    select: {
      id: true,
      humanRef: true,
      purpose: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    humanRef: r.humanRef,
    purpose: r.purpose,
    amount: r.amount.toString(),
    currency: r.currency,
    status: r.status,
    createdAt: r.createdAt,
  }));
}

// ── W3-BILL-10 — BC-BILL-5 `record_payment` (§HB-5.3) gateway-callback writes over `platform_payments`. ──

/** Find the payment for `(platform_invoice_id, gateway_ref)` — the idempotency/lookup key. `null` ⇒ first
 *  callback for this reference. */
export async function findPaymentByGatewayRef(
  platformInvoiceId: string,
  gatewayRef: string,
  db: DbExecutor,
): Promise<{ id: string; status: PaymentStatus } | null> {
  const row = await db.platformPayment.findFirst({
    where: { platformInvoiceId, gatewayRef },
    select: { id: true, status: true },
  });
  return row === null ? null : { id: row.id, status: row.status };
}

/** Insert a `platform_payments` row at `status` (Doc-4I §HB-5.3 — the first callback for a `gateway_ref`). */
export async function insertPayment(
  input: {
    id: string;
    platformInvoiceId: string;
    gateway: PaymentGateway;
    gatewayRef: string;
    status: PaymentStatus;
  },
  db: DbExecutor,
): Promise<void> {
  await db.platformPayment.create({
    data: {
      id: input.id,
      platformInvoiceId: input.platformInvoiceId,
      gateway: input.gateway,
      gatewayRef: input.gatewayRef,
      status: input.status,
    },
  });
}

/** CAS: transition a payment `status` from `expectedStatus` to `targetStatus` (Doc-4I §HB-5.3). Returns the
 *  affected count (`1` ⇒ transitioned; `0` ⇒ raced). `gateway`/identity stay frozen (immutability trigger). */
export async function transitionPaymentStatusCas(
  paymentId: string,
  expectedStatus: PaymentStatus,
  targetStatus: PaymentStatus,
  db: DbExecutor,
): Promise<number> {
  const result = await db.platformPayment.updateMany({
    where: { id: paymentId, status: expectedStatus },
    data: { status: targetStatus, updatedAt: new Date() },
  });
  return result.count;
}
