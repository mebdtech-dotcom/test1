# WORK PACKAGE — FE-PUB-04 Category Page (✅ Closed — RV-0116, A:PASS ∧ B:PASS, Dev-team
self-close per Amendment v1.3 §13)

- **Lane:** G (anonymous contract surface; touches an already-closed FE-PUB-02 file)
- **Reviewed-SHA record:** `4777e84` (scope complete — new category route + 3 dead-link repoints)
- **Value:** Core Marketplace · **Priority:** P1 · **Size:** S · **Risk:** Low

## Scoping note (why this milestone looks different from a normal enhancement)

`team-1.md` listed P-PUB-08 (Category page) as "🟩 Built | partial — verify facets," but no
dedicated implementation actually exists: `/marketplace` is a static curated hub that reads zero
query params, and `/search` has real filter/result infrastructure but never consumed `?category=`
or `?capability=`. Every category-tile link across the app (`/categories`, `/marketplace`,
`/search`'s categories tab) pointed at `/marketplace?category=slug`, which does nothing — a dead
interim. This is a genuine fresh build (READY(build), not READY(enh)) despite the WBS row saying
READY(enh); flagged here rather than silently building around it.

## In scope (this delta)

- **New route `app/(public)/marketplace/category/[slug]/page.tsx`** (realizes P-PUB-08): drills
  into a category from its slug, lists matching vendors and products (exact-match filter over the
  same curated seed `/search`/`/vendors` already use — a `search_catalog` category-facet read
  stand-in under the registered interim `ESC-7-API-CATNAV`, disclosed in-page). Vendors/Products
  tabs (URL-synced `?tab=`), reuses the kit `FilterSidebar`/`VendorCard`/`ProductCard`/
  `ResultsGrid`/`PaginationControl` — no new card type, no new primitive, no kit/token change.
  Unknown slug → `notFound()` (byte-identical to absence, Inv#11), matching the established
  `getVendorOr404` pattern.
- **Repoint the 3 existing dead-link sources** to the new real route: `categories/page.tsx`
  (FE-PUB-02's closed delta — touched again here, in scope for THIS milestone's re-review only),
  `_components/landing/featured-categories.tsx`, and `search/page.tsx`'s categories tab. Only the
  `?category=` links change; the separate `?capability=` interim (also on `categories/page.tsx`)
  is untouched — out of scope, a different gap.

## Out of scope (Review-A enforces)

- The `?capability=` interim (still not consumed by any page) — a distinct gap, not this
  milestone's job.
- P-PUB-09 Industry page — stays ⛔ `ESC-7-API-CATNAV` carved out, not built.
- Real `search_catalog` wiring, pagination wiring, backend/mutation, AI, kit/token changes.
- Any change to the Vendors/Products tab content beyond routing them off the category filter
  (no new sort/rank — GI-04; no fabricated counts — GI-03).

## Dependencies

- H: — none (buildable now against the existing seed).
- S: — none.

## Lifecycle ownership

Builder = **Team-1** · Maintainer = **Team-1** · Review A → Review B (fresh contexts).

## Key dates

Created 2026-07-03 · Started 2026-07-03 · Paused — · Resumed — · Closed 2026-07-03

## DoD confirmation (checked at close)

☑ page DoD ☑ responsive D/T/M (Playwright 390/768/1280, both tabs, Review-B) ☑ WCAG-AA (axe-core 6
scans, 0 violations) ☑ tsc/eslint/prettier ☑ realistic mock data (existing curated seed, no
invented records) ☑ Review A PASS (RV-0116, 2 OBS, B/M/M=0) ☑ Review B PASS (RV-0116, 2 OBS,
B/M/M=0) ☑ gate approval (A:PASS ∧ B:PASS on `4777e84` — the clean gate is the approval signal per
Amendment v1.3 §13) ☑ no TODO/dead code ☑ no duplicate components (reuses kit `FilterSidebar`/
`VendorCard`/`ProductCard`/`ResultsGrid`/`PaginationControl` only; no new primitive) ☑ promotion
candidates registered (none raised — the OBS'd `getCategoryOr404` gap is a watch item, not a
duplication needing extraction yet) ☑ tracker updated ☑ card closed

## Close record

**✅ Closed 2026-07-03.** Review-A: PASS (0 B/M/M, 2 OBS). Review-B: PASS (0 B/M/M, 2 OBS). No
fix-and-reverify cycle — both lanes passed on the first submission. Dev-team self-close per
Amendment v1.3 §13. Full record: `project-management/review-log.md` RV-0116. Milestone-close
commit: `milestone(FE-PUB-04): close — RV-0116 A:PASS B:PASS`.
