// FE-PUB-09 MEGA_MENU — navigation package surface (MEGA_MENU_ARCHITECTURE.md §1).
// The single home for reusable taxonomy navigation: one renderer, many surfaces (public header
// Explorer, /categories page, marketplace sidebar, mobile drawer, future pickers). Presentation-
// only (BR4/BR10): data arrives via TaxonomyProvider props; nothing here fetches or owns state.

export * from "./model/types";
export { buildTaxonomyIndex, findDeadOverlayKeys } from "./model/taxonomy-index";
export {
  resolveCategoryIcon,
  FALLBACK_CATEGORY_ICON,
  type CategoryIconKey,
} from "./model/icon-registry";
export { OVERLAY_V1, INDUSTRY_SHORTCUTS_V1 } from "./model/overlay.v1";
export { TaxonomyProvider, useTaxonomy, useTaxonomyOrNull } from "./providers/taxonomy-provider";
export {
  NavigationMenuStateProvider,
  useMenuState,
  type MenuState,
} from "./providers/menu-state-provider";
