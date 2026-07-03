# WORK PACKAGE — FE-DOC-00 Charter & Governance Package

- **Lane:** L (documentation/PM deliverable — FE-VEN-14 precedent; no product code)
- **Reviewed-SHA record:** `296b2d0` (the governance-package commit — all package files; coverage
  verified PASS 150/150 pre-commit)
- **Value:** Platform · **Priority:** P1 · **Size:** S · **Risk:** Low

## In scope (the deliverable)

Minting + governance artifacts for the owner-directed **FE-DOC Cross-workspace Documents** track
(owner Board-minted 2026-07-03; decisions 1–3 + findings rounds R1–R3 recorded in the FE-DOC-01
WP card's adjudication annex):

- **WBS v1.2 amendment** (`project-management/fe-program-wbs.md`): Track 7 section (FE-DOC-00..04),
  coverage rows (`FE-DOC-01 | P-DOC-01`, `FE-DOC-02 | P-DOC-02`, `FE-DOC-03 | P-DOC-03..06`),
  checksum 144 → **150**, own-nothing list + disambiguation updated.
- **Coverage script** (`scripts/verify-fe-wbs-coverage.mjs`): `UNIVERSE` gains `DOC: 6`;
  hard-coded 144 literals derived from `expected.size`.
- **`page_inventory.md` v0.4**: §8A Cross-workspace Documents (P-DOC-01..06, binds by pointer),
  §1.2 totals, §12 Buyer/Vendor "Documents" nav entries, §13.8 attributes rows.
- **`esc_registry.md` §Document Management**: `ESC-OPS-DOC-MUSHOK` (priority) ·
  `ESC-OPS-DOC-KINDS` · `ESC-OPS-DOC-FEATURES`.
- **Board packet** `governanceReviews/BOARD-PACKET-DOCUMENT-MANAGEMENT_v1.0.md` (mint ratification
  record · excluded kinds/features dispositions · FE-SH-01 DataListTable promotion ask).
- **Tracker wiring**: team-2/team-3 P-DOC sections, execution-board queues + Board agenda item,
  current-focus pointers, changelog transitions, promotion-watchlist FE-SH-01 annotation.
- **FE-DOC-01 WP card** authored (build starts immediately after this package per owner decision 3).

## Out of scope (Review-A enforces)

Any product code/UI (that is FE-DOC-01+) · any corpus patch (items 2a–2c are packet asks, human
Board) · re-homing or editing closed milestones/pages · coining any document kind, state, format,
route, or contract · resolving the excluded-kinds or FE-SH-01 rulings locally.

## Dependencies

- H: — none (owner minting authorization delivered 2026-07-03).
- S: — none.

## Lifecycle ownership

Builder = **Team-2** · Maintainer = **FE Program Manager** · Lane-L review → close.
**Deliverable-close-only clause (FE-VEN-14 precedent):** this milestone closes on the package
being delivered and verified (coverage 150/150, trackers consistent). It does **not** wait on —
and its close does **not** imply — the human Board's rulings on packet items 2a–2c/3, which stay
open on their ESC handles/agenda entry without blocking any FE-DOC build.

## Key dates

Created 2026-07-03 · Started 2026-07-03 (owner plan approval = kickoff) · Closed —

## DoD confirmation (checked at close)

☐ `node scripts/verify-fe-wbs-coverage.mjs` exits 0 at **150/150, each owned exactly once**
☐ WBS/team/execution-board/current-focus/changelog/watchlist mutually consistent (derivation chain
intact) ☐ ESC rows follow the registry format (gap · interim · channel; coins nothing)
☐ packet follows the BOARD-PACKET structure (Raise ≠ Accept; recommendations not rulings)
☐ zero product-code files touched ☐ FE-DOC-01 WP card exists with the R1–R3 adjudication annex
☐ tracker updated ☐ card closed
