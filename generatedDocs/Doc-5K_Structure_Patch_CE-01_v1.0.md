# Doc-5K — Structure Patch CE-01 v1.0 — Dangling-Pointer Erratum (`Doc-4K §K13` → `§B.12` / `Doc-2 §10.10`)

| Field | Value |
|---|---|
| Patch ID | `Doc-5K_Structure_Patch_CE-01_v1.0` |
| Status | **APPROVED — additive erratum.** Pointer-only; **non-substantive** (no rule, partition, decision, or scope change). The base document is **not** reopened or edited |
| Patches | `Doc-5K_Structure_v1.0_FROZEN.md` (FROZEN) |
| Type | Carried errata **CE-01** — stale cross-reference correction, surfaced at Doc-5K Content Pass-1 Independent Hard Review |
| Authority | `Doc-5_Program_Governance_Note_v1.0 §5` (post-freeze change only via approved additive patch; effective state = base + patches) |
| Effective state | `Doc-5K` structure = `Doc-5K_Structure_v1.0_FROZEN.md` **+ this patch CE-01** |
| Coins | nothing — no endpoint/status/header/error-class/slug/POLICY key/event/score; binds an existing frozen anchor |

## 1. Defect

`Doc-5K_Structure_v1.0_FROZEN.md` cites **`Doc-4K §K13`** in two places (R7, line 29; §4, line 73) as the authority for the M9 cache lifecycle / TTL / "no business state machine" fact. **`Doc-4K_FROZEN_v1.0.md` has no section `§K13`** — its sections are **`§B.12` (Retention & TTL)**, `§K5-VO`, `§K6` (Hardened Contract Specifications), `§K17`. `§K13` is a **stale reference inherited from a Doc-4K pre-freeze pass**; it is a **dangling pointer** in the frozen structure.

The cache-lifecycle / hard-delete-on-expiry / TTL-retention fact actually lives in **`Doc-4K §B.12` (Retention & TTL)** + **`Doc-2 §10.10` (cache semantics)** (verified verbatim: "Hard delete on expiry (cache semantics, Doc-2 §10.10). Retention = TTL only.").

## 2. Correction (pointer-only)

Wherever `Doc-5K_Structure_v1.0_FROZEN.md` reads **`Doc-4K §K13`**, the effective binding is **`Doc-4K §B.12` + `Doc-2 §10.10`**. No surrounding wording, rule, or partition changes.

| Loc | Base text (FROZEN) | Effective (CE-01) |
|---|---|---|
| **R7** (line 29) | "…NO business state machine (`Doc-4K §K13`); there is no domain state-edge to realize…" | "…NO business state machine (**`Doc-4K §B.12` + `Doc-2 §10.10`** — cache semantics; no state-machine section defined); there is no domain state-edge to realize…" |
| **§4** (line 73) | "…callers treat an expired artifact as stale (`Doc-4K §K13`)." | "…callers treat an expired artifact as stale (**`Doc-4K §B.12` + `Doc-2 §10.10`**)." |

## 3. Non-substantive attestation

- **No rule changes.** R7's regenerable-disposable-cache decision and §4's read realization are unchanged in meaning; only the cited section number is corrected to the real frozen owner.
- **The fact is identical.** `§B.12` (Retention & TTL) + `Doc-2 §10.10` (cache semantics) state exactly the TTL/hard-delete/no-state-machine fact `§K13` was intended to cite.
- **No partition / scope / count / actor / firewall change** (still 8 caller + 8 out = 16; REC-1 resolved).
- **Coins nothing.**

## 4. Provenance

Surfaced at **`Doc-5K_Content_v1.0_Pass1.md`** Independent Hard Review as **MAJOR-01** (corrected in-place in the content pass) and carried to the frozen structure as **CE-01**. Content passes already bind the corrected anchor; this patch aligns the frozen structure so downstream documents inherit the valid pointer.

## 5. Verification

1. `grep "§K13" Doc-4K_FROZEN_v1.0.md` → **0** (confirms the base pointer is dangling).
2. `Doc-4K §B.12` (Retention & TTL) + `Doc-2 §10.10` (cache semantics) resolve and state the TTL/hard-delete fact (confirmed verbatim).
3. Effective structure (base + CE-01) has **no dangling pointer**; all other anchors unchanged.

---

*End of Doc-5K Structure Patch CE-01 v1.0. Additive, pointer-only, non-substantive erratum. The frozen base `Doc-5K_Structure_v1.0_FROZEN.md` is not reopened; effective state = base + CE-01. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt.*
