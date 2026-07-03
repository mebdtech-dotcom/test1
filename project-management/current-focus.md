# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. Pointers only — the milestone
> roadmap is [`fe-program-wbs.md`](fe-program-wbs.md), queues/gates are
> [`execution-board.md`](execution-board.md), process is [`review-process.md`](review-process.md).
> Team files remain the **page-level source record**. On any change, append to `changelog.md`.

**Updated:** 2026-07-03 · **Model:** FE Program Management v1.0 (cutover complete — Phases 0/A/B/C
done; page-loop terminus RV-0100). Teams pull milestones from the execution board, never from chat.

---

## Team-1 — Public / Platform (FE-PUB · FE-PF)

- **Current Milestone:** _(none — `FE-PUB-10` Canonical Vendor Subdomain ✅ **Closed**, RV-0128,
  A:PASS ∧ B:PASS (B/M/M=0 both lanes on the same checkpoint SHA `cafefcb`), Dev-team self-close
  per Amendment v1.3 §13. One MINOR raised by the first Review-B (a claimed `prettier --check`
  failure on the new `vendor-url.ts`, from an isolated-worktree environment) was disputed by
  Team-1's own investigation, then independently adjudicated NOT VALID by a re-entered Review-A
  and re-confirmed by a tie-breaker Review-B — three reviewers, four prettier invocations, three
  distinct prettier point-releases, unanimous PASS; the committed file's multi-line wrap is
  prettier's own required output under this repo's `printWidth:100` (the single-line form is 103
  chars). Zero code delta across the whole dispute. Full transparency record in
  `project-management/review-log.md` RV-0128)_
- **Current Page:** _(none — owns no pages by design. New shared `vendorHref(slug, subpage?)`
  builder (`app/(public)/_components/vendor-url.ts`) realizes ADR-024's Vendor URL Builder rule
  (SHALL) in presentation-mode interim: byte-identical `/vendors/${slug}` output, single swap
  point for a later wave's real CHR-resolved host. 16 files repointed off inline concatenation;
  `alternates.canonical` + `openGraph.url` (absolute via `metadataBase`) added to all 7 vendor
  microsite routes' `generateMetadata`. A pre-existing `landmark-unique` a11y finding [duplicate
  `"Vendor sections"` nav label] was found during verification, confirmed unrelated via `git diff`
  [href-value only, zero DOM/aria change], and correctly left unfixed — out of the "pixel output
  identical" acceptance bound)_
- **Current Milestone:** _(none — `FE-PUB-05` Product Detail ✅ **Closed**, RV-0132, A:PASS ∧
  B:PASS (B/M/M=0 both lanes on checkpoint `50b3c0d`), Dev-team self-close per Amendment v1.3 §13.
  New standalone route `app/(public)/marketplace/product/[slug]/page.tsx` realizes
  `marketplace.get_public_product_detail.v1`'s composed projection + `ADR-025`'s canonical product
  URL law (`/marketplace/product/{name-slug}-{uuid}`, id-anchored, `permanentRedirect` on a
  non-canonical prefix or bare-UUID request) + the Doc-5D breadcrumb deterministic pick rule
  against the REAL 794-node taxonomy tree (not a second invented one). **3-round fix-and-reverify
  cycle**: round 1 caught a real MAJOR (the retired interim's "More from {vendor}" related-products
  section was carried forward unchanged, but the folded contract's exclusion manifest explicitly
  excludes related items — fixed by removing the section entirely); rounds 2–3 caught two stale
  governance comments the prior sweep missed in the same file. Retired the interim
  `product-detail.tsx` and repointed all 4 call sites + the `/search?product=` inline-swap branch.
  Full record: `project-management/review-log.md` RV-0132.)_
- **Current Page:** _(none — owns P-PUB-11. No price/currency rendered anywhere on the detail page
  [a correction over the retired interim, which showed one]; vendor summary card shows only the
  binary `VendorVerifiedBadge`, no fabricated trust tier/score; R9 non-disclosure via `notFound()`
  collapses both an unknown id and an orphaned vendor reference identically; breadcrumb tiebreak
  verified on two vendors exercising both branches [depth wins; `is_specialized` wins at equal
  depth] against real taxonomy node ids)_
- **Pipeline stage:** idle — Team-1's FE-PUB queue is now fully complete (all of FE-PUB-01
  through FE-PUB-10 closed). No further Team-1 milestone registered on the execution board; a
  proposed FE-PLAT track (SEO completion, Storybook, observability SDK init, shared/E2E test
  coverage) is pending Board mint.
- **Next Milestone:** _(none pullable — awaiting either a fresh Board registration or the FE-PLAT
  track's mint.)_

## Team-2 — Buyer (FE-BUY / FE-CLN)

- **Current Milestone:** `FE-BUY-10` Discovery & Favorites — ✅ **APPROVED** (RV-0117, A:PASS ∧
  B:PASS, 0 BLOCKER/MAJOR/MINOR both lanes, checkpoint `6306de4`; **Review Team 5 marked approved in
  `execution-board.md` 2026-07-03** — owning Team-2 to commit [checkpoints/trackers; close record
  uncommitted] + start next. First buyer-track milestone ROUTED to Team-5 for a full mode-A
  pre-close Review-B). Owner resolved both Board agenda #3 gating decisions live 2026-07-03: P-BUY-03/04
  route topology → **reuse existing surfaces** (no new in-app directory/profile route); P-BUY-05
  favorites → **scope confirmed product/category, build stays held** on the display-projection
  gap. WP card: `governanceReviews/milestones/fe-buy-10-discovery-favorites/WORK-PACKAGE.md`.
- **Current Page:** **BX-05 CLOSED** (RV-0135; owner bug report — accordion sidebar + "Preserve
  Dashboard Shell" fix). Verified empirically (DOM probe + real clicks) that only 5 of the 7
  reported items actually remounted the shell (Notifications, Team, Organization, Profile,
  Settings — Messages/Reports were already fine). Rejected the literal `/dashboard/*` URL-prefix
  proposal (no such mechanism exists here; would've renamed ~25 shipped routes); reused the SAME
  composition-not-fork fix the Vendor track already proved for the identical bug (FE-VEN-10/11/12):
  4 new buyer-mounted pages (`/team`, `/organization`, `/profile`, `/settings`) compose the
  existing unmodified Account components; `/notifications` (zero non-buyer consumers) relocated
  bodily into `(buyer)/` at the same URL. Accordion: `Sidebar`/`MobileNav` group headers are now
  `<button aria-expanded>` with single-open state, auto-opening the group containing the active
  route. Caught + fixed a real defect before shipping: `isActive` ignored query strings, so
  `?state=draft`-style filters never highlighted/auto-opened — fixed with `useSearchParams()`.
  tsc/eslint/prettier clean; remount probe confirms all 7 items now persist the shell; axe 0 on 6
  surfaces + 1 pre-existing `color-contrast` hit on `/settings` independently reproduced on the
  untouched original `/account/security` (not this fix's defect); vendor/admin regression clean.
  Prior page: **BX-04 CLOSED** (RV-0134; owner-directed in-session, verbatim 6-point
  directive): the whole Buyer left-nav re-grouped into the canonical IA — Dashboard / Procurement
  (RFQs·Quotations·Purchase Orders groups + Documents) / Marketplace (Vendor Directory·Saved
  Vendors·Specification Library·Vendor CRM) / Communication (Messages·Notifications) / Analytics
  (Reports & Analytics) / Organization (Team·Organization) / Account (Profile·Settings).
  Before that: **BX-03 enhancement CLOSED** (RV-0133, `6316763`): `WelcomeBand`, `KpiStatCard`
  icon/tone treatment, topbar search shortcut.
- **Pipeline stage:** idle — `FE-DOC-01` ✅ **Approved** (RV-0129, A:PASS ∧ B:PASS, 0
  BLOCKER/MAJOR/MINOR both lanes, `3293009`; Review Team 5 marked approved 2026-07-03). `FE-DOC-00`
  deliverable COMPLETE @ `296b2d0` (✅ Approved, RV-0127, Lane-L, closes on deliverable, FE-VEN-14
  precedent — Board rulings on packet items stay open without blocking). Trackers synced + milestone
  self-closed this session (Amendment v1.3 §13); 1 pre-existing shared-shell a11y OBS (quick-create
  mobile `button-name`) carried forward to the shell owner, tracked at Board standing agenda #11 —
  non-blocking. *(Available in parallel while gated — proposed `FE-PLAT-08` buyer workflow test
  coverage, `fe-program-wbs.md` Track 8, pending Board mint.)*
- **Next Milestone:** no unambiguous next pull — `P-BUY-05` stays held on the target-resolution-read
  projection gap (not a scope decision); `BX-06+` further Buyer UX enhancements are P2 and explicitly
  owner-paced ("per owner, page-by-page after each review" — Phase F2 rule); the 6 BX-04-scaffolded
  routes (`/quotations`, `/quotations/compare`, `/purchase-orders`, `/saved-vendors`,
  `/spec-library`, `/messages`, `/reports`) each need their own additive contract before real
  implementation; `FE-DOC-02 → 03` are Team-3-owned (vendor leg); `FE-PLAT-08` pending Board mint.
  Awaiting owner direction on which Buyer deliverable to pull next.

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
- **Current Milestone:** _(none — `FE-DOC-02` Vendor Documents Hub ✅ **Closed**, RV-0131, A:PASS ∧
  B:PASS, B/M/M=0 both lanes at checkpoint `067c5c0`, Dev-team self-close per Amendment v1.3 §13.
  **5 fix-and-reverify cycles, 6 confirmed instances** of buyer-track content/routes carried onto
  the vendor track unchecked — (1) self-caught pre-submission [5 fabricated per-kind engagement
  routes], (2) Review-B round 1 [1 fabricated quotation-detail route], (3) Review-B round 2 [1
  contradictory buyer-copy description + 1 stale comment], (4) Review-A round 2 [LOI/Recorded/
  Confirmed silently missing], (5) Review-A round 3 [WCC silently missing from a second
  enumeration], (6) Review-A round 4 [1 invented, ungrounded "quotation history" claim]. Every
  instance small, genuine, disclosed, fixed — the pipeline produced zero false positives across an
  unusually long cycle. `FE-VEN-09/10/11/12/14` also ✅ Closed prior)_
- **Current Page:** _(none — sole in-scope page shipped: LifecycleStrip/SearchBar/ViewChips/
  RecentlyOpenedStrip/FilterSidebar + 4 sections, reusing the shared documents home + vendor's own
  `EngagementStatusChip`/`TradeInvoiceStatusChip`/`MoneyBoundaryBanner`. Axe 0 violations
  attributable to this milestone [1 pre-existing shared-shell `button-name` hit at mobile, Board
  standing agenda #11]. 2 non-gating OBS carried, both byte-identical to the buyer hub: `FACETS`
  "Status" omits `cancelled`; "Pending approval" chip label's mild framing tension, WP-card-
  prescribed)_
- **Pipeline stage:** idle
- **Next Milestone:** `FE-DOC-03 Templates & Generated Documents` (Track 7, WBS v1.2 — S-dep on the
  FE-SH-01 promotion ruling, Board agenda #13, fallback documented — groundwork submitted as
  `FE-SH-01/05/07/08 Shared Kit Promotion`, 🔵A 2026-07-03, WP card
  `governanceReviews/milestones/fe-sh-01-shared-kit-promotion/`). *(Available in parallel —
  proposed `FE-PLAT-09` vendor/admin workflow test coverage, `fe-program-wbs.md` Track 8, pending
  Board mint.)*

---

## Review Team 4 — Architecture & Governance (A lane) — queue

- **`FE-DOC-01` Buyer Documents Hub** (Team-2) — 🔵A submitted 2026-07-03 @ `3293009`; WP card
  `governanceReviews/milestones/fe-doc-01-buyer-documents-hub/WORK-PACKAGE.md` (carries the R1–R3
  owner-findings adjudication annex; lens hotspots: LifecycleStrip navigation-not-state, no coined
  kinds/facets, opaque counterparty refs, `?q=` refine-not-search, shared-home boundary).
- **`FE-DOC-00` Charter & Governance Package** (Team-2) — Lane-L deliverable @ `296b2d0`
  (docs/PM only; coverage 150/150; closes on deliverable per the FE-VEN-14 precedent).
- **`FE-SH-01/05/07/08` Shared Kit Promotion** (Kit owner, cross-team) — 🔵A submitted 2026-07-03
  (working tree, uncommitted); WP card
  `governanceReviews/milestones/fe-sh-01-shared-kit-promotion/WORK-PACKAGE.md`. Lane L proposed
  (zero-behavior-change promotion of `DataListTable`/`quotationStateDisplay`-slice/`SealedMarker`/
  new Comparison+RFQ-card composition into `src/frontend/components/`, ahead of the registry's
  normal "2nd consumer" trigger — owner CTO override). Lens hotspots: confirm zero behavior change
  (shim re-exports vs the promoted originals, byte-for-byte), confirm no `app/`-import creeps into
  the shared kit, confirm the two skipped candidates (Company Card, Quote Card) genuinely don't
  exist rather than being silently dropped. Feeds Board agenda #13's FE-SH-01 promotion item —
  this submission is that item's technical groundwork, not itself the Board ruling.

_(`FE-BUY-10` (Team-2) checkpointed 2026-07-03, awaiting Review-A — WP card
  `governanceReviews/milestones/fe-buy-10-discovery-favorites/WORK-PACKAGE.md`. Otherwise clear —
  `FE-PUB-03` (RV-0111), `FE-PUB-04` (RV-0116), `FE-PUB-06` (RV-0118), `FE-PUB-07` (RV-0119),
  `FE-PUB-01` (RV-0121), `FE-PUB-09` (RV-0126, round 3, `4d1aae8`, PASS after a 3-round
  fix-and-reverify cycle), `FE-VEN-04` (RV-0110), `FE-VEN-09` (RV-0120), `FE-VEN-10` (RV-0123),
  `FE-VEN-11` (RV-0124, PASS WITH PATCH — MINOR patched at `b847e7e`), `FE-VEN-12` (RV-0125, clean
  PASS, 0 B/M/M, 9 OBS, closed), `FE-BUY-07` (RV-0112) all cleared A and closed/advanced.)_

## Review Team 5 — Quality & Adversarial (B lane) — queue

_(B-lane clear — `FE-DOC-02` cleared, RV-0131 A:PASS ∧ B:PASS, B/M/M=0, closed by Team-3 after 5
  fix-and-reverify cycles [6 confirmed instances of buyer-content/route carryover onto the vendor
  track, every one caught, disclosed, fixed — 0 false positives across the whole cycle]. `FE-VEN-12`
  cleared prior, RV-0125 A:PASS ∧
  B:PASS, closed by Team-3
  [Review-B by a live
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
