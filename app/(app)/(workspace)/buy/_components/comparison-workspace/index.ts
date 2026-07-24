// Comparison Workspace — barrel. The fresh presentation architecture for the un-gated FE slice
// (per the approved plan): a shared route-group provider + gating initializer + region components.
export {
  ComparisonWorkspaceStateProvider,
  useComparisonWorkspace,
} from "./comparison-workspace-state";
export {
  ComparisonWorkspaceView,
  ComparisonNotFound,
  ComparisonAwaiting,
} from "./comparison-workspace-view";
// The client root, exported so a host that supplies its OWN breadcrumbs/chrome (the Quotations-group
// Compare Quotes route) can compose provider → initializer → workspace itself, instead of duplicating the
// workspace. `ComparisonWorkspaceView` stays the RFQ-scoped host with its `/buy/rfqs/...` breadcrumbs.
export { ComparisonWorkspace } from "./comparison-workspace";
export { ComparisonWorkspaceInitializer } from "./comparison-workspace-initializer";
export {
  buildWorkspaceData,
  toInitializeInput,
  type ComparisonWorkspaceData,
} from "./workspace-view-models";
export { normalizeSelection, defaultSelection, parseSelParam } from "./selection";
