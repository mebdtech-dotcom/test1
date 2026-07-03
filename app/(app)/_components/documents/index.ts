// Documents SHARED HOME (FE-DOC track, WBS v1.2) — the single import point for the cross-workspace
// documents presentation family, mirroring `_components/vendor/shared/`. Created at FE-DOC-01 with
// KNOWN second consumers (FE-DOC-02 vendor hub · FE-DOC-03 templates/generated pages — the M8
// shared-extraction rationale, disclosed in WP fe-doc-01). Components here render caller-supplied,
// frozen-grounded data only — they import the kit, never a workspace's private components; buyer↔
// vendor surfaces import THIS, never each other. The owner's abstraction family
// (DocumentCollection → [DocumentTable pending FE-SH-01, packet item 3] → DocumentActions →
// DocumentRelations) + the adjudicated finding components (LifecycleStrip · DocumentProcessTimeline
// · DocumentPreviewDialog · RecentlyOpenedStrip · PrintButton) + the shared specs (column model ·
// icon map · reserved analytics names).

export {
  LifecycleStrip,
  DOCUMENT_STAGES,
  DOCUMENT_STAGE_KEYS,
  type DocumentStageKey,
  type LifecycleStripProps,
} from "./lifecycle-strip";
export { DocumentCollection, type DocumentCollectionProps } from "./document-collection";
export {
  DocumentActions,
  type DocumentActionsProps,
  type DocumentArtifactView,
} from "./document-actions";
export {
  DocumentRelations,
  type DocumentRelationsProps,
  type RelatedDocumentLink,
} from "./document-relations";
export {
  DocumentProcessTimeline,
  type DocumentProcessTimelineProps,
  type DocumentTimelineEntry,
} from "./document-process-timeline";
export { DocumentPreviewDialog, type DocumentPreviewDialogProps } from "./document-preview-dialog";
export {
  RecentlyOpenedStrip,
  type RecentlyOpenedItem,
  type RecentlyOpenedStripProps,
} from "./recently-opened-strip";
export { PrintButton } from "./print-button";
export {
  DOCUMENT_ICON_MAP,
  DEFAULT_DOCUMENT_ICON,
  documentIcon,
  type DocumentIconKey,
} from "./document-icon-map";
export {
  DOCUMENTS_DEFAULT_SORT,
  DOCUMENTS_PAGE_SIZE,
  DOCUMENTS_SEARCH_DEBOUNCE_MS,
  DOCUMENTS_MOBILE_HIDDEN_COLUMNS,
  DOCUMENTS_ALWAYS_VISIBLE_COLUMNS,
} from "./document-table-spec";
export { DOCUMENTS_ANALYTICS_EVENTS, type DocumentsAnalyticsEvent } from "./analytics-events";
