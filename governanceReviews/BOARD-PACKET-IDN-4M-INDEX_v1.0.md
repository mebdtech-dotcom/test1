# BOARD PACKET — `ESC-IDN-4M-INDEX` · Doc-4M M5 Index Correction (Organization + Membership) — v1.0

| Field | Value |
|---|---|
| **Handle** | `ESC-IDN-4M-INDEX` (registered: `esc_registry.md` §1, Vendor Quotation Workbench block, 2026-07-09) |
| **Decision owner** | Human owner / Architecture Board (Doc-4M is FROZEN — CLAUDE.md §7 rank 0; §8: architecture-affecting artifacts require HUMAN approval) |
| **Origin** | RV-0150 (W2-IDN-5 Review-A, 2026-07-09) **OBS-1 — binding Board carry**; builder disclosure `governanceReviews/milestones/w2-idn-5/COMPLETION-REPORT.md` (judgment call 1, NO-Flag-and-Halt ruling **UPHELD** by RV-0150 Adjudication 1) |
| **Ask** | Approve the additive index-correction patch **`Doc-4M_Patch_v1.0.1`** (Annex A) per Doc-4M's own frozen correction procedure |
| **Gating** | **Non-blocking.** No work package is gated on this handle; W2-IDN-5 implemented Doc-2 §5.1/§5.2 verbatim (RV-0150 independently re-derived both matrices edge-by-edge; suite-pinned). The harm is to future readers of the index only |
| **Class** | Editorial index correction (the `Doc-6C_Patch_v1.0.1` class: additive overlay, frozen base file untouched, Authority-Map-registered) |
| **Separation of duties** | This packet **raises and instruments**; it decides nothing. Only a human ruling executes Annex A (§13 Raise ≠ Accept) |

---

## 1. What happened

While building the W2-IDN-5 state machines, the builder found that Doc-4M's **M5 Transition
Authority Matrix** rows for Organization and Membership diverge from the canonical machines in
**Doc-2 §5.1/§5.2** — and ruled NO Flag-and-Halt because Doc-4M's own frozen text pre-resolves the
conflict against itself. RV-0150 (Review-A, fresh context) opened every cited line, **upheld the
ruling**, verified the divergence is real, and left **OBS-1 as a binding carry**: the correction
duty is real under Doc-4M :34's own procedure and needs a durable handle + Board instrument. The
handle was minted (`ESC-IDN-4M-INDEX`); this packet is the instrument.

## 2. Why this is NOT frozen-vs-frozen (the already-adjudicated part)

Doc-4M self-subordinates, verbatim, at three places (re-read for this packet):

- **:10 (Nature):** "**Consolidation document.** Non-normative. Creates no state, transition,
  workflow, business rule, ownership, or event."
- **:18 (freeze certificate):** "On any apparent conflict with a frozen corpus source, the frozen
  source governs — **this index is corrected, never the frozen corpus**."
- **:34 (authority & limits):** "It is **non-normative**: it defines nothing, owns nothing, and may
  not be cited as a contract source. Where this index and any frozen source appear to disagree, the
  frozen source governs and the discrepancy is escalated (FLAG-AND-HALT) — this index is corrected,
  never the frozen corpus. The canonical state machines remain **Doc-2 §5**."
- **:351 (freeze note 5):** "The frozen corpus governs; this index is corrected to match it, never
  the reverse."

So the conflict class is "index errata against its own declared authority," not a mutual
contradiction between two frozen normative sources. The correction path — escalate, then patch the
index — is prescribed by the frozen document itself. (RV-0150 Adjudication 1, recorded in
`project-management/review-log.md` :2240.)

## 3. The verified divergences (six defects)

Canonical text: `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` §5.1 (:469–474) and
§5.2 (:480–485). Index text: `Doc-4M_FROZEN_v1.0.md` M5 rows :155–159 (Organization) and
:161–164 (Membership). All twelve lines re-read verbatim for this packet; the table matches
RV-0150's independent re-derivation.

| # | Doc-4M M5 (verbatim) | Doc-2 §5 (verbatim) | Defect |
|---|---|---|---|
| D1 | :155 `per Doc-2 §5.1 (pre-claim state)` → `claimed` · "User (Owner completes org claim)" | §5.1 has **no pre-claim state and no `claimed`**; the claim lifecycle is the Vendor Profile machine (§5.3) and "applies **only to marketplace vendor profiles**" (§5.3 guards, PATCH-02) | Phantom transition |
| D2 | :156 `claimed` → `active` · "System (claim verification complete)" | Same basis — no such states or edge in §5.1 | Phantom transition |
| D3 | :159 `active` / `suspended` → **`closed`** | :472 `active\|suspended ──soft delete [Owner or admin; cascade §10-note]──▶ soft_deleted` — **`closed` exists nowhere in §5.1** (nor in the realized `OrgStatus` enum) | Mislabeled target state |
| D4 | *(no row)* | :473 `soft_deleted ──restore [restore-conflict rule: regenerate reused slugs]──▶ active` | Omitted edge (also loses the fact the machine has **no terminal state**) |
| D5 | :161 `invited` → `active` · "User (invite accepted)" | :481 `invited ──accept──▶ pending ──verification complete──▶ active` — two edges through **`pending`**, which vanishes from the index | Collapsed edges / omitted state |
| D6 | *(no row)* | :484 `invited ──expire/revoke──▶ removed` | Omitted edge |

Conformant and untouched: :157 (`active`→`suspended`), :158 (`suspended`→`active`), :162, :163,
:164. The **M4** State Authority Matrix needs no correction — its Organization (:117) and
Membership (:134) rows are already pointer-only ("per Doc-2 §5.1 / §5.2"). Freeze history note:
the freeze-era patch P-4M-PA-01 (header :15) already converted :155's *From State* to a pointer;
the phantom `claimed` target survived that pass.

## 4. The instrument (Annex A)

`governanceReviews/Doc-4M_Patch_v1.0.1_PROPOSAL.md` — additive, editorial, frozen base file never
edited in place; withdraws D1/D2, corrects D3, adds the D4/D6 omitted edges, expands D5 through
`pending`; trigger-authority cells the corpus does not attribute stay in pointer form (nothing
coined). On approval it executes to `generatedDocs/Doc-4M_Patch_v1.0.1.md` + an
`00_AUTHORITY_MAP.md` row (v1.0 → v1.0.1), exactly the `Doc-6C_Patch_v1.0.1` mechanics.

## 5. Options

| Option | Content | Consequence |
|---|---|---|
| **A — approve Annex A as drafted** *(recommended)* | Org + Membership M5 blocks corrected now; scope exactly the RV-0150-verified defects | Smallest verified correction; index stops misleading readers on the two machines Wave-2 is actively building against; sibling errata unprejudiced |
| **B — batch at Wave-2 exit** | Fold this correction with the two sibling M5 errata (`ESC-7G-LEAD-MACHINE` vendor-lead row; `ESC-JRN-TKT-MACHINE` support-ticket rows) into one Doc-4M patch | One patch event — but the siblings are registered **frozen-vs-frozen corpus-reconciliation** items (which-source-governs is unadjudicated for both); the verified org/membership fix waits behind two unadjudicated questions of a different class |
| **C — defer indefinitely** | Handle stays open | Builders stay protected (every activation packet mandates verbatim Doc-2 §5 re-reads) but the index keeps misleading every future reader — the exact harm OBS-1 names; Doc-4M :34's own procedure is left unexecuted |

**Recommendation: A.** The correction is small, fully verified twice (builder + RV-0150, then
re-verified for this packet), zero-impact on code, and self-contained. B conflates two conflict
classes; the siblings should each get their own verbatim adjudication on their own channels.

## 6. Impact if approved

- Doc-4M v1.0 → v1.0.1 (Authority Map row updated; base file untouched).
- `ESC-IDN-4M-INDEX` → RESOLVED (registry row updated with the ruling reference).
- Tracker cross-cutting row closes; RV-0150 OBS-1 carry discharged.
- Zero code, schema, contract, or suite change anywhere.

## 7. Ruling record *(completed by the owner)*

| Field | Value |
|---|---|
| Ruling | **Option A — APPROVED** (see DECISION RECORD below; Annex A executed verbatim) |
| Date | 2026-07-09 (ruled + executed) · **re-confirmed by the owner 2026-07-10**: "Approved. Apply the Doc-4M index correction patch. No semantic changes; editorial/index correction only." |
| Notes | Editorial/index-only condition verified at execution (zero semantic change · zero new state names · zero ownership change · subordination restated) and re-verified 2026-07-10 by proposal-vs-executed diff: correction tables byte-identical, only banner/authorization/footer differ. Sibling Delegation-Grant erratum ruled + executed as `Doc-4M_Patch_v1.0.2` (2026-07-10, post-close note below) |

---
*Prepared 2026-07-09 by the AI Engineering Orchestrator under WP-GOV-A (Board-approved P1,
2026-07-09). Coins nothing; decides nothing; every quoted line re-read verbatim from the frozen
source this same day. On any conflict the frozen document wins.*

---

## DECISION RECORD — 2026-07-09

**Ruling (owner/Architecture Board):** **APPROVED** as an **editorial/additive corpus correction
only**, with conditions: no semantic changes · no new state names · no ownership changes · the
index must subordinate to the already-frozen Doc-2 state definitions. "Proceed directly to
registry update and close."

**Execution (Orchestrator, same date) — Option A, Annex A verbatim:**
1. Annex A executed to `generatedDocs/Doc-4M_Patch_v1.0.1.md` (status flipped PROPOSAL →
   EXECUTED — IN FORCE; Authorized-by filled; content byte-identical to the annex otherwise).
2. `generatedDocs/00_AUTHORITY_MAP.md` — patch row registered; Doc-4M advances v1.0 → v1.0.1.
3. `esc_registry.md` → `ESC-IDN-4M-INDEX` RESOLVED.
4. All four ruling conditions verified against the executed text: zero semantic change (every
   corrected cell points at Doc-2 §5.1/§5.2 verbatim), zero new state names (`soft_deleted`/
   `pending`/`removed` all pre-exist in Doc-2), zero ownership change, subordination restated in
   the patch header.

**Post-close note (raised, NOT executed — Raise ≠ Accept):** while executing, the Orchestrator
verified a **sibling erratum of the identical editorial class** in the frozen base:
`Doc-4M_FROZEN_v1.0.md` M5 **Delegation Grant rows :166-168** carry a nonexistent `pending` state
(Doc-2 §5.10 :584 = `draft ──grant──▶ active`), omit the suspend/reinstate edges (:585), the
suspended-source revoke leg (:586), and — under `Doc-2_Patch_v1.0.7` — the suspended-source
expiry. Same self-subordinating index, same correction procedure. **Candidate: Doc-4M patch
v1.0.2, one-word approval requested** (this record raises it; no instrument executes without the
ruling). The two registered frozen-vs-frozen siblings (`ESC-7G-LEAD-MACHINE`,
`ESC-JRN-TKT-MACHINE`) remain a different class and are unprejudiced.

**PACKET CLOSED.**

### Post-close note — RULED 2026-07-10

The raised sibling erratum was **APPROVED** by the owner ("additive index-correction patch only;
no semantic, state-machine, ownership, or business-rule changes") and executed same-date:
`generatedDocs/Doc-4M_Patch_v1.0.2.md` (Delegation Grant block; Authority-Map-registered;
Doc-4M v1.0.1 → v1.0.2). All conditions honored — every corrected cell points at Doc-2 §5.10
(through `Doc-2_Patch_v1.0.7`) verbatim.
