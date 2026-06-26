# Doc-8F — Integration & Event-Flow Conformance Suite — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26). Effective = `Doc-8F_Structure_Proposal_v0.1` + `Doc-8F_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8F = the **Integration & Event-Flow conformance suite**; consumes the frozen **Doc-8B harness** (incl. the outbox observer/drainer §7) by pointer |
| Document | **Doc-8F** — realizes `Doc-8A §8` + Appendix A **Band F** (`CHK-8-050…053`) as the integration/event-flow conformance suite |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §8` + Band F. **Oracle:** `Doc-2 §8` (event ownership/emitters) · `Doc-4J` (authoritative event catalog) · `Doc-4L` (cross-module event-flow map) · `core.outbox_events` (`Doc-6B`, `pending→dispatched→archived`) · Invariant #7. Consumes `Doc-8B` (incl. the outbox observer/drainer §7 + mocked Inngest) by pointer |
| Authority | `Doc-8A` governs; `Doc-2 §8`/`Doc-4J`/`Doc-4L` are the oracle. Doc-8F **coins nothing**, **coins zero events** — a red test = code defect, or `[ESC-8-CORPUS]`/`[ESC-8-API]` (never weaken) |
| Contains | Structure only — F1 (catalog-inventory-driven) + F2 (outbox-observer atomicity) + F3 (execution-readiness), §0–§7, carried items. **No test code** — content passes realize the conventions |
| Program note | Doc-8F introduces **no event, payload field, consumer, or expected value**. On any gap: flag-and-halt → `[ESC-8-CORPUS]` (Board, additive patch at `Doc-4J`/`Doc-4L`) — never coin an event/edge. |

> **Governing rule:** realize, never re-decide. The event catalog (Doc-4J), the flow map (Doc-4L), and the outbox contract (Doc-2 §8 / Doc-6B) are FROZEN; Doc-8F realizes *how the integration is proven conformant*. Every assertion is oracle-by-pointer; **zero events coined**; no flow stricter or looser than Doc-4L (Doc-8A §3.3).

---

## Ratified decisions

- **F1 — Catalog-inventory-driven (table-driven; the Doc-8C/8D precedent).** An **event inventory** is **derived from the frozen `Doc-4J` catalog + `Doc-4L` flow** — every event by name/version, its `Doc-2 §8` emitter, payload contract, declared consumers (`Doc-4L` fan-out), execution-readiness. Each Band-F check runs over every row; the **completeness check asserts inventory ≡ the frozen Doc-4J catalog** (none coined), cross-checked against `Doc-2 §8` (a §8↔Doc-4J divergence between two frozen docs is `[ESC-8-CORPUS]`).
- **F2 — Atomicity + dispatch via the Doc-8B outbox observer/drainer (no live async runtime).** `CHK-8-051` (atomicity) + `CHK-8-052` (dispatch + fan-out) consume the **Doc-8B §7 outbox observer/drainer**: inspect `core.outbox_events` post-transaction (business write + outbox insert commit/rollback **together** — via the **savepoint/schema-reset opt-out**, a real commit boundary), and the controlled **dispatch tick** (`pending→dispatched`; archival a distinct retention step) against the **mocked Inngest double**.
- **F3 — Execution-readiness: oracle frozen now; emitters/consumers are code (deferred).** The oracle (`Doc-2 §8`/`Doc-4J`/`Doc-4L`/the `core.outbox_events` contract) is FROZEN → Doc-8F authored fully now (design + coverage). The **emitters/consumers** are module services/code (NOT STARTED) → most Band-F runtime assertions **execution-deferred**; the `core.outbox_events` **table mechanics** testable sooner (`Doc-6B`); the **import-graph** static facet runs against code when it exists. Each row flagged ready/deferred; **none silently dropped** (authored-not-run).

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding
- **Purpose:** Doc-8F's place (below Doc-8A; consumes Doc-8B incl. the outbox observer/drainer; composes 8E firewall + 8D non-disclosure where signals/exclusion flow via events); realize-never-redecide; oracle = `Doc-2 §8`/`Doc-4J`/`Doc-4L`/`core.outbox_events`; freeze obligation — pass Appendix A **Band F** (+ Band A); never weaken (`[ESC-8-CORPUS]`); **zero events coined**.
- **Dependencies:** `Doc-8A §0/§8/Appendix A`; `Doc-8B` (harness, outbox observer §7); `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope & the Event-Catalog Inventory
- **Purpose:** the **event inventory** (F1) — every frozen `Doc-4J` event with name/version, emitter (`Doc-2 §8`), payload contract, declared consumers (`Doc-4L` fan-out), execution-readiness (F3). Derived from the frozen `Doc-4J` + `Doc-4L`; completeness ≡ Doc-4J catalog (none coined); bidirectional cross-check vs `Doc-2 §8` emitters — a divergence between two frozen docs is **`[ESC-8-CORPUS]`** (flag-and-halt at the owning docs), not suite-local.
- **Dependencies:** `Doc-4J`; `Doc-4L`; `Doc-2 §8`. **Detail:** inventory schema + source-of-truth anchor.

## §2 — Cross-Module Boundary Conformance *(`CHK-8-050`)*
- **Purpose:** assert the boundary (Invariant #7) via **static + construction** mechanisms (not an undefined runtime probe): **no cross-module import** → **static import-graph analysis** (only `contracts/` importable — CLAUDE.md §10); **no cross-module FK** → **Doc-8D `CHK-8-025`** static DDL (cross-ref, not re-asserted); **no cross-module table access** → static (no raw SQL to another schema) + the **harness through-contracts construction** (Doc-8A §4.2). If a runtime DB-access enforcement is desired but the corpus froze no per-module DB-grant model → `[ESC-8-CORPUS]`, never invented. Import-graph facet execution-ready against code; DDL facet via 8D now.
- **Dependencies:** Invariant #7; CLAUDE.md §10; `Doc-8D §6` (FK cross-ref); `Doc-8A §4.2` (through-contracts). **Detail:** static + construction boundary assertion.

## §3 — Transactional Write-Plus-Emit Atomicity *(`CHK-8-051`)*
- **Purpose:** assert (`Doc-2 §8` / `Doc-6A §7` / `Doc-6B`): a business write + its `core.outbox_events` insert **commit or roll back together** — on a forced failure after the business write, **no** outbox row dispatched and **no** partial state persists; on success, **exactly one** outbox row. Via the **Doc-8B §7 outbox observer** + the **savepoint/schema-reset opt-out** (real commit boundary). The outbox is M0-owned (`Doc-4B`); no emitter writes another schema (cross-ref §5). Execution-deferred (needs an emitting service); the `core.outbox_events` table contract realized (`Doc-6B`).
- **Dependencies:** `Doc-2 §8`; `Doc-6A §7`/`Doc-6B`; `Doc-8B §7`/§3. **Detail:** atomicity via outbox observer.

## §4 — Event-Payload & Dispatch Conformance *(`CHK-8-052`)*
- **Purpose:** assert every event's **name + payload** vs the **`Doc-4J` catalog** (zero coined; a payload field with no catalog source forbidden); the **dispatch lifecycle** (`pending→dispatched→archived` — `Doc-6B core.outbox_status` forward-only) via the drainer's controlled tick (dispatch `pending→dispatched`; archival a distinct retention step — `core.outbox_archive_retention`); and the **`Doc-4L` fan-out** asserted at the **dispatch-routing layer** — the outbox event routes to **exactly the `Doc-4L`-declared consumer handlers** (observed at the mocked Inngest double), no more/fewer. Consumer **execution effects** = §5 (deferred). An event not in Doc-4J = coined (forbidden → `[ESC-8-CORPUS]`).
- **Dependencies:** `Doc-4J`; `Doc-4L`; `Doc-6B` (`core.outbox_status`); `Doc-8B §7` (drainer). **Detail:** payload + lifecycle + fan-out-routing assertion.

## §5 — Consumer-Effect Locality *(`CHK-8-053`)*
- **Purpose:** assert a consumer's effect persists in the **consuming module's own schema** — never a cross-schema write back into the emitter's (or any other) tables; effects propagate **forward** via the consumer's own contracts (One-Module-One-Owner from the consumer side — Invariant #7; emitter side is §2/§3). Execution-deferred (needs running consumers).
- **Dependencies:** Invariant #7; `Doc-4L` (consumer map); `Doc-2 §8`. **Detail:** consumer-effect-locality assertion.

## §6 — Composition: Firewall-via-Events & Non-Disclosure-via-Events *(mechanism)*
- **Purpose:** Doc-8F **invokes** the canonical defining assertions at the event-flow layer, never re-implementing: **Doc-8E's `firewallNonCross`/`firewallNonDom`** where a governance signal **flows via an event** (no event carries a cross-mutating/dominating signal); **Doc-8D's `CHK-8-024` byte-equivalence criterion** where an exclusion could leak **via an event/notification** (assert **no distinguishing event** is emitted for an excluded vs non-matched vendor — the Doc-8D §5.4 / Doc-8C §9.6 "8F: no distinguishing notification/event" composition). 8F composes; it does not define firewall/non-disclosure.
- **Dependencies:** `Doc-8E` (firewall helpers); `Doc-8D §5` (byte-equivalence criterion); the Doc-8A allocation. **Detail:** compose-not-define; event-layer invocation.

## §7 — Conformance & Carried Items
- **Purpose:** self-check against Appendix A **Bands A + F**; **coverage attestation** (inventory ≡ frozen Doc-4J catalog; every applicable check per event; readiness flagged per F3, none dropped; zero events coined); carried register (`DR-8-HARNESS` consumed incl. outbox observer; `[ESC-8-CORPUS]` for a coined-event/flow defect — never weaken; `[ESC-8-API]`/`[ESC-8-POLICY]`). Coins nothing.
- **Dependencies:** `Doc-8A Appendix A` (A/F); `Doc-4J`/`Doc-4L`. **Detail:** attestation + coverage + readiness register.

---

## Open Carried Items

| ID | Item | Doc-8F handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8F consumes the Doc-8B harness (outbox observer/drainer, mocked Inngest) | By pointer; re-authors nothing | **Consumed** |
| **F3 execution-deferred set** | Emitters/consumers are code (NOT STARTED); most Band-F runtime assertions await running modules | Authored now (oracle frozen), pointer-bound, flagged deferred; `core.outbox_events` mechanics + import-graph testable sooner; no silent omission | **No (tracked)** |
| `[ESC-8-CORPUS]` | A coined event / flow not in Doc-4J/Doc-4L, a genuine catalog defect, or a §8↔Doc-4J divergence | Flag-and-halt → Board additive patch at `Doc-4J`/`Doc-4L`; never coin an event | **Per-content: possible** |
| `[ESC-8-API]` / `[ESC-8-POLICY]` | Untestable surface / unregistered POLICY key | By pointer; named channel; never local | **Per-content: possible** |

## Fences / Out of scope

The harness (Doc-8B — consumed) · other disciplines' **primary** assertions (contract = 8C; persistence/RLS = 8D [8F cross-refs the static FK]; domain/invariant/firewall = 8E [8F composes the firewall/non-disclosure helpers]; frontend/e2e = 8G) · coining any event/payload field/consumer/expected value · changing any frozen `Doc-2 §8`/`Doc-4J`/`Doc-4L` declaration · weakening an assertion (`[ESC-8-CORPUS]` instead) · the implementation Code/emitters/consumers under test (downstream; F3 deferred).

---

## Provenance & status

- **Provenance:** first Doc-8F artifact, structure-frozen. Realizes `Doc-8A §8 + Band F`; consumes `Doc-8B` (outbox observer); oracle = `Doc-2 §8`/`Doc-4J`/`Doc-4L`/`core.outbox_events`. Independent Hard Review (1 MAJOR + 1 MINOR + 1 NIT; 1 REJECTED) + Structure Patch + short re-review + Structure Freeze Audit PASS. No frozen document edited; nothing coined.
- **Status:** **FROZEN v1.0** — structure only. F1 (catalog-inventory-driven), F2 (outbox-observer atomicity), F3 (execution-readiness); section map §0–§7.
- **Next:** Doc-8F content passes, each through the Board loop.

*End of Doc-8F Canonical Structure **v1.0 FROZEN**. On any conflict, `Doc-2 §8`/`Doc-4J`/`Doc-4L` + Doc-8A win; flag-and-halt — never weaken an assertion, never coin an event. Doc-8F realizes a catalog-inventory-driven integration/event-flow conformance suite; consumes the Doc-8B outbox observer; composes 8E/8D; coins nothing.*
