# BOARD DECISION — [D-5] Outbox Audit · v1.1 REALIZATION RULING

**Status:** ✅ APPROVED — human owner / Architecture Board ruling, 2026-07-10.
**Refines:** `BOARD-DECISION-D5-OUTBOX-AUDIT_v1.0.md` (Option A, 2026-07-09) in light of the
W2-CORE-4 builder's **Flag-and-Halt** (`governanceReviews/milestones/w2-core-4/HANDOFF-NOTE.md` +
`COMPLETION-REPORT.md`), which verified — against the **frozen** `Doc-4B §B6`/`§B10` + `Doc-2 §10.1` —
that three of Option A's five audit legs have **no realizable state transition** without inventing
frozen state or altering frozen dispatch mechanics.
**Channel:** the `[D-5]` carried-dependency channel (Doc-4B / W2-CORE-2 / W2-CORE-4).
**Non-authoritative** under the frozen corpus — coins nothing; on any conflict the frozen doc wins.

---

## 1. Why v1.0 could not be realized as written

Option A (v1.0) asked for **five** distinct immutable audit events: (1) created · (2) attempt ·
(3) success · (4) permanent-failure/park · (5) archive. Verified against the frozen corpus at the
build gate:

| Leg | Frozen basis | Realizable today? |
|---|---|---|
| **3. success** (`pending → dispatched`) | Frozen `Doc-4B §B6` **Mutation-Scope** of `core.phase2_dispatch_outbox_events.v1`; live CAS advance | ✅ Yes |
| **5. archive** (`dispatched → archived`) | Frozen `Doc-4B §B6` **Mutation-Scope** of `core.phase2_archive_dispatched_events.v1`; live CAS advance | ✅ Yes |
| **2. attempt** | No `attempting` state in `Doc-2 §10.1` (`pending → dispatched → archived`, three states); the winning attempt **IS** the advance | ⚠️ Collapses into Leg 3 |
| **4. permanent-failure / park** | Frozen `§B6`: park = "retain in `pending` with attempts at max… **no invented failure state**"; live `deadLettered` is a `count()`, not a transition | ⛔ No transition to audit |
| **1. created** | Row created by the Phase-1 producer `core.write_outbox_event.v1`, marked frozen `§B10` **`Audit-Required: n/a`** ("the business action is audited by the caller"); no producer/impl exists ([DC-1]) | ⛔ Not in these workers; frozen-`n/a` |

The audit **channel** is not the blocker: both workers already carry, in the frozen `§B6` text,
`Audit-Required: yes` → `Action-Ref: Doc-2 §9 (Platform) — "service-role sensitive operations"`.
The blocker is that Legs 1/2/4 would require **architecture-affecting frozen changes** (lift `§B10`
`Audit-Required: n/a`; introduce an `attempting`/park transition into `§B6` + `Doc-2 §10.1`) —
**human/Board approval only** (CLAUDE.md §7/§8). The builder correctly **Flag-and-Halted** rather
than invent state or write a partial design into the immutable ledger.

## 2. The ruling (owner, 2026-07-10)

Presented with the verified realizability analysis + two coupled decisions, the owner ruled:

**(a) Scope — realize the two clean transitions now; fold Leg 2; defer Legs 1 + 4.**
- **Legs 3 (dispatch success) + 5 (archive) — REALIZE NOW.** They are exactly the two frozen `§B6`
  Mutation-Scope transitions; no frozen change is needed.
- **Leg 2 (attempt) — FOLD** into its committed outcome (the CAS-winning advance IS the audited
  dispatch). No separate row; recorded as an additive `§B6` note (granularity), **not** a `Doc-2
  §10.1` change.
- **Legs 1 (created) + 4 (park) — DEFER.** Each is realizable only via a **future additive frozen
  patch** (Leg 1 → `Doc-4B §B10`; Leg 4 → `§B6`/`Doc-2 §10.1` park transition), which is
  architecture-affecting and needs human/Board approval, and — for Leg 1 — a producer that does not
  yet exist ([DC-1]). Carried, not dropped; fail-closed interim (no partial audit written).

**(b) Granularity — per-dispatch-run / batch (NOT per-event).**
- One immutable audit record per **worker pass that advanced ≥ 1 row**, summarizing the run
  (`dispatched`/`archived` count + batch size) — **not** one record per delivered event.
- This honours the frozen `§B6` interim binding ("dispatch-**RUN/batch** granularity, never per
  delivered event", with the per-event-recursion caution) — the same frozen line explicitly defers
  the **run-vs-event granularity** to this `[D-5]` decision — and matches Option A's own stated
  rationale ("reasonable audit volume… without excessive noise").
- **Noise rule (v1.0, preserved):** an empty pass (0 advances) writes **no** audit row; losing CAS
  racers, pure retries, and backoff-skips are never audited. Dead-letter (`deadLettered`) and
  reconciliation (`reconciledStuck`) counts are frozen `§B6`/`§17.1` **operational telemetry, not a
  business audit action** — they do **not** trigger an audit row.

## 3. Realization plan (per this ruling)

1. **Serialization (canonical-from-row-one, D7 rule 6):** an additive **`Doc-4B_OutboxAuditToken_
   Patch_v1.0`** pins the two run-level audit tokens + `entity_type` + `entity_id` semantics +
   value shape, **bound by pointer** to the enumerated `Doc-2 §9` Platform family "service-role
   sensitive operations" (no `Doc-2` patch — the family is enumerated; the "import job execution"
   §9 action is the run/job-level-audit precedent). Human-approval-pending; Review-A + Authority-Map
   registration pending. **No token is invented in code.**
2. **Code:** the two `§B6` workers append **one** System-attributed audit record per advancing run,
   on the worker's **own transaction** (atomic with the advances — D7 rule 5; rollback ⇒ zero
   advances + zero audit), non-`RETURNING`, via the M0 `core.append_audit_record.v1` facade. Dispatch
   mechanics untouched byte-for-byte (frozen `§B6` "PRESERVE the dispatch MECHANICS byte-for-byte").
3. **Deferred legs** remain carried `[D-5-LEG1-CREATED]` / `[D-5-LEG4-PARK]` on the Board channel
   (additive frozen patch + human approval) — never realized locally.

## 4. What this ruling does NOT do

- **Coins no frozen text.** The one realization artifact (`Doc-4B_OutboxAuditToken_Patch_v1.0`) is
  an owner-authorized **additive** patch, reviewed + Authority-Map-registered before merge (§8).
- **Alters no dispatch mechanics.** The CAS advance / retry / backoff / dead-letter / reconciliation
  behaviour is unchanged; only an atomic audit append is added on the advancing run.
- **Does not close Legs 1 + 4.** They stay open on the Board channel for a future additive frozen
  patch; this ruling neither builds nor forecloses them.

## 5. Entity-model ratification (Board, 2026-07-10)

The `Doc-4B_OutboxAuditToken_Patch_v1.0` §"Run-level entity_type" item was flagged as a judgment call
for Review-A. The Board **adjudicated it directly** (2026-07-10), approving the **run-level audit
model**:

- `entity_type = outbox_dispatch_run` and `entity_type = outbox_archive_run`.
- `entity_id` **MUST** be the per-run UUIDv7 generated for that dispatch/archive run.
- **Rationale (Board):** the audit record represents a dispatch/archive **execution run**, not
  individual outbox events; one successful run that advances ≥ 1 row produces **exactly one** immutable
  audit record; a failed or zero-advance run produces **none** — preserving deterministic, immutable,
  additive audit semantics.
- The `entity_type = outbox_events` + per-run-id alternative is **rejected**.

`Doc-4B_OutboxAuditToken_Patch_v1.0` is updated accordingly (status APPROVED); the realization then
runs the normal pipeline **Review-A → Team-6 Security → Review-B**, after which W2-CORE-4 closes and the
program continues to the Wave-2 Integration Audit.

---

*Non-authoritative Board-decision record. Refines v1.0; conforms upward (§7); coins nothing; edits no
frozen text. Authorized by the human owner per CLAUDE.md §7/§8/§13, 2026-07-10.*
