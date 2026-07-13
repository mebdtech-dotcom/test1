// RFQ WORKFLOW — Data-adapter interfaces (the wiring seam).
//
// Every RFQ workflow page consumes data through `RfqWorkflowData` instead of an inline page seed.
// Each method MIRRORS one frozen Doc-5E read (named in its doc comment, BY POINTER) and returns the
// EXISTING presentation view-models — not the frozen DTOs (the server layer maps DTO → view-model
// at wiring, Doc-7C SR5 / GI-02).
//
// TODAY: implemented by the mock adapter (./mock) — a stand-in for the server data layer, serving a
// coherent full-lifecycle fixture universe. Server-derived facts the presentation must never compute
// (counts, facets, permitted-action sets, ordering) are produced INSIDE the adapter, exactly where
// the wired server layer will produce them later (R7 / GI-04 / GI-10).
//
// AT WIRING (Wave 4): replace the export in ../adapters/index.ts with the GI-02 server-side
// implementation (own-org scoped, cursor-paginated, error_class-branching). Pages do not change —
// that is the entire point of this seam. The browser never calls a Doc-5 contract and never sets
// `Iv-Active-Organization` (Inv #5 / Doc-7C SR3): these reads run in Server Components only.
//
// BOUNDARIES: buyer-leg and vendor-leg reads are SEPARATE interfaces — both are M3 (RFQ) surface
// reads, but the vendor leg is grant-scoped/received-only (DP1/BE-1) and the two must never share a
// wired resolver. Post-award data is M4-owned and is NOT served here: the workflow hands off by
// navigation only (Doc-4M M6-1; DP10) — the one M4-shaped value below is the vendor's read-only
// `EngagementHandoffView` pointer.

import type { ComparisonData } from "@/frontend/components/comparison";
import type { ComparativeStatementData } from "../../../(workspace)/buy/_components/comparative-statement";
import type {
  RfqListData,
  RfqDetailData,
} from "../../../(workspace)/buy/_components/rfq-view-models";
import type { RfqPipelineStage } from "../../../(workspace)/buy/_components/view-models";
import type { RfqVersionHistoryData } from "../../../(workspace)/buy/_components/rfq-version-view-models";
import type { RoutingInvitationsData } from "../../../(workspace)/buy/_components/routing-view-models";
import type { AwardData } from "../../../(workspace)/buy/_components/award";
import type { QuotationDetailData } from "../../../(workspace)/buy/_components/quotation-view-models";
import type {
  InboxItemView,
  RfqSnapshotView,
  InvitationView,
  QuotationView,
  QuotaView,
  QuotationBuilderProps,
  EngagementHandoffView,
} from "../../vendor/rfq";
import type { JourneyBucketCount } from "../journey";

/**
 * Buyer-leg reads (own-org scope at wiring; a non-disclosed id resolves to `null` ≡ genuine
 * absence — the page renders the byte-identical not-found, GI-12 / Inv #11).
 */
export interface BuyerRfqWorkflowReads {
  /** Mirrors `list_rfqs` (buyer-org-scoped, cursor-paginated — GI-03; no public board, R5). */
  listRfqs(): Promise<RfqListData>;
  /** Mirrors the `list_rfqs` per-state facet read feeding the P-BUY-01 sourcing funnel. */
  getRfqPipeline(): Promise<RfqPipelineStage[]>;
  /** Journey-bucket counts for the RFQ workspace header (documented unions of frozen states). */
  getPipelineSummary(): Promise<JourneyBucketCount[]>;
  /** Mirrors `get_rfq` (+ nested `list_quotations_for_rfq` for the Quotations tab). */
  getRfq(rfqId: string): Promise<RfqDetailData | null>;
  /** Mirrors `get_rfq_version` (P-BUY-11 immutable revision history — Inv #8). */
  getRfqVersions(rfqId: string): Promise<RfqVersionHistoryData | null>;
  /** Mirrors the §E6.7 reads (`get_routing_log` + `list_invitations`) — delivered-onward only (Doc-3 §4.2). */
  getRoutingInvitations(rfqId: string): Promise<RoutingInvitationsData | null>;
  /** Mirrors `get_comparison_statement` (System-generated; read-only decision support — R6). */
  getComparison(rfqId: string): Promise<ComparisonData | null>;
  /**
   * The Comparative Statement (CS) print-view projection over the SAME `get_comparison_statement`
   * read (freeze COMPARE_SHEET_UX_FREEZE header v1.0 §3) — a generated procurement document
   * derived from the buyer's Workspace selection, NOT an independent business entity until the
   * Board approves ESC-CS-DOCKIND. `selectedQuotationIds` = the ephemeral W-1 selection (2–5);
   * absent/invalid → the full disclosed set. Arithmetic facts (totals/VAT/lowest) are computed
   * HERE (R7); evaluative content is the buyer's own record (R6). Line items are mock until the
   * ESC-CS-LINEITEMS dev-doc schema is ratified.
   */
  getComparativeStatement(
    rfqId: string,
    selectedQuotationIds?: string[],
  ): Promise<ComparativeStatementData | null>;
  /** Mirrors the shortlist read behind P-BUY-17 (candidates in System-persisted order — GI-04). */
  getAwardShortlist(rfqId: string): Promise<AwardData | null>;
  /** Mirrors `get_quotation` (visibility-gated; disclosed values only — Doc-3 §9.1). */
  getQuotationDetail(rfqId: string, quotationId: string): Promise<QuotationDetailData | null>;
}

/**
 * Vendor-leg reads (grant-scoped, received-only — DP1/BE-1). Own/received data ONLY: never a
 * competitor count, rank, score, or "why-not-invited" signal (ND-1..ND-8).
 */
export interface VendorRfqWorkflowReads {
  /** The received-only invitation inbox (S2) — rows exist only because an invitation was delivered. */
  listInbox(): Promise<InboxItemView[]>;
  /** Numeric quotation-submission quota (Doc-5I `monthly_rfq_limit`) — NEVER a plan name (Inv #10). */
  getQuota(): Promise<QuotaView>;
  /** Journey-bucket counts for the vendor RFQ home (own invitation/quotation facts only). */
  getPipelineSummary(): Promise<JourneyBucketCount[]>;
  /** Mirrors the grant-scoped `get_rfq` (S3 snapshot — [ESC-7G-Q-01] CLOSED). */
  getRfqSnapshot(rfqId: string): Promise<RfqSnapshotView | null>;
  /** The vendor's OWN invitation on this RFQ. */
  getInvitation(rfqId: string): Promise<InvitationView | null>;
  /** The vendor's OWN quotation (+ immutable version chain) on this RFQ. */
  getOwnQuotation(rfqId: string): Promise<QuotationView | null>;
  /** Read-only M4 hand-off pointer for a WON outcome (navigation only — DP10). */
  getEngagementHandoff(rfqId: string): Promise<EngagementHandoffView | null>;
  /** Working-draft content for the quotation builder (S4) — own data only; quota arrives via getQuota. */
  getQuotationDraft(rfqId: string): Promise<Omit<QuotationBuilderProps, "quota"> | null>;
}

/** The complete workflow data seam. One swap (../adapters/index.ts) moves every page to real reads. */
export interface RfqWorkflowData {
  buyer: BuyerRfqWorkflowReads;
  vendor: VendorRfqWorkflowReads;
}
