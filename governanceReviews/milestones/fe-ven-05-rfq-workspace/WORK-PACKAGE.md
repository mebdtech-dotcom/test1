# WORK PACKAGE — FE-VEN-05 Vendor RFQ Workspace

- **Lane:** G (Procurement Moat; non-disclosure adjacency; contract-bound renders)
- **Reviewed-SHA record:** `e2f8642` (scope complete — both in-scope pages checkpointed)
- **Value:** Procurement Moat · **Priority:** P1 · **Size:** M · **Risk:** Med

## In scope (the delta — enhancement over the vendor workspace M5 stock)

- **P-VND-15 Invitations inbox** (🟩): received-only inbox presentation enhancement — information
  hierarchy, state chips from frozen Doc-4M invitation states only, response-window presentation.
- **P-VND-16 Invitation detail** (🟩): scope presentation (frozen invitation projection only),
  clearer respond/decline affordances — **decline = no penalty** stated (Doc-3), no
  pipeline/eligibility disclosure.

## Out of scope (Review-A enforces)

Quotation builder (FE-VEN-06) · leads (FE-VEN-07) · any trust/performance score or band surface
(⛔ FE-VEN-09; band-only interim binds — never pass `score`) · routed/eligible/total denominators
(received-only counts, cursor lists) · backend/wiring · kit/token changes · coined
states/fields (Doc-4M chips only, never invent).

## Dependencies

- H: — none (buildable now).
- S: — none.
- Carried context: A7-safe neutral `/workspace` routing; byte-equivalence load-bearing on the
  vendor surface; deferral/exclusion invisible (Doc-3 §4.2).

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** · Review A → Review B (fresh contexts) → Board
(owner approves close).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner kickoff approved) · Paused — · Resumed — ·
**Closed 2026-07-02** (owner-approved, RV-0101)

## DoD confirmation (checked at Board close — carry-forward: delta-only over 🟩 legacy pages)

☑ page DoD (both pages) ☑ responsive D/T/M (B live-rendered 3 breakpoints) ☑ WCAG-AA
(`aria-describedby` verified non-orphaned, no colour-only status) ☑ tsc/eslint/prettier (verified
independently by both A and B) ☑ realistic mock data — N/A by design: this surface renders
genuine-empty (received-only/byte-equivalence pattern, already reviewed pre-cutover; delta is pure
reordering/styling of the existing empty-safe render, no new data path) ☑ Review A PASS (RV-0101,
12 OBS) ☑ Review B PASS (RV-0101, 12 OBS, B/M/M=0) ☑ Board approved (owner, 2026-07-02) ☑ no
TODO/dead code (B confirmed) ☑ no duplicate components (B confirmed, extract-only refactor) ☑
promotion candidates registered — none flagged by either reviewer; no `promotion-watchlist.md`
change needed ☑ tracker updated (current-focus/execution-board/team-3/changelog/fe-program-wbs) ☑
card closed
