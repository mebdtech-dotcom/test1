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

- **Current Milestone:** _(none — `FE-BUY-07` Engagement ✅ **Closed**, RV-0112, A:PASS ∧ B:PASS
  after 1 fix-and-reverify cycle, 0 BLOCKER/MAJOR/MINOR final, checkpoint `2d1b23e`; Dev-team
  self-close per Amendment v1.3 §13. FE-BUY-04/05/06 also ✅ Closed — four milestones this
  session, no kickoff-approval pause per owner directive)_
- **Current Page:** _(none — P-BUY-20 `2d1b23e` engagement Documents card fixed: replaced the
  permanent "Documents open in a later milestone" dead-end with plain navigation to the 5 already-
  built document-kind routes (PO/Payments/Trade-invoice/Challan/WCC); Review-A caught and the
  builder fixed an unwarranted per-engagement existence-claim caption before Review-B passed)_
- **Pipeline stage:** idle — pulling `FE-BUY-08` Dashboard Widgets next (WP card pending kickoff)
- **Next Milestone:** FE-BUY-08 → 09 → FE-CLN-01 (F2-Z). FE-BUY-10 🅿 parked

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

- **`FE-PUB-03` Vendor Profile** (Team-1) — at checkpoint `1275f70`; shared microsite-chrome delta
  (footer nav fix + sticky mobile CTA), Lane G. First submission for this milestone.
- _(`FE-VEN-04` remainder cleared — RV-0110 A:PASS ∧ B:PASS, closed by Team-3.)_

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
