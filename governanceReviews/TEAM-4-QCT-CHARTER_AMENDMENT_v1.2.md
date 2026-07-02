<!--
Doc-type:  Team Charter AMENDMENT (program org; NON-authoritative). Additive — v1.0 and v1.1 are not edited.
Directive: Architecture Board (owner diagram), 2026-07-02 — review-team numbering. Supersedes the v1.1 redesignation DIRECTION only.
-->

# Team 4 QCT Charter — Amendment v1.2: Team 4 = Review Team 4 (Architecture & Governance)

**Directive (owner diagram, 2026-07-02):** the owner fixed the pipeline numbering explicitly:

```
Architecture Board → Developer Team (1/2/3) → Review Team 4 (Architecture & Governance)
                   → Review Team 5 (Quality & Adversarial) → Architecture Board Approval → Next Milestone
```

## What changes (supersedes v1.1 §1/§3 direction)

- **Team 4 continues as Review Team 4 — Architecture & Governance**, staffing the **Review-A lane**
  and adopting `REVIEW-TEAM-A-CHARTER_v1.0.md` as its lane charter. This matches Team-4's actual
  review record — the RV-0086..0100 findings were overwhelmingly projection/coined-field/firewall/
  non-disclosure/contract-grounding findings, i.e. the A lens.
- v1.1's redesignation of Team 4 to the *quality* lane is **superseded**. v1.1's §4 (checklist
  additions), §5 (PASS/ISSUES/REGRESSION verdicts), and §6 (5-step standing-backlog mapping)
  **transfer to the new Review Team 5** (`REVIEW-TEAM-5-CHARTER_v1.0.md`), which staffs the
  **Review-B lane**.
- The v1.1 jurisdiction carve-out reverses direction accordingly: the architecture/duplication-as-
  architecture lens **stays with Team 4**; the quality lens (design-system conformance as rendered
  quality, a11y audit, responsive, render/visual regression, lint/type) belongs to **Team 5**.

## What does NOT change

Severity ladder · gate BLOCKER 0 · MAJOR 0 · MINOR 0 · stable-target rule · Raise ≠ Accept ·
fresh-context independence (both teams, never the builder's context) · one RV-#### per cycle with
both lane verdicts · the Board pen split (owner holds every approval). "Review-A / Review-B" in
`project-management/review-process.md` and the RV template are **lane names** — Team 4 staffs A,
Team 5 staffs B.

---

*Non-authoritative program-org amendment. Conforms upward; coins nothing (§7/§13/§8).*
