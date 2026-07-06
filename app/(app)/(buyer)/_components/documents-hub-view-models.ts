// Buyer Workspace — P-DOC-01 Documents hub PRESENTATION VIEW-MODELS (FE-DOC-01, WP
// fe-doc-01-buyer-documents-hub). Typed props the hub renders from — NOT contract DTOs; the
// server layer maps the wired reads onto these at wiring (GI-02, PARKED). Every field traces to a
// frozen source by intent; no state/kind/field is invented.
//
// SOURCES (by pointer, composition — Content ≠ Presentation):
//  • Generated documents — M4 BC-OPS-4 `ops.list_generated_documents.v1` (Doc-4F §F7):
//    {human_ref DOC-…, doc_kind, version_no, storage_ref, source_entity_id}.
//  • Engagement document records — M4 BC-OPS-2 (Doc-4F §F5): the six fixed per-engagement
//    document routes (P-BUY-21..25 + the LOI face of P-BUY-21, WP-1) — the hub LINKS to them,
//    never re-renders them.
//  • Trade-invoice pointers — the frozen `TradeInvoiceStatus` set (view-models.ts, verbatim).
//  • Platform invoices (M7) are a LINK-OUT ONLY (DF-6) — never mixed into trade-document rows.
//
// DIRECTION IS A PRESENTATION DERIVATION (owner finding MINOR-01 R1 / packet wiring note):
// "received" | "sent" derives from comparing the record's owning `organization_id` (a frozen
// Doc-2 §10.5 column on `generated_documents`) against the ACTIVE org — the §F7.5 read projection
// does not enumerate that field, so the derivation binds-by-intent and is registered as a
// wiring-time additive-projection note (ESC-7G-ENG-01 family) in
// `BOARD-PACKET-DOCUMENT-MANAGEMENT_v1.0.md`. It is a grouping cue, NEVER a coined status enum.

import type { EngagementState, TradeInvoiceStatus, MoneyValue } from "./view-models";
import type {
  DocumentStageKey,
  DocumentArtifactView,
  DocumentTimelineEntry,
  RecentlyOpenedItem,
} from "../../_components/documents";

/** Derived presentation grouping (see header) — not a document state. */
export type DocumentDirection = "received" | "sent";

/** The hub's preset views (owner's buyer dashboard views) — presentation groupings over frozen fields. */
export type DocumentsHubView = "received" | "sent" | "pending" | "completed";

export const DOCUMENTS_HUB_VIEWS: DocumentsHubView[] = ["received", "sent", "pending", "completed"];

/**
 * Display labels for AS-PROJECTED `doc_kind` strings (Doc-4F §F7.3 — a string on the wire, NOT an
 * enum; this map claims no value set and unknown values render verbatim).
 */
export const GENERATED_DOC_KIND_LABEL: Record<string, string> = {
  quotation: "Quotation",
  po: "Purchase Order",
  challan: "Challan",
  wcc: "Work Completion Certificate",
  bill: "Bill",
  letterhead: "Letterhead",
};

export function generatedDocKindLabel(docKind: string): string {
  return GENERATED_DOC_KIND_LABEL[docKind] ?? docKind;
}

/** One BC-OPS-4 generated-document row (fields per §F7 by intent; artifact = resolved storage ref). */
export interface GeneratedDocumentRow {
  id: string;
  humanRef: string;
  /** As-projected kind string (see GENERATED_DOC_KIND_LABEL). */
  docKind: string;
  versionNo: number;
  direction: DocumentDirection;
  /** Opaque source engagement id (`source_entity_id`) — links `/engagements/[id]`. */
  sourceEngagementId?: string;
  /** Source display ref (human ref of the source record) — display label only. */
  sourceRef?: string;
  /** Counterparty OPAQUE ref — no name is projected on M4 reads (P-BUY-20 precedent); never coin one. */
  counterpartyRef?: string;
  issuedAt: string;
  artifact?: DocumentArtifactView;
  /**
   * Sharing state from the counterparty-grant aggregate (`ops.grant_generated_document.v1` /
   * revoke — Doc-4F §F7.4), rendered as a muted note by intent; binds at wiring.
   */
  sharingRevoked?: boolean;
}

/** One engagement's document cluster row (§2) — links + a restated-facts timeline. */
export interface HubEngagementRow {
  id: string;
  humanRef: string;
  state: EngagementState;
  timeline: DocumentTimelineEntry[];
}

/** A pending-attention trade-invoice pointer (frozen status only) — deep-links the invoice route. */
export interface TradeInvoicePointer {
  engagementId: string;
  engagementRef: string;
  humanRef: string;
  status: TradeInvoiceStatus;
  amount?: MoneyValue;
  dueDate?: string;
}

export interface DocumentsHubData {
  activeView?: DocumentsHubView;
  activeStage?: DocumentStageKey;
  /** The `?q=` refine string (presentation refine over loaded rows — see the page header note). */
  query?: string;
  generated: GeneratedDocumentRow[];
  engagements: HubEngagementRow[];
  pendingInvoices: TradeInvoicePointer[];
  recentlyOpened: RecentlyOpenedItem[];
}
