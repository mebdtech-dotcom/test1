# WORK PACKAGE — FE-DOC-02 Vendor Documents Hub

- **Lane:** G (cross-workspace presentation composition; mirrors `FE-DOC-01`'s adjudicated pattern —
  no new adjudication round implied, only DoD compliance against the same rulings)
- **Reviewed-SHA record:** _(filled at 🔵A)_
- **Value:** Vendor Growth · **Priority:** P1 · **Size:** M · **Risk:** Med

## In scope

- **P-DOC-02 Vendor Documents hub** at `/workspace/documents` (A7-neutral) — the vendor leg of
  `FE-DOC-01`'s buyer hub, composed against the same shared documents home
  (`app/(app)/_components/documents/`) — composition only, never a fork of that home or of
  `FE-DOC-01`'s buyer-private files.
  - `LifecycleStrip basePath="/workspace/documents"` (the component's own header comment already
    anticipates this exact basePath) — navigation only, never per-engagement state (MAJOR-01
    constraint, binds identically here).
  - Toolbar: kit `SearchBar` (allowlisted `?q=`) + `PrintButton` + `ViewChips` (`?view=` —
    Received/Sent/Pending approval/Completed, same four presets as the buyer hub) +
    `RecentlyOpenedStrip` (seeded, presentation-labelled).
  - Kit `FilterSidebar` (collapsed): Document Type · Status · Counterparty · Date (issued_at) ·
    Amount. **No Project facet** (`ESC-OPS-DOC-FEATURES`, same exclusion as the buyer hub).
  - **§1 Generated documents** — `DocumentCollection`, disabled "Generate document"/"Bulk
    download" toolbar. No vendor `DataListTable` equivalent exists (buyer's is buyer-private,
    workspace-boundary — never imported here); rendered as a local `<ul>`/`Card` row composition
    (à la `EngagementList`'s pattern), honoring `document-table-spec.ts`'s sort/pagination/
    column-priority constants without a shared cross-workspace table (same fallback posture as the
    buyer hub's pre-FE-SH-01 state).
  - **§2 Engagement document records** — per-engagement rows (ref + `EngagementStatusChip`,
    vendor-owned, not the buyer's `engagementStateDisplay`) + the five fixed deep links
    (`/workspace/engagements/[id]/po|payments|trade-invoice|challan|wcc` — plain navigation, no
    existence claims, ESC-7G-ENG-03 discipline) + expandable `DocumentProcessTimeline`. DF-6
    money-boundary note renders via the vendor's own **`<MoneyBoundaryBanner />`**
    (`_components/vendor/engagements`) — not a new `Callout` copy.
  - **§3 Sourcing documents** — `DocumentRelations` deep links to `/workspace/rfqs`,
    `/workspace/leads` (vendor's pipeline equivalent of "approvals"), quotation detail — vendor
    framing of the buyer hub's §3 (vendor has no "RFQ internal approvals" concept; links point at
    vendor-owned surfaces only).
  - **§4 Platform invoices** — Card linking to `/account/invoices` (shared Account route, same as
    the buyer leg and `FE-VEN-10`'s Billing composition).
  - Status chips/tone maps reused from `_components/vendor/engagements` **as-is**: `DOC_KIND_LABEL`,
    `TradeInvoiceStatusChip`, `PaymentStatusChip`, `EngagementStatusChip` — never re-derived
    buyer-style.
  - Vendor-side mock fixtures introduced in-page (new `documents-hub-view-models.ts` under
    `app/(app)/_components/vendor/documents/` or inline in `page.tsx`, vendor-private, mirrors the
    buyer's `(buyer)/_components/documents-hub-view-models.ts` shape) — the vendor engagement
    routes currently ship **no seeded mock data at all** (confirmed: `EngagementList`/
    `EngagementOverview`/`EngagementDocuments` all render genuine-empty with no props today), so
    this hub introduces its own fixture universe, **field-aligned with the buyer hub's** (same
    human refs — `ENG-2026-000124` family, `DOC-2026-000091`, BDT) so cross-hub references stay
    self-consistent even though the underlying engagement detail routes still render genuine-empty.
    Disclosed, not silently done — a real, visible delta from the buyer leg's "every existing route
    already has matching seed data."
- **Disclosed touch:** `app/(app)/_components/vendor/vendor-shell-vm.ts` — new
  `{ label: "Documents", href: `${BASE}/documents`, icon: "documents" }` entry in the
  `"procurement"` nav section, after Engagements (matches `page_inventory.md` §12's vendor nav
  order). The `"documents"` icon key already exists in `shell/icons.ts` (added by `FE-DOC-01`) —
  zero icon-registry change needed.

## Out of scope (Review-A enforces)

- **Any modification to the shared documents home** (`app/(app)/_components/documents/`) or to any
  `FE-DOC-01` buyer-private file (`(buyer)/documents/*`, `(buyer)/_components/documents-hub-view-models.ts`,
  `(buyer)/_components/data-list-table.tsx`) — byte-untouched. Buyer↔vendor surfaces import the
  shared home, never each other (binding rule stated in the shared home's own header comment).
- Backend/wiring/server actions.
- Templates & generated-documents PAGES (`FE-DOC-03`).
- Detail-page touches on `/workspace/engagements/[id]/*` (already-closed `FE-VEN-07` pages) —
  hub rows link to them as-is, no re-homing/editing.
- Any coined kind/state/format/route/facet (incl. Mushok/credit-debit/packing-list/sales-order/
  contract/tag/favorite/document↔project linkage — `esc_registry.md` §Document Management,
  `ESC-OPS-DOC-MUSHOK`/`ESC-OPS-DOC-KINDS`/`ESC-OPS-DOC-FEATURES`).
- Per-engagement stage-progress rendering (MAJOR-01 constraint, same as the buyer hub).
- Count/KPI tiles (client-computed counts violate R7).
- Kit/token changes, perf-budget numbers (Doc-8 owns; bind by pointer).
- Any other FE-VEN milestone's files (04/05/06/07/08/09/10/11/13/14, all ✅ Closed) — untouched.

## Presentation visibility matrix (reused verbatim from `FE-DOC-01`'s WP card — same corpus, same rule)

| Surface | Buyer | Vendor |
|---|---|---|
| Engagement docs (LOI/PO/Challan/WCC) | Read (party) | Read (party) |
| Trade invoices | Read · approve affordance disabled | Read · issue affordance disabled |
| Payment records | Read · record/confirm disabled | Read |
| Generated documents | Read (own + granted) | Read (own + granted) |
| Templates | Read | Read |
| Grant/Revoke · Generate · template lifecycle | Disabled | Disabled |

## Empty-state contracts (reused verbatim)

Per section, two variants via kit `EmptyState`: filtered-empty ("No documents match the current
filters" + clear-filters action) and genuine-empty (corpus-honest copy, vendor-framed — e.g.
engagement docs: "No engagement documents yet — they appear after a buyer awards one of your
quotations", mirroring `EngagementList`'s existing genuine-empty copy).

## Dependencies

- H: `FE-DOC-00` (delivered @ `296b2d0`).
- S: `FE-DOC-01` (pattern) — delivered @ `3293009`, both lanes clean; does not block, establishes
  the shared home this milestone composes against.

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** (vendor composition layer only) · Shared documents
home stays **Team-2-maintained** (created at `FE-DOC-01`, per its own header comment) · Review A →
Review B (fresh contexts) → self-close on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13) — Board
reserved for BLOCKER/REGRESSION/Flag-and-Halt/override only.

## Key dates

Created 2026-07-03 · Started 2026-07-03 (owner standing instruction: "no approval required, just
start the work"; FE-DOC-01's hard+soft dependencies both cleared same-session) · Scope complete —

## DoD confirmation (checked at close — carry-forward rule: this is a NEW page, full-page DoD)

☐ page DoD ☐ responsive D/T/M (incl. 390px column-priority behavior) ☐ WCAG-AA (axe 0 own-content)
☐ tsc/eslint/prettier ☐ realistic mock data (field-aligned with the buyer hub's fixture universe;
every deep link resolves) ☐ LifecycleStrip = six frozen labels, `?stage=` only, zero progress-state
rendering ☐ facets frozen-field-only, no Project facet ☐ `?q=`/`?view=`/`?stage=` allowlisted with
safe fallbacks ☐ disabled affordances match the visibility matrix cell-for-cell ☐ both empty-state
variants reachable ☐ icons only via `document-icon-map.ts` ☐ no `(buyer)/*`/buyer-private import
under `workspace/documents/` (workspace-boundary — mirrors `FE-DOC-01`'s inverse rule) ☐ status
chips reused from `_components/vendor/engagements`, never re-derived ☐ `MoneyBoundaryBanner` reused
as-is, not a new `Callout` copy ☐ no coined status/kind strings (grep) ☐ no "approval" wording on
documents ☐ Review A PASS ☐ Review B PASS ☐ no TODO/dead code ☐ no duplicate components (shared
documents home never forked; local table listing ≠ fork of buyer's `DataListTable`, genuinely
different file with no shared ancestor to fork from) ☐ promotion candidates registered (a vendor
local-table pattern here + the buyer's, both pre-`FE-SH-01`, is now 2 instances — watch for a 3rd
before extracting) ☐ tracker updated ☐ card closed
