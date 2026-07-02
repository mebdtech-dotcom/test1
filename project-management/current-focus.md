# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 18 (auto-check ~5min) — P-BUY-27 (RV-0043, CRM non-disclosure), P-ACC-06 (RV-0044), P-ADM-15 (RV-0045) ✅ all Approved; all three advanced. CRM pair (P-BUY-26/27) + verification pair + import pair complete.

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-18` Usage & quota (P2) — 🟡 In Progress (P-ACC-17 ✅ committed)
- **Status:** 🟡 building (presentation-only; usage/quota dashboard `get_usage`; Inv #10; quota≠routing)
- **Next Page:** _(confirm from team-1.md after P-ACC-18)_
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `F2-0` Final Buyer UX Refinement — ⏸ **AWAITING OWNER SPEC** (additional business info / cards / workflow improvements). F1 audits DONE; **F1-6 Freeze Report v1.0 DELIVERED** (`BUYER_FRONTEND_FREEZE_REPORT_v1.0.md`; MAJOR 6 · MINOR 5).
- **Status:** ⏸ HOLD all freeze remediation (owner sequencing) — build owner's UX refinements FIRST, THEN one batch of all FZ-01..FZ-11 + full verify + 2-review → request freeze. Idle until owner provides the refinement content.
- **Next Page:** F2-0 (owner content) → F2-Z single freeze batch. **Still owner-gated:** P-BUY-03/04 route topology + P-BUY-05 favorites scope/projection
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-23` Plan editor (P2) — ⬜ Pending (P-ADM-22 ✅ Approved, RV-0065). `activate_plan` admin-only (R5); is_active surfaces here (get_plan detail)
- **Status:** ⬜ queued to build — M7 editor: `create/update/retire_plan` + `activate_plan` (R5, M7-owned); Inv#10 plan≠tier + entitlements by value; is_active editable here (get_plan projects it)
- **Next Page:** `P-ADM-24` Entitlements / bundles (P2, Ready)
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
