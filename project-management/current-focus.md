# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. Pointers only — the milestone
> roadmap is [`fe-program-wbs.md`](fe-program-wbs.md), queues/gates are
> [`execution-board.md`](execution-board.md), process is [`review-process.md`](review-process.md).
> Team files remain the **page-level source record**. On any change, append to `changelog.md`.

**Updated:** 2026-07-02 · **Model:** FE Program Management v1.0 (cutover complete — Phases 0/A/B/C
done; page-loop terminus RV-0100). Teams pull milestones from the execution board, never from chat.

---

## Team-1 — Public / Platform (FE-PUB · FE-PF)

- **Current Milestone:** _(none — `FE-PUB-04` Category Page ✅ **Closed**, RV-0116, A:PASS ∧ B:PASS
  (0 B/M/M both lanes, 4 OBS total, no fix-and-reverify cycle), checkpoint `4777e84`; Dev-team
  self-close per Amendment v1.3 §13. FE-PUB-03 also ✅ Closed, RV-0111. Second FE-PUB milestone
  this session to pass both lanes clean on the first submission)_
- **Current Page:** _(none — P-PUB-08 (Category page) was tracked "🟩 Built | partial" but never
  actually existed; new drill-down route `marketplace/category/[slug]` under the registered
  `ESC-7-API-CATNAV` interim, disclosed in-page; Vendors/Products tabs reuse kit
  `FilterSidebar`/`VendorCard`/`ProductCard`/`ResultsGrid`/`PaginationControl` only; 3 previously-dead
  `?category=` links repointed to the real route)_
- **Pipeline stage:** idle — pulling `FE-PUB-06` next (WP card pending kickoff)
- **Next Milestone:** FE-PUB-06 → FE-PUB-07 → FE-PUB-01 (skip FE-PUB-05 ⛔)

## Team-2 — Buyer (FE-BUY / FE-CLN)

- **Current Milestone:** `FE-BUY-10` Discovery & Favorites — 🔵A, checkpoint done, awaiting
  Review-A. Owner resolved both Board agenda #3 gating decisions live 2026-07-03: P-BUY-03/04
  route topology → **reuse existing surfaces** (no new in-app directory/profile route); P-BUY-05
  favorites → **scope confirmed product/category, build stays held** on the display-projection
  gap. WP card: `governanceReviews/milestones/fe-buy-10-discovery-favorites/WORK-PACKAGE.md`.
- **Current Page:** P-BUY-04 closed as a link-out (no in-app route): `discover-view.tsx`'s
  `VendorCard` href changed from the dead `/discover/${slug}` forward-ref to the live public
  microsite `/vendors/${slug}` (P-PUB-13); `discover/page.tsx`'s `MOCK_VENDORS` re-aligned
  field-for-field with the public discovery seed (`app/(public)/_components/discovery/seed.ts`
  `VENDORS`) so every card's slug resolves against the microsite instead of two divergent mock
  catalogs. P-BUY-03 superseded (no build, `/discover` = the directory). P-BUY-05 out of scope,
  stays held. `tsc`/`eslint`/`prettier --check` clean. **Live browser verification blocked** — the
  shared dev server on :3000 is currently 500ing on a turbopack chunk-manifest corruption from
  ~15 accumulated concurrent `next dev` processes across parallel team sessions (pre-existing
  environment condition, unrelated to this 2-file content diff — flagged to the owner separately,
  not fixed unilaterally). Verification is static-only pending a clean dev server: typecheck/lint/
  format clean + exact slug/name/category/location/verified/capability parity against the
  already-shipped public seed and its `.find()`-based resolver.
- **Pipeline stage:** 🔵A — awaiting Review-A (fresh context)
- **Next Milestone:** none queued after FE-BUY-10 closes — Team-2's FE-BUY/FE-CLN queue is
  otherwise exhausted this session.

## Team-3 — Vendor (FE-VEN)

- **Current Milestone:** _(none — `FE-VEN-04` remainder (Catalog) ✅ **Closed**, RV-0110, A:PASS ∧
  B:PASS, 0 BLOCKER/MAJOR/MINOR both lanes, 21 OBS total, one fix-and-reverify cycle [1 MINOR
  textarea token drift, raised → fixed → re-verified], checkpoint `4b4dc5c`; Dev-team self-close
  per Amendment v1.3 §13)_
- **Current Page:** _(none — P-VND-09 `4b4dc5c` Spec library shipped: new route
  `workspace/company/spec-library`, `SpecLibraryList`/`SpecEntryDialog` against the frozen
  `create/update_spec_library_entry.v1` pair; FE-VEN-04 Catalog now fully closed — 07/08/11
  legacy, 09 this milestone, 10 stays ⛔)_
- **Pipeline stage:** idle
- **Next Milestone:** FE-VEN-09 ⛔ · FE-VEN-10/11/12 at Board kickoff scoping

---

## Review Team 4 — Architecture & Governance (A lane) — queue

_(`FE-BUY-10` (Team-2) checkpointed 2026-07-03, awaiting Review-A — WP card
  `governanceReviews/milestones/fe-buy-10-discovery-favorites/WORK-PACKAGE.md`. Otherwise clear —
  `FE-PUB-03` (RV-0111), `FE-PUB-04` (RV-0116), `FE-VEN-04` (RV-0110), `FE-BUY-07` (RV-0112) all
  cleared A and closed.)_

## Review Team 5 — Quality & Adversarial (B lane) — queue

_(B-lane clear — nothing at 🔵B awaiting Review-B.)_

- **`FE-PUB-03` Vendor Profile** (Team-1) — Review-B **PASS** (RV-0111, 0 B/M/M, 8 OBS, `1275f70`;
  render D/T/M + axe 0 mobile/desktop; sticky-bar no-occlusion + dup-control clean) → Team-1 self-close.
- **Post-verified (owner "Team-5 post-verifies each" ruling — mode-B, self-B'd + closed by the
  parallel session, Team-5 independently concurred read-only, no defect):** FE-VEN-04 (RV-0110, same
  textarea MINOR reached independently + `4b4dc5c` fix faithful), FE-BUY-07 (RV-0112, MAJOR caption
  grep-confirmed gone, rationale in comments-only), FE-BUY-08 (RV-0113, no coined enum, R7 counts
  wired-not-derived, clone = rule-of-three OBS not MINOR), FE-BUY-09 (RV-0114 CRM, zero-diff audit;
  Inv#11 blacklist-undetectable + Inv#6 firewall re-confirmed by grep — status only in CRM detail,
  every other surface's "blacklist" mention is a non-disclosure comment), FE-CLN-01 (RV-0115 freeze
  remediation, 18 files; frozen-kit-untouched, new `Callout` de-dupes ~8 inline callouts [buyer-scoped,
  no kit primitive re-impl], escalated shell a11y bug correctly pre-existing/not-fixed-unilaterally),
  FE-BUY-05 (RV-0108), FE-BUY-06 (RV-0109 Award). _(RV-0114/RV-0115 review-log concurrence lines were
  swapped by a concurrent-writer race — Team-5 repaired both in place.)_
- _Prior full-B (routed to Team-5): FE-PUB-02 (RV-0107). Earlier closed: FE-BUY-04 (RV-0102),
  FE-VEN-06/07/08/13 (RV-0103/0104/0105/0106)._

- **Standing backlog:** Step-3 Public Shared Promotion baseline sweep — ✅ **DONE / PASS
  2026-07-02** (SHA `6007ea1`; 0 B/M/M; report
  `governanceReviews/REVIEW-TEAM-5-STEP-3-PUBLIC-BASELINE-SWEEP_v1.0.md`). 4 within-public promotion
  candidates + kit `Textarea` gap **raised → Board** (Raise≠Accept). **FE-PUB-02 S-dependency
  satisfied — Team-1 unblocked.** · Next: Step 4 → FE-CLN-06 · Step 5 → FE-CLN-07

## Architecture Board — queue

- **Standing agenda:** [`execution-board.md`](execution-board.md) §Board standing agenda (10 items)
