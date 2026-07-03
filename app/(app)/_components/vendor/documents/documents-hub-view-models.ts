// Vendor Workspace — P-DOC-02 Documents hub PRESENTATION VIEW-MODELS (FE-DOC-02, WP
// fe-doc-02-vendor-documents-hub). Vendor mirror of the buyer hub's view-models
// ((buyer)/_components/documents-hub-view-models.ts) — same shape and derivation rules, composed
// against the SAME shared documents home (never forked), but field-named per the vendor engagement
// workspace's own snake_case convention (`_components/vendor/engagements/types.ts`), not the
// buyer's camelCase — a disclosed, intentional per-workspace convention divergence, not drift.
//
// SOURCES (by pointer, composition — Content ≠ Presentation): identical to the buyer leg —
// generated documents = M4 BC-OPS-4 `ops.list_generated_documents.v1`; engagement document
// records = M4 BC-OPS-2 (the five fixed per-engagement document routes, vendor-mounted at
// `/workspace/engagements/[id]/*`); trade-invoice pointers = the frozen `TradeInvoiceStatus` set
// (`../engagements/types`); platform invoices (M7) are a LINK-OUT ONLY (DF-6).
//
// DIRECTION IS A PRESENTATION DERIVATION (same ESC-7G-ENG-01-family wiring-time note as the buyer
// leg, from the vendor's own-org perspective): "received" | "sent" derives from comparing the
// record's owning `organization_id` against the ACTIVE (vendor) org. A grouping cue, never a
// coined status enum.
import type { MoneyValue } from "@/frontend/components/format";
import type {
  EngagementStatus,
  TradeInvoiceStatus,
  GeneratedArtifactView,
} from "../engagements/types";
import type { DocumentStageKey, DocumentTimelineEntry, RecentlyOpenedItem } from "../../documents";

/** Derived presentation grouping (see header) — not a document state. */
export type DocumentDirection = "received" | "sent";

/** The hub's preset views — presentation groupings over frozen fields, same four as the buyer leg. */
export type DocumentsHubView = "received" | "sent" | "pending" | "completed";

export const DOCUMENTS_HUB_VIEWS: DocumentsHubView[] = ["received", "sent", "pending", "completed"];

/**
 * Display labels for AS-PROJECTED `doc_kind` strings (Doc-4F §F7.3 — a string on the wire, not an
 * enum). Identical map to the buyer leg — reused by value, not re-derived differently.
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
  human_ref: string;
  /** As-projected kind string (see GENERATED_DOC_KIND_LABEL). */
  doc_kind: string;
  version_no: number;
  direction: DocumentDirection;
  /** Opaque source engagement id — links `/workspace/engagements/[id]`. */
  source_engagement_id?: string;
  /** Source display ref (human ref of the source record) — display label only. */
  source_ref?: string;
  /** Counterparty OPAQUE ref — no name is projected on M4 reads; never coin one. */
  counterparty_ref?: string;
  issued_at: string;
  artifact?: GeneratedArtifactView;
  /** Sharing state from the counterparty-grant aggregate, rendered as a muted note by intent. */
  sharing_revoked?: boolean;
}

/** One engagement's document cluster row (§2) — links + a restated-facts timeline. */
export interface HubEngagementRow {
  id: string;
  human_ref: string;
  status: EngagementStatus;
  timeline: DocumentTimelineEntry[];
}

/** A pending-attention trade-invoice pointer (frozen status only) — deep-links the invoice route. */
export interface TradeInvoicePointer {
  engagement_id: string;
  engagement_ref: string;
  human_ref: string;
  status: TradeInvoiceStatus;
  amount?: MoneyValue;
  due_date?: string;
}

export interface DocumentsHubData {
  active_view?: DocumentsHubView;
  active_stage?: DocumentStageKey;
  /** The `?q=` refine string (presentation refine over loaded rows). */
  query?: string;
  generated: GeneratedDocumentRow[];
  engagements: HubEngagementRow[];
  pending_invoices: TradeInvoicePointer[];
  recently_opened: RecentlyOpenedItem[];
}
