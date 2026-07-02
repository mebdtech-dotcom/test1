# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. Pointers only — the milestone
> roadmap is [`fe-program-wbs.md`](fe-program-wbs.md), queues/gates are
> [`execution-board.md`](execution-board.md), process is [`review-process.md`](review-process.md).
> Team files remain the **page-level source record**. On any change, append to `changelog.md`.

**Updated:** 2026-07-02 · **Model:** FE Program Management v1.0 (cutover complete — Phases 0/A/B/C
done; page-loop terminus RV-0100). Teams pull milestones from the execution board, never from chat.

---

## Team-1 — Public / Platform (FE-PUB · FE-PF)

- **Current Milestone:** `FE-PUB-03` Vendor Profile — **🔵A Review-A** (scope complete at checkpoint
  `1275f70`; FE-PUB-02 ✅ Closed RV-0107 prior)
- **Current Page:** _(shared microsite chrome delta — `vendor-microsite-footer.tsx` +
  `vendor-microsite-layout.tsx` `1275f70`: fixed stale pre-ADR-022 footer nav anchors → real routes;
  added fixed-bottom mobile-only enquire CTA (spec-required, was missing) — submitted to Review-A;
  Team-1 STOPS, does not pull FE-PUB-04)_
- **Pipeline stage:** submitted to Review-A (Lane G)
- **Next Milestone:** FE-PUB-04 → FE-PUB-06 → FE-PUB-07 → FE-PUB-01 (skip FE-PUB-05 ⛔)

## Team-2 — Buyer (FE-BUY)

- **Current Milestone:** _(none — `FE-BUY-06` Award ✅ **Closed**, RV-0109, A:PASS ∧ B:PASS, 0
  BLOCKER/MAJOR/MINOR, 10 OBS, checkpoint `5654956`; Dev-team self-close per Amendment v1.3 §13.
  FE-BUY-04/05 also ✅ Closed — three milestones this session, no kickoff-approval pause per
  owner directive)_
- **Current Page:** _(none — P-BUY-17 `5654956` award fixture-consistency fix shipped: aligned
  the mock shortlist to the same two-vendor RFQ-2026-000123 fixture used everywhere else + added
  a "Review the comparison" cross-link to FE-BUY-05; P-BUY-18 reviewed, carried forward untouched)_
- **Pipeline stage:** idle — pulling `FE-BUY-07` Engagement next (WP card pending kickoff)
- **Next Milestone:** FE-BUY-07 → 08 → 09 → FE-CLN-01 (F2-Z). FE-BUY-10 🅿 parked

## Team-3 — Vendor (FE-VEN)

- **Current Milestone:** `FE-VEN-04` remainder (Catalog) — **🔵A Review-A** (owner: "you should
  not stop, just start the work, no approval required"; scope complete at checkpoint `a52dc1e`)
- **Current Page:** _(sole in-scope page — P-VND-09 `a52dc1e` Spec library listing + edit dialog:
  new route `workspace/company/spec-library`, `SpecLibraryList`/`SpecEntryDialog` against the
  frozen `create_spec_library_entry.v1`/`update_spec_library_entry.v1` pair — submitted to
  Review-A; Team-3 STOPS, does not pull further work before gate)_
- **Pipeline stage:** submitted to Review-A (Lane G)
- **Next Milestone:** FE-VEN-09 ⛔ · FE-VEN-10/11/12 at Board kickoff scoping

---

## Review Team 4 — Architecture & Governance (A lane) — queue

- **`FE-PUB-03` Vendor Profile** (Team-1) — at checkpoint `1275f70`; shared microsite-chrome delta
  (footer nav fix + sticky mobile CTA), Lane G. First submission for this milestone.
- **`FE-VEN-04` remainder** (Team-3) — at checkpoint `a52dc1e`; P-VND-09 Spec library (sole
  in-scope page), Lane G. First submission for this milestone.

## Review Team 5 — Quality & Adversarial (B lane) — queue

_(B-lane clear — nothing at 🔵B awaiting Review-B.)_

- _Prior (all now ✅ Closed via dev-team self-commit): FE-PUB-02 (RV-0107, first public-track
  milestone through the full Dev→A→B pipeline), FE-BUY-04 (RV-0102), FE-VEN-06 (RV-0103, recorded
  by the vendor session pre-decision), FE-VEN-07 (RV-0104), FE-VEN-08 (RV-0105), FE-VEN-13
  (RV-0106, one fix-and-reverify cycle)._

- **Standing backlog:** Step-3 Public Shared Promotion baseline sweep — ✅ **DONE / PASS
  2026-07-02** (SHA `6007ea1`; 0 B/M/M; report
  `governanceReviews/REVIEW-TEAM-5-STEP-3-PUBLIC-BASELINE-SWEEP_v1.0.md`). 4 within-public promotion
  candidates + kit `Textarea` gap **raised → Board** (Raise≠Accept). **FE-PUB-02 S-dependency
  satisfied — Team-1 unblocked.** · Next: Step 4 → FE-CLN-06 · Step 5 → FE-CLN-07

## Architecture Board — queue

- **Standing agenda:** [`execution-board.md`](execution-board.md) §Board standing agenda (10 items)
