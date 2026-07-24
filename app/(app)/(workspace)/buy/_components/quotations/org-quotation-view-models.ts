// Buyer Workspace — Received Quotes (cross-RFQ) PRESENTATION VIEW-MODELS.
//
// ────────────────────────────────────────────────────────────────────────────────────────────────
// GOVERNANCE — READ THIS BEFORE EXTENDING
// ────────────────────────────────────────────────────────────────────────────────────────────────
// There is NO frozen cross-RFQ quotation list read. Quotations are readable only per-RFQ
// (`list_quotations_for_rfq`, P-BUY-09) or per-document (`get_quotation`, P-BUY-14). The buyer-org-wide
// aggregate is the OPEN escalation `ESC-BUY-QUOTES-LIST` (esc_registry.md; resolution path = additive
// Doc-5E patch, human Board — BOARD-PACKET-BUYER-FE-CONTRACT-GAPS_v1.0 row 1, still unruled).
//
// These are therefore PRESENTATION shapes behind an explicit adapter seam — they are NOT a frozen DTO,
// they MINT NOTHING, and the proposed contract name is carried by POINTER in a comment only (never as an
// authoritative identifier). At wiring the server layer maps the minted read onto this shape.
//
// LOAD-BEARING RULES:
//  • NO NEW DISCLOSURE — every field below is already disclosed on a built P-BUY-09/14/15 surface. This
//    aggregate widens nothing; it only collects.
//  • R7 / GI-12 — counts (`stateCounts`, `perStateCounts`) are SERVER-DERIVED over the whole org scope,
//    never client-computed from the rendered (filtered/paginated) rows. A client-computed count could also
//    leak the size of the withheld set.
//  • R6 / GI-04 — `items` arrive in the CONTRACT-GOVERNED order and the UI never re-ranks them. There is
//    deliberately no score/rank/winner/best-value field.
//  • R5 / Inv #11 — the read is visibility-gated server-side: only quotations DISCLOSED to this buyer org
//    appear. A suppressed row is indistinguishable from "no such quotation"; nothing here may hint that a
//    vendor was excluded, deferred or blacklisted.
//  • Doc-4M §5.3 — `state` is the verbatim frozen quotation lifecycle. The buyer never sees vendor `draft`.
//
// SCOPE: presentation only — no fetch, no mutation, no business logic (Content ≠ Presentation, Inv #9).

import type { QuotationState, MoneyValue } from "../view-models";

/**
 * One row of the cross-RFQ Received Quotes list. Carries its owning RFQ's identity so the row can link
 * back into the built per-RFQ surfaces (P-BUY-14 detail · P-BUY-15 comparison) — the aggregate is an
 * accelerator into existing pages, never a replacement for them.
 */
export interface BuyerOrgQuotationItem {
  /** Opaque quotation id — the detail route identity (never a human ref). */
  id: string;
  /** Year-scoped human ref ("QTN-2026-000602") — DISPLAY ONLY; absent when the projection omits it. */
  humanRef?: string;
  /** Opaque owning-RFQ id — the comparison/detail route identity. */
  rfqId: string;
  /** Owning RFQ year-scoped human ref — display only. */
  rfqHumanRef: string;
  /** Owning RFQ title — display only. */
  rfqTitle: string;
  /** Vendor display name exactly as the disclosed projection carries it. */
  vendorName: string;
  /** Frozen Doc-4M §5.3 quotation state (rendered non-penalizingly). */
  state: QuotationState;
  /** Quoted amount disclosed to the buyer (Doc-3 §9.1). Absent ⇒ not disclosed / sealed — never zero. */
  amount?: MoneyValue;
  /** Validity window end (ISO-8601), formatted at the render site. */
  validUntil?: string;
  /** ISO-8601 submission instant of this immutable version (Inv #8), formatted at the render site. */
  submittedAt?: string;
  /**
   * SERVER-DERIVED validity-window flag: the quotation is in an open state AND its validity ends within
   * the server's expiry-notice window. Presentation renders it; it never recomputes it (R7). This is
   * validity arithmetic only — never a judgement about the vendor.
   */
  expiringSoon?: boolean;
  /**
   * SERVER-DERIVED: the owning RFQ has at least `MIN_COMPARE` disclosed quotations, so a comparison is
   * meaningful. Drives whether the row offers a Compare affordance. Eligibility is a server fact — the
   * client never decides it (GI-10).
   */
  comparable?: boolean;
}

/**
 * The Received Quotes summary tiles. SERVER-COMPUTED over the buyer-org scope (R7) — these are contract
 * projections, not client analytics, and they must never be re-derived from the filtered rows on screen.
 * Each is a count over the frozen state set plus validity arithmetic; none is an invented metric.
 */
export interface QuotationStateCounts {
  /** `submitted` — received and not yet moved on by the buyer. */
  awaitingReview: number;
  /** `shortlisted` — carried into comparison/evaluation. */
  shortlisted: number;
  /** Open quotations whose validity ends inside the server's expiry-notice window. */
  expiringSoon: number;
  /** `selected` ∪ `not_selected` ∪ `withdrawn` ∪ `expired` — no longer awaiting the buyer. */
  concluded: number;
}

/** One RFQ facet for the list's RFQ filter — server-supplied so the client invents no facet set. */
export interface QuotationRfqFacet {
  rfqId: string;
  humanRef: string;
  title: string;
}

/**
 * The Received Quotes list view-model.
 *
 * `null` from the reader means the READ FAILED (an unavailable integration or a transport error) and drives
 * the recoverable error state. It does NOT mean "no quotations" — genuine emptiness is `items: []` with
 * zeroed counts, which drives the first-run empty state. Keeping those two distinct is a hard requirement:
 * an empty list must read as "awaiting vendor responses", never as an error, and never as exclusion (Inv #11).
 */
export interface BuyerOrgQuotationListData {
  /** Rows in the contract-governed order — never re-ranked by the UI (R6 / GI-04). */
  items: BuyerOrgQuotationItem[];
  /** Server-computed tile figures over the whole org scope (R7). */
  stateCounts: QuotationStateCounts;
  /** Server-computed per-state counts backing the filter chips (R7) — only states actually present. */
  perStateCounts: Partial<Record<QuotationState, number>>;
  /** Server-supplied RFQ filter facets, in the same governed order as the rows. */
  rfqFacets: QuotationRfqFacet[];
  /** Opaque forward cursor (GI-03); absent/null ⇒ last page. Offset pagers are forbidden. */
  nextCursor?: string | null;
  /** Contract-provided total (optional; never client-computed — GI-12). */
  total?: number;
}

/**
 * One RFQ option in the Compare Quotes picker.
 *
 * Comparison is ALWAYS scoped to a single RFQ: quotations answer different specifications, so a cross-RFQ
 * grid is not comparable and would sit one step from the cross-vendor leaderboard the corpus forbids
 * everywhere (R6). The picker therefore selects an RFQ; it never mixes.
 *
 * `eligible` and `ineligibleReason` are SERVER facts (GI-10) — the client renders them and decides nothing.
 */
export interface ComparableRfqOption {
  rfqId: string;
  humanRef: string;
  title: string;
  /** Count of disclosed quotations on this RFQ (server-supplied; never a count of withheld ones). */
  quotationCount: number;
  /** Server-derived: at least `MIN_COMPARE` disclosed quotations exist. */
  eligible: boolean;
  /** Server-supplied plain reason when not eligible — never a client-invented explanation. */
  ineligibleReason?: string;
}
