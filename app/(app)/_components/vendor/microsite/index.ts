// Vendor Microsite & Branding presentation components (Team 3, Milestone 3 — S10–S14).
//
// Presentation-only, reusable, route-group-agnostic; composes the FROZEN Doc-7B kit + reuses two
// vendor atoms (DescriptionList, PresentationFormNote — second consumer, promotion candidates).
// Typed props bind ONLY real frozen fields/states (Doc-2 §10.3/§3.4, Doc-6D, Doc-4M, Doc-5D BC-MKT-4,
// Doc-5I) — zero contract invention. DP5/Invariant 9: presentation never affects matching.
export { MicrositeBuilder, type MicrositeBuilderProps } from "./microsite-builder";
export { BrandingPanel, type BrandingPanelProps } from "./branding-panel";
export { SeoPanel, type SeoPanelProps } from "./seo-panel";
export { CustomDomainPanel, type CustomDomainPanelProps } from "./custom-domain-panel";
export { PreviewPublishPanel, type PreviewPublishPanelProps } from "./preview-publish-panel";
export { MicrositeTabs, type MicrositeTabsProps } from "./microsite-tabs";

export {
  PresentationContextBanner,
  type PresentationContextBannerProps,
} from "./presentation-context-banner";
export { MicrositeStatusChip, DomainStatusChip, VisibilityChip } from "./status-chips";

export type {
  MicrositeStatus,
  LayoutTemplate,
  BrandingAssetType,
  AssetVisibility,
  CustomDomainStatus,
  MicrositeView,
  MicrositeSectionView,
  BrandingAssetView,
  SeoSettingsView,
  CustomDomainView,
} from "./types";
