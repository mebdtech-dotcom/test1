<!--
Doc-type:  Team Charter (program org; NON-authoritative). Establishes Review Team 5 = Quality & Adversarial Review (Review-B lane) for the FE program.
Directive: Architecture Board (owner diagram), 2026-07-02. Companions: REVIEW-TEAM-A-CHARTER_v1.0.md (lane charter, held by Review Team 4) · TEAM-4-QCT-CHARTER_AMENDMENT_v1.2.md (numbering).
-->

# Review Team 5 — Quality & Adversarial Review Charter v1.0

**Directive (owner diagram, 2026-07-02):** Review Team 5 staffs the **Review-B lane** — it reviews
each milestone **after Review Team 4 (Architecture & Governance) returns a pass-class verdict**,
and its pass hands the milestone to the Architecture Board for close.

## Mandate

Quality and adversarial review of FE milestone submissions under **CLAUDE.md §13**. Team 5
**raises** findings (each with a severity); the owning author / presiding authority **rules**
(Raise ≠ Accept). It never writes feature code, rules architecture, or closes milestones.

**Independence (binding):** runs in a **fresh agent context** — no shared working memory with the
builder or with Review Team 4.

## Checklist (inherits QCT charter v1.0 responsibilities 3–6 via amendments v1.1 §4 / v1.2)

UI consistency · design-system conformance as **rendered quality** (Doc-7B tokens/primitives) ·
accessibility audit (WCAG 2.1 AA; keyboard/focus/contrast; never colour-alone) · responsive
verification (D/T/M; low-bandwidth; Bn/En parity) · duplication as a **quality symptom** (dead
code, parallel copies, drifted imports) · imports/type-safety/lint/prettier · **render
verification** (all in-scope routes 200) · **screenshots** into
`governanceReviews/milestones/<fe-id-slug>/` · **visual regression** (screenshot compare vs the
milestone folder's prior baseline — review practice only; Doc-8 owns test infrastructure) ·
**cross-team regression** (adjacent surfaces unbroken; shared-file diffs additive).

Governance defect spotted (projection/coined-field/firewall/non-disclosure)? **Raise it routed to
Review Team 4** — defense-in-depth, never dropped. Tie-breaker on ambiguous findings: A first.

## Verdicts

- **PASS** → milestone → 🟣 Board.
- **ISSUES** → 🟠 Revising; resubmission re-enters at **B** if fixes are pure presentation, at
  **A** if any fix alters scope, contract grounding, or architecture.
- **REGRESSION** → cross-team regression report to the Board; the Board routes it to the owning
  team as a new work item — closed milestones reopen only by Board decision.

Severity ladder per §13; pass-class = BLOCKER 0 · MAJOR 0 · MINOR 0. Lane L milestones: a single
fresh-context review covers both A and B checklists (`review-process.md` §2).

## Stable target & logging

Milestone reviews only at a named checkpoint SHA (stable-target rule, QCT charter 2026-07-01
amendment — inherited); page-checkpoint reviews may run on the working tree (explicit exception).
Logs the **Review-B verdict field** into the same RV-#### as Team 4 (template v2).

## Standing backlog (QCT 5-step conformance track — rides with the quality lane)

Steps 1–2 recorded DONE (Platform PASS-WITH-PATCH applied; Vendor Shared Extraction APPROVED).
**Step 3 Public Shared Promotion = Team 5's standing baseline sweep** — runs at a stable
post-cutover SHA before FE-PUB-02 starts (Board agenda #10); findings feed the FE-PUB packages.
Step 4 → **FE-CLN-06** (Full-tree Integration Gate). Step 5 → **FE-CLN-07** (RC Gate).

## Boundaries

Raises; never rules on its own findings; never edits implementation; never invents Board outcomes.
Architecture-affecting findings require HUMAN approval (§8).

---

*Non-authoritative program-org charter. Conforms upward; coins nothing. Team 5 raises; the
presiding authority rules (CLAUDE.md §7/§13); architecture-affecting resolutions require human
approval (§8).*
