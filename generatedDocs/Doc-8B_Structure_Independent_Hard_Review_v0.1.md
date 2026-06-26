# Doc-8B — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8B_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET FREEZE-READY** — 2 MINOR + 1 OBSERVATION + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Structure Patch → short re-review → Structure Freeze Audit |

---

## Anchors verified CORRECT

- `Doc-8A §4` (test-data/tenancy/determinism), `§10` (isolation/determinism/hermeticity/CI), Appendix A bands **A/H/I** (`CHK-8-070…074` Band H — 5 checks after the Pass-3 `CHK-8-074` add; `CHK-8-080/081` Band I) — verified against the frozen Doc-8A.
- `ERR-8A-1` corrected ID anchor (`Doc-6A §3` + `Doc-4B` + `Doc-6B core.id_sequences`) — verified; §6 uses it correctly.
- `Doc-2 §6/§7` · CLAUDE.md §2 (stack/boundaries) /§5 (active org) /§8 (review rule) /§10 (codegen) · Invariants #2/#5 — correctly invoked.
- **Oracle-readiness note:** Doc-6C (M1 `identity`) has since frozen (parallel track) — Doc-8B (harness) carries no Doc-6C dependency, so unaffected; the advance only widens Doc-8D's later oracle.

0 BLOCKER, 0 MAJOR. The realize-never-redecide framing, the single ratified decision (D1 tooling), and the §0–§9 harness map are sound. Findings: two real harness/process gaps, one tooling observation, one applicability nit.

---

## Findings

### MINOR-1 — D1 resolves the **Doc-8A-carried** `[ESC-8-TOOLING]`, but the proposal does not record clearing it back at the manifest (the POLICY-patch precedent)
`[ESC-8-TOOLING]` is a marker **carried by the frozen Doc-8A** (`Doc-8A_SERIES_FROZEN` carried items; Doc-8A R3). D1 resolving it is legitimate (the harness is where tooling lands — Doc-6A R3(b) precedent), but the proposal treats it as a local resolution. Every prior carried-marker resolution in the corpus is **recorded back** at the owning ledger (e.g. each `Doc-3 §12.2` POLICY patch clears its module's `[ESC-*-POLICY]` gate, noted in the manifest).
**Required fix:** state that D1's Board ratification at Doc-8B structure freeze **clears the Doc-8A-carried `[ESC-8-TOOLING]`**, and that this clearance is recorded in the Doc-8A SERIES_FROZEN manifest (additive note) + the orientation ledgers — not resolved silently in Doc-8B alone. Cross-reference both directions.

### MINOR-2 — the harness provides no **outbox inspection / drain** mechanism; Band-F (integration/event) suites cannot assert write-plus-emit atomicity or the dispatch lifecycle deterministically
§7 mocks "the Inngest dispatch surface," but `Doc-8A §8` (Band F, `CHK-8-051/052`) requires suites to assert: a business write + `core.outbox_events` insert **commit/rollback together**, and the `pending→dispatched→archived` dispatch lifecycle + `Doc-4L` fan-out. To assert those, the harness must let a suite **inspect and drain the outbox deterministically** (read `core.outbox_events` rows, trigger a controlled dispatch against the mocked Inngest surface) — mocking Inngest alone is insufficient (it hides the outbox row the atomicity assertion needs to see).
**Required fix:** add a harness capability (in §7, or a new §7-adjacent clause) — a **deterministic outbox observer/drainer**: read the outbox table post-transaction, and a controlled "dispatch tick" that feeds pending rows to the mocked Inngest double so Band-F suites assert atomicity + lifecycle without a live async runtime. Bind by pointer to `Doc-6A §7` (outbox) + `Doc-4L`.

### OBSERVATION-1 — pgTAP introduces a non-TypeScript test dependency; weigh a TS-native transactional-SQL RLS path as primary
D1 proposes **pgTAP** (a C/PL-pgSQL Postgres extension) for the RLS/SQL path, with transactional-SQL as fallback. The platform is **TypeScript end-to-end** (CLAUDE.md §2); pgTAP adds a non-TS toolchain + an extension dependency on the Supabase test DB. The RLS positive/negative/cross-tenant gate can also be asserted **TS-natively** — transactional SQL executed through the runner (Vitest) against the test DB, switching DB role/`SET LOCAL` per case. Not a defect (Board ratifies D1), but the Board should weigh single-toolchain simplicity vs pgTAP's in-DB expressiveness.
**Suggested handling:** present both as D1 sub-options at freeze; recommend TS-native transactional-SQL as primary (single toolchain), pgTAP optional where in-DB assertions are clearer. Board decides.

### NITPICK-1 — §9 claims Doc-8B "passes Band A"; the harness makes no assertions, so Band A is N/A (not passed)
Band A (oracle-by-pointer) governs **assertions**; the harness authors none (it provides fixtures/mocks/gate). Claiming Doc-8B "passes Band A" is imprecise.
**Suggested fix:** §9 — Doc-8B **directly satisfies Bands H and I** (`CHK-8-070…074`, `080/081`); Band A is **N/A** to the harness (no assertions) and is satisfied by the discipline suites that consume the harness; Bands B–G are N/A (the harness provides the means those suites assert with).

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"Doc-8B resolving `[ESC-8-TOOLING]` violates realize-never-redecide — a realization document may not make a decision the metastandard left open."* | **REJECTED (false).** Doc-8A R3 **explicitly delegated** the concrete tooling to "a Doc-8A content/Board step **or** carried via `[ESC-8-TOOLING]`." Resolving a delegated **implementation choice** (test framework — coined by no corpus document) is not re-deciding a frozen *what*; it is the **Doc-6A R3(b) precedent** (one-Prisma-namespace-per-module ratified at freeze). No frozen declaration is changed. Valid — subject only to the MINOR-1 record-back. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 D1 clears Doc-8A `[ESC-8-TOOLING]` — record back at manifest | MINOR | Structure Patch — cross-reference both directions |
| MINOR-2 no outbox inspection/drain for Band-F | MINOR | Structure Patch — add deterministic outbox observer/drainer |
| OBSERVATION-1 pgTAP non-TS dependency | OBS | Structure Patch — present TS-native SQL as primary D1 option |
| NITPICK-1 §9 "passes Band A" imprecise | NIT | Structure Patch — Bands H/I direct; A/B–G N/A |

**Gate (governance §8 rule 1):** freeze only with 0 open BLOCKER/MAJOR/MINOR. 2 MINOR open → **Structure Patch required**, then short re-review, then Structure Freeze Audit. **Note:** D1 (tooling) ratification is a **Board decision** owed at the freeze step (Board Chair sign-off), per the Doc-6A R3(b) precedent.

*End of Independent Hard Review. Nothing coined; no frozen document edited. Anchors verified against the frozen Doc-8A (§4/§8/§10, Appendix A bands A/H/I, ERR-8A-1) + the corpus (Doc-6A §7 outbox, CLAUDE.md §2/§8).*
