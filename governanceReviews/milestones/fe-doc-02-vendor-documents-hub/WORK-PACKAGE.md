# WORK PACKAGE — FE-DOC-02 Vendor Documents Hub

- **Lane:** G (cross-workspace presentation composition; mirrors `FE-DOC-01`'s adjudicated pattern —
  no new adjudication round implied, only DoD compliance against the same rulings)
- **Reviewed-SHA record:** `8c0cb40` — scope complete, submitted to Review-A 2026-07-03. **Real
  route-topology defect caught in self-verification, fixed before submission**: the initial draft
  mirrored the buyer hub's five fixed per-kind document routes (`/po`/`/challan`/`/trade-invoice`/
  `/payments`/`/wcc`), which do not exist on the vendor track (vendor's `EngagementDocuments` tabs
  are enumeration-build-blocked, `ESC-7G-ENG-03`, and live entirely inside the one
  `/workspace/engagements/[id]` page) — every per-engagement reference now points at that one real
  page instead. Live-verified in an isolated `git worktree` (real `npm install`, own dev server
  port 3031): all hub routes + every deep link 200, no fabricated per-kind hrefs in rendered HTML
  (confirmed via grep), engagement/generated-doc human refs render correctly, `MoneyBoundaryBanner`
  text present, "Generate document"/"Bulk download" confirmed `disabled:true` in the RSC payload,
  vendor nav "Documents" entry confirmed live on `/workspace/dashboard`. Axe (wcag2a/2aa/21a/21aa,
  desktop/tablet/mobile, 3 view states): **0 violations attributable to FE-DOC-02** — 1 mobile-only
  `button-name` critical hit is the identical pre-existing shared-shell `quick-create.tsx` defect
  already disclosed by `FE-DOC-01`'s own Review-B (Board standing agenda #11) — confirmed via
  `git show 8c0cb40 --stat`: `quick-create.tsx` does not appear in this commit's diff at all.
  **RV-0131 Review-A: PASS WITH PATCH** (1 MINOR — this card's own "In scope" §2 bullet had drifted
  from the correction above, patched in place; 2 OBS) — submitted to Review-B.
  **RV-0131 Review-B: ISSUES → fixed at `54e8d5f`.** 1 MAJOR: a SECOND fabricated route slipped
  past both self-verification and Review-A — the §3 Sourcing-documents "Quotation" link and its
  matching `recently_opened` item both hardcoded the buyer's `/rfqs/[id]/quotations/[qId]` route
  shape onto the vendor track, which actually uses `/rfqs/[id]/quotation` (singular — a vendor has
  exactly one quotation per RFQ). Live-verified 404 before the fix. 1 MINOR: a stale header comment
  in `documents-hub-view-models.ts` still described the already-corrected five-fixed-route claim.
  Both fixed at `54e8d5f`, live-reverified in a fresh isolated worktree (fixed route returns 200).
  **Process correction**: initially resubmitted straight to Review-B citing review-process.md §5's
  original re-entry nuance — but that nuance was retired by **Amendment v1.3 §13** ("any Review-A
  REVISION or Review-B ISSUES... always re-enters at Review-A... no more B-only re-entry shortcut").
  Caught by the confirmatory Review-B itself; corrected below.
  **RV-0131 Review-B round 2 (confirmatory) at `54e8d5f`: ISSUES again.** Both round-1 findings
  independently reconfirmed fixed, but the mandated adversarial re-sweep found a THIRD instance of
  the same failure class: 1 MAJOR — §2's `DocumentCollection` description ("...live on their own
  pages") was a near-verbatim buyer-hub carryover contradicting the correct disclosure 70 lines
  later in the same component; 1 MINOR — a second stale "five fixed routes" comment. Both fixed at
  `b1dad70`; exhaustive re-sweep confirms every remaining "five fixed" mention is now a correct
  buyer-vs-vendor contrast, not a stale claim. tsc/eslint/prettier green.
  **Per the binding Amendment v1.3 §13 rule, this now correctly re-enters at Review-A** on
  checkpoint `b1dad70` — not a further Review-B-only cycle.
  **RV-0131 Review-A round 2 (re-entry) at `b1dad70`: REVISION.** Both round-2 fixes reconfirmed
  genuine; fork check + scope discipline clean across the whole history; static gates clean. A
  maximally-adversarial re-sweep (explicitly briefed given the 3-prior-instance track record) found
  a FOURTH instance: 1 MAJOR — §2's description omitted the real, frozen `loi` engagement-document
  kind, contradicting the correct per-row disclosure 70 lines later in the same component (present
  since the original `8c0cb40` draft, missed by every prior round); 1 MINOR — the `FACETS` lists
  similarly omitted LOI and the frozen `Recorded`/`Confirmed` payment-record statuses. Both fixed at
  `c7ff7b7` (§2 description now lists LOI; both facets gain their missing options).
  `GENERATED_DOC_KIND_LABEL` deliberately left untouched — LOI is correctly absent there (a
  different concept: generated-document kinds, not `engagement_document_kind`; byte-identical to
  the buyer hub's own established map). Before this next submission, ran an exhaustive
  string-by-string comparison of every user-facing string in this file against the buyer hub's
  equivalents — the only remaining differences are legitimate, disclosed vendor-framing choices, no
  further omissions found. tsc/eslint/prettier green. Re-entering at Review-A (round 3) on
  checkpoint `c7ff7b7` per Amendment v1.3 §13.
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
    vendor-owned, not the buyer's `engagementStateDisplay`) + a single plain-navigation link to the
    one real `/workspace/engagements/[id]` page (**not** the buyer leg's five fixed per-kind
    routes — the vendor track has no `/po|/challan|/trade-invoice|/payments|/wcc` sub-routes; its
    `EngagementDocuments` doc-kind tabs are enumeration-build-blocked, `ESC-7G-ENG-03`, and live
    entirely inside that one page) + expandable `DocumentProcessTimeline` (entries also link to
    that same page, never a fabricated per-kind route). DF-6 money-boundary note renders via the
    vendor's own **`<MoneyBoundaryBanner />`** (`_components/vendor/engagements`) — not a new
    `Callout` copy.
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
