# Doc-8E — Domain, Invariant, Firewall & State-Machine Conformance Suite — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-8E artifact. Next: Independent Hard Review (Board) → Structure Patch → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Supersedes | — (first Doc-8E artifact) |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8E is the **Domain / Invariant / Firewall / State-Machine conformance suite** — the **defining suite** (Doc-8A cross-cutting allocation table) for the 5-signal firewall, the 12 Core Invariants, the moat, and the Doc-4M state machines. Consumes the frozen **Doc-8B harness** by pointer |
| Document | **Doc-8E** — realizes `Doc-8A §7` + Appendix A **Band D** (`CHK-8-030…033`) + **Band E** (`CHK-8-040…042`) as the executable suite that proves the governance *what* holds |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §7` + bands D/E. **Oracle (the *what*):** the **5 firewalled governance signals** + the **12 Core Invariants** + the **moat** (CLAUDE.md §4/§5; Doc-2) and the **Doc-4M** state machines (the authoritative lifecycle authority). Consumes `Doc-8B` (runner/fixtures/seeding/clock-ID/mock-boundary/CI-gate) by pointer |
| Authority | `Doc-8A` governs; the frozen corpus (CLAUDE.md §4/§5 / Doc-2 / Doc-4M) is the oracle. Doc-8E **coins nothing** and **asserts only corpus-declared governance behavior** — a red test = code defect, or `[ESC-8-CORPUS]` (a genuine corpus defect — never weaken the assertion) |
| Contains | Structure only — the ratified decisions (E1 defining-suite/assert-once; E2 oracle-frozen / enforcement-realization-deferred), the suite section map §0–§7, carried items. **No test code, no per-suite cases** — those land in the content passes |
| Audience | Architecture Board · Enterprise/DDD Architect · Security Architect · QA/Test lead · Doc-8E content authors |
| Program note | Doc-8E introduces **no signal, score, invariant, state, edge, or expected value**. It asserts the frozen governance rules + Doc-4M. On any gap: flag-and-halt → `[ESC-8-CORPUS]` (Board, additive patch at the owning doc) — never coin, never relax |

> **Governing rule:** Doc-8E realizes, never re-decides. The firewall, the 12 invariants, the moat, and the Doc-4M machines are FROZEN; Doc-8E realizes *how each is proven to hold*. Every assertion is an oracle-by-pointer into CLAUDE.md §4/§5 / Doc-2 / Doc-4M; no assertion is stricter or looser than the frozen rule (Doc-8A §3.3).

---

## Decisions proposed for ratification at structure freeze

- **E1 — Defining suite for governance conformance (assert-once; the Doc-8A allocation table).** Per the frozen Doc-8A cross-cutting conformance-concern allocation, **Doc-8E is the single defining suite** for: the 5-signal firewall (`CHK-8-030/031`), each Core Invariant (`CHK-8-032`), the moat (`CHK-8-033`), and Doc-4M state-machine conformance (`CHK-8-040…042`). **Composing suites invoke 8E's canonical assertions, never re-implement them:** Doc-8C invokes them where a signal/invariant crosses a contract; Doc-8F where a signal flows via an event; Doc-8G where an invariant surfaces in UI. 8E exports the canonical assertion helpers; the oracle is asserted **once** (the §6.4/§9.6 precedent).
- **E2 — Oracle frozen now; enforcement-realization may defer (the `CHK-8-031` precedent).** The governance *what* — the firewall rules, the 12 invariants, the moat, the Doc-4M machines — is **FROZEN**, so Doc-8E is **authored fully now**. But the *enforcement realization* an assertion runs against may not be frozen yet: e.g. the firewall's score-calc independence is enforced by **M5 / Doc-6G `trust`** (not yet frozen); a Doc-4M transition is performed by the owning module's **service/code** (NOT STARTED). Doc-8E therefore **authors the assertion intent now** (bound to the frozen rule) and marks each as **execution-ready** (oracle + enforcement both frozen) or **execution-deferred** (oracle frozen, enforcement-realization pending its owning Doc-6x/code). No assertion is dropped for being deferred — it is authored, pointer-bound, and scheduled (no silent omission).

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding
- **Purpose:** Doc-8E's place (below Doc-8A; consumes Doc-8B by pointer; the **defining suite** 8C/8F/8G compose); realize-never-redecide; oracle = CLAUDE.md §4/§5 / Doc-2 / Doc-4M; freeze obligation — pass Appendix A **Bands D + E** (+ Band A oracle-by-pointer) and clear any `[ESC-8-*]` via its named channel; never weaken (`[ESC-8-CORPUS]` for a genuine corpus defect).
- **Dependencies:** `Doc-8A §0/§7/Appendix A`; `Doc-8B`; `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope & the Governance-Conformance Registry
- **Purpose:** enumerate the conformance targets **by pointer** (reference-never-restate): the **5 firewalled signals** (Trust / Capacity / Financial Tier / Performance / Buyer Vendor Status — CLAUDE.md §4), the **12 Core Invariants** (CLAUDE.md §5), the **moat** (governed M3 matching/routing + M4 post-award/CRM), and the **Doc-4M state machines** (RFQ, quotation, verification, subscription, post-award docs, …). Each registry row: target, owning-rule pointer, owning-enforcement module (for E2 execution-readiness), defining-vs-composing. The registry is the spine §2–§5 realize.
- **Dependencies:** CLAUDE.md §4/§5; `Doc-2 §5`; `Doc-4M`. **Detail:** registry + pointers + execution-readiness flag.

## §2 — Firewall Non-Cross-Mutation Suites *(`CHK-8-030/031`)*
- **Purpose:** realize the firewall conformance (CLAUDE.md §4): a suite per rule asserting **non-cross-mutation** — Financial Tier never raises Trust; Financial Tier does not affect Performance; Buyer Approved/Blacklisted never mutates platform-wide scores; no secondary signal dominates trust; no single signal dominates a matching decision; scores **auto-calculated under the System actor, never hand-edited** (a non-System write rejected — oracle CLAUDE.md §4 + M5/Doc-6G enforcement; audit `actor_type` corroborates per `Doc-6A §8`). **Assertion shape:** vary signal A (input), assert signal B (output) **independent** — exercise the owning score-calc service with controlled inputs. E2: oracle frozen; execution-deferred until M5/Doc-6G freezes.
- **Dependencies:** CLAUDE.md §4; `Doc-6A §8` (audit actor); M5/Doc-6G (enforcement — E2). **Detail:** firewall assertion shape; vary-A-assert-B-independent.

## §3 — The 12 Core Invariant Suites *(`CHK-8-032`)*
- **Purpose:** realize one suite per Core Invariant (CLAUDE.md §5), each bound to its owning declaration by pointer: capability 4-flag matrix not label (#1); two role dimensions (#2); vendor claim-lifecycle + visibility scope `buyer_private`|`public` (#3); RFQ state machine + control plane (#4 → §5); Users-Act/Orgs-Own (#5); firewall (#6 → §2); One-Module-One-Owner (#7); nothing authoritative overwritten/hard-deleted (#8 — cross-ref Doc-8D persistence); Content≠Presentation (#9 — cross-ref Doc-8G UI); Financial Tier ≠ Subscription Plan (#10); private exclusion stays private (#11 — cross-ref Doc-8D byte-equivalence); AI suggests/modules decide (#12). Each suite asserts the invariant **holds**; cross-refs name the composing layer where an invariant is also exercised.
- **Dependencies:** CLAUDE.md §5; Doc-2 (owning declarations); cross-refs to Doc-8D/8G. **Detail:** per-invariant assertion + cross-ref map.

## §4 — Moat Exercise *(`CHK-8-033`)*
- **Purpose:** assert the moat is exercised end-to-end: governed M3 matching/routing/sorting/scoring (`Doc-5E`) + M4 post-award document workflow & vendor CRM (`Doc-5F`). The suite asserts M3's **governed output** is produced and **never re-ranked** outside M3 (the matching authority); M4 post-award + buyer-private CRM behave per the frozen contracts. E2: execution against the M3/M4 realizations (Doc-6/code — deferred where not frozen).
- **Dependencies:** `Doc-5E`/`Doc-5F`; CLAUDE.md §1 (moat). **Detail:** moat-exercise assertion.

## §5 — Doc-4M State-Machine Conformance *(`CHK-8-040…042`)*
- **Purpose:** realize the state-machine suite (Doc-4M — the authoritative lifecycle authority): a suite per machine asserting (a) every **permitted** transition for the permitted actor in the permitted source state **succeeds** (`CHK-8-040`); (b) every **illegal** transition (wrong edge / wrong actor / wrong source state) is **rejected** (`CHK-8-041`); (c) **optimistic-UI reconciliation converges to server-authoritative** state (`CHK-8-042` — cross-ref Doc-8G). No state label or edge exists that Doc-4M does not declare. **Coverage:** every Doc-4M machine + every declared edge has a permitted-case and the illegal-cases around it. E2: execution against the owning module's transition service (deferred where not frozen).
- **Dependencies:** `Doc-4M` (state authority); the frozen `Doc-5x` command contracts driving transitions; cross-ref Doc-8G (optimistic UI). **Detail:** permitted/illegal/convergence assertion + edge coverage.

## §6 — Defining-Suite Composition & the Assert-Once Contract *(E1 — mechanism)*
- **Purpose:** realize E1: Doc-8E **exports canonical assertion helpers** (firewall-independence, invariant-holds, transition-permitted/rejected); composing suites (8C/8F/8G) **import and invoke** them at their layer — never author a second copy. State the allocation: 8E **defines**, 8C/8F/8G **compose**; a divergent re-implementation in a composing suite is a defect. The §6.4/§9.6 (byte-equivalence) precedent generalized to governance.
- **Dependencies:** `Doc-8A` allocation table; `Doc-8C`/`Doc-8F`/`Doc-8G`. **Detail:** export/invoke contract; assert-once.

## §7 — Conformance & Carried Items
- **Purpose:** Doc-8E's self-check against Appendix A **Bands A + D + E**; the **coverage attestation** (every signal/invariant/moat-element/Doc-4M-machine has a defining assertion; each flagged execution-ready or execution-deferred per E2, none silently dropped); the carried register (`DR-8-STATE` it satisfies — Doc-4M drives the state suites; `[ESC-8-CORPUS]` for a genuine corpus defect — never weaken; `[ESC-8-API]`/`[ESC-8-POLICY]`). Coins nothing.
- **Dependencies:** `Doc-8A Appendix A` (A/D/E); CLAUDE.md §4/§5; `Doc-4M`. **Detail:** attestation + coverage + execution-readiness register.

---

## Open Carried Items

| ID | Item | Doc-8E handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8E consumes the Doc-8B harness | By pointer; re-authors nothing | **Consumed** |
| **DR-8-STATE** | Doc-4M state machines drive the state suites | Doc-8E **is** the state-machine defining suite (§5); bound by pointer; no edge coined | **Satisfied here** |
| **E2 execution-deferred set** | Assertions whose enforcement-realization (M5/Doc-6G, owning module services/code) is not yet frozen | Authored now (oracle frozen), pointer-bound, flagged execution-deferred; scheduled when the owning Doc-6x/code freezes; **no silent omission** | **No (tracked, not a gate)** |
| `[ESC-8-CORPUS]` | A test reveals a genuine governance/corpus defect | Flag-and-halt → Board additive patch at the owning doc; test never weakened | **Per-content: possible** |
| `[ESC-8-API]` / `[ESC-8-POLICY]` | Untestable contract / unregistered POLICY key | By pointer; named channel; never local | **Per-content: possible** |

## Fences / Out of scope

The harness (Doc-8B — consumed) · other disciplines' **primary** assertions (contract = 8C; persistence/RLS = 8D; integration/event = 8F; frontend/e2e = 8G — they **compose** 8E's helpers, 8E does not author their primary checks) · coining any signal/score/invariant/state/edge/expected value · changing any frozen CLAUDE.md §4/§5 / Doc-2 / Doc-4M declaration · weakening an assertion (`[ESC-8-CORPUS]` instead) · the implementation Code/enforcement under test (downstream; E2 execution-deferred).

---

## Provenance & next steps

- **Provenance:** first Doc-8E artifact. Realizes `Doc-8A §7 + bands D/E`; consumes `Doc-8B`; oracle = CLAUDE.md §4/§5 / Doc-2 / Doc-4M. No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. E1 (defining-suite/assert-once), E2 (oracle-frozen / enforcement-deferred); section map §0–§7; carried items registered.
- **Next in the lifecycle (Board loop):** Independent Hard Review → Structure Patch → short re-review → Structure Freeze Audit → `Doc-8E_Structure_v1.0_FROZEN` → Doc-8E content passes. Oracle-ready now (the governance *what* is FROZEN); execution of the deferred set follows the owning module realizations.

*End of Doc-8E Canonical Structure **Proposal v0.1** — structure only. On any conflict, the frozen corpus (CLAUDE.md §4/§5 / Doc-2 / Doc-4M) + Doc-8A win; flag-and-halt — never weaken an assertion. Doc-8E is the defining suite for the firewall + 12 invariants + moat + Doc-4M machines; consumes the Doc-8B harness; coins nothing. Next: Independent Hard Review.*
