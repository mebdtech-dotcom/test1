# Doc-8E — Content Pass-1 **Patch v1.0.1** (Hard Review disposition) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-8E_Content_v1.0_Pass1.md` (§0–§3) |
| Against | `Doc-8E_Content_Pass1_Independent_Hard_Review_v1.0.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 2 MINOR + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → Pass-1 APPROVED; proceed to Content Pass-2 |
| Method | Additive content patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MINOR-1 — #8/#11 defined in Doc-8D, 8E references → **FIXED**
§3 gains a directionality clause + the two rows are re-flagged:
> **Definer direction [Doc-8A allocation table].** 8E defines the **governance/domain** invariants. Where an invariant's canonical enforcement is a **data-layer** concern, **Doc-8D defines and 8E references**:
> - **#8** (nothing overwritten/hard-deleted) → **Doc-8D-defined** (`CHK-8-022` immutability, frozen Doc-6B/6C triggers — execution-ready); 8E's invariant-#8 **invokes** 8D's assertion.
> - **#11** (private exclusion stays private / byte-equivalent) → **Doc-8D-defined** (`CHK-8-024` byte-equivalence); 8E's invariant-#11 **invokes** 8D's assertion.
>
> All other invariants remain **8E-defined** with composing cross-refs. Single definer per invariant either way (no divergence).

The §3 table `role`/`cross-ref` cells for #8/#11 are updated to "**8D-defined; 8E references**."

### MINOR-2 — §2.2 invented "weight 1.0" criterion → **FIXED**
§2.2's assertion is rebound to the frozen scoring's own definition:
> **Dominance criterion [binding the frozen scoring rule].** The suite asserts "**no single signal unilaterally determines the outcome, per the frozen scoring rule**" — the dominance/weighting definition is **whatever `Doc-4G` (trust) / `Doc-3`·`Doc-4E` (matching) state**; the suite invents **no** weight threshold. If the frozen scoring rules define **no** dominance metric (so the firewall rule is unassertable as the corpus states it), that is **`[ESC-8-CORPUS]`** — flag-and-halt for a Board additive clarification at the owning doc; **never invent the metric.**

The illustrative `expectStillDependsOnOthers` comment is corrected to cite the frozen scoring rule, not a 1.0 weight.

### NITPICK-1 — System-actor sub-shape → **FIXED (applied)**
§2.1 notes the distinct sub-shape:
> The **System-actor rule** ("scores auto-calculated under System, never hand-edited") is an **actor-authorization** assertion (assert a **non-System write to a score is rejected** — oracle CLAUDE.md §4 + M5/Doc-6G enforcement; `core.audit_records.actor_type` corroborates per `Doc-6A §8`), grouped under §2.1 but **distinct** from the vary-A-assert-B independence shape.

### REJECTED finding — upheld
"§3 cross-refs make 8E redundant" stays **REJECTED as false** — cross-refs name the composing layer; 8E is the single surface-independent definer (assert-once); the #8/#11 MINOR-1 is a direction correction (definer → 8D), still single-definer. No change.

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
| MINOR-1 #8/#11 definer direction | MINOR | **CLOSED** — 8D-defined, 8E-references; single definer; bidirectionality stated |
| MINOR-2 dominance criterion | MINOR | **CLOSED** — bound to frozen scoring; `[ESC-8-CORPUS]` if absent; no invented weight |
| NITPICK-1 System-actor sub-shape | NIT | **CLOSED** — distinct actor-authorization shape noted |
| REJECTED (8E redundant) | — | **Upheld false** |

No new defect. Re-verified the Doc-8A allocation (immutability/byte-equivalence → 8D-defined) and the no-invented-criterion discipline (Doc-8A §3.3). **0 open BLOCKER/MAJOR/MINOR → Pass-1 APPROVED.**

*End of Content Pass-1 Patch v1.0.1 + Closure Check. Next: Content Pass-2 (§4–§7) — moat · state-machine · composition · conformance.*
