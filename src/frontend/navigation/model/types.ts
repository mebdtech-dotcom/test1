// FE-PUB-09 MEGA_MENU — view-model types (MEGA_MENU_DATA_MODEL.md §2 + §6 Approval Addendum).
// Presentation-only: NOT a DB schema, NOT a contract. Content ≠ Presentation — the frozen
// category entity mirror (CategoryNodeData) is consumed verbatim; everything else is FE-owned
// overlay. Zero coined fields on the frozen entity.

import type { CategoryIconKey } from "./icon-registry";

/** Frozen-entity mirror — fields the taxonomy source guarantees (Doc-2 §10.3 · Doc-4D §D7.1). */
export interface CategoryNodeData {
  /** UUIDv7 in the real projection; interim seed ships deterministic stand-ins — key on slug. */
  id: string;
  slug: string;
  name: string;
  /** Frozen CHECK 1–4 — typed literally, but rendering never branches on it (depth-recursive). */
  level: 1 | 2 | 3 | 4;
  parentId: string | null;
}

/** FE-owned optional presentation metadata, keyed by slug. Absence = render nothing (GI-03). */
export interface CategoryPresentation {
  icon?: CategoryIconKey;
  description?: string;
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  comingSoon?: boolean;
  hidden?: boolean;
  badge?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  order?: number;
  sectionLabel?: string;
  /** From the taxonomy package's synonym starter set v0.1 — never invented ad hoc. */
  synonyms?: string[];
}

/** What components consume. */
export interface CategoryNodeVM extends CategoryNodeData, CategoryPresentation {
  children: CategoryNodeVM[];
}

export type PresentationOverlay = Record<string, CategoryPresentation>;

/** Normalized index built once per provider (nodes stored once, referenced by id). */
export interface TaxonomyIndex {
  roots: CategoryNodeVM[];
  byId: ReadonlyMap<string, CategoryNodeVM>;
  bySlug: ReadonlyMap<string, CategoryNodeVM>;
  /** Ancestors root-first, ending at the node itself. */
  pathTo(id: string): CategoryNodeVM[];
  /** name + slug + synonyms, case-insensitive. Pure — no network, no product search. */
  filter(query: string): CategoryNodeVM[];
}

/** The ONLY seam that changes when the `list_categories` projection lands ([ESC-7-API-CATNAV]). */
export interface TaxonomySource {
  load(): Promise<CategoryNodeData[]>;
}

/* ── Approval Addendum types (owner Board 2026-07-03) — instance data passed as props. ────── */

/** Popular Searches strip — curated, seed-verified terms supplied by the app (RV-0121 idiom). */
export type PopularSearchTerm = string;

/**
 * MegaMenuVendors row (MAJOR-02). Mirrors the public VendorCardVM projection fields the slot
 * needs — capability is the frozen 4-flag matrix ONLY (Invariant #1; trade-role labels are
 * rejected coins, see MEGA_MENU_ARCHITECTURE §9.2).
 */
export interface MenuVendorVM {
  slug: string;
  name: string;
  /** Absence = render nothing — never a fabricated "pending" state. */
  verified?: boolean;
  capability?: Partial<{
    can_supply: boolean;
    can_service: boolean;
    can_fabricate: boolean;
    can_consult: boolean;
  }>;
}

/** Quick-action row (MINOR-03, trimmed) — links only to existing surfaces. */
export interface QuickAction {
  label: string;
  href: string;
  icon?: CategoryIconKey;
}

/** Industry entry chips (MINOR-04) — overlay-authored, menu-level; href must be a live route. */
export interface IndustryShortcut {
  label: string;
  href: string;
}

/** Typed analytics envelope (R3-NITPICK-02) — one shape for every event callback. */
export interface MenuAnalyticsPayload {
  source: "header" | "categories-page" | "sidebar" | "mobile-drawer" | "picker";
  rootCategory?: string;
  nodeSlug?: string;
  /** Ancestor slugs, root-first. */
  path?: string[];
  device: "desktop" | "tablet" | "mobile";
  authenticated: boolean;
}

export type MenuAnalyticsEvent =
  | ({ type: "menu_open" } & MenuAnalyticsPayload)
  | ({ type: "node_drill" } & MenuAnalyticsPayload)
  | ({ type: "node_navigate" } & MenuAnalyticsPayload)
  | ({ type: "menu_search_used"; query: string; resultCount: number } & MenuAnalyticsPayload)
  | ({ type: "menu_search_zero"; query: string } & MenuAnalyticsPayload)
  | ({ type: "quick_action_clicked"; action: string } & MenuAnalyticsPayload);

/**
 * Category Landing Contract (MEGA_MENU_ARCHITECTURE §9.1): the default route every menu row
 * navigates to — the existing FE-PUB-04 landing page. Surfaces may override via `hrefFor`.
 */
export function categoryHref(node: Pick<CategoryNodeVM, "slug">): string {
  return `/marketplace/category/${node.slug}`;
}
