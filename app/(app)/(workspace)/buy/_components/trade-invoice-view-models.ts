// P-BUY-23 Buyer Trade invoice review — view-model. PRESENTATION-ONLY.
//
// A trade invoice is a child of a Procurement Engagement (`trade_invoices` → `engagements`; Doc-4F §F5.5 /
// Doc-2 §10.5). It is an M4 INTER-PARTY commercial record — it is **NOT** `billing.platform_invoices`
// (M7), and it carries NO funds (DF-6 strict separation). Written via `ops.issue_trade_invoice.v1` /
// `ops.update_trade_invoice_status.v1` (slug `can_record_payments`). This view-model grounds STRICTLY in
// the frozen `trade_invoices` field set: `human_ref` (`INV-…`), `amount`, `currency`, `status`, `due_date`
// (Doc-2 §10.5). Nothing beyond those is coined (Content ≠ Presentation, Inv #9).
//
// SHORTHAND NOTE: `page_inventory` cites `approve_trade_invoice` / `get_invoice` — these are LABELS, not
// frozen contract IDs. The real writes are `issue_trade_invoice` / `update_trade_invoice_status`, and the
// machine has NO "approved" status (`issued → partially_paid → paid | disputed | cancelled` only). No
// approve action/status is coined; the buyer's review transition is a `disputed` raise (per the machine).
//
// GOVERNANCE:
//   • MONEY BOUNDARY (DF-6 / R8): a trade invoice is a RECORD only — ≠ platform invoice, no funds moved.
//     `partially_paid`/`paid` reflect separately-recorded payments (P-BUY-22), never a transfer here.
//   • `disputed` is a trade-invoice STATUS (not an engagement state); raising it emits `DisputeRecorded`
//     (a Trust input) at the server — the UI offers only the parked affordance, computes no score.
//   • Party-scoped (H.9): a non-party caller collapses to NOT_FOUND, byte-identical to genuine absence
//     (Inv #11 / GI-12). `engagement_id` / `trade_invoice_id` are OPAQUE (Inv #5); `human_ref` display-only.
//   • READ GAP: no dedicated trade-invoice read projects this field set (the ENG-03 enumeration-gap class);
//     the presentation resolves it from the frozen field shape, never a coined `get_invoice` contract.

import type { MoneyValue, TradeInvoiceStatus } from "./view-models";

export interface TradeInvoiceData {
  /** `engagement_id` — parent engagement (OPAQUE; route ancestor for breadcrumb/back). Inv #5. */
  engagementId: string;
  /** `human_ref` of the parent engagement — display label for the breadcrumb only. */
  engagementRef?: string;
  /** `trade_invoice_id` — the invoice's OPAQUE id (Inv #5). */
  id: string;
  /** `human_ref` — year-scoped display ref (e.g. `INV-2026-000045`). Display-only. */
  humanRef: string;
  /** `amount` + `currency` as one value — a RECORDED obligation only (DF-6; no funds move). */
  amount: MoneyValue;
  /** `status` — the frozen `trade_invoices` machine value. */
  status: TradeInvoiceStatus;
  /** `due_date` — ISO-8601 date the invoice is due (formatted at the render site). */
  dueDate?: string;
  /**
   * `can_record_payments` (Doc-2 §7 / §F5.5) — gates the status-change ("Raise dispute") affordance in
   * PRESENTATION only; the server enforces. Audience flag, not an authorization source.
   */
  canRecordPayments?: boolean;
}
