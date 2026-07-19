// Vendor RFQ & Quotation Workspace presentation components (Team 3, Milestone 5 — the moat;
// companion §6 + §13.1).
//
// Presentation-only, reusable, route-group-agnostic; composes the FROZEN Doc-7B kit + the platform
// shell + reuses vendor atoms (PresentationFormNote, DescriptionList — promotion candidates). Typed
// props bind ONLY real frozen fields/states (Doc-2 §10.4, Doc-4E PassB Part4, Doc-4M, Doc-5E/5I) —
// zero contract invention. Byte-equivalence (Invariant 11 / GR11 / CHK-7-040) is load-bearing: every
// view is received/own data only — no competitor count, rank, score, or "why-not-invited" signal.
export { InvitationInbox, type InvitationInboxProps } from "./invitation-inbox";
export { RfqInboxTable, type RfqInboxTableProps } from "./rfq-inbox-table";
export {
  InboxStateFilter,
  parseInboxStateFilter,
  INBOX_STATE_FILTERS,
  INBOX_STATE_FILTER_LABELS,
  type InboxStateFilterKey,
  type InboxStateFilterProps,
} from "./inbox-state-filter";
export { QuotationHomeSummary, type QuotationHomeSummaryProps } from "./quotation-home-summary";
export { RfqStatCards, type RfqStatCardsProps } from "./rfq-stat-cards";
export { RfqSnapshot, type RfqSnapshotProps } from "./rfq-snapshot";
export { InvitationResponse, type InvitationResponseProps } from "./invitation-response";
export { ClarificationsSection, type ClarificationsSectionProps } from "./clarifications-section";
export { QuotationStatusCard, type QuotationStatusCardProps } from "./quotation-status-card";
export {
  QuotationVersionTimeline,
  type QuotationVersionTimelineProps,
} from "./quotation-version-timeline";
export { QuotationOutcomePanel, type QuotationOutcomePanelProps } from "./quotation-outcome-panel";
export { QuotationBuilder, type QuotationBuilderProps } from "./quotation-builder";
export { PriceBreakdownTable, type PriceBreakdownTableProps } from "./price-breakdown-table";
export {
  QuotationTermsField,
  type QuotationTermsFieldProps,
  type QuotationTermSection,
} from "./quotation-terms-fields";
export { QuotationAttachments, type QuotationAttachmentsProps } from "./quotation-attachments";
export { QuotationPreview, type QuotationPreviewProps } from "./quotation-preview";
export { QuotationSubmitPanel, type QuotationSubmitPanelProps } from "./quotation-submit-panel";
export { QuotaMeter, type QuotaMeterProps } from "./quota-meter";
export { WindowStateChip, type WindowStateChipProps } from "./window-state-chip";
export { RfqStateChip, InvitationStateChip, QuotationStateChip } from "./state-chips";
// Cluster #1 merge (Team-1 F2): the Inbox ⇄ Pipeline lens toggle for the merged `/sell/rfqs` surface.
export {
  RfqViewToggle,
  parseRfqView,
  RFQ_VIEWS,
  type RfqView,
  type RfqViewToggleProps,
} from "./rfq-view-toggle";

export type {
  RfqState,
  InvitationState,
  QuotationState,
  WorkNature,
  WindowState,
  WindowUrgency,
  FileRefView,
  InboxItemView,
  RfqSnapshotView,
  InvitationView,
  QuotationVersionView,
  QuotationView,
  QuotaView,
  PriceBreakdownLine,
  EngagementHandoffView,
} from "./types";
