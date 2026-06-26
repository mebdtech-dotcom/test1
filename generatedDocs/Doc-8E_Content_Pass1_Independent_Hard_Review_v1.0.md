# Doc-8E — Content Pass-1 (§0–§3) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8E_Content_v1.0_Pass1.md` (§0–§3) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 2 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-1 Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- CLAUDE.md §4 (firewall — correctly split 3 non-cross-mutation + 2 non-dominance) / §5 (12 invariants verbatim) · `Doc-4G`/`Doc-3`/`Doc-4E` (scoring) · `Doc-6A §8` (audit corroboration) · `Doc-6B`/`6C` (frozen immutability triggers) · `Doc-4M` · `Doc-8A §7` + bands A/D/E + allocation table · `Doc-8B` — all correctly invoked.
- The structure MAJOR fix (two firewall assertion shapes) is correctly realized in §2.1/§2.2.

0 BLOCKER, 0 MAJOR. The registry, the two firewall shapes, and the invariant table are clean. Two allocation/criterion precision defects, one sub-shape nit.

### MINOR-1 — §3 invariants #8 and #11 are **defined in Doc-8D** per the Doc-8A allocation; 8E **references**, not defines (the role direction is inverted for persistence-enforced invariants)
§3 marks every invariant row as 8E-defined with a cross-ref. But per the frozen **Doc-8A allocation table**, the **immutability** check (`CHK-8-022`, invariant #8) and the **non-disclosure byte-equivalence** check (`CHK-8-024`, invariant #11) are **defined in Doc-8D** (the data layer where the enforcement lives — triggers / RLS). For these two, the **defining** assertion is **8D's**, and 8E's invariant view **references/composes** it — the *inverse* of the usual "8E defines, others compose." Marking them 8E-defined contradicts the allocation table and would create two definers.
**Required fix:** §3 — for #8 (immutability) and #11 (byte-equivalence), set `role` = **Doc-8D-defined, 8E-references** (8E's invariant-level attestation invokes 8D's `CHK-8-022`/`CHK-8-024` defining assertion). State the bidirectionality: 8E defines the *governance/domain* invariants; where an invariant's canonical enforcement is a **data-layer** concern (#8, #11), **Doc-8D defines and 8E references**. (#8 is execution-ready now via the frozen Doc-6B/6C triggers — correctly Doc-8D's.)

### MINOR-2 — §2.2 "reaches an effective weight of 1.0" risks **inventing** a dominance criterion
§2.2's assertion says a single signal must not "reach an effective weight of 1.0." Unless the **frozen scoring rules** (`Doc-4G` trust / `Doc-3`/`Doc-4E` matching) express dominance as a weight threshold, "effective weight of 1.0" is a **coined criterion** — a re-specification of what "dominates" means (forbidden — Doc-8A §3.3).
**Required fix:** §2.2 — bind the dominance criterion to the **frozen scoring rule's own definition** of dominance/weighting (whatever `Doc-4G`/`Doc-3`/`Doc-4E` state); assert "no single signal unilaterally determines the outcome **per the frozen scoring rule**," not an invented weight threshold. If the frozen rules do not define a dominance metric, that gap is `[ESC-8-CORPUS]` (the firewall rule is unassertable as the corpus states it) — flag-and-halt, never invent the metric.

### NITPICK-1 — §2.1 the System-actor rule is an actor-authorization assertion, not vary-A-assert-B
§2.1 folds "scores auto-calculated under System, never hand-edited" into the non-cross-mutation shape, but it is an **actor-authorization** assertion (a non-System write is rejected) — a different shape from vary-A-assert-B.
**Suggested fix:** §2.1 — note the System-actor rule as a distinct sub-shape (assert a non-System write to a score is rejected), grouped under §2.1 but not conflated with the vary-A-assert-B independence shape.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§3 cross-refs every invariant to 8C/8D/8F/8G — if each is exercised in another suite, 8E is redundant; test them where they surface."* | **REJECTED (false).** The cross-ref names the **composing** layer, not a replacement. 8E holds the **canonical, surface-independent** assertion (the invariant as a domain property); the composing suites exercise it *in their context* by **invoking 8E's helper** (E1 assert-once). Without 8E, each invariant would be **re-implemented divergently** across surfaces — exactly the defect E1 prevents. (The MINOR-1 exception — #8/#11 — is a *direction* correction, not redundancy: the definer moves to 8D, but there is still a single definer.) No redundancy. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 #8/#11 defined in 8D, 8E references | MINOR | Pass-1 Patch — invert role direction; state bidirectionality |
| MINOR-2 §2.2 invented "weight 1.0" criterion | MINOR | Pass-1 Patch — bind to frozen scoring's dominance definition; `[ESC-8-CORPUS]` if absent |
| NITPICK-1 System-actor sub-shape | NIT | Pass-1 Patch — note distinct actor-authorization shape |

**Gate:** 2 MINOR open → **Pass-1 Patch required**, then short closure check, then Content Pass-2 (§4–§7).

*End of Independent Hard Review (Content Pass-1). Nothing coined; no frozen document edited.*
