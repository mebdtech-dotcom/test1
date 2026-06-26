# Doc-8E — Domain, Invariant, Firewall & State-Machine Conformance Suite — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26). Effective = `Doc-8E_Structure_Proposal_v0.1` + `Doc-8E_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8E = the **defining suite** (Doc-8A allocation table) for the 5-signal firewall, the 12 Core Invariants, the moat, and the Doc-4M state machines. Consumes the frozen **Doc-8B harness** by pointer |
| Document | **Doc-8E** — realizes `Doc-8A §7` + Appendix A **Band D** (`CHK-8-030…033`) + **Band E** (`CHK-8-040…042`) as the suite that proves the governance *what* holds |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §7` + bands D/E. **Oracle:** the 5 firewalled signals + 12 Core Invariants + moat (CLAUDE.md §4/§5; Doc-2) + the Doc-4M state machines. Consumes `Doc-8B` by pointer |
| Authority | `Doc-8A` governs; the frozen corpus is the oracle. Doc-8E **coins nothing** and **asserts only corpus-declared governance behavior** — a red test = code defect, or `[ESC-8-CORPUS]` (genuine corpus defect — never weaken) |
| Contains | Structure only — E1 (defining-suite/assert-once) + E2 (oracle-frozen/enforcement-deferred), §0–§7, carried items. **No test code** — content passes realize the conventions |
| Program note | Doc-8E introduces **no signal, score, invariant, state, edge, or expected value**. On any gap: flag-and-halt → `[ESC-8-CORPUS]` (Board, additive patch) — never coin, never relax |

> **Governing rule:** realize, never re-decide. The firewall, the 12 invariants, the moat, and the Doc-4M machines are FROZEN; Doc-8E realizes *how each is proven to hold*. Every assertion is an oracle-by-pointer; no assertion stricter or looser than the frozen rule (Doc-8A §3.3).

---

## Ratified decisions

- **E1 — Defining suite for governance conformance (assert-once).** Per the frozen Doc-8A cross-cutting allocation, **Doc-8E is the single defining suite** for the firewall (`CHK-8-030/031`), each invariant (`CHK-8-032`), the moat (`CHK-8-033`), and Doc-4M state-machine conformance (`CHK-8-040…042`). **8E exports canonical assertion helpers; composing suites invoke them, never re-implement:** Doc-8C where a signal/invariant crosses a contract; Doc-8F where a signal flows via an event; Doc-8G where an invariant surfaces in UI. The oracle is asserted **once** (the §6.4/§9.6 precedent).
- **E2 — Oracle frozen now; enforcement-realization may defer.** The governance *what* is FROZEN, so Doc-8E is **authored fully now**. But the *enforcement realization* an assertion runs against may not be frozen (firewall score-calc → M5/Doc-6G `trust`, not yet frozen; a Doc-4M transition → the owning module's service/code, NOT STARTED). Each assertion is flagged **execution-ready** (oracle + enforcement both frozen — e.g. an invariant enforced by a frozen Doc-6B/6C trigger) or **execution-deferred** (oracle frozen, enforcement pending its owning Doc-6x/code). **No assertion is dropped for being deferred** — authored, pointer-bound, scheduled (no silent omission).

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding
- **Purpose:** Doc-8E's place (below Doc-8A; consumes Doc-8B by pointer; the defining suite 8C/8F/8G compose); realize-never-redecide; oracle = CLAUDE.md §4/§5 / Doc-2 / Doc-4M; freeze obligation — pass Appendix A **Bands A + D + E** and clear any `[ESC-8-*]`; never weaken (`[ESC-8-CORPUS]`).
- **Dependencies:** `Doc-8A §0/§7/Appendix A`; `Doc-8B`; `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope & the Governance-Conformance Registry
- **Purpose:** enumerate the targets **by pointer**: the 5 firewalled signals (Trust / Capacity / Financial Tier / Performance / Buyer Vendor Status — CLAUDE.md §4), the 12 Core Invariants (CLAUDE.md §5), the moat (M3 matching/routing + M4 post-award/CRM), the Doc-4M state machines. Each registry row: target, owning-rule pointer, owning-enforcement module (E2 execution-readiness), defining-vs-composing.
- **Dependencies:** CLAUDE.md §4/§5; `Doc-2 §5`; `Doc-4M`. **Detail:** registry + pointers + execution-readiness flag.

## §2 — Firewall Non-Cross-Mutation & Non-Dominance Suites *(`CHK-8-030/031`)*
- **Purpose:** realize the firewall conformance (CLAUDE.md §4) with **two assertion shapes**, one per rule class:
  - **(a) Non-cross-mutation** (Financial Tier never raises Trust; Financial Tier doesn't affect Performance; Buyer status never mutates platform scores; scores auto-calculated under System, never hand-edited) — **vary signal A (input), assert signal B (output) independent**; a non-System write to a score rejected (oracle CLAUDE.md §4 + M5/Doc-6G; audit `actor_type` corroborates — `Doc-6A §8`).
  - **(b) Non-dominance** (no secondary signal dominates trust; no single signal dominates a matching decision) — a property of a **weighted decision**, asserted as **maxed-signal-non-determinative**: max/extreme one signal, assert the decision **still depends on the others** (no single signal unilaterally flips the outcome / reaches an effective weight of 1.0), bound to the **frozen scoring rules** — trust-scoring composition (`Doc-4G`/M5) + M3 matching scoring (`Doc-3`/`Doc-4E`).
  Both E2 execution-deferred until M5/M3 freeze; the **shape** is authored now.
- **Dependencies:** CLAUDE.md §4; `Doc-4G`/`Doc-3`/`Doc-4E` (scoring); `Doc-6A §8`; M5/Doc-6G (E2). **Detail:** two firewall assertion shapes.

## §3 — The 12 Core Invariant Suites *(`CHK-8-032`)*
- **Purpose:** one suite per invariant (CLAUDE.md §5), bound by pointer: capability 4-flag matrix not label (#1); two role dimensions (#2); claim-lifecycle + visibility scope (#3); **#4 RFQ = state machine (→ §5) + control plane routing/throttling/sorting/scoring (→ §4 moat + §2(b) non-dominance)**; Users-Act/Orgs-Own (#5); firewall (#6 → §2); One-Module-One-Owner (#7); nothing overwritten/hard-deleted (#8 — cross-ref Doc-8D persistence); Content≠Presentation (#9 — cross-ref Doc-8G); Financial Tier ≠ Subscription Plan (#10); private exclusion stays private (#11 — cross-ref Doc-8D byte-equivalence); AI suggests/modules decide (#12). Each asserts the invariant **holds**; cross-refs name the composing layer.
- **Dependencies:** CLAUDE.md §5; Doc-2; cross-refs Doc-8D/8G. **Detail:** per-invariant assertion + cross-ref map.

## §4 — Moat Exercise *(`CHK-8-033`)*
- **Purpose:** assert the moat end-to-end: governed M3 matching/routing/sorting/scoring (`Doc-5E`) + M4 post-award + buyer-private CRM (`Doc-5F`); M3's **governed output** is produced and **never re-ranked outside M3**; M4 behaves per the frozen contracts. E2 execution against M3/M4 realizations (deferred where not frozen).
- **Dependencies:** `Doc-5E`/`Doc-5F`; CLAUDE.md §1. **Detail:** moat-exercise assertion.

## §5 — Doc-4M State-Machine Conformance *(`CHK-8-040…042`)*
- **Purpose:** a suite per Doc-4M machine: (a) every **permitted** transition (right actor, right source) **succeeds** (`CHK-8-040`); (b) every **illegal** transition (wrong edge/actor/source) **rejected** (`CHK-8-041`); (c) `CHK-8-042` (optimistic-UI converges) — **8E defines** the convergence rule (server state authoritative; oracle Doc-4M); **Doc-8G executes/composes** it at the UI layer (define-here, execute-in-8G — E1). No state/edge exists that Doc-4M does not declare; **coverage:** every machine + every declared edge has a permitted-case + the illegal-cases around it. E2 execution against the owning transition service (deferred where not frozen).
- **Dependencies:** `Doc-4M`; the frozen `Doc-5x` command contracts; cross-ref Doc-8G. **Detail:** permitted/illegal/convergence + edge coverage.

## §6 — Defining-Suite Composition & the Assert-Once Contract *(E1)*
- **Purpose:** Doc-8E **exports canonical assertion helpers** (firewall-independence, non-dominance, invariant-holds, transition-permitted/rejected); composing suites (8C/8F/8G) **import and invoke** them at their layer — never a second copy; a divergent re-implementation in a composing suite is a defect. The §6.4/§9.6 byte-equivalence precedent generalized to governance.
- **Dependencies:** `Doc-8A` allocation; `Doc-8C`/`Doc-8F`/`Doc-8G`. **Detail:** export/invoke contract.

## §7 — Conformance & Carried Items
- **Purpose:** self-check against Appendix A **Bands A + D + E**; **coverage attestation** (every signal/invariant/moat-element/Doc-4M-machine has a defining assertion; each flagged execution-ready or execution-deferred per E2, none silently dropped); carried register (`DR-8-STATE` satisfied — 8E is the state-machine defining suite; `[ESC-8-CORPUS]` never-weaken; `[ESC-8-API]`/`[ESC-8-POLICY]`). Coins nothing.
- **Dependencies:** `Doc-8A Appendix A` (A/D/E); CLAUDE.md §4/§5; `Doc-4M`. **Detail:** attestation + coverage + execution-readiness register.

---

## Open Carried Items

| ID | Item | Doc-8E handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8E consumes the Doc-8B harness | By pointer; re-authors nothing | **Consumed** |
| **DR-8-STATE** | Doc-4M drives the state suites | Doc-8E **is** the state-machine defining suite (§5); by pointer; no edge coined | **Satisfied here** |
| **E2 execution-deferred set** | Assertions whose enforcement-realization (M5/Doc-6G, owning services/code) is not yet frozen | Authored now (oracle frozen), pointer-bound, flagged execution-deferred; scheduled when the owning Doc-6x/code freezes; no silent omission | **No (tracked)** |
| `[ESC-8-CORPUS]` | A test reveals a genuine governance/corpus defect | Flag-and-halt → Board additive patch; test never weakened | **Per-content: possible** |
| `[ESC-8-API]` / `[ESC-8-POLICY]` | Untestable contract / unregistered POLICY key | By pointer; named channel; never local | **Per-content: possible** |

## Fences / Out of scope

The harness (Doc-8B — consumed) · other disciplines' **primary** assertions (contract = 8C; persistence/RLS = 8D; integration/event = 8F; frontend/e2e = 8G — they compose 8E's helpers) · coining any signal/score/invariant/state/edge/expected value · changing any frozen CLAUDE.md §4/§5 / Doc-2 / Doc-4M declaration · weakening an assertion (`[ESC-8-CORPUS]` instead) · the implementation Code/enforcement under test (downstream; E2 execution-deferred).

---

## Provenance & status

- **Provenance:** first Doc-8E artifact, structure-frozen. Realizes `Doc-8A §7 + bands D/E`; consumes `Doc-8B`; oracle = CLAUDE.md §4/§5 / Doc-2 / Doc-4M. Independent Hard Review (1 MAJOR + 2 MINOR; 1 REJECTED) + Structure Patch + short re-review + Structure Freeze Audit PASS. No frozen document edited; nothing coined.
- **Status:** **FROZEN v1.0** — structure only. E1 (defining-suite/assert-once), E2 (oracle-frozen/enforcement-deferred); section map §0–§7.
- **Next:** Doc-8E content passes, each through the Board loop.

*End of Doc-8E Canonical Structure **v1.0 FROZEN**. On any conflict, the frozen corpus (CLAUDE.md §4/§5 / Doc-2 / Doc-4M) + Doc-8A win; flag-and-halt — never weaken an assertion. Doc-8E is the defining suite for the firewall + 12 invariants + moat + Doc-4M machines; consumes the Doc-8B harness; coins nothing.*
