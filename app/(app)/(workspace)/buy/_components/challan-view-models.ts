// P-BUY-24 Buyer Challan — view-model. PRESENTATION-ONLY.
//
// A challan (delivery challan / goods-delivery note) is a VERSIONED child document of a Procurement
// Engagement (`challans`; Doc-4F §F5.3 / Doc-2 §10.5). It is RECORDED by the delivering party via
// `ops.record_delivery.v1` (slug `can_create_documents`; emits `DeliveryRecorded` → a Trust delivery-
// performance input) and READ via `ops.get_engagement_document.v1` (§F5.8). This view-model grounds
// STRICTLY in the frozen read projection and coins nothing (Content ≠ Presentation, Inv #9).
//
// `ops.get_engagement_document.v1` projects (Doc-4F §F5.8):
//   document : { document_id, doc_kind, human_ref, version_no, is_active_revision, storage_ref }
// This view-model carries ONLY those fields:
//   • `document_id`  → `id` (OPAQUE routing id, Inv #5).
//   • `doc_kind`     → pinned `"challan"` (frozen §F5.8 enum value).
//   • `human_ref`    → `humanRef` (`DOC-…` year-scoped display label; routes use the opaque id).
//   • `version_no`   → `versionNo` (Inv #8 — versioned; each delivery record is a new version).
//   • `is_active_revision` → `isActiveRevision` (which revision is the live one; prior versions retained).
//   • `storage_ref`  → `storageRef` (OPAQUE ref to the BC-OPS-4-rendered artifact; a file-link only).
//
// DELIBERATELY NOT MODELLED:
//   • The challan BODY (`content_jsonb` — delivery line items / quantities) — dev-doc scope (§F5.3
//     request), NOT a projected read field. No quantities / line items are coined.
//   • An enumerated LIST of an engagement's challans — no `list_engagement_documents` read exists
//     (`ESC-7G-ENG-03`); a specific challan is reachable only by its own `document_id`.
//
// GOVERNANCE:
//   • READ-ONLY for the buyer (P-BUY-24 is Read-only) — deliveries are recorded by the delivering party;
//     no buyer write affordance exists here. `DeliveryRecorded` is a Trust input (emit, never scored).
//   • VERSIONED / IMMUTABLE (Inv #8 / Doc-2 §10.5): a challan is never overwritten; a new delivery is a
//     new version; superseded versions are retained. This view models the ACTIVE revision.
//   • Party-scoped (Doc-4F §F5.8 V4 / H.9): a non-party caller collapses to NOT_FOUND, byte-identical to
//     genuine absence (Inv #11 / GI-12). `document_id` is OPAQUE (Inv #5).

/** The `doc_kind` this page renders — pinned to the frozen enum value (Doc-4F §F5.8: loi|po|challan|wcc|…). */
export type ChallanDocKind = "challan";

export interface ChallanData {
  /** `engagement_id` — the parent engagement (OPAQUE; route ancestor for breadcrumbs/back). Inv #5. */
  engagementId: string;
  /** `human_ref` of the parent engagement — a display label for the breadcrumb only. */
  engagementRef?: string;
  /** `document_id` — the challan's OPAQUE routing id (Inv #5). */
  id: string;
  /** `doc_kind` — pinned "challan" (frozen §F5.8 enum). */
  docKind: ChallanDocKind;
  /** `human_ref` — year-scoped display ref (e.g. `DOC-2026-000112`). Display-only. */
  humanRef: string;
  /** `version_no` — the ACTIVE revision's version (Inv #8 — each delivery record is a new version). */
  versionNo: number;
  /** `is_active_revision` — whether this is the live revision (prior versions retained, never deleted). */
  isActiveRevision: boolean;
  /** `storage_ref` — OPAQUE ref to the BC-OPS-4-rendered artifact; a file-link only (never inlined here). */
  storageRef?: string;
}
