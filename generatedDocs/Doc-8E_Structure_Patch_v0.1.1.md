# Doc-8E — Structure **Patch v0.1.1** (Hard Review disposition) + Short Re-Review

| Field | Value |
|---|---|
| Patches | `Doc-8E_Structure_Proposal_v0.1.md` |
| Against | `Doc-8E_Structure_Independent_Hard_Review_v0.1.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 1 MAJOR + 2 MINOR dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → structure freeze-ready |
| Method | Additive structure patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MAJOR-1 — non-dominance firewall rules need a distinct assertion shape → **FIXED**
§2 is restated to give **two** assertion shapes, one per firewall rule class:
> **(a) Non-cross-mutation rules** (Financial Tier never raises Trust; Financial Tier doesn't affect Performance; Buyer status never mutates platform scores; scores auto-calculated under System, never hand-edited) — assertion shape: **vary signal A (input), assert signal B (output) independent**; exercise the owning score-calc service with controlled inputs; a non-System write to a score rejected (oracle CLAUDE.md §4 + M5/Doc-6G; audit `actor_type` corroborates — `Doc-6A §8`).
> **(b) Non-dominance rules** (no secondary signal dominates trust; no single signal dominates a matching decision) — these are properties of a **weighted decision**, not input→output independence. Assertion shape: **maxed-signal-non-determinative** — construct a case where one signal is maxed/extremed and assert the decision **still depends on the other inputs** (no single signal unilaterally flips the outcome / reaches an effective weight of 1.0), bound to the **frozen scoring rules** — trust-scoring composition (`Doc-4G` / M5) and M3 matching scoring (`Doc-3` / `Doc-4E`). No invented weight; the oracle is the frozen scoring rule.
>
> Both classes are E2 execution-deferred until M5/M3 freeze; the **assertion shape is authored now**.

### MINOR-1 — invariant #4 state-vs-control-plane → **FIXED**
§3's #4 cross-ref is split:
> #4 (RFQ = state machine **with a control plane**): the **state machine** → §5 (Doc-4M); the **control plane** (routing/throttling/sorting/scoring) → §4 (moat) + §2(b) (non-dominance). #4 is asserted across §5 + §4 + §2, not §5 alone.

### MINOR-2 — CHK-8-042 define-here/execute-in-8G → **FIXED**
§5's `CHK-8-042` clause is restated (E1 layer split):
> `CHK-8-042` (optimistic-UI reconciles to server-authoritative): **8E defines** the convergence rule — the server state is authoritative, the oracle is Doc-4M; **Doc-8G executes/composes** it at the UI layer (the optimistic update reconciles to the server). Define-here, execute-in-8G (E1).

### REJECTED finding — upheld
"Doc-8E duplicates Doc-8C" stays **REJECTED as false** — 8E defines (allocation table); 8C composes where an invariant crosses a contract; an independent 8C re-implementation is the forbidden divergence (assert-once). No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER | 0 | 0 |
| MAJOR | 1 | **0** |
| MINOR | 2 | **0** |

---

## Short Re-Review (closure confirmation)

| Finding | Sev | Closed? |
|---|---|---|
| MAJOR-1 non-dominance assertion shape | MAJOR | **CLOSED** — two shapes: vary-A-assert-B (non-cross-mutation) + maxed-signal-non-determinative (non-dominance) vs frozen `Doc-4G`/`Doc-3`/`Doc-4E` scoring |
| MINOR-1 invariant #4 cross-ref | MINOR | **CLOSED** — #4 split across §5 (state) + §4 (moat) + §2(b) (non-dominance) |
| MINOR-2 CHK-8-042 layer split | MINOR | **CLOSED** — 8E defines convergence; 8G executes |
| REJECTED (8E vs 8C duplication) | — | **Upheld false** |

No new defect. Re-verified the firewall rule classification (CLAUDE.md §4: 3 non-cross-mutation + 2 non-dominance) and the scoring-rule oracle anchors (`Doc-4G` trust, `Doc-3`/`Doc-4E` matching). **0 open BLOCKER/MAJOR/MINOR → structure freeze-ready.**

*End of Structure Patch v0.1.1 + Short Re-Review. Nothing coined; no frozen document edited. Next: Structure Freeze Audit → `Doc-8E_Structure_v1.0_FROZEN` → Doc-8E content passes.*
