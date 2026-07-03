// Documents shared home — RESERVED analytics event names (FE-DOC, owner Round-3 NIT-R3-01; the
// FE-PUB-09 analytics-contract precedent). NAMES ONLY: nothing in the presentation-only build
// emits, imports PostHog, or claims a payload schema — the observational layer wires later. Kept
// as one constants map so both hubs (and FE-DOC-03) reserve identical names and never fork the
// vocabulary. These are instrumentation labels, not domain slugs (they coin no contract).

export const DOCUMENTS_ANALYTICS_EVENTS = {
  filterChanged: "documents_filter_changed",
  documentOpened: "documents_opened",
  documentPreviewed: "document_preview",
  documentDownloaded: "document_download",
  lifecycleStageSelected: "lifecycle_stage_selected",
} as const;

export type DocumentsAnalyticsEvent =
  (typeof DOCUMENTS_ANALYTICS_EVENTS)[keyof typeof DOCUMENTS_ANALYTICS_EVENTS];
