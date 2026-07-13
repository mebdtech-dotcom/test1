// P-BUY-25 Buyer WCC (Work Completion Certificate) — view-model. PRESENTATION-ONLY.
//
// A WCC is a VERSIONED child document of a Procurement Engagement (`work_completion_certificates`;
// Doc-4F §F5.4 / Doc-2 §10.5). It is ISSUED via `ops.issue_engagement_document.v1` with `doc_kind = wcc`
// (slug `can_create_documents`; emits `WorkCompletionIssued` → a Trust delivery/completion-performance
// input) and READ via `ops.get_engagement_document.v1` (§F5.8). This view-model grounds STRICTLY in the
// frozen read projection and coins nothing (Content ≠ Presentation, Inv #9).
//
// `ops.get_engagement_document.v1` projects (Doc-4F §F5.8):
//   document : { document_id, doc_kind, human_ref, version_no, is_active_revision, storage_ref }
// This view-model carries ONLY those fields:
//   • `document_id`  → `id` (OPAQUE routing id, Inv #5).
//   • `doc_kind`     → pinned `"wcc"` (frozen §F5.8 enum value).
//   • `human_ref`    → `humanRef` (`DOC-…` year-scoped display label; routes use the opaque id).
//   • `version_no`   → `versionNo` (Inv #8 — versioned; a revise appends a new version).
//   • `is_active_revision` → `isActiveRevision` (which revision is the live one; prior versions retained).
//   • `storage_ref`  → `storageRef` (OPAQUE ref to the BC-OPS-4-rendered artifact; a file-link only).
//
// DELIBERATELY NOT MODELLED:
//   • The WCC BODY (`content_jsonb`) — dev-doc scope (§F5.4 request), NOT a projected read field.
//   • An enumerated LIST of an engagement's documents — no `list_engagement_documents` read exists
//     (`ESC-7G-ENG-03`); a specific WCC is reachable only by its own `document_id`.
//
// GOVERNANCE:
//   • READ-ONLY for the buyer (P-BUY-25 is Read-only) — a WCC is issued by the certifying party, not read-
//     mutated here; no buyer write affordance exists. `WorkCompletionIssued` is a Trust input (emit,
//     never scored in the UI).
//   • VERSIONED / IMMUTABLE (Inv #8 / Doc-2 §10.5): a WCC is never overwritten; a revise appends a new
//     version; superseded versions are retained. This view models the ACTIVE revision.
//   • Party-scoped (Doc-4F §F5.8 V4 / H.9): a non-party caller collapses to NOT_FOUND, byte-identical to
//     genuine absence (Inv #11 / GI-12). `document_id` is OPAQUE (Inv #5). A WCC is non-financial (no money).

/** The `doc_kind` this page renders — pinned to the frozen enum value (Doc-4F §F5.8: loi|po|challan|wcc|…). */
export type WccDocKind = "wcc";

export interface WccData {
  /** `engagement_id` — the parent engagement (OPAQUE; route ancestor for breadcrumbs/back). Inv #5. */
  engagementId: string;
  /** `human_ref` of the parent engagement — a display label for the breadcrumb only. */
  engagementRef?: string;
  /** `document_id` — the WCC's OPAQUE routing id (Inv #5). */
  id: string;
  /** `doc_kind` — pinned "wcc" (frozen §F5.8 enum). */
  docKind: WccDocKind;
  /** `human_ref` — year-scoped display ref (e.g. `DOC-2026-000133`). Display-only. */
  humanRef: string;
  /** `version_no` — the ACTIVE revision's version (Inv #8 — versioned; issue = 1, revise appends). */
  versionNo: number;
  /** `is_active_revision` — whether this is the live revision (prior versions retained, never deleted). */
  isActiveRevision: boolean;
  /** `storage_ref` — OPAQUE ref to the BC-OPS-4-rendered artifact; a file-link only (never inlined here). */
  storageRef?: string;
}
