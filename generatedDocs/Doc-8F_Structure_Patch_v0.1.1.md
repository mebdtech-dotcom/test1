# Doc-8F — Structure **Patch v0.1.1** (Hard Review disposition) + Short Re-Review

| Field | Value |
|---|---|
| Patches | `Doc-8F_Structure_Proposal_v0.1.md` |
| Against | `Doc-8F_Structure_Independent_Hard_Review_v0.1.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 1 MAJOR + 1 MINOR + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → structure freeze-ready |
| Method | Additive structure patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MAJOR-1 — §2 boundary assertion mechanism undefined → **FIXED**
§2 is re-framed to name the concrete (primarily static) mechanisms:
> **`CHK-8-050` is asserted by static + construction mechanisms, not an undefined runtime probe:**
> - **No cross-module import** → **static import-graph analysis** (only `contracts/` is importable cross-module — CLAUDE.md §10 module shape; a dependency-graph lint over the code).
> - **No cross-module FK** → **Doc-8D's** static DDL check (`CHK-8-025`, **cross-ref**, not re-asserted).
> - **No cross-module table access** → (a) **static** (no raw SQL referencing another schema) + (b) the **harness through-contracts construction** (Doc-8A §4.2 — fixtures/operations set up only via a module's own contract/seed, never a foreign-table write).
> If a **runtime DB-access** enforcement is later desired but the corpus froze **no per-module DB-grant model**, that is **`[ESC-8-CORPUS]`** (no runtime mechanism to assert against) — **never invent one**. `CHK-8-050` is a **static + construction** check; the import-graph facet is execution-ready against code (when it exists), the DDL facet via 8D now.

### MINOR-1 — §4 fan-out is dispatch-routing layer → **FIXED**
§4 is rescoped:
> The **fan-out** is asserted at the **dispatch-routing layer** — the outbox event routes to **exactly the `Doc-4L`-declared consumer handlers** (observed at the **mocked Inngest double** — Doc-8B §7), no more, no fewer. Consumer **execution effects** are §5 (consumer-effect locality) and are F3-deferred. The routing **edges** are the frozen `Doc-4L` oracle; the routing **realization** is code (deferred).

### NITPICK-1 — §1 §8↔Doc-4J divergence is corpus → **FIXED (applied)**
§1: a `Doc-2 §8` ↔ `Doc-4J` divergence (a §8 emitter with no catalog event, or vice-versa) is a **corpus inconsistency** → **`[ESC-8-CORPUS]`** (flag-and-halt at the owning docs), not a suite-local resolution.

### REJECTED finding — upheld
"Doc-8F freeze is premature (can't run)" stays **REJECTED as false** — authored-not-run (the 8C/8D/8E precedent): the oracle (Doc-2 §8/Doc-4J/Doc-4L/outbox contract) is FROZEN; the design + coverage + zero-coined-event discipline are lockable now; deferred-execution ≠ premature-freeze. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER | 0 | 0 |
| MAJOR | 1 | **0** |
| MINOR | 1 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Re-Review (closure confirmation)

| Finding | Sev | Closed? |
|---|---|---|
| MAJOR-1 boundary mechanism | MAJOR | **CLOSED** — static import-graph + 8D DDL cross-ref + through-contracts construction; `[ESC-8-CORPUS]` if runtime DB-grant absent; no invented probe |
| MINOR-1 fan-out routing layer | MINOR | **CLOSED** — dispatch-routing edges (Doc-4L) at mocked Inngest; execution = §5/deferred |
| NITPICK-1 §8↔Doc-4J corpus | NIT | **CLOSED** — `[ESC-8-CORPUS]` on divergence |
| REJECTED (premature freeze) | — | **Upheld false** |

No new defect. Re-verified the boundary mechanisms (static import-graph per CLAUDE.md §10; 8D DDL FK; through-contracts Doc-8A §4.2) and the fan-out as dispatch-routing (Doc-4L edges at the mocked Inngest double). **0 open BLOCKER/MAJOR/MINOR → structure freeze-ready.**

*End of Structure Patch v0.1.1 + Short Re-Review. Nothing coined; no frozen document edited. Next: Structure Freeze Audit → `Doc-8F_Structure_v1.0_FROZEN` → Doc-8F content passes.*
