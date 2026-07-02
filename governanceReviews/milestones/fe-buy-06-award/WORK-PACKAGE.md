# WORK PACKAGE — FE-BUY-06 Award

- **Lane:** G (Procurement Moat; R6-sensitive — irreversible 1:1 award act; contract-bound renders)
- **Reviewed-SHA record:** `5654956` (scope complete — P-BUY-17 checkpointed; P-BUY-18 reviewed,
  carried forward untouched, no defect found)
- **Value:** Procurement Moat · **Priority:** P1 · **Size:** S · **Risk:** High

## In scope (the delta — enhancement, BX-01/BX-02/FE-BUY-04/05 model)

- **P-BUY-17 Award** (🟩 pre-loop, already functional — GET-form wizard, no default winner,
  threshold notice, irreversibility warning): the mock shortlist (`MOCK_SHORTLIST` in
  `award/page.tsx`) currently uses amounts/vendor set that CONTRADICT the established
  "RFQ-2026-000123" fixture universe (BX-02/FE-BUY-04/FE-BUY-05: Meghna Industrial Supplies Ltd.
  = 2,695,000 BDT, Padma Engineering Works = 2,810,000 BDT) — Award instead shows Meghna at
  1,875,000 BDT plus a third, never-elsewhere-seen vendor "Bengal Steel & Fabrication". Fix: align
  the fixture to the same two vendors/amounts (quotations naturally progress `submitted →
  shortlisted`, a real Doc-4M transition — not a coined state) for a coherent RFQ → Quotations →
  Comparison → Award fixture universe. Add a contextual "View comparison" cross-link from the
  select step to the now-also-shipped FE-BUY-05 comparison page (pure navigation).
- **P-BUY-18 Close lost** (🟩 pre-loop, already functional — reason-code form, non-penalizing
  copy, reviewed for hierarchy issues): no defect found; carried forward untouched (like FE-BUY-05
  carried the comparison summary/table forward untouched).

## Out of scope (Review-A enforces)

- **No default/pre-selected winner** — the select step must still start with nothing checked
  (R6). No ranking/scoring/highlight added to the shortlist cards.
- No wiring of the `award_rfq`/`close_lost_rfq` writes (still PARKED — Wave 4).
- No new wizard step, no new reason code, no kit/token change, no coined field/enum.
- F2-Z freeze findings (parked for FE-CLN-01).

## Dependencies

- H: — none (buildable now).
- S: — none.
- Carried context: award is 1:1, irreversible (`shortlisted → closed_won`); above-threshold
  Director/Owner approval notice is presentation-only (server-enforced at wiring); close-lost is
  non-penalizing (Doc-3 §9.5) and carries no vendor-visible outcome.

## Lifecycle ownership

Builder = **Team-2** · Maintainer = **Team-2** · Review A → Review B (fresh contexts) → Dev-team
self-close on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13; Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner directive: proceed to kickoff without a pending
approval pause) · Paused — · Resumed — · Closed 2026-07-02 (RV-0109, Dev-team self-close)

## DoD confirmation (checked at close — review-process.md §6, carry-forward rule applies:
delta-only; P-BUY-17/18 are 🟩 legacy so the enhancement delta is the review surface)

☑ page DoD ☑ responsive D/T/M ☑ WCAG-AA (link-in-text-block fix verified holding by Review-B) ☑
tsc/eslint/prettier ☑ realistic mock data ☑ Review A PASS (RV-0109, 8 OBS) ☑ Review B PASS
(RV-0109, 2 OBS, B/M/M=0) ☑ no TODO/dead code ☑ no duplicate components ☑ promotion candidates
registered (none flagged) ☑ tracker updated ☑ card closed
