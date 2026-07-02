# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. Pointers only — the milestone
> roadmap is [`fe-program-wbs.md`](fe-program-wbs.md), queues/gates are
> [`execution-board.md`](execution-board.md), process is [`review-process.md`](review-process.md).
> Team files remain the **page-level source record**. On any change, append to `changelog.md`.

**Updated:** 2026-07-03 · **Model:** FE Program Management v1.0 (cutover complete — Phases 0/A/B/C
done; page-loop terminus RV-0100). Teams pull milestones from the execution board, never from chat.

---

## Team-1 — Public / Platform (FE-PUB · FE-PF)

- **Current Milestone:** _(none — `FE-PUB-01` Landing ✅ **Closed**, RV-0121, A:PASS ∧ B:PASS
  (0 B/M/M both lanes, 2 OBS total, no fix-and-reverify cycle), checkpoint `17f93a8`; Dev-team
  self-close per Amendment v1.3 §13. Fourth consecutive Team-1 milestone this session to pass both
  lanes clean on the first submission. Closes the loop opened by `FE-PUB-07`'s audit)_
- **Current Page:** _(none — P-PUB-01's Command Center `DEFAULT_POPULAR_SEARCHES` fixed: 4 of 5
  curated "Popular" search chips didn't substring-match any product in `discovery/seed.ts`
  [content mismatch, not a route/contract defect, found during FE-PUB-07's audit]; replaced with 5
  terms each independently verified to match a real product, preserving the original cross-category
  spread. Content-only, single-file delta — no kit/route/filter-logic touched. A confirming sweep
  found no other landing section carries the same bug class [all source from seed-derived
  constants, not independent string literals])_
- **Pipeline stage:** 🔍 building — `FE-PUB-09` Mega Menu & Taxonomy Nav **ACTIVE 2026-07-03**:
  owner Board session cleared BOTH gates (Taxonomy Content v1.0 P1 + `MEGA_MENU_*` package
  approval) and adjudicated 3 rounds of findings into the build plan (Category Landing Contract →
  `/marketplace/category/[slug]`; `MegaMenuVendors` capability-matrix-bound per Invariant #1 —
  trade-role labels REJECTED; expanded Featured column; Popular Searches strip; Post RFQ header
  CTA; reserved authed slots; empty-state/breakpoint/z-index/analytics/perf-budget contracts).
  Phases 0–5 authorized. WP card:
  `governanceReviews/milestones/fe-pub-09-mega-menu/WORK-PACKAGE.md`
- **Next Milestone:** `FE-PUB-10` Canonical Vendor Subdomain — **⬜ Registered 2026-07-03**
  (Board-minted, ADR-024 realization @ `c1187a8`; owns no pages; WP card at kickoff; acceptance:
  pixel output of all existing pages identical — only URL generation, routing, metadata,
  redirects, discovery artifacts may change) · then FE-PUB-05 ⛔ `ESC-7-API-PRODDETAIL` (still
  gated)

## Team-2 — Buyer (FE-BUY / FE-CLN)

- **Current Milestone:** `FE-BUY-10` Discovery & Favorites — ✅ **APPROVED** (RV-0117, A:PASS ∧
  B:PASS, 0 BLOCKER/MAJOR/MINOR both lanes, checkpoint `6306de4`; **Review Team 5 marked approved in
  `execution-board.md` 2026-07-03** — owning Team-2 to commit [checkpoints/trackers; close record
  uncommitted] + start next. First buyer-track milestone ROUTED to Team-5 for a full mode-A
  pre-close Review-B). Owner resolved both Board agenda #3 gating decisions live 2026-07-03: P-BUY-03/04
  route topology → **reuse existing surfaces** (no new in-app directory/profile route); P-BUY-05
  favorites → **scope confirmed product/category, build stays held** on the display-projection
  gap. WP card: `governanceReviews/milestones/fe-buy-10-discovery-favorites/WORK-PACKAGE.md`.
- **Current Page:** P-BUY-04 closed as a link-out (no in-app route): `discover-view.tsx`'s
  `VendorCard` href changed from the dead `/discover/${slug}` forward-ref to the live public
  microsite `/vendors/${slug}` (P-PUB-13); `discover/page.tsx`'s `MOCK_VENDORS` re-aligned
  field-for-field with the public discovery seed (`app/(public)/_components/discovery/seed.ts`
  `VENDORS`) so every card's slug resolves against the microsite instead of two divergent mock
  catalogs. P-BUY-03 superseded (no build, `/discover` = the directory). P-BUY-05 out of scope,
  stays held. `tsc`/`eslint`/`prettier --check` clean. **Live-verified** — after the owner
  authorized a cleanup of ~30 stale/zombie `next dev` processes that had accumulated across
  parallel team sessions and corrupted the shared turbopack chunk cache (500s repo-wide), the
  surviving clean dev server confirms `/discover` 200 with all 8 cards linking `/vendors/[slug]`,
  and `/vendors/padma-valve-fittings` 200 rendering the matching "Padma Valve & Fittings Ltd."
  profile — card identity and microsite identity now match end-to-end.
- **Pipeline stage:** ✅ APPROVED (A:PASS ∧ B:PASS, RV-0117) — Team-2 to commit + start next
- **Next Milestone:** none queued after FE-BUY-10 closes — Team-2's FE-BUY/FE-CLN queue is
  otherwise exhausted this session.

## Team-3 — Vendor (FE-VEN)

- **Current Milestone:** _(none — `FE-VEN-10` Billing ✅ **Closed**, RV-0123, A:PASS ∧ B:PASS, 0
  BLOCKER/MAJOR/MINOR both lanes, Review Team 5-approved 2026-07-03 @ `4e57bfc`. Composes 5
  unmodified Account components — composition-not-fork independently verified by both lanes. FE-VEN-09/14 also ✅ Closed prior)_
- **Current Milestone (new):** `FE-VEN-11` Organization — **🔵A Review-A** (checkpoint `1a5d009`;
  scope complete — sole in-scope page `workspace/organization` composed, second of the ruled
  FE-VEN-10 → 11 → 12 sequence)
- **Current Page:** _(sole in-scope page — 6 tabs, each a direct unmodified import of the real
  Account component: `OrganizationProfile`, `OrganizationLifecycle`, `MembersView`, `RolesView`,
  `PermissionsView`, `DelegationView` [P-ACC-04..11]. Disclosed trade-offs: "Invite member"/"New
  role" links leave vendor chrome for the existing `/account/members/invite`/`/account/roles/new`
  routes [same class as `FE-VEN-10`'s]; "New grant" is **disabled, not linked** — a genuinely
  pre-existing gap discovered on the Account track itself [`/account/delegation/new` doesn't exist
  anywhere, distinct from the already-registered `ESC-IDN-DELEG-EXPIRY`] — submitted to Review-A;
  Team-3 STOPS, does not pull FE-VEN-12 before gate)_
- **Pipeline stage:** submitted to Review-A (Lane G)
- **Next Milestone:** FE-VEN-12 Settings

---

## Review Team 4 — Architecture & Governance (A lane) — queue

_(`FE-BUY-10` (Team-2) checkpointed 2026-07-03, awaiting Review-A — WP card
  `governanceReviews/milestones/fe-buy-10-discovery-favorites/WORK-PACKAGE.md`. **`FE-VEN-11`
  (Team-3) checkpointed `1a5d009`, awaiting Review-A** — WP card
  `governanceReviews/milestones/fe-ven-11-organization/WORK-PACKAGE.md`. Otherwise clear —
  `FE-PUB-03` (RV-0111), `FE-PUB-04` (RV-0116), `FE-PUB-06` (RV-0118), `FE-PUB-07` (RV-0119),
  `FE-PUB-01` (RV-0121), `FE-VEN-04` (RV-0110), `FE-VEN-09` (RV-0120), `FE-VEN-10` (RV-0123),
  `FE-BUY-07` (RV-0112) all cleared A and closed.)_

## Review Team 5 — Quality & Adversarial (B lane) — queue

_(B-lane clear — `FE-VEN-10` cleared, RV-0123 A:PASS ∧ B:PASS, 7 OBS, closed by Team-3 [Review-B
  by a live Team-5 session — composition-not-fork, money-boundary, render D/T/M+axe all
  independently confirmed].)_

- **`FE-PUB-03` Vendor Profile** (Team-1) — Review-B **PASS** (RV-0111, 0 B/M/M, 8 OBS, `1275f70`;
  render D/T/M + axe 0 mobile/desktop; sticky-bar no-occlusion + dup-control clean) → Team-1 self-close.
- **`FE-BUY-10` Discovery & Favorites** (Team-2) — full mode-A Review-B **PASS → APPROVED** (RV-0117,
  0 B/M/M, 7 OBS, `6306de4`; tsc/eslint/prettier + render D/T/M + axe 0 violations; **8 hrefs → `/vendors/[slug]`,
  0 dead forward-refs, 8/8 slug parity vs public seed**; firewall/Inv#11/favorites-held/no-public-import
  all clean). **First buyer-track milestone routed to Team-5** (not self-B'd). Marked approved in execution-board.md.
- **Post-verified (owner "Team-5 post-verifies each" ruling — mode-B, self-B'd + closed by the
  parallel session, Team-5 independently concurred read-only, no defect):** FE-VEN-04 (RV-0110, same
  textarea MINOR reached independently + `4b4dc5c` fix faithful), FE-BUY-07 (RV-0112, MAJOR caption
  grep-confirmed gone, rationale in comments-only), FE-BUY-08 (RV-0113, no coined enum, R7 counts
  wired-not-derived, clone = rule-of-three OBS not MINOR), FE-BUY-09 (RV-0114 CRM, zero-diff audit;
  Inv#11 blacklist-undetectable + Inv#6 firewall re-confirmed by grep — status only in CRM detail,
  every other surface's "blacklist" mention is a non-disclosure comment), FE-CLN-01 (RV-0115 freeze
  remediation, 18 files; frozen-kit-untouched, new `Callout` de-dupes ~8 inline callouts [buyer-scoped,
  no kit primitive re-impl], escalated shell a11y bug correctly pre-existing/not-fixed-unilaterally),
  FE-PUB-04 (RV-0116 Category Page, new `marketplace/category/[slug]` route; kit-reuse no-primitive,
  notFound byte-identical [Inv#11], filter-not-sort [R6/GI-04], real counts [GI-03], ESC-7-API-CATNAV
  disclosed), FE-PUB-06 (RV-0118 Vendor Directory, single-file `SearchBar` reuse; no new primitive,
  no filter-logic duplication, R6/GI-04 clean — pure navigation), FE-PUB-07 (RV-0119 Search Result
  audit, zero code delta on P-PUB-10/19/20; the adversarial pass's genuine MAJOR find [landing-page
  "Popular search" dead ends] correctly attributed outside scope to the not-yet-started FE-PUB-01,
  carried forward not swept under the rug), FE-PUB-01 (RV-0121 Landing, single-file content-only fix
  to the FE-PUB-07-carried finding; all 5 new terms independently re-verified to match real seed
  products, no other landing section carries the same bug class), FE-BUY-05 (RV-0108), FE-BUY-06
  (RV-0109 Award). _(RV-0114/RV-0115 review-log concurrence lines were swapped by a concurrent-writer
  race — Team-5 repaired both in place.)_
- _Prior full-B (routed to Team-5): FE-PUB-02 (RV-0107). Earlier closed: FE-BUY-04 (RV-0102),
  FE-VEN-06/07/08/13 (RV-0103/0104/0105/0106)._

- **Standing backlog:** Step-3 Public Shared Promotion baseline sweep — ✅ **DONE / PASS
  2026-07-02** (SHA `6007ea1`; 0 B/M/M; report
  `governanceReviews/REVIEW-TEAM-5-STEP-3-PUBLIC-BASELINE-SWEEP_v1.0.md`). 4 within-public promotion
  candidates + kit `Textarea` gap **raised → Board** (Raise≠Accept). **FE-PUB-02 S-dependency
  satisfied — Team-1 unblocked.** · Next: Step 4 → FE-CLN-06 · Step 5 → FE-CLN-07

## Architecture Board — queue

- **Standing agenda:** [`execution-board.md`](execution-board.md) §Board standing agenda (10 items)
