// Buyer Workspace — frozen-state → PRESENTATION display mapping.
//
// The kit `status-chip` (Doc-7B BR3) deliberately INVENTS NO LABEL: the surface passes the display
// `label` it derived from the contract, plus a presentation `tone`. This module is exactly that surface
// derivation for the buyer leg — it maps each VERBATIM frozen Doc-4M / Doc-2 §3.5 state value to a
// human-readable label + a `StatusTone`. It coins no state and re-ranks/decides nothing (Inv #9, R6).
//
// Labels are presentation strings (title-cased phrasing); the underlying state KEYS are the frozen
// values from `view-models.ts`. Adding a state here without it existing in the frozen union is forbidden.

import type { StatusTone } from "@/frontend/components/status-chip";
import type {
  RfqState,
  QuotationState,
  EngagementState,
  PaymentStatus,
  TradeInvoiceStatus,
  PrivateVendorLinkStatus,
  BuyerVendorStatus,
} from "./view-models";

export interface StateDisplay {
  label: string;
  tone: StatusTone;
}

/** RFQ state → label + tone. Tone is a neutral presentation cue (never a "good/bad" judgement of a vendor). */
const RFQ_STATE_DISPLAY: Record<RfqState, StateDisplay> = {
  draft: { label: "Draft", tone: "neutral" },
  pending_internal_approval: { label: "Pending approval", tone: "warning" },
  submitted: { label: "Submitted", tone: "info" },
  under_review: { label: "Under review", tone: "info" },
  matching: { label: "Matching", tone: "info" },
  vendors_notified: { label: "Vendors notified", tone: "info" },
  quotations_received: { label: "Quotations received", tone: "brand" },
  buyer_reviewing: { label: "Reviewing", tone: "brand" },
  shortlisted: { label: "Shortlisted", tone: "brand" },
  closed_won: { label: "Awarded", tone: "success" },
  closed_lost: { label: "Closed (lost)", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

/**
 * Quotation state → label + tone. `not_selected` is rendered uniformly and NON-PENALIZINGLY (Doc-3 §9.5):
 * neutral tone, never a "rejected/loser" cue — a vendor must never learn it "lost".
 */
const QUOTATION_STATE_DISPLAY: Record<QuotationState, StateDisplay> = {
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "Submitted", tone: "info" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
  shortlisted: { label: "Shortlisted", tone: "brand" },
  selected: { label: "Selected", tone: "success" },
  not_selected: { label: "Not selected", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
};

/**
 * Engagement state → label + tone — the pinned contract-authority set only (Doc-4F §F5 / Doc-2 §3.5).
 * CARRIED FLAG-AND-HALT (§0.1): the Doc-4M divergence (`active/disputed/terminated`) is intentionally
 * absent here pending Board reconciliation; do not add those keys without it.
 */
const ENGAGEMENT_STATE_DISPLAY: Record<EngagementState, StateDisplay> = {
  open: { label: "Open", tone: "info" },
  in_delivery: { label: "In delivery", tone: "brand" },
  completed: { label: "Completed", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
};

export function rfqStateDisplay(state: RfqState): StateDisplay {
  return RFQ_STATE_DISPLAY[state];
}

export function quotationStateDisplay(state: QuotationState): StateDisplay {
  return QUOTATION_STATE_DISPLAY[state];
}

export function engagementStateDisplay(state: EngagementState): StateDisplay {
  return ENGAGEMENT_STATE_DISPLAY[state];
}

/**
 * Payment-record status → label + tone (Doc-4F §F5.6 / Doc-2 §10.5 `recorded → confirmed`). Neutral cues:
 * `recorded` is an entered-but-unconfirmed record, `confirmed` is the counterparty-acknowledged record —
 * never a funds-movement signal (records only, DF-6).
 */
const PAYMENT_STATUS_DISPLAY: Record<PaymentStatus, StateDisplay> = {
  recorded: { label: "Recorded", tone: "info" },
  confirmed: { label: "Confirmed", tone: "success" },
};

export function paymentStatusDisplay(status: PaymentStatus): StateDisplay {
  return PAYMENT_STATUS_DISPLAY[status];
}

/**
 * Trade-invoice status → label + tone (Doc-4F §F5.5 / Doc-2 §10.5 `issued → partially_paid → paid |
 * disputed | cancelled`). Neutral cues — `disputed` is `warning` (an attention state, not a vendor
 * judgement); the platform records the obligation, never moves funds (DF-6). NO "approved" status exists.
 */
const TRADE_INVOICE_STATUS_DISPLAY: Record<TradeInvoiceStatus, StateDisplay> = {
  issued: { label: "Issued", tone: "info" },
  partially_paid: { label: "Partially paid", tone: "brand" },
  paid: { label: "Paid", tone: "success" },
  disputed: { label: "Disputed", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export function tradeInvoiceStatusDisplay(status: TradeInvoiceStatus): StateDisplay {
  return TRADE_INVOICE_STATUS_DISPLAY[status];
}

/**
 * Private-vendor LINK status → label + tone (Doc-4F §F4 / Doc-2 §10.5 `none → suggested → linked`). This
 * is the private↔public profile link state ONLY — never the buyer's CRM approval status (which the list
 * read does not project; blacklist stays undetectable, Inv #11). Neutral cues.
 */
const PRIVATE_VENDOR_LINK_STATUS_DISPLAY: Record<PrivateVendorLinkStatus, StateDisplay> = {
  none: { label: "Not linked", tone: "neutral" },
  suggested: { label: "Link suggested", tone: "info" },
  linked: { label: "Linked", tone: "success" },
};

export function privateVendorLinkStatusDisplay(status: PrivateVendorLinkStatus): StateDisplay {
  return PRIVATE_VENDOR_LINK_STATUS_DISPLAY[status];
}

/**
 * Buyer→vendor CRM status → label + tone (Doc-4F §F4.5 / Doc-2 §10.5 `approved | conditional | blacklisted`,
 * + `none`). BUYER-PRIVATE (Inv #11): shown ONLY on the owning buyer's own CRM detail — never vendor-facing,
 * never a platform-score input. `blacklisted` uses the danger tone for the OWNING buyer's clarity only; it
 * stays undetectable to the vendor (§7.5). `none` = no open status.
 */
const BUYER_VENDOR_STATUS_DISPLAY: Record<BuyerVendorStatus, StateDisplay> = {
  approved: { label: "Approved", tone: "success" },
  conditional: { label: "Conditional", tone: "warning" },
  blacklisted: { label: "Blacklisted", tone: "danger" },
  none: { label: "No status", tone: "neutral" },
};

export function buyerVendorStatusDisplay(status: BuyerVendorStatus): StateDisplay {
  return BUYER_VENDOR_STATUS_DISPLAY[status];
}
