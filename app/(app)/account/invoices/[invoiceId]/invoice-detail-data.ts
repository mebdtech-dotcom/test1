// Platform invoice detail presentation seed — P-ACC-21 (Doc-7E). NOT authoritative: a wired build
// resolves this from the frozen `get_platform_invoice` (BC-BILL-5, Doc-4I §HB-5.4). PRESENTATION ONLY.
//
// FIELD DISCIPLINE: the projection is exactly `{ invoice_id, human_ref, organization_id, purpose,
// amount, currency, status, payments:list<{ gateway, gateway_ref, status }> }` (Doc-4I §HB-5.4:1143).
// There is NO line_items and NO file_ref field — so the page coins neither (the "line-item table" is a
// single purpose→amount row; the PDF download is deferred). Keyed by the opaque invoice_id (matches the
// P-ACC-20 list ids).

export type InvoiceStatus = "paid" | "issued" | "overdue" | "void";
export type Purpose = "subscription" | "lead_package" | "advertising" | "microsite" | "service";
// Frozen `platform_payments` status enum (Doc-2:832) — do not coin.
export type PaymentStatus = "initiated" | "succeeded" | "failed" | "refunded";

export interface Payment {
  gateway: string;
  gatewayRef: string; // opaque
  status: PaymentStatus;
}

export interface InvoiceDetailData {
  invoiceId: string; // opaque
  humanRef: string; // INV-P-…
  orgRef: string; // organization_id (opaque)
  purpose: Purpose;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  payments: Payment[];
}

export const PURPOSE_LABEL: Record<Purpose, string> = {
  subscription: "Subscription",
  lead_package: "Lead package",
  advertising: "Advertising",
  microsite: "Microsite",
  service: "Service",
};

const ORG_REF = "0192f0a1-7c3d-7e21-a001-0000000000a1";

const INVOICES: Record<string, InvoiceDetailData> = {
  "0192f0b1-7c3d-7e21-d001-0000000000d1": {
    invoiceId: "0192f0b1-7c3d-7e21-d001-0000000000d1",
    humanRef: "INV-P-2026-000042",
    orgRef: ORG_REF,
    purpose: "subscription",
    amount: 8000,
    currency: "BDT",
    status: "paid",
    payments: [{ gateway: "bKash", gatewayRef: "BKS-8842013", status: "succeeded" }],
  },
  "0192f0b1-7c3d-7e21-d002-0000000000d2": {
    invoiceId: "0192f0b1-7c3d-7e21-d002-0000000000d2",
    humanRef: "INV-P-2026-000051",
    orgRef: ORG_REF,
    purpose: "advertising",
    amount: 2500,
    currency: "BDT",
    status: "issued",
    payments: [],
  },
  "0192f0b1-7c3d-7e21-d003-0000000000d3": {
    invoiceId: "0192f0b1-7c3d-7e21-d003-0000000000d3",
    humanRef: "INV-P-2026-000038",
    orgRef: ORG_REF,
    purpose: "lead_package",
    amount: 3000,
    currency: "BDT",
    status: "paid",
    payments: [{ gateway: "Nagad", gatewayRef: "NGD-5510298", status: "succeeded" }],
  },
  "0192f0b1-7c3d-7e21-d004-0000000000d4": {
    invoiceId: "0192f0b1-7c3d-7e21-d004-0000000000d4",
    humanRef: "INV-P-2026-000029",
    orgRef: ORG_REF,
    purpose: "subscription",
    amount: 8000,
    currency: "BDT",
    status: "paid",
    payments: [{ gateway: "Card", gatewayRef: "CRD-1029384", status: "succeeded" }],
  },
  "0192f0b1-7c3d-7e21-d005-0000000000d5": {
    invoiceId: "0192f0b1-7c3d-7e21-d005-0000000000d5",
    humanRef: "INV-P-2026-000020",
    orgRef: ORG_REF,
    purpose: "subscription",
    amount: 8000,
    currency: "BDT",
    status: "overdue",
    payments: [{ gateway: "bKash", gatewayRef: "BKS-7731900", status: "failed" }],
  },
};

export function getInvoice(invoiceId: string): InvoiceDetailData | undefined {
  return INVOICES[invoiceId];
}
