// P-BUY-16 Buyer Clarifications — PRESENTATION VIEW-MODEL (placeholder scope).
//
// GOVERNANCE BOUNDARY (Board-ruled 2026-07-01 — "vendor-consistent placeholder"):
// The clarification thread itself is the M6-SINGLE-OWNED `conversation-thread` embedded component
// (Doc-7B §5 · Doc-5H · CHK-7-040), which is DEFERRED/NOT BUILT. The frozen corpus explicitly forbids
// hand-building a thread node (companion §1263), so THIS milestone renders only the buyer-owned page
// HOST + a non-disclosure-safe placeholder region — it does NOT render messages/attachments (those mount
// from the M6 component when it lands, mirroring `vendor/rfq/clarifications-section.tsx`).
//
// Because nothing about the thread CONTENT is rendered here, this view-model carries only the buyer-owned
// page context (the RFQ identity for the breadcrumb). No message, participant, or attachment shape is
// modeled — that is M6's contract (Doc-5H), not ours to coin.
//
// SCOPE: presentation only — no fetch, no mutation, no business logic (Content ≠ Presentation, Inv #9).

export interface ClarificationsData {
  /** Opaque RFQ id (the back/breadcrumb route; never a leaf ref when not-visible). */
  rfqId: string;
  /** Parent RFQ year-scoped human ref ("RFQ-2026-000123") — DISPLAY ONLY (breadcrumb label); routes carry
   *  the opaque `rfqId`. Optional; the breadcrumb falls back to a generic "RFQ" when absent. */
  humanRef?: string;
}
