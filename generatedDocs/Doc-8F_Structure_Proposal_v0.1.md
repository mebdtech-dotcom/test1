# Doc-8F — Integration & Event-Flow Conformance Suite — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-8F artifact. Next: Independent Hard Review (Board) → Structure Patch → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Supersedes | — (first Doc-8F artifact) |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8F is the **Integration & Event-Flow conformance suite** — proves cross-module interaction occurs **only via contracts/events**, the **transactional write-plus-emit** is atomic, event payloads conform to the **Doc-4J** catalog, and the **Doc-4L** fan-out holds. Consumes the frozen **Doc-8B harness** (incl. the **outbox observer/drainer**, §7) by pointer |
| Document | **Doc-8F** — realizes `Doc-8A §8` + Appendix A **Band F** (`CHK-8-050…053`) as the executable integration/event-flow conformance suite |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §8` + Band F. **Oracle (the *what*):** `Doc-2 §8` (event ownership / emitter list) · **`Doc-4J`** (the authoritative event catalog) · **`Doc-4L`** (the cross-module event-flow map) · the realized **`core.outbox_events`** (`Doc-6B`, status `pending→dispatched→archived`) · Invariant #7 (One Module, One Owner). Consumes `Doc-8B` (runner/fixtures/seeding/clock-ID/mock-boundary + **outbox observer/drainer §7** + the mocked Inngest double) by pointer |
| Authority | `Doc-8A` governs; `Doc-2 §8` / `Doc-4J` / `Doc-4L` are the oracle. Doc-8F **coins nothing** and **asserts only catalog-declared events + flow** — a red test = code defect, or `[ESC-8-CORPUS]`/`[ESC-8-API]` (never weaken the assertion) |
| Contains | Structure only — the ratified decisions (F1 catalog-inventory-driven; F2 outbox-observer-based atomicity; F3 execution-readiness), the suite section map §0–§7, carried items. **No test code, no per-event cases** — those land in the content passes |
| Audience | Architecture Board · Enterprise/DDD Architect · QA/Test lead · Doc-8F content authors |
| Program note | Doc-8F introduces **no event, payload field, consumer, or expected value**. It asserts the frozen Doc-4J catalog + Doc-4L flow. On any gap: flag-and-halt → `[ESC-8-CORPUS]` (Board, additive patch at the owning doc) — never coin a new event/edge. |

> **Governing rule:** Doc-8F realizes, never re-decides. The event catalog (Doc-4J), the flow map (Doc-4L), and the outbox contract (Doc-2 §8 / Doc-6B) are FROZEN; Doc-8F realizes *how the integration is proven conformant*. Every assertion is an oracle-by-pointer; **zero events coined**; no flow stricter or looser than Doc-4L (Doc-8A §3.3).

---

## Decisions proposed for ratification at structure freeze

- **F1 — Catalog-inventory-driven (table-driven over the frozen Doc-4J catalog + Doc-4L flow — the Doc-8C/8D precedent).** An **event inventory** is **derived from the frozen `Doc-4J` authoritative event catalog** + the **`Doc-4L` flow map** — every event by name/version, its emitter (the `Doc-2 §8` owning emitter), its payload contract, and its declared consumers (the `Doc-4L` fan-out). Each Band-F check runs over every inventory row. The **completeness check asserts inventory ≡ the frozen Doc-4J catalog** (every catalog event covered; **none coined**). Coverage provable against the frozen catalog.
- **F2 — Atomicity + dispatch asserted via the Doc-8B outbox observer/drainer (no live async runtime).** `CHK-8-051` (write-plus-emit atomicity) and `CHK-8-052` (dispatch lifecycle + fan-out) consume the **Doc-8B §7 outbox observer/drainer**: inspect `core.outbox_events` after a transaction (assert the business write + outbox insert committed/rolled-back **together**), and the controlled **dispatch tick** (advance `pending→dispatched`; archival a distinct retention step) against the **mocked Inngest double**. The atomicity test uses the **savepoint/schema-reset opt-out** (Doc-8B §3) — a real commit boundary is observed, not the rollback-everything default.
- **F3 — Execution-readiness: oracle frozen now; emitters/consumers are code (deferred).** The oracle — `Doc-2 §8` / `Doc-4J` / `Doc-4L` / the `core.outbox_events` contract — is **FROZEN**, so Doc-8F is **authored fully now** (design + coverage). But the **emitters and consumers** that produce/consume events are **module services / code (NOT STARTED)** — so most Band-F assertions are **execution-deferred** (run when the emitting/consuming modules exist). The `core.outbox_events` **table mechanics** (status forward-only, dispatch lifecycle) are testable against the realized table (`Doc-6B`) sooner. Each inventory row flagged ready/deferred; **none silently dropped** (authored-not-run, the Doc-8C/8D/8E precedent).

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding
- **Purpose:** Doc-8F's place (below Doc-8A; consumes Doc-8B incl. the outbox observer/drainer; composes 8E firewall + 8D non-disclosure where signals/exclusion flow via events); realize-never-redecide; oracle = `Doc-2 §8` / `Doc-4J` / `Doc-4L` / `core.outbox_events`; freeze obligation — pass Appendix A **Band F** (+ Band A) and clear any `[ESC-8-*]`; never weaken (`[ESC-8-CORPUS]`); **zero events coined**.
- **Dependencies:** `Doc-8A §0/§8/Appendix A`; `Doc-8B` (harness, outbox observer §7); `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope & the Event-Catalog Inventory
- **Purpose:** the **event inventory** (F1) — every frozen `Doc-4J` event with: name/version, emitter (`Doc-2 §8` owner), payload contract, declared consumers (`Doc-4L` fan-out), execution-readiness (F3). Derived from the frozen `Doc-4J` catalog + `Doc-4L` map (reference-never-restate); the completeness check asserts inventory ≡ the frozen Doc-4J catalog (none coined). Cross-checked against `Doc-2 §8` (the emitter list) — every §8 emitter has a catalog event; every catalog event has a §8 emitter.
- **Dependencies:** `Doc-4J` (catalog); `Doc-4L` (flow); `Doc-2 §8` (emitters). **Detail:** inventory schema + source-of-truth anchor.

## §2 — Cross-Module Boundary Conformance *(`CHK-8-050`)*
- **Purpose:** assert cross-module interaction occurs **only via `contracts/` and events** (Invariant #7): no cross-module import beyond another module's `contracts/`, no cross-module table access, no cross-module foreign key. The **static no-cross-schema-FK** facet is **Doc-8D's** (`CHK-8-025`, cross-ref — not re-asserted); Doc-8F asserts the **runtime/integration** boundary (a cross-module flow reaches the other module **only** through its contract or a consumed event, never its internals). A test that sets up a precondition by reaching into another module's tables is itself a boundary violation (Doc-8A §4.2). Execution-deferred (needs running modules).
- **Dependencies:** Invariant #7; CLAUDE.md Red-Flag list; `Doc-8D §6` (static FK, cross-ref). **Detail:** runtime boundary assertion.

## §3 — Transactional Write-Plus-Emit Atomicity *(`CHK-8-051`)*
- **Purpose:** assert the outbox transactionality (`Doc-2 §8` / `Doc-6A §7` / `Doc-6B`): a business write **and** its `core.outbox_events` insert **commit or roll back together** — on a forced failure after the business write, **no** outbox row is dispatched and **no** partial state persists; on success, **exactly one** outbox row exists. Asserted via the **Doc-8B §7 outbox observer** + the **savepoint/schema-reset opt-out** (real commit boundary). The outbox is M0-owned (`Doc-4B`); no emitter writes another schema (cross-ref §5). Execution-deferred (needs an emitting service); the `core.outbox_events` table contract is realized (`Doc-6B`).
- **Dependencies:** `Doc-2 §8`; `Doc-6A §7`/`Doc-6B` (outbox); `Doc-8B §7` (observer) /§3 (savepoint). **Detail:** atomicity assertion via outbox observer.

## §4 — Event-Payload & Dispatch Conformance *(`CHK-8-052`)*
- **Purpose:** assert every emitted event's **name + payload** against the **`Doc-4J` authoritative catalog** (zero coined events; a payload field with no catalog source is forbidden); the **dispatch lifecycle** (`pending→dispatched→archived` — `Doc-6B core.outbox_status`, forward-only) via the Doc-8B drainer's controlled tick (dispatch `pending→dispatched`; archival a distinct retention step — `core.outbox_archive_retention`); and the **`Doc-4L` fan-out** (the **right consumers** are invoked — no more, no fewer). An event not in the Doc-4J catalog = a coined event (forbidden → `[ESC-8-CORPUS]`). Execution-deferred (needs emitters/consumers); the catalog + lifecycle are the frozen oracle now.
- **Dependencies:** `Doc-4J` (catalog); `Doc-4L` (fan-out); `Doc-6B` (`core.outbox_status` lifecycle); `Doc-8B §7` (drainer). **Detail:** payload + lifecycle + fan-out assertion.

## §5 — Consumer-Effect Locality *(`CHK-8-053`)*
- **Purpose:** assert that a consumer's effect persists in the **consuming module's own schema** — never a cross-schema write back into the emitter's (or any other) tables. Consumer effects propagate **forward** via the consumer's own contracts. (Re-asserts the One-Module-One-Owner boundary from the consumer side — Invariant #7; the emitter side is §2/§3.) Execution-deferred (needs running consumers).
- **Dependencies:** Invariant #7; `Doc-4L` (consumer map); `Doc-2 §8`. **Detail:** consumer-effect-locality assertion.

## §6 — Composition: Firewall-via-Events & Non-Disclosure-via-Events *(mechanism)*
- **Purpose:** realize the composition allocations — Doc-8F **invokes** the canonical defining assertions at the event-flow layer, never re-implementing them: **Doc-8E's `firewallNonCross`/`firewallNonDom`** where a governance signal **flows via an event** (assert no event carries a cross-mutating/dominating signal); **Doc-8D's `CHK-8-024` byte-equivalence criterion** where an exclusion could leak **via an event/notification** (assert **no distinguishing event** is emitted for an excluded vs non-matched vendor — the §5.4 / Doc-8C §9.6 "8F: no distinguishing notification/event" composition). 8F composes; it does not define firewall/non-disclosure.
- **Dependencies:** `Doc-8E` (firewall helpers); `Doc-8D §5` (byte-equivalence criterion); the Doc-8A allocation table. **Detail:** compose-not-define; event-layer invocation.

## §7 — Conformance & Carried Items
- **Purpose:** self-check against Appendix A **Bands A + F**; **coverage attestation** (inventory ≡ frozen Doc-4J catalog; every applicable check per event; readiness flagged per F3, none dropped; zero events coined); carried register (`DR-8-HARNESS` consumed — incl. outbox observer; `[ESC-8-CORPUS]` for a coined-event/flow defect — never weaken; `[ESC-8-API]`/`[ESC-8-POLICY]`). Coins nothing.
- **Dependencies:** `Doc-8A Appendix A` (A/F); `Doc-4J`/`Doc-4L`. **Detail:** attestation + coverage + readiness register.

---

## Open Carried Items

| ID | Item | Doc-8F handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8F consumes the Doc-8B harness (incl. the outbox observer/drainer, mocked Inngest) | By pointer; re-authors nothing | **Consumed** |
| **F3 execution-deferred set** | Emitters/consumers are code (NOT STARTED); most Band-F runtime assertions await running modules | Authored now (oracle = Doc-2 §8/Doc-4J/Doc-4L, frozen), pointer-bound, flagged deferred; the `core.outbox_events` table mechanics testable sooner (Doc-6B); no silent omission | **No (tracked)** |
| `[ESC-8-CORPUS]` | A test reveals a coined event / flow not in the Doc-4J/Doc-4L oracle, or a genuine catalog defect | Flag-and-halt → Board additive patch at `Doc-4J`/`Doc-4L`; test never weakened; **never coin an event** | **Per-content: possible** |
| `[ESC-8-API]` / `[ESC-8-POLICY]` | Untestable surface / unregistered POLICY key | By pointer; named channel; never local | **Per-content: possible** |

## Fences / Out of scope

The harness (Doc-8B — consumed) · other disciplines' **primary** assertions (contract = 8C; persistence/RLS = 8D [8F cross-refs the static FK check]; domain/invariant/firewall = 8E [8F composes the firewall/non-disclosure helpers]; frontend/e2e = 8G) · coining any event/payload field/consumer/expected value · changing any frozen `Doc-2 §8`/`Doc-4J`/`Doc-4L` declaration · weakening an assertion (`[ESC-8-CORPUS]` instead) · the implementation Code/emitters/consumers under test (downstream; F3 deferred).

---

## Provenance & next steps

- **Provenance:** first Doc-8F artifact. Realizes `Doc-8A §8 + Band F`; consumes `Doc-8B` (outbox observer); oracle = `Doc-2 §8` / `Doc-4J` / `Doc-4L` / `core.outbox_events`. No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. F1 (catalog-inventory-driven), F2 (outbox-observer atomicity), F3 (execution-readiness); section map §0–§7; carried items registered.
- **Next in the lifecycle (Board loop):** Independent Hard Review → Structure Patch → short re-review → Structure Freeze Audit → `Doc-8F_Structure_v1.0_FROZEN` → Doc-8F content passes. Oracle frozen now (Doc-2 §8 / Doc-4J / Doc-4L); execution awaits the emitting/consuming module code.

*End of Doc-8F Canonical Structure **Proposal v0.1** — structure only. On any conflict, `Doc-2 §8`/`Doc-4J`/`Doc-4L` + Doc-8A win; flag-and-halt — never weaken an assertion, never coin an event. Doc-8F realizes a catalog-inventory-driven integration/event-flow conformance suite; consumes the Doc-8B outbox observer; composes 8E/8D; coins nothing. Next: Independent Hard Review.*
