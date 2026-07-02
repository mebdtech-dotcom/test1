<!--
Doc-type:  Team Charter (program org; NON-authoritative). Establishes Review Team A = Architecture & Governance Review for the FE program.
Directive: Architecture Board, 2026-07-02 — FE Program Management v1.0 cutover (plan v6, Board-ratified). Companion: TEAM-4-QCT-CHARTER_AMENDMENT_v1.1.md (Review Team B).
-->

# Review Team A — Architecture & Governance Review Charter v1.0

> **Numbering note (owner diagram, 2026-07-02 — `TEAM-4-QCT-CHARTER_AMENDMENT_v1.2.md`):** this
> lane charter is **held by Review Team 4** (ex-Team-4 QCT, continuing its number and RV ledger in
> the Architecture & Governance lane). Wherever this document says "Review Team A", read
> **Review Team 4**; the downstream quality reviewer is **Review Team 5**
> (`REVIEW-TEAM-5-CHARTER_v1.0.md`), superseding the v1.1 companion reference below.

**Directive (Architecture Board, 2026-07-02):** the FE program moves to milestone-driven Frontend
Program Management (see `project-management/review-process.md`). Every milestone submission passes
**two sequential, independent reviews**: **Review Team A (this charter — reviews FIRST)**, then
Review Team B (Quality & Adversarial, ex-Team-4 QCT). The Architecture Board approves close.

## Mandate

Standing **Architecture & Governance** review of FE milestone submissions, operating under
**CLAUDE.md §13** (Review & Findings Governance). Review A **raises** findings (each with a
severity); the owning team's author or the presiding authority (§7) **rules** (Raise ≠ Accept).
Review A is a review function — it does not write feature code, rule architecture, or freeze the
corpus.

**Independence (binding):** Review A runs in a **fresh agent context** — no shared working memory
with the builder, with Review B, or with the Board-preparation context. A sequential pass inside
the builder's context does **not** satisfy this charter.

## Responsibilities

1. **Frozen-corpus / Doc-7 compliance** — the milestone renders only what frozen contracts project;
   verified against the corpus on disk, never from memory.
2. **No-invention** — no coined contracts, routes, fields, enums, states, slugs, or audit actions;
   gaps cite their `esc_registry.md` handle and ship the registered interim.
3. **Ownership & boundary conformance** — One Module One Owner, surface boundaries, cross-surface
   import discipline, Users-Act-Organizations-Own.
4. **Scope-vs-WP-card conformance** — the delta matches the Work Package card's In-scope; the
   **Out-of-scope section is enforced** (scope creep = finding).
5. **Reuse-not-duplicate** — extends the frozen kit / existing shared components; no duplicate
   primitives; new pieces enter as `[ESC-7B-…]`.
6. **Governance compliance** — the 12 invariants; byte-equivalence / non-disclosure (CHK-7-040);
   the signal firewall; R5/R6/R7; money boundary (DF-6); Content ≠ Presentation.
7. **Accessibility (architecture lens)** — semantic structure, state-not-by-colour-alone, WCAG-AA
   conformance of patterns (Review B re-verifies at the rendered-quality lens).
8. **Dependency analysis** — the milestone's H:/S: dependencies are real and satisfied; gate
   handles resolved or carved out; no hidden cross-milestone coupling.
9. **Promotion-candidate identification** — feeds `project-management/promotion-watchlist.md`.

## Verdicts

- **PASS** → opens Review B.
- **REVISION** → milestone → 🟠 Revising; the team fixes in scope and resubmits **to A**.
- **BLOCKER** → frozen-corpus conflict / scope or architecture violation → 🟥 Flag-and-Halt with a
  Board packet; never resolved locally (CLAUDE.md §11).

Severity ladder per §13 (BLOCKER/MAJOR/MINOR/NIT/OBS); pass-class requires BLOCKER = MAJOR =
MINOR = 0. Lane assignment (G/L) per `review-process.md` — in Lane L a single fresh-context review
covers both A and B checklists.

## Jurisdiction (A ↔ B split)

Governance/contract seam → **A**: projection over-render · coined enum/field/state · firewall
breach · non-disclosure leak · scope/boundary · contract grounding. Quality seam → **B** (see
amendment v1.1). **Tie-breaker: ambiguous → A first.** Defense-in-depth: B may raise a governance
defect A missed — it routes back to A, never dropped. Full finding-type table:
`project-management/review-process.md`.

## Stable target & logging

- **Milestone reviews require a stable target** — a named checkpoint SHA (the stable-target rule,
  QCT charter 2026-07-01 amendment, inherited unchanged).
- **Page-checkpoint reviews** (single-page scope inside an active milestone) may run on the working
  tree — the RV-0001..0100 practice, retained as the explicit exception.
- Logs into the shared `project-management/review-log.md`: one RV-#### per review cycle, A-verdict
  field per the milestone entry template v2. Every review records the reviewed SHA.

## Boundaries

- Raises; never rules on its own findings; never edits implementation.
- Does not modify frozen docs, the kit foundation, or module ownership; does not invent Board
  outcomes.
- **Architecture-affecting findings require HUMAN approval (§8)** — Review A escalates; AI/skill
  review does not substitute.

## Inaugural backlog

- Kickoff scope checks for the first Work Package cards: **FE-BUY-04** (Quotation Detail
  enhancement), **FE-VEN-05** (Vendor RFQ Workspace enhancement), **FE-PUB-02** (Public Discovery
  enhancement).
- Ratify the FE-SH watchlist seed (`promotion-watchlist.md`).

---

*Non-authoritative program-org charter. Conforms upward; coins nothing. Review A raises; the
presiding authority rules (CLAUDE.md §7/§13); architecture-affecting resolutions require human
approval (§8).*
