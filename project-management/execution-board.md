# Execution Board — queues · gates · Board agenda

**FE Program Management v1.0** · Non-authoritative, derived (chain: `review-process.md` §9).
**Owner (maintains): FE Program Manager** — queue advancement rule: `review-process.md` §5
(as amended v1.3 §13 — Dev-team self-close on a clean A:PASS ∧ B:PASS gate; Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override).
Roadmap: [`fe-program-wbs.md`](fe-program-wbs.md) · pointer: [`current-focus.md`](current-focus.md).

## Team queues (gate-adjusted — pull top-down; skip nothing without citing its gate)

**Team-1 (Public / PF):**
~~FE-PUB-02 Discovery~~ ✅ **Closed** (RV-0107, A:PASS ∧ B:PASS, Dev-team self-close 2026-07-02 @
`5d9d94a`) · ~~FE-PUB-03 Vendor Profile~~ ✅ **Closed** (RV-0111, A:PASS ∧ B:PASS, Dev-team
self-close 2026-07-02 @ `1275f70`) · ~~FE-PUB-04 Category Page~~ ✅ **Closed** (RV-0116, A:PASS ∧
B:PASS, 0 B/M/M both lanes, no fix-and-reverify cycle, Dev-team self-close 2026-07-03 @ `4777e84`
— new drill-down route realizing P-PUB-08, which was tracked "🟩 Built" but never actually
existed) · ~~FE-PUB-06 Vendor Directory~~ ✅ **Closed** (RV-0118, A:PASS ∧ B:PASS, 0 B/M/M both
lanes, no fix-and-reverify cycle, Dev-team self-close 2026-07-03 @ `4812157` — added the
spec-declared search entry point missing from P-PUB-12, reusing the existing `SearchBar` kit
component) · ~~FE-PUB-07 Search Result~~ ✅ **Closed** (RV-0119, A:PASS ∧ B:ISSUES-non-gating,
audit-only zero code delta, Dev-team self-close 2026-07-03 — P-PUB-10/19/20 confirmed complete;
a genuine MAJOR finding [landing "Popular search" dead ends] surfaced by the adversarial pass but
correctly attributed to the separate, not-yet-started `FE-PUB-01`, carried forward not fixed here)
· ~~FE-PUB-01 Landing~~ ✅ **Closed** (RV-0121, A:PASS ∧ B:PASS, 0 B/M/M both lanes, no
fix-and-reverify cycle, Dev-team self-close 2026-07-03 @ `17f93a8` — fixed the FE-PUB-07-carried
`command-center.tsx` popular-search mismatch, single-file content-only delta) · ~~FE-PUB-09 Mega
Menu & Taxonomy Nav~~ ✅ **Closed** (RV-0126, A:PASS ∧ B:PASS, 0 B/M/M both lanes, Dev-team
self-close 2026-07-03 @ `4d1aae8` — **after a 3-round fix-and-reverify cycle**: round 1
[`d455151`, `React.lazy`→`next/dynamic({ssr:false})`] and round 2 [`631f26a`, a fully manual
deferred `import()`] both self-verified as fixed using a "Post RFQ" content fingerprint that
turned out to be a false positive (also `SiteHeader`'s own always-rendered text) — round 2's
insufficiency was caught by a fresh, independently-dispatched Review-B [REGRESSION]; round 1's was
self-caught before round 3 with a corrected signal. **Real root cause**: the always-eager
`ExplorerSeoNav` [`app/(public)/layout.tsx`, every public route] imported from the
`@/frontend/navigation` barrel, which also re-exports every heavy `MegaMenu*` component from the
same file — Turbopack's tree-shaking wasn't granular enough to drop the unused re-exports. Round
3 fix [`4d1aae8`] bypasses the barrel in `ExplorerSeoNav`; empirically re-verified by a fresh
Review-A + Review-B pair via an independent isolated build and real Playwright interaction
tracing — chunk absent from `/about`/`/` by every mechanism, genuinely loads within ~200ms of
hover/tap. Full record: `project-management/review-log.md` RV-0126, all 3 rounds recorded
transparently including the 2 failed attempts) · ~~`FE-PUB-10` Canonical Vendor Subdomain~~ ✅
**Closed** (RV-0128, A:PASS ∧ B:PASS, B/M/M=0 both lanes on `cafefcb`, Dev-team self-close
2026-07-03 — new `vendorHref()` builder realizing ADR-024's URL Builder rule, 16 call sites
repointed, canonical/og:url added to all 7 microsite routes, byte-identical acceptance verified.
One disputed MINOR [an isolated-worktree `prettier --check` false positive] resolved via a
1-round procedural re-review with zero code delta — 3 independent reviewers, 4 prettier
invocations, unanimous PASS; full dispute record in RV-0128). `ESC-7-API-PRODDETAIL` **RESOLVED
2026-07-03** (owner Board, `R-ESC7-PRODDETAIL-FREEZE`) — `Doc-4D_PublicProductDetail_Patch_v1.0.3`
+ `Doc-5D_PublicProductDetail_Patch_v1.0.1` + `Doc-3_Policy_Key_Registration_Patch_v1.11` +
`ADR-025_Marketplace_Public_URL_Law` all folded together into `generatedDocs/`, registered in
`00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`. · ~~`FE-PUB-05` Product Detail~~ ✅ **Closed** (RV-0132,
A:PASS ∧ B:PASS, B/M/M=0 both lanes on `50b3c0d`, Dev-team self-close 2026-07-03 — new standalone
route realizing `marketplace.get_public_product_detail.v1` + `ADR-025`'s id-anchored canonical URL
law + the Doc-5D breadcrumb deterministic pick rule against the real 794-node taxonomy tree.
**3-round fix-and-reverify cycle**: round 1 [`abd5bb9`→fix] caught a real MAJOR — the retired
interim's "More from {vendor}" related-products section was carried forward unchanged, but the
folded contract's exclusion manifest explicitly excludes related items (carried separately to
`ESC-7-API/related`) — fixed by removing the section entirely, which also incidentally re-excluded
the price/currency it was smuggling back in via the shared `ProductCard`; rounds 2–3 [`883594f`,
`50b3c0d`] caught two stale governance comments of the same class the prior sweep(s) missed in the
same file. Interim `product-detail.tsx` retired, all 4 call sites + the `/search?product=`
inline-swap branch repointed. Full record: `project-management/review-log.md` RV-0132.)
**Team-1's FE-PUB queue is now fully complete (FE-PUB-01 through FE-PUB-10 all closed).** No
further Team-1 milestone registered — a proposed FE-PLAT track (SEO completion, Storybook,
observability SDK init, shared/E2E test coverage) is pending Board mint — see `fe-program-wbs.md`
Track 8.

**Team-2 (Buyer):**
~~FE-BUY-04..09~~ ✅ **All Closed** this session (RV-0102/0108/0109/0112/0113/0114 @ `5a4550c`/
`79b738a`/`5654956`/`2d1b23e`/`d501345`/`adc84fa`; FE-BUY-07 after 1 fix-and-reverify cycle,
FE-BUY-09 audit-only zero-delta) · ~~FE-CLN-01~~ ✅ **Closed** (RV-0115 @ `636c192`, A:PASS ∧
B:PASS, 0 B/M/M both lanes, no fix-and-reverify cycle; Dev-team self-close 2026-07-02) — SEVEN
Team-2 milestones this session. `FE-BUY-10 Discovery & Favorites` — **✅ APPROVED** (RV-0117 @
`6306de4`, A:PASS ∧ B:PASS, 0 BLOCKER/MAJOR/MINOR both lanes; **Review Team 5 marked approved
2026-07-03** per Amendment v1.3 §13-refined — owning Team-2 to commit [checkpoints/trackers; close
record uncommitted] + start next; owner resolved both gating decisions 2026-07-03: reuse existing
surfaces for P-BUY-03/04, hold P-BUY-05 build; P-BUY-04 link-out repointed to the public microsite,
8/8 buyer slugs resolve, favorites correctly held; WP card
`governanceReviews/milestones/fe-buy-10-discovery-favorites/WORK-PACKAGE.md`).
`FE-DOC-00 Charter & Governance Package` — **✅ APPROVED @ `296b2d0` (Lane-L, RV-0127, A:PASS ∧
B:PASS, 0 BLOCKER/MAJOR/MINOR both lanes; Review Team 5 marked approved 2026-07-03)** (Track 7
minted: WBS v1.2, universe 144 → 150, coverage PASS 150/150 [Team-5 re-ran the gate], 3 ESC rows
[coined-enum firewall clean — excluded kinds routed to human Board, nothing coined], frozen-144
§2–§8 byte-unchanged, Board packet [agenda #13] non-authoritative/human-gated; closes on
deliverable, FE-VEN-14 precedent; Team-2 updates trackers + proceeds) · `FE-DOC-01 Buyer Documents Hub` —
**✅ APPROVED @ `3293009` (RV-0129, A:PASS ∧ B:PASS, 0 BLOCKER/MAJOR/MINOR both lanes for FE-DOC-01's
own code; Review Team 5 marked approved 2026-07-03)** — static gates green (main-repo pinned deps),
governance clean (LifecycleStrip nav-not-state MAJOR-01 honored, DF-6 money-boundary [M7 invoices
separate card + link-out only, no settle/escrow], Generate/Bulk-download disabled, no coined
doc-kind/status enum, composition-not-fork via existing `DataListTable`, no "document approvals"),
live render `/documents` D/T/M 200 + axe 0 desktop/tablet + LifecycleStrip 6-stage filter + M7
link-out verified. **1 non-gating OBS → shell owner (FE-SH): PRE-EXISTING shared app-shell mobile
`button-name` a11y violation — `quick-create.tsx` trigger label `hidden sm:inline` w/ no fallback
`aria-label`, icon-only+unnamed <640px; reproduces on `/rfqs`+`/engagements`, NOT FE-DOC-01's; fix =
add `aria-label="Create"`.** WP cards `governanceReviews/milestones/fe-doc-00-governance-charter/` +
`fe-doc-01-buyer-documents-hub/`. Owning Team-2 commits [checkpoints/trackers; close uncommitted] + proceeds.

**Team-3 (Vendor):**
~~FE-VEN-05~~ ✅ **Closed** (RV-0101 @ `e2f8642`) · ~~FE-VEN-06~~ ✅ **Closed** (RV-0103 @
`4ae0ec1`) · ~~FE-VEN-07~~ ✅ **Closed** (RV-0104 @ `b1810fe`) · ~~FE-VEN-08~~ ✅ **Closed**
(RV-0105, board-approved 2026-07-02 @ `ec8306b`) · ~~FE-VEN-13~~ ✅ **Closed** (RV-0106,
board-approved 2026-07-02 @ `34395b2`, after one fix-and-reverify cycle) · ~~FE-VEN-04 remainder~~
✅ **Closed** (RV-0110, Dev-team self-close 2026-07-02 @ `4b4dc5c`, after one fix-and-reverify
cycle) · ~~FE-VEN-09 Trust Center~~ ✅ **Closed** (RV-0120, Dev-team self-close 2026-07-03 @
`32fe6fb`, no fix-and-reverify cycle — both lanes clean on first submission) · ~~FE-VEN-14
Vendor↔Account Composition~~ ✅ **Closed — report-deliverable only** (RV-0122, Lane-L PASS 0
findings, Dev-team self-close 2026-07-03 @ `71dce2f`) · **Board RULED 2026-07-03** (report §9):
Option B composed vendor-mounted page; P-ACC-13 Workflow Settings scoped OUT of `FE-VEN-12`
(buyer-only content, carried forward); P-ACC-19 reclassified `Shared` in `page_inventory.md`.
`FE-VEN-10 Billing` — **✅ APPROVED** (RV-0123 @ `4e57bfc`, A:PASS ∧ B:PASS, 0 BLOCKER/MAJOR/MINOR
both lanes; **Review Team 5 marked approved 2026-07-03** per Amendment v1.3 §13 — owning Team-3 to
commit [checkpoints/trackers; close uncommitted] + start next; composition-not-fork verified [5
Account components imported unmodified, thin `BillingTabs` over shared `WorkspaceTabs`, zero fork],
money-boundary clean, render D/T/M + axe 0, disclosed hard-coded-link trade-off honest). `FE-VEN-11
Organization` — composes `OrganizationProfile` / `OrganizationLifecycle` / `MembersView` /
`RolesView` / `PermissionsView` / `DelegationView` [P-ACC-04..11] via new `OrganizationTabs`, same
composition-not-fork pattern as `FE-VEN-10`. **Review-A: PASS WITH PATCH** (RV-0124 — 1 MINOR
comment-drift in `workspace/organization/page.tsx`'s file header, patched in place at `b847e7e`
with no resubmission to A per Review-A's own call [pure comment fix, zero scope/contract change];
1 OBS; fork check clean on all 6 reused components, both disclosed trade-offs [Invite-member/New-role
leave vendor chrome; "New grant" disabled — a genuinely pre-existing dead link on the Account track
itself, `/account/delegation/new` doesn't exist, distinct from `ESC-IDN-DELEG-EXPIRY`] independently
re-verified true). **✅ APPROVED** (RV-0124 @ `b847e7e`, A:PASS WITH PATCH ∧ B:PASS, 0
BLOCKER/MAJOR/MINOR both lanes; **Review Team 5 marked approved 2026-07-03** per Amendment v1.3 §13 —
owning Team-3 to commit [checkpoints/trackers; close uncommitted] + start next; composition-not-fork
verified [6 Account components imported unmodified, thin `OrganizationTabs` over shared
`WorkspaceTabs`, zero fork; no duplicate copies], route grounding honest [both action links to real
`/account/*` routes; New grant `disabled` — `/account/delegation/new` genuinely absent], static gates
green, render D/T/M all 200 + axe 0, tab click-through confirmed Invite/New-role hrefs + New-grant
`BUTTON[disabled,no-href]` inert). `FE-VEN-12 Settings` — composes `UserProfileForm`/P-ACC-02,
`SecuritySettings`/P-ACC-03, `NotificationPreferences`/P-ACC-15 via new `SettingsTabs`, same
composition-not-fork pattern; `WorkflowSettings`/P-ACC-13 explicitly EXCLUDED per the Board's §6.1
ruling (buyer-shaped RFQ-approval content, carried forward not fabricated); no leave-chrome
trade-off this time (none of the 3 reused components links out). **Review-A: PASS** (RV-0125 — 0
BLOCKER/MAJOR/MINOR, 9 OBS all confirmatory; fork check clean, P-ACC-13 exclusion independently
verified against the actual report text, no-leave-chrome claim confirmed, scope/kit/nav clean).
**✅ APPROVED** (RV-0125 @ `8b208ab`, A:PASS ∧ B:PASS, 0 BLOCKER/MAJOR/MINOR both lanes; **Review
Team 5 marked approved 2026-07-03** per Amendment v1.3 §13 — owning Team-3 to commit
[checkpoints/trackers; close uncommitted]; composition-not-fork verified [3 Account components
imported unmodified, thin `SettingsTabs` over shared `WorkspaceTabs`, zero fork, no duplicate copies],
**P-ACC-13 exclusion independently confirmed in source AND live render [exactly 3 tabs
Profile/Security/Notifications, no Workflow tab, no RFQ-approval text — carried forward not
fabricated]**, no leave-chrome trade-off, scope byte-stable across the FE-PUB-09 Phase-4 HEAD advance,
static gates green, render D/T/M all 200 + axe 0). **Last of the ruled FE-VEN-10 → 11 → 12 sequence —
all three approved.** `FE-DOC-02 Vendor Documents Hub` — composes the shared documents home
(`_components/documents`) + vendor's own `EngagementStatusChip`/`TradeInvoiceStatusChip`/
`MoneyBoundaryBanner` into `workspace/documents/page.tsx`; no vendor `DataListTable` equivalent, §1
renders as a local row-list. **Self-caught route-topology defect fixed pre-submission**: initial
draft mirrored the buyer hub's 5 fixed per-kind document routes, which don't exist on the vendor
track (`ESC-7G-ENG-03` enumeration-build-blocked) — every per-engagement reference now points at the
real `/workspace/engagements/[id]` page. Live-verified in an isolated `git worktree` (real `npm
install`): all routes/deep-links 200, no fabricated hrefs, disabled affordances confirmed, axe 0
violations attributable to this milestone (1 pre-existing shared-shell `button-name` hit, same as
`FE-DOC-01`'s own disclosed finding, confirmed absent from this commit's diff). **Review-A: PASS
WITH PATCH** (RV-0131 — 1 MINOR: the WP card's own "In scope" §2 bullet still described the
fabricated 5-route plan despite the top-of-file self-disclosure already correcting it; patched in
place, no resubmission needed; 2 OBS. Fork check clean; route-topology self-correction independently
re-verified against the real route tree, zero fabricated hrefs found). **Review-B round 1: ISSUES**
(1 MAJOR — a second, genuinely-missed fabricated route: the "Quotation" link + its `recently_opened`
twin hardcoded the buyer's `/rfqs/[id]/quotations/[qId]` route shape onto the vendor track, which
actually uses `/rfqs/[id]/quotation` singular [a vendor has exactly one quotation per RFQ];
live-verified 404 before the fix; 1 MINOR — stale route comment). **Fixed at checkpoint `54e8d5f`**,
live-reverified in a fresh isolated worktree (fixed route now 200). **Process correction**: this was
mistakenly resubmitted straight to a confirmatory Review-B citing review-process.md §5's original
re-entry nuance — superseded by **Amendment v1.3 §13** ("any Review-B ISSUES... always re-enters at
Review-A... no more B-only re-entry shortcut"), caught by the confirmatory Review-B itself. **Review-B
round 2 (confirmatory) at `54e8d5f`: ISSUES again** — round 1's findings reconfirmed fixed, but the
adversarial re-sweep found a THIRD instance of the recurring buyer-copy-carried-onto-vendor failure
class (1 MAJOR: §2's description text contradicted the correct disclosure 70 lines later; 1 MINOR: a
second stale comment). **Fixed at checkpoint `b1dad70`** — exhaustive re-sweep confirms no further
instances. **Correctly re-entering at Review-A** (round 2) at `b1dad70` per Amendment v1.3 §13.
**Review-A round 2 (re-entry): REVISION** — a FOURTH instance: the real, frozen `loi`
engagement-document kind was silently missing from §2's description and both `FACETS` lists,
contradicting the correct per-row disclosure in the same component. **Fixed at checkpoint
`c7ff7b7`** — §2 description + Document Type/Status facets all corrected; an exhaustive
string-by-string comparison against the buyer hub confirms no further omissions. **Review-A round
3: REVISION** — a FIFTH instance: line 372's per-row copy omitted `wcc`, contradicting §2's own
description 70 lines earlier. **Fixed at checkpoint `f701d23`**, after an exhaustive grep across
all 3 vendor-documents files for every mention of all four frozen enum families. **Re-entering at
Review-A round 4** at `f701d23` per Amendment v1.3 §13. **Standing note**: 5 confirmed instances of
the same root failure class across 4 fix-and-reverify cycles — each small, genuine, disclosed; the
pipeline is working as designed. **Review-A round 4: REVISION** — a SIXTH instance, new shape: §3's
trailing sentence was an invented, ungrounded "quotation history" claim contradicting the file's own
disclosure. **Fixed at checkpoint `067c5c0`** by deletion, after a full sentence-by-sentence
grounding read of the whole file. **Re-entering at Review-A round 5** at `067c5c0` — 6 confirmed
instances across 5 cycles. **Review-A round 5: PASS** — the 6-instance streak genuinely closed; every
frozen enum enumeration complete, every claim grounded, all cross-file comments consistent; 2 OBS
carried, non-gating, byte-identical to the already-passed buyer hub. **Review-B: PASS, B/M/M=0** —
fork/scope/gates/live-render/enum-audit all independently reconfirmed clean; both OBS reconfirmed
buyer-identical. **✅ APPROVED — A:PASS ∧ B:PASS on `067c5c0`.** Dev-team self-close per Amendment
v1.3 §13 — 5 fix-and-reverify cycles, 6 confirmed instances of buyer-content/route carryover onto
the vendor track, every one caught/disclosed/fixed, 0 false positives. **Team-3's FE-DOC-02 is
closed** → next: `FE-DOC-03 Templates & Generated Documents` (S-dep on the
FE-SH-01 ruling, kit-primitive-rows fallback documented in the packet). _(Out-of-scope note:
FE-PUB-09 vendored `popover`/`accordion`/`navigation-menu` into `src/frontend/primitives` — verify
as a legit demand-driven kit extension under the mega-menu package at FE-PUB-09's review.)_

**Review Team 5 standing backlog (B lane):** Step-3 Public baseline sweep (QCT 5-step Step 3) at a
stable post-cutover SHA — **owner-authorized 2026-07-02 (agenda #10)**; runs **before FE-PUB-02
starts**; findings feed the FE-PUB packages.

**Kit owner (cross-team, FE-SH):** `FE-SH-01/05/07/08 Shared Kit Promotion` — 🔵A submitted
2026-07-03 (working tree, uncommitted); WP card
`governanceReviews/milestones/fe-sh-01-shared-kit-promotion/WORK-PACKAGE.md`. Owner CTO override
(2026-07-03): promotes `DataListTable` (FE-SH-01), `quotationStateDisplay` slice of `state-display`
(FE-SH-05, partial), `SealedMarker` (FE-SH-07, proposed ID), and a new Comparison Table + RFQ Card
composition (FE-SH-08, proposed ID) into `src/frontend/components/` — ahead of the registry's
normal "2nd consumer" trigger. Lane L proposed (zero-behavior-change move + shims, no firewall/
money-boundary/contract touch); Board/owner may override to G. **Feeds Board agenda #13**
(Document Management packet's FE-SH-01 promotion item) — this is that item's technical groundwork,
not itself the Board ruling. `promotion-watchlist.md` + `shared_platform_component_registry.md`
already updated in the same change.

## Gated register (⛔ — waiting on an `esc_registry.md` handle or asset)

| Item | Gate | Interim |
|---|---|---|
| ~~FE-PUB-05 (P-PUB-11)~~ | ~~`ESC-7-API-PRODDETAIL`~~ **RESOLVED 2026-07-03** (owner Board, `R-ESC7-PRODDETAIL-FREEZE` — E-1/E-2/E-3 all folded) | ✅ **Closed** RV-0132 @ `50b3c0d` — product modal from `search_catalog` retired at cutover |
| ~~FE-PUB-09 mega menu~~ | ~~taxonomy P1 + `MEGA_MENU_*` package approval~~ **CLEARED 2026-07-03** (owner Board; S: `ESC-7-API-CATNAV` stays open — build-time seed interim) | — |
| FE-PF-02 brand | official SVGs under `public/brand/` | placeholder-complete kit `BrandLogo` |
| Page-gates inside milestones | P-PUB-09 `ESC-7-API-CATNAV` · P-VND-10 `ESC-7-API/upload` · P-ACC-12 `ESC-IDN-DELEG-EXPIRY` | carve-out rule (WBS) |

## Parked register (🅿 — waiting on an owner decision)

| Item | Decision needed |
|---|---|
| M2.5 vendor public microsite | continuation past the delivered foundation |

## Board standing agenda

1. **Official brand SVGs** — supply unmodified assets (`public/brand/README.md` policy); closes FE-PF-02.
2. ~~**Vendor FE BLOCKER packet**~~ — **SCORE-DISPLAY · TRUSTSCORE RULED by owner 2026-07-03**
   (`governanceReviews/BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md`): Trust Score display permitted on
   **any public-facing surface** (broader than the packet's own recommended self-view-only option),
   consistent with the frozen Doc-4G/Doc-5G public/no-slug read; no corpus patch required; Trust
   Score composition = 4 categorical pillars (Identity & Verification / Operational Reliability /
   Reputation / Platform Compliance), exact formula/weights stay `ESC-TRUST-POLICY` (open,
   backend-time). Performance Score NOT covered — stays band-only. **Unblocks `FE-VEN-09`.**
   **A7 still open** — sole remaining BLOCKER on the vendor companion freeze gate (`vendor_planning_and_design.md` §12.2, now BLOCKER=1). **Cross-team enhancement opportunity (not auto-applied):** Team-1's already-closed public microsite (`FE-PUB-03`, M2.5, Verified=binary-only) and Team-2's
   buyer-facing vendor cards were built band/badge-only under the prior posture — closed milestones
   are not reopened; this is recorded as a fresh, ownable enhancement for those tracks whenever
   picked up, not an automatic edit.
3. ~~**FE-BUY-10 decisions**~~ — **RESOLVED by owner 2026-07-03** (route topology P-BUY-03/04 →
   reuse existing surfaces; favorites scope P-BUY-05 → confirmed product/category, build held on
   the projection gap). Milestone checkpointed, awaiting Review-A.
4. **P-ACC-12** — `ESC-IDN-DELEG-EXPIRY` (delegation reinstate path).
5. **M2.5 microsite continuation.**
6. ~~**Taxonomy P1 + mega-menu package approval**~~ — **APPROVED by owner 2026-07-03** (planning
   session, both gates; 3 rounds of owner findings adjudicated; Invariant-#1 binding: vendor
   trade-role labels rejected, capability matrix only). FE-PUB-09 unblocked and started.
7. ~~**FE-VEN-10/11/12 kickoff scoping**~~ — **RULED by owner 2026-07-03** (`FE-VEN-14` report §9):
   Option B composed vendor-mounted page; P-ACC-13 Workflow Settings scoped out of `FE-VEN-12`
   (carried forward); P-ACC-19 reclassified `Shared`. Team-3 building FE-VEN-10 → 11 → 12.
8. **Shell-mount ratification** — global search `/account/search` + notification center
   `/notifications` (raised at loop terminus, non-blocking; pages ✅).
9. **SiteHeader "Pricing" nav → `/pricing`** chrome wiring (RV-0087 follow-up).
10. ~~**Authorize the Review-B Step-3 Public baseline sweep**~~ (first standing-backlog run) —
    **AUTHORIZED by owner 2026-07-02.**
11. **Shell QuickCreate button-name a11y bug** — `app/(app)/_components/shell/quick-create.tsx:29`:
    the trigger's `<span className="hidden sm:inline">Create</span>` label is hidden below `sm`
    (< 640px), leaving a bare `<Plus />` icon with no accessible name at mobile widths (axe
    `button-name`, critical impact; reproduces identically on every route since the shell mounts
    everywhere). Discovered during FE-CLN-01's axe sweep (buyer surface); shell-owned code —
    out of Team-2's unilateral-fix scope (same class as FZ-01). Fix is a one-line `sr-only` span
    or `aria-label` on the trigger `Button`; needs the shell owner, not a Board ruling.
12. ~~**Canonical Vendor Subdomain URLs**~~ — **RULED by owner 2026-07-03** (4-round CTO review,
    Final Architecture Board Resolution: APPROVED, review cycle CLOSED; ratified @ `c1187a8`):
    every APPROVED vendor gets a permanent Platform-issued Vendor Subdomain
    `https://{vendor-slug}.ivendorz.com/` (universal, never entitlement-gated); Vendor Slug law
    FIXED + reserved-label POLICY key (Doc-3 v1.10); vendor-immutable, M8-migration-only, never
    reused; **CHR** canonical-host algorithm (Doc-2 v1.0.5, fail-closed, authoritative on any
    conflict); an `active` custom domain is canonical while active; ADR-024 + 5-patch linked set +
    Doc-7D §11 (fold pending); full record
    `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md`. **FE-PUB-10 ✅ Closed**
    (RV-0128, `cafefcb`, A:PASS ∧ B:PASS, presentation-mode-interim URL builder + canonical
    metadata); `ESC-MKT-SUBDOMAIN-MIGRATE` opened (migration wire contract, API-Gov) and
    `ESC-MKT-CANONICAL-URL` stays resolved-with-interim — both still open on their handles, real
    CHR/DNS/301s not yet buildable presentation-only. Closed milestones not reopened.
13. **Document Management packet** (`governanceReviews/BOARD-PACKET-DOCUMENT-MANAGEMENT_v1.0.md`,
    2026-07-03): rule on the excluded document kinds/features — **`ESC-OPS-DOC-MUSHOK`
    (Bangladesh-statutory VAT forms, priority)** · `ESC-OPS-DOC-KINDS` (credit/debit notes,
    packing lists; sales order + contracts recommended decline) · `ESC-OPS-DOC-FEATURES`
    (signatures, expiry reminders, favorites, tags, project-linkage) — and on **FE-SH-01
    `DataListTable` promotion** (approve-with-extraction before FE-DOC-02/03, or explicit
    deferral; fallback documented). Item 1 (mint ratification) is a record of owner decisions
    already made. None of this blocks the FE-DOC builds.

14. **Buyer Vendor Directory & Vendor Discovery packet**
    (`governanceReviews/BOARD-PACKET-BUYER-VENDOR-DIRECTORY_v1.0.md`, 2026-07-03; pre-read
    `DECISION-MATRIX-BUYER-VENDOR-DIRECTORY_v1.0.md`): owner-proposed feature reconciled against
    the frozen corpus — directory core / Smart-Upgrade linking / vendor types / permissions =
    **already frozen** (BC-OPS-1; pointed, not re-coined; FE shipped in FE-BUY-09). Rulings sought:
    **R1** ratify dispositions · **R2 `ESC-VENDIR-DISCOVERY`** anonymous discovery layer
    (Flag-and-Halt, conflicts Inv#6/#11/§6.4/§10.4 — options a/b/c presented NEUTRALLY per owner
    instruction; c = rank-0, human-only) · **R3 `ESC-VENDIR-OFFPLATFORM`** off-platform recording
    shape A/B (direction owner-ruled: pursue) · **R4 `ESC-VENDIR-INVITE`** buyer-invite flow ·
    **R5 `ESC-VENDIR-FIELDS`** field/enum basket (Mushok stays on `ESC-OPS-DOC-MUSHOK`, agenda
    #13 — not duplicated). productSpec companion is fully governance-tagged
    (FROZEN-BACKED / GATED-ON-R2..R5); FE-BUY-09 `/crm` relabel/re-home registered as an
    FE-change item, not silently respecified. Human-gated; blocks no in-flight build.
15. ~~**Public Product Detail packet (`ESC-7-API-PRODDETAIL`)**~~ — **RULED by owner 2026-07-03**
    (`governanceReviews/ESC-7-API-PRODDETAIL_Product_Detail_Architecture_Plan_v1.0_PROPOSAL.md`,
    `R-ESC7-PRODDETAIL-FREEZE`, Round 4 Final Resolution: APPROVED, review cycle CLOSED). Owner
    reviewed the 4-document Annex-E package as a single governance package (2026-07-03) and ruled
    **PASS — 0 BLOCKER/MAJOR/MINOR**: new Public query contract
    `marketplace.get_public_product_detail.v1` (BC-MKT-6, composed Product Detail Projection, R9
    non-disclosure collapse enforced once, `vendor_slug` withheld, `canonical_url` opaque/builder-only)
    + its wire realization + the breadcrumb deterministic pick rule + a `get_spec_library_entry`
    conformance correction (E-1: `Doc-4D_PublicProductDetail_Patch_v1.0.3` +
    `Doc-5D_PublicProductDetail_Patch_v1.0.1`, linked pair) · registered POLICY
    `marketplace.public_read_rate_limit` (E-2: `Doc-3_Policy_Key_Registration_Patch_v1.11`) ·
    canonical product URL law, apex host `/marketplace/product/{name-slug}-{uuid}`, id-anchored, no
    vendor-host product route in v1 (E-3: `ADR-025_Marketplace_Public_URL_Law`, composes with
    ADR-024 — Vendor leg untouched). All four folded together into `generatedDocs/` 2026-07-03,
    registered in `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`; `esc_registry.md` marked RESOLVED.
    **`FE-PUB-05` un-gated — Team-1's next pull.** The FE Doc-7 leg (builder code, redirects, Host
    Resolution Matrix) is FE-PUB-05's own build scope, not a further escalation. Closed milestones
    not reopened.

## Review pipeline (pointer)

States, lanes (G/L), verdicts, re-entry, DoD, WP-card template: [`review-process.md`](review-process.md).
`⬜ → 🔍 → 🟡 → 🔵A → 🔵B → 🟣 → ✅` (+ 🟠/🟥/⛔/🅿/❌/♻).
