// P-BUY-17 Buyer Award (`T-WIZARD`) — PRESENTATION VIEW-MODEL.
//
// The server layer MAPS the wired `rfq.award_rfq.v1` (Doc-4E §E8.4) leg onto this at wiring (Wave 4; PARKED).
// PRESENTATION-ONLY: no fetch, no mutation, no submit (Content ≠ Presentation, Inv #9).
//
// GOVERNANCE (R6 / Inv #12 — the award is the deliberate counterpart to the descriptive comparison):
//  • The buyer EXPLICITLY selects EXACTLY ONE shortlisted quotation — `selected_quotation_id` is 1 (1:1,
//    Doc-2 §5.4 single-award cardinality). NO auto-winner, NO recommended/best cue, NO ranking. Candidates
//    render in the System-persisted order and are NEVER re-ranked (GI-04).
//  • Award is only over the CURRENT SHORTLIST (Doc-3 §9.4; award of a non-shortlisted quotation is foreclosed).
//  • ORG award-threshold: a value above the org threshold requires Director/Owner approval (Doc-3 §9.4) —
//    surfaced as a notice; the SERVER enforces (UI is UX only; `can_award_rfq`, not delegation-eligible).
//  • Award is IRREVERSIBLE and drives `shortlisted → closed_won`; split sourcing = `reissue_rfq`, never
//    multi-award. The engagement is created by Operations on `RFQClosedWon` (this page authors nothing).

import type { QuotationState, MoneyValue } from "../view-models";

/** One shortlisted quotation the buyer may award (the persisted shortlist set, in System order). */
export interface AwardCandidate {
  /** Opaque quotation id (the award target; never a human ref). */
  quotationId: string;
  vendorName: string;
  /** Frozen Doc-4M quotation state (shortlisted; rendered non-penalizingly via `quotationStateDisplay`). */
  state: QuotationState;
  /** Quoted value disclosed to the buyer (Doc-3 §9.1). */
  amount?: MoneyValue;
  /** Delivery summary (display-ready). */
  delivery?: string;
  /** Quotation validity end (ISO-8601), formatted at the render site. */
  validUntil?: string;
}

/** The P-BUY-17 view-model. `null` ⇒ not-found ≡ genuine absence (byte-identical). Empty `candidates` ⇒
 *  "shortlist first" (the buyer shortlists before awarding — the wizard has nothing to award yet). */
export interface AwardData {
  rfqId: string;
  /** Parent RFQ human ref (breadcrumb label); routes carry the opaque `rfqId` (Inv #5). */
  humanRef?: string;
  /** SHORTLISTED quotations in the System-persisted order — NEVER re-ranked (R6/GI-04). */
  candidates: AwardCandidate[];
  /** Presentation selection — EXACTLY ONE at award (1:1). */
  selectedQuotationId?: string;
  /** Org award-threshold hint (Doc-3 §9.4): above threshold ⇒ Director/Owner approval required. */
  aboveThreshold?: boolean;
  /** Wizard step: 0 = select a vendor · 1 = review & confirm. Presentation only. */
  step?: number;
}
