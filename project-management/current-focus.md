# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 12 — P-BUY-22 (RV-0024) & P-ACC-01 (RV-0025) ✅ Approved; P-ADM-08 re-review 🟥 (RV-0026, action-map MAJOR)

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-02` User profile (P1) — ⬜ Pending (P-ACC-01 ✅ Approved, RV-0025)
- **Status:** ⬜ queued to build
- **Next Page:** `P-ACC-03` Security & 2FA (P2, Ready)
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `P-BUY-23` Trade invoice review (P2) — ⬜ Pending (P-BUY-22 ✅ Approved, RV-0024). ≠ platform invoice
- **Status:** ⬜ queued to build
- **Next Page:** `P-BUY-24` Challan (P2, Ready)
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-08` Category management (P1) — 🟥 Patch Required (RV-0026): action-map MAJOR — set `{draft:[Approve], active:[Retire], retired:[]}` (retired terminal), then re-review
- **Status:** 🟥 Patch Required — stays with Team-3 (RV-0023's 3 findings resolved; one-map fix remains; P-ADM-09 blocked)
- **Next Page:** `P-ADM-09` Category editor (P1, Ready)
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
