# WORK PACKAGE — FE-PUB-05 Product Detail

- **Lane:** G (new public route + a URL-law realization; architecture-adjacent — realizes the
  now-folded `ESC-7-API-PRODDETAIL` corpus fold, ADR-025)
- **Reviewed-SHA record:** `abd5bb9` (scope complete — URL builder + new route + seed enrichment +
  interim retirement + call-site repoints)
- **Value:** Core Marketplace · **Priority:** P1 · **Size:** M · **Risk:** Med
- **Owns:** P-PUB-11 (Product detail, public)

## Scoping note — what this milestone realizes, and what it explicitly does not

`ESC-7-API-PRODDETAIL` folded 2026-07-03 (`R-ESC7-PRODDETAIL-FREEZE`, RV-0130): a new Public contract
`marketplace.get_public_product_detail.v1` (`generatedDocs/Doc-4D_PublicProductDetail_Patch_v1.0.3.md` +
`Doc-5D_PublicProductDetail_Patch_v1.0.1.md`) and a canonical product URL law
(`generatedDocs/ADR-025_Marketplace_Public_URL_Law.md`) are now ratified architecture — but this is a
**presentation-only codebase with no backend**. Exactly as FE-PUB-10 did for the vendor URL law, this
milestone realizes the **FE-visible shape** of the ratified contract against enriched seed data, not a
real wired read. No backend call is added; nothing here waits on a further escalation.

## In scope (this delta)

- **New canonical URL builder** `app/(public)/_components/product-url.ts` (`productHref`,
  `extractProductId`) realizing ADR-025's apex route `/marketplace/product/{name-slug}-{uuid}` —
  id-anchored (UUID tail is the sole resolution key; the name-slug prefix is presentation-only,
  derived at render, never authoritative — Decision 2). A non-canonical slug prefix (or a bare-id
  request) 301-redirects to the current canonical (`permanentRedirect()`, Decision 5 / Doc-5D
  patch conformance row F-2) — the id-only leg resolves via this redirect, not a second canonical.
- **New route** `app/(public)/marketplace/product/[slug]/page.tsx` — the real standalone product
  page this milestone exists to build (the interim never had one: "there is NO standalone
  anonymous product page" was the prior interim's own governing comment). Renders: breadcrumb
  (via the deterministic pick rule below), product core (name/description/decorative media tile —
  no fabricated image URLs), specifications (the seed's existing free-text `spec` field, not
  invented structured rows), documents (honest empty state — the seed carries none, never
  fabricated), vendor summary card (name + `vendorHref()`-built link + the existing
  `VendorVerifiedBadge` [binary verified signal only — the seed carries no trust tier/score, so
  reaching for the kit's tier-based `TrustBadge` would fabricate a grading that doesn't exist;
  reused verbatim from the vendor microsite, not duplicated] — no raw `vendor_slug` rendered as
  text, only inside the href). **No price/currency rendered** — see "Corrected from the interim"
  below.
- **Canonical + og:url metadata** via `generateMetadata`, built from `productHref` (absolute via
  `metadataBase`, same pattern as FE-PUB-10's vendor routes).
- **R9 non-disclosure** — an unknown/unpublished product ID 404s byte-identically (`notFound()`,
  same `getXOr404` pattern as the vendor microsite's `get-vendor.ts`).
- **Breadcrumb deterministic pick rule** (Doc-5D patch Part 2), implemented as a real function
  operating on real data — **not stubbed**: deepest path wins → `is_specialized` → `level=primary`
  → lowest category-UUID, evaluated over each vendor's category assignments.
  - **Reuses the real, already-frozen-mirrored 794-node taxonomy tree** built by FE-PUB-09
    (`@/frontend/navigation`'s `buildTaxonomyIndex(taxonomySeed.nodes, OVERLAY_V1)` +
    `pathTo(id)`) for the ancestor chain — **does not invent a second taxonomy**. The existing
    flat `FEATURED_CATEGORIES`/`CATEGORY_GROUPS` (a separate legacy 15-slug set, per the category
    page's own comment) are NOT reused for this, since they carry no depth/hierarchy to
    demonstrate the tiebreak rule against.
  - New parallel seed map `VENDOR_CATEGORY_ASSIGNMENTS` (mirrors the `PROFILE_EXTRAS` pattern —
    additive, keyed by vendor slug) assigns each seed vendor 1–2 real taxonomy-node category
    assignments (`category_id` = a real node id from the 794-node tree, `is_specialized`,
    `level: primary|secondary`). Two vendors (Padma Valve & Fittings; Karnaphuli Chemicals) are
    deliberately given a **same-depth or different-depth pair** so the tiebreak rule actually
    exercises the "deepest wins" and "is_specialized" branches on real data, not just a
    single-path degenerate case.
- **New product fields** (additive to the seed, parallel-map pattern — mirrors how `PROFILE_EXTRAS`
  sits beside `VENDORS`): real UUID-shaped `id` per product (replacing the current slug-shaped
  `id`, which the id-anchored URL law requires) + `description`. **No structured `Attributes`
  section** — reserved-empty, per the frozen contract's own v1 socket.
- **Retire the interim** (`app/(public)/_components/product-detail.tsx`) — its own header comment
  already declared this file retires "at cutover"; that cutover is now. Deleted. Every call site
  repointed from `productDetailHref()` to `productHref()`:
  `app/(public)/search/page.tsx` (the `?product=` inline-swap branch removed — product cards link
  straight to the new canonical page instead of toggling a query param), `.../marketplace/category/
  [slug]/page.tsx`, `_components/microsite/product-showcase.tsx`, `_components/landing/
  popular-products.tsx`.

## Corrected from the interim (found during scoping, not fabricated)

The interim `product-detail.tsx` rendered a **price** (`CurrencyDisplay`/"On request"). The
now-ratified `Doc-4D_PublicProductDetail_Patch_v1.0.3`'s **normative exclusion manifest is
explicit and binding**: *"no price or currency"* is on the composed Product Detail Projection's
excluded-fields list. This was a defensible design under the old, informal interim (which invented
no field, just showed whatever the search-result card already carried) but is now a real
regression against the ratified contract if carried forward unchanged. **This milestone drops
price/currency from the new product detail page entirely** — the product card list views
(`ProductCard`, unrelated to this milestone, a separate kit component) are untouched and keep
their own price display, since the exclusion is scoped to the **detail projection**, not to search
result cards generally (the frozen text names the composed read, not the whole product surface).

## Out of scope (Review-A enforces)

- Real backend read — no HTTP call, no live `marketplace.get_public_product_detail.v1` invocation.
  Presentation-mode interim only, same posture as FE-PUB-10.
- The Host Resolution Matrix / suspended-vendor 404 nuance beyond a simple absent/unpublished
  check — the seed has no suspended/banned vendor state to render differently; the uniform
  `notFound()` already collapses every R9 cause identically by construction (there's only one
  branch), which is the correct behavior, not a shortcut.
- Sitemap/robots/discovery-file changes.
- Any change to `ProductCard`/`ProductCardVM` (the shared kit list-card component) — this
  milestone touches product-DETAIL rendering only; the list card keeps its existing price display.
- Any change to the vendor microsite (`/vendors/[slug]/*`) — FE-PUB-10's territory, closed.
- Any new kit primitive fork — reuses `Card`/`Button`/`Separator`/`EmptyState`/`ResultsGrid`/
  `ProductCard`/`VendorVerifiedBadge` verbatim (documents render an `EmptyState`, not `FileLink` —
  the seed carries no document refs, so there's nothing for `FileLink` to point at; adding one
  would mean fabricating a href); no duplicate breadcrumb component invented — a small
  presentation-only breadcrumb is composed inline from the taxonomy `pathTo()` output (the
  existing mega-menu breadcrumb is a client-only drill-trail bound to menu-state providers, not
  reusable here — confirmed during scoping, not assumed).

## Dependencies

- H: — none (ESC-7-API-PRODDETAIL resolved 2026-07-03, RV-0130; the folded corpus text is the
  binding spec for this build).
- S: — none.

## Lifecycle ownership

Builder = **Team-1** · Maintainer = **Team-1** · Review A → Review B (fresh contexts); on a clean
A:PASS ∧ B:PASS gate the owning Dev team self-closes per `review-process.md` Amendment v1.3 §13.

## Key dates

Created 2026-07-03 · Started 2026-07-03 · Paused — · Resumed — · Closed —

## DoD confirmation (checked at close)

☑ page DoD ☑ WCAG-AA (axe 0 violations on the product detail page) ☑ tsc/eslint/prettier ☑ R9 404
verified (unknown UUID + malformed/non-UUID slug both render the shared `(public)` not-found
boundary — Playwright, `networkidle` wait, since dev-mode streams an initial 200 before the
not-found boundary paints; status codes are unreliable in dev mode, verified against rendered
"404"/"Not found" content instead) ☑ 301 slug-correction verified (non-canonical slug prefix +
bare-id request both land on the canonical URL — `permanentRedirect`, verified via `page.url()`
after `networkidle`, same dev-mode timing caveat) ☑ canonical + og:url absolute via `metadataBase`
☑ breadcrumb deterministic pick rule verified against real taxonomy data on two vendors exercising
both tiebreak branches (Padma: depth wins, Butterfly Valves over Valves & Piping; Karnaphuli:
`is_specialized` wins at equal depth, Lubricants over Basic Chemicals) ☑ no price/currency rendered
on the detail hero card (scoped check — the unrelated "More from {vendor}" grid's shared
`ProductCard` legitimately keeps its own price display, out of scope) ☑ interim
`product-detail.tsx` deleted, zero remaining `productDetailHref` imports (repo-wide grep) ☐ Review
A PASS ☐ Review B PASS (B/M/M=0) ☐ gate approval (Dev-team self-close, Amendment v1.3 §13) ☑ no
TODO/dead code ☑ no duplicate components ☐ tracker updated ☐ card closed
