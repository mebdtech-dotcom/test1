# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 18 (auto-check ~5min) — P-BUY-27 (RV-0043, CRM non-disclosure), P-ACC-06 (RV-0044), P-ADM-15 (RV-0045) ✅ all Approved; all three advanced. CRM pair (P-BUY-26/27) + verification pair + import pair complete.

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-19` Lead credits (P2) — 🟡 In Progress (P-ACC-18 ✅ committed)
- **Status:** 🟡 building (presentation-only; lead balance + transactions, BC-BILL-4; Inv #10 numeric; platform-revenue only)
- **Next Page:** _(confirm from team-1.md after P-ACC-19)_
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `BX-01` Dashboard enhancement — ✅ Approved (RV-0070) + **committed 08dcb7a**. Sourcing Pipeline widget + populated dashboard; no kit/token change; axe 0 own-content.
- **Status:** ✅ BX-01 done. Ready for **BX-02** (next Buyer Experience enhancement) — awaiting owner target (RFQ/quotation presentation vs another widget). Freeze remediation still HELD (batches after sprint). Presentation-only; no backend.
- **Next Page:** BX-02 — proposed: improve RFQ detail / quotation presentation (contract-grounded). **Still owner-gated:** P-BUY-03/04 route topology + P-BUY-05 favorites scope/projection
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-23` Plan editor (P2) — ⬜ Pending (P-ADM-22 ✅ Approved, RV-0065). `activate_plan` admin-only (R5); is_active surfaces here (get_plan detail)
- **Status:** ⬜ queued to build — M7 editor: `create/update/retire_plan` + `activate_plan` (R5, M7-owned); Inv#10 plan≠tier + entitlements by value; is_active editable here (get_plan projects it)
- **Next Page:** `P-ADM-24` Entitlements / bundles (P2, Ready)
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
