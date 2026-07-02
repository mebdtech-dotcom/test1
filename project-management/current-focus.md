# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. Pointers only — the milestone
> roadmap is [`fe-program-wbs.md`](fe-program-wbs.md), queues/gates are
> [`execution-board.md`](execution-board.md), process is [`review-process.md`](review-process.md).
> Team files remain the **page-level source record**. On any change, append to `changelog.md`.

**Updated:** 2026-07-02 · **Model:** FE Program Management v1.0 (cutover complete — Phases 0/A/B/C
done; page-loop terminus RV-0100). Teams pull milestones from the execution board, never from chat.

---

## Team-1 — Public / Platform (FE-PUB · FE-PF)

- **Current Milestone:** `FE-PUB-02` Discovery — ⬜ Planned (WP card pending Board kickoff)
- **Current Page:** _(none — awaiting WP card + Review-B Step-3 Public baseline, soft dependency)_
- **Pipeline stage:** pre-kickoff
- **Next Milestone:** FE-PUB-03 → FE-PUB-04 → FE-PUB-06 → FE-PUB-07 → FE-PUB-01 (skip FE-PUB-05 ⛔)

## Team-2 — Buyer (FE-BUY)

- **Current Milestone:** `FE-BUY-04` Quotation Detail (= the awaited BX-03) — 🟡 In Progress
  (**owner kickoff APPROVED 2026-07-02**, WP card Started)
- **Current Page:** P-BUY-14 (first of the two-page delta; then P-BUY-16)
- **Pipeline stage:** building (Lane G; checkpoint commits per page)
- **Next Milestone:** FE-BUY-05 → 06 → 07 → 08 → 09 → FE-CLN-01 (F2-Z). FE-BUY-10 🅿 parked

## Team-3 — Vendor (FE-VEN)

- **Current Milestone:** _(none — `FE-VEN-05` RFQ Workspace ✅ **Closed**, board-approved
  2026-07-02, RV-0101, A:PASS ∧ B:PASS, 0 BLOCKER/MAJOR/MINOR both lanes, checkpoint `e2f8642`)_
- **Current Page:** _(none)_
- **Pipeline stage:** **idle — by explicit owner instruction.** FE-VEN-05 closed but FE-VEN-06
  kickoff was NOT authorized this cycle ("approve close, don't start next"); Team-3 holds and does
  not pull FE-VEN-06 or author its WP card until the owner says so.
- **Next Milestone:** FE-VEN-06 (WP card not yet authored — owner kickoff required) → 07 → 08 →
  FE-VEN-13 → FE-VEN-04 remainder (P-VND-09). FE-VEN-09 ⛔ · FE-VEN-10/11/12 at Board kickoff
  scoping

---

## Review Team 4 — Architecture & Governance (A lane) — queue

_(empty — FE-VEN-05 cleared A with a PASS, RV-0101; first milestone to clear Review-A under the
new model)_

## Review Team 5 — Quality & Adversarial (B lane) — queue

_(empty — FE-VEN-05 cleared B with a PASS, RV-0101, 12 OBS; first milestone to clear the full A→B
gate under the new model)_

- **Standing backlog:** Step-3 Public baseline sweep (QCT 5-step Step 3) at a stable SHA —
  awaiting Board authorization (agenda #10); runs before FE-PUB-02 starts

## Architecture Board — queue

- **Kickoff approvals pending (owner):** WP card for FE-PUB-02 · WP card for FE-VEN-06 (Team-3
  idle, owner has not authorized this cycle)
- **Standing agenda:** [`execution-board.md`](execution-board.md) §Board standing agenda (10 items)
