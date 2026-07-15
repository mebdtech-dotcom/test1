# iVendorz — Screen Specifications

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.3** — Screen Specifications (non-authoritative companion to the Doc-7 program)
**Date:** 2026-06-29
**Wave:** 0.3 — Governance Refactor (the highest-value de-duplication of the 0H screen set)
**Revision v0.3:** de-duplicated against [`shared_conventions.md`](../../frontend/components/shared_conventions.md) (SC). Per-page
inherited defaults (loading/skeleton, RSC/performance, analytics disclaimer, accessibility, responsive,
error/success boilerplate, in-action authority citations) are **stated once in SC** and inherited via the
**Inherited-From banner** (SC §2); each page now carries **only its deltas**. Coins nothing; all 144
pages preserved.
**Companions:** [`shared_conventions.md`](../../frontend/components/shared_conventions.md) (SC — GI/presets/grammar) ·
[`design_philosophy.md`](../../frontend/design-system/design_philosophy.md) (DP) · [`information_architecture.md`](../information-architecture/information_architecture.md) (IA) ·
[`ux_patterns.md`](ux_patterns.md) (UX) · [`marketplace_ux.md`](marketplace_ux.md) (MX, `J-*`) ·
[`page_inventory.md`](page_inventory.md) (PI — the 144 `P-*` pages, §12 nav, §13 attributes/planning matrix) ·
[`page_templates.md`](../../frontend/design-system/page_templates.md) (PT — `T-*` templates) · [`esc_registry.md`](../../../esc_registry.md) (ER) ·
[`glossary.md`](../../reference/glossary.md) (GL).

---

## 0. Precedence & Authority (read first)

A **non-authoritative companion**. It turns each of the **144 enumerated pages** (PI, Wave 0F) into an
**implementation-ready screen specification** — instantiating its template (PT `T-*`), its UX patterns,
its journey (MX `J-*`), and its PI §13 attributes. It is **realization, not redesign**: it **coins no
architecture, route, contract, state, transition, permission, event, component, or page**. Every
component name is from the **Doc-7B kit**; every contract binding is the one already named in PI; every
state/transition is **Doc-4M**; every gap is an **existing** ER handle. **Conforms upward; coins nothing.**

```
Master → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                                                        ▲ this doc conforms upward
```

- **This doc sits BELOW the entire frozen Doc-7 program and BELOW SC.** On any conflict, **the frozen
  document wins and this file is patched to match** (CLAUDE.md §7, §11).
- **Page IDs (`P-*`), Journey IDs (`J-*`), Template IDs (`T-*`)** are document-internal handles; the
  authoritative route topology + surfaces are **Doc-7C / Doc-7D…7H**. **Routes carry opaque IDs (UUIDs),
  never human refs** (IA §8); refs like `RFQ-2026-000123` are display labels only.
- **Analytics event names** here (e.g. `rfq.created`) are **presentation telemetry** governed once by
  **SC §4** — they coin no Doc-2 §8 domain event. Per-page fields list event **names only**.
- ESC handles are defined once in **ER**; cited here as bare handles.

> **Scope of Wave 0H:** the *screen* — the page realized as components, regions, states, actions, and
> behaviors. **A specification, not code.** This document does not implement React.

---

## 1. The Screen Spec Schema (defined once)

Every page is specified with the same field list. **DRY by reference:** each field names only the
**page-specific realization**; everything else is **inherited** from SC §1 (GI-01…GI-12) and the page's
template/preset/journey/PI-§13 attributes. **An omitted field means "as inherited," not "missing."**
`—` means "not applicable to this page."

| Field | Meaning (and what it inherits) |
|---|---|
| **Page ID** | The `P-*` handle (matches PI exactly). |
| **Purpose** | One line — the user job this screen does. |
| **Journey** | The `J-*` step(s) it realizes (MX). Inherited; not re-described. |
| **Template** | The `T-*` template it instantiates (PT). The template owns the regions; this spec fills them. |
| **Required / Optional components** | Doc-7B kit components the screen renders (always / conditionally). |
| **Toolbar** | Page-header / top-of-content controls. **Default preset = SC §3.1** (`TB-*`); state only the delta. |
| **Actions** | **Doc-4M-permitted transitions only** (SC §1 GI-10); each maps to a wired command (named in PI). Named **plainly** — authority lives in GI/ledger, not in the action (SC §2). |
| **Search / Filters / Tables / Cards / Dialogs / Drawers** | Page-specific instances only. Lists inherit **cursor pagination + re-query-never-re-rank** (GI-03/GI-04); state only what is page-specific. |
| **AI integration** | `ai-advisory-panel` usage — advisory only, **non-recommending** (GI-11); list only when a real delta, else omit. |
| **Permissions** | Page-specific gating note. Access is **server-validated by wired read, never name-strings** (Invariant #10/#7); audience = PI §13 Actor (metadata only). Inherits GI-01/GI-12. |
| **Empty / Error / Success** | **Deltas only.** Defaults inherited from GI-05 (Empty = contract empty; Error branches `error_class`, surfaces `reference_id`; Success = toast/route + optimistic reconcile on 409). State page-specific copy/behavior only. |
| **Analytics** | Event **names** only (SC §4 grammar; non-disclosure-bound by GI-12). |
| **Future** | SC §5 vocab only (`—` · `Localization` · `AI` · `Analytics` · `ESC-<id>` · `Later wave`). |

**Inherited by pointer (never restated per page) — see SC §1:** Shell mount + server-resolved active-org
(GI-01); RSC reads / server-action writes (GI-02); **Loading = skeleton preset** (SC §3.2 `SK-*`, GI-05);
**Performance = RSC streaming behind skeletons, no invented budgets** (GI-11 posture); **Accessibility =
WCAG-AA baseline** (GI-06); **Responsive = mobile-first + mobile presets** (SC §3.3 `MB-*`, GI-07);
currency `{amount, currency}` BDT default (GI-08); files → Storage `file_ref`, async create-then-poll
(GI-09); **non-disclosure / byte-equivalence + analytics-coins-no-domain-event** (GI-12). **Planning
metadata (Complexity / Priority / Interaction / Visual-hierarchy / Devices / Search) lives in PI §13** —
referenced, never duplicated here. **Test → Doc-8.**

### 1.1 Global inheritances

Stated once in **SC §1 (GI-01…GI-12)** and the SC §2 banner convention. **Not re-listed here.** Every
page below opens with an **Inherited-From banner** and documents **deltas only**:

```text
Inherits: GI · T-<TEMPLATE from PI> · TB-<preset> · SK-<preset> · MB-<preset> · planning → PI §13
Deltas:   <only what differs>
```

### 1.2 Template → handle map (PT, referenced by stable ID)

`T-LANDING` · `T-STATIC` · `T-LISTING` (filter rail + data-table + cursor pagination) · `T-DETAILS`
(hero + tabs + side metadata) · `T-DASHBOARD` (KPI/stat cards + activity + queues) · `T-WIZARD`
(stepper + resumable draft) · `T-SETTINGS` (form sections + save bar) · `T-MANAGEMENT` (admin tables +
queues + bulk actions) · `T-ANALYTICS` (charts + KPI cards) · `T-AUTH` (centered card, minimal chrome) ·
`T-STATE` (system state page). *(PT owns the prose; this doc binds only the stable IDs.)*

---

## 2. Shell Surface — `P-SH-*` (Doc-7C)

> Cross-cutting screens any surface can reach. The shell chrome itself (nav, org-switcher, notification
> center, palette) is Doc-7C-owned (GI-01), not re-specified.

### P-SH-01 · Global search results
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · MB-LIST · planning → PI §13
Deltas: **Purpose:** present search hits across the active surface's entity set. **Required:** search · data-table (or result cards) · status-chip · pagination-control · tabs (result type). **Optional:** trust-badge (vendor hits), currency-display (doc/quotation hits), filter. **Toolbar delta:** scope tabs (Products / Vendors / RFQs / Quotations / Docs per surface, IA §5.1). **Actions:** open a result (navigate only — no mutation). **Search:** surface-scoped wired reads (`search_catalog`, `list_vendor_directory`, `list_rfqs`, `list_quotations_for_rfq`, post-award reads) — **never an unbound type** (IA §5.1). **Filters:** contract facets per active scope. **Tables:** per-type columns; no bulk actions. **Cards:** vendor/product result cards (read-only). **Drawers:** mobile filter sheet. **AI:** "Ask AI" hands to palette/panel — advisory only. **Permissions:** results gated by each wired read; **non-disclosure absolute** — a hidden entity never appears. **Accessibility delta:** results as labeled list; live-region announces result count; arrow traversal. **Empty:** "No matches for '…'" + clear/broaden. **Analytics:** `search.performed` · `search.result_opened`. **Future:** Meilisearch swap (transparent).

### P-SH-02 · Notification center (full page)
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · MB-LIST · planning → PI §13
Deltas: **Purpose:** full history of M6 notifications with manage actions. **Required:** data-table/list · status-chip (read/unread) · badge · pagination-control · button. **Optional:** tabs (All / Unread / Archived), filter (type). **Toolbar delta:** mark-all-read · filter by type. **Actions:** mark notification read · archive notification (M6 `Doc-5H`). **Filters:** type/read-status. **Tables:** time · type · subject · state; row read/archive; selection + bulk mark-read. **Drawers:** mobile bottom-sheet row actions. **Permissions:** renders only what the wired M6 read discloses (Doc-7C §6.3). **Accessibility delta:** unread not color-only (icon+label); live region on new arrivals. **Empty:** "You're all caught up." **Success delta:** optimistic read/archive. **Analytics:** `notification.read` · `notification.archived`. **Note:** Realtime = transport → re-fetch wired read, never source of truth (Doc-7C §6.4). **Future:** per-type prefs deep-link to P-ACC-15.

### P-SH-03 · Not-found (404)
Inherits: GI · T-STATE · TB-NONE · planning → PI §13
Deltas: **Purpose:** neutral not-found with route back. **Required:** not-found primitive · button (back to known surface). **Optional:** restrained line-art (DP §4.5). **Permissions:** **byte-identical to genuine absence** — no copy/layout/timing/telemetry difference vs "forbidden" (Doc-7A §8.2; CHK-7-041). **Accessibility delta:** `role` heading, focusable back link. **Analytics:** **none page-specific** (telemetry parity with absence is mandatory — must not distinguish forbidden vs missing).

### P-SH-04 · Error (500)
Inherits: GI · T-STATE · TB-NONE · planning → PI §13
Deltas: **Purpose:** unexpected-error page with safe recovery. **Required:** error-state primitive · button (retry/back). **Optional:** line-art. **Actions:** safe retry / back only. **Error delta:** render from `error_class`/`error.message`; surface `reference_id`; no protected enrichment. **Accessibility delta:** error announced; focus to heading. **Analytics:** `error.viewed` with `reference_id` only (no protected facts).

### P-SH-05 · Maintenance / unavailable
Inherits: GI · T-STATE · TB-NONE · planning → PI §13
Deltas: **Purpose:** planned-downtime / dependency-unavailable notice. **Required:** state primitive · (optional) retry. **Actions:** retry. **Error delta:** `DEPENDENCY` (503) transient notice; backoff per declared interval. **Analytics:** `maintenance.viewed`.

### P-SH-06 · Forbidden
Inherits: GI · T-STATE · TB-NONE · planning → PI §13
Deltas: **Purpose:** access-denied **only where right-to-know exists**; otherwise **collapses to 404** (P-SH-03). **Required:** state primitive · button (back). **Permissions:** 403 shown **only** when right-to-know is established; else byte-identical to not-found (Doc-7A §8.2). **Analytics:** **none page-specific** (must not leak existence).

---

## 3. Public Surface — `P-PUB-*` (Doc-7D · Doc-5D public projection)

> Marketing chrome (top nav + Industrial Category Explorer + footer); **no session, no active-org, no
> org-switcher / notifications**. **Zero concept of buyer-private status** — a vendor blacklisted by one
> buyer still appears publicly (Invariant #11). **Published-only**; no draft leaks. SEO-first. Actor = Guest.

### P-PUB-01 · Home / Landing
Inherits: GI · T-LANDING · TB-NONE · SK-DASHBOARD · MB-DASHBOARD · planning → PI §13
Deltas: **Purpose:** convert anonymous industrial buyers; communicate value + entry to discovery. **Journey** J-GST-01. **Required:** marketing hero · section blocks · card · button (CTAs) · search (catalog entry). **Optional:** Industrial Category Explorer entry (UX §3.2), trust-badge (featured vendors, read-only), blueprint line-art. **Actions:** CTAs → `(auth)` (sign up / start RFQ / claim vendor) + catalog/directory navigation. **Search:** catalog quick-search → P-PUB-10 (`search_catalog`). **Cards:** featured vendor/category cards (public reads; trust read-only). **Drawers:** mobile nav drawer (shell). **Accessibility delta:** semantic landmarks, single H1, descriptive CTA labels. **Loading delta:** sectioned skeleton. **Empty:** n/a (curated). **Performance delta:** static/ISR-friendly, SEO-optimized. **Analytics:** `landing.cta_clicked` · `landing.search_started`. **Future:** Localization (Bengali hero).

### P-PUB-02 · About · P-PUB-03 · How it works · P-PUB-05 · For Buyers · P-PUB-06 · For Vendors
Inherits: GI · T-STATIC · TB-NONE · planning → PI §13
Deltas: **Purpose:** static marketing/segment pages. **Journey** J-GST-01. **Required:** section blocks · card · button (CTA). **Optional:** line-art. **Actions:** CTA → `(auth)` / discovery. **Accessibility delta:** semantic headings, reading order (`--iv-reading-max`). **Performance delta:** static, SEO. **Analytics:** `marketing.page_viewed` · `marketing.cta_clicked`. **Future:** Localization.

### P-PUB-04 · Pricing / Plans (public)
Inherits: GI · T-STATIC · TB-NONE · planning → PI §13
Deltas: **Purpose:** market the plans (commercial), drive sign-up. **Journey** J-GST-01. **Required:** pricing cards · button (CTA) · badge (plan tier marketing). **Optional:** comparison block (presentation; ungoverned). **Toolbar delta:** billing-cycle toggle (presentation). **Actions:** CTA → signup / P-ACC-16. **Permissions:** reads `list_plans` (public marketing read); **entitlements ≠ plan-name** at gate time (Invariant #10) — pricing markets plans but never gates by name. **Accessibility delta:** plan tables not color-only; per-plan labeled CTA. **Performance delta:** static/ISR, SEO. **Analytics:** `pricing.plan_cta_clicked`. **Future:** currency-aware pricing.

### P-PUB-07 · Categories index
Inherits: GI · T-LISTING · TB-LIST · SK-CARD · MB-LIST · planning → PI §13
Deltas: **Purpose:** entry to the industrial taxonomy. **Journey** J-GST-02. **Required:** Industrial Category Explorer (UX §3.2) · search · card (category). **Optional:** featured-vendor cards (trust read-only). **Toolbar delta:** in-explorer search. **Actions:** drill into category → P-PUB-08. **Filters:** facet-derived. **Cards:** category cards with product counts (facet aggregations). **ESC:** `ESC-7-API-CATNAV` — no public `list_categories` projection → render `search_catalog` facets only; featured-suppliers-per-node gated under same handle. **Accessibility delta:** explorer columns keyboard-navigable; hover-drill has keyboard equivalent. **Empty:** "No categories." **Analytics:** `category.explored`. **Future:** `ESC-7-API-CATNAV` (full tree on additive Doc-5D patch).

### P-PUB-08 · Category page · P-PUB-09 · Industry page
Inherits: GI · T-LISTING · TB-LIST · SK-CARD · MB-LIST · planning → PI §13
Deltas: **Purpose:** browse products/vendors within a category (P-08) or industry (P-09). **Journey** J-GST-02. **Required:** product/vendor result cards · search · filter · pagination-control. **Optional:** trust-badge, capability-matrix (vendor cards), breadcrumbs. **Toolbar delta:** sort · filter trigger · density. **Actions:** open product/vendor. **Search:** `search_catalog`. **Filters:** contract facets (category/capability/spec). **Tables:** card grid (discovery). **ESC:** `ESC-7-API-CATNAV` (facet-only); P-09 industry taxonomy is **not modeled** in the corpus → navigation reference only, coined nowhere (ER §1 non-ESC gaps). **Accessibility delta:** result list semantics; filter chips labeled. **Empty:** "No vendors/products match" + adjust filters. **Analytics:** `category.viewed` · `category.filtered`. **Future:** Later wave (industry as first-class taxonomy = architecture decision; escalate, IA §5.3).

### P-PUB-10 · Catalog search results
Inherits: GI · T-LISTING · TB-LIST · SK-CARD · MB-LIST · planning → PI §13
Deltas: **Purpose:** the primary public product/vendor discovery surface. **Journey** J-GST-03. **Required:** search · filter · product/vendor cards · pagination-control. **Optional:** trust-badge, capability-matrix, sort control, breadcrumbs. **Toolbar delta:** query input · sort · filter trigger · density. **Actions:** open result; "favorite"/"start RFQ" CTAs → `(auth)`. **Search:** `search_catalog` (critical). **Filters:** contract facets (GI-04). **Tables:** card grid. **ESC:** `ESC-7-API-PRODDETAIL` (product cards → P-PUB-11 interim from `search_catalog`); `ESC-7-API-ADS` (no anonymous ads); `ESC-7-API/related` (related/similar). **Accessibility delta:** result-count live region; keyboard pagination. **Responsive delta:** infinite scroll w/ load-more fallback (UX §2.5). **Empty:** "No matches for '…'." **Analytics:** `catalog.searched` · `catalog.result_opened`. **Future:** `ESC-7-API/related`; Meilisearch.

### P-PUB-11 · Product detail (public)
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** present a public product. **Journey** J-GST-03. **Required:** detail hero · tabs · file-link (spec docs) · button (enquire CTA) · breadcrumbs. **Optional:** trust-badge (vendor), capability-matrix, related "Same category" strip. **Toolbar delta:** enquire / contact vendor CTA → P-PUB-17 / `(auth)`. **Actions:** enquire (conversion). **Cards:** vendor card (read-only). **Drawers:** mobile detail sheet. **ESC:** `ESC-7-API-PRODDETAIL` — no public `get_product` → render interim from `search_catalog` result fields; related strip uses facets labeled "Same category", **never "Recommended"** (`ESC-7-API/related`). **Permissions:** published-only. **Accessibility delta:** spec tables not color-only; file-link descriptive. **Success delta:** enquiry → `(auth)`. **Analytics:** `product.viewed` · `product.enquiry_started`. **Future:** `ESC-7-API-PRODDETAIL` (full product page).

### P-PUB-12 · Vendor directory
Inherits: GI · T-LISTING · TB-LIST · SK-CARD · MB-LIST · planning → PI §13
Deltas: **Purpose:** browse/discover public vendors. **Journey** J-GST-03. **Required:** vendor cards · search · filter · pagination-control · trust-badge · capability-matrix. **Optional:** capacity-bar, sort, breadcrumbs. **Toolbar delta:** query · sort · filter trigger · density. **Actions:** open vendor → P-PUB-13. **Search:** `list_vendor_directory` (critical). **Filters:** contract facets (capability/category/location/tier). **Cards:** vendor card (name, category, location, trust chip read-only, tier, 4-flag capability matrix, capacity). **Permissions:** **trust displayed, never computed** (M5 owns; M2 reads); blacklist/private exclusion never rendered. **Accessibility delta:** capability matrix labeled per flag. **Empty:** "No vendors match." **Analytics:** `directory.searched` · `vendor.card_opened`. **Future:** Later wave (map/geo facet).

### P-PUB-13 · Vendor profile / microsite
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** the public vendor microsite (identity + trust). **Journey** J-GST-04. **Required:** detail hero (identity + trust ring) · tabs (Products / Projects / Capabilities / Contact) · trust-badge · capability-matrix · button (enquire). **Optional:** capacity-bar, score-ring, file-link, ai-advisory-panel (reserved). **Toolbar delta:** enquire CTA → P-PUB-17 · favorite → `(auth)`. **Actions:** enquire / favorite (conversion). **Search:** within microsite products. **Filters:** product facets (vendor-scoped). **Cards:** product/project cards. **AI:** advisory reserved (explain capabilities) — non-recommending. **Permissions:** published-only, trust read-only; no draft leaks. **Accessibility delta:** trust ring has text value; tab a11y. **Responsive delta:** sticky enquire CTA on M. **Analytics:** `vendor.profile_viewed` · `vendor.enquiry_started`. **Future:** AI · Localization.

### P-PUB-14 · Microsite — Products
Inherits: GI · T-LISTING · TB-LIST · SK-CARD · MB-LIST · planning → PI §13
Deltas: **Purpose:** the vendor's public catalog tab. **Journey** J-GST-04. **Required:** product cards · search · filter · pagination-control · breadcrumbs. **Optional:** trust-badge. **Toolbar delta:** sort · filter · density. **Actions:** open product → P-PUB-11. **Search:** vendor-scoped `search_catalog` / `get_public_vendor_profile`. **Filters:** vendor-scoped facets. **Cards:** product cards. **ESC:** `ESC-7-API-PRODDETAIL`. **Permissions:** published-only. **Empty:** "No products listed." **Analytics:** `microsite.products_viewed`.

### P-PUB-15 · Microsite — Projects/Portfolio · P-PUB-16 · Microsite — Capabilities/About
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** vendor portfolio (P-15) / capability + about (P-16). **Journey** J-GST-04. **Required:** detail panels · card (project) · capability-matrix (P-16) · file-link · breadcrumbs. **Optional:** capacity-bar, trust-badge. **Toolbar delta:** enquire CTA. **Actions:** enquire → P-PUB-17. **Cards:** project/portfolio cards. **Permissions:** `get_public_vendor_profile`; **capability = 4-flag matrix, never a label** (Invariant #1); published-only. **Accessibility delta:** matrix labeled per flag. **Empty:** "No projects/portfolio yet." **Analytics:** `microsite.projects_viewed` · `microsite.capabilities_viewed`.

### P-PUB-17 · Microsite — Contact / enquiry
Inherits: GI · T-DETAILS · TB-NONE · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** capture a buyer enquiry → conversion to `(auth)`. **Journey** J-GST-06. **Required:** form-field · button (submit) · breadcrumbs. **Optional:** conversation-thread (post-auth). **Actions:** submit enquiry → conversion to `(auth)` (no money, no governed-flow bypass; vendor invitations are **engine-only**, IA §4.9). **Dialogs:** confirm-enquiry. **Drawers:** mobile sheet. **Permissions:** Guest → handoff to auth. **Accessibility delta:** form labels, required not color-only, inline `field_errors`. **Error delta:** `VALIDATION` inline `field_errors`. **Success delta:** confirmation + route to `(auth)`. **Analytics:** `enquiry.submitted`. **Future:** Later wave (email-only supplier participation, reserved).

### P-PUB-18 · Trust & verification explainer
Inherits: GI · T-STATIC · TB-NONE · planning → PI §13
Deltas: **Purpose:** explain trust/verification signals (marketing/education). **Journey** J-GST-04. **Required:** section blocks · trust-badge (illustrative) · score-ring (illustrative). **Optional:** line-art. **Actions:** CTA → discovery. **Permissions:** signals shown are **illustrative/read-only** (not live private data). **Accessibility delta:** ring has text value. **Performance delta:** static, SEO. **Analytics:** `trust_explainer.viewed`. **Future:** Localization.

### P-PUB-19 · Industrial / advanced search
Inherits: GI · T-LISTING · TB-LIST · SK-CARD · MB-LIST · planning → PI §13
Deltas: **Purpose:** technical, spec-oriented discovery. **Journey** J-GST-03. **Required:** advanced search · filter (spec facets) · product/vendor cards · pagination-control · capability-matrix. **Optional:** progressive disclosure (Basic→Advanced→Expert facets, UX §5.4), trust-badge. **Toolbar delta:** advanced query builder · sort · filter trigger · density. **Actions:** open result. **Search:** `search_catalog` FTS. **Filters:** contract spec facets; **capability rendered as matrix not label** (Invariant #1). **Tables:** card grid / dense results. **Accessibility delta:** complex filters keyboard-operable; never hide required/compliance info behind a disclosure tier (UX §5.4). **Responsive delta:** advanced facets behind disclosure on M. **Empty:** "No matches." **Analytics:** `industrial_search.performed`. **Future:** Later wave (Meilisearch).

### P-PUB-20 · Compare (public)
Inherits: GI · T-DETAILS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** ungoverned side-by-side of public vendors/products (discovery aid). **Journey** J-GST-05. **Required:** comparison table (presentation) · vendor/product cards · button (add/remove). **Optional:** capability-matrix, trust-badge. **Toolbar delta:** add-to-compare · clear. **Actions:** add/remove compare items (local presentation). **Tables:** comparison grid (24-col, DP §2.10). **Cards:** compared entities. **Permissions:** **ungoverned** — **implies NO matching, ranking, or recommendation**; **distinct from governed RFQ comparison (P-BUY-15)**; never re-ranks M3; no buyer-private data exists here. **Accessibility delta:** comparison cells header-associated; no color-only. **Responsive delta:** Devices D/T (PI §13 — not mobile-primary); horizontal scroll on narrow. **Empty:** "Add items to compare." **Analytics:** `public_compare.item_added`.

### P-PUB-21 · Legal — Terms · P-PUB-22 · Legal — Privacy
Inherits: GI · T-STATIC · TB-NONE · planning → PI §13
Deltas: **Purpose:** legal documents. **Journey** —. **Required:** long-form reading layout (`--iv-reading-max`) · separator. **Optional:** in-page anchor nav. **Permissions:** Guest (footer-reached; Nav = Hidden). **Accessibility delta:** document landmarks, heading outline, anchor links. **Performance delta:** static, SEO. **Analytics:** `legal.viewed`. **Future:** Later wave (versioned legal, immutable history conceptually).

### P-PUB-23 · Resources / Blog
Inherits: GI · T-STATIC · TB-LIST · SK-CARD · planning → PI §13
Deltas: **Purpose:** SEO content hub (optional). **Journey** J-GST-01. **Required:** article cards · search · pagination-control. **Optional:** category filter. **Toolbar delta:** search · filter. **Actions:** open article. **Search:** content search. **Filters:** content tags (presentation). **Cards:** article cards. **Empty:** "No articles." **Performance delta:** static/ISR, SEO. **Analytics:** `resource.viewed`. **Future:** Localization.

### P-PUB-24 · Contact / Support (public)
Inherits: GI · T-STATIC · TB-NONE · planning → PI §13
Deltas: **Purpose:** public contact/support entry. **Journey** —. **Required:** form-field · button (submit). **Optional:** FAQ blocks. **Actions:** submit contact (no governed flow). **Drawers:** mobile sheet. **Accessibility delta:** form labels, inline `field_errors`. **Error delta:** `VALIDATION` inline. **Success delta:** confirmation toast. **Analytics:** `support.contact_submitted`. **Future:** Later wave (ticketing integration; escalate).

---

## 4. Auth-entry Surface — `P-AUTH-*` (Doc-7E · `(auth)`)

> **Centered-card chrome, minimal** (`T-AUTH`): brand mark, no nav, no org-switcher, no notifications.
> **No session may be held while authenticating** — `(auth)` is distinct from `(app)` (Doc-7C §2.1).
> All Nav = Hidden (PI §13). Authentication is **Supabase Auth** (auth only). Actor = Shared. TB-NONE.

### P-AUTH-01 · Login
Inherits: GI · T-AUTH · TB-NONE · SK-WIZARD · MB-WIZARD · planning → PI §13
Deltas: **Purpose:** authenticate an existing user. **Journey** J-BUY-01 / J-VND. **Required:** form-field (email/password) · button (sign in) · separator. **Optional:** OAuth buttons, "remember me" switch, link to reset/signup. **Actions:** sign in (Supabase Auth) → on success route into `(app)` (server resolves active-org). **Accessibility delta:** labeled inputs, autocomplete tokens, error announced. **Loading delta:** button busy state. **Error delta:** auth failure as generic **non-disclosing** message (no "user exists" leakage). **Success delta:** route to post-login destination. **Analytics:** `auth.login_succeeded` · `auth.login_failed` (no identity leakage). **Future:** Later wave (SSO; escalate).

### P-AUTH-02 · Signup
Inherits: GI · T-AUTH · TB-NONE · SK-WIZARD · MB-WIZARD · planning → PI §13
Deltas: **Purpose:** create a new user account → handoff to org setup. **Journey** J-GST-06. **Required:** form-field · button (create account). **Optional:** OAuth, terms checkbox (required), link to login. **Actions:** sign up (Supabase Auth) → P-AUTH-08 / P-AUTH-03. **Accessibility delta:** required not color-only, password requirements announced. **Loading delta:** button busy. **Error delta:** `VALIDATION` inline `field_errors`; existing-account message non-disclosing. **Success delta:** route to verification / org setup. **Analytics:** `auth.signup_succeeded`.

### P-AUTH-03 · Org setup (post-signup)
Inherits: GI · T-WIZARD · TB-NONE · SK-WIZARD · MB-WIZARD · planning → PI §13
Deltas: **Purpose:** create the user's first organization (**every user ≥1 org**). **Journey** J-BUY-02. **Required:** stepper · form-field · button (next/finish). **Optional:** participation-type selector (Buyer/Vendor/Hybrid — an org property), summary step. **Toolbar delta:** step nav. **Actions:** `create_organization` (Doc-5C §C5) → server resolves active-org. **Permissions:** authenticated, pre-org; **Users act, Organizations own** (Invariant #5). **Accessibility delta:** step progress announced, per-step validation. **Error delta:** per-step `field_errors`. **Success delta:** org created → into `(app)`. **Analytics:** `org.created`. **Future:** Later wave (guided participation onboarding).

### P-AUTH-04 · Password reset — request
Inherits: GI · T-AUTH · TB-NONE · SK-WIZARD · MB-WIZARD · planning → PI §13
Deltas: **Purpose:** request a reset link. **Journey** —. **Required:** form-field (email) · button (send). **Actions:** request reset (Supabase Auth). **Loading delta:** button busy. **Error delta:** **always non-disclosing** ("if an account exists, a link was sent") — never reveal account existence. **Success delta:** neutral confirmation (same regardless of existence). **Analytics:** `auth.reset_requested`.

### P-AUTH-05 · Password reset — confirm
Inherits: GI · T-AUTH · TB-NONE · SK-WIZARD · MB-WIZARD · planning → PI §13
Deltas: **Purpose:** set a new password from a reset token. **Journey** —. **Required:** form-field (new password + confirm) · button (set). **Actions:** confirm reset (Supabase Auth). **Permissions:** token-scoped. **Accessibility delta:** password rules announced, match validation inline. **Loading delta:** button busy. **Error delta:** invalid/expired-token by class; `field_errors` for mismatch. **Success delta:** confirmation → route to login. **Analytics:** `auth.reset_confirmed`.

### P-AUTH-06 · 2FA challenge
Inherits: GI · T-AUTH · TB-NONE · SK-WIZARD · MB-WIZARD · planning → PI §13
Deltas: **Purpose:** complete a two-factor challenge. **Journey** —. **Required:** form-field (code) · button (verify). **Optional:** "use backup code" link, resend. **Actions:** verify 2FA (Supabase / `update_user_2fa_settings` for enrollment context). **Permissions:** mid-auth. **Accessibility delta:** code input labeled, autocomplete one-time-code. **Loading delta:** button busy. **Error delta:** invalid-code by class; throttle on `RATE_LIMITED` (honor `Retry-After`). **Success delta:** route into `(app)`. **Analytics:** `auth.2fa_succeeded` · `auth.2fa_failed`. **Future:** Later wave (WebAuthn; escalate).

### P-AUTH-07 · Accept invitation / join org
Inherits: GI · T-AUTH · TB-NONE · SK-WIZARD · MB-WIZARD · planning → PI §13
Deltas: **Purpose:** accept an org invitation and join. **Journey** J-BUY-05. **Required:** invitation summary card · button (accept/decline). **Optional:** sign-in/sign-up inline if no session. **Actions:** `accept_invitation` (Doc-5C). **Permissions:** token-scoped. **Accessibility delta:** invitation details readable; clear accept/decline. **Loading delta:** summary skeleton. **Empty/Not-found:** expired/invalid invite byte-identical to absence. **Error delta:** `CONFLICT` if already member. **Success delta:** joined → into `(app)` with new membership; active-org re-resolved. **Analytics:** `invitation.accepted`.

### P-AUTH-08 · Email verification
Inherits: GI · T-AUTH · TB-NONE · SK-WIZARD · MB-WIZARD · planning → PI §13
Deltas: **Purpose:** verify email address. **Journey** —. **Required:** state card · button (resend). **Actions:** verify / resend (Supabase Auth). **Loading delta:** button busy. **Error delta:** invalid/expired token by class; resend throttle on `RATE_LIMITED`. **Success delta:** verified → route to org setup / `(app)`. **Analytics:** `auth.email_verified`.

---

## 5. Account & Identity Surface — `P-ACC-*` (Doc-7E · `(app)` · Doc-5C / Doc-5I)

> Authenticated, org-scoped (active-org server-resolved). `activate_plan` is **Admin-only** (Surface H),
> never here. Two role dimensions: Platform Participation ≠ Org Role (Invariant #2). Permissions/
> entitlements gate by **wired-contract reads, never name-strings** (Invariant #10).

### P-ACC-01 · Account overview
Inherits: GI · T-DASHBOARD · TB-NONE · SK-DASHBOARD · MB-DASHBOARD · planning → PI §13
Deltas: **Purpose:** at-a-glance account/org status + quick links. **Journey** —. **Required:** stat-card · card · button. **Optional:** billing-indicator (entitlement/quota state), score-ring (vendor-side context), timeline (recent activity). **Actions:** navigate to settings sections. **Cards:** account/org summary, usage snapshot. **Permissions:** reads only; **billing-indicator shows boolean/numeric/enum, never plan-name** (Invariant #10). **Empty:** minimal first-run state. **Analytics:** `account.overview_viewed`. **Future:** Later wave (more KPI cards).

### P-ACC-02 · User profile
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** edit the user's own profile. **Journey** J-BUY. **Required:** form-field · button (save) · save bar · avatar. **Optional:** file-link (avatar via Storage `file_ref`). **Toolbar delta:** save / discard. **Actions:** `update_user_profile` (Doc-5C §C4). **Dialogs:** discard-changes confirm. **Accessibility delta:** save-bar focus; 8-col form (`--iv-form-max`). **Error delta:** `VALIDATION` inline `field_errors`. **Success delta:** save toast. **Analytics:** `user.profile_updated`. **Future:** `ESC-7-API/upload` (avatar upload).

### P-ACC-03 · Security & 2FA
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** manage 2FA + account deactivation. **Journey** —. **Required:** form-field · switch (2FA toggle) · button · save bar. **Optional:** backup-codes display, danger-zone section. **Toolbar delta:** save. **Actions:** `update_user_2fa_settings`, `deactivate_own_account` (Doc-5C). **Dialogs:** **destructive confirm** for deactivation (typed confirm). **Accessibility delta:** danger actions clearly labeled, confirm required, not color-only. **Success delta:** deactivation routes out. **Analytics:** `user.2fa_changed` · `account.deactivated`. **Future:** Later wave (WebAuthn; escalate).

### P-ACC-04 · Organization profile
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** edit org profile + ownership transfer. **Journey** J-BUY. **Required:** form-field · button · save bar. **Optional:** file-link (org logo), member-picker (for transfer). **Toolbar delta:** save. **Actions:** `update_organization_profile`, `transfer_ownership` (Doc-5C §C5). **Dialogs:** **transfer-ownership confirm** (high-stakes, typed confirm). **Permissions:** gated by wired org-role reads (Owner/Director scope). **Accessibility delta:** transfer flow clearly irreversible-warned. **Error delta:** `CONFLICT` on stale. **Success delta:** transfer re-resolves context. **Analytics:** `org.profile_updated` · `org.ownership_transferred`.

### P-ACC-05 · Organization lifecycle
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** soft-delete / restore the org. **Journey** —. **Required:** danger-zone section · button. **Optional:** status banner (deleted/restorable). **Actions:** `soft_delete_organization`, `restore_organization` (Doc-5C). **Soft-delete only — never hard-delete** (Invariant #8). **Dialogs:** **destructive confirm** (typed confirm). **Permissions:** Owner-scope by wired read. **Accessibility delta:** irreversible-state warnings, confirm required. **Error delta:** `STATE` if illegal transition. **Success delta:** state-change confirmation; restore path visible. **Analytics:** `org.soft_deleted` · `org.restored`.

### P-ACC-06 · Members
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** list + manage org members. **Journey** J-BUY-05. **Required:** data-table · status-chip (membership status) · avatar · button · pagination-control. **Optional:** filter (role/status), bulk-action bar. **Toolbar delta:** invite (→ P-ACC-07) · filter · density. **Actions:** `set_membership_status`, `remove_member` (Doc-5C §C6). **Search:** member search. **Filters:** role/status. **Tables:** member · role · status · joined; row actions; selection + bulk status. **Dialogs:** remove-member confirm. **Drawers:** member detail peek. **Permissions:** management gated by wired role reads. **Accessibility delta:** row actions keyboard-reachable. **Empty:** "No members yet" + invite. **Error delta:** `CONFLICT` on stale. **Analytics:** `member.status_changed` · `member.removed`.

### P-ACC-07 · Invite member
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** invite a user to the org + manage pending invites. **Journey** J-BUY-05. **Required:** form-field (email + role) · button · data-table (pending invites). **Optional:** revoke action. **Actions:** `invite_member`, `revoke_invitation` (Doc-5C §C6). **Note:** org members only — **never vendor invitations** (engine-only, IA §4.9). **Tables:** pending-invite rows with revoke. **Dialogs:** revoke confirm. **Permissions:** wired role reads. **Empty:** "No pending invitations." **Error delta:** `VALIDATION` inline; `QUOTA` if seat limit (link to Billing). **Success delta:** invite-sent toast; row appears. **Analytics:** `member.invited` · `invitation.revoked`.

### P-ACC-08 · Roles
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** list org roles. **Journey** J-BUY-05. **Required:** data-table · button (new role → P-ACC-09) · pagination-control. **Optional:** filter. **Toolbar delta:** new role · search. **Actions:** open role editor; create entry. **Search:** roles. **Tables:** role · members-count · scope; row → editor. **Permissions:** `list_roles` (Doc-5C §C7). **Empty:** "No custom roles." **Analytics:** `role.list_viewed`.

### P-ACC-09 · Role editor
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** create/edit a role + its permissions. **Journey** J-BUY-05. **Required:** form-field · checkbox/switch grid (permission toggles) · button · save bar. **Optional:** permission-group accordions (progressive disclosure, UX §5.4). **Toolbar delta:** save / delete. **Actions:** `create_role`, `update_role`, `set_role_permissions`, `delete_role` (Doc-5C §C7). **Permissions referenced by ID/contract, never name-strings** (Invariant #10). **Dialogs:** delete-role confirm. **Accessibility delta:** permission toggles grouped + labeled; keyboard grid traversal. **Error delta:** `CONFLICT` on stale. **Analytics:** `role.created` · `role.updated` · `role.deleted`.

### P-ACC-10 · Permissions reference
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** read-only catalog of available permissions. **Journey** —. **Required:** data-table · search. **Optional:** filter (group). **Actions:** none (reference). **Search:** permissions. **Filters:** group. **Tables:** permission · group · description. **Permissions:** `list_permissions` (Doc-5C §C7); **permissions consumed by reference** (Invariant #10). **Analytics:** `permissions.reference_viewed`.

### P-ACC-11 · Delegation grants
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** list delegation grants. **Journey** —. **Required:** data-table · status-chip (grant state) · button (new → P-ACC-12) · pagination-control. **Optional:** filter (status). **Toolbar delta:** new grant · filter. **Actions:** open grant. **Search:** grants. **Filters:** status. **Tables:** delegator · delegatee · scope · status · expiry; row → detail. **Drawers:** grant detail peek. **Permissions:** `list_delegation_grants`, `get_delegation_grant` (Doc-5C §C9). **Empty:** "No delegation grants." **Analytics:** `delegation.list_viewed`.

### P-ACC-12 · Delegation grant editor
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** create/suspend/reinstate/revoke a delegation grant. **Journey** —. **Required:** form-field · button · save bar · status-chip. **Optional:** scope-picker, expiry field. **Toolbar delta:** save / suspend / reinstate / revoke. **Actions:** `create_delegation_grant`, `suspend_delegation_grant`, `reinstate_delegation_grant`, `revoke_delegation_grant` (Doc-5C §C9). **Dialogs:** revoke/suspend confirm. **Permissions:** wired delegation-management reads. **ESC:** `ESC-IDN-DELEG-EXPIRY` ✅ **RESOLVED 2026-07-09** (`ER`; instrument `Doc-2_Patch_v1.0.7`) — the reinstate action this spec formerly withheld is now **sanctioned, not coined**: offer it for **suspended non-expired only**. `revoked`/`expired` are TERMINAL per instance — no resurrection; post-terminal delegation = a NEW grant (new UUID, fresh audit chain), so offer no action there. **Accessibility delta:** scope/expiry labeled; irreversible-warned. **Error delta:** `STATE` on illegal transition. **Analytics:** `delegation.created` · `delegation.suspended` · `delegation.revoked`.

### P-ACC-13 · Workflow settings
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** configure approval chain + award threshold. **Journey** J-BUY-04. **Required:** form-field · button · save bar. **Optional:** approver-chain builder, currency-display (threshold value). **Toolbar delta:** save. **Actions:** `update_workflow_settings` (Doc-5C §C11). **Sets the approval chain + award threshold consumed by J-PROC** (no auto-approve; Doc-3 §1.2). **Permissions:** Owner/Director-scope by wired read. **Accessibility delta:** chain order keyboard-reorderable; threshold currency labeled. **Error delta:** `VALIDATION` inline. **Analytics:** `workflow.settings_updated`. **Future:** Later wave (external approval, reserved).

### P-ACC-14 · Buyer profile settings
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** configure buyer-side profile. **Journey** J-BUY-04. **Required:** form-field · button · save bar. **Optional:** category-interest picker. **Toolbar delta:** save. **Actions:** `upsert_buyer_profile` (Doc-5C §C10). **Permissions:** Actor = Buyer (PI §13); gated by wired participation read. **Error delta:** `VALIDATION` inline. **Analytics:** `buyer_profile.updated`.

### P-ACC-15 · Notification preferences
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** manage M6 channel/notification preferences. **Journey** —. **Required:** switch grid (per channel/type) · button · save bar. **Optional:** per-type granularity accordions. **Toolbar delta:** save. **Actions:** M6 prefs writes (`Doc-5H`). **Permissions:** self. **Accessibility delta:** toggles labeled (channel+type), not color-only. **Success delta:** optimistic toggle. **Analytics:** `notification_prefs.updated`. **Future:** Later wave (WhatsApp/SMS channel prefs; delivery is M6).

### P-ACC-16 · Plans / catalog
Inherits: GI · T-LISTING · TB-NONE · SK-CARD · MB-LIST · planning → PI §13
Deltas: **Purpose:** browse purchasable plans (in-app). **Journey** J-BUY-06. **Required:** plan cards · badge · button (select → P-ACC-17). **Optional:** billing-indicator (current plan state, by entitlement), comparison block. **Toolbar delta:** billing-cycle toggle. **Actions:** select plan → subscription. **Cards:** plan cards. **Permissions:** `get_plan`, `list_plans` (BC-BILL-1 read); **entitlements, not plan-name, gate features** (Invariant #10); **no plan gates matching/award** (Doc-3 §11.8). **Empty:** "No plans available." **Analytics:** `plan.selected`. **Future:** Later wave (currency-aware pricing).

### P-ACC-17 · Subscription
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** manage the active subscription + its events. **Journey** J-BUY-06. **Required:** detail hero (plan + status) · button (purchase/cancel) · timeline (events) · billing-indicator · currency-display. **Optional:** tabs (Overview / Events). **Toolbar delta:** purchase / cancel. **Actions:** `purchase_subscription`, `cancel_subscription`, `get_subscription`, `list_subscription_events` (BC-BILL-2). **Dialogs:** cancel confirm. **Permissions:** wired billing reads; **entitlements not plan-name** (Invariant #10). **Empty:** "No subscription" + browse plans. **Error delta:** `QUOTA` notice if applicable. **Analytics:** `subscription.purchased` · `subscription.cancelled`.

### P-ACC-18 · Usage & quota
Inherits: GI · T-DASHBOARD · TB-NONE · SK-DASHBOARD · MB-DASHBOARD · planning → PI §13
Deltas: **Purpose:** show entitlement usage vs quota. **Journey** —. **Required:** stat-card · progress (usage bar) · billing-indicator. **Optional:** trend cards, link to Billing. **Actions:** none (read). **Cards:** usage/quota cards (numeric/enum entitlement state). **Permissions:** `get_usage`; **boolean/numeric/enum entitlement only, never plan-name** (Invariant #10). **Accessibility delta:** progress bars have text values; not color-only. **Empty:** minimal. **Analytics:** `usage.viewed`.

### P-ACC-19 · Lead credits
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** show lead balance + transactions (+ admin credit). **Journey** —. **Required:** stat-card (balance) · data-table (transactions) · pagination-control · currency-display. **Optional:** filter (type). **Toolbar delta:** filter · density. **Actions:** `credit_lead_account` (where permitted by wired read). **Filters:** transaction type. **Tables:** date · type · delta · balance. **Cards:** balance stat. **Permissions:** Actor = Buyer (PI §13); `get_lead_balance`, `list_lead_transactions`, `credit_lead_account` (BC-BILL-4). **Accessibility delta:** tabular numerals; deltas not color-only. **Empty:** "No lead transactions." **Success delta:** balance update toast. **Analytics:** `lead_credits.viewed` · `lead_credits.credited`.

### P-ACC-20 · Platform invoices
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** list platform-fee invoices (**≠ trade invoices**). **Journey** —. **Required:** data-table · status-chip · pagination-control · currency-display. **Optional:** filter (status/date). **Toolbar delta:** filter · density. **Actions:** open invoice → P-ACC-21. **Search:** invoices. **Filters:** status/date. **Tables:** ref · date · amount · status; row → detail. **Permissions:** `list_platform_invoices`; **platform-fee only, never buyer↔vendor money** (R8/DF-6). **Accessibility delta:** amounts tabular. **Empty:** "No invoices." **Analytics:** `platform_invoice.list_viewed`.

### P-ACC-21 · Platform invoice detail
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** view a single platform invoice. **Journey** —. **Required:** detail hero (status + amount) · line-item table · file-link (PDF via `file_ref`) · currency-display. **Optional:** timeline. **Toolbar delta:** download (file-link). **Actions:** none (read). **Permissions:** `get_platform_invoice`; platform-fee only. **Accessibility delta:** line items header-associated; amounts tabular. **Empty/Not-found:** byte-identical. **Analytics:** `platform_invoice.viewed`.

### P-ACC-22 · Rewards / referrals
Inherits: GI · T-DASHBOARD · TB-NONE · SK-DASHBOARD · MB-DASHBOARD · planning → PI §13
Deltas: **Purpose:** show rewards balance + referrals. **Journey** —. **Required:** stat-card (reward balance) · data-table (referrals). **Optional:** share CTA, currency-display. **Actions:** none authoritative (reads). **Tables:** referral list. **Cards:** balance stat. **Permissions:** `get_reward_balance`, `list_referrals`. **Accessibility delta:** tabular balances. **Empty:** "No referrals yet." **Analytics:** `rewards.viewed`.

---

## 6. Buyer Workspace — `P-BUY-*` (Doc-7F · Doc-5E / Doc-5F / Doc-5D)

> Surface F `(app)`, active-org server-resolved. The procurement core (J-PROC), bound to the **RFQ state
> machine** (Doc-4M). **Moat rails (load-bearing):** no AI/UI/comparison **recommends, ranks-to-winner,
> or auto-selects** (R6); payment/entitlement **never** influences matching/selection (R7); platform
> **records** post-award docs, **never settles money** (R8/DF-6). Quotation visibility is **server-gated**.
> Actor = Buyer. Actions are gated by the actor's permitted Doc-4M transitions for the current state.

### P-BUY-01 · Buyer dashboard
Inherits: GI · T-DASHBOARD · TB-NONE · SK-DASHBOARD · MB-DASHBOARD · planning → PI §13
Deltas: **Purpose:** procurement at-a-glance — KPIs, active RFQs, queues. **Journey** J-PROC-01. **Required:** stat-card · card · data-table (recent RFQs) · status-chip · timeline. **Optional:** billing-indicator, score-ring (vendor context if Hybrid), ai-advisory-panel (reserved). **Toolbar delta:** Quick Create (shell) · date range (presentation). **Actions:** navigate to RFQ/approval/engagement. **Tables:** recent-RFQ mini-table. **Cards:** KPI cards (**counts respect non-disclosure — no excluded counts**). **AI:** advisory reserved (summarize activity) — non-recommending. **Empty:** first-run "Create RFQ" CTA. **Analytics:** `dashboard.viewed`. **Future:** Analytics (later waves).

### P-BUY-02 · Discover vendors
Inherits: GI · T-LISTING · TB-LIST · SK-CARD · MB-LIST · planning → PI §13
Deltas: **Purpose:** in-app vendor/product discovery. **Journey** J-PROC-01. **Required:** vendor/product cards · search · filter · pagination-control · trust-badge · capability-matrix. **Optional:** capacity-bar, favorite toggle, sort. **Toolbar delta:** query · sort · filter trigger · density · favorite. **Actions:** favorite (`add_catalog_favorite`); open vendor → P-BUY-04. **Search:** `search_catalog`, `list_vendor_directory` (critical). **Filters:** contract facets. **Cards:** vendor/product cards (trust read-only). **Permissions:** **never re-ranks M3**; blacklist/exclusion never rendered; CRM status **never** shown on discovery (Invariant #11). **Accessibility delta:** capability matrix labeled. **Empty:** "No vendors match" + adjust. **Success delta:** favorite toast (optimistic). **Analytics:** `discover.searched` · `vendor.favorited`. **Future:** `ESC-7-API/related`.

### P-BUY-03 · Vendor directory (in-app)
Inherits: GI · T-LISTING · TB-LIST · SK-CARD · MB-LIST · planning → PI §13
Deltas: **Purpose:** in-app browse of the vendor directory. **Journey** J-PROC-01. **Required:** vendor cards · search · filter · pagination-control · trust-badge · capability-matrix. **Optional:** capacity-bar, sort, favorite. **Toolbar delta:** query · sort · filter · density. **Actions:** open vendor → P-BUY-04; favorite. **Search:** `list_vendor_directory`. **Filters:** contract facets. **Cards:** vendor cards. **Permissions:** trust read-only; non-disclosure. **Accessibility delta:** matrix labeled. **Empty:** "No vendors match." **Analytics:** `directory.viewed`.

### P-BUY-04 · Vendor profile (in-app)
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** view a vendor's profile in-app (with trust). **Journey** J-PROC-01. **Required:** detail hero (identity + trust ring) · tabs · trust-badge · capability-matrix · button (favorite). **Optional:** capacity-bar, score-ring, file-link, ai-advisory-panel (reserved). **Toolbar delta:** favorite. **Actions:** favorite (`add/remove_catalog_favorite`). **Note:** **no direct "invite to RFQ"** — invitations are engine-only (R6; IA §4.9). **Search:** vendor-scoped products. **Cards:** product cards. **AI:** advisory reserved (explain capabilities) — non-recommending. **Permissions:** trust read-only; **buyer-private CRM status NOT shown here** (kept to CRM surface; Invariant #11). **Accessibility delta:** trust ring text value; tab a11y. **Empty/Not-found:** byte-identical. **Success delta:** favorite toast. **Analytics:** `vendor.profile_viewed`.

### P-BUY-05 · Favorites
Inherits: GI · T-LISTING · TB-LIST · SK-CARD · MB-LIST · planning → PI §13
Deltas: **Purpose:** manage saved vendors/products. **Journey** J-PROC-01. **Required:** vendor/product cards · pagination-control · button (remove). **Optional:** filter (type), search. **Toolbar delta:** filter · density. **Actions:** `list_catalog_favorites`, `add_catalog_favorite`, `remove_catalog_favorite` (BC-MKT-7). **Search:** within favorites. **Filters:** type. **Cards:** favorited vendor/product cards. **Permissions:** own-org. **Accessibility delta:** remove action keyboard-reachable + labeled. **Empty:** "No saved items" + browse marketplace. **Success delta:** remove toast (optimistic). **Analytics:** `favorite.removed`.

### P-BUY-06 · RFQ list
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · MB-LIST · planning → PI §13
Deltas: **Purpose:** list/manage the org's RFQs. **Journey** J-PROC. **Required:** data-table · status-chip (RFQ state) · search · filter · pagination-control. **Optional:** bulk-action bar, density toggle, saved-views. **Toolbar delta:** new RFQ (→ P-BUY-07) · search · filter · density. **Actions:** open RFQ → P-BUY-08; create (`create_rfq`); state actions surfaced **per row only where Doc-4M permits**. **Search:** `list_rfqs` (critical). **Filters:** status/date/owner. **Tables:** ref (mono) · title · status · created · value. **Drawers:** RFQ peek. **Permissions:** own-org RFQs only. **Accessibility delta:** ref mono; row keyboard nav. **Responsive delta:** pinned ref column. **Empty:** "No RFQs yet" + create. **Analytics:** `rfq.list_viewed`. **Future:** Later wave (saved filter views).

### P-BUY-07 · RFQ create wizard
Inherits: GI · T-WIZARD · TB-NONE · SK-WIZARD · MB-WIZARD · planning → PI §13
Deltas: **Purpose:** author an RFQ as a resumable draft. **Journey** J-PROC-02 / J-PROC-03. **Required:** stepper · form-field · button (next/save draft/submit) · file-link (attachments) · currency-display. **Optional:** line-item table, ai-advisory-panel (draft assist, reserved), category/spec pickers. **Toolbar delta:** step nav · save draft. **Actions:** Save draft (`create_rfq` → `update_rfq`, persisted via contract not local state) → Submit RFQ (`submit_rfq`). **State:** `draft` → (`submit_rfq`) → `pending_internal_approval` *or* `submitted` (self-approve path if `can_approve_rfq`). Offers only machine-permitted next actions. **Tables:** line-item editor. **Dialogs:** discard-draft confirm. **Drawers:** mobile sticky submit. **AI:** advisory **drafts/explains only**; the user confirms and **the module commits** via `create_rfq`/`update_rfq` — never auto-submits (Invariant #12). **Permissions:** submit/self-approve gated by wired `can_approve_rfq` read. **Accessibility delta:** per-step validation; currency fields labeled. **Error delta:** per-step `field_errors`; `STATE` re-derives offerable actions. **Success delta:** draft saved / submitted; idempotency key per submission. **Analytics:** `rfq.draft_saved` · `rfq.submitted`. **Future:** `ESC-7-API/upload` (attachments); AI.

### P-BUY-08 · RFQ detail — overview
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** the RFQ command center (status, meta, lifecycle actions). **Journey** J-PROC. **Required:** detail hero (ref mono + status chip) · tabs (Overview / Quotations / Activity) · timeline (lifecycle) · button (state actions) · breadcrumbs. **Optional:** ai-advisory-panel (explain status, reserved), file-link, currency-display. **Toolbar delta:** **state-machine actions only** — e.g. Submit / Cancel / Reissue RFQ (`submit_rfq`, `cancel_rfq`, `reissue_rfq`), surfaced only where Doc-4M permits. **Actions:** `get_rfq` (read); lifecycle transitions. **Cards:** meta sidebar. **Dialogs:** cancel/reissue confirm. **AI:** advisory explains status — non-recommending. **Timeline:** from immutable audit (M0). **Permissions:** own-org; **deferral/exclusion invisible** (Doc-3 §4.2). **Accessibility delta:** action availability reflects machine. **Responsive delta:** sticky primary action. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives actions, no blind retry. **Analytics:** `rfq.viewed` · `rfq.cancelled` · `rfq.reissued`.

### P-BUY-09 · RFQ detail — quotations
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** list received quotations for the RFQ. **Journey** J-PROC-08. **Required:** data-table · status-chip (quotation state) · pagination-control · currency-display · button (compare → P-BUY-15). **Optional:** filter, vendor trust-badge. **Toolbar delta:** compare · filter · density. **Actions:** open quotation → P-BUY-14; open comparison. **Filters:** quotation status. **Tables:** vendor · amount · validity · status; **contract order is authoritative — never re-ranked** (R6). **Drawers:** quotation peek. **Permissions:** **visibility-gated** — only disclosed quotations (server-gated, never client 404). **Accessibility delta:** amounts tabular. **Empty:** "No quotations yet" (awaiting vendor responses). **Analytics:** `quotation.list_viewed`.

### P-BUY-10 · RFQ detail — activity
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** routing/audit activity for the RFQ. **Journey** J-PROC-07. **Required:** timeline (activity) · status-chip · breadcrumbs. **Optional:** filter (event type). **Toolbar delta:** filter. **Actions:** none (read). **Filters:** activity type (presentation over disclosed reads). **Timeline:** routing/audit reads (immutable audit, M0). **Permissions:** **deferral invisible to buyer** (Doc-3 §4.2); **no excluded vendor shown** (Invariant #11). **Accessibility delta:** timeline as ordered list, timestamps readable. **Empty:** "No activity yet." **Analytics:** `rfq.activity_viewed`.

### P-BUY-11 · RFQ version history
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** view versioned RFQ history (immutable). **Journey** J-PROC. **Required:** timeline (versions) · diff/compare view · breadcrumbs. **Optional:** file-link (versioned attachments). **Toolbar delta:** select versions to compare. **Actions:** `get_rfq_version` (read). **Tables:** version list. **Permissions:** **versioned, never overwritten** (Invariant #8). **Accessibility delta:** version diffs not color-only (use markers + labels). **Responsive delta:** side-by-side→stacked on narrow. **Empty:** single-version note. **Analytics:** `rfq.version_viewed`.

### P-BUY-12 · Internal approval
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · MB-LIST · planning → PI §13
Deltas: **Purpose:** approve/reject RFQs in the internal chain. **Journey** J-PROC-04. **Required:** data-table (pending-approval queue) · status-chip · button (approve/reject) · currency-display · pagination-control. **Optional:** bulk-action bar, filter, detail drawer. **Toolbar delta:** filter · density. **Actions:** `approve_rfq`, `reject_internal_rfq` (mandatory reason) (Doc-5E). **State:** `pending_internal_approval` → `submitted` / `→ draft`. **No auto-approve timeout** (Doc-3 §1.2). Self-approve path if `can_approve_rfq`. **Search:** queue search. **Filters:** status/value. **Tables:** ref · requester · value · submitted; row approve/reject. **Dialogs:** **reject requires reason**; approve confirm (threshold-aware). **Drawers:** RFQ detail peek. **Permissions:** approver-scope by wired `can_approve_rfq` read; **award-threshold approval requires Director/Owner** (Doc-3 §9.4). **Accessibility delta:** approve/reject distinct + labeled, reason required. **Empty:** "Nothing to approve." **Error delta:** `STATE` re-derives; `CONFLICT` on stale. **Analytics:** `rfq.approved` · `rfq.rejected_internal`. **Future:** Later wave (external approval).

### P-BUY-13 · Routing log / invitations
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** observe routing waves + invitations issued. **Journey** J-PROC-07. **Required:** data-table · status-chip (invitation state) · timeline (routing waves) · pagination-control. **Optional:** filter. **Toolbar delta:** filter · density. **Actions:** none (read; **engine owns invitations**). **Filters:** invitation status. **Tables:** vendor · invited · response · status. **Permissions:** `get_routing_log`, `list_invitations` (caller read); **no excluded vendor shown; deferral invisible** (Invariant #11; Doc-3 §4.2). **Empty:** "No invitations yet" (**must not imply exclusion**). **Analytics:** `rfq.routing_viewed` (never logs excluded).

### P-BUY-14 · Quotation detail
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** view a single received quotation. **Journey** J-PROC-08. **Required:** detail hero (vendor + status) · line-item table · currency-display · file-link · status-chip · breadcrumbs. **Optional:** vendor trust-badge, timeline (versions), button (shortlist where permitted). **Toolbar delta:** shortlist (if state permits) · clarify (→ P-BUY-16). **Actions:** `get_quotation` (read); `shortlist_quotation` surfaced only where Doc-4M permits (gated by `can_approve_vendor_selection`). **Tables:** line items. **Cards:** vendor summary. **Dialogs:** shortlist confirm. **AI:** advisory explain (reserved) — non-recommending. **Permissions:** **visibility-gated**; **never shows competitor data to anyone**; comparison shows bands not competitor values (Doc-3 §7.5). **Accessibility delta:** amounts tabular. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives. **Success delta:** shortlist toast. **Analytics:** `quotation.viewed` · `quotation.shortlisted`.

### P-BUY-15 · Comparison statement
Inherits: GI · T-ANALYTICS · TB-DETAIL · SK-DASHBOARD · planning → PI §13
Deltas: **Purpose:** read the System-generated quotation comparison (decision support). **Journey** J-PROC-09. **Required:** comparison table (read-only) · currency-display · status-chip · score-ring (per-quote signals if provided). **Optional:** ai-advisory-panel (explain, reserved), export. **Toolbar delta:** density · export (user-readable data only). **Actions:** open quotation → P-BUY-14; proceed to shortlist/award (navigate to permitted transition). **Tables:** comparison matrix (24-col grid); **quotations render in the contract's order — UI never generates/re-ranks** (R6). **AI:** advisory may **explain**, **never recommends a winner / auto-selects / ranks-to-winner** (R6; Invariant #12). **Permissions:** **read-only, System-generated** (`get_comparison_statement`); vendor isolation — **bands, not competitor values** (Doc-3 §7.5). **ESC:** `ESC-7-API/export` — export renders only exclusion-applied user-readable data; large export = create-then-poll. **Accessibility delta:** matrix cells header-associated; no color-only ranking cues; **no "recommended" affordance exists**. **Responsive delta:** Devices D (PI §13 — desktop-only); horizontal scroll fallback. **Empty:** "No quotations to compare." **Analytics:** `comparison.viewed` · `comparison.exported`. **Future:** `ESC-7-API/export`; AI (still non-recommending).

### P-BUY-16 · Clarifications / thread
Inherits: GI · T-DETAILS · TB-NONE · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** clarification conversation on the RFQ/quotation. **Journey** J-PROC-10. **Required:** conversation-thread (M6) · form-field (message) · button (send) · file-link. **Optional:** participant list. **Actions:** `manage_clarification` (+ M6 thread). **Search:** within thread. **Drawers:** mobile thread sheet. **Permissions:** **conversation-thread renders only disclosed messages** (no excluded-party inference; Doc-7B §5). **Accessibility delta:** composer labeled; new-message live region. **Responsive delta:** sticky composer on M; keyboard never obscures input. **Empty:** "No clarifications yet." **Success delta:** optimistic message send; idempotency key. **Analytics:** `clarification.sent`. **Note:** Realtime = transport → re-fetch (Doc-7C §6.4).

### P-BUY-17 · Award
Inherits: GI · T-WIZARD · TB-NONE · SK-WIZARD · planning → PI §13
Deltas: **Purpose:** award the RFQ to exactly one quotation. **Journey** J-PROC-12. **Required:** stepper (review → confirm) · summary card · currency-display · button (award). **Optional:** threshold-approval gate step. **Actions:** `award_rfq` (Doc-5E). **State:** `shortlisted` → `closed_won`; **exactly one `selected`** (1:1), others → `not_selected`; an **engagement** is created (`open`). **Explicit, unranked, never auto-recommended** (R6; Doc-3 §9.1). **Award-threshold approval** (Director/Owner) above org threshold (Doc-3 §9.4). **Split sourcing = `reissue_rfq`, never multi-award.** **Cards:** selected-quotation summary. **Dialogs:** **award confirm** (irreversible; value snapshotted immutably). **AI:** — (award is deliberate buyer choice; no AI selection). **Permissions:** gated by `can_approve_vendor_selection` + threshold reads. **Accessibility delta:** irreversible action clearly warned; single explicit selection. **Error delta:** `STATE` if not in `shortlisted`; `CONFLICT` on stale. **Success delta:** award confirmation + engagement created; idempotency key. **Analytics:** `rfq.awarded`.

### P-BUY-18 · Close lost
Inherits: GI · T-DETAILS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** close an RFQ as lost (non-penalizing). **Journey** J-PROC-12b. **Required:** form-field (reason) · button (close) · status-chip. **Optional:** confirm summary. **Actions:** `close_lost_rfq` (Doc-5E). **State:** `→ closed_lost`. **Uniform closure; non-penalizing** to vendors. **Dialogs:** close confirm. **Permissions:** offered only where Doc-4M permits. **Accessibility delta:** reason labeled; action clearly terminal. **Error delta:** `STATE` re-derives. **Analytics:** `rfq.closed_lost`.

### P-BUY-19 · Engagements
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · MB-LIST · planning → PI §13
Deltas: **Purpose:** list post-award engagements. **Journey** J-PROC-13. **Required:** data-table · status-chip (engagement state) · pagination-control · currency-display. **Optional:** filter, search. **Toolbar delta:** filter · density. **Actions:** open engagement → P-BUY-20. **Search:** engagement search. **Filters:** state. **Tables:** engagement · vendor · state · value · updated; **engagement states** `open → in_delivery → completed → closed`. **Permissions:** own-org. **Empty:** "No engagements yet." **Analytics:** `engagement.list_viewed`.

### P-BUY-20 · Engagement detail
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** the post-award hub (state + documents). **Journey** J-PROC-13. **Required:** detail hero (status) · tabs (Overview / Documents / Payments) · timeline (lifecycle) · file-link · status-chip · currency-display · breadcrumbs. **Optional:** button (state actions), ai-advisory-panel (reserved). **Toolbar delta:** **state-machine actions only** (advance engagement where permitted). **Actions:** engagement + document reads; links to PO/payment/invoice/challan/WCC sub-pages. **State:** `open → in_delivery → completed → closed`; a dispute is an **audit action + `DisputeRecorded` event, not a state**. **Tables:** document list. **Cards:** vendor + engagement meta. **Dialogs:** state-transition confirms. **Drawers:** document peek. **AI:** advisory explain (reserved) — non-recommending. **Permissions:** own-org; **records only, no funds** (R8/DF-6). **Accessibility delta:** document links descriptive. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives. **Analytics:** `engagement.viewed`.

### P-BUY-21 · Purchase order
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** issue/view a PO (versioned). **Journey** J-PROC-13. **Required:** detail hero · line-item table · currency-display · file-link · button (issue/revise) · status-chip · timeline (versions). **Optional:** approval gate. **Toolbar delta:** issue / revise. **Actions:** `issue_po` (+ revise with reason). **PO needs `can_approve_po`** (distinct permission). **Versioned; overwrite forbidden** (Invariant #8). **Dialogs:** issue/revise confirm (revise requires reason). **Permissions:** `can_approve_po` by wired read. **Accessibility delta:** amounts tabular; version markers labeled. **Empty:** "No PO issued" + issue CTA. **Error delta:** `STATE` re-derives. **Analytics:** `po.issued` · `po.revised`.

### P-BUY-22 · Payments
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** record/confirm payments (**records only, no funds**). **Journey** J-PROC-13. **Required:** data-table (payment records) · form-field (record) · button (record/confirm) · currency-display · status-chip · file-link. **Optional:** filter. **Toolbar delta:** record payment. **Actions:** `record_payment`, `confirm_payment` (Doc-5F). **State:** `recorded → confirmed`. **`confirm_payment` needs `can_approve_payment`. Record-only — NO funds movement** (R8/DF-6). **Filters:** payment status. **Tables:** payment records. **Dialogs:** record/confirm. **Permissions:** `can_approve_payment` by wired read. **Accessibility delta:** amounts tabular; **copy must not imply settlement**. **Empty:** "No payment records" + record. **Error delta:** `STATE` re-derives. **Analytics:** `payment.recorded` · `payment.confirmed`.

### P-BUY-23 · Trade invoice review
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** review/approve a trade invoice (**≠ platform invoice**). **Journey** J-PROC-13. **Required:** detail hero · line-item table · currency-display · file-link · button (approve) · status-chip · timeline. **Optional:** dispute action. **Toolbar delta:** approve. **Actions:** `approve_trade_invoice`, `get_invoice` (Doc-5F). **State:** trade invoice `issued → partially_paid → paid | disputed | cancelled`; **records only — NOT `billing.platform_invoices`, no funds custody** (DF-6); `disputed` emits `DisputeRecorded`. **Dialogs:** approve/dispute confirm. **Permissions:** offered where Doc-4M permits. **Accessibility delta:** amounts tabular. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives. **Analytics:** `trade_invoice.approved` · `trade_invoice.disputed`.

### P-BUY-24 · Challan
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** view a delivery challan (versioned). **Journey** J-PROC-13. **Required:** detail hero · line-item table · file-link · status-chip · timeline (versions) · currency-display. **Toolbar delta:** download. **Actions:** `get_challan` (read). **Versioned; `record_delivery` emits `DeliveryRecorded`** (vendor-side issues; buyer reads). **Permissions:** own-org. **Accessibility delta:** descriptive file-link; tabular quantities. **Empty/Not-found:** byte-identical. **Analytics:** `challan.viewed`.

### P-BUY-25 · WCC
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** view a Work Completion Certificate. **Journey** J-PROC-13. **Required:** detail hero · file-link · status-chip · timeline. **Optional:** currency-display. **Toolbar delta:** download. **Actions:** `get_wcc` (read). **Versioned; emits `WorkCompletionIssued`** (proof-of-work; Trust input). **Permissions:** own-org. **Accessibility delta:** descriptive file-link. **Empty/Not-found:** byte-identical. **Analytics:** `wcc.viewed`.

### P-BUY-26 · CRM — vendor list
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** the buyer's **private** vendor CRM list. **Journey** J-PROC-14. **Required:** data-table · status-chip (CRM status) · search · filter · pagination-control. **Optional:** bulk-action bar, trust-badge. **Toolbar delta:** search · filter · density. **Actions:** open CRM vendor → P-BUY-27. **Search:** CRM. **Filters:** CRM status (own-org). **Tables:** vendor · CRM status · last activity. **Permissions:** `get_crm_status` (own-org); **BUYER-PRIVATE — NEVER leaks; blacklist undetectable** (Invariant #11); this data **never** appears on discovery/public/vendor surfaces. **Empty:** "No CRM entries yet." **Analytics:** `crm.list_viewed` (**own-org only**, never cross-tenant).

### P-BUY-27 · CRM — vendor detail
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** manage one vendor's **private** CRM status/notes. **Journey** J-PROC-14. **Required:** detail hero · form-field (notes) · button (set status) · status-chip · timeline (notes/activity). **Optional:** trust-badge (read-only). **Toolbar delta:** set status. **Actions:** `update_crm_status`, `add_crm_note`, `set_approved`, `set_blacklist` (BC-OPS-1). **Dialogs:** set-status / blacklist confirm. **Permissions:** own-org CRM; **NEVER leaks — buyer-private; Approved/Blacklisted NEVER mutates platform-wide scores** (Invariant #11; §4 firewall); **blacklist undetectable** to the vendor (byte-equivalence). **Accessibility delta:** status controls labeled; notes editor accessible. **Empty:** "No notes yet." **Error delta:** `CONFLICT` on stale. **Analytics:** `crm.status_set` · `crm.note_added` (**private**, never surfaced to vendor telemetry).

---

## 7. Vendor Workspace — `P-VND-*` (Doc-7G · Doc-5D / Doc-5E / Doc-5F / Doc-5G)

> Surface G `(app)`, active-org server-resolved. Identity/presence (J-VND) + selling loop (J-SUP), bound
> to the **quotation** + **post-award** state machines (Doc-4M). **Byte-equivalence firewall (absolute):**
> a blacklisted/excluded vendor's experience is **byte-identical** to a non-matched vendor's — **no
> surface, view, count, analytic, notification, or error reveals exclusion/blacklist** (Invariant #11;
> CHK-7-040). **Received-only** (invitations/leads). Win-rate denominator = *received invitations*, never
> all-matchable RFQs. Trust/performance/tier are **displayed, never computed** by the vendor (§4 firewall).
> Actor = Vendor.

### P-VND-01 · Vendor dashboard
Inherits: GI · T-DASHBOARD · TB-NONE · SK-DASHBOARD · MB-DASHBOARD · planning → PI §13
Deltas: **Purpose:** selling at-a-glance — KPIs, invitations, quotations, trust. **Journey** J-SUP. **Required:** stat-card · card · data-table (recent invitations/quotations) · status-chip · score-ring (trust, read-only) · trust-badge. **Optional:** capacity-bar, billing-indicator, ai-advisory-panel (reserved). **Toolbar delta:** Quick Create (shell). **Actions:** navigate to invitation/quotation/engagement. **Tables:** recent invitations/quotations. **Cards:** KPIs — **win-rate denominator = received invitations** (never all-matchable; Invariant #11). **AI:** advisory summarize (reserved) — non-recommending. **Permissions:** trust read-only; **no exclusion/blacklist signal anywhere** (byte-equivalence). **Accessibility delta:** trust ring text value. **Empty:** first-run "Complete your profile" CTA. **Analytics:** `vendor_dashboard.viewed` (never logs excluded). **Future:** Analytics.

### P-VND-02 · Profile editor
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** create/claim/edit the vendor profile. **Journey** J-VND-01 / J-VND-02. **Required:** form-field · button (save/claim) · save bar · status-chip (claim state) · file-link (logo). **Optional:** capability-matrix editor, visibility-scope selector. **Toolbar delta:** save / claim. **Actions:** `create_vendor_profile`, `claim_vendor_profile`, `update_vendor_profile` (BC-MKT-1). **Claim lifecycle + visibility scope** (`buyer_private | public`) (Invariant #3). **Capability = 4-flag matrix, never a label** (Invariant #1). **Dialogs:** claim confirm. **Permissions:** gated by wired participation read. **Accessibility delta:** capability flags individually labeled (not color-only); claim state announced. **Error delta:** `VALIDATION` inline `field_errors`; `CONFLICT` on stale. **Success delta:** save/claim toast. **Analytics:** `vendor_profile.updated` · `vendor_profile.claimed`. **Future:** `ESC-7-API/upload` (logo).

### P-VND-03 · Capacity profile
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** declare capacity. **Journey** J-VND-02. **Required:** form-field · button · save bar · capacity-bar (preview). **Optional:** unit-aware inputs (DP §9.3). **Toolbar delta:** save. **Actions:** `upsert_vendor_capacity_profile` (BC-MKT-1). **Permissions:** capacity is M2 data (M5 verifies). **Accessibility delta:** units labeled; numeric inputs tabular. **Error delta:** `VALIDATION` inline. **Analytics:** `capacity.updated`.

### P-VND-04 · Declared financial tier
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** declare financial tier (**declared ≠ verified**). **Journey** J-VND-02. **Required:** select (tier A–E) · button · save bar · badge (tier). **Optional:** explainer (declared vs verified). **Toolbar delta:** save. **Actions:** `set_declared_financial_tier` (BC-MKT-1). **Declared ≠ verified — M5 verifies; Financial Tier NEVER raises Trust** (§4 firewall). **Accessibility delta:** tier select labeled; declared/verified distinction clear in copy. **Error delta:** `VALIDATION` inline. **Analytics:** `declared_tier.set`.

### P-VND-05 · Microsite editor (draft)
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** edit and publish the microsite. **Journey** J-VND-03. **Required:** section manager · button (publish/unpublish) · status-chip (draft/published) · file-link. **Optional:** preview link (→ P-VND-06), ordering controls. **Toolbar delta:** publish / unpublish · preview. **Actions:** `publish_*`, `unpublish_*` (BC-MKT-4). **NO draft leaks publicly** — draft content never renders on Public (Invariant #11; Doc-7D). **Dialogs:** publish confirm. **Drawers:** section editor sheet. **Tables:** section list. **Permissions:** own profile. **Accessibility delta:** publish state announced; section reorder keyboard-operable. **Responsive delta:** Devices D (PI §13 — desktop-only editor). **Empty:** "Build your microsite" CTA. **Error delta:** `STATE` re-derives. **Analytics:** `microsite.published` · `microsite.unpublished`. **Future:** `ESC-7-API/upload`.

### P-VND-06 · Microsite preview
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** preview the draft microsite as it will publish. **Journey** J-VND-03. **Required:** detail hero · tabs · trust-badge · capability-matrix · file-link. **Optional:** "draft" banner. **Toolbar delta:** back to editor · publish (where permitted). **Actions:** none authoritative (draft projection read). **Search/Filters/Tables/Cards:** vendor-scoped previews. **Permissions:** **draft projection visible only to the owner** — never leaks (Invariant #11). **Accessibility delta:** mirrors public a11y; trust ring text value. **Empty:** "Nothing to preview yet." **Analytics:** `microsite.previewed`.

### P-VND-07 · Products
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · MB-LIST · planning → PI §13
Deltas: **Purpose:** list/manage the vendor's products. **Journey** J-VND-04. **Required:** data-table · status-chip (product status) · search · filter · button (new → P-VND-08) · pagination-control. **Optional:** bulk-action bar, density. **Toolbar delta:** new product · search · filter · density. **Actions:** open product → P-VND-08; create. **Search:** product reads (critical). **Filters:** status/category. **Tables:** product · category · status · updated. **Permissions:** own products. **Empty:** "No products listed" + add. **Analytics:** `product.list_viewed`.

### P-VND-08 · Product create/edit
Inherits: GI · T-WIZARD · TB-NONE · SK-WIZARD · planning → PI §13
Deltas: **Purpose:** author/edit a product (versioned). **Journey** J-VND-04. **Required:** stepper · form-field · button (save/publish) · file-link (spec docs) · currency-display · status-chip. **Optional:** spec-link picker, ai-advisory-panel (draft assist, reserved). **Toolbar delta:** save · set status. **Actions:** `create_product`, `update_product`, `set_product_status`, `link_product_spec`, `unlink_product_spec` (BC-MKT-3). **Versioned, never overwritten** (Invariant #8). **Dialogs:** status-change confirm. **Drawers:** spec picker sheet. **AI:** advisory drafts/explains only; module commits (Invariant #12). **Permissions:** own products. **Accessibility delta:** spec links labeled; currency labeled. **Error delta:** `VALIDATION` inline; `STATE` re-derives status transitions. **Analytics:** `product.created` · `product.updated` · `product.status_changed`. **Future:** `ESC-7-API/upload`; AI.

### P-VND-09 · Spec library
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** manage reusable spec library entries. **Journey** J-VND-04. **Required:** data-table · button (new/edit) · search · pagination-control. **Optional:** filter. **Toolbar delta:** new entry · search · filter. **Actions:** `create_spec_library_entry`, `update_spec_library_entry` (BC-MKT-3). **Search:** spec entries. **Filters:** category. **Tables:** spec entry rows. **Dialogs:** edit. **Permissions:** own library. **Empty:** "No spec entries." **Analytics:** `spec_entry.created` · `spec_entry.updated`.

### P-VND-10 · Spec documents
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** manage spec documents (versioned, supersede). **Journey** J-VND-04. **Required:** data-table · file-link · button (add/supersede) · status-chip · pagination-control. **Optional:** filter. **Toolbar delta:** add document · filter. **Actions:** `add_spec_document`, `supersede_spec_document` (BC-MKT-3). **Versioned; supersede, never overwrite** (Invariant #8). **Search:** documents. **Filters:** status. **Tables:** document rows with version/supersede. **Dialogs:** supersede confirm. **Permissions:** own documents. **ESC:** `ESC-7-API/upload` — upload grant absent → blobs to Storage, contract carries `file_ref` only. **Accessibility delta:** descriptive file-link; version markers labeled. **Empty:** "No spec documents." **Analytics:** `spec_document.added` · `spec_document.superseded`. **Future:** `ESC-7-API/upload`.

### P-VND-11 · Category assignment
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** assign the vendor to Admin-governed categories. **Journey** J-VND-05. **Required:** category picker · form-field · button · save bar. **Optional:** assigned-category chips. **Toolbar delta:** save. **Actions:** `assign_category_assignment`, `update_category_assignment`, `remove_category_assignment`, `list_categories` (BC-MKT-2). **Categories are Admin-governed (M8) — vendor assigns, never defines** (J-VND-05). **Dialogs:** remove confirm. **Search:** category search within picker. **Permissions:** own assignments. **Accessibility delta:** picker keyboard-operable; chips labeled. **Empty:** "No categories assigned." **Error delta:** `VALIDATION` inline. **Analytics:** `category.assigned` · `category.unassigned`.

### P-VND-12 · Ads
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** list the vendor's advertisements. **Journey** J-VND-06. **Required:** data-table · status-chip (ad state) · button (new → P-VND-13) · pagination-control. **Optional:** filter. **Toolbar delta:** new ad · filter · density. **Actions:** open ad → P-VND-13/14; create. **Search:** ad reads. **Filters:** state. **Tables:** ad rows with state. **Permissions:** own ads. **Empty:** "No advertisements" + create. **Analytics:** `ad.list_viewed`.

### P-VND-13 · Ad create/edit
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** author/edit an advertisement. **Journey** J-VND-06. **Required:** form-field · button (save) · save bar · file-link (creative). **Optional:** preview. **Toolbar delta:** save. **Actions:** `create_advertisement` (BC-MKT-5). **Permissions:** own ads. **Accessibility delta:** creative alt-text required. **Error delta:** `VALIDATION` inline. **Analytics:** `ad.created`. **Future:** `ESC-7-API/upload` (creative).

### P-VND-14 · Ad submission / status
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** submit an ad for Admin review + track status. **Journey** J-VND-06. **Required:** detail hero · status-chip (ad state) · button (submit) · timeline. **Optional:** reviewer feedback panel. **Toolbar delta:** submit. **Actions:** `submit_advertisement`, `set_advertisement_state` (BC-MKT-5). **Admin reviews** (`review_advertisement`) before publish (J-ADM-03). State transitions offered only where Doc-4M permits. **Dialogs:** submit confirm. **Permissions:** own ad. **Accessibility delta:** submit clearly labeled. **Error delta:** `STATE` re-derives. **Analytics:** `ad.submitted`.

### P-VND-15 · Invitations inbox
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · MB-LIST · planning → PI §13
Deltas: **Purpose:** the vendor's **received-only** RFQ invitations. **Journey** J-SUP-01. **Required:** data-table · status-chip (invitation state) · search · filter · pagination-control. **Optional:** density. **Toolbar delta:** search · filter · density. **Actions:** open invitation → P-VND-16. **Search:** `list_invitations` (critical). **Filters:** invitation status. **Tables:** RFQ · buyer (as disclosed) · invited · status · deadline. **Permissions:** **RECEIVED-ONLY** — vendor never sees RFQs-not-invited-to, exclusion reason, or competitor presence (**byte-equivalence**, Invariant #11/CHK-7-040). **Accessibility delta:** deadlines readable. **Empty:** "No invitations" + browse marketplace (**must not imply exclusion**). **Analytics:** `invitation.list_viewed` (**never logs non-invited RFQs**).

### P-VND-16 · Invitation detail
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** view an invitation + respond. **Journey** J-SUP-01 / J-SUP-02. **Required:** detail hero (RFQ summary as disclosed) · button (accept/decline) · status-chip · file-link · breadcrumbs. **Optional:** quote CTA (→ P-VND-18). **Toolbar delta:** accept / decline · quote. **Actions:** `get_invitation`, `respond_to_invitation` (Doc-5E). **Decline = NO penalty** (Doc-3 §5.4). **Dialogs:** decline confirm. **Tables:** RFQ line items (as disclosed). **Permissions:** received-only; **never sees competitor data or exclusion** (byte-equivalence). **Accessibility delta:** accept/decline distinct + labeled. **Responsive delta:** sticky accept/decline on M. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives. **Analytics:** `invitation.responded`.

### P-VND-17 · Quotations
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · MB-LIST · planning → PI §13
Deltas: **Purpose:** list the vendor's quotations. **Journey** J-SUP-03. **Required:** data-table · status-chip (quotation state) · search · filter · pagination-control · currency-display. **Optional:** density. **Toolbar delta:** search · filter · density. **Actions:** open quotation → P-VND-18/19/20; new (from invitation). **Search:** quotation reads (critical). **Filters:** status. **Tables:** RFQ · amount · status · submitted. **Permissions:** **visibility-gated; received-only** — never sees competitor quotations (Invariant #11). **Accessibility delta:** amounts tabular. **Empty:** "No quotations yet." **Analytics:** `quotation.list_viewed`.

### P-VND-18 · Quotation create/edit
Inherits: GI · T-WIZARD · TB-NONE · SK-WIZARD · MB-WIZARD · planning → PI §13
Deltas: **Purpose:** author/revise a quotation (versioned). **Journey** J-SUP-03. **Required:** stepper · form-field · line-item table · currency-display · button (submit/revise) · file-link. **Optional:** ai-advisory-panel (draft assist, reserved). **Toolbar delta:** step nav · save draft. **Actions:** `submit_quotation`, `revise_quotation` (new immutable version) (Doc-5E §E7). **State:** `draft → submitted → submitted (vN)`. **Versioned** (Invariant #8). Offers only machine-permitted transitions. **Dialogs:** submit confirm. **Drawers:** mobile sticky submit. **AI:** advisory drafts/explains only; module commits. **Permissions:** own quotation; visibility-gated. **Accessibility delta:** line items header-associated; currency labeled. **Error delta:** `VALIDATION` inline; `STATE` re-derives; `RATE_LIMITED`/late handled via P-VND-20. **Success delta:** idempotency key per submission. **Analytics:** `quotation.submitted` · `quotation.revised`. **Future:** `ESC-7-API/upload`; AI.

### P-VND-19 · Quotation version history
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** view immutable quotation versions. **Journey** J-SUP-03. **Required:** timeline (versions) · line-item diff · currency-display · breadcrumbs. **Optional:** file-link. **Toolbar delta:** select versions. **Actions:** quotation version reads. **Versioned, immutable** (Invariant #8). **Tables:** version list. **Permissions:** own quotation. **Accessibility delta:** diffs not color-only; amounts tabular. **Responsive delta:** side-by-side→stacked on narrow. **Empty:** single-version note. **Analytics:** `quotation.version_viewed`.

### P-VND-20 · Quotation actions
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** withdraw / request late extension. **Journey** J-SUP-04. **Required:** button (withdraw / request extension) · status-chip · form-field (extension reason). **Optional:** confirm summary. **Toolbar delta:** withdraw · request extension. **Actions:** `withdraw_quotation`, `request_late_extension` (Doc-5E). **State:** `→ withdrawn`. **Withdraw = ZERO performance penalty** (Doc-3 §5.4). **Dialogs:** withdraw confirm. **Permissions:** own quotation; offered where Doc-4M permits. **Accessibility delta:** withdraw clearly terminal + labeled; extension reason labeled. **Error delta:** `STATE` re-derives. **Analytics:** `quotation.withdrawn` · `quotation.extension_requested`.

### P-VND-21 · Leads pipeline
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · MB-LIST · planning → PI §13
Deltas: **Purpose:** manage System-created leads (received-only). **Journey** J-SUP-06. **Required:** kanban/pipeline board (or data-table) · status-chip (lead stage) · button (advance/add activity). **Optional:** filter, drawer detail. **Toolbar delta:** filter · view toggle (board/table). **Actions:** `update_lead_stage`, `add_lead_activity` (BC-OPS-3). **Leads are System-created on invitation; RECEIVED-ONLY** (J-SUP-06; Invariant #11). **Search:** leads. **Filters:** stage. **Tables/board:** lead cards by stage; cursor-backed. **Dialogs:** add-activity. **Drawers:** lead detail peek. **Permissions:** received-only. **Accessibility delta:** stage changes keyboard-operable (not drag-only). **Responsive delta:** board→stacked list on M (swipe to advance with non-swipe alternative). **Empty:** "No leads yet." **Error delta:** `CONFLICT` on stale. **Analytics:** `lead.stage_changed` · `lead.activity_added`.

### P-VND-22 · Lead detail
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** view a single lead. **Journey** J-SUP-06. **Required:** detail hero · timeline (activity) · status-chip · button (advance/add activity). **Optional:** conversation-thread. **Toolbar delta:** advance stage · add activity. **Actions:** lead reads; `update_lead_stage`, `add_lead_activity`. **Dialogs:** add-activity. **Permissions:** received-only. **Accessibility delta:** activity timeline as ordered list. **Empty:** "No activity yet." **Analytics:** `lead.viewed`.

### P-VND-23 · Engagements (vendor)
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · MB-LIST · planning → PI §13
Deltas: **Purpose:** list the vendor's post-award engagements. **Journey** J-SUP-07. **Required:** data-table · status-chip (engagement state) · pagination-control · currency-display. **Optional:** filter, search. **Toolbar delta:** filter · density. **Actions:** open engagement → P-VND-24. **Search:** engagement search. **Filters:** state. **Tables:** engagement · buyer · state · value · updated; **states** `open → in_delivery → completed → closed`. **Permissions:** own-org. **Empty:** "No engagements yet." **Analytics:** `engagement.list_viewed`.

### P-VND-24 · Engagement detail (vendor)
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** the vendor's post-award hub (state + documents). **Journey** J-SUP-07. **Required:** detail hero (status) · tabs (Overview / Documents / Finance) · timeline (lifecycle) · file-link · status-chip · currency-display · breadcrumbs. **Optional:** button (state actions). **Toolbar delta:** **state-machine actions only** (advance delivery where permitted). **Actions:** engagement + document reads; links to challan/invoice sub-pages. **State:** `open → in_delivery → completed → closed`; dispute is audit action + `DisputeRecorded`, not a state. **Tables:** document list. **Cards:** buyer + engagement meta. **Dialogs:** state-transition confirms. **Drawers:** document peek. **Permissions:** own-org; **records only, no funds** (R8/DF-6). **Accessibility delta:** document links descriptive. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives. **Analytics:** `engagement.viewed`.

### P-VND-25 · Delivery challan
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · MB-DETAIL · planning → PI §13
Deltas: **Purpose:** upload a challan + record delivery. **Journey** J-SUP-07. **Required:** detail hero · form-field · line-item table · file-link · button (upload/record) · status-chip · timeline (versions). **Toolbar delta:** upload challan · record delivery. **Actions:** `upload_delivery_challan`, `record_delivery` (Doc-5F). **Versioned; `record_delivery` emits `DeliveryRecorded`** (Invariant #8). **Dialogs:** record-delivery confirm. **Permissions:** own engagement. **ESC:** `ESC-7-API/upload` — upload grant absent → blobs to Storage, `file_ref` only. **Accessibility delta:** descriptive file-link; quantities tabular. **Empty:** "No challan yet" + upload. **Error delta:** `STATE` re-derives. **Analytics:** `challan.uploaded` · `delivery.recorded`. **Future:** `ESC-7-API/upload`.

### P-VND-26 · Trade invoice issue
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** issue a trade invoice (**records only, no funds**). **Journey** J-SUP-07. **Required:** form-field · line-item table · currency-display · button (issue) · status-chip · file-link · timeline. **Toolbar delta:** issue. **Actions:** `issue_trade_invoice` (Doc-5F). **State:** trade invoice `issued → partially_paid → paid | disputed | cancelled`; **records only — NOT `billing.platform_invoices`, no funds custody** (DF-6). **Dialogs:** issue confirm. **Permissions:** own engagement. **Accessibility delta:** amounts tabular; **copy must not imply settlement**. **Empty:** "No invoice issued" + issue. **Error delta:** `VALIDATION` inline; `STATE` re-derives. **Analytics:** `trade_invoice.issued`.

### P-VND-27 · Finance / payments (vendor)
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** view finance/payment records (received). **Journey** J-SUP-07. **Required:** data-table · status-chip · pagination-control · currency-display. **Optional:** filter. **Toolbar delta:** filter · density. **Actions:** finance reads (read-only; **vendor does not confirm buyer payments**). **Filters:** status. **Tables:** payment/finance records. **Permissions:** own-org; **records only, no funds** (R8/DF-6). **Accessibility delta:** amounts tabular; **no settlement implication**. **Empty:** "No payment records." **Analytics:** `vendor_finance.viewed`.

### P-VND-28 · Trust & performance
Inherits: GI · T-DASHBOARD · TB-NONE · SK-DASHBOARD · MB-DASHBOARD · planning → PI §13
Deltas: **Purpose:** the vendor's **read-only** trust/performance/tier signals. **Journey** J-VND-07. **Required:** score-ring (trust) · stat-card (performance) · badge (verified tier) · trust-badge. **Optional:** trend cards, capacity-bar. **Actions:** none (read-only). **Cards:** trust ring, performance score, verified tier. **Permissions:** `get_trust_score`, `get_performance_score`, `get_verified_tier` (Doc-5G); **READ-ONLY — vendor never mutates; Admin decides, Trust owns; Financial Tier NEVER raises Trust** (§4 firewall); analytics obey byte-equivalence — **win-rate denominator = received invitations**; **no exclusion/blacklist signal** (Invariant #11). **Accessibility delta:** ring/score have text values. **Empty:** "Signals pending verification." **Analytics:** `trust_performance.viewed` (**never logs excluded/denominator leakage**). **Future:** Analytics (still read-only + byte-equivalent).

---

## 8. Admin Console — `P-ADM-*` (Doc-7H · Doc-5J + cross-module Admin legs)

> Surface H `(admin)`, Staff session, **NO active-org** — Admin **acts ON targets by ID, never AS an
> org** (R5). Dashboard-shell variant; **no org-switcher**. **Admin-decides / owning-module-owns:** every
> page **invokes** a wired Admin command; the **owning module owns the effect**. Admin **NEVER** writes
> Trust/Performance/Tier scores (firewall), **never** makes matching/award decisions, and **never**
> bypasses a module's domain. Desktop-first; mobile mostly `F` (PI §13). State transitions offered only
> where Doc-4M permits. Non-disclosure still applies to staff-internal triage. Actor = Admin.

### P-ADM-01 · Admin dashboard
Inherits: GI · T-DASHBOARD · TB-NONE · SK-DASHBOARD · planning → PI §13
Deltas: **Purpose:** governance at-a-glance — queue volumes, SLAs. **Journey** J-ADM. **Required:** stat-card · card · data-table (queue summaries) · status-chip. **Optional:** trend cards. **Toolbar delta:** date range (presentation). **Actions:** navigate to queues. **Tables:** queue summaries. **Cards:** queue KPIs. **Permissions:** Admin (staff); reads; **no active-org**. **Empty:** quiet-state. **Analytics:** `admin_dashboard.viewed`. **Future:** Analytics (SLA, later).

### P-ADM-02 · Moderation queue
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** triage moderation cases. **Journey** J-ADM-01. **Required:** data-table · status-chip (case state) · search · filter · pagination-control · bulk-action bar. **Optional:** detail drawer, density. **Toolbar delta:** filter · density · assign (bulk). **Actions:** open case → P-ADM-03; assign (`assign_moderation_case`). **Search:** case search (critical). **Filters:** state/type/assignee. **Tables:** case · type · subject · status · assignee · age; selection + bulk assign. **Dialogs:** assign. **Drawers:** case peek. **Permissions:** moderation case reads (BC-ADM-1). **Accessibility delta:** bulk actions keyboard-reachable. **Empty:** "Queue clear." **Analytics:** `moderation.queue_viewed` · `moderation.assigned`.

### P-ADM-03 · Moderation case detail
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** decide a moderation case. **Journey** J-ADM-01. **Required:** detail hero (case + status) · timeline (history) · button (assign/decide) · form-field (decision reason) · status-chip. **Optional:** evidence file-link, conversation-thread. **Toolbar delta:** assign · decide. **Actions:** `create_moderation_case`, `assign_moderation_case`, `decide_moderation_case` (BC-ADM-1). **Owning module owns the effect** (R5). **Cards:** subject summary. **Dialogs:** **decide requires reason**. **Permissions:** invoke wired command (does not own effect). **Accessibility delta:** decision controls labeled; reason required. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives; `CONFLICT` on stale. **Success delta:** idempotency key. **Analytics:** `moderation.decided`.

### P-ADM-04 · RFQ moderation
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** moderate submitted RFQs (demand-side gate). **Journey** J-ADM-01. **Required:** data-table · status-chip (RFQ state) · button (pass/reject) · form-field (reject reason) · pagination-control. **Optional:** detail drawer, filter. **Toolbar delta:** filter · density. **Actions:** `moderate_rfq` (Doc-5E). **State:** `submitted → under_review → matching` (pass) or `→ draft` (reject, reason). **Search:** RFQ search. **Filters:** status. **Tables:** RFQ rows with pass/reject. **Dialogs:** **reject requires reason**; pass confirm. **Drawers:** RFQ peek. **Permissions:** invoke wired command; **M3 owns matching** (Admin never decides matching). **Accessibility delta:** pass/reject distinct + labeled. **Empty:** "Nothing to moderate." **Error delta:** `STATE` re-derives. **Analytics:** `rfq.moderated`.

### P-ADM-05 · Bans
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** list bans. **Journey** J-ADM-04. **Required:** data-table · status-chip (ban state) · search · filter · pagination-control. **Optional:** density. **Toolbar delta:** search · filter. **Actions:** open ban → P-ADM-06. **Search:** ban search. **Filters:** state/target type. **Tables:** target · type · reason · status · issued. **Permissions:** ban reads (BC-ADM-2). **Empty:** "No bans." **Analytics:** `bans.list_viewed`.

### P-ADM-06 · Ban detail / issue
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** issue or lift a ban. **Journey** J-ADM-04. **Required:** detail hero · form-field (reason) · button (issue/lift) · status-chip · timeline. **Optional:** target summary. **Toolbar delta:** issue · lift. **Actions:** `issue_ban`, `lift_ban` (BC-ADM-2). **Emits `VendorBanned`** (owning module executes effect; R5). **Dialogs:** issue/lift confirm (reason required). **Cards:** target meta. **Permissions:** invoke wired command. **Accessibility delta:** issue/lift distinct; reason required. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives. **Analytics:** `ban.issued` · `ban.lifted`.

### P-ADM-07 · Vendor approval queue
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** approve/reject vendor profiles. **Journey** J-ADM-03. **Required:** data-table · status-chip (profile status) · button (approve/reject) · pagination-control · bulk-action bar. **Optional:** detail drawer, filter. **Toolbar delta:** filter · density. **Actions:** `set_vendor_profile_status` (Doc-5D). **Search:** vendor search (critical). **Filters:** status. **Tables:** vendor profile rows; selection + bulk status. **Dialogs:** approve/reject confirm. **Drawers:** profile peek. **Permissions:** invoke wired command (M2 owns profile). **Accessibility delta:** approve/reject distinct + labeled. **Empty:** "Nothing to approve." **Error delta:** `STATE` re-derives. **Analytics:** `vendor.approval_decided`.

### P-ADM-08 · Category management
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** manage the Admin-governed category taxonomy. **Journey** J-ADM-03. **Required:** tree/table · status-chip (category status) · button (new/edit/set status) · search. **Optional:** bulk-action bar. **Toolbar delta:** new category (→ P-ADM-09) · search · density. **Actions:** `set_category_status` (Doc-5D). **Taxonomy is Admin-governed.** **Search:** category search. **Filters:** status. **Tables/tree:** category hierarchy. **Dialogs:** set-status confirm. **Permissions:** M2/M8-governed categories. **Accessibility delta:** tree keyboard-navigable. **Responsive delta:** Devices D (PI §13). **Empty:** "No categories." **Error delta:** `STATE` re-derives. **Analytics:** `category.status_set`.

### P-ADM-09 · Category editor
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** create/edit a category. **Journey** J-ADM-03. **Required:** form-field · button (save) · save bar. **Optional:** parent picker, icon picker. **Toolbar delta:** save. **Actions:** `create_category`, `update_category` (Doc-5D). **Permissions:** Admin-governed taxonomy. **Accessibility delta:** parent select labeled. **Error delta:** `VALIDATION` inline. **Analytics:** `category.created` · `category.updated`.

### P-ADM-10 · Ad review queue
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** triage advertisements for review. **Journey** J-ADM-03. **Required:** data-table · status-chip (ad state) · pagination-control · bulk-action bar. **Optional:** filter, detail drawer. **Toolbar delta:** filter · density. **Actions:** open ad → P-ADM-11. **Search:** ad search. **Filters:** state. **Tables:** ad rows; selection. **Drawers:** ad peek. **Permissions:** ad reads. **Empty:** "No ads to review." **Analytics:** `ad.review_queue_viewed`.

### P-ADM-11 · Ad review detail
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** approve/reject an ad. **Journey** J-ADM-03. **Required:** detail hero (creative preview) · file-link · button (approve/reject) · form-field (reason) · status-chip. **Toolbar delta:** approve · reject. **Actions:** `review_advertisement` (Doc-5D). **Dialogs:** approve/reject confirm (reason on reject). **Permissions:** invoke wired command (M2 owns ad). **Accessibility delta:** creative alt-text; approve/reject distinct. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives. **Analytics:** `ad.reviewed`.

### P-ADM-12 · Verification queue
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** triage verification tasks (M8 queues → M5 owns score). **Journey** J-ADM-02. **Required:** data-table · status-chip (task state) · button (assign) · pagination-control · bulk-action bar. **Optional:** filter, detail drawer. **Toolbar delta:** filter · density · assign (bulk). **Actions:** `queue_verification_task`, `assign_verification_task` (BC-ADM-5). **M8 queues; M5 owns the score (firewall).** **Search:** task search (critical). **Filters:** state/type. **Tables:** task rows; selection + bulk assign. **Dialogs:** assign. **Drawers:** task peek. **Permissions:** M8 queues only — **never writes the score** (firewall). **Empty:** "Queue clear." **Analytics:** `verification.queue_viewed` · `verification.assigned`.

### P-ADM-13 · Verification task detail
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** decide a verification task (→ M5 owns the score). **Journey** J-ADM-02. **Required:** detail hero · evidence file-link · form-field (decision) · button (decide) · status-chip · timeline. **Toolbar delta:** decide. **Actions:** `decide_verification_task` (BC-ADM-5 → M5). **Admin decides the task; M5 OWNS the score (firewall) — Admin NEVER writes Trust/Tier scores.** **Dialogs:** **decide requires reason/evidence**. **Permissions:** invoke wired command; **score is M5's, never set here** (§4 firewall). **Accessibility delta:** decision controls labeled; evidence descriptive. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives. **Success delta:** decision confirmation (M5 effect); idempotency key. **Analytics:** `verification.decided`.

### P-ADM-14 · Import jobs
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** list import jobs. **Journey** J-ADM-05. **Required:** data-table · status-chip (job state) · button (new → P-ADM-15) · pagination-control. **Optional:** filter. **Toolbar delta:** new import · filter · density. **Actions:** open job → P-ADM-15. **Search:** job search. **Filters:** state. **Tables:** job · type · status · submitted · progress. **Permissions:** import reads. **Accessibility delta:** progress has text value. **Empty:** "No import jobs" + new. **Analytics:** `import.list_viewed`.

### P-ADM-15 · Import job — new / detail
Inherits: GI · T-WIZARD · TB-NONE · SK-WIZARD · planning → PI §13
Deltas: **Purpose:** submit an import job + watch its async progress. **Journey** J-ADM-05. **Required:** stepper · file-link (source upload) · button (submit) · status-chip · progress · timeline. **Optional:** mapping form-field. **Toolbar delta:** step nav. **Actions:** `submit_import_job` (BC-ADM-4). **Create-then-poll on `ASYNC_PENDING`** — poll the status resource, not the error envelope; **processing is System out-of-wire**. **Dialogs:** submit confirm. **Cards:** job summary. **Permissions:** invoke wired command. **ESC:** `ESC-7-API/upload` — source upload-grant absent → blobs to Storage, `file_ref` only. **Accessibility delta:** progress announced (live region). **Responsive delta:** Devices D (PI §13). **Loading delta:** **polling shows non-blocking progress, not a full-page spinner**. **Error delta:** `ASYNC_PENDING` → poll; surface `reference_id` on failure. **Success delta:** job-accepted then completion via poll. **Analytics:** `import.submitted`. **Note:** async job via Inngest/outbox surfaced as state changes (Doc-7C §8). **Future:** `ESC-7-API/upload`.

### P-ADM-16 · Outreach campaigns
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** list acquisition outreach campaigns. **Journey** J-ADM-05. **Required:** data-table · status-chip (campaign state) · button (new) · pagination-control. **Optional:** filter. **Toolbar delta:** new campaign · filter. **Actions:** open campaign → P-ADM-17. **Search:** campaign search. **Filters:** state. **Tables:** campaign rows. **Permissions:** campaign reads (BC-ADM-6); acquisition only. **Empty:** "No campaigns." **Analytics:** `outreach.list_viewed`.

### P-ADM-17 · Campaign detail
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** create/run/complete an outreach campaign. **Journey** J-ADM-05. **Required:** detail hero · form-field · button (create/run/complete) · status-chip · timeline. **Optional:** contact list link (→ P-ADM-18). **Toolbar delta:** run · complete. **Actions:** `create_outreach_campaign`, `run_outreach_campaign`, `complete_outreach_campaign` (BC-ADM-6). State transitions offered where Doc-4M permits. **Dialogs:** run/complete confirm. **Cards:** campaign meta. **Permissions:** invoke wired command; acquisition only. **Empty/Not-found:** byte-identical. **Error delta:** `STATE` re-derives. **Analytics:** `outreach.created` · `outreach.run` · `outreach.completed`.

### P-ADM-18 · Outreach contacts
Inherits: GI · T-LISTING · TB-LIST · SK-LIST · planning → PI §13
Deltas: **Purpose:** manage outreach contacts. **Journey** J-ADM-05. **Required:** data-table · form-field (add) · button · search · pagination-control. **Optional:** filter, bulk-action bar. **Toolbar delta:** add contact · search · filter. **Actions:** `add_outreach_contact`, `update_outreach_contact` (BC-ADM-6). **Search:** contact search. **Filters:** status. **Tables:** contact rows; selection. **Dialogs:** add/edit. **Permissions:** acquisition only. **Empty:** "No contacts." **Error delta:** `VALIDATION` inline. **Analytics:** `outreach.contact_added` · `outreach.contact_updated`.

### P-ADM-19 · Routing rules
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** manage stage-gated routing rules. **Journey** J-ADM-05. **Required:** data-table · status-chip (rule state) · button (new/edit) · pagination-control. **Optional:** filter, reorder controls. **Toolbar delta:** new rule (→ P-ADM-20) · filter. **Actions:** `manage_routing_rule` (Doc-5E, Stage-gated). **Search:** rule search. **Filters:** stage/state. **Tables:** rule rows. **Drawers:** rule peek. **Permissions:** **Stage-gated** routing config; **M3 owns matching** (rules configure, never decide a specific match outcome). **Accessibility delta:** rule order keyboard-operable. **Responsive delta:** Devices D (PI §13). **Empty:** "No routing rules." **Error delta:** `STATE` re-derives. **Analytics:** `routing_rule.list_viewed`.

### P-ADM-20 · Routing rule editor
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** create/edit a routing rule (+ routing assist). **Journey** J-ADM-05. **Required:** form-field · button (save) · save bar. **Optional:** condition builder, assist preview. **Toolbar delta:** save · run assist. **Actions:** `manage_routing_rule`, `assist_routing` (Doc-5E). **Stage-gated; advisory assist is non-authoritative.** **AI:** — (assist is a wired routing helper, **not** the M9 advisory panel). **Permissions:** Stage-gated. **Accessibility delta:** condition builder keyboard-operable. **Responsive delta:** Devices D (PI §13). **Error delta:** `VALIDATION` inline; `STATE` re-derives. **Analytics:** `routing_rule.saved` · `routing.assisted`.

### P-ADM-21 · Matching results (internal)
Inherits: GI · T-DETAILS · TB-DETAIL · SK-LIST · planning → PI §13
Deltas: **Purpose:** inspect internal matching results (service leg). **Journey** J-ADM. **Required:** data-table (match results) · status-chip · timeline. **Optional:** filter. **Toolbar delta:** filter. **Actions:** `get_matching_results` (Admin leg). **Internal-service leg only — M3 owns matching; Admin observes, never re-ranks or decides** (R6). **Filters:** result filters (presentation). **Tables:** match-result rows; **contract order authoritative**. **Permissions:** Admin (internal service leg). **Accessibility delta:** no color-only ranking cue. **Responsive delta:** Devices D (PI §13). **Empty:** "No matching results." **Analytics:** `matching_results.viewed` (internal).

### P-ADM-22 · Plan management
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** list/manage billing plans. **Journey** J-ADM-06. **Required:** data-table · status-chip (plan state) · button (new/edit → P-ADM-23) · pagination-control. **Optional:** filter. **Toolbar delta:** new plan · filter. **Actions:** open plan → P-ADM-23; list (`list_plans`). **Search:** plan search. **Filters:** state. **Tables:** plan rows. **Permissions:** plan management (Doc-5I). **Empty:** "No plans." **Analytics:** `plan.management_viewed`.

### P-ADM-23 · Plan editor
Inherits: GI · T-SETTINGS · TB-NONE · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** create/update/retire/activate a plan. **Journey** J-ADM-06. **Required:** form-field · button (save/activate/retire) · save bar · status-chip. **Optional:** entitlement bundle link (→ P-ADM-24), currency-display. **Toolbar delta:** save · activate · retire. **Actions:** `create_plan`, `update_plan`, `retire_plan`, `activate_plan` (Doc-5I). **`activate_plan` is Admin-only** (never in Account surface). **Entitlements not plan-name** drive features (Invariant #10). **Dialogs:** activate/retire confirm. **Permissions:** plan catalog admin. **Accessibility delta:** lifecycle actions labeled; pricing currency labeled. **Responsive delta:** Devices D (PI §13). **Error delta:** `VALIDATION` inline; `STATE` re-derives. **Analytics:** `plan.created` · `plan.updated` · `plan.activated` · `plan.retired`.

### P-ADM-24 · Entitlements / bundles
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** manage entitlements + bundle them to plans. **Journey** J-ADM-06. **Required:** data-table · form-field · button (create/bundle). **Optional:** filter, picker. **Toolbar delta:** new entitlement · bundle. **Actions:** `create_entitlement`, `bundle_plan_entitlement` (Doc-5I). **Entitlements are boolean/numeric/enum — never plan-name** (Invariant #10). **Search:** entitlement search. **Filters:** type. **Tables:** entitlement rows. **Dialogs:** create/bundle. **Permissions:** entitlement admin. **Accessibility delta:** entitlement type labeled; bundle picker keyboard-operable. **Responsive delta:** Devices D (PI §13). **Empty:** "No entitlements." **Error delta:** `VALIDATION` inline. **Analytics:** `entitlement.created` · `entitlement.bundled`.

### P-ADM-25 · Identity ops — orgs
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** suspend/reinstate/recover orgs (no active-org). **Journey** J-ADM-06. **Required:** data-table · status-chip (org state) · button (suspend/reinstate/recover) · search · pagination-control. **Optional:** filter, detail drawer. **Toolbar delta:** search · filter. **Actions:** `suspend_organization`, `reinstate_organization`, `recover_organization_ownership` (Doc-5C). **Acts ON the org BY ID — NO active-org** (R5). **Search:** org search. **Filters:** state. **Tables:** org rows; selection. **Dialogs:** suspend/reinstate/recover confirm. **Drawers:** org peek. **Permissions:** identity ops; no active-org. **Accessibility delta:** lifecycle actions distinct + labeled. **Empty:** "No organizations." **Error delta:** `STATE` re-derives; `CONFLICT` on stale. **Analytics:** `org.suspended` · `org.reinstated` · `org.ownership_recovered`.

### P-ADM-26 · Identity ops — users
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** suspend/reinstate users. **Journey** J-ADM-06. **Required:** data-table · status-chip (user state) · button (suspend/reinstate) · search · pagination-control. **Optional:** filter. **Toolbar delta:** search · filter. **Actions:** `suspend_user`, `reinstate_user` (Doc-5C). **Acts ON the user BY ID.** **Search:** user search. **Filters:** state. **Tables:** user rows. **Dialogs:** suspend/reinstate confirm. **Permissions:** identity ops. **Accessibility delta:** actions distinct + labeled. **Empty:** "No users." **Error delta:** `STATE` re-derives. **Analytics:** `user.suspended` · `user.reinstated`.

### P-ADM-27 · Suggestion triage
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** triage category + missing-vendor suggestions (staff-internal). **Journey** J-ADM-07. **Required:** data-table · status-chip · button (decide/triage/close) · pagination-control. **Optional:** filter, detail drawer. **Toolbar delta:** filter · density. **Actions:** `decide_category_suggestion`, `triage_missing_vendor_suggestion`, `close_missing_vendor_suggestion` (BC-ADM-3). **Search:** suggestion search. **Filters:** state/type. **Tables:** suggestion rows; selection. **Dialogs:** decide/close. **Drawers:** suggestion peek. **Permissions:** **NON-DISCLOSURE (staff-internal)** — never exposes any buyer-private/excluded signal to outside actors (Invariant #11). **Empty:** "Nothing to triage." **Analytics:** `suggestion.decided` · `suggestion.closed` (staff-internal, non-disclosing).

### P-ADM-28 · Link triage
Inherits: GI · T-MANAGEMENT · TB-MANAGEMENT · SK-LIST · planning → PI §13
Deltas: **Purpose:** confirm/dismiss link suggestions (staff-internal). **Journey** J-ADM-07. **Required:** data-table · status-chip · button (confirm/dismiss) · pagination-control. **Optional:** filter, detail drawer. **Toolbar delta:** filter · density. **Actions:** `confirm_link_suggestion`, `dismiss_link_suggestion` (BC-ADM-3). **Search:** link search. **Filters:** state. **Tables:** link suggestion rows; selection. **Dialogs:** confirm/dismiss. **Drawers:** link peek. **Permissions:** **NON-DISCLOSURE (staff-internal)** (Invariant #11). **Accessibility delta:** confirm/dismiss distinct. **Empty:** "Nothing to triage." **Analytics:** `link.confirmed` · `link.dismissed` (staff-internal).

### P-ADM-29 · Support reads
Inherits: GI · T-DETAILS · TB-DETAIL · SK-DETAIL · planning → PI §13
Deltas: **Purpose:** scoped support read access for staff. **Journey** J-ADM. **Required:** detail panels · data-table · search · status-chip. **Optional:** filter. **Toolbar delta:** search · filter. **Actions:** none authoritative — **read-only support scope** (`staff_can_support`, Doc-5H). **Search:** support entity search. **Filters:** scope. **Tables:** scoped reads. **Cards:** entity summaries. **Permissions:** **support scope only** — reads gated by `staff_can_support`; **non-disclosure still applies** (never reveals buyer-private/excluded; Invariant #11). **Error delta:** collapses to not-found where no right-to-know. **Empty:** "Nothing in scope." **Analytics:** `support.read_viewed` (non-disclosing).

---

## 9. Coverage & Closure Check

All **144** `P-*` pages from PI are specified, grouped by surface and matching the inventory exactly:

| Surface | Pages spec'd | Range | Inventory count |
|---|---|---|---|
| Shell (§2) | 6 | P-SH-01…06 | 6 ✔ |
| Public (§3) | 24 | P-PUB-01…24 | 24 ✔ |
| Auth-entry (§4) | 8 | P-AUTH-01…08 | 8 ✔ |
| Account & Identity (§5) | 22 | P-ACC-01…22 | 22 ✔ |
| Buyer Workspace (§6) | 27 | P-BUY-01…27 | 27 ✔ |
| Vendor Workspace (§7) | 28 | P-VND-01…28 | 28 ✔ |
| Admin Console (§8) | 29 | P-ADM-01…29 | 29 ✔ |
| **Total** | **144** | | **144 ✔** |

> Per-page **states** (loading/empty/error/not-found) and **modals/drawers** are realized inline as the
> Doc-7B §6 primitives / SC preset states and overlay components — they are **not** separate screens (0F
> scoping rule). The shell chrome (nav, org-switcher, notification center, command palette, Quick Create)
> is Doc-7C-owned (GI-01), specified once in SC, not per page.

---

## 10. Governance Alignment & Precedence (local ledger)

This document **conforms upward** (§0) and **coins nothing** — no route, contract, state, transition,
permission, component, event, or page is introduced. Every binding is by pointer; cross-cutting defaults
live once in SC §1 (GI) and are inherited via the banner. Authority pointers live here and in GI, **not**
inside per-page actions. Constraints honored (representative):

| Constraint | Source | Where honored (representative) |
|---|---|---|
| Cross-cutting defaults stated once; pages carry deltas only | SC §1–§4 | every page banner + §1 |
| Every screen binds a wired contract or is static/state | Doc-7A §0 / Doc-7D…7H / PI | all per-page **Actions/Permissions** |
| Components only from the Doc-7B kit | Doc-7B §5 + Appendix | every **Required/Optional components** field |
| State-machine UI: permitted transitions only; no invented state/edge/label | Doc-7A §7 / Doc-4M / GI-10 | every **Actions**; P-BUY-07/08/12/17, P-VND-16/18/20, P-ADM-04 |
| Routes carry opaque IDs, not human refs | IA §8 / Doc-4A | §0 |
| Non-disclosure / byte-equivalence (no excluded/blacklist/private; not-found ≡ absence) | Invariant #11 / CHK-7-040/041 / GI-12 | P-SH-03/06, P-BUY-13/26/27, P-VND-15/16/28, P-ADM-27/28/29 |
| Buyer-private CRM never leaks; blacklist undetectable | Invariant #11 | P-BUY-26/27 (and excluded from all discovery/vendor surfaces) |
| Content ≠ Presentation; sort/filter never re-ranks M3 | Doc-7A §6 / GR#4 / GI-04 | every **Filters/Tables**; P-BUY-09/15, P-ADM-21 |
| Comparison read-only, System-generated, **non-recommending** | Doc-7F §6 / R6 | P-BUY-15 |
| AI suggests; modules decide; advisory non-recommending; future-activation | Invariant #12 / `Doc-5K` / GI-11 | every **AI**; P-BUY-07/15, P-VND-18 |
| Award explicit, unranked, 1:1; split = reissue | Doc-2 §5.4 / Doc-3 §9.1 | P-BUY-17 |
| Post-award records only; no funds movement | R8 / DF-6 | P-BUY-21/22/23, P-VND-25/26/27 |
| Versioned/immutable docs & catalog; soft-delete | Invariant #8 | P-BUY-11/21, P-VND-08/10/19, P-ACC-05 |
| Declared tier ≠ verified; Admin decides, Trust owns; Financial Tier never raises Trust | §4 firewall | P-VND-04/28, P-ADM-13 |
| Admin invoke-not-own; no active-org; never writes scores | R5 / Doc-7C §4 | all §8 (P-ADM-*), esp. P-ADM-13 |
| Cursor pagination on all lists; POLICY `page_size`; no offset | Doc-7C §5.3 / GI-03 | every **Tables** + §1 |
| Error by `error_class`, not status; surface `reference_id`; no protected enrichment | Doc-7A §5.3–5.4 / GI-05 | every **Error** delta; P-SH-04 |
| Active-org server-resolved, never client-trusted | Invariant #5 / Doc-7C §4 / GI-01 | §1; all `(app)` screens |
| Permissions/entitlements gate by wired reads, never name-strings | Invariant #10 | every **Permissions**; P-ACC-09/16/18, P-ADM-23/24 |
| Currency `{amount, currency}` per field, BDT default | Doc-2 §0.4 / GI-08 | every **currency-display** usage |
| Files: Storage `file_ref`; async create-then-poll | Doc-7C §8 / GI-09 | P-VND-10/25, P-ADM-15; §1 |
| Notification center M6-owned; Realtime = transport | Doc-7C §6 / `Doc-5H` | P-SH-02; P-BUY-16 |
| Analytics events = presentation telemetry, coin no domain event | SC §4 / Doc-2 §8 (by reference) / GI-12 | every **Analytics**; §0 |

### `[ESC-7-*]` register (defined once in ER — **no new tags coined here**)

ESC handles are **defined once in [`esc_registry.md`](../../../esc_registry.md)** (gap · interim · channel). This
document cites bare handles only and invents none. Where each lands on a screen:

| Handle (ER) | Affected screens (this doc) |
|---|---|
| `ESC-7-API-CATNAV` | P-PUB-07/08/09 |
| `ESC-7-API-PRODDETAIL` | P-PUB-10/11/14 |
| `ESC-7-API-ADS` | P-PUB-10 (ads), Public ad placements |
| `ESC-7-API/upload` | P-BUY-07, P-ACC-02, P-VND-02/08/10/13/25, P-ADM-15, doc attachments |
| `ESC-7-API/export` | P-BUY-15, any data-table export |
| `ESC-7-API/related` | P-PUB-10/11, P-BUY-02 |
| `ESC-IDN-DELEG-EXPIRY` | P-ACC-12 |
| `ESC-7-AI` | P-BUY-01/04/07/08/15/20, P-VND-01/04/08/18, P-PUB-13, P-ACC-01 (advisory uses) |
| `ESC-RFQ-POLICY` / `ESC-OPS-POLICY` | wizard/optimistic submissions (P-BUY-07/17, P-VND-18) |
| *Industry/Brand/Standard taxonomies* (non-ESC gap, ER §1) | P-PUB-09 |

> Each gap resolves only via its **named additive channel** (ER), never locally (Doc-7C §0.3; CLAUDE.md
> §11). On any conflict with a frozen document: **Flag-and-Halt** and escalate.

---

*This document is non-authoritative. It specifies the product's 144 screens as implementation-ready
realizations of the Wave 0F page inventory, de-duplicated against SC (Wave 0.3). It operates under the
frozen corpus authority order (CLAUDE.md §7) and the Doc-7 precedence chain (§0); it introduces no
architecture change and coins no route, contract, state, transition, permission, component, event, or
page. On any conflict, the frozen document wins and this file is patched to match.*
