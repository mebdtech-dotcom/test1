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
`command-center.tsx` popular-search mismatch, single-file content-only delta). `FE-PUB-09 Mega
Menu & Taxonomy Nav` — **🔍 ACTIVE 2026-07-03**: double gate CLEARED by owner Board session
2026-07-03 (Taxonomy Content v1.0 P1 approval + `MEGA_MENU_*` package approval, with 3 rounds of
owner findings adjudicated into the build plan — Category Landing Contract, `MegaMenuVendors`
[capability-matrix-bound per Invariant #1; trade-role labels rejected], expanded Featured column,
Popular Searches strip, Post RFQ header CTA, reserved authed slots, empty-state contract,
breakpoint/z-index/analytics/perf-budget contracts; full phases 0–5 authorized; WP card
`governanceReviews/milestones/fe-pub-09-mega-menu/WORK-PACKAGE.md`). `FE-PUB-10 Canonical Vendor
Subdomain` — **⬜ Registered 2026-07-03** (Board-minted, ADR-024 realization @ `c1187a8`; owns no
pages; WP card at kickoff) — **Team-1's next pull after FE-PUB-09 closes**. Only `FE-PUB-05` ⛔
remains gated.

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
Organization` — **🔵A Review-A submitted** (checkpoint `1a5d009`; composes `OrganizationProfile` /
`OrganizationLifecycle` / `MembersView` / `RolesView` / `PermissionsView` / `DelegationView`
[P-ACC-04..11] via new `OrganizationTabs`, same composition-not-fork pattern as `FE-VEN-10`;
disclosed trade-offs: Invite-member/New-role links leave vendor chrome, "New grant" disabled — a
genuinely pre-existing dead link discovered on the Account track itself
[`/account/delegation/new` doesn't exist], distinct from `ESC-IDN-DELEG-EXPIRY`). Team-3 STOPS,
holds for the gate → then FE-VEN-12 (also unblocked). _(Out-of-scope note: FE-PUB-09 vendored
`popover`/`accordion`/`navigation-menu` into `src/frontend/primitives` — verify as a legit
demand-driven kit extension under the mega-menu package at FE-PUB-09's review.)_

**Review Team 5 standing backlog (B lane):** Step-3 Public baseline sweep (QCT 5-step Step 3) at a
stable post-cutover SHA — **owner-authorized 2026-07-02 (agenda #10)**; runs **before FE-PUB-02
starts**; findings feed the FE-PUB packages.

## Gated register (⛔ — waiting on an `esc_registry.md` handle or asset)

| Item | Gate | Interim |
|---|---|---|
| FE-PUB-05 (P-PUB-11) | `ESC-7-API-PRODDETAIL` | product modal from `search_catalog` |
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
    `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md`. **FE-PUB-10 registered**
    (Team-1's next pull after FE-PUB-09); `ESC-MKT-SUBDOMAIN-MIGRATE` opened (migration wire
    contract, API-Gov). Closed milestones not reopened.

## Review pipeline (pointer)

States, lanes (G/L), verdicts, re-entry, DoD, WP-card template: [`review-process.md`](review-process.md).
`⬜ → 🔍 → 🟡 → 🔵A → 🔵B → 🟣 → ✅` (+ 🟠/🟥/⛔/🅿/❌/♻).
