# WORK PACKAGE — FE-VEN-11 Organization

- **Lane:** G (composes cross-team-owned Account surfaces; Golden Rule 7 sensitivity, same class as
  `FE-VEN-10`)
- **Reviewed-SHA record:** `1a5d009` — scope complete, submitted to Review-A 2026-07-03
- **Value:** Platform · **Priority:** P3 · **Size:** S · **Risk:** Med

## In scope

**Board-ruled Option B** (2026-07-03, `governanceReviews/FE-VEN-14-VENDOR-ACCOUNT-COMPOSITION-REPORT_v1.0.md` §9): a vendor-mounted `workspace/organization/page.tsx`
(replacing the `WorkspaceSectionPlaceholder` stub) that **composes the existing, unmodified Account
components** inside vendor-shell chrome — composition only, never a fork.

Six tabs (`OrganizationTabs`, a thin adapter over the shared `WorkspaceTabs` — mirrors
`CompanyProfileTabs`/`BillingTabs`), each rendering the real component **imported directly,
byte-for-byte unmodified**, covering the full declared reuse range P-ACC-04..11:

- **Organization** — `account/organization/organization-profile.tsx`'s `OrganizationProfile`
  (P-ACC-04).
- **Lifecycle** — `account/organization-lifecycle/organization-lifecycle.tsx`'s
  `OrganizationLifecycle` (P-ACC-05), called with `deleted={false}` (the normal state; the
  Account route's `?state=deleted` dev/QA harness is not replicated — not a spec requirement).
- **Members** — `account/members/members-view.tsx`'s `MembersView` (P-ACC-06), with a vendor-authored
  "Invite member" action link to the existing `/account/members/invite` route (P-ACC-07 — real,
  already-built; mirrors Account's own `page.tsx` action button, not a new component).
- **Roles** — `account/roles/roles-view.tsx`'s `RolesView` (P-ACC-08), with a vendor-authored
  "New role" action link to the existing `/account/roles/new` route (P-ACC-09's create leg — real,
  already-built).
- **Permissions** — `account/permissions/permissions-view.tsx`'s `PermissionsView` (P-ACC-10).
- **Delegation** — `account/delegation/delegation-view.tsx`'s `DelegationView` (P-ACC-11), with a
  **disabled** "New grant" button (see trade-off below — `/account/delegation/new` does not exist
  on the Account track itself).

## Known, disclosed trade-offs (not defects)

- **Invite member / New role links leave vendor chrome** — same class of trade-off as `FE-VEN-10`:
  `/account/members/invite` and `/account/roles/new` are real, separate Account routes (not
  components composable in-place), so those two actions leave `/workspace/*` for that one
  destination.
- **"New grant" is disabled, not linked** — a **genuinely pre-existing gap discovered on the Account
  track itself**: `account/delegation/page.tsx`'s own "New grant" button already links to
  `/account/delegation/new`, but no such route exists anywhere under `app/(app)/account/delegation/`
  (confirmed via directory listing — only `page.tsx`/`layout.tsx`/`delegation-view.tsx` exist). This
  predates this milestone and is not introduced here; rather than propagate a dead link into a new
  page, the vendor composition disables the button instead. Not to be confused with
  `[ESC-IDN-DELEG-EXPIRY]` (a narrower, already-registered gap about the *reinstate* leg specifically
  — P-ACC-12's grant editor) — this is a separate, previously-undocumented gap in the *create* leg.
  Flagged here, not fixed on the Account track (out of this milestone's ownership).

## Out of scope (Review-A enforces)

- **Any modification to the reused Account components** — all 6 view components, plus
  `account/delegation/page.tsx` (the dead-link discovery site) — byte-untouched.
- **P-ACC-09's `/account/roles/[roleId]`, P-ACC-07's own page, P-ACC-12's grant editor** — not
  duplicated under `/workspace/*`; reached via the existing Account routes as-is.
- **Vendor nav changes** — the existing "Team & Organization" → `${BASE}/organization` link
  (`vendor-shell-vm.ts`) already points at this route.
- **Any other FE-VEN milestone's files** (04/05/06/07/08/09/10/13/14, all ✅ Closed) — untouched.
- **FE-VEN-12/Settings** — separate milestone, built after this one per the ruled execution order.

## Dependencies

- H: — none remaining. `FE-VEN-14`'s report + the Board's ruling (2026-07-03) fully unblocks this
  milestone; `FE-VEN-10` (first of the three) closed clean, validating the composition-not-fork
  pattern end-to-end.
- S: — none.

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** (composition/adapter layer only) · Reused components
stay **Team-1-maintained** (Account & Identity, Doc-7E) · Review A → Review B (fresh contexts) →
self-close on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13) — Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override only.

## Key dates

Created 2026-07-03 · Started 2026-07-03 (owner standing instruction: "no approval required, just
start the work"; second of the ruled FE-VEN-10 → 11 → 12 sequence) · Scope complete —

## DoD confirmation (checked at close)

☐ page DoD (1 page, 6 composed tabs) ☐ responsive D/T/M ☐ WCAG-AA ☐ tsc/eslint/prettier ☐ realistic
mock data — N/A by design (each reused component ships its own existing presentation seed) ☐ Review
A PASS ☐ Review B PASS (B/M/M = 0) ☐ self-closed on clean gate (or Board, if BLOCKER/REGRESSION) ☐
no TODO/dead code ☐ no duplicate components (zero components duplicated — every tab is a direct,
unmodified import) ☐ no fork of any Account page (Flag-and-Halt condition) ☐ pre-existing
Account-track dead link (`/account/delegation/new`) disclosed, not propagated ☐ promotion candidates
reviewed ☐ tracker updated ☐ card closed
