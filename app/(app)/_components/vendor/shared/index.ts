// Vendor SHARED layer (Team 3, Milestone 8 — Shared Extraction Pass). The single import point for
// presentation assets reused across two or more Vendor features. These were promoted here once they
// crossed the Board's reuse threshold; promotion is a pure MOVE — zero behavior, UI, routing, API, or
// governance change. Feature-specific atoms (capability matrix, tier chip, status chips, money-boundary
// banner, …) stay in their owning feature until they gain additional consumers.
export { WorkspaceTabs, type WorkspaceTab, type WorkspaceTabsProps } from "./workspace-tabs";
export { PresentationFormNote } from "./presentation-form-note";
export {
  DescriptionList,
  type DescriptionListProps,
  type DescriptionItem,
} from "./description-list";
