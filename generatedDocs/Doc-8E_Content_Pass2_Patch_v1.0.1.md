# Doc-8E — Content Pass-2 **Patch v1.0.1** (Hard Review disposition) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-8E_Content_v1.0_Pass2.md` (§4–§7) |
| Against | `Doc-8E_Content_Pass2_Independent_Hard_Review_v1.0.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 2 MINOR + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED; proceed to Content Freeze Audit |
| Method | Additive content patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MINOR-1 — §4 "no re-rank by consumer" is a UI assertion (8G), not domain → **FIXED**
§4 splits the moat assertion by layer:
> **8E defines** the **domain oracle**: M3 **produces** the governed match/route/sort/score output per `Doc-5E` (the matching authority). The **no-re-rank-at-display** assertion (a UI/consumer cannot re-order the governed result) is **Doc-8G's** (composing; oracle **Doc-7 R5** — "display sort is presentation over the contract result, never a re-rank"), **cross-referenced, not executed in 8E**. Define-the-governed-output here; execute-the-display-non-re-rank in 8G (parallel to `CHK-8-042`).

The illustrative `expectNoReRankByConsumer` is moved to the Doc-8G-composed column (a cross-ref, not an 8E case).

### MINOR-2 — §4 moat overlaps 8C/8F → **FIXED**
§4 states the compose-not-re-implement boundary:
> The moat exercise asserts the moat as a **governed system property** — the moat **works as a governed whole** end-to-end (RFQ → governed match/route → award → post-award) — and **composes** the per-contract (Doc-8C) and per-event/integration (Doc-8F) checks; it **does not re-implement** them. 8E owns "the moat is governed and intact"; 8C/8F own the constituent contract/event conformance the moat exercise **invokes**. (Assert-once across suites.)

### NITPICK-1 — invariantHolds shape → **FIXED (applied)**
§6: `invariantHolds(n)` is a **single parameterized helper** over the frozen invariant id (CLAUDE.md §5 `#n`); composing suites pass the id; the registry (§1) drives applicability.

### REJECTED finding — upheld
"§5 edge coverage is combinatorial explosion" stays **REJECTED as false** — edge coverage is the conformance bar; bounded by the frozen Doc-4M edge set; parameterized (author-once per edge shape), not hand-written. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER / MAJOR | 0 / 0 | 0 / 0 |
| MINOR | 2 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Closure Check

| Finding | Sev | Closed? |
|---|---|---|
| MINOR-1 §4 no-re-rank → 8G | MINOR | **CLOSED** — 8E defines governed output; 8G composes display non-re-rank (Doc-7 R5) |
| MINOR-2 §4 moat composes 8C/8F | MINOR | **CLOSED** — moat = governed system property; composes, not re-implements |
| NITPICK-1 invariantHolds | NIT | **CLOSED** — single parameterized helper |
| REJECTED (edge explosion) | — | **Upheld false** |

No new defect. Re-verified the layer split (domain governed-output 8E / display non-re-rank 8G per Doc-7 R5) and the compose-not-duplicate discipline (assert-once). **0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED.** Both content passes (§0–§7) approved → ready for Content Freeze Audit.

*End of Content Pass-2 Patch v1.0.1 + Closure Check. Next: Content Freeze Audit → `Doc-8E_SERIES_FROZEN_v1.0`.*
