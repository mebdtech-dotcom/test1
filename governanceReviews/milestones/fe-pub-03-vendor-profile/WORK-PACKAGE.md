# WORK PACKAGE — FE-PUB-03 Vendor Profile (✅ Closed — RV-0111, A:PASS ∧ B:PASS, Dev-team
self-close per Amendment v1.3 §13)

- **Lane:** G (anonymous contract surface; Doc-7D §10 microsite governance; capability/verification
  firewall adjacency)
- **Reviewed-SHA record:** `1275f70` (scope complete — footer nav fix + sticky mobile CTA)
- **Value:** Vendor Growth · **Priority:** P1 · **Size:** M · **Risk:** Med

## In scope (the delta — enhancement over the 🟩 M2.7/ADR-022 multi-page microsite)

Owns P-PUB-13..17 (vendor microsite: home/profile, Products, Projects, Capabilities/About,
Contact — realized as the 7-route `app/(public)/vendors/[slug]/` site). None of these pages have
a formal RV verdict yet (🟩 Built, never reviewed under FE-PM). Grounding audit against
`screen_specifications.md` (P-PUB-13..17 deltas) found the pages substantially spec-conformant
already (breadcrumbs, empty states, kit compliance, no primitive duplication all present). Two
concrete gaps found, both fixed in this milestone:

- **Stale footer section links** (`vendor-microsite-footer.tsx`): the closing CTA band's
  "About/Products/Projects/Contact" links still use pre-ADR-022 in-page anchor hrefs
  (`#about`/`#products`/`#projects`/`#contact`) left over from the single-page design. Since the
  M2.7 refactor made the microsite a real multi-page site, these anchors match no element on any
  page (the actual section ids are `summary`/`featured-products`/`featured-projects`/`cta`, and
  sub-pages have no matching ids at all) — the links are dead on every page. Fix: point them at
  the real routes (`/vendors/[slug]/about` etc.), as `Link`, matching `VendorMicrositeNavigation`'s
  already-correct pattern.
- **Missing sticky mobile enquire CTA** (spec: P-PUB-13 "Responsive delta: sticky enquire CTA on
  M"). `VendorMicrositeHeader`'s "Request quote" button is `hidden sm:inline-flex` — mobile
  visitors have no CTA until they scroll to the page bottom. Fix: add a fixed-bottom, mobile-only
  ( `sm:hidden` ) enquire bar in `VendorMicrositeLayout` (shared chrome, all 7 routes), reusing the
  kit `Button`/`Link` and the existing `--iv-z-sticky` token (no new token).

## Out of scope (Review-A enforces)

- **"Favorite" CTA** (spec: P-PUB-13 Toolbar delta lists `favorite → (auth)`). NOT built.
  Vendor-favoriting has no anonymous-safe backing: the public `catalog_favorites` contract
  (Doc-4D §D7.5) is `target_type = product|category` only (never vendor); vendor favorites live in
  `operations.vendor_favorites` (M4, buyer-private CRM — authenticated-only). The parallel buyer
  feature (P-BUY-05/FE-BUY-10) is itself owner-gated pending a scope decision (contract-mismatch
  flag, Board agenda #3). Building a public "favorite vendor" CTA now would pull in that unresolved
  territory ahead of the Board decision — cited, not built.
- **Trust ring** (spec text). The binary `VendorVerifiedBadge` (text value "Verified") is the
  correct firewall-safe realization — a scored/numeric "ring" would leak the firewalled Trust
  Score (Inv#6) onto an anonymous page. Same override precedent as P-PUB-18/RV-0091 (screen spec
  is non-authoritative under the firewall). Not a gap; not touched.
- ARIA-tabs literal reading of "tabs (Products/Projects/Capabilities/Contact)" — superseded by the
  ADR-022 multi-page IA (Doc-7D §10.2's frozen seven-route nav); the existing route nav
  (`aria-current="page"`) is the correct realization, not a tablist. Not touched.
- Backend/wiring · AI features (`ESC-7-AI` reserved, advisory panel) · kit/token changes ·
  re-ranking or scoring of any kind · any change to `app/(public)/_components/microsite/index.ts`
  exports beyond the two files touched above.

## Dependencies

- H: — none (buildable now).
- S: — none (Step-3 Public baseline sweep already covered `vendor-hero.tsx` /
  `vendor-microsite-footer.tsx` / `vendor-microsite-header.tsx` / `product-showcase.tsx` /
  `product-detail.tsx` under promotion candidate A — `AnonymousIntentButtons` — carried context,
  not re-litigated here).

## Lifecycle ownership

Builder = **Team-1** · Maintainer = **Team-1** · Review A → Review B (fresh contexts); on a clean
A:PASS ∧ B:PASS gate the owning Dev team self-closes per `review-process.md` Amendment v1.3 §13.

## Key dates

Created 2026-07-02 · Started 2026-07-02 · Paused — · Resumed — · Closed 2026-07-02 (RV-0111,
Dev-team self-close per Amendment v1.3 §13)

## DoD confirmation (checked at close — carry-forward: delta-only; untouched microsite
sub-pages/components verified by byte-equivalence)

☑ page DoD ☑ responsive D/T/M (Playwright screenshots both lanes; Review-B corroborated live D/T/M
+ axe 0 violations mobile+desktop) ☑ WCAG-AA (axe-core WCAG 2.0/2.1 A+AA = 0 violations, both
lanes) ☑ tsc/eslint/prettier ☑ realistic mock data (existing seed, untouched) ☑ Review A PASS
(RV-0111, 7 OBS, B/M/M=0) ☑ Review B PASS (RV-0111, 8 OBS, B/M/M/NIT=0) ☑ gate approval (A:PASS ∧
B:PASS on `1275f70` — the clean gate is the approval signal per Amendment v1.3 §13) ☑ no TODO/dead
code ☑ no duplicate components (reuses kit `Button`/`Link`; no new component defined) ☑ promotion
candidates registered (none raised — pure fix, no duplication pattern surfaced) ☑ tracker updated
☑ card closed
