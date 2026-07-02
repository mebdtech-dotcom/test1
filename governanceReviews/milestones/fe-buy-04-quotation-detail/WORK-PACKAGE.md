# WORK PACKAGE — FE-BUY-04 Quotation Detail

- **Lane:** G (Procurement Moat; contract-bound renders; R6 adjacency)
- **Reviewed-SHA record:** _(filled at 🔵A)_
- **Value:** Procurement Moat · **Priority:** P1 · **Size:** M · **Risk:** Med

## In scope (the delta — enhancement, BX-01/BX-02 model)

- **P-BUY-14 Quotation detail** (🟩 pre-loop): surface contract-backed procurement facts from the
  frozen quotation projection (Doc-4E; the 8 frozen submit fields); information hierarchy +
  summary lead; version awareness (Inv#8 — immutable versions, cross-link to P-VND-19-style
  history where buyer-disclosed); currency-driven Money.
- **P-BUY-16 Clarifications / thread** (🟩 pre-loop): presentation polish of the thread within the
  quotation context (M6 delivery-only; no new message contracts).
- This milestone IS the awaited **BX-03** ("quotation presentation") — owner target satisfied.

## Out of scope (Review-A enforces)

Backend/wiring/server actions · any comparison or recommendation UI (R6 — comparison lives in
FE-BUY-05 and never recommends) · award affordances (FE-BUY-06) · kit/token changes · coined
fields/enums (render only what frozen contracts project; gaps cite `esc_registry.md`) · F2-Z
freeze findings (parked for FE-CLN-01).

## Dependencies

- H: — none (buildable now).
- S: — none.
- Carried context: buyer freeze report FZ items stay parked; quotation visibility gating (Doc-4E)
  binds; vendor names buyer-disclosed only for submitted quotes (RV-0075 precedent).

## Lifecycle ownership

Builder = **Team-2** · Maintainer = **Team-2** · Review A → Review B (fresh contexts) → Board
(owner approves close).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner kickoff approved) · Paused — · Resumed — · Closed —

## DoD confirmation (checked at Board close — review-process.md §6, carry-forward rule applies:
delta-only; P-BUY-14/16 are 🟩 legacy so the enhancement delta is the review surface)

☐ page DoD (both pages) ☐ responsive D/T/M ☐ WCAG-AA ☐ tsc/eslint/prettier ☐ realistic mock data
☐ Review A PASS ☐ Review B PASS (B/M/M=0) ☐ Board approved ☐ no TODO/dead code ☐ no duplicate
components ☐ promotion candidates registered ☐ tracker updated ☐ card closed
