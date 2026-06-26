# Doc-8F — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8F_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET FREEZE-READY** — 1 MAJOR + 1 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER. Resolve via Structure Patch → short re-review → Structure Freeze Audit |

---

## Anchors verified CORRECT

- `Doc-2 §8` (event ownership/emitters) · `Doc-4J` (authoritative event catalog) · `Doc-4L` (cross-module event-flow map) · `core.outbox_events` (`Doc-6B`, status `pending→dispatched→archived` forward-only) · `core.outbox_archive_retention` (`Doc-6B` POLICY) · `Doc-8B §7` (outbox observer/drainer) /§3 (savepoint opt-out) · Invariant #7 · `Doc-8E` (firewall helpers) · `Doc-8D §5/§6` (byte-equivalence criterion / static FK) — all correctly invoked.
- F1 (catalog-inventory-driven) + F2 (outbox-observer atomicity) + F3 (execution-readiness) correctly reuse the Doc-8C/8D/8E precedents; the Doc-8B outbox observer (the Band-F enabler) is correctly the atomicity vehicle.

0 BLOCKER. The event-inventory + atomicity-via-observer + composition design is sound. One load-bearing assertion-mechanism gap on the boundary check, one fan-out-layer precision, one cross-check nit.

### MAJOR-1 — §2 `CHK-8-050` (cross-module boundary) under-specifies its **assertion mechanism** — "runtime/integration boundary" is undefined
§2 asserts the cross-module boundary "at runtime" — "a cross-module flow reaches the other module **only through its contract or a consumed event**." But it **names no mechanism** for *how* this is asserted, and "no cross-module **table access** at runtime" is genuinely hard to probe (you cannot easily observe that a module's operation didn't touch another schema without instrumentation or a DB-grant model). As written, `CHK-8-050` is **unassertable**.
**Required fix:** §2 — name the **concrete mechanisms**, which are **primarily static**:
- **no cross-module import** → **static import-graph analysis** (only `contracts/` importable cross-module — CLAUDE.md §10 module shape; a dependency-graph lint);
- **no cross-module FK** → **Doc-8D's** static DDL check (`CHK-8-025`, cross-ref — not re-asserted);
- **no cross-module table access** → the **harness through-contracts construction** (Doc-8A §4.2 — fixtures/operations can only set up via a module's own contract/seed, never a foreign-table write) **plus** static analysis (no raw SQL to another schema).
If a **runtime** DB-access enforcement is desired but the corpus froze **no per-module DB-grant model**, flag `[ESC-8-CORPUS]` (the corpus provides no runtime mechanism to assert against) — do not invent one. Re-frame `CHK-8-050` as a **static + construction** check, not an undefined runtime probe.

### MINOR-1 — §4 fan-out is asserted at the **dispatch-routing** layer, not consumer execution
§4 asserts "the right consumers are invoked — no more, no fewer." But consumer **execution** is deferred (consumers are code). What is testable via the mocked Inngest double is the **dispatch routing** — which consumer handlers the outbox event **routes to** per `Doc-4L` (the fan-out edges), not that the consumers ran.
**Required fix:** §4 — assert the fan-out at the **dispatch-routing layer** (the outbox event routes to exactly the `Doc-4L`-declared consumer handlers, observed at the mocked Inngest double); consumer **execution effects** are §5 (consumer-effect locality) / deferred. The routing edges are the frozen `Doc-4L` oracle; the routing realization is code (F3 deferred).

### NITPICK-1 — §1 `Doc-2 §8` ↔ `Doc-4J` cross-check may surface a corpus inconsistency
§1's bidirectional cross-check (every §8 emitter has a catalog event; every catalog event has a §8 emitter) is correct, but a divergence between two **frozen** docs is a **corpus inconsistency** → `[ESC-8-CORPUS]`, not a code defect.
**Suggested fix:** §1 — note that a `Doc-2 §8` ↔ `Doc-4J` divergence is `[ESC-8-CORPUS]` (flag-and-halt at the owning docs), not a suite-local resolution.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"Doc-8F is almost entirely execution-deferred (needs emitter/consumer code) — freezing a suite that can't run is premature; wait for the code."* | **REJECTED (false).** The **authored-not-run** principle that froze 8C/8D/8E applies: the oracle (`Doc-2 §8`/`Doc-4J`/`Doc-4L`/the outbox contract) is **FROZEN**, so the suite's **design + coverage + the zero-coined-event discipline** are lockable **now** — ensuring every catalog event has its Band-F checks the moment emitters exist, and preventing event/flow drift. Freezing the conformance **intent** ahead of code is the program's purpose (the suite is the spec's executable shadow). Deferred-execution ≠ premature-freeze. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MAJOR-1 §2 boundary assertion mechanism undefined | MAJOR | Structure Patch — static import-graph + 8D FK cross-ref + through-contracts; `[ESC-8-CORPUS]` if runtime DB-grant absent |
| MINOR-1 §4 fan-out is dispatch-routing layer | MINOR | Structure Patch — assert routing edges (Doc-4L) at the mocked Inngest double; execution = §5/deferred |
| NITPICK-1 §1 §8↔Doc-4J divergence is corpus | NIT | Structure Patch — note `[ESC-8-CORPUS]` |

**Gate (governance §8 rule 1):** freeze only with 0 open BLOCKER/MAJOR/MINOR. 1 MAJOR + 1 MINOR open → **Structure Patch required**, then short re-review, then Structure Freeze Audit.

*End of Independent Hard Review. Nothing coined; no frozen document edited. Anchors verified against Doc-2 §8 / Doc-4J / Doc-4L / Doc-6B outbox / Doc-8B §7 observer / Invariant #7 / the Doc-8A allocation.*
