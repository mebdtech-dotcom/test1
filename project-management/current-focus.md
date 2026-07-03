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
- **Pipeline stage:** idle — `FE-PUB-09` Mega Menu & Taxonomy Nav ✅ **Closed** at `4d1aae8`
  after a **3-round fix-and-reverify cycle** (RV-0126). Round 1 (checkpoint `d455151`,
  `React.lazy`→`next/dynamic({ssr:false})`) and round 2 (checkpoint `631f26a`, a fully manual
  deferred `import()`) both *looked* fixed under self-verification but weren't — both used a
  content fingerprint ("Post RFQ") that turned out to be a false positive, since that string is
  also `SiteHeader`'s own always-rendered CTA text. Round 2's insufficiency was caught by a
  fresh, independently-dispatched Review-B (REGRESSION verdict); round 1's flaw was self-caught
  before round 3 using a corrected signal. **Real root cause** (round 3): the always-eager
  `ExplorerSeoNav` (rendered directly in `app/(public)/layout.tsx`, every public route) imported
  from the `@/frontend/navigation` barrel, which also re-exports every heavy `MegaMenu*`
  component from the same `index.ts` — Turbopack's production tree-shaking wasn't granular
  enough to drop the unused re-exports, pulling the whole mega-menu chunk into the always-eager
  layout bundle. **Fixed** (checkpoint `4d1aae8`): `ExplorerSeoNav` now imports directly from
  the concrete `model/*.ts` files, bypassing the barrel. **Empirically re-verified** by both a
  fresh Review-A (architectural/static-analysis PASS) and a fresh Review-B (independent isolated
  build + real Playwright interaction tracing — confirmed the chunk is absent from `/about`/`/`
  by every mechanism (`<script>`/`modulepreload`/`prefetch`) and genuinely loads within ~200ms of
  hover/tap) — both 0 findings, 4 OBS total, gate clean. Dev-team self-close per Amendment v1.3
  §13. Full record: `project-management/review-log.md` RV-0126 (all 3 rounds, including the two
  failed attempts, recorded transparently).
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
- **Pipeline stage:** `FE-DOC-01` 🔵A Review-A @ `3293009` — Team-2 STOPS (no further pull before
  gate). `FE-DOC-00` deliverable COMPLETE @ `296b2d0` (Lane-L pass pending; closes on deliverable,
  FE-VEN-14 precedent — Board rulings on packet items stay open without blocking).
- **Next Milestone:** _(after the FE-DOC-01 gate)_ — Team-3 holds `FE-DOC-02 → 03`; `FE-DOC-04`
  Board-assign. Track 7 minted 2026-07-03 (WBS v1.2, universe 144 → 150, coverage PASS 150/150);
  WP cards `governanceReviews/milestones/fe-doc-00-governance-charter/` +
  `fe-doc-01-buyer-documents-hub/` (R1–R3 owner-findings adjudication annex).

## Team-3 — Vendor (FE-VEN)

- **Current Milestone:** _(none — `FE-VEN-12` Settings ✅ **Closed**, RV-0125, A:PASS ∧ B:PASS, 0
  BLOCKER/MAJOR/MINOR both lanes (one process-integrity BLOCKER raised by a second,
  independently-spawned Review-B agent was adjudicated NOT VALID — misdiagnosed a genuine live
  concurrent Team-5 review as self-certified/fabricated; both independent reviewers' technical
  findings converged, full reasoning in RV-0125), Review Team 5-approved 2026-07-03 @ `8b208ab`.
  **Closes the ruled FE-VEN-10 → 11 → 12 sequence — all three milestones approved.** `FE-VEN-09/10/11/14`
  also ✅ Closed prior)_
- **Current Page:** _(none — sole in-scope page shipped: 3 tabs, each a direct unmodified import of
  the real Account component: `UserProfileForm`/P-ACC-02, `SecuritySettings`/P-ACC-03,
  `NotificationPreferences`/P-ACC-15. `WorkflowSettings`/P-ACC-13 explicitly EXCLUDED per the
  Board's §6.1 ruling — buyer-shaped RFQ-approval content, no vendor equivalent yet, carried
  forward not fabricated, independently confirmed by both review lanes against the actual report
  text and live render [`hasWorkflowTab:false`]. No leave-chrome trade-off this time — none of the
  3 reused components carries an internal link to another Account route)_
- **Pipeline stage:** idle
- **Next Milestone:** `FE-DOC-02 Vendor Documents Hub` → `FE-DOC-03 Templates & Generated
  Documents` (Track 7, WBS v1.2 — pulls after FE-DOC-01 establishes the hub pattern; FE-DOC-03
  S-dep on the FE-SH-01 promotion ruling, Board agenda #13, fallback documented)

---

## Review Team 4 — Architecture & Governance (A lane) — queue

- **`FE-DOC-01` Buyer Documents Hub** (Team-2) — 🔵A submitted 2026-07-03 @ `3293009`; WP card
  `governanceReviews/milestones/fe-doc-01-buyer-documents-hub/WORK-PACKAGE.md` (carries the R1–R3
  owner-findings adjudication annex; lens hotspots: LifecycleStrip navigation-not-state, no coined
  kinds/facets, opaque counterparty refs, `?q=` refine-not-search, shared-home boundary).
- **`FE-DOC-00` Charter & Governance Package** (Team-2) — Lane-L deliverable @ `296b2d0`
  (docs/PM only; coverage 150/150; closes on deliverable per the FE-VEN-14 precedent).

_(`FE-BUY-10` (Team-2) checkpointed 2026-07-03, awaiting Review-A — WP card
  `governanceReviews/milestones/fe-buy-10-discovery-favorites/WORK-PACKAGE.md`. Otherwise clear —
  `FE-PUB-03` (RV-0111), `FE-PUB-04` (RV-0116), `FE-PUB-06` (RV-0118), `FE-PUB-07` (RV-0119),
  `FE-PUB-01` (RV-0121), `FE-PUB-09` (RV-0126, round 3, `4d1aae8`, PASS after a 3-round
  fix-and-reverify cycle), `FE-VEN-04` (RV-0110), `FE-VEN-09` (RV-0120), `FE-VEN-10` (RV-0123),
  `FE-VEN-11` (RV-0124, PASS WITH PATCH — MINOR patched at `b847e7e`), `FE-VEN-12` (RV-0125, clean
  PASS, 0 B/M/M, 9 OBS, closed), `FE-BUY-07` (RV-0112) all cleared A and closed/advanced.)_

## Review Team 5 — Quality & Adversarial (B lane) — queue

_(B-lane clear — `FE-VEN-12` cleared, RV-0125 A:PASS ∧ B:PASS, closed by Team-3 [Review-B by a live
  Team-5 session — composition-not-fork, P-ACC-13 exclusion, no-leave-chrome, render D/T/M+axe all
  independently confirmed; a second, independently-spawned Review-B agent reached the same
  technical PASS concurrently but misdiagnosed the live entry as a fabricated/self-certified
  record — adjudicated NOT VALID, full reasoning in RV-0125; a standing process note was raised for
  the human owner re: fresh reviewers repeatedly encountering this expected live-concurrent-session
  pattern]. `FE-VEN-11` cleared prior, RV-0124 A:PASS WITH PATCH ∧ B:PASS. `FE-VEN-10` cleared
  prior, RV-0123 A:PASS ∧ B:PASS, 7 OBS. **All three of the ruled FE-VEN-10 → 11 → 12 sequence now
  closed.**)_

- **`FE-PUB-09` Mega Menu & Taxonomy Nav** (Team-1) — Review-B round 3 **PASS** (RV-0126, `4d1aae8`,
  0 B/M/M, 4 OBS total across rounds; independent isolated build + real Playwright interaction
  tracing empirically confirmed the round-3 root-cause fix — chunk absent from `/about`/`/` by
  every eager-load mechanism, genuinely loads within ~200ms of hover/tap). Closes a 3-round
  fix-and-reverify cycle (2 prior fix attempts both self-verified with a flawed content
  fingerprint and didn't actually work — caught before shipping, never silently passed).
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
