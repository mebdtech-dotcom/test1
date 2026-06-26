# Doc-8E — Content Pass-2 (§4–§7) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8E_Content_v1.0_Pass2.md` (§4–§7) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 2 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-2 Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- `Doc-5E`/`Doc-5F` (moat) · `Doc-4M` (state/edges) · CLAUDE.md §1/§4/§5 · `Doc-4G`/`Doc-3`/`Doc-4E` (scoring) · `Doc-6B`/`6C` (#8 triggers) · `Doc-7 R5` (display-sort-not-re-rank) · the Doc-8A allocation table · `Doc-8C/8D/8F/8G` (composers) — all correctly invoked.
- Pass-1 fixes carried: §6 #8/#11 direction inverted (8D-defined); authored-not-run honesty in §7 ("realizes by design").

0 BLOCKER, 0 MAJOR. The state-machine edge-coverage design and the E1 composition table are sound. Two layer/overlap precision defects, one helper-shape nit.

### MINOR-1 — §4's "no re-rank by consumer" is a **UI-display** assertion (Doc-7 R5 / Doc-8G), not a domain assertion
§4's `expectNoReRankByConsumer` asserts a **consumer cannot alter the governed ranking** — but a consumer re-ranking is a **presentation** concern (Doc-7 R5: "display sort/filter is presentation over the contract result, never a re-rank"), executed at the **UI layer (Doc-8G)**. As written, 8E (domain) asserts a UI-display behavior — the same layer-confusion the structure fixed for `CHK-8-042`.
**Required fix:** §4 — split: **8E defines** the domain oracle (M3 **produces** the governed match/route/sort/score output per `Doc-5E`); the **no-re-rank-at-display** assertion is **Doc-8G's** (composing, oracle Doc-7 R5), cross-referenced — **not executed in 8E**. Define-the-governed-output here; execute-the-display-non-re-rank in 8G.

### MINOR-2 — §4 moat exercise overlaps 8C (M4 contracts) / 8F (integration); state it composes, not re-implements
§4's `expectM4PostAwardPerContract` and the end-to-end RFQ→match→award→post-award flow overlap **Doc-8C** (per-contract conformance of the M4 contracts) and **Doc-8F** (integration/event-flow). If 8E re-asserts those, it duplicates — violating assert-once.
**Required fix:** §4 — state that the moat exercise asserts the moat as a **governed system property** (the moat *works as a governed whole* end-to-end) and **composes** the per-contract (8C) and per-event/integration (8F) checks — it does **not** re-implement them. 8E owns "the moat is governed/intact"; 8C/8F own the constituent contract/event conformance the moat exercise invokes.

### NITPICK-1 — §6 `invariantHolds(#n)` shape ambiguous
§6 lists `invariantHolds(#n)` as one helper invoked for various `#n`. Clarify whether it is **one parameterized helper** (over the invariant id) or **12 distinct helpers** — the registry (§1) suggests parameterized; state it so composers invoke consistently.
**Suggested fix:** §6 — `invariantHolds(n)` is a **single parameterized helper** over the frozen invariant id (CLAUDE.md §5 #n); composers pass the id.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§5 edge coverage 'every machine × every edge' is a combinatorial explosion — impractical for Doc-4M's many machines/edges."* | **REJECTED (false).** Edge coverage **is** the conformance bar: a state machine is conformant only if **every declared edge** is verified permitted and its illegal neighbors rejected — partial coverage leaves **unverified transitions**, exactly the gap conformance must close. The enumeration is **bounded by the frozen Doc-4M edge set** (finite, declared), **parameterized** (author-once per edge shape — §5 `Doc4M(machine).edges.flatMap`), not hand-written. Practical and necessary; the volume is provable coverage, not a defect (the Doc-8C table-driven precedent). No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 §4 no-re-rank is UI (8G), not domain | MINOR | Pass-2 Patch — 8E defines governed output; 8G composes display non-re-rank |
| MINOR-2 §4 moat overlaps 8C/8F | MINOR | Pass-2 Patch — moat = governed system property; composes, not re-implements |
| NITPICK-1 invariantHolds shape | NIT | Pass-2 Patch — single parameterized helper |

**Gate:** 2 MINOR open → **Pass-2 Patch required**, then short closure check, then Content Freeze Audit → SERIES_FROZEN.

*End of Independent Hard Review (Content Pass-2). Nothing coined; no frozen document edited.*
