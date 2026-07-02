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
export { CategoryIcon } from "./category-tree/category-icon";
export { CategoryBadge } from "./category-tree/category-badge";
export { CategoryCard } from "./category-tree/category-card";
export { CategoryTree } from "./category-tree/category-tree";
export { CategoryNodeItem } from "./category-tree/category-node";
export { MegaMenuMobile } from "./mega-menu/mega-menu-mobile";
export { MegaMenuBreadcrumb } from "./mega-menu/mega-menu-breadcrumb";
export { MegaMenuSearch } from "./mega-menu/mega-menu-search";
export { MegaMenu } from "./mega-menu/mega-menu";
export { MegaMenuColumns, MegaMenuColumn } from "./mega-menu/mega-menu-column";
export { MegaMenuCategory } from "./mega-menu/mega-menu-category";
export { MegaMenuTrail } from "./mega-menu/mega-menu-trail";
export { MegaMenuFeatured } from "./mega-menu/mega-menu-featured";
export { MegaMenuVendors } from "./mega-menu/mega-menu-vendors";
export { MegaMenuPopular } from "./mega-menu/mega-menu-popular";
export { MegaMenuIndustryStrip } from "./mega-menu/mega-menu-industry-strip";
export { MegaMenuQuickActions } from "./mega-menu/mega-menu-quick-actions";
export { MegaMenuFooter } from "./mega-menu/mega-menu-footer";
export { MegaMenuEmptyState } from "./mega-menu/mega-menu-empty";
export { MenuInstanceProvider, useMenuInstance } from "./mega-menu/menu-context";
