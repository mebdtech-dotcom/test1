// Vendor Catalog & Products presentation components (Team 3, Milestone 4 — S6–S7).
//
// Presentation-only, reusable, route-group-agnostic; composes the FROZEN Doc-7B kit + reuses vendor
// atoms (MatchingContextBanner, PresentationFormNote — promotion candidates). Typed props bind ONLY
// real frozen fields/states (Doc-2 §10.3, Doc-6D §3.3, Doc-4M) — zero contract invention. Products are
// matching-relevant CONTENT (DP5); spec versions are immutable (Invariant 8); soft-delete only (DP11).
export { ProductsList, type ProductsListProps } from "./products-list";
export { ProductEditorTabs, type ProductEditorTabsProps } from "./product-editor-tabs";
export { ProductContentForm, type ProductContentFormProps } from "./product-content-form";
export { ProductSpecsPanel, type ProductSpecsPanelProps } from "./product-specs-panel";
export { ProductPublishPanel, type ProductPublishPanelProps } from "./product-publish-panel";
export { ProductStatusChip } from "./product-status-chip";
export {
  PublishAllowanceIndicator,
  type PublishAllowanceIndicatorProps,
} from "./publish-allowance";

export type {
  ProductStatus,
  SpecDocType,
  ProductImageRef,
  ProductView,
  SpecDocumentView,
  PublishAllowanceView,
} from "./types";
