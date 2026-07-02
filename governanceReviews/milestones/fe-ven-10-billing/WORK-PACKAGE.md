# WORK PACKAGE — FE-VEN-10 Billing

- **Lane:** G (composes cross-team-owned Account surfaces; Golden Rule 7 sensitivity per the
  `FE-VEN-14` report's own §8 — each of FE-VEN-10/11/12 stays Lane G despite being composition-only)
- **Reviewed-SHA record:** _(filled at 🔵A)_
- **Value:** Platform · **Priority:** P2 · **Size:** S · **Risk:** Med

## In scope

**Board-ruled Option B** (2026-07-03, `governanceReviews/FE-VEN-14-VENDOR-ACCOUNT-COMPOSITION-REPORT_v1.0.md` §9): a vendor-mounted `workspace/billing/page.tsx`
(replacing the `WorkspaceSectionPlaceholder` stub) that **composes the existing, unmodified Account
components** inside vendor-shell chrome — composition only, never a fork.

Five tabs (`BillingTabs`, a thin adapter over the shared `WorkspaceTabs` — mirrors
`CompanyProfileTabs` exactly), each rendering the real component **imported directly, byte-for-byte
unmodified**, reusing P-ACC-16..21:

- **Plans** — `account/billing/plans-catalog.tsx`'s `PlansCatalog` (P-ACC-16).
- **Subscription** — `account/subscription/subscription-view.tsx`'s `SubscriptionView` (P-ACC-17),
  called with `empty={false}` (the normal state; the `?state=none` dev/QA harness on the Account
  route is not replicated here — out of scope, not a spec requirement).
- **Usage & quota** — `account/usage/usage-dashboard.tsx`'s `UsageDashboard` (P-ACC-18).
- **Lead credits** — `account/lead-credits/lead-credits-view.tsx`'s `LeadCreditsView` (P-ACC-19,
  reclassified `Shared` in `page_inventory.md` per the same ruling).
- **Invoices** — `account/invoices/platform-invoices-view.tsx`'s `PlatformInvoicesView` (P-ACC-20).

## Known, disclosed trade-off (not a defect — discovered during implementation)

`PlansCatalog`'s "Select plan" link and `PlatformInvoicesView`'s per-row "Open" link are **hard-coded
inside those unmodified components** to `/account/subscription?...` and `/account/invoices/[id]`
respectively — they are not props-configurable. Composing the components without forking them means
these two specific actions leave the vendor workspace's chrome for that one destination (both land
on the same real, already-reviewed Account data) rather than staying inside `/workspace/*`. This is
an accepted, honestly-disclosed consequence of composition-only reuse (forking either component to
parameterize the link would violate the Board's ruling), not a defect. **P-ACC-21** (Platform
invoice detail) is therefore reached via the existing `/account/invoices/[invoiceId]` route as-is —
no parallel `workspace/billing/invoices/[invoiceId]` route was built, since nothing would link to it
without forking `PlatformInvoicesView`; building an unlinked shadow route would be dead code.

## Out of scope (Review-A enforces)

- **Any modification to the reused Account components** — `plans-catalog.tsx`, `subscription-view.tsx`, `usage-dashboard.tsx`, `lead-credits-view.tsx`, `platform-invoices-view.tsx`, and the
  `[invoiceId]` detail route/data-helper are all byte-untouched.
- **P-ACC-21's own dynamic route** — not duplicated under `/workspace/*` (see trade-off above).
- **Vendor nav changes** — the existing "Billing & Plan" → `${BASE}/billing` link
  (`vendor-shell-vm.ts`) already points at this route; no nav restructuring needed since Billing
  stays a single tabbed destination, not multiple routes.
- **Any other FE-VEN milestone's files** (04/05/06/07/08/09/13/14, all ✅ Closed) — untouched.
- **FE-VEN-11/Organization, FE-VEN-12/Settings** — separate milestones, built after this one per the
  ruled execution order.

## Dependencies

- H: — none remaining. `FE-VEN-14`'s report + the Board's route-topology/P-ACC-13/P-ACC-19 ruling
  (2026-07-03) fully unblocks this milestone.
- S: — none.

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** (composition/adapter layer only) · Reused components
stay **Team-1-maintained** (Account & Identity, Doc-7E) · Review A → Review B (fresh contexts) →
self-close on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13) — Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override only.

## Key dates

Created 2026-07-03 · Started 2026-07-03 (Board ruling unblocked this milestone same-session; owner
standing instruction: "no approval required, just start the work") · Scope complete —

## DoD confirmation (checked at close)

☐ page DoD (1 page, 5 composed tabs) ☐ responsive D/T/M ☐ WCAG-AA ☐ tsc/eslint/prettier ☐ realistic
mock data — N/A by design (each reused component ships its own existing presentation seed) ☐ Review
A PASS ☐ Review B PASS (B/M/M = 0) ☐ self-closed on clean gate (or Board, if BLOCKER/REGRESSION) ☐
no TODO/dead code ☐ no duplicate components (zero components duplicated — every tab is a direct,
unmodified import) ☐ no fork of any Account page (Flag-and-Halt condition — confirmed byte-diff
clean on all 5 reused files) ☐ promotion candidates reviewed ☐ tracker updated ☐ card closed
