// P-BUY-18 Buyer "Close RFQ as lost" — view-model + option list. PRESENTATION-ONLY.
//
// Grounds strictly in the FROZEN `rfq.close_lost_rfq` request (Doc-4E PassB Part-5 §E8.5): `rfq_id`,
// `expected_version_no`, `reason_code` (POLICY enum, below), `reason_text` (required IFF
// `reason_code = other`). AUTHZ `can_approve_vendor_selection` / `can_award_rfq`. Transition
// `shortlisted → closed_lost`; open quotations move to `not_selected` (Part-5-owned, NOT modeled here).
//
// GOVERNANCE — NON-PENALIZING (Doc-3 §9.5 · Inv #11 / GI-12): closure is uniform and carries NO
// vendor-visible penalty signal. Copy must never imply a vendor "lost"/"was rejected"; the buyer never
// sees a per-vendor outcome on this page. No score is touched (firewall — signals owned by M5).

/** Frozen POLICY reason codes — VERBATIM keys (Doc-4E §E8.5). Labels are presentation-only strings. */
export const CLOSE_LOST_REASON_CODES = [
  "budget_dropped",
  "requirement_changed",
  "no_suitable_quotes",
  "sourced_off_platform",
  "other",
] as const;

export type CloseLostReasonCode = (typeof CLOSE_LOST_REASON_CODES)[number];

/** Display option list — frozen `value` keys, human-readable labels only (coins no state). */
export const CLOSE_LOST_REASON_OPTIONS: { value: CloseLostReasonCode; label: string }[] = [
  { value: "budget_dropped", label: "Budget dropped" },
  { value: "requirement_changed", label: "Requirement changed" },
  { value: "no_suitable_quotes", label: "No suitable quotations" },
  { value: "sourced_off_platform", label: "Sourced off platform" },
  { value: "other", label: "Other" },
];

/** The reason code whose free-text detail is REQUIRED (frozen: `reason_text` required iff `other`). */
export const CLOSE_LOST_REASON_TEXT_REQUIRED_FOR: CloseLostReasonCode = "other";

export interface CloseLostData {
  /** Opaque RFQ id (Inv #5) — routing/display only. */
  rfqId: string;
  /** Year-scoped human ref for display (Inv #5, display-only). */
  humanRef?: string;
  /** Chosen reason carried from the form step (native GET nav) — undefined ⇒ nothing selected yet. */
  selectedReasonCode?: CloseLostReasonCode;
  /** Free-text detail carried from the form step (presentation only). */
  reasonText?: string;
  /** 0 = form, 1 = review & confirm. Undefined ⇒ 0. */
  step?: number;
}
