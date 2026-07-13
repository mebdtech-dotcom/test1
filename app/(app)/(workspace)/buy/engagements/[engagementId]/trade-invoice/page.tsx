// P-BUY-23 Buyer Trade invoice review route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. A
// trade invoice is a child of a Procurement Engagement (Doc-4F §F5.5 `trade_invoices`), reached
// CONTEXTUALLY from the parent engagement. The dynamic segment is the OPAQUE engagement id (Inv #5).
//
// PRESENTATION-ONLY (this milestone): the writes `ops.issue_trade_invoice.v1` /
// `ops.update_trade_invoice_status.v1` (Doc-4F §F5.5) are NOT wired (PARKED — Wave 4), and no dedicated
// trade-invoice read projects this field set (the ENG-03 enumeration-gap class). A realistic mock stands
// in over the frozen `trade_invoices` field shape; at wiring the invoice resolves via the engagement's
// child read, never a coined `get_invoice` contract. A trade invoice is NOT a platform invoice (DF-6).
//
// NON-DISCLOSURE (Inv #11 / GI-12 · H.9): an unknown/absent OR non-party engagement resolves to the SAME
// `notFound()` → the co-located `not-found.tsx` renders a byte-identical "not available" page.

import { notFound } from "next/navigation";
import { TradeInvoiceView } from "./trade-invoice-view";
import type { TradeInvoiceData } from "../../../_components/trade-invoice-view-models";

export const metadata = {
  title: "Trade invoice",
};

// Realistic industrial-procurement MOCK keyed on opaque engagement id — only the frozen `trade_invoices`
// fields (human_ref / amount+currency / status / due_date). `canRecordPayments` mirrors the Doc-2 §7 slug;
// the server enforces at wiring. No funds are moved (DF-6); this is NOT a billing.platform_invoices row.
const MOCK_TRADE_INVOICES: Record<string, TradeInvoiceData> = {
  eng_02: {
    engagementId: "eng_02",
    engagementRef: "ENG-2026-000121",
    id: "inv_01",
    humanRef: "INV-2026-000045",
    amount: { amount: 2200000, currency: "BDT" },
    status: "issued",
    dueDate: "2026-07-20",
    canRecordPayments: true,
  },
  eng_01: {
    engagementId: "eng_01",
    engagementRef: "ENG-2026-000124",
    id: "inv_02",
    humanRef: "INV-2026-000039",
    amount: { amount: 1500000, currency: "BDT" },
    status: "disputed",
    dueDate: "2026-07-10",
    canRecordPayments: true,
  },
  eng_04: {
    engagementId: "eng_04",
    engagementRef: "ENG-2026-000112",
    id: "inv_03",
    humanRef: "INV-2026-000028",
    amount: { amount: 985000, currency: "BDT" },
    status: "paid",
    dueDate: "2026-06-25",
    canRecordPayments: true,
  },
};

export default async function BuyerTradeInvoicePage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const data = MOCK_TRADE_INVOICES[engagementId];
  // Unknown/absent OR non-party ⇒ identical collapse (H.9). notFound() → byte-identical not-found.tsx.
  if (!data) {
    notFound();
  }
  return <TradeInvoiceView data={data} />;
}
