# Review Process — Frontend Program Management

**Frontend Program Management · v1.3 · Status: FROZEN (Board-ratified v1.0 at cutover, plan v6,
2026-07-02 · amendments v1.1 §11 + v1.2 §12 + v1.3 §13, same day).** Changes require an **additive
amendment + version bump** (the CLAUDE.md constitution pattern). Non-authoritative under the frozen
corpus — on any conflict the corpus wins (§7) and this file is patched to match. **Owner
(maintains): Architecture Board.**

Companions: [`fe-program-wbs.md`](fe-program-wbs.md) (roadmap) ·
[`execution-board.md`](execution-board.md) (queues/gates) ·
[`promotion-watchlist.md`](promotion-watchlist.md) ·
charters `governanceReviews/REVIEW-TEAM-A-CHARTER_v1.0.md` +
`governanceReviews/TEAM-4-QCT-CHARTER_AMENDMENT_v1.1.md` ·
commit policy `governanceReviews/BOARD-DECISION-FE-COMMIT-POLICY_v1.0.md`.

---

## 1. Milestone states

```
⬜ Planned → 🔍 Discovery → 🟡 In Progress → 🔵A Review-A → 🔵B Review-B → 🟣 Board → ✅ Closed
                                   ↑              │              │            │
                                   └──── 🟠 Revising ◄───────────┘            │
                                                  🟥 Blocked (Flag-and-Halt) ◄┘
```

Plus: `⛔ Gated (ESC handle)` · `🅿 Parked (owner decision)` · `❌ Cancelled` (terminal,
Board-only) · `♻ Superseded` (terminal, Board-only — must name the successor FE-* ID).
Closed/Cancelled/Superseded **never reopen** (a REGRESSION may spawn a new work item by Board
decision, never a silent reopen). 🔍 is optional but is the default for enhancement packages
(WP-card authoring + grounding/contract-confirm). WP-model mapping: 🔍/🟡 → IN_PROGRESS,
🔵A/🔵B/🟣 → UNDER_REVIEW, ✅ → GREEN — nothing coined.

## 2. Two lanes — ceremony scaled to risk

| Lane | When | Pipeline |
|---|---|---|
| **G — Governed** | milestone touches Inv#11 non-disclosure, R6/R7 moat, governance firewalls, money boundary, contract-bound renders, or Risk = High | full A → B → Board |
| **L — Light** | static/P3 pages, cleanup, docs, no-contract milestones | ONE fresh-context review covering both A and B checklists → Board |

The Board assigns the lane on the WP card at kickoff. **Ambiguous → Lane G.** Owner may override.

## 3. Reviewer independence (binding)

Review A and Review B each run in a **fresh agent context** — no shared working memory with the
builder or with each other. Sequential passes inside one context do NOT satisfy A→B. Milestone
reviews require a **stable target** (named checkpoint SHA); single-page checkpoint reviews inside
an active milestone may run on the working tree (the RV-0001..0100 practice, retained as the
explicit exception).

## 4. A/B jurisdiction

| Finding type | Lens |
|---|---|
| Projection over-render · coined enum/field/state/slug · firewall breach · non-disclosure leak · scope/boundary violation · contract grounding · invented route | **A** |
| Missing aria-label · colour-only status · dead code · lint/type/format · responsive breakage · visual regression · duplicate copy as quality symptom | **B** |

**Tie-breaker: ambiguous → A first.** Defense-in-depth: B may raise a governance defect A missed —
routed back to A, never dropped between stools.

## 5. Verdicts & sequencing

- Builder builds page-by-page. Per page: page-standards.md DoD self-check → changelog line →
  **checkpoint commit** `feat(FE-XXX-NN): P-YYYY <summary> [checkpoint]` (Board decision
  `BOARD-DECISION-FE-COMMIT-POLICY_v1.0.md`; **gated pages never committed**).
- Milestone scope complete → **🔵A at a named SHA**.
- **A:** PASS → 🔵B · REVISION → 🟠 (fix in scope, resubmit to A) · BLOCKER → 🟥 Flag-and-Halt +
  Board packet (never resolved locally).
- **B:** PASS → 🟣 · ISSUES → 🟠 (re-enter at **B** if fixes are pure presentation, at **A** if any
  fix alters scope/contract-grounding/architecture) · REGRESSION → Board routes to the owning team.
- **Board (🟣):** rules dispositions (Validate-Findings, §13) · gate = **A:PASS ∧ B: BLOCKER =
  MAJOR = MINOR = 0** · confirms the milestone DoD on the WP card · **milestone-close commit**
  `milestone(FE-XXX-NN): close — RV-00NN A:PASS B:PASS board-approved` · updates
  WBS/execution-board/watchlist · authors the next WP card.
- **Board pen split (binding):** the **human owner** holds every gate approval, milestone close,
  FE-* ID minting, promotion → Approved, Flag-and-Halt disposition, and lane override. Claude
  prepares packets/derivations/drafts only.

## 6. Uniform milestone Definition of Done (identical for every milestone)

☐ every in-scope page passes the [`page-standards.md`](page-standards.md) DoD · ☐ responsive
(D/T/M) · ☐ WCAG-AA · ☐ tsc/eslint/prettier green · ☐ realistic mock data · ☐ Review A PASS ·
☐ Review B PASS (B/M/M = 0) · ☐ Board approved · ☐ no TODO/dead code introduced · ☐ no duplicate
components introduced · ☐ promotion candidates reviewed & registered on the watchlist ·
☐ WBS/execution-board/changelog updated · ☐ WP card closed.

**Carry-forward rule (binding):** on an **enhancement** milestone the DoD applies to the **delta
only**. Already-✅ pages keep their existing RV verdict — **cite, don't re-review**; untouched
in-scope pages are verified by **byte-equivalence** (RV-0038 precedent); only pages the
enhancement actually touches re-enter review, and only for the delta. Settled RV approvals are
never silently re-opened.

## 7. Work Package card

Created by the Board **at kickoff only** (lazily — active milestones only; record tracks never get
cards) at `governanceReviews/milestones/<fe-id-slug>/WORK-PACKAGE.md`:

```markdown
# WORK PACKAGE — FE-XXX-NN <Title>
- Lane: G | L          · Reviewed-SHA record: <filled at 🔵A>
- In scope: <pages + deliverables — the delta, stated concretely>
- Out of scope: <explicit — scope creep against this list is a Review-A finding>
- Dependencies: H:<hard> · S:<soft> (+ gate handles from esc_registry.md)
- Lifecycle ownership: Builder = Team-N · Maintainer = <team> · Review A · Review B · Board
- Key dates: created / started / paused / resumed / closed
- DoD confirmation: <the §6 checklist, checked at Board close>
```

**Closed WP cards are immutable** — corrections require an additive amendment appended to the
card, never an edit of the closed original (append-only governance, Inv#8 culture).

## 8. Review-log entry (milestone template v2 — effective RV-0101)

```
### RV-#### · FE-XXX-NN · <Milestone title> · Team-<n>
- Date · Pages in scope: P-… · Reviewed SHA: <checkpoint sha> (stable-target)
- Review-A (Architecture & Governance): PASS | REVISION | BLOCKER
  Findings: numbered, severity ladder BLOCKER/MAJOR/MINOR/NIT/OBS
- Review-B (Quality & Adversarial): PASS | ISSUES | REGRESSION
  Findings: numbered, same ladder (B opens only after A pass-class)
- Disposition (author/authority): per the Validate-Findings gate
- Board: APPROVED | RETURNED | ESCALATED (+ decision ref)
- Result: milestone → ✅ Closed | 🟠 Revising | 🟥 Blocked
```

Page-scoped checkpoint reviews use the same template with `Pages: <single page>`.

## 9. Derivation priority chain (binding — resolves ALL status conflicts)

```
Frozen corpus + esc_registry (§7 — supreme)
  → Board decision records (governanceReviews/)
    → review-log.md (RV verdicts + dispositions)
      → team files (page-level source record)
        → fe-program-wbs.md / execution-board.md (derived)
          → README / current-focus (pointers, never authority)
```
Lower layers are patched to match higher ones, never the reverse.

## 10. Glossary

- **Planned ⬜** — minted by the Board, not started. **Discovery 🔍** — WP-card authoring +
  grounding/contract-confirm. **In Progress 🟡** — building (one per team). **Review-A 🔵A /
  Review-B 🔵B** — under the respective fresh-context review. **Board 🟣** — awaiting owner
  approval. **Closed ✅** — approved, close-committed; never reopens. **Revising 🟠** — fixing
  review findings. **Blocked 🟥** — Flag-and-Halt, Board packet open. **Gated ⛔** — waiting on an
  `esc_registry.md` handle. **Parked 🅿** — waiting on an owner decision. **Cancelled ❌ /
  Superseded ♻** — Board-only terminals; Superseded names its successor.
- **READY(enh)** — enhancement package over existing pages (BX-01/BX-02 model; never a rebuild).
  **READY(build)** — pages don't exist yet; fresh build.
- **Owns vs touches** — "owns" = coverage accounting (each P-* page exactly once program-wide);
  "touches" = may modify without owning.
- **H:/S: dependency** — hard (cannot start/close) vs soft (beneficial ordering).
- **WP card** — the per-milestone Work Package card (§7).
- **Promotion states** — Candidate → Approved → Extracted → Migrated → Old-removed → Closed
  (`promotion-watchlist.md`).
- **🟩 Built** — legacy page marker: built pre-loop, covered by QCT milestone-track reviews rather
  than a per-page RV.

## 11. Amendment v1.1 — review-team numbering (owner diagram, 2026-07-02; additive)

The owner fixed the pipeline numbering: **Review Team 4 = Architecture & Governance**, staffing
the **Review-A lane** (ex-Team-4 QCT — number, RV ledger, and stable-target discipline continue;
`TEAM-4-QCT-CHARTER_AMENDMENT_v1.2.md`); **Review Team 5 = Quality & Adversarial**, staffing the
**Review-B lane** (`REVIEW-TEAM-5-CHARTER_v1.0.md`). Throughout this document, "Review A/Review-A"
and "Review B/Review-B" are **lane names** — read them as staffed by Team 4 and Team 5
respectively. States 🔵A/🔵B, the RV template's lane fields, and every rule in §§1–10 are
unchanged. (This supersedes the cutover-day mapping that had assigned Team-4 to the quality lane.)

## 12. Amendment v1.2 — page-boundary commit rule (owner directive, 2026-07-02; additive)

**Teams 1/2/3 MUST commit before starting a new page** — the checkpoint commit IS the page
boundary. Sequence per page: build → page DoD self-check → changelog line →
`feat(FE-XXX-NN): P-YYYY <summary> [checkpoint]` → only then the next page. Never carry
uncommitted work across a page boundary; never bundle two pages in one checkpoint. Full decision:
`governanceReviews/BOARD-DECISION-FE-COMMIT-POLICY_v1.0.md` amendment v1.1 (owner-signed).

## 13. Amendment v1.3 — unified A→B re-review + Dev-team milestone close (owner directive,
2026-07-02; additive)

Owner-stated pipeline: `Dev (Team 1/2/3) → Review-A (Team 4) → Review-B (Team 5) → [findings? →
back to the owning Dev → fix → Review-A → Review-B, repeat] → ALL PASS → the owning Dev team
commits (milestone-close) and moves to next work.` Two changes to §5 sequencing:

- **Unified re-review on any fix — supersedes §5's B-verdict re-entry nuance.** The previous rule
  ("re-enter at B if fixes are pure presentation, at A if any fix alters scope/contract-grounding/
  architecture") is retired. Effective now: **any** Review-A REVISION or Review-B ISSUES routes the
  milestone to 🟠 Revising → the owning Dev team fixes in scope → **always re-enters at Review-A**,
  then proceeds to Review-B again → repeat the A→B cycle until **both** land PASS on the same
  checkpoint SHA. No more B-only re-entry shortcut; §8's `A pass-class` note for B still applies
  (B opens only after an A pass-class verdict, every cycle).
- **Dev-team milestone close — narrows the §5 "Board pen split" line for this one step.** Once
  A:PASS ∧ B:PASS (B/M/M = 0) land on the same SHA, the **owning Dev team** — not a separate Board
  wait-turn — makes the milestone-close commit (`milestone(FE-XXX-NN): close — RV-00NN A:PASS
  B:PASS`), confirms the WP-card DoD (§6), updates its own tracker lines, and moves directly to its
  next queued milestone. The gate condition (A:PASS ∧ B:PASS, B/M/M=0) **is** the approval signal —
  no further owner turn is needed for a clean pass. The "Board pen split (binding)" line in §5 is
  otherwise **unchanged**: Validate-Findings disposition on any raised finding, FE-* ID minting,
  promotion → Approved, Flag-and-Halt disposition, REGRESSION routing, and lane override remain
  **owner/Board-only**. 🟣 Board is retained in the §1 state diagram for those cases (BLOCKER,
  REGRESSION, Flag-and-Halt, override) — it is no longer a mandatory wait-state on the clean
  A:PASS∧B:PASS path.
