# Doc-8E — Domain/Invariant/Firewall/State-Machine Conformance Suite — Content v1.0 **Pass-2 (§4–§7)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §4–§7 of `Doc-8E_Structure_v1.0_FROZEN`. Final Doc-8E content pass. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8E_Structure_v1.0_FROZEN` §4–§7: moat exercise · Doc-4M state-machine conformance · defining-suite composition · conformance/carried |
| Authority | `Doc-8A §7` + bands A/D/E; oracle = Doc-2 / Doc-4M / CLAUDE.md §1/§4/§5; consumes `Doc-8B` by pointer |
| Coins | **Nothing.** Targets/rules/edges by pointer; snippets illustrative |
| Binding vs choice | Convention tracing to the oracle = **[binding]**; physical specific = **[Doc-8E choice]**. |

> **Scope of this pass:** the moat exercise (§4, `CHK-8-033`), Doc-4M state-machine conformance (§5, `CHK-8-040…042`), the defining-suite composition / assert-once contract (§6, E1), and Doc-8E's conformance attestation + carried register (§7). With Pass-1 (§0–§3) this completes Doc-8E content.

---

## §4 — Moat Exercise *(`CHK-8-033`)*

**[binding CLAUDE.md §1 / Doc-5E / Doc-5F]** The moat is the governed **M3** RFQ matching/routing/sorting/scoring + **M4** post-award document workflow & buyer-private CRM. The suite asserts:

- **M3 governed output is produced** — an RFQ run through the frozen M3 pipeline (`Doc-5E`) yields the **governed** match/route/sort/score result per the frozen rules.
- **Never re-ranked outside M3** — no consumer (UI, another module) re-orders the M3 result; the displayed/consumed ordering **is** M3's output (Invariant: matching authority is M3; the Doc-7 R5 "display sort is presentation over the contract result, never a re-rank" — cross-ref Doc-8G). The suite asserts a consumer cannot alter the governed ranking.
- **M4 post-award + buyer-private CRM** behave per the frozen contracts (`Doc-5F`): the post-award document lifecycle + the buyer-private vendor status (never platform-wide — Invariant #11, cross-ref §3/Doc-8D).
- **E2:** execution against the M3/M4 realizations (Doc-6E…/code) — **deferred** where not frozen; the assertion shape + oracle are authored now.

```ts
// illustrative; convention [Doc-5E/Doc-5F binding]; M3 governed output, never re-ranked
export const moatExercise = { id: 'CHK-8-033', class: 'moat', execution: 'deferred', run: (ctx) => {
  const governed = runM3Pipeline(rfq, ctx)                 // Doc-5E governed match/route/sort/score
  expectGovernedOutput(governed, Doc5E_rules)
  expectNoReRankByConsumer(governed, ctx)                  // matching authority = M3 (cross-ref Doc-8G display)
  expectM4PostAwardPerContract(ctx)                        // Doc-5F lifecycle + buyer-private CRM
}}
```

## §5 — Doc-4M State-Machine Conformance *(`CHK-8-040…042`)*

**[binding Doc-4M]** One suite per Doc-4M machine (RFQ, quotation, verification, subscription, post-award documents, …). `DR-8-STATE` is satisfied here — 8E is the state-machine defining suite.

- **Permitted transitions succeed (`CHK-8-040`):** every Doc-4M-declared edge, for the **permitted actor** in the **permitted source state**, succeeds.
- **Illegal transitions rejected (`CHK-8-041`):** every wrong edge / wrong actor / wrong source state is **rejected**; no state label or edge exists that Doc-4M does not declare (a transition to an undeclared state = code defect; an undeclared edge in the test = coined, forbidden).
- **Optimistic-UI convergence (`CHK-8-042`) — define-here, execute-in-8G [E1]:** 8E **defines** the convergence rule — **the server state is authoritative; the optimistic UI reconciles to it** (oracle Doc-4M); **Doc-8G executes/composes** it at the UI layer. 8E exports the convergence assertion; 8G invokes it after an optimistic update.
- **Edge coverage [binding]:** the suite enumerates **every Doc-4M machine × every declared edge** — each edge has a permitted-case (`CHK-8-040`) and the illegal-cases around it (`CHK-8-041`). A machine/edge with no case is a coverage gap the §7 attestation detects (against the frozen Doc-4M edge set).
- **E2:** execution against the owning module's transition service — **deferred** where not frozen; the edge enumeration + assertion shapes are authored now.

```ts
// illustrative; convention [Doc-4M binding]; permitted succeeds / illegal rejected; edge coverage vs frozen Doc-4M
export const stateMachineSuite = (machine) => Doc4M(machine).edges.flatMap((e) => [
  { id: 'CHK-8-040', run: (ctx) => expectTransitionSucceeds(e.from, e.via, e.actor, ctx) },     // permitted
  { id: 'CHK-8-041', run: (ctx) => { expectRejected(wrongActor(e), ctx); expectRejected(wrongSource(e), ctx) } },
])
// CHK-8-042 convergence helper exported here; executed by Doc-8G after an optimistic update
export const expectOptimisticConverges = (machine, ctx) => expectUIReconcilesToServer(machine, ctx)  // Doc-4M authoritative
```

## §6 — Defining-Suite Composition & the Assert-Once Contract *(E1)*

**[binding Doc-8A allocation table]** Doc-8E **exports canonical assertion helpers** — `firewallNonCross`, `firewallNonDom`, `invariantHolds(#n)`, `stateMachineSuite`, `expectOptimisticConverges`; composing suites **import and invoke** them at their layer; **none re-implements**:

| Helper | Composing invoker(s) |
|---|---|
| `firewallNonCross` / `firewallNonDom` | Doc-8C (signal crosses a contract) · Doc-8F (signal flows via event) |
| `invariantHolds(#n)` | Doc-8C (#1/#2/#5/#10) · Doc-8F (#7/#12) · Doc-8G (#9/#12) |
| `stateMachineSuite` | Doc-8C/8F (transition-triggering contracts/events) |
| `expectOptimisticConverges` | Doc-8G (after an optimistic UI update) |
| **8D-defined, 8E-references** (#8 immutability, #11 byte-equivalence) | 8E invokes **Doc-8D's** `CHK-8-022`/`CHK-8-024` (direction inverted — Pass-1 §3) |

A divergent re-implementation in a composing suite is a defect (assert-once — the §6.4/§9.6 precedent generalized). The oracle is asserted **once**; composers invoke.

## §7 — Conformance & Carried Items

**Doc-8E conformance attestation:**

| Band | Disposition |
|---|---|
| **A** — oracle-by-pointer | **realizes by design** — every assertion binds CLAUDE.md §4/§5 / Doc-2 / Doc-4M / Doc-4G/Doc-3/Doc-4E by pointer; none stricter/looser; red = code/enforcement or `[ESC-8-CORPUS]`, never weakened |
| **D** — invariant/firewall (`CHK-8-030…033`) | **realizes by design** — firewall non-cross-mutation (§2.1) + non-dominance (§2.2); 12-invariant suites (§3, #8/#11 → 8D-defined); moat (§4) |
| **E** — state-machine (`CHK-8-040…042`) | **realizes by design** — permitted/illegal/edge-coverage (§5); convergence defined here, executed in 8G |
| **B/C/F/G/H/I** | **N/A** — contract (8C) · persistence/RLS (8D) · integration/event (8F) · frontend/e2e (8G) · harness (8B); they **compose** 8E's helpers |

**Coverage attestation [binding]:** every firewall rule (5), Core Invariant (12), moat element, and Doc-4M machine×edge has a defining (or 8D-defined-referenced) assertion in the registry (§1); each flagged **execution-ready** (#8 now via frozen Doc-6B/6C triggers) or **execution-deferred** (firewall/scoring → M5/M3; transitions → owning services/code) — **none silently dropped** (E2). The **authored design + coverage are frozen now** (oracle frozen); per-assertion PASS/FAIL is recorded at execution as each enforcement realization freezes.

**Carried register [by pointer]:** `DR-8-HARNESS` **consumed** (Doc-8B); `DR-8-STATE` **satisfied** (8E is the state-machine defining suite); `[ESC-8-CORPUS]` (genuine governance/scoring defect — flag-and-halt, **never weaken**; e.g. an absent dominance metric per Pass-1 §2.2); `[ESC-8-API]`/`[ESC-8-POLICY]` (by pointer, named channel). Doc-8E coins nothing and asserts only corpus-declared governance behavior.

---

## Pass-2 self-check (pre-review)

- **Reference-never-restate:** `Doc-5E`/`Doc-5F` (moat); `Doc-4M` (state/edges); CLAUDE.md §1/§4/§5; `Doc-4G`/`Doc-3`/`Doc-4E` (scoring); `Doc-6B`/`6C` (#8 triggers); the Doc-8A allocation table; `Doc-8C/8D/8F/8G` (composers). **Nothing invented.**
- **E1 composition realized:** §6 export/invoke table; #8/#11 direction inverted (8D-defined) per Pass-1 MINOR-1.
- **Authored-not-run honesty:** §7 "realizes by design"; PASS/FAIL at execution as enforcement realizations freeze (E2); no "PASS" implying execution.
- **Coins nothing:** 0 new signal/score/invariant/state/edge/expected value; edges enumerated from frozen Doc-4M.
- **Open for review:** confirm `CHK-8-042` define-here/execute-8G split is consistent with the Doc-8G structure (when authored); confirm the moat "no re-rank" assertion correctly cross-refs Doc-7 R5 / Doc-8G without re-asserting the UI display here.

*End of Content Pass-2 (§4–§7) — DRAFT. Realizes `Doc-8E_Structure_v1.0_FROZEN` §4–§7. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN.*
