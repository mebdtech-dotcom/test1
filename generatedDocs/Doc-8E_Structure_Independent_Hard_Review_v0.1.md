# Doc-8E — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8E_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET FREEZE-READY** — 1 MAJOR + 2 MINOR open; 1 finding REJECTED as false. 0 BLOCKER. Resolve via Structure Patch → short re-review → Structure Freeze Audit |

---

## Anchors verified CORRECT

- CLAUDE.md §4 (5 firewalled signals + the firewall rules) / §5 (12 Core Invariants) / §1 (moat) · `Doc-2 §5` (state machines) · `Doc-4M` (lifecycle authority) · `Doc-6A §8` (audit `actor_type`) · `Doc-8A §7` + Appendix A bands D (`CHK-8-030…033`) / E (`CHK-8-040…042`) + the cross-cutting allocation table (8E defining; 8C/8F/8G composing) — all correctly invoked.
- E1 (defining-suite/assert-once) correctly applies the §6.4/§9.6 byte-equivalence allocation precedent to governance; E2 (oracle-frozen / enforcement-deferred) correctly extends the `CHK-8-031` precedent.

0 BLOCKER. The defining-suite role, the registry spine, and the §2–§5 map are sound. One load-bearing assertion-shape gap, two cross-ref/layer precision defects.

### MAJOR-1 — §2's firewall assertion shape covers only **non-cross-mutation**; the **non-dominance** rules have no realized assertion approach
§2 gives one assertion shape — "vary signal A (input), assert signal B (output) independent." This fits the **non-cross-mutation** rules (Financial Tier never raises Trust; Financial Tier doesn't affect Performance; Buyer status never mutates platform scores). But **two of the five firewall rules are non-dominance, not non-cross-mutation**: *"no secondary signal dominates trust"* and *"no single signal dominates a matching decision."* These are **not** input→output independence — they are properties of a **weighted decision** (the trust-scoring composition / the M3 matching scoring). The vary-A-assert-B shape cannot express them; as written, this class of firewall rule has **no realized assertion**, so §2 under-covers CLAUDE.md §4.
**Required fix:** §2 must give a **second assertion shape for non-dominance**, bound to the frozen scoring rules: the **trust-scoring composition** (`Doc-4G` / M5) and the **M3 matching scoring** (`Doc-3` / `Doc-4E`). Shape: construct a case where one signal is **maxed/extremed** and assert the decision **still depends on the other inputs** (a single signal cannot unilaterally flip the outcome / cannot reach a weight of 1.0) — per the frozen scoring rule. Distinguish the two rule classes in §2 (non-cross-mutation → vary-A-assert-B; non-dominance → maxed-signal-non-determinative against the frozen scoring). Both are E2 execution-deferred until M5/M3 freeze, but the **shape** must be authored now.

### MINOR-1 — §3 invariant #4 cross-ref conflates the RFQ **state machine** with the RFQ **control plane**
§3 maps invariant #4 ("RFQ is a state machine **with a control plane** — lifecycle/routing/throttling/sorting/scoring") wholly to "§5" (Doc-4M state machines). But the **control plane** (routing/throttling/sorting/scoring) is **not** the state machine — routing/scoring is the moat/matching (§4) and the non-dominance firewall (§2). Mapping all of #4 to §5 leaves the control-plane half unasserted.
**Required fix:** §3 — split #4's cross-ref: the RFQ **state machine** → §5 (Doc-4M); the RFQ **control plane** (routing/throttling/sorting/scoring) → §4 (moat) + §2 (non-dominance, MAJOR-1). #4 is asserted across all three, not §5 alone.

### MINOR-2 — §5 `CHK-8-042` (optimistic-UI convergence) is *defined* in 8E but *executes* in the UI (Doc-8G); make the layer split explicit
§5 lists `CHK-8-042` (optimistic-UI reconciles to server-authoritative) under the state-machine suite. The **convergence rule** (the server state is authoritative; the UI reconciles) is a domain/state-machine semantic that 8E rightly **defines** — but the **execution** is a **UI behavior** that runs in **Doc-8G**. As written it reads as if 8E executes a UI check.
**Required fix:** §5 — state the E1 split for `CHK-8-042`: 8E **defines** the convergence rule (server-authoritative state is the oracle — Doc-4M); **Doc-8G executes/composes** it at the UI layer (the optimistic update reconciles). Define-here, execute-in-8G — consistent with E1.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"Doc-8E duplicates Doc-8C — both touch invariants/firewall; the invariant suites belong in 8C where the contracts are tested."* | **REJECTED (false).** Per the frozen **Doc-8A allocation table**, 8E is the **defining** suite (E1); 8C **composes** 8E's helpers only where a signal/invariant **crosses a contract**. An invariant's canonical assertion (e.g. firewall score-independence, capability-is-a-matrix) is a **domain property**, not a contract property — it belongs in 8E. 8C asserting it independently would be the **divergent re-implementation E1 forbids** (assert-once). No duplication. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MAJOR-1 non-dominance firewall rules unassertable as written | MAJOR | Structure Patch — second assertion shape (maxed-signal-non-determinative vs frozen scoring) |
| MINOR-1 invariant #4 state-vs-control-plane cross-ref | MINOR | Structure Patch — split #4 → §5 (state) + §4/§2 (control plane) |
| MINOR-2 CHK-8-042 define-here/execute-in-8G | MINOR | Structure Patch — state the E1 layer split |

**Gate (governance §8 rule 1):** freeze only with 0 open BLOCKER/MAJOR/MINOR. 1 MAJOR + 2 MINOR open → **Structure Patch required**, then short re-review, then Structure Freeze Audit.

*End of Independent Hard Review. Nothing coined; no frozen document edited. Anchors verified against CLAUDE.md §4/§5/§1, Doc-4M, Doc-6A §8, Doc-8A §7 + bands D/E + allocation table.*
