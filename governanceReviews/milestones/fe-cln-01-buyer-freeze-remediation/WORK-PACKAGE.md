# WORK PACKAGE — FE-CLN-01 Buyer F2-Z Freeze Remediation

- **Lane:** G (touches most buyer surfaces; a11y/forms/reuse remediation, no governance/contract
  change per the freeze report's own scope statement)
- **Reviewed-SHA record:** _(filled at 🔵A)_
- **Value:** Buyer Productivity · **Priority:** P1 · **Size:** M · **Risk:** Low

## In scope — the Team-2-fixable set from `BUYER_FRONTEND_FREEZE_REPORT_v1.0.md` §6

| ID | Sev | Finding | Fix |
|---|---|---|---|
| FZ-02 | MAJOR | In-view `data===null` not-found branches render `EmptyState` (title=`<p>`) → no page `<h1>` → axe `page-has-heading-one` fails | Add `<h1 className="sr-only">` to each buyer in-view `NotFoundState` |
| FZ-03 | MAJOR | 3 pages hand-roll `<h1 font-semibold>` instead of shell `PageHeader` (`font-bold`) | Route through `PageHeader` where the hero is not intentionally distinct |
| FZ-04 | MAJOR | Raw `<input type="radio">` hand-rolled 3 divergent ways | Add shared `RadioRow` to `form-controls.tsx` (mirrors existing `CheckboxRow`); repoint call sites |
| FZ-05 | MAJOR | Same info-callout re-authored inline in ~10 views | Extract one buyer Tier-2 `Callout` (props: icon, tone, children); repoint all sites |
| FZ-06 | MAJOR | RFQ required-field marking inconsistent (prose-only vs asterisk vs unflagged) | One required-at-submit convention (asterisk + `FormField required`) across all three |
| FZ-08 | MINOR | Award required radio `<legend>` carries no required indicator | Mirror the checkbox-group required pattern |
| FZ-10 | MINOR | Upload drop zone `<div>` has no keyboard entry point | Presentation-parked (no upload wired) — add `aria-disabled` + note, defer full fix to wiring |
| FZ-11 | MINOR | Amber warning-callout variant duplicated | Fold into the FZ-05 `Callout` as `tone="warning"` |

**Excluded — cross-team / shared-foundation, must NOT be resolved unilaterally (per the freeze
report §6):**
- **FZ-01** (shell container double-wrap) → `FE-CLN-02`, Board-assigned lead.
- **FZ-09** (kit `FormField` `role="alert"`) → `FE-DS-06`, kit owner.

## Out of scope (Review-A enforces)

- FZ-01/FZ-09 (see above — do not touch the shared shell container or the kit `FormField`
  component itself).
- No wiring of the upload drop zone (FZ-10 stays presentation-parked; only the a11y stopgap
  ships).
- No new kit primitive — `RadioRow`/`Callout` are BUYER-scoped Tier-2 compositions (mirroring the
  existing `CheckboxRow` pattern), not additions to `src/frontend`.
- No governance/contract/projection change anywhere — this is presentation-only remediation.

## Dependencies

- H: FE-BUY-04..09 (all buyer-owned pages complete) — **satisfied**, this milestone unblocked.
- S: — none.

## §13 Validate Findings gate — corrections to the freeze report's own claims

- **FZ-02**: the report's file list (10 files incl. engagement-detail, po/payments/trade-invoice/
  challan/wcc, crm-detail) was outdated — 6 of those had already migrated to the exempt route-level
  `notFound()` pattern (verified via `Grep` — no in-view `data===null` branch left in `engagements/`
  or `crm/`). Only **8 files** genuinely had the defect; fixed all 8 (see below).
- **FZ-05/FZ-11**: the report's "~10 views" was actually **8** — `challan`/`wcc` use an unrelated,
  smaller footer-note pattern, not this callout shape. Fixed all 8.
- Both corrections are documented in-code via `FZ-02`/`FZ-05` comments at each site.

## New finding — discovered during this milestone's own axe sweep (out of scope, escalated)

Shell `QuickCreate` trigger (`app/(app)/_components/shell/quick-create.tsx:29`) has no accessible
name at <640px (`hidden sm:inline` hides its only text label, leaving a bare icon) — axe
`button-name`, critical, reproduces on every route since the shell mounts everywhere. Pre-existing,
untouched by Team-2, shell-owned — same class as FZ-01. **Not fixed here**; recorded at
`execution-board.md` Board standing agenda #11 for the shell owner.

## Lifecycle ownership

Builder = **Team-2** · Maintainer = **Team-2** · Review A → Review B (fresh contexts) → Dev-team
self-close on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13; Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner directive: proceed to kickoff without a pending
approval pause) · Paused — · Resumed — · Closed —

## DoD confirmation (checked at close — review-process.md §6)

☑ all 8 findings addressed ☑ FZ-01/FZ-09 confirmed untouched (git-verified: neither file appears in
this milestone's diff) ☑ responsive D/T/M (axe sweep 390/768/1280 across all 15 touched routes) ☑
WCAG-AA (axe clean, scoped past the pre-existing out-of-scope shell finding above) ☑
tsc/eslint/prettier (all clean) ☐ Review A PASS ☐ Review B PASS (B/M/M=0) ☑ no TODO/dead code ☑ no
duplicate components (`Callout`/`RadioRow` correctly extracted as buyer Tier-2 compositions, not
re-duplicated) ☑ promotion candidates registered (n/a — no new promotion-watchlist entry needed;
`Callout`/`RadioRow` follow the same extract-at-narrowest-scope precedent as prior milestones) ☐
tracker updated ☐ card closed
