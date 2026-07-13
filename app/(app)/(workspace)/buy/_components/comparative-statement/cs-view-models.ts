// Comparative Statement (CS) — PRESENTATION VIEW-MODEL (WP-2; freeze: COMPARE_SHEET_UX_FREEZE
// header v1.0 §3 "CS Document Standard" + §4 conformance routing). NOT a frozen DTO and coins
// nothing — the CS is a generated procurement document derived from the buyer's Workspace
// selection; it is not an independent business entity until the Board approves ESC-CS-DOCKIND.
//
// GOVERNANCE (load-bearing):
//  • R6 / Doc-3 §9.1 FIXED — the platform never recommends/ranks-to-winner. Every evaluative
//    field lives under `buyerEvaluation` with the literal `buyerAuthored: true` mark; the system
//    supplies ARITHMETIC FACTS ONLY under `computed` (adapter/server-derived — R7, never
//    client-computed).
//  • MAJOR-2 / MINOR-1 (owner-adjudicated) — `draftReference` is a single swappable field
//    ("Draft Reference", mock-era label only; NO `CS-` series exists until ESC-CS-REF). It
//    auto-transitions to the official reference on approval with no layout change.
//  • §3.4 — signature blocks are PRINTED (wet ink); no digital signature is captured or modelled.
//  • Line items are MOCK until the ESC-CS-LINEITEMS dev-doc schema is ratified (the frozen
//    `price_breakdown_jsonb`/`content_jsonb` internal schemas are dev-doc scope).
//  • Letterhead is MOCK until ESC-CS-LETTERHEAD (buyer branding does not exist in the corpus).

import type { MoneyValue } from "@/frontend/components/format";

/** One participating vendor column, in the System-supplied statement order (never re-ranked). */
export interface CsVendor {
  /** Opaque quotation id (identity only; never rendered as a route on the document). */
  quotationId: string;
  vendorName: string;
  /** Year-scoped quotation human ref ("QTN-2026-000587") — display only. */
  quotationRef?: string;
  /** Received date (ISO-8601), formatted at the render site. */
  receivedAt?: string;
  /** Vendor's own delivery offer, display-ready ("6 weeks from PO"). */
  deliveryOffer?: string;
}

/** One vendor's cells on one line item. Sealed cells render the seal, never a blank. */
export interface CsLineCell {
  unitPrice?: MoneyValue;
  totalPrice?: MoneyValue;
  sealed?: boolean;
}

/** One CS line item; `cells` is index-aligned with `ComparativeStatementData.vendors`. */
export interface CsLineItem {
  sl: number;
  description: string;
  specification?: string;
  unit: string;
  quantity: number;
  cells: CsLineCell[];
  /** Arithmetic fact (adapter-computed): the lowest quoted unit price across non-sealed cells. */
  lowestUnitPrice?: MoneyValue;
  /** Arithmetic fact (adapter-computed): vendor indexes holding that lowest unit price. */
  lowestVendorIdx?: number[];
}

/** Mock letterhead block — real buyer branding is gated on ESC-CS-LETTERHEAD. */
export interface CsLetterhead {
  name: string;
  tagline?: string;
  addressLine: string;
  contactLine?: string;
  registrationLine?: string;
}

/** Arithmetic facts — computed in the adapter (the stand-in server), NEVER in components (R7). */
export interface CsComputed {
  /** Per-vendor Σ(line totals), index-aligned with `vendors`. */
  subTotals: MoneyValue[];
  vatRatePct: number;
  vatAmounts: MoneyValue[];
  grandTotals: MoneyValue[];
  /** Vendor index with the lowest grand total (arithmetic identification, disclosed as such). */
  lowestVendorIdx: number;
  secondLowestVendorIdx?: number;
  differenceAmount?: MoneyValue;
  /** Display-ready percentage ("4.09%"). */
  differencePct?: string;
  totalItems: number;
  /** Display-ready delivery comparison rows (server-derived; qualitative offers stay qualitative). */
  deliveryComparison: { label: string; value: string }[];
}

/**
 * Buyer-authored evaluation content (R6: the buyer's own record — the platform generates none of
 * it). Rendered with a visible provenance mark on every section.
 */
export interface CsBuyerEvaluation {
  /** Literal provenance flag — load-bearing; the document renders its meaning. */
  buyerAuthored: true;
  executiveSummary?: string;
  /**
   * The Buyer Evaluation Summary order (owner-adjudicated MAJOR-3 label — never "Vendor
   * Ranking"): vendor indexes in the buyer's confirmed order + the buyer's technical note.
   */
  evaluationOrder: { vendorIdx: number; technical?: string }[];
  technicalSummary?: { fullyCompliant: number; partiallyCompliant: number; nonCompliant: number };
  recommendedVendorIdx?: number;
  reasons?: string[];
  risk?: string;
  commercialAdvantage?: string;
  remarks?: string;
}

/** A printed signature block (wet ink on the printed document — §3.4; nothing captured). */
export interface CsApprovalBlock {
  role: string;
  name?: string;
  title?: string;
}

/**
 * The CS view-model. `null` drives the byte-identical not-found (Inv #11 / GI-12) — an unknown or
 * undisclosed RFQ id and a pre-first-quotation RFQ are indistinguishable genuine absences.
 */
export interface ComparativeStatementData {
  rfqId: string;
  /** Parent RFQ human ref ("RFQ-2026-000123") — display only; routes carry the opaque id. */
  humanRef?: string;
  /**
   * Temporary mock-era reference label value (owner-adjudicated MAJOR-2/MINOR-1): derived from
   * the RFQ ref, marked pending governance. Swaps to the official reference on ESC-CS-REF.
   */
  draftReference: string;
  rfqTitle: string;
  project?: string;
  deliveryLocation?: string;
  /** Statement issue date (ISO-8601), formatted at the render site. */
  issueDate: string;
  currency: string;
  preparedByLabel: string;
  letterhead: CsLetterhead;
  /** 2–5 vendors (W-1: the Workspace selection is the CS vendor set), statement order. */
  vendors: CsVendor[];
  items: CsLineItem[];
  computed: CsComputed;
  buyerEvaluation?: CsBuyerEvaluation;
  approvals: CsApprovalBlock[];
}
