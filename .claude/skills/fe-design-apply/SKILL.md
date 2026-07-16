# fe-design-apply Skill

**Invoke:** `/fe-design-apply`

## Purpose
Apply existing frozen design patterns to new UI. Speeds up page/component design by reusing pattern templates instead of inventing new ones.

## When to Use
- "Build this page using the frozen kit"
- "Design a vendor profile card"
- "Create a dashboard dashboard layout"
- Designing a new surface → want consistency with existing pages

---

## Pattern Composition

One surface usually composes **several** patterns: Pattern 1 is the workspace shell; the others
are content patterns that nest inside it. Never assume "one page = one pattern" — compose
deliberately and name the patterns in your plan.

| Surface | Composition |
|---|---|
| Workspace dashboard | 1 (shell) + 2 (stat/tile grid) + 5 (recent-items table) |
| Vendor profile | 3 (tabs) + 2 (catalog grid) + 5 (engagement list) |
| Quotation authoring | 8 (document flow) + 5 line-item variant + 7 (confirm modal) |
| Document workspace | 3 (tabs) + 5 (document list) + 7 (confirm modal) |
| Settings | 3 (tabs) + 4 (forms) |

**Composition rules:**
- Exactly **one page-level organizer** per page — Pattern 1, 3, or 8. Never two (no tabs inside tabs, no second competing shell).
- Any number of content patterns (2, 4, 5, 7) nest inside the organizer.
- Pattern 6 (hero) appears only on public/overview surfaces, never inside workspace content.

---

## Pattern Library

### Pattern 1: Sidebar + Content
**Use for:** Workspace/admin dashboards, settings, navigation-heavy surfaces

**Structure:**
```
[Logo]
[Primary Nav]
[Secondary Nav]
[Content Area]
[Footer]
```

**Frozen Components:** `SideBar`, `TopBar`, `Container`

**Examples in code:**
- Buyer workspace
- Vendor workspace
- Admin dashboard

**Checklist:**
- [ ] Sidebar: 256px fixed or responsive collapse
- [ ] Content area: max-width 1200px, centered
- [ ] Primary nav: 1–2 levels deep (don't nest >2)
- [ ] Logo/branding: consistent BrandLogo from kit

---

### Pattern 2: Card Grid
**Use for:** Marketplace, vendor list, product catalog, dashboard tiles

**Structure:**
```
[Title/Filter Bar]
[Grid of Cards]
  └─ [Card content with image/info/CTA]
[Pagination or Load More]
```

**Frozen Components:** `Card`, `Grid`, `Badge`, `Button`

**Examples:**
- Marketplace vendor list
- Product catalog
- RFQ list

**Checklist:**
- [ ] 12-column responsive grid (1 mobile, 2 tablet, 3–4 desktop)
- [ ] 24px gap between cards
- [ ] Card padding: 16px (small) or 24px (large)
- [ ] Border radius: 8px standard
- [ ] Image aspect ratio: 16:9 or 1:1 (be consistent)

---

### Pattern 3: Tabbed Workspace
**Use for:** Multi-section pages whose sections are **independent and browsed in any order** (vendor profiles, settings, document workspaces)

**Structure:**
```
[Breadcrumb/Header]
[Tab Navigation Bar]
  ├─ Tab 1: [Content]
  ├─ Tab 2: [Content]
  └─ Tab 3: [Content]
[Action Bar / Footer]
```

**Frozen Components:** `WorkspaceTabs` — a thin client wrapper over the kit `Tabs` primitives
(`src/frontend/primitives/tabs.tsx`). Home: `app/(app)/_components/vendor/shared/workspace-tabs.tsx`
(vendor) · `app/(app)/(buyer)/_components/buyer-workspace-tabs.tsx` (buyer). It is **not** in
`src/frontend/` — reuse the wrapper for your workspace; never hand-roll a tab component.

**Examples:**
- Vendor profile (overview, catalog, engagement history)
- Settings / organization / product-editor / microsite tabs (thin adapters over `WorkspaceTabs`)
- Document workspace (LOI, PO, Challan)

> The quotation builder is **no longer** a tab/step surface — the owner's 2026-07-06 format delta
> made it a single-scroll document flow → **Pattern 8**.

**Checklist:**
- [ ] Use the shared `WorkspaceTabs` wrapper (never a custom tab component)
- [ ] Lazy-load tab content where possible (`React.lazy`)
- [ ] Active tab state visible (underline or highlight)
- [ ] Tab count: 2–5 (max 6, or use dropdown)
- [ ] Content area: padding 16px or 24px

---

### Pattern 4: Form + Submission
**Use for:** Simple create/edit surfaces and settings — one short card of fields with one submit. (3+ frozen sections culminating in one submit → **Pattern 8** instead.)

**Structure:**
```
[Form Title / Description]
[Form Fields]
  ├─ Input
  ├─ Select
  ├─ Textarea
  └─ Checkbox
[Button Bar: Cancel / Submit]
```

**Frozen Components:** `Input`, `Select`, `Textarea`, `Checkbox`, `Button`, `Label`

**Checklist:**
- [ ] Labels above fields (not floating labels)
- [ ] 8px spacing between label and input
- [ ] Error state: red border + error text below
- [ ] Required indicator: red `*` after label
- [ ] Buttons: primary action (Navy/Button-primary), secondary (ghost)
- [ ] Form validation: server-side + client-side feedback
- [ ] Accessibility: `<label htmlFor="id">` pairing

**Governance:**
- **Never invent a field.** Fields come from the frozen contract (e.g. the 8 frozen quotation submit fields); a new field = Flag-and-Halt, not a design decision.
- Field order/grouping follows the page contract or the owning Doc-7 page spec — don't reorder for aesthetics.
- Never redesign an approval/state workflow in the form layer — state machines belong to Doc-4M; chips render frozen states only.
- Server-resolved identifiers (org, invitation, RFQ ids) are never user-typed — show an honest note instead of an input.

---

### Pattern 5: Data Table / List
**Use for:** RFQ lists, quotation lists, vendor directory, engagement document lists, comparison matrices, line-item breakdowns

> **There is no kit `Table` or `DataGrid`.** `DataListTable` is the single table primitive
> (Shared Platform Component Registry §4.2 CTO promotion, 2026-07-03). Coining a second table
> primitive is a Red-Flag architecture change — extend via props/cell renderers instead.

**Table vs Card Grid (Pattern 2):** scanning/comparing structured attributes across rows → table.
Browsing rich previews (images, descriptions, CTAs) → card grid. If the user's question is
"which one?", it's a table; if it's "what's out there?", it's a grid.

**Pick the variant first:**

| Variant | Shape | Build with | Reference |
|---|---|---|---|
| Listing | rows = records, first cell links to detail | `DataListTable` + `getRowHref` | RFQ / quotation lists |
| Wide listing | many columns, identity column pinned | `DataListTable` + `stickyFirstColumn` | vendor directory |
| Comparison matrix | rows = attributes, columns = entities | `ComparisonTable` (built ON `DataListTable`) | `src/frontend/components/comparison/` |
| Line-item / financial | numbered lines + footer totals (Subtotal/VAT/Total) | follow `PriceBreakdownTable` shape (feature-local) | `app/(app)/_components/vendor/rfq/price-breakdown-table.tsx` |

**The `DataListTable` API is the spec** (`src/frontend/components/data-list-table.tsx` — read its header before styling anything):

| Prop | Rule |
|---|---|
| `columns[].numeric` | amounts/quantities/dates → right-aligned + `tabular-nums`; header alignment follows |
| `columns[].hideOnMobile` | column priority — keep only the 2–3 identity/decision columns below `sm` |
| `getRowHref` | first cell links to the detail (opaque-id route) — the **default** row action; no icon-button clusters |
| `caption` (required) | sr-only description; doubles as the scroll-region label on sticky tables |
| `emptyState` (required) | caller-supplied — use kit `EmptyState` |
| `stickyFirstColumn` / `rowHeaderFirstColumn` | matrix + wide tables; first column becomes `<th scope="row">` |

**Column & cell rules:**
- [ ] Money: kit `CurrencyDisplay` always — currency comes from the **same value field** the contract carries (Doc-2 §0.4), never hardcoded, never hand-formatted
- [ ] Absent value: render `—` (muted em-dash) — never `0`, never invented copy
- [ ] Status: `Badge` / the frozen state-chip components — **never invent a state label or color mapping** (Doc-4M owns state machines)
- [ ] Long text (names 100+ chars): truncate in the cell renderer; the full value lives on the detail page
- [ ] Column budget: ≤ 6–7 on desktop; more → move fields to the detail page, not smaller text

**Interaction rules:**
- [ ] Rows render in **contract order** — the table never re-sorts/re-ranks (GI-04 / R6). Buyer-controlled sorting exists only where the corpus grants it (e.g. Compare Workspace, Doc-3 §9.1) and is applied **upstream** of the table — never a default click-header feature
- [ ] Filters/search above the table, contract-backed only — no client-side filtering of governed lists
- [ ] No bulk-select checkboxes unless a contract action consumes the selection
- [ ] Destructive row actions → Pattern 7 modal, never a bare icon button
- [ ] Pagination only when the contract paginates; count/total shown **only when the contract provides it** — never computed client-side

**Frozen visual style (don't override):** `text-2xs` uppercase muted headers · border-separated
rows (**no zebra striping**) · fixed density (`py-2.5`) · `hover:bg-accent/60` · horizontal scroll
on mobile (built in — **never** stacked cards). No vertical-sticky header exists; long lists get
pagination, not a hand-rolled sticky `<thead>`.

**States:** empty → kit `EmptyState`, copy must never imply exclusion or a hidden filter
(GI-12; Invariant #11) · loading → route `loading.tsx` skeleton mirroring the column layout
(see `/ivendorz-verify-fe` Layer 5) · derived totals not yet wired → honest note
("Totals and VAT calculate in the integration phase"), never a fake number.

**A11y (mostly built in — don't undo it):** sr-only `<caption>` · `scope="col"`/`scope="row"` ·
keyboard-focusable labelled scroll region on sticky tables · link underline-on-hover in the first cell.

**Anti-patterns:**
- ❌ Hand-rolled `<table>` where `DataListTable` fits (duplication-as-architecture — Review-A MINOR+)
- ❌ Click-to-sort headers as a default feature (re-ranking hazard on governed lists)
- ❌ Client-computed totals, counts, or "0 of N" copy
- ❌ Empty copy like "No vendors match your criteria" on governed lists (could reveal exclusion)
- ❌ Zebra striping, custom row heights, or promoting a feature-local table to the kit without the registry process

---

### Pattern 6: Hero / Header Section
**Use for:** Landing pages, workspace overviews, page introductions

**Structure:**
```
[Large Headline / Image]
[Subtitle / CTA]
[Supporting Content Grid]
```

**Frozen Components:** `BrandLogo`, `Button`, `Card`

**Checklist:**
- [ ] Headline: largest type size (use `text-4xl` or `text-5xl`)
- [ ] Subheading: one level smaller (use `text-2xl` or `text-3xl`)
- [ ] CTA button: Navy primary, 40–48px height
- [ ] Background: use semantic color (`--iv-navy-50` for light bg)
- [ ] Spacing: generous (48–64px padding)
- [ ] Hero image: 16:9 aspect, high quality

---

### Pattern 7: Modal / Dialog
**Use for:** Confirmations, alerts, form dialogs

**Structure:**
```
[Title]
[Content]
[Button Bar]
```

**Frozen Components:** `Modal`, `Button`, `Alert`

**Checklist:**
- [ ] Title: clear, action-oriented ("Confirm Delete?", not "Alert")
- [ ] Content: concise, one job per modal
- [ ] Primary action: Navy/Button-primary (e.g., "Delete")
- [ ] Secondary action: Ghost (e.g., "Cancel")
- [ ] Backdrop: semi-transparent (prevents interaction outside)

---

### Pattern 8: Document Flow (single-scroll stacked cards)
**Use for:** Compose/authoring surfaces that culminate in **one submit** — quotation authoring, structured document creation

**Canonical implementation (owner-ratified format delta, 2026-07-06):** `QuotationBuilder` —
`app/(app)/_components/vendor/rfq/quotation-builder.tsx`. This format **replaced** the earlier
7-step `WorkspaceTabs` step rail. Do not build a new step-wizard.

**Structure (top → bottom, one scroll):**
```
[Navy hero band]      — state chip · human ref (font-mono) · window/deadline chip · one key value (right, amber)
[Context strip card]  — counterpart parameters (already-granted contract fields, 2/4-col grid)
[Section cards]       — one Card per FROZEN field group, in frozen order
[Preview card]        — own-data-only summary (skippable — still renders, user scrolls past)
[Submit card — LAST]  — the single gate/quota-consuming action
```

**Checklist:**
- [ ] Hero: `bg-iv-navy-900` band inside a `Card` with `overflow-hidden`; ref in `font-mono text-2xl`; labels `text-2xs` uppercase `text-iv-navy-200`; key value `text-iv-amber-400 tabular-nums`
- [ ] State/window chips = frozen chip components — never invent a state
- [ ] Cards: `space-y-6` between; `CardHeader` `pb-3` + `CardTitle` `text-base`; optional one-line description + count `Badge`
- [ ] Sections = frozen field groups ONLY; a new section = a new field = Flag-and-Halt
- [ ] Server-resolved identifiers carry an honest note ("taken from your grant automatically — you do not enter them") — never user-typed
- [ ] Client-local behavior stated honestly ("Drafts are kept on this device"); unwired derived values get an honest note ("Totals and VAT calculate in the integration phase") — never a fake number or fake save
- [ ] The submit action appears exactly once, in the last card
- [ ] Line items inside the flow → Pattern 5 line-item variant (`PriceBreakdownTable` shape)

**Document Flow vs Tabs (3) vs Form (4):** tabs = independent sections browsed in any order ·
form = one short create/edit card · document flow = a linear composition of frozen sections ending
in one submit. If the surface has one submit and 3+ sections, default to document flow.

**Out of scope:** print/paper documents (CS A4 landscape, LOI/PO print views) are a separate
surface class with their own rules (print CSS, wet-ink signature blocks) — not this pattern.

---

### Palette Rules (Never Vary)

> **`app/globals.css` is the canonical implementation**; `tailwind.config.ts` exposes the utility
> names. This section mirrors it — on drift, globals.css wins and this doc is corrected. Corrected
> 2026-07-16: it previously listed `--iv-green-500`, `--iv-yellow-500`, `--iv-red-500`,
> `--iv-blue-500` and `--iv-slate-*` — **none of which has ever existed**. They were pre-migration
> hue names from before the 2026-06-30 navy migration; following them produced dead classes that
> failed silently. Retired names are **not** re-added to the codebase; the doc aligns to the code.

**Primary:** Navy (`--iv-navy-700`, `--primary`)
- Main nav, sidebar, primary buttons, headlines

**Interactive:** Indigo (`--iv-brand-500`, `--secondary`)
- Hover states, focus rings, secondary buttons, links

**Accent:** Gold (`--iv-amber-400`, `--accent`)
- Badges, premium features, highlights, icons

**Semantic status** — five families, each a 5-step ramp
(`-subtle` tint bg · `-muted` text-on-subtle · `-base` solid fill · `-bright` · `-text` dark-mode text):

| Meaning | Family | Typical use |
|---|---|---|
| Success | `--iv-success-*` | verified, active, won |
| Warning | `--iv-warning-*` | pending, under review, expiring |
| Danger | `--iv-danger-*` | rejected, overdue (**`danger`, never `error`**) |
| Info | `--iv-info-*` | new, submitted, invited |
| Neutral | `--iv-neutral-*` | draft, closed, inactive |

e.g. `bg-iv-success-subtle text-iv-success-muted` for a tint chip; `bg-iv-info-base` for a solid fill.

**Text / ink:** `--iv-fg` · `-strong` · `-secondary` · `-muted` · `-heading` · `-heading-strong`.
**⚠️ The utility family is `iv-ink-*`, not `iv-fg-*`** — write `text-iv-ink-secondary`; there is no
`text-iv-fg-*` class. Every other family keeps its name (`--iv-navy-700` → `bg-iv-navy-700`).

**Surfaces / borders:** `--iv-surface-*` (dark) · `--iv-light-*` (light) · `--iv-nav-*` (sidebar) ·
`--iv-chart-1…6`. Prefer the shadcn semantics where they exist (`bg-background`, `bg-card`,
`border-border`, `text-muted-foreground`).

**No generic hue family exists** (`green`/`yellow`/`red`/`blue`/`slate`) — by design. The migration
replaced hue names with the semantic ramps so colour is chosen by *meaning*, not hue. Reaching for a
hue name is the tell that you want a semantic token.

---

## Pattern Selection Matrix

Quick lookup — then compose per the Pattern Composition rules above.

| Surface | Pattern(s) |
|---|---|
| Workspace dashboard | 1 + 2 + 5 |
| Marketplace / catalog browse | 2 |
| Vendor profile | 3 + 2 |
| Settings / organization | 3 + 4 |
| Simple create/edit | 4 |
| RFQ / quotation lists, vendor directory | 5 |
| Compare / CS workspace | 5 (comparison matrix variant) |
| Line-item breakdown | 5 (line-item variant) |
| Landing / public overview | 6 (+ 2) |
| Confirmation / destructive action | 7 |
| Quotation authoring / document compose | 8 |

---

## How to Use This Skill

1. **Identify the surface type:** Is it a dashboard (sidebar+content)? A list (card grid or table)? A form? A compose-and-submit surface (document flow)? Check the Pattern Selection Matrix.
2. **Compose the patterns** — one page-level organizer (1, 3, or 8) + content patterns (see Pattern Composition)
3. **Copy the structure** and frozen components
4. **Customize content** (text, data, colors from palette)
5. **Verify against checklist** (do all items ✓?)

---

## Example: Build a Vendor Profile Page

**Surface type:** Multi-section workspace → **Pattern 3: Tabbed Workspace**

**Structure:**
```
Tab: Overview
  ├─ Vendor info card (name, location, rating)
  ├─ Capability matrix (4 checkboxes)
  └─ Trust score badge

Tab: Catalog
  └─ Product card grid (Pattern 2)

Tab: Engagement
  └─ Document timeline (custom, but use Card components)
```

**Checklist:**
- [ ] Use `WorkspaceTabs` (shared wrapper)
- [ ] Cards: 16px or 24px padding
- [ ] Colors: Navy headings, Indigo links, Amber badges
- [ ] Type: headlines `text-2xl`, body `text-base`
- [ ] Responsive: mobile collapse tabs to dropdown

---

## Anti-Patterns (Don't Do)

- ❌ Invent a new card layout (use Pattern 2)
- ❌ Build a custom tab component (use `WorkspaceTabs`)
- ❌ Build a step-wizard for a compose surface (use Pattern 8 document flow)
- ❌ Hand-pick colors (use tokens only)
- ❌ Two page-level organizers on one page (tabs inside tabs, a second competing shell)
- ❌ Use more than 5 colors (use Navy, Indigo, Gold + semantics)

---

## Reference

- `/ivendorz-fe-design` — frozen palette, typography, kit
- `src/frontend/` — component exports
- `src/frontend/components/data-list-table.tsx` — the table primitive (its header comment is the spec)
- `app/(app)/_components/vendor/rfq/quotation-builder.tsx` — canonical document flow
- **Doc-7B–7G:** Page-level UI specs (examples of applied patterns)
- **Memory:** `brand-palette-migration.md`, `frontend-foundation-frozen.md`
