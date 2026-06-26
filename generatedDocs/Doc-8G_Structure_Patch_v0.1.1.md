# Doc-8G — Structure **Patch v0.1.1** (Hard Review disposition) + Short Re-Review

| Field | Value |
|---|---|
| Patches | `Doc-8G_Structure_Proposal_v0.1.md` |
| Against | `Doc-8G_Structure_Independent_Hard_Review_v0.1.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 2 MINOR + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → structure freeze-ready |
| Method | Additive structure patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MINOR-1 — §5 "composes Doc-8C" mis-stated → **FIXED**
§5 + G2 reword the e2e/8C relationship:
> The e2e journey **invokes only frozen Doc-5x contracts** — the same surface **Doc-8C independently verifies** (per-contract conformance). 8G asserts the **journey works end-to-end** (the contracts compose into a working flow through the UI), **not** per-contract conformance (8C's Band B). **Shared Doc-5 oracle, distinct assertions; 8G does not re-run 8C's checks.**

### MINOR-2 — G3 oracle-gap for `CHK-8-065` → **FIXED**
G3 + §6 qualify the oracle-completeness:
> The **UI surface oracle is complete** (Doc-7 `7B…7H` frozen) for **all** Band-G checks — so component/a11y/visual/e2e/currency have their **full oracle now**. **`CHK-8-065` (UI non-disclosure byte-equivalence) additionally has a data-oracle dependency**: constructing the **excluded-vendor** scenario needs the buyer-private data (`buyer_vendor_statuses`, M4/`Doc-6F`) — the criterion is **Doc-8D's** (sourced from `Doc-6F`); the **UI observable** (Doc-7G byte-equivalence) is frozen. So "no oracle-gap" holds for the **UI surfaces**; `CHK-8-065`'s **data scenario** awaits `Doc-6F` (flagged like Doc-8D #11). All authored now; none dropped.

### NITPICK-1 — `CHK-8-042` is Band-E composed → **FIXED (applied)**
§6/§7: **Band G = `CHK-8-060…065`** (Doc-8G-realized). **`CHK-8-042`** (optimistic-UI convergence) is a **Band-E** check **8E defines** and **8G executes** (composed) — listed separately in §7, not as a Band-G deliverable.

### REJECTED finding — upheld
"8G e2e duplicates 8C" stays **REJECTED as false** — 8C = per-contract conformance; 8G = end-to-end journey works; a journey can fail while every contract conforms. Shared oracle, distinct assertions. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER | 0 | 0 |
| MAJOR | 0 | 0 |
| MINOR | 2 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Re-Review (closure confirmation)

| Finding | Sev | Closed? |
|---|---|---|
| MINOR-1 e2e/8C relationship | MINOR | **CLOSED** — uses Doc-5 oracle; asserts journey-works, not 8C's per-contract |
| MINOR-2 CHK-8-065 data-oracle | MINOR | **CLOSED** — UI oracle complete; CHK-8-065 data-dep on Doc-6F flagged |
| NITPICK-1 CHK-8-042 Band-E | NIT | **CLOSED** — composed-from-8E, separate from Band G |
| REJECTED (8G vs 8C) | — | **Upheld false** |

No new defect. Re-verified the e2e/8C distinction (journey vs per-contract) and the CHK-8-065 data dependency (Doc-6F). **0 open BLOCKER/MAJOR/MINOR → structure freeze-ready.**

*End of Structure Patch v0.1.1 + Short Re-Review. Nothing coined; no frozen document edited. Next: Structure Freeze Audit → `Doc-8G_Structure_v1.0_FROZEN` → Doc-8G content passes → SERIES_FROZEN → Doc-8 program closure.*
