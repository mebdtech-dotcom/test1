# Doc-8E — Domain/Invariant/Firewall/State-Machine Conformance Suite — Content v1.0 **Pass-1 (§0–§3)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§3 of `Doc-8E_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§4–§7) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8E_Structure_v1.0_FROZEN` §0–§3: control · governance-conformance registry · firewall suites · 12 invariant suites |
| Authority | `Doc-8A §7` + bands A/D/E; oracle = CLAUDE.md §4/§5 / Doc-2 / Doc-4M; consumes `Doc-8B` by pointer |
| Coins | **Nothing.** Targets/rules by pointer; snippets illustrative |
| Binding vs choice | Convention tracing to the oracle = **[binding]**; physical specific = **[Doc-8E choice]**. Code illustrates; the convention binds. |

> **Scope of this pass:** control/precedence + Bands A/D/E gate (§0), the governance-conformance registry (§1), the firewall non-cross-mutation + non-dominance suites (§2), and the 12 Core Invariant suites (§3). §4–§7 (moat, state-machine, composition, conformance) land in Pass-2.

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding

Doc-8E sits at: `… → Doc-8A → (Doc-8B harness) → **Doc-8E** → asserts the frozen governance rules + Doc-4M`. It **realizes** `Doc-8A §7` as the **defining suite** (E1) and **passes Appendix A Bands A + D + E** (`CHK-8-001…003`; `CHK-8-030…033`; `CHK-8-040…042`) before content freeze. Realize-never-redecide: every assertion is an **oracle-by-pointer** into CLAUDE.md §4/§5 / Doc-2 / Doc-4M; **no assertion stricter or looser** than the frozen rule (`Doc-8A §3.3`). A red test = code/enforcement defect, or `[ESC-8-CORPUS]` (a genuine corpus defect — flag-and-halt) — **never weaken** (`Doc-8A §3.4`). Consumes the **Doc-8B** harness by pointer. Coins nothing.

## §1 — Scope & the Governance-Conformance Registry

**[binding]** The suite's spine is the **governance-conformance registry** — every conformance target enumerated **by pointer** (reference-never-restate), each row carrying its execution-readiness (E2). Row schema **[Doc-8E choice — columns; values [binding] from the oracle]**:

| Field | Source |
|---|---|
| `target` | a firewall rule / Core Invariant / moat element / Doc-4M machine |
| `oracle` | the frozen pointer (CLAUDE.md §4/§5 · Doc-2 · Doc-4M · Doc-4G/Doc-3/Doc-4E scoring) |
| `class` | `firewall-noncross` \| `firewall-nondom` \| `invariant` \| `moat` \| `state-machine` |
| `enforcement_module` | the module whose realization enforces it (M5/Doc-6G · the owning service · a frozen Doc-6 trigger) |
| `execution` | `ready` (oracle + enforcement frozen) \| `deferred` (oracle frozen, enforcement pending) — E2 |
| `role` | `defining` (8E) \| names the composing suite (8C/8F/8G) that invokes 8E's helper |

The registry covers: **5 firewall rules** (3 non-cross-mutation + 2 non-dominance — CLAUDE.md §4), **12 invariants** (CLAUDE.md §5), the **moat** (Doc-5E/5F), and **every Doc-4M machine**. A target with no row is a coverage gap the §7 attestation detects.

## §2 — Firewall Non-Cross-Mutation & Non-Dominance Suites *(`CHK-8-030/031`)*

The firewall (CLAUDE.md §4) has **two rule classes**, each with its own assertion shape.

### §2.1 Non-cross-mutation *(`CHK-8-030/031`; vary-A-assert-B)*
**[binding CLAUDE.md §4]** Rules: Financial Tier **never raises** Trust; Financial Tier **does not affect** Performance; Buyer Approved/Blacklisted **never mutates** platform-wide scores; scores **auto-calculated under the System actor, never hand-edited**. **Assertion shape:** drive a change in signal A (input) through the owning score-calc service; assert signal B (output) is **independent** (unchanged-by-A). For the System-actor rule: a non-System write to a score table is **rejected** (oracle CLAUDE.md §4 + M5/Doc-6G enforcement; the `core.audit_records.actor_type = 'system'` corroborates — `Doc-6A §8`, **corroboration not enforcement**). E2: `deferred` until M5/Doc-6G.

```ts
// illustrative; convention [CLAUDE.md §4 binding]; vary A, assert B independent
export const firewallNonCross = (A, B) => ({ id: 'CHK-8-030', class: 'firewall-noncross', run: (ctx) => {
  const before = readScore(B, ctx); mutateSignal(A, ctx); recalc(ctx)
  expectUnchanged(readScore(B, ctx), before)        // B independent of A — oracle CLAUDE.md §4
}})
```

### §2.2 Non-dominance *(`CHK-8-031`; maxed-signal-non-determinative)*
**[binding CLAUDE.md §4 + frozen scoring]** Rules: **no secondary signal dominates trust**; **no single signal dominates a matching decision** — properties of a **weighted decision**. **Assertion shape:** max/extreme **one** signal and assert the decision **still depends on the others** — a single signal cannot unilaterally flip the outcome or reach an effective weight of 1.0. Bound to the **frozen scoring rules**: trust-scoring composition (`Doc-4G`/M5) + M3 matching scoring (`Doc-3`/`Doc-4E`). The suite asserts the property of the frozen scoring rule; it invents no weight. E2: `deferred` until M5/M3.

```ts
// illustrative; convention [CLAUDE.md §4 + Doc-4G/Doc-3/Doc-4E binding]; maxed signal is not determinative
export const firewallNonDom = (signal, decision) => ({ id: 'CHK-8-031', class: 'firewall-nondom', run: (ctx) => {
  const baseline = decide(decision, ctx)
  maxSignal(signal, ctx)                              // extreme one signal
  expectStillDependsOnOthers(decide(decision, ctx), baseline, ctx)  // not unilaterally flipped — frozen scoring
}})
```

## §3 — The 12 Core Invariant Suites *(`CHK-8-032`)*

**[binding CLAUDE.md §5]** One suite per invariant, each asserting the invariant **holds**, bound by pointer; cross-refs name the composing layer where an invariant is also exercised. The canonical assertion lives here (E1); 8C/8F/8G invoke it.

| # | Invariant | Assertion (oracle-by-pointer) | Cross-ref |
|---|---|---|---|
| 1 | Capability = 4-flag matrix, not label | a vendor capability is the matrix (`can_supply`/`can_service`/`can_fabricate`/`can_consult`), never a single label | Doc-8C (contract shape) |
| 2 | Two role dimensions | Platform Participation (Buyer/Vendor/Hybrid/Staff) ≠ Org Role (Owner/Director/Manager/Officer) | Doc-8C |
| 3 | Claim-lifecycle + visibility scope | vendor records carry claim lifecycle + `buyer_private`\|`public` | Doc-8D (persistence) |
| 4 | RFQ state machine + control plane | **state machine → §5 (Doc-4M); control plane (routing/throttling/sorting/scoring) → §4 (moat) + §2.2 (non-dominance)** | §5/§4/§2.2 |
| 5 | Users Act, Orgs Own | every user ≥1 org; every business record in an org; server-validated active-org (client org id never trusted) | Doc-8C (actor-scope), Doc-8D (RLS) |
| 6 | Governance signals firewalled | → §2 | §2 |
| 7 | One Module, One Owner | no cross-module table access; refs by ID only | Doc-8F (integration boundary) |
| 8 | Nothing overwritten/hard-deleted | versioned/soft-delete/immutable-audit; IDs never reused | Doc-8D (frozen Doc-6B/6C triggers — **execution-ready**) |
| 9 | Content ≠ Presentation | authoritative content ≠ presentation | Doc-8G (UI) |
| 10 | Financial Tier ≠ Subscription Plan | capability tier ≠ commercial plan | Doc-8C |
| 11 | Private exclusion stays private | blacklist undetectable; byte-equivalent | Doc-8D (byte-equivalence defining), Doc-8G (UI) |
| 12 | AI suggests; modules decide | AI advisory, non-authoritative, non-gating | Doc-8F/Doc-8G |

**Execution-readiness [E2]:** #8 is **execution-ready** now (enforced by frozen Doc-6B/6C immutability triggers); most others are **deferred** until their enforcement module/code freezes. Each row flagged in the registry (§1); none dropped.

---

## Pass-1 self-check (pre-review)

- **Reference-never-restate:** CLAUDE.md §4 (firewall, 2 classes) / §5 (12 invariants); `Doc-4G`/`Doc-3`/`Doc-4E` (scoring, non-dominance); `Doc-6A §8` (audit corroboration); `Doc-6B`/`6C` (frozen triggers — #8 execution-ready); `Doc-4M` (#4 state); `Doc-8A §7/§3.x` + bands A/D/E; `Doc-8B`. **Nothing invented.**
- **Both firewall classes realized:** §2.1 non-cross-mutation (vary-A-assert-B) + §2.2 non-dominance (maxed-signal-non-determinative vs frozen scoring) — the structure MAJOR fix carried.
- **E1/E2 honored:** §3 canonical assertions defined here, cross-refs name composers; execution-ready (#8) vs deferred flagged, none dropped.
- **Binding vs choice tagged; coins nothing:** 0 new signal/score/invariant/state/edge/expected value.
- **Open for review:** confirm #4's three-way split (state §5 / moat §4 / non-dominance §2.2) is complete; confirm #8 execution-readiness against the frozen Doc-6B/6C triggers is correctly a Doc-8D-composed (not 8E-executed) assertion.

*End of Content Pass-1 (§0–§3) — DRAFT. Realizes `Doc-8E_Structure_v1.0_FROZEN` §0–§3. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§4–§7).*
