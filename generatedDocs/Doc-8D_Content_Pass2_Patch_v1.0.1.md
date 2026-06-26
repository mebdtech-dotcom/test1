# Doc-8D — Content Pass-2 **Patch v1.0.1** (Hard Review disposition) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-8D_Content_v1.0_Pass2.md` (§4–§7) |
| Against | `Doc-8D_Content_Pass2_Independent_Hard_Review_v1.0.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 1 MAJOR + 1 MINOR + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED; proceed to Content Freeze Audit |
| Method | Additive content patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MAJOR-1 — §5.4 marketplace-visibility mislabeled as Invariant-#11 byte-equivalence → **FIXED**
§5.4 is rewritten to separate the two non-disclosures:
> **§5.4 Non-disclosure byte-equivalence — Invariant #11 (blacklist undetectable) = the buyer-private case.** Invariant #11 is *private exclusion stays private; blacklist undetectable* — specifically the **buyer-private exclusion** (`buyer_vendor_statuses`, **M4 / `Doc-6F`**). The defining assertion: a buyer's query results for a **blacklisted** vendor are **byte-identical (observer's view)** to a **non-matched** vendor's — the buyer cannot distinguish "blacklisted" from "never matched"; `buyer_vendor_statuses` content is never observable in any vendor-facing query. **The canonical criterion (excluded ≡ non-matched) is single-sourced here**; 8C/8F/8G compose at their layers. **Entirely execution-deferred** — authored now, runs when **`Doc-6F`** freezes (no marketplace facet is the #11 gate; `Doc-6D` froze with **no `buyer_private` coined**).

**Marketplace publish-state visibility moves to §5.1/§5.2–§5.3** as a **general visibility RLS** check (ready now — `Doc-6D` tri-actor): an unpublished/hidden profile is RLS-absent for anonymous/non-owner Users (positive: see published-only; negative: cannot read unpublished). This is general visibility-scope, **not** the #11 byte-equivalence.

> **`CLAR-8D-1` (carried clarification):** the frozen structure's D3/§5 phrasing ("marketplace-visibility facet of byte-equivalence, ready") is more precisely **general visibility RLS (ready)**, distinct from the **#11 byte-equivalence proper (buyer-private, `Doc-6F`, deferred)**. Additive clarification; the frozen structure is not edited; folded into the SERIES_FROZEN manifest.

### MINOR-1 — §5.1 paraphrases Doc-6D RLS → **FIXED**
§5.1: the positive cases are asserted **per the frozen `Doc-6D` RLS policy definitions (by pointer)**; the anonymous/User/Admin descriptions are **illustrative**, the oracle is the actual frozen policy (no paraphrase as the assertion).

### NITPICK-1 — §4 codegen deferred → **FIXED (applied)**
§4: codegen-integrity (`generated-contracts-registry/` no-diff) is grouped with the migration sequence as **execution-deferred** (needs the code/Prisma toolchain); the targets (registered keys/roles, codegen freshness) are authored now.

### REJECTED finding — upheld
"§5.4 byte-equivalence impossible at the DB" stays **REJECTED as false** — equivalence is of the **observer's result set** (blacklisted ≡ never-matched from the buyer's view), not vendor identities; well-defined Invariant #11. Reinforces MAJOR-1 (buyer-private/Doc-6F). No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER | 0 | 0 |
| MAJOR | 1 | **0** |
| MINOR | 1 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Closure Check

| Finding | Sev | Closed? |
|---|---|---|
| MAJOR-1 #11 = buyer-private (Doc-6F); marketplace = general visibility | MAJOR | **CLOSED** — §5.4 rewritten; marketplace → §5.1-5.3; `CLAR-8D-1` carried |
| MINOR-1 §5.1 by-pointer not paraphrase | MINOR | **CLOSED** — asserts per frozen Doc-6D policy |
| NITPICK-1 codegen deferred | NIT | **CLOSED** — grouped with migration deferred |
| REJECTED (byte-equivalence impossible) | — | **Upheld false** |

No new defect. Re-verified Invariant #11 = blacklist undetectable = buyer-private (`buyer_vendor_statuses`, M4/Doc-6F), distinct from `Doc-6D` publish-state visibility. **0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED.** Both content passes (§0–§7) approved → ready for Content Freeze Audit.

*End of Content Pass-2 Patch v1.0.1 + Closure Check. Next: Content Freeze Audit → `Doc-8D_SERIES_FROZEN_v1.0` (folds in `CLAR-8D-1`).*
