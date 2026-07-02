# Execution Board — queues · gates · Board agenda

**FE Program Management v1.0** · Non-authoritative, derived (chain: `review-process.md` §9).
**Owner (maintains): FE Program Manager** — queue advancement happens at Board close only.
Roadmap: [`fe-program-wbs.md`](fe-program-wbs.md) · pointer: [`current-focus.md`](current-focus.md).

## Team queues (gate-adjusted — pull top-down; skip nothing without citing its gate)

**Team-1 (Public / PF):**
`FE-PUB-02 Discovery` ← current · FE-PUB-03 → FE-PUB-04 → FE-PUB-06 → FE-PUB-07 → FE-PUB-01 ·
~~FE-PUB-05~~ ⛔ `ESC-7-API-PRODDETAIL` (skip while gated).
*Soft-ordered after the Review-B Step-3 Public baseline sweep — enhance a reviewed baseline.*

**Team-2 (Buyer):**
`FE-BUY-04 Quotation Detail` ← current (the awaited BX-03) · FE-BUY-05 → FE-BUY-06 → FE-BUY-07 →
FE-BUY-08 → FE-BUY-09 → FE-CLN-01 (F2-Z batch). FE-BUY-10 🅿 parked.

**Team-3 (Vendor):**
~~FE-VEN-05 RFQ Workspace~~ ✅ **Closed** (RV-0101, board-approved 2026-07-02 @ `e2f8642`) ·
Team-3 **idle by owner instruction** — FE-VEN-06 kickoff explicitly NOT authorized this cycle
(hold, don't pull) → FE-VEN-06 → FE-VEN-07 → FE-VEN-08 → FE-VEN-13 (Ads) → FE-VEN-04 remainder
(P-VND-09) · FE-VEN-10/11/12 at Board kickoff scoping. FE-VEN-09 ⛔.

**Review Team 5 standing backlog (B lane):** Step-3 Public baseline sweep (QCT 5-step Step 3) at a
stable post-cutover SHA — runs **before FE-PUB-02 starts**; findings feed the FE-PUB packages.

## Gated register (⛔ — waiting on an `esc_registry.md` handle or asset)

| Item | Gate | Interim |
|---|---|---|
| FE-PUB-05 (P-PUB-11) | `ESC-7-API-PRODDETAIL` | product modal from `search_catalog` |
| FE-PUB-09 mega menu | taxonomy P1 approval + `MEGA_MENU_*` package approval (S: `ESC-7-API-CATNAV`) | simple nav (FE-PF-05) |
| FE-VEN-09 (P-VND-28) | `ESC-7G-SCORE-DISPLAY` + `ESC-7B-TRUSTSCORE` | band-only, page unbuilt |
| FE-PF-02 brand | official SVGs under `public/brand/` | placeholder-complete kit `BrandLogo` |
| Page-gates inside milestones | P-PUB-09 `ESC-7-API-CATNAV` · P-VND-10 `ESC-7-API/upload` · P-ACC-12 `ESC-IDN-DELEG-EXPIRY` | carve-out rule (WBS) |

## Parked register (🅿 — waiting on an owner decision)

| Item | Decision needed |
|---|---|
| FE-BUY-10 | P-BUY-03/04 route topology · P-BUY-05 favorites scope + display-projection gap |
| FE-VEN-10/11/12 | Board kickoff scoping (vendor-context reuse of P-ACC surfaces; T3 builds adaptation, T1 keeps maintaining reused pages) |
| M2.5 vendor public microsite | continuation past the delivered foundation |

## Board standing agenda

1. **Official brand SVGs** — supply unmodified assets (`public/brand/README.md` policy); closes FE-PF-02.
2. **Vendor FE BLOCKER packet** — SCORE-DISPLAY · TRUSTSCORE · A7; packets ready
   (`governanceReviews/BOARD-PACKET-VENDOR-FE-BLOCKERS`, `DECISION-MATRIX-VENDOR-FE`); unblocks FE-VEN-09 + vendor companion freeze.
3. **FE-BUY-10 decisions** — route topology (P-BUY-03/04) + favorites scope/projection (P-BUY-05).
4. **P-ACC-12** — `ESC-IDN-DELEG-EXPIRY` (delegation reinstate path).
5. **M2.5 microsite continuation.**
6. **Taxonomy P1 + mega-menu package approval** — unblocks FE-PUB-09.
7. **FE-VEN-10/11/12 kickoff scoping.**
8. **Shell-mount ratification** — global search `/account/search` + notification center
   `/notifications` (raised at loop terminus, non-blocking; pages ✅).
9. **SiteHeader "Pricing" nav → `/pricing`** chrome wiring (RV-0087 follow-up).
10. **Authorize the Review-B Step-3 Public baseline sweep** (first standing-backlog run).

## Review pipeline (pointer)

States, lanes (G/L), verdicts, re-entry, DoD, WP-card template: [`review-process.md`](review-process.md).
`⬜ → 🔍 → 🟡 → 🔵A → 🔵B → 🟣 → ✅` (+ 🟠/🟥/⛔/🅿/❌/♻).
