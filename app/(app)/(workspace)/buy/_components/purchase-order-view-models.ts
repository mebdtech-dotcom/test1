// P-BUY-21 Buyer Purchase order — view-model. PRESENTATION-ONLY.
//
// A Purchase Order is a versioned CHILD DOCUMENT of a Procurement Engagement (`purchase_orders`; Doc-4F
// §F5.4 / Doc-2 §3.5/§10.5). It is ISSUED via `ops.issue_engagement_document.v1` with `doc_kind = po`
// (§F5.4) and READ via `ops.get_engagement_document.v1` (§F5.8). This view-model grounds STRICTLY in
// those frozen contracts and coins nothing the reads do not return (Content ≠ Presentation, Inv #9).
//
// `ops.get_engagement_document.v1` projects (Doc-4F §F5.8 Response Schema):
//   document : { document_id, doc_kind, human_ref, version_no, is_active_revision, storage_ref }
// This view-model carries ONLY those fields:
//   • `document_id`  → `id` (OPAQUE routing id, Inv #5).
//   • `doc_kind`     → pinned to `"po"` (this page only ever renders a PO; the enum is frozen §F5.8).
//   • `human_ref`    → `humanRef` ("DOC-…" year-scoped display label; routes use the opaque id).
//   • `version_no`   → `versionNo` (Inv #8 — versioned document; issue = v1, revise appends).
//   • `is_active_revision` → `isActiveRevision` (which revision is the live one; prior versions retained).
//   • `storage_ref`  → `storageRef` (OPAQUE ref to the BC-OPS-4-rendered artifact; a file-link only).
//
// DELIBERATELY NOT MODELLED:
//   • The PO BODY (`content_jsonb`) — its shape is "dev-doc scope" (§F5.4 request), NOT a frozen projection
//     field on the read. No PO line items / totals / terms are coined here (that would invent contract data).
//   • The PO monetary total — NOT a projected field of `get_engagement_document`; the engagement carries
//     `award_value_snapshot` (§F5.8 get_engagement), the PO document read does not. No amount is coined.
//   • An enumerated LIST of an engagement's documents — no `list_engagement_documents` read exists
//     (`ESC-7G-ENG-03`); a specific PO is reachable only by its own `document_id`, never discovered here.
//
// GOVERNANCE:
//   • VERSIONED / IMMUTABLE (Inv #8 / Doc-2 §10.5): a PO is never overwritten; `revision_reason` is
//     mandatory on revise; superseded versions are retained. This view models the ACTIVE revision.
//   • `can_approve_po` is a DISTINCT slug (Doc-4F §F5.4 / Doc-2 §7) — financial PO approval is NEVER
//     collapsed into `can_create_documents`. `canApprovePo` gates the approval affordance in presentation
//     only; the SERVER enforces (`check_permission`) at wiring. Audience flag, not an authorization source.
//   • MONEY BOUNDARY (DF-6 / R8): a PO is a RECORD only — the platform never holds/moves funds. No
//     pay/settle/escrow affordance exists anywhere on this page.
//   • PARTY-SCOPED (Doc-4F §F5.8 V4 / H.9): a non-party caller collapses to NOT_FOUND, rendered
//     BYTE-IDENTICAL to genuine absence (Inv #11 / GI-12) via `notFound()`. `document_id` is OPAQUE (Inv #5).

/** The `doc_kind` this page renders — pinned to the frozen enum value (Doc-4F §F5.8: loi|po|challan|wcc|…). */
export type EngagementDocumentKind = "po";

export interface PurchaseOrderData {
  /** `engagement_id` — the parent engagement (OPAQUE; the route ancestor for breadcrumbs/back). Inv #5. */
  engagementId: string;
  /** `human_ref` of the parent engagement — a display label for the breadcrumb only (routes use the id). */
  engagementRef?: string;
  /** `document_id` — the PO's OPAQUE routing id (Inv #5). */
  id: string;
  /** `doc_kind` — pinned "po" (frozen §F5.8 enum). */
  docKind: EngagementDocumentKind;
  /** `human_ref` — year-scoped display ref (e.g. `DOC-2026-000091`). Display-only. */
  humanRef: string;
  /** `version_no` — the ACTIVE revision's version (Inv #8 — versioned; issue = 1, revise appends). */
  versionNo: number;
  /** `is_active_revision` — whether this is the live revision (prior versions retained, never deleted). */
  isActiveRevision: boolean;
  /** `storage_ref` — OPAQUE ref to the BC-OPS-4-rendered artifact; a file-link only (never inlined here). */
  storageRef?: string;
  /**
   * `can_approve_po` (Doc-4F §F5.4) — DISTINCT slug for PO financial approval; NEVER collapsed into
   * `can_create_documents`. Audience flag for the approval affordance; the server enforces authorization.
   */
  canApprovePo?: boolean;
}
