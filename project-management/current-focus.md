# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-01 · **Sprint:** Review cycle 5 — P-AUTH-04 & P-BUY-19 ✅ Approved; P-ADM-04 🟥 Patch Required (shared table)

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-AUTH-05` Password reset — confirm (P1) — ⬜ Pending (P-AUTH-04 ✅ Approved, RV-0010)
- **Status:** ⬜ queued to build
- **Next Page:** `P-AUTH-06` 2FA challenge (P2, Ready)
- **Updated:** 2026-07-01

## Team-2 — Buyer

- **Current Page:** `P-BUY-20` Engagement detail (P1) — ⬜ Pending (P-BUY-19 ✅ Approved, RV-0011)
- **Status:** ⬜ queued to build
- **Next Page:** `P-BUY-21` Purchase order (P1, Ready)
- **Updated:** 2026-07-01

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-04` RFQ moderation (P1) — 🟥 Patch Required (RV-0012 — `AdminQueueTable` th/td className: td-only + `headerClassName`)
- **Status:** 🟥 fixing (queue NOT advanced)
- **Next Page:** `P-ADM-05` Bans (P2, Ready) — after P-ADM-04 is re-approved
- **Updated:** 2026-07-01

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
