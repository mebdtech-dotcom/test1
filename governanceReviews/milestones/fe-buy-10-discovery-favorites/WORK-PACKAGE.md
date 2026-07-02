# WORK PACKAGE — FE-BUY-10 Discovery & Favorites

- Lane: L (single fresh-context review — presentation-only link-out delta, no new page, no
  R6/R7/firewall/money/contract surface touched)
- Reviewed-SHA record: _(filled at checkpoint)_

## Owner decisions (this milestone's unlock — recorded 2026-07-03)

Board agenda #3 resolved by the owner directly (Team-2 session, no separate Board packet needed —
both are scope/topology calls, not architecture):

1. **P-BUY-03/04 route topology → "Reuse existing surfaces."** No dedicated in-app vendor
   directory route and no dedicated in-app vendor profile route. `/discover` (P-BUY-02, already
   ✅ Approved) remains the one buyer-facing directory. Vendor identity link-outs point to the
   **public vendor microsite** (`/vendors/[slug]`, P-PUB-13, already built) instead of a new
   in-app profile page.
2. **P-BUY-05 Favorites scope → "Confirm scope, hold the build."** Scope is confirmed
   product/category favorites only (the frozen `marketplace.catalog_favorites` contract,
   `target_type = product|category`; vendor favorites are a distinct, already-shipped surface —
   `operations.vendor_favorites` CRM, FE-BUY-09). The page itself **stays held** — the target
   `list_catalog_favorites` projection carries no display name for the favorited target, so it
   can't render a meaningful list without a target-resolution read that doesn't exist yet
   (ESC-class, same family as `ESC-7-API-PRODDETAIL`). **P-BUY-05 is NOT in scope for this
   milestone.**

## In scope (the delta, stated concretely)

- `app/(app)/(buyer)/discover/discover-view.tsx`: change each `VendorCard`'s `href` from the
  dead in-app forward-ref `/discover/${v.slug}` (P-BUY-04, never built) to the live public
  microsite route `/vendors/${v.slug}`.
- `app/(app)/(buyer)/discover/page.tsx`: `MOCK_VENDORS` presentation content re-aligned to the
  **same vendor identities** as the public discovery seed
  (`app/(public)/_components/discovery/seed.ts` `VENDORS`) — same slug/name/category/location/
  verified/capability per vendor — so a buyer clicking "View profile" lands on a microsite that
  matches the card they clicked (not a different vendor, not a 404). This is content-alignment
  only: no new component, no cross-route-group import (each surface keeps its own local mock
  array, per its own existing "presentation-only, mock stands in for the wired read" pattern);
  justified because both surfaces already declare they bind the **same** M2 public reads
  (`list_vendor_directory` / `search_catalog`) once Wave-4 wires them, so aligned mock content is
  a more accurate preview than two divergent fictional catalogs, not a new divergence.
- Comment/governance-note updates on both files reflecting the reuse decision (so a future
  reader doesn't reopen the route-topology question).
- WBS/tracker closure: `team-2.md`, `fe-program-wbs.md`, `execution-board.md`,
  `current-focus.md`, `changelog.md`, `review-log.md`.

## Out of scope (explicit — scope creep against this list is a Review-A finding)

- **P-BUY-05 Favorites** — stays 🅿 held per the owner decision above; no page, no route, no
  projection work.
- Any new in-app vendor directory or vendor profile route (P-BUY-03/04 as originally scoped) —
  superseded by the reuse decision, not built.
- Wiring the real `list_vendor_directory`/`search_catalog` reads — still PARKED (Wave 4), this
  milestone stays presentation-only mock data like the rest of the buyer surface.
- Touching any file under `app/(public)/` (Team-1-owned) beyond reading `seed.ts` for content
  alignment — no edits there.
- The quotations tab (P-BUY-09) or CRM (P-BUY-26/27) vendor-link-out candidates the explore pass
  surfaced — no slug available on either projection today; recorded below as a future candidate,
  not built here.

## Dependencies

- H: none remaining (both owner-gating decisions resolved above).
- S: none.

## Lifecycle ownership

Builder = Team-2 · Maintainer = Team-2 · Review A = Review Team 4 · Review B = Review Team 5 ·
Board = owner (dev-team self-close on a clean A:PASS ∧ B:PASS gate, Amendment v1.3 §13).

## Key dates

- Created: 2026-07-03 (owner decisions recorded live in-session)
- Started: 2026-07-03

## Forward-looking (not this milestone)

- Vendor link-out from the RFQ Engagement surface is groundable (`ops.get_engagement.v1` projects
  a real opaque `vendor_profile_id`) — recorded at RV-0114 as a future CRM↔Engagement candidate,
  unrelated to this milestone's discover-page delta.
- P-BUY-09 (quotations) / P-BUY-26/27 (CRM) vendor link-outs would need their view-model
  projections extended with a slug/id the public microsite can resolve — not requested by the
  owner, not built.

## DoD confirmation

_(checked at Board close per `review-process.md` §6 — checkpoint delta only: byte-equivalence
for everything outside the two touched files.)_
