# WORK PACKAGE — FE-PUB-10 Canonical Vendor Subdomain

- **Lane:** G (touches the anonymous vendor microsite's URL generation + metadata across all 7
  routes; architecture-adjacent — realizes a fresh Board ruling, ADR-024)
- **Reviewed-SHA record:** _(filled after checkpoint commit)_
- **Value:** Vendor Growth · **Priority:** P1 · **Size:** M · **Risk:** Med
- **Owns no pages** (own-nothing by design, per the Board registration) — touches P-PUB-13..17
  (vendor microsite) + every public surface that links out to a vendor profile.

## Scoping note — what this milestone realizes, and what it explicitly does not

`governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md` (ADR-024) mandates a
universal, free, permanent `https://{vendor-slug}.ivendorz.com/` per approved vendor via a
deterministic **CHR** (Canonical Host Resolution) algorithm (Doc-2 v1.0.5 D2-04.3) — but real
subdomain DNS/TLS/cert provisioning is explicitly **out of the corpus** ("deployment constraints,"
packet §"Discipline" item 12), and CHR itself needs a backend read (vendor subdomain binding,
active-custom-domain status) that doesn't exist in this presentation-only codebase. The packet's
own acceptance criterion (`execution-board.md` agenda #12) is **"pixel output of all existing
pages identical — only URL generation, routing, metadata, redirects, discovery artifacts may
change."** The realistic, narrow, presentation-only FE scope is therefore almost entirely
plumbing, not visible UI:

- **Item 10 (Vendor URL Builder rule, SHALL):** "every emitter... obtains vendor URLs only via the
  canonical URL builder; direct concatenation of `{slug}.ivendorz.com` prohibited." Today, **zero**
  such builder exists — every vendor-profile link across the public surface hardcodes
  `` `/vendors/${slug}` `` inline. This is the real, evidence-backed, ~14-call-site gap this
  milestone closes.
- **Item 6:** "`seo.canonical` is advisory; emitted canonical link + `og:url` = CHR output." Today,
  **none** of the 7 vendor microsite route pages' `generateMetadata` emits a canonical link or
  `og:url` at all (confirmed: only `title`/`description` are set).

Everything else in the packet — real CHR resolution to a subdomain host, 301 redirects, the Host
Resolution Matrix (404 for suspended/migrated slugs), discovery files (sitemap/robots), session/
cookie host-scoping, locale reservations — requires backend data this codebase doesn't have
(vendor subdomain binding, custom-domain status, migration history). These stay **presentation-
mode interim**, disclosed via the registered escalation handles (`ESC-MKT-CANONICAL-URL` resolved-
with-interim, `ESC-MKT-SUBDOMAIN-MIGRATE` open), never fabricated.

## In scope (this delta)

- **New shared helper** `vendorHref(slug, subpage?)` — the single canonical URL builder (ADR-024
  Decision 6 / Doc-7D §11.8). In presentation-mode interim, it returns exactly today's path shape
  (`/vendors/${slug}` or `/vendors/${slug}/${subpage}`) — byte-identical output, zero visual
  change — but centralizes generation so a later wave swaps the implementation to emit the real
  CHR-resolved host in ONE place instead of ~14.
- **Repoint every same-track call site** that currently hardcodes a vendor path to use the
  builder: `marketplace/category/[slug]/page.tsx`, `compare/page.tsx`, `search/page.tsx` (×2:
  the vendor-card href and the `ProductDetail`'s `vendorHref` prop), `vendors/page.tsx`,
  `_components/landing/supplier-showcase.tsx`, `vendors/[slug]/page.tsx` (×5 `viewAll`/contact
  links), `vendors/[slug]/capabilities/page.tsx` + `certifications/page.tsx` (redirect targets),
  `_components/microsite/vendor-microsite-footer.tsx`, `_components/microsite/
  vendor-microsite-navigation.tsx`.
- **Add canonical metadata** (`alternates.canonical` + `openGraph.url`) to all 7 vendor microsite
  route pages' `generateMetadata`, built from `vendorHref` — the interim canonical is today's
  resolvable URL (the only one that currently exists), with an in-code comment disclosing CHR will
  replace this once the backend read lands.
- **Document the interim** in the builder's own file header (mirrors the `ESC-7-API-CATNAV`
  disclosure pattern established across FE-PUB-04/06/07/09) and in `esc_registry.md` if not
  already recorded there (the Board packet says `ESC-MKT-CANONICAL-URL` was already registered
  RESOLVED-with-interim at the Board ruling — confirm, don't re-coin).

## Out of scope (Review-A enforces)

- Real subdomain resolution, DNS, TLS/cert provisioning — explicitly outside the corpus.
- 301 redirects from legacy `/vendors/[slug]/*` paths — requires the real CHR backend read; not
  buildable presentation-only, and would violate "pixel output identical" if faked.
- Host Resolution Matrix / 404-for-suspended-or-migrated-slug handling — requires vendor-status
  backend data not present in the seed.
- Sitemap/robots/discovery files, session/cookie host-scoping, locale reservations — all
  backend/infra, cited not built.
- `app/(app)/(buyer)/discover/discover-view.tsx:60` — a buyer-side (Team-2) link-out to the
  microsite. Cross-track; flagged here, **not touched** — a future Team-2 milestone repoints it if
  the builder is promoted for cross-surface reuse.
- Any change to the vendor microsite's visible chrome, content, or navigation structure — the
  7-route IA (ADR-022) is unchanged; only URL *generation* changes, and only to produce the exact
  same paths as before.
- Any new kit primitive or `src/frontend/` change — this is app-layer routing/metadata logic, not
  a UI component.

## Dependencies

- H: — none (buildable now; the builder's interim mode needs no backend read).
- S: `[ESC-MKT-SUBDOMAIN-MIGRATE]` (real migration wire contract) — cited, not blocking.

## Discovered during verification — pre-existing, out of scope, not fixed here

Independent axe-core sweep found a `landmark-unique` violation (moderate) on the vendor microsite
home/about pages: two `<nav aria-label="Vendor sections">` landmarks exist —
`vendor-microsite-navigation.tsx`'s persistent primary nav and `vendor-microsite-footer.tsx`'s
closing section-links nav both reuse the identical label. Confirmed pre-existing and unrelated to
this milestone via `git diff` on both files — only `href`-value computation changed (raw template
literals → `vendorHref()`), zero `aria-label`/DOM-structure change. Fixing it would touch visible
markup beyond URL generation, which this milestone's own acceptance criterion ("pixel output of
all existing pages identical") excludes. Recorded here for the record, not silently dropped —
belongs to the already-closed FE-PUB-03 microsite chrome, a future micro-fix candidate.

## Lifecycle ownership

Builder = **Team-1** · Maintainer = **Team-1** · Review A → Review B (fresh contexts); on a clean
A:PASS ∧ B:PASS gate the owning Dev team self-closes per `review-process.md` Amendment v1.3 §13.

## Key dates

Created 2026-07-03 · Started 2026-07-03 · Paused — · Resumed — · Closed —

## DoD confirmation (checked at close)

☐ page DoD ☐ pixel-identical acceptance verified (screenshot/text diff on all touched routes) ☐
WCAG-AA ☐ tsc/eslint/prettier ☐ all ~14 call sites repointed, zero remaining inline
`` `/vendors/${slug}` `` concatenation in Team-1-owned files ☐ canonical + og:url present on all 7
microsite routes ☐ Review A PASS ☐ Review B PASS (B/M/M=0) ☐ gate approval ☐ no TODO/dead code ☐
no duplicate components ☐ tracker updated ☐ card closed
