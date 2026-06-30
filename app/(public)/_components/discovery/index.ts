// Public marketplace-discovery components (Team 1, Public M2 — presentation-only). Reusable across the
// landing sections (SEC-CATEGORY/SUPPLIERS/PRODUCTS) and the M2.2 discovery routes (/marketplace,
// /vendors, /categories). Compose the FROZEN Doc-7B kit only; bind no Doc-5 contract (typed VMs).
// Public discovery components that remain Public-local (NOT promoted): the filter sidebar is coupled to
// the public facet seed, and the search bar is a presentational placeholder the M2.3 Search Experience
// will define. The promoted, canonical cards / grid / section live in the shared kit
// (@/frontend/components/{vendor-card,product-card,category-tile,results-grid,landing-section}).
export { FilterSidebar, type FilterSidebarProps } from "./filter-sidebar";
export { SearchBar, type SearchBarProps } from "./search-bar";
