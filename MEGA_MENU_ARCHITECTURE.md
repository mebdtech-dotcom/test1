# Mega Menu System — Architecture

**Status:** DRAFT v1.0 — design companion (NON-authoritative; supplements Doc-7 program; on conflict
the frozen corpus wins). **Documentation only — no implementation until approved.**
**APPROVED — owner Board session 2026-07-03** (with Taxonomy Content v1.0 P1; FE-PUB-09 build
authorized, phases 0–5). Owner deltas adjudicated 3 rounds → **§9 Approval Addendum** below; the
v1.0 body above is unchanged (additive-only discipline).
**Date:** 2026-07-02 · **Companions:** `MEGA_MENU_COMPONENT_SPEC.md` · `MEGA_MENU_DATA_MODEL.md` ·
`MEGA_MENU_UX_FLOW.md` · `MEGA_MENU_IMPLEMENTATION_PLAN.md` · realizes `information_architecture.md`
§5.3 + `ux_patterns.md` §3.2 (**Industrial Category Explorer**) · consumes **Taxonomy Content v1.0**
(`productSpec/CATEGORY_TAXONOMY_REVIEW.md` — canonical, not redesigned here).

---

## 0. Position in the platform

- **Naming.** The design corpus already renamed the consumer "mega menu" to **Industrial Category
  Explorer** for the public surface (IA §5.3). This package keeps that surface name; *"Mega Menu
  system"* refers to the reusable component family beneath it. Component names use the `MegaMenu*` /
  `CategoryTree*` prefixes; the public header instance is branded the Explorer.
- **Presentation layer only.** The system renders taxonomy data it is given. It never fetches inside
  the kit (kit rule BR4/BR10: no data fetch, no authoritative state, no domain hooks), never mutates
  taxonomy, never computes counts (GI-03), and never re-ranks anything (Content ≠ Presentation).
- **Single source of truth.** Taxonomy Content v1.0 (794 nodes, 13 roots, ≤4 levels — the frozen
  `level CHECK 1–4` guarantees depth) — hierarchy, names, and slugs are consumed verbatim. The
  **4-level cap is a data guarantee, not a rendering constant**: rendering is depth-recursive with no
  hardcoded level limit.
- **Known gap.** Public anonymous tree data is blocked by **`[ESC-7-API-CATNAV]`** (no Public
  `list_categories` projection). Architecture is adapter-based so surfaces work now from a build-time
  seed and switch to the contract without component changes (`MEGA_MENU_DATA_MODEL.md` §4).

## 1. Package layout (kit home — adapted recommendation)

The reusable-navigation-package recommendation is adopted, homed under the **frozen kit root
`src/frontend/`** (not `src/components/` — the kit home is settled platform foundation):

```
src/frontend/navigation/
├── mega-menu/                      # composed menu surfaces
│   ├── mega-menu.tsx               # MegaMenu (root, desktop)
│   ├── mega-menu-trigger.tsx       # MegaMenuTrigger
│   ├── mega-menu-content.tsx       # MegaMenuContent (popover panel)
│   ├── mega-menu-column.tsx        # MegaMenuColumn
│   ├── mega-menu-section.tsx       # MegaMenuSection
│   ├── mega-menu-category.tsx      # MegaMenuCategory (row/link item)
│   ├── mega-menu-featured.tsx      # MegaMenuFeatured
│   ├── mega-menu-search.tsx        # MegaMenuSearch (visible-node filter only)
│   ├── mega-menu-footer.tsx        # MegaMenuFooter
│   ├── mega-menu-mobile.tsx        # MegaMenuMobile (accordion drawer)
│   └── mega-menu-breadcrumb.tsx    # MegaMenuBreadcrumb (mobile drill trail)
├── category-tree/                  # headless-ish tree building blocks
│   ├── category-tree.tsx           # CategoryTree (recursive renderer)
│   ├── category-node.tsx           # CategoryNodeItem (one node row)
│   ├── category-card.tsx           # CategoryCard (rich tile; wraps kit CategoryTile idiom)
│   ├── category-icon.tsx           # CategoryIcon (registry-resolved)
│   └── category-badge.tsx          # CategoryBadge (new/featured/comingSoon chips)
├── providers/
│   ├── taxonomy-provider.tsx       # TaxonomyProvider — holds resolved tree + index (client ctx)
│   └── menu-state-provider.tsx     # NavigationMenuStateProvider — open/active/path UI state
├── model/
│   ├── types.ts                    # CategoryNodeVM, presentation overlay types
│   ├── taxonomy-index.ts           # byId/bySlug/children maps, path + filter helpers (pure)
│   └── icon-registry.ts            # category icon map (serializable key → Lucide), NAV_ICONS idiom
└── index.ts                        # package surface (re-exported from src/frontend/index.ts)
```

**New primitives required** (demand-driven vendoring, per kit policy — these do not exist yet):
`navigation-menu` (Radix), `accordion` (Radix), `popover` (already on the deferred list). Vendored
into `src/frontend/primitives/` with `--iv-*` theming like the existing twelve; the mega-menu tier
composes them and never talks to Radix directly.

**Consumers (one renderer, many surfaces):** public header Explorer · public mobile drawer nav ·
`/categories` full-page explorer · marketplace sidebar tree · buyer RFQ category picker (single-select,
gate-A2 target) · vendor onboarding category selector (multi-select, ≤10/≤5 caps shown, selection
enforcement stays app-side) · admin category browser. Pickers reuse `category-tree/` with selection
props; they do not fork rendering.

## 2. Component hierarchy

```
TaxonomyProvider (data: resolved CategoryNodeVM forest + index)
└─ NavigationMenuStateProvider (UI state: open, activePath[], drill stack, query)
   ├─ MegaMenu (desktop ≥ lg)
   │  ├─ MegaMenuTrigger ("All Categories" / per-root triggers)
   │  └─ MegaMenuContent            role=region, labelled panel
   │     ├─ MegaMenuSearch          (filters visible nodes only)
   │     ├─ MegaMenuColumn × N      (N = drilled depth, max 4 — data-bounded)
   │     │  └─ MegaMenuSection
   │     │     └─ MegaMenuCategory  (→ CategoryIcon · CategoryBadge · name · optional description)
   │     ├─ MegaMenuFeatured        (featured overlay nodes; optional slot)
   │     └─ MegaMenuFooter          ("View all …" links; contract-provided counts only, else none)
   └─ MegaMenuMobile (< lg; Sheet-based drawer)
      ├─ MegaMenuBreadcrumb         (drill trail + back)
      ├─ MegaMenuSearch
      └─ CategoryTree (accordion mode, lazy-mounted children)
```

`CategoryTree` is the shared recursive core; `MegaMenuColumn` and the mobile accordion are two
*projections* of the same node list + state, so desktop/mobile/picker never duplicate traversal
logic.

## 3. State management

| State | Where | Notes |
|---|---|---|
| Taxonomy data (forest + index) | `TaxonomyProvider` — immutable value, resolved **outside** the kit (server component / static seed) and passed down once | Never refetched by components; no duplication — single normalized index, nodes referenced by id |
| Open/closed, hover intent | `NavigationMenuStateProvider` (wraps Radix NavigationMenu state) | Hover-open with intent delay + safe-triangle (§UX doc); click/focus fallback |
| Active path (`activePath: id[]`) | `NavigationMenuStateProvider` | Single source for which columns render; length ≤ tree depth; drives desktop columns AND mobile drill stack |
| Search query + filtered id-set | `NavigationMenuStateProvider` | Pure filter over the index (name + slug + provided synonyms); debounced ~120 ms |
| Selection (pickers only) | **App-side, via props** (`value`/`onSelect`) | Caps (≤10/≤5), validation, persistence are application/domain concerns — never in the kit |
| Theme | none — tokens | Components read `--iv-*` semantic tokens; light/dark/future brands = zero code change |

No global store, no state library: two narrow contexts + controlled-prop escape hatches
(`open`/`onOpenChange`, `activePath`/`onActivePathChange`) so embedding apps can drive the menu.

## 4. Data flow

```
Taxonomy Content v1.0 (canonical)
   │  build step (Phase 1: generate from migration-plan Appendix C)
   ▼
taxonomy seed (static JSON, ~60 KB → ~15 KB gz)          ── later ──►  Public list_categories
   │  server component resolves + merges                              projection (ESC-7-API-CATNAV)
   ▼                                                                   via the same adapter interface
presentation overlay (icons/featured/order — keyed by slug, FE-owned)
   ▼
CategoryNodeVM forest + TaxonomyIndex  ──►  TaxonomyProvider  ──►  components (render only)
```

One direction, no back-channel: components emit navigation (hrefs) and callbacks (`onSelect`,
analytics hooks); nothing writes taxonomy. Counts/featured-supplier data render **only when
contract-provided** through the overlay (GI-03 — absence renders nothing, never a fabricated number).

## 5. Accessibility architecture (summary — full flows in UX doc)

- **Pattern:** WAI-ARIA **disclosure navigation** (recommended APG pattern for site-nav mega menus) —
  NOT `role="menu"` (menubar semantics break link navigation and screen-reader expectations).
  Triggers are buttons with `aria-expanded` + `aria-controls`; panel content is plain `<nav>` with
  lists of links; columns are labelled groups.
- Keyboard: TAB through triggers/links · Arrow keys move within and across columns · Enter/Space
  activates · ESC closes and returns focus to trigger · typeahead within a column · focus trap only
  in the mobile Sheet (never on desktop popover).
- Screen readers: each column labelled by its parent node name; drill state announced via
  `aria-current` on the active parent; search results count announced politely (`aria-live`).
- Touch targets ≥ 44 px; hover behavior has full click/tap parity (hover is an enhancement, never the
  only path).
- Reduced motion: all transitions honor `prefers-reduced-motion` (motion tokens already define
  durations/easings).

## 6. Responsive behavior (summary)

| Breakpoint | Surface | Behavior |
|---|---|---|
| ≥ lg (1024) | `MegaMenu` popover | Trigger row in header; hover/click opens; up to 4 columns, column count = drilled depth; no panel scroll until >~14 rows/column (then column-local scroll) |
| md | Same popover, ≤ 2 visible columns | Deeper drills replace columns (pane-swap) instead of adding |
| < lg mobile | `MegaMenuMobile` in kit `Sheet` | Accordion + drill-in panes, breadcrumb + back, animated (see UX doc); matches ux_patterns §3.2 "collapses to accordion drawer" |

## 7. Performance

- **Data:** whole tree ships once (794 nodes is small); normalized index built once
  (`taxonomy-index.ts`), memoized by reference. No per-surface copies — every consumer shares the
  provider value.
- **Render laziness:** column N mounts only when `activePath[N-1]` exists; mobile accordion children
  mount on first expand (and stay mounted for back-nav snappiness). Panel content is
  dynamic-imported (`next/dynamic`) so the header pays nothing until first open; trigger row is
  server-rendered.
- **Memoization:** node rows memoized on `(node.id, isActive, isFiltered)`; state provider exposes
  granular selectors so hover changes re-render only the affected column, not the panel.
- **Virtualization:** *not needed at v1.0 scale* (max sibling list ≈ 13). Threshold documented: if any
  sibling list exceeds ~50 (future markets), virtualize that column list only — decision recorded so
  nobody adds the dependency preemptively.
- **SEO:** L1/L2 links render in server HTML (crawlable `<a href>` to category routes) inside a
  `<nav aria-label="Categories">`; the interactive panel enhances progressively. Slugs come from
  taxonomy verbatim; SEO title/description fields ride the overlay for the future landing pages
  (NET-NEW surface — see data-model doc §5).

## 8. Boundaries (what this package must never do)

Never hardcode categories · never duplicate/fork taxonomy data · never fetch inside kit components ·
never implement product search (`MegaMenuSearch` filters already-loaded taxonomy nodes only —
`search_catalog` remains the search engine) · never invent counts/badges (overlay- or
contract-provided only) · never encode Trust/Tier/Performance signals in navigation · never gate or
rank anything (matching is M3's; menus are links).

---

## 9. Approval Addendum (v1.1, 2026-07-03 — additive; owner Board findings folded at approval)

### 9.1 Category Landing Contract (MAJOR-01)

Navigation must not end at the menu. **Every menu row navigates to the existing FE-PUB-04 landing
route `/marketplace/category/[slug]`** (P-PUB-08) — this supersedes the spec's earlier
`/categories/[slug]` default `hrefFor`; the component default is updated, surfaces may still
override. The landing page is rebound from the interim 15-category seed to the taxonomy-v1 index
(all 794 active slugs resolve; unknown slug 404s byte-identically, Invariant #11) and enriched
additively: hero = name + full ancestor breadcrumb (`pathTo`) + overlay `description`; a **Related
Categories** rail (siblings + children — derived from the taxonomy, never fabricated); vendor/
product counts and Featured Suppliers stay contract-gated (GI-03, `[ESC-7-API-CATNAV]`) with the
existing in-page interim disclosure.

### 9.2 Vendor discovery in the panel (MAJOR-02 — Invariant #1 binding)

A `MegaMenuVendors` slot may render "Top Vendors for {category}" rows (≤5) + a "View all
suppliers →" link to `/vendors`, **only when the app supplies vendor data** (interim: the curated
discovery seed, same source as FE-PUB-04). **Binding:** vendor typing renders only the frozen
4-flag capability matrix (Supply / Service / Fabricate / Consult — Invariant #1, the existing
`VENDOR_FACETS` idiom). Trade-role labels ("Manufacturer", "Importer", "Distributor",
"Contractor") were raised and **REJECTED as coined vendor classifications**; re-raisable only as a
corpus/taxonomy amendment, never in this package.

### 9.3 Desktop layout breakpoints (R2-MINOR-03)

| Viewport | Layout |
|---|---|
| < 1024px | Mobile drawer (`MegaMenuMobile`) |
| 1024–1280px | Popover panel, up to 4 drill columns |
| 1280–1600px | Popover panel, up to 5 columns (4 drill + featured/vendors rail) |
| > 1600px | Panel capped at the 1440px max-width token, centered under the trigger row |

### 9.4 z-index ladder (R2-NITPICK-01)

The platform ladder already exists as named tokens (`app/globals.css`): `--iv-z-raised: 10` <
`--iv-z-dropdown: 100` < `--iv-z-sticky: 200` < `--iv-z-overlay: 300` < `--iv-z-modal: 400` <
`--iv-z-toast: 500` < `--iv-z-tooltip: 600` — this addendum **conforms to it, reorders nothing**.
One additive token: **`--iv-z-mega-menu: 250`** — above the sticky header it hangs from, below
every overlay/modal layer, so the panel never overlays an open dialog, sheet, toast, or tooltip.
Panel max-width is a dedicated additive token **`--iv-mega-menu-max: 1440px`** (the existing
`--iv-content-max: 1280px` is not repointed).

### 9.5 Preload & prefetch ladder (R2-MINOR-04 · R2-NITPICK-04)

Taxonomy data ships with the page (server-resolved) — the ladder applies to code and routes:
first sustained hover intent (~150–200 ms) → preload the `next/dynamic` panel chunk + build/memoize
the taxonomy index → subsequent opens are instant (< 100 ms budget). Route prefetch of the hovered
category landing fires only after the same sustained intent — never on pointer fly-by.

### 9.6 Performance budget table (R3-NITPICK-03)

Package-level engineering budgets (consolidates the numbers this package already states; coins no
platform budget — Doc-8 owns those):

| Metric | Target |
|---|---|
| Initial panel open (post code-load) | < 100 ms |
| Search response (filter render) | < 50 ms |
| Drill navigation | < 16 ms/frame |
| Panel bundle chunk | ≤ 25 KB gz (excl. icons) |
| Hover-intent preload/prefetch trigger | 150–200 ms |

### 9.7 Reserved-disabled AI slots (future, M9-gated)

"Recommended For You" / "Based on RFQs" / "Trending" / "Seasonal Demand" are recorded as reserved
panel slots, **disabled and unbuilt** until recommendation services exist; any activation is
M9-governed ("AI suggests; modules decide") and requires its own gate. No code ships for them.
