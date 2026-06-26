# Doc-8E — Domain, Invariant, Firewall & State-Machine Conformance Suite — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-8E Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8E = the **defining suite** (Doc-8A allocation) for the 5-signal firewall, the 12 Core Invariants, the moat, and the Doc-4M state machines; consumes the frozen **Doc-8B harness** by pointer |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §7` + Appendix A bands **A** + **D** (`CHK-8-030…033`) + **E** (`CHK-8-040…042`). **Oracle:** CLAUDE.md §4 (firewall) / §5 (12 invariants) / §1 (moat); `Doc-2`; `Doc-4M` (state authority); `Doc-4G`/`Doc-3`/`Doc-4E` (scoring). Consumes `Doc-8B` by pointer |
| Authority | `Doc-8A` governs; the frozen corpus is the oracle. Doc-8E **coins nothing** and **asserts only corpus-declared governance behavior** — a red test = code/enforcement defect, or `[ESC-8-CORPUS]` (genuine corpus defect — never weaken) |
| Freeze evidence | `Doc-8E_Structure_Freeze_Audit_v1.0.md` (PASS) + `Doc-8E_Content_Freeze_Audit_v1.0.md` (APPROVE; 8 dimensions PASS; 0 open BLOCKER/MAJOR/MINOR) |

---

## Effective set (the authoritative Doc-8E)

| Artifact | Role |
|---|---|
| `Doc-8E_Structure_v1.0_FROZEN.md` | Frozen structure — E1 (defining-suite/assert-once) + E2 (oracle-frozen/enforcement-deferred), §0–§7 |
| `Doc-8E_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-8E_Content_v1.0_Pass1.md` (+ `Pass1_Patch_v1.0.1`) | §0–§3 — control · governance-conformance registry · firewall (non-cross-mutation + non-dominance) · 12 invariant suites |
| `Doc-8E_Content_v1.0_Pass2.md` (+ `Pass2_Patch_v1.0.1`) | §4–§7 — moat exercise · Doc-4M state-machine conformance · defining-suite composition · conformance |
| `Doc-8E_Content_Freeze_Audit_v1.0.md` | Content freeze certification (APPROVE) |

*(No `Doc-2`/`Doc-3`/`Doc-4` patch was required to freeze Doc-8E — it coins nothing. A genuine governance/scoring gap (e.g. an absent dominance metric) surfaces at content/execution as `[ESC-8-CORPUS]`.)*

---

## What Doc-8E fixes (the governance conformance suite)

- **Firewall (`CHK-8-030/031`) — two assertion shapes:** **non-cross-mutation** (vary signal A, assert signal B independent — Financial Tier never raises Trust, etc.; + the System-actor sub-shape: a non-System write to a score rejected, audit `actor_type` corroborates) and **non-dominance** (maxed-signal-non-determinative — no single signal unilaterally determines the outcome, **per the frozen scoring rule** `Doc-4G`/`Doc-3`/`Doc-4E`; no invented metric — `[ESC-8-CORPUS]` if the corpus defines none).
- **12 Core Invariants (`CHK-8-032`):** one suite per invariant, oracle-by-pointer; **8E defines** them, composers (8C/8F/8G) invoke; **exception** — **#8** (immutability) and **#11** (byte-equivalence) are **Doc-8D-defined** (`CHK-8-022`/`CHK-8-024`), 8E **references** (the data-layer enforcement; #8 execution-ready now via frozen Doc-6B/6C triggers).
- **Moat (`CHK-8-033`):** asserts the moat as a **governed system property** (M3 produces the governed match/route/sort/score; M4 post-award/CRM per contract) and **composes** the per-contract (8C) and per-event (8F) checks; the **no-re-rank-at-display** is **Doc-8G's** (Doc-7 R5), cross-referenced.
- **Doc-4M state machines (`CHK-8-040…042`):** per machine — permitted transitions succeed; illegal (wrong edge/actor/source) rejected; **edge coverage** (every machine × every declared edge, parameterized from the frozen Doc-4M edge set); `CHK-8-042` optimistic-UI convergence **defined here, executed in Doc-8G**.
- **E1 assert-once:** 8E exports canonical helpers (`firewallNonCross`/`firewallNonDom`/`invariantHolds(n)`/`stateMachineSuite`/`expectOptimisticConverges`); composers invoke, never re-implement.
- **E2 oracle-frozen / enforcement-deferred:** the governance *what* is FROZEN → authored fully now; each assertion flagged execution-ready (#8) or execution-deferred (firewall/scoring → M5/M3; transitions → owning services/code); **none silently dropped**. Authored-not-run; PASS/FAIL at execution as enforcement realizations freeze.

## Carried items

`DR-8-HARNESS` **consumed** (Doc-8B) · `DR-8-STATE` **satisfied** (8E is the state-machine defining suite) · `[ESC-8-CORPUS]` (genuine governance/scoring defect — flag-and-halt, **never weaken**) · `[ESC-8-API]`/`[ESC-8-POLICY]` (by pointer, named channel).

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (1 MAJOR + 2 MINOR; 1 REJECTED) → Patch v0.1.1 + short re-review → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1 (§0–§3), Pass-2 (§4–§7) — each authored → Board Hard Review → Patch v1.0.1 → short closure check (each 0 open BLOCKER/MAJOR/MINOR; 2 findings REJECTED-as-false upheld) → Content Freeze Audit (APPROVE; 8 dimensions PASS).

---

*Doc-8E (Domain/Invariant/Firewall/State-Machine Conformance Suite) is FROZEN. The defining suite for the firewall (two assertion shapes) + 12 invariants + moat + Doc-4M machines; consumes the Doc-8B harness; coins nothing; asserts only corpus-declared governance behavior. On any conflict with the frozen corpus, the corpus wins; flag-and-halt — never weaken an assertion. Next: Doc-8D (Persistence/RLS — oracle growing: Doc-6B+6C frozen; owns the #8/#11 data-layer defining checks 8E references).*
