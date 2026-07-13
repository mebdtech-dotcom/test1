// P-BUY-12 Buyer Internal approval (Approvals queue) — view-model. PRESENTATION-ONLY.
//
// The approver's queue of RFQs awaiting internal approval. The queue is `rfq.list_rfqs` scoped to
// `state = pending_internal_approval` for the approver's org (own-org; the "assigned to me" chain step is
// Identity-owned ORG config, consumed server-side). The decision writes are `rfq.approve_rfq.v1` /
// `rfq.reject_internal_rfq.v1` (Doc-4E §E4.4). This view-model carries only RFQ-projection display fields
// and coins nothing (Content ≠ Presentation, Inv #9).
//
// GOVERNANCE (load-bearing):
//   • NO AUTO-APPROVE (Doc-3 §1.2 FIXED): approval is always an explicit human act — there is no timeout /
//     silence-approves path. The UI states this and never implies an automatic decision.
//   • Decision = `approve` (→ submitted) or `reject` (→ draft); **reject REQUIRES a reason** (§E4.4). Both
//     writes are PARKED (presentation-only, disabled), gated on `can_approve_rfq` (Doc-2 §7).
//   • Own-org only; the queue is the approver's org's pending RFQs (never cross-tenant). Genuine-empty
//     ("nothing to approve") never implies exclusion. Cursor pagination (GI-03). Opaque `rfq_id` (Inv #5);
//     `human_ref` display-only.

import type { MoneyValue } from "./view-models";

/** One RFQ awaiting internal approval — RFQ projection display fields (all rows are pending_internal_approval). */
export interface ApprovalQueueItem {
  /** `rfq_id` — opaque routing id (Inv #5). */
  id: string;
  /** `human_ref` — year-scoped display ref (e.g. `RFQ-2026-000123`). Display-only. */
  humanRef: string;
  /** RFQ title/summary (display). */
  title: string;
  /** Estimated value the RFQ carries (`{amount, currency}`; BDT default at render). */
  value?: MoneyValue;
  /** ISO-8601 instant the RFQ was submitted for approval (formatted at the render site). */
  submittedAt?: string;
}

export interface ApprovalsData {
  /** RFQs pending the approver's decision, in contract order (never re-ranked, GI-04). */
  items: ApprovalQueueItem[];
  /** `next_page_token` — opaque forward cursor (GI-03). Undefined ⇒ no further page. */
  nextCursor?: string;
  /**
   * `can_approve_rfq` (Doc-2 §7) — gates the Approve/Reject affordances in PRESENTATION only; the server
   * enforces (`check_permission`) + the Identity approval-chain step. Audience flag, not an authz source.
   */
  canApproveRfq?: boolean;
}
