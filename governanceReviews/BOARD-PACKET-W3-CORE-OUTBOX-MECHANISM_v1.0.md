# BOARD-PACKET — Wave-3 outbox-write mechanism conflict (`core.write_outbox_event.v1`)

> **⏳ STATUS: FLAG-AND-HALT ESCALATION — awaits HUMAN (M0-owner / Architecture Board) ruling.**
> Raised by the Wave-3 coordinator under **CLAUDE.md §11** ("on any conflict with a frozen doc:
> Flag-and-Halt — cite both sources, escalate; **never resolve locally**"). This packet **coins nothing,
> folds nothing, edits no frozen document, and rebases no branch.** It presents a conflict between two
> already-committed Wave-3 realizations of a single **M0-owned** primitive and the frozen corpus, states
> the four Validate-Findings answers (§13), and lays out the decision. On ruling, the resolution is
> executed at the **Wave-3 exit gate**, and the coordinator registers the outcome across the shared files.
>
> Proposed ESC handle: **`[ESC-CORE-OUTBOX-MECH]`** (M0 / `core`; register post-ruling).

## Summary

| Field | Value |
|---|---|
| **Primitive** | `core.write_outbox_event.v1` (M0 shared kernel — the transactional-outbox WRITE, twin of `core.append_audit_record.v1`) |
| **Owner** | **M0 / `core`** — "outbox owned by M0" (Doc-9 authority pointers). Realized independently by **two non-owner consumer modules**. |
| **Conflict** | M7/billing realized it with a **`SECURITY DEFINER`** DB function; the folded, human-approved `Doc-4B_AuditAppendRLS_Patch_v1.0.1` **rejects `SECURITY DEFINER`** for `append_audit_record` (the outbox write's twin). Whether that rejection extends to the outbox is **Q1** (§5). |
| **Severity** | **Exit-gate blocker — conditional on Q1.** If Q1 binds the outbox twin (§5), the SD divergence is a Wave-3 exit-gate BLOCKER (frozen-corpus conformance + Invariant #7); if Q1 rules the posture audit-specific, it reduces to a merge / contract reconciliation. **No runtime impact while branches stay separate.** |
| **Authority** | CLAUDE.md §7 (frozen corpus supreme) · §8 (M0/architecture-affecting ⇒ human approval) · §11 (Flag-and-Halt) · §13 (Validate-Findings) · Invariant #7 |
| **Decision needed from** | M0-owner / Architecture Board (Team-6 Security review on any new `SECURITY DEFINER` surface) |

---

## 1. The conflict — two mechanisms for one primitive

**Because `core.write_outbox_event` is M0-owned — Invariant #7, One Module, One Owner — only one canonical
realization may exist; "keep both" is not available.** Both modules needed the M0 outbox-write primitive to
emit their first Doc-2 §8 event, and — with no coordinated M0 realization available — **each wrote its own into
`src/modules/core/`**, divergently:

| | **M5 / trust** (`wave/3-trust-wp1`) | **M7 / billing** (`wave/3-billing`) |
|---|---|---|
| Commit | `31b997d` `feat(core)` **W3-CORE-1** (isolated M0 WP) | folded into `b8e8518` **W3-BILL-4** |
| Mechanism | app-minted UUIDv7 + **non-`RETURNING`** insert (`createMany`) **on the caller's executor** | **`SECURITY DEFINER`** function `core.write_outbox_event(...)` (`RETURNS void`) |
| DB migration | **none** (no new object) | `20260711180000_core_write_outbox_event` (creates the SD function) |
| Emitter context it serves | **System / privileged** only (its own comment: *"a future non-staff emitter would need"* more) | **tenant-context** (`purchase_subscription` under `withActiveOrg`, `is_platform_staff = false`) |
| `core/contracts` result field | `outboxEventId` | `eventId` |
| `payload` type | `Record<string, unknown>` | `unknown` |
| `core_outbox_write_failed` error code | **present** (Doc-4B §B10) | dropped |
| `CoreServiceError` `cause` (ES2022) | preserved | dropped |

The `outbox-event.service.ts` blobs are add/add-divergent (`ed7c97e` ≠ `0163259`); `core/contracts/services.ts`,
`core/contracts/types.ts`, and `src/shared/ids/index.ts` all content-conflict. **This is not a keep-both** — one
canonical mechanism must win. *(The migration side is separate and NOT intrinsic to this conflict: trust's
outbox WP `31b997d` creates **no** migration at all; billing's `20260711180000_core_write_outbox_event` merely
shares its timestamp prefix with trust's unrelated `_trust_verified_financial_tiers` — one of four incidental
M5↔M7 prefix collisions, handled under §5 Q3.)*

## 2. The frozen text — rules for the audit twin; binds the outbox twin by analogy (Q1)

`core.write_outbox_event` is the **twin** of `core.append_audit_record` (both write to a **platform-staff-only**
`core` table inside the **caller's transaction**; `core.outbox_events` carries exactly one policy —
`outbox_events_platform_staff`, `core_init` §3.2). The audit twin's RLS posture is fixed by a **folded,
human-approved** patch:

**`Doc-4B_AuditAppendRLS_Patch_v1.0.1.md`** (APPROVED & FOLDED, human, 2026-06-30):
- **Rejects `SECURITY DEFINER`.** *"R-b explicitly rejects the elevation leg (R-a) and the `SECURITY DEFINER`
  leg (R-c). The append stays on the caller's executor under the caller's context."* (:49)
- **Prescribes the alternative.** Because `INSERT … RETURNING` forces the row through the staff-only SELECT
  policy and aborts under tenant context (SQLSTATE 42501), the condition-honoring realization is *"app-generated
  UUIDv7 + a non-`RETURNING` insert … on the caller's executor"* — **plus** a tenant-admitting INSERT `WITH
  CHECK` policy (the audit "D3" leg). (:60)

**But R-b/R-c is textually scoped to `append_audit_record` / `audit_records` — it never names the outbox.**
Whether it **binds** the outbox twin is **Q1 for the Board**. The architectural correspondence is substantial: same staff-only-SELECT
`core` table, same `RETURNING`/42501 hazard, and trust's own code comment calls its realization a mirror of
`audit-record.service.ts`.

**The counterpoint (the honest Option-B case).** The frozen corpus groups the outbox with audit **and**
`allocate_human_reference` as a **§A10 internal-primitive trio** (Doc-4B PassA:878 / PassB:929). That trio is
**split on `SECURITY DEFINER`**: `append_audit_record` is realized explicitly **no-SD** (R-c), while
`allocate_human_ref` **is** realized `SECURITY DEFINER` (core_init §3.3 — "the platform-staff RLS backstop").
So "same §A10 class" does **not** by itself settle the mechanism — the R-c rejection may be **audit-specific**
(driven by the `RETURNING` read-back hazard) rather than a blanket rule for every §A10 write past a staff-only
policy. That unresolved split is precisely why the binding question is **escalated (Q1), not ruled locally**.

## 3. Root cause — the real gap that split the two branches

Billing did not reach for SD carelessly. **`core.outbox_events` has only `outbox_events_platform_staff` — it
has no tenant-emitter INSERT leg** (unlike `core.audit_records`, which received its tenant "D3" INSERT `WITH
CHECK` policy via the AuditAppendRLS work). So a **tenant-context** emitter (M7's `purchase_subscription`)
**cannot write the outbox row on its own executor** — RLS rejects it. Faced with that wall:
- **trust** stayed no-SD but only covers **privileged/System** emitters (and says so), and
- **billing** covered the tenant case with **`SECURITY DEFINER`** — a mechanism that **may conflict with the
  current corpus interpretation** (R-c), pending Q1.

So **if Q1 is answered affirmatively** (the audit posture binds the twin), **neither implementation is fully
corpus-conformant as-is**: the conformant realization would be trust's no-SD mechanism **+ an additive `Doc-6B`
patch adding the missing tenant-admitting INSERT `WITH CHECK` policy to `core.outbox_events`** (the outbox
analogue of the audit D3 leg), closing the gap without `SECURITY DEFINER`.

## 4. Validate-Findings (CLAUDE.md §13) — the raise, pre-adjudicated

1. **Valid?** Yes — SD function verified in `20260711180000_core_write_outbox_event/migration.sql`; the R-c
   rejection verified in the folded `Doc-4B_AuditAppendRLS_Patch_v1.0.1` (:49/:60).
2. **Applicable?** **Applicable by architectural analogy, but not explicitly stated** — the outbox is the audit twin over the same staff-only table
   with the identical RETURNING/42501 hazard, **but** R-b/R-c names only audit and a §A10 sibling
   (`allocate_human_ref`) is realized SD. Whether the posture governs the outbox is **Q1** (Board) — which is
   exactly why this is escalated rather than ruled here.
3. **Best for the product?** The no-SD path keeps one auditable RLS model (INSERT `WITH CHECK`, staff-only
   read) across both `core` write primitives and avoids a second privileged bypass surface — **if** Q1 binds
   the twin. Option B trades that for reusing an existing §A10 SD pattern and no new Doc-6B policy.
4. **Consistent with the frozen corpus?** **Conditional on Q1.** If the audit posture binds the twin, the
   no-SD path conforms and the SD function conflicts (R-c). Because R-c's text names only audit, the
   coordinator does **not** rule this locally — per §11 it is Flag-and-Halt, escalated.

## 5. Decision required

**Q1 — the governing question.** Does the audit-append RLS posture (no `SECURITY DEFINER`; caller's-executor
non-`RETURNING` insert) constitute a **normative architectural rule applicable to all M0 transactional append
primitives — including `core.write_outbox_event`** — or is it **audit-specific** (driven by the audit table's
`RETURNING` read-back hazard)? *(Coordinator assessment: applicable by architectural analogy — §2 — but not
explicitly stated in the frozen text; the Board rules.)*

**Why Q1 exists:** the frozen corpus contains **no explicit statement governing `core.write_outbox_event`'s RLS
mechanism**; the Board is therefore asked to determine whether the audit rule (R-c) **extends to it by
architectural precedent** or stops at the audit table.

**Board decision criteria (for Q1).** Rule on these principles, in order — implementation cost is secondary:

1. **Textual authority** — R-b/R-c names `append_audit_record` / `audit_records` only; it does not name the outbox.
2. **Precedent hierarchy** — the §A10 internal-primitive class is split on SD (audit no-SD vs `allocate_human_ref` SD); which precedent governs the outbox write?
3. **Security posture** — does admitting a second `SECURITY DEFINER` surface in `core` widen the privileged-write attack surface unacceptably?
4. **Architectural consistency** — one tenant-admission RLS model across both `core` append primitives vs. two coexisting patterns.
5. **Implementation complexity** — *secondary only*; must not override 1–4.

**Q2.** If Q1 binds the twin, choose the realization:

- **Option A — No `SECURITY DEFINER` (caller-context insert).** Canonicalize **trust's** non-`RETURNING`
  mechanism (`31b997d`) as the single M0 `feat(core)` WP; add the **missing tenant-admitting INSERT `WITH
  CHECK` policy** to `core.outbox_events` via an additive **Doc-6B** patch (mirrors the audit D3 leg);
  **M7 withdraws** its `SECURITY DEFINER` function + migration and re-points its emit to `@/modules/core/contracts`.
- **Option B — Ratify `SECURITY DEFINER` for the outbox write.** Keep billing's SD function on the §A10-sibling
  precedent: `allocate_human_ref` is already `SECURITY DEFINER` (core_init §3.3), so SD is an **established M0
  pattern** for a tenant-context write past a staff-only policy, and R-c may be **audit-specific** (the
  `RETURNING` read-back hazard) rather than binding on the outbox. The Board rules R-c non-binding on the twin;
  Team-6 reviews the SD surface. *(Avoids a new Doc-6B RLS policy; keeps two privileged-write patterns in `core`.)*

**Coordinator interpretation (separate from the options).** Based on the current reading of the corpus, Option
A appears to align most closely **if Q1 is answered affirmatively** (the §A10 twin analogy, §2) and avoids a
second privileged-write surface. The §A10 SD-split (`allocate_human_ref`) is a genuine argument for Option B.
This is an interpretation, not a conclusion — the Board rules (Raise ≠ Accept, §13).

### Option comparison

*(ordered by governance priority — corpus → security → architecture → cost)*

| Criterion | Option A — no-SD | Option B — ratify SD |
|---|---|---|
| Frozen-corpus consistency | Conformant **if Q1 binds** the twin | Requires the Board to interpret R-c as **audit-specific rather than generally applicable** |
| Security surface | No new privileged path | Keeps a `SECURITY DEFINER` surface (Team-6 review) |
| Architectural consistency | One tenant-admission RLS model across both `core` append primitives | Two privileged-write patterns coexist in `core` |
| Precedent followed | The audit twin (`append_audit_record`, no-SD) | The §A10 sibling (`allocate_human_ref`, already SD) |
| Implementation effort | Higher — new Doc-6B INSERT policy + M7 withdraws its function/migration | Lower — keep billing's function as the M0 impl |
| Maintenance | Ongoing: the INSERT policy + its partition-propagation obligation | Ongoing: the SD function + pinned `search_path` + periodic SD security re-review |

### Owner impact

- **If Option A:** M0 owns the canonical primitive (trust's `31b997d` content); M5 contributes the reference
  implementation; **M7 withdraws** its SD function + `20260711180000` migration and re-points its emitters to
  `@/modules/core/contracts`; **Team-6** reviews the additive Doc-6B INSERT-policy patch.
- **If Option B:** M0 owns the canonical **SD** implementation (billing's function); **Team-6** performs the
  `SECURITY DEFINER` security review; **M5 re-points** its emit onto the M0 SD contract (dropping its no-SD
  `createMany` path); no new Doc-6B policy.

### Decision consequences

- **If Q1 = Yes** (the posture binds the twin) → proceed to Q2 and choose Option A or Option B.
- **If Q1 = No** (the posture is audit-specific) → the SD function is **not** corpus-barred: billing's Option B
  becomes the canonical M0 implementation for this primitive and Option A is **no longer corpus-required** —
  subject only to Team-6's SD security review and the Q3 contract-surface + migration reconciliation.

**Q3 (either option).** Reconcile the contract surface to trust's richer form: keep `core_outbox_write_failed`
(Doc-4B §B10), ES2022 `cause` preservation, `payload: Record<string, unknown>`, and one result field name
(`outboxEventId`); reconcile the `src/shared/ids/index.ts` divergence. **Migration timestamps:** billing's
outbox migration shares prefix `20260711180000` with trust's unrelated `_trust_verified_financial_tiers` —
**one of four incidental M5↔M7 prefix collisions** (`…180000` / `…190000` / `…200000` / `20260712100000`).
Only the outbox one is in scope here (it disappears entirely if Option A withdraws the migration); the **other
three are a separate exit-gate migration-ordering reconciliation**, not part of this ruling.

## 6. If Option A is ruled — execution (at the Wave-3 exit gate)

1. Canonical `core.write_outbox_event.v1` lives once in M0 (trust's `31b997d` content = the M0 WP home).
2. Additive **Doc-6B** patch: tenant-admitting INSERT `WITH CHECK` policy on `core.outbox_events` (owning-module
   leg — event ownership §16.6), realized as one forward-only migration.
3. M7 deletes `20260711180000_core_write_outbox_event` + the SD function; re-points `purchase_subscription`
   (and every other billing emitter) to the M0 contract.
4. Contract-surface reconciliation per Q3; Option A **withdraws** billing's outbox migration (leaving none —
   trust's WP adds no migration). The other three M5↔M7 timestamp-prefix collisions are reconciled separately
   at the gate, outside this ruling.
5. Coordinator registers `[ESC-CORE-OUTBOX-MECH]` (resolved) + the Doc-6B patch across `00_AUTHORITY_MAP.md` /
   `esc_registry.md` / `CORPUS_INDEX.md` at the exit fold.

## 7. This packet does NOT

- Coin any Doc-2 §8 event, change event ownership (§16.6), or alter the thin-payload / Privacy-Review rules.
- Edit any frozen document, or fold any patch (Doc-4B / Doc-6B remain untouched until a human folds a ruling).
- Change M0 ownership, the outbox dispatcher, the staff-only **read** posture, or any governance signal.
- Rebase or mutate `wave/3-trust-wp1` or `wave/3-billing` — execution is deferred to the gate on a ruling.

## 8. Disposition (owner / Board)

| Question | Ruling | Date | Record |
|---|---|---|---|
| Q1 — audit posture = normative rule for **all** M0 append primitives (binds outbox) vs **audit-specific**? | **YES — binds the outbox twin** (normative for all M0 append primitives; `SECURITY DEFINER` not permitted) | 2026-07-12 | owner ruling |
| Q2 — Option A (no-SD) / Option B (ratify SD) | **Option A — retain no-SD** | 2026-07-12 | owner ruling |
| Q3 — contract-surface + migration reconciliation | **Reconcile the implementation to the existing frozen contract; do NOT expand the contract surface solely to accommodate the current implementation** (directive below) | 2026-07-12 | owner ruling |

### Ruling directive — Option A realization (frozen-contract-conformant; executed at the exit gate)

The canonical target is the **frozen `core.write_outbox_event.v1` contract**
([Doc-4B_Content_v1.0_PassB.md §Write Outbox Event, :895–:921](../generatedDocs/Doc-4B_Content_v1.0_PassB.md#L895-L921))
— **not** either current implementation:

- **Mechanism (Q1/Q2):** app-minted UUIDv7 + **non-`RETURNING`** insert on the **caller's executor**; **no
  `SECURITY DEFINER`** (the `append_audit_record` twin's realization). ⇒ **M5/trust `31b997d` is canonical.**
- **Inputs:** `event_name`, `event_version`, `aggregate_id`, `payload : object` → `Record<string, unknown>`
  (trust conforms; **billing's `payload: unknown` is looser than the contract — tighten to the frozen shape**).
- **Output = NONE (the Q3 correction).** The frozen contract declares **no** Outputs/Response
  (`Response: none`, Doc-4A §21.5 carve-out). ⇒ **Drop `WriteOutboxEventResult` entirely** — **both**
  `outboxEventId` (trust) **and** `eventId` (billing) are contract-surface expansions the ruling forbids; any
  caller depending on a returned id drops that dependency. *(Even the canonical `31b997d` over-exposed a
  result — it is reconciled too.)*
- **Error code:** `core_outbox_write_failed` is **frozen** (:921) — **keep** (trust has it; billing restores it).

**Two follow-ons at the gate (neither expands the contract surface):**
1. **M7 withdraws** its `SECURITY DEFINER` function + `20260711180000_core_write_outbox_event` migration and
   re-points every billing emitter to `@/modules/core/contracts`.
2. **Tenant-emit RLS (defense-in-depth parity, not a contract change):** the no-SD path admits a tenant-context
   write via the privileged app connection (RLS = backstop); for RLS-test/defense parity with `audit_records`'
   D3 leg, an **additive Doc-6B** tenant-admitting INSERT `WITH CHECK` policy on `core.outbox_events` may be
   added — confirm necessity vs. the privileged-connection posture at the gate.

Registration of `[ESC-CORE-OUTBOX-MECH]` = **RESOLVED (Option A)** across `00_AUTHORITY_MAP.md` /
`esc_registry.md` / `CORPUS_INDEX.md` (+ the Doc-6B patch if drafted) folds at the Wave-3 exit gate.

*Raised by the Wave-3 coordinator, 2026-07-12; **owner-ruled 2026-07-12 (Q1=Yes · Q2=Option A · Q3=conform to
frozen contract)**. Non-authoritative under the frozen corpus (CLAUDE.md §7); on any conflict the frozen doc
wins. Sources cited by pointer, never restated.*

## Appendix A — Timeline

| Marker | Date | Event |
|---|---|---|
| **T1** | 2026-07-11 (`b8e8518`) | M7 / billing realizes `core.write_outbox_event` via a `SECURITY DEFINER` function (W3-BILL-4) |
| **T2** | 2026-07-11 (`31b997d`) | M5 / trust realizes it **no-SD** (non-`RETURNING` caller-context insert) as the isolated M0 WP W3-CORE-1 |
| **T3** | 2026-07-12 | Divergence discovered during Wave-3 exit-gate reconciliation (add/add conflict on `src/modules/core/`) |
| **T4** | 2026-07-12 | Coordinator raises this Flag-and-Halt packet (`[ESC-CORE-OUTBOX-MECH]`, proposed) |
| **T5** | 2026-07-12 | **M0-owner RULING: Q1=Yes (binds) · Q2=Option A (no-SD) · Q3=conform to frozen contract (drop `WriteOutboxEventResult`).** Execution deferred to the Wave-3 exit gate |
| **T6** | 2026-07-12 | **Owner APPROVES the Option-A target state for both M5 (contract-conformance cleanup: drop `WriteOutboxEventResult`/`outboxEventId`, update emitters, keep `core_outbox_write_failed`/`payload:Record`) and M7 (withdraw SD function + `20260711180000` migration, re-point emitters to `@/modules/core/contracts`).** Execution locked; runs at the gate |

---

**Revision v1.0 → folded review findings (2026-07-12, verified against the branch tips before folding):**
**F1** (accuracy) — the `20260711180000` collision is billing-outbox vs trust's *unrelated*
`_trust_verified_financial_tiers` (trust's outbox WP creates no migration); it is **one of four** M5↔M7
prefix collisions, not intrinsic to the outbox conflict. §1 de-scoped it; §5 Q3 + §6.4 rescoped it (only the
outbox one in ruling scope; the other three = separate gate reconciliation). **F2** (framing rigor) — the
no-SD posture (R-b/R-c) is textually scoped to audit and never names the outbox; a §A10 sibling
(`allocate_human_ref`) **is** SD (core_init §3.3), so the trio is split. §2 heading softened + counterpoint
stated fairly; §4.2/§4.4 made conditional on Q1; §5 Option B strengthened to its real (§A10-precedent) form.

**Revision v1.0-A2 → second Review-A pass (2026-07-12):** severity restated as **conditional on Q1** (not an
unconditional BLOCKER); Q1 reworded to define "bind" as *normative rule for all M0 append primitives vs
audit-specific*; **Board decision criteria** added for Q1; "RECOMMENDED" removed from Option A and relocated to
a separate **coordinator assessment**; **option-comparison matrix** + **owner-impact** blocks added; Invariant
#7 ("keep both" unavailable) stated once in §1; §3's "neither branch as-is" made conditional on Q1; residual
"corpus forbids" / "analogy is strong" wording softened to interpretation-neutral phrasing. No new factual
claim introduced; no frozen document touched; no branch mutated.

**Revision v1.0-A3 → third Review-A pass (2026-07-12):** neutrality polish only — matrix "corpus-interpretation
exception" reworded to "interpret R-c as audit-specific rather than generally applicable"; coordinator
**assessment** relabelled **coordinator interpretation** ("an interpretation, not a conclusion"); a **"Why Q1
exists"** sentence added (corpus is silent on the outbox mechanism → precedent-extension question); the option
matrix reordered to governance priority (corpus → security → architecture → cost) with a distinct
**Architectural consistency** row; a **Decision consequences** decision-tree (Q1=Yes → Q2; Q1=No → Option B
canonical) added. No factual claim changed; no frozen document touched; no branch mutated.

**Revision v1.0-A4 → fourth Review-A pass (2026-07-12):** Option A heading neutralized (`No-SD,
corpus-conformant` → `No SECURITY DEFINER (caller-context insert)`) so the title no longer presumes Q1;
Decision-consequences softened (`stands as` → `becomes … for this primitive`); **Appendix A — Timeline** added
(T1–T2 dated from the actual commit timestamps — M7 `b8e8518` preceded M5 `31b997d` by ~6 min on 2026-07-11)
for the permanent governance record. No factual claim changed; no frozen document touched; no branch mutated.
