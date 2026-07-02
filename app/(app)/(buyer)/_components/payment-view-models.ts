// P-BUY-22 Buyer Payments — view-model. PRESENTATION-ONLY.
//
// A payment record is a child of a Procurement Engagement (`payment_records` → `engagements`, optionally
// → a `trade_invoice`; Doc-4F §F5.6 / Doc-2 §10.5). It is written via `ops.record_payment.v1` (create,
// slug `can_record_payments`) and `ops.confirm_payment.v1` (advance `recorded → confirmed`, DISTINCT slug
// `can_approve_payment`). This view-model grounds STRICTLY in the frozen `payment_records` field set:
//   `amount`, `currency`, `paid_at`, `method_note`, `status enum<recorded|confirmed>` (Doc-2 §10.5).
// Nothing beyond those fields is coined (Content ≠ Presentation, Inv #9).
//
// GOVERNANCE:
//   • MONEY BOUNDARY (DF-6 / R8): a payment record is a RECORD ONLY — the platform never holds, escrows,
//     or moves funds. No pay/settle affordance exists anywhere; recording/confirming is bookkeeping.
//   • `can_approve_payment` (confirm) is a DISTINCT slug from `can_record_payments` (record) — NEVER
//     collapsed (Doc-4F §F5.6 / Doc-2 §7). The two affordances gate on separate flags.
//   • State machine `recorded → confirmed` ONLY (Doc-2 §10.5) — confirm offered solely on `recorded` rows.
//   • Party-scoped (Doc-4F §F5.6 / H.9): a non-party caller collapses to NOT_FOUND, byte-identical to
//     genuine absence (Inv #11 / GI-12). `engagement_id` / `payment_record_id` are OPAQUE (Inv #5).
//   • READ GAP: no `list_payment_records` read is frozen (the ENG-03 enumeration-gap class — only single
//     child reads exist). The list here is a presentation stand-in over the frozen field shape; at wiring
//     the records resolve via the engagement's child read, never a coined list contract.

import type { MoneyValue, PaymentStatus } from "./view-models";

/** One `payment_records` row — the frozen field set only (Doc-2 §10.5). */
export interface PaymentRecordItem {
  /** `payment_record_id` — opaque id (Inv #5); not a routing target (no payment detail page). */
  id: string;
  /** `amount` + `currency` as one value — a RECORDED figure only (DF-6, no funds move). */
  amount: MoneyValue;
  /** `paid_at` — ISO-8601 date the payment was made (formatted at the render site). */
  paidAt?: string;
  /** `method_note` — free-text note on how it was paid (off-platform; the platform moves no funds). */
  methodNote?: string;
  /** `status` — the frozen `recorded | confirmed` machine value. */
  status: PaymentStatus;
}

export interface PaymentsData {
  /** `engagement_id` — the parent engagement (OPAQUE; route ancestor for breadcrumb/back). Inv #5. */
  engagementId: string;
  /** `human_ref` of the parent engagement — display label for the breadcrumb only (routes use the id). */
  engagementRef?: string;
  /** The engagement's payment records, in contract order (never re-ranked, GI-04). */
  items: PaymentRecordItem[];
  /**
   * `can_record_payments` (Doc-2 §7) — gates the "Record payment" affordance in PRESENTATION only; the
   * server enforces. Audience flag, not an authorization source.
   */
  canRecordPayments?: boolean;
  /**
   * `can_approve_payment` (Doc-2 §7) — DISTINCT slug, gates the per-row "Confirm" affordance; NEVER
   * collapsed into `can_record_payments`. Presentation-only; the server enforces.
   */
  canApprovePayment?: boolean;
}
