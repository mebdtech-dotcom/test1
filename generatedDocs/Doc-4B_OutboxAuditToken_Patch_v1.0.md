# Doc-4B_OutboxAuditToken_Patch_v1.0.md

> **✅ STATUS: APPROVED + FOLDED into the corpus (human/Board ruling 2026-07-10; CLAUDE.md §8 HUMAN
> approval satisfied).** This is the corpus copy `generatedDocs/Doc-4B_OutboxAuditToken_Patch_v1.0.md`,
> registered in `00_AUTHORITY_MAP.md`, carried **alongside** the unedited frozen `Doc-4B_Content_v1.0_PassB`
> — **no frozen file edited in place.** Origin/provenance:
> `governanceReviews/Doc-4B_OutboxAuditToken_Patch_v1.0_PROPOSAL.md`. Governance pipeline **PASSED**
> (RV-0161): Review-A ✅ 0/0/0 · Team-6 Security ✅ 0/0/0 · Review-B ✅ 0/0/0 (1 MINOR folded).
>
> The Board ratified the **run-level audit model**: `entity_type = outbox_dispatch_run` /
> `outbox_archive_run`; `entity_id` **MUST** be the per-run UUIDv7 generated for that dispatch/archive
> run; one successful run that advances ≥ 1 row produces exactly one immutable audit record; failed /
> zero-advance runs produce none (deterministic, immutable, additive). The §"Run-level entity_type"
> judgment call is **adjudicated** (the `outbox_events`+run-id alternative is rejected).
>
> **Companion to `BOARD-DECISION-D5-OUTBOX-AUDIT_v1.1.md`** (the owner's 2026-07-10 scope + granularity
> ruling). This patch owns the **wire-level serialization**; the ruling owns the **decision**. A future
> change to *serialization* touches **this** patch, never the frozen `§B6` contract text.
>
> **Unlike `Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2`, this patch has NO Doc-2 companion:** the audit
> business action is the **already-enumerated** `Doc-2 §9` Platform family "service-role sensitive
> operations" — so, like the delegation/membership/role tokens, the tokens bind **by pointer** to an
> enumerated §9 action and **no `Doc-2` patch is authored.**

## Status

APPROVED — human/Board ruling 2026-07-10 (run-level model ratified). Governance pipeline
(Review-A → Team-6 → Review-B) + `00_AUTHORITY_MAP.md` registration + corpus fold PENDING.

| Field | Value |
|---|---|
| Applies to | `Doc-4B_Content_v1.0_PassB.md` §B6 — the two Phase-2 workers `core.phase2_dispatch_outbox_events.v1` + `core.phase2_archive_dispatched_events.v1`, and the frozen **[D-5] BOARD DECISION PENDING** note (§B6, PassB:385/456/534). |
| Produces | Doc-4B realization addendum **v1.0** — resolves the `[D-5]` audit-granularity gate on the two `§B6` workers (Legs 3 + 5 only; see the companion ruling for scope). |
| Depends on | **`BOARD-DECISION-D5-OUTBOX-AUDIT_v1.1.md`** (owner ruling: realize Legs 3+5; per-run/batch granularity; fold Leg 2; defer Legs 1+4). No `Doc-2` dependency — the §9 action family is enumerated. |
| Scope | **Pin the serialized realization** of the two run-level outbox audit actions — the `action` token strings, `entity_type`, `entity_id`, and `old_value`/`new_value` mapping — and **record the run/batch granularity** resolving the `§B6` [D-5] note. **Nothing else:** no business-action change (none — the §9 family is enumerated), no request/response shape change, no dispatch-mechanics change, no slug/error-code/idempotency change, no event, no schema change. |
| Purpose | Give W2-CORE-4 a **frozen serialization constant** so the two `§B6` workers encode canonical run-level `action` tokens (imported as M0-owned named constants, never hardcoded literals). Resolves `[D-5]` for the two realizable legs; leaves Legs 1 + 4 carried on the Board channel. |
| Authority | CLAUDE.md §7/§8/§11/§13; `Doc-2 §9` Platform "service-role sensitive operations" (enumerated business action family, by pointer); `Doc-4B` `core.append_audit_record.v1` §A10/§17.1 (append primitive + atomicity, unchanged); `Doc-4B §B6` (the two workers being realized); the realized `core.ActorType` enum (`'system'`) + the platform-staff `audit_records_context_append` RLS leg (ESC-W2-AUDIT-RLS = R-b / ADR-021). |

Doc-4B **redefines no mechanism and re-implements nothing.** The append stays
`core.append_audit_record.v1` only; the dispatch/archive mechanics (CAS advance, retry, backoff,
dead-letter park, reconciliation, retention) are **byte-for-byte unchanged** (frozen `§B6`: "PRESERVE
the dispatch MECHANICS byte-for-byte"). This patch pins **which `action` string** the append receives
on an advancing run, and **when** (granularity).

---

# PATCH-4B-OBAT-01 — Outbox Audit Token Realization (resolves `[D-5]` for Legs 3 + 5)

**Location:** §B6 — the **Audit Requirements** block of each worker (frozen text, PassB:453–459 dispatch
/ 531–537 archive) and the **[D-5] BOARD DECISION PENDING** note (PassB:385).

**Resolution (additive — the frozen lines are not edited in place; this records their realization):**

The `[D-5]` gate is **resolved for the two realizable legs**. Both workers' frozen `Action-Ref` already
binds to `Doc-2 §9 (Platform) — "service-role sensitive operations" (by pointer)`; that binding is
**unchanged**. This patch pins the **run-level serialization** and fixes the **granularity** the frozen
note deferred to the Board:

| Leg | §9 family (by pointer, enumerated) | `action` token | `entity_type` | `entity_id` | `old_value` | `new_value` |
|---|---|---|---|---|---|---|
| 3 — dispatch success | Platform "service-role sensitive operations" | `outbox_events_dispatched` | `outbox_dispatch_run` | the run's fresh UUIDv7 correlation id | `null` | `{ dispatched: <count>, batchSize: <cap> }` |
| 5 — archive | Platform "service-role sensitive operations" | `outbox_events_archived` | `outbox_archive_run` | the run's fresh UUIDv7 correlation id | `null` | `{ archived: <count>, batchSize: <cap> }` |

**Realization rules:**

- **Granularity — per-dispatch-run / batch (the [D-5] ruling).** Exactly **one** audit record per
  worker pass **that advanced ≥ 1 row** (`dispatched ≥ 1` / `archived ≥ 1`), summarizing the run —
  **not** one record per delivered event. This honours the frozen `§B6` note ("dispatch-**RUN/batch**
  granularity, never per delivered event", + the per-event-recursion caution); the same frozen line
  defers the run-vs-event choice to `[D-5]`, which this patch closes as **run/batch**.
- **Noise rule (Board v1.0, preserved).** An empty pass (0 advances) writes **no** record. Losing CAS
  racers, pure retries, and backoff-skips are never audited (they are not advances). `deadLettered`
  and `reconciledStuck` are frozen `§B6`/`§17.1` **operational telemetry, not a business audit
  action** — they do **not** trigger an audit row.
- **Run-level `entity_type` (Board-ADJUDICATED 2026-07-10).** The audited unit is the **service-role
  operation/run**, not a single `outbox_events` row (that is precisely what run/batch granularity
  means). Precedent: the enumerated `Doc-2 §9` Admin action **"import job execution"** audits the
  *job/run*, not each imported row. `entity_id` **MUST** be a **fresh UUIDv7 run-correlation id**
  (time-ordered; not a persisted `outbox_events` PK — there is no `outbox_dispatch_runs` table, by rule
  M0 has no aggregate). **The Board rejected** the alternative `entity_type = outbox_events` + per-run
  id (it would mis-signal that the id identifies one stream row) and ratified `outbox_dispatch_run` /
  `outbox_archive_run` with the per-run UUIDv7 `entity_id` (Board ruling 2026-07-10).
- **Token convention.** snake_case, past tense (`outbox_events_dispatched` / `outbox_events_archived`)
  — consistent with the corpus's snake_case structured codes and the M1 `*_created`/`*_changed`
  tokens. Two tokens (one per worker) so the immutable ledger distinguishes a dispatch run from an
  archive run.
- **Attribution — System.** `actor_type = 'system'` (realized lowercase `core.ActorType`),
  `actor_id = null`, `organization_id = null` (platform-scoped; `Doc-2 §9`/CR2). `ip_address`/
  `user_agent` = `null` (no HTTP caller). `timestamp` = the run time (append-primitive default).
- **`Correlation: phase2-origin` — subsumed by run/batch (Review-A OBS, 2026-07-10).** The frozen
  `§B6` audit block declares `Correlation: phase2-origin` (the per-event Phase-1 origin linkage, §17.2).
  A **run-level** record cannot carry it, by construction: one run advances many Phase-1 origins (no
  single linkage exists), the `core.audit_records` §9 field set (`Doc-2:679`) has **no**
  correlation/reference_id column, and `core.append_audit_record.v1` (§A10) exposes **no** correlation
  parameter. This is a direct, Board-authorized consequence of the run/batch granularity ruling — not a
  dropped obligation: per-event forensic linkage remains fully recoverable from `core.outbox_events`
  itself (each advanced row carries its own `status` + `dispatched_at`), and the run record adds the
  "System executed dispatch/archive at T advancing N" fact on top. `Attribution` and `Mutation-Scope`
  are unchanged; `Correlation` is **not applicable at run granularity** for these two workers.
- **Append path + atomicity.** Written via `core.append_audit_record.v1` **only** (Doc-4B §A10),
  **on the worker's own transaction** (atomic with the row advances — §17.1 / D7 rule 5): if the
  append throws, the advances roll back (**no advancing run without its audit**); the append follows
  the advances in the same tx (**no audit row without ≥ 1 advance**). Non-`RETURNING` (`createMany`,
  app-minted `audit_id`). Admitted on the **platform-staff** `audit_records_context_append` RLS leg —
  the workers already set `app.is_platform_staff = true` transaction-local (§B6 Actor: System).
- **Code binding (D7 rule 6).** M0 owns these constants (One Module, One Owner): a new
  `src/modules/core/domain/audit-actions.ts` exports `OUTBOX_DISPATCH_RUN_ENTITY_TYPE` /
  `OUTBOX_ARCHIVE_RUN_ENTITY_TYPE` + `OutboxAuditAction.{DISPATCHED,ARCHIVED}` — passed to
  `appendAuditRecord`, **never a hardcoded literal**. A future rename touches this constant + this
  patch, never the frozen `§B6` contract.

---

# Resulting §B6 Audit realization (additive record — frozen block unchanged)

Frozen (unchanged, both workers):

```
Audit-Required:  yes
Action-Ref:      Doc-2 §9 (Platform) — "service-role sensitive operations" (by pointer)   [D-5 — BOARD DECISION PENDING; …]
Attribution:     system
Mutation-Scope:  core.outbox_events (status column: pending → dispatched | dispatched → archived)
```

Realized (this patch): `[D-5]` resolved for these two legs — granularity **run/batch**; `action`
tokens `outbox_events_dispatched` / `outbox_events_archived`; `entity_type`
`outbox_dispatch_run` / `outbox_archive_run`; one System record per advancing run, atomic with the
advances. **Legs 1 (created) + 4 (park) remain carried** `[D-5-LEG1-CREATED]` / `[D-5-LEG4-PARK]` on
the Board channel (each realizable only via a future additive frozen patch + human approval — see the
companion ruling §1/§2/§3). Attribution/Mutation-Scope unchanged.

---

# Downstream

- **W2-CORE-4 (the two `§B6` workers):** `dispatchOutboxEvents` appends `outbox_events_dispatched`
  when `dispatched ≥ 1`; `archiveDispatchedEvents` appends `outbox_events_archived` when
  `archived ≥ 1` — via the exported M0 constants, on the worker's own transaction, through
  `appendAuditRecord`. Dispatch mechanics unchanged.
- **`core.write_outbox_event.v1` (Leg 1) + dead-letter park (Leg 4):** unaffected — still carried;
  no audit written for them (fail-closed interim).
- **Operational watch (Team-6 OBS, 2026-07-10) — audit-partition liveness coupling.** Because the audit
  append is atomic with the advances (D7 rule 5), outbox advancement now depends on the append
  committing. A future monthly `core.audit_records_YYYY_MM` partition provisioned WITHOUT its
  `…_context_append` INSERT policy (the exact risk the `20260630090000_audit_context_append_policy`
  migration's partition-rotation note already flags) would cause every advancing run to roll back and
  the outbox to stall — the correct **fail-closed** posture (safety over liveness; no data-integrity
  hole), but a runbook item: partition rotation MUST attach the staff `…_context_append` policy to each
  new audit partition. No change to this diff; forward-watch for the Doc-6B §3.1 partition-rotation runbook.

---

*End of Doc-4B_OutboxAuditToken_Patch_v1.0 (PROPOSED) — pins ONLY the run-level serialization (tokens,
entity_type, entity_id, value mapping) + the run/batch granularity of the two Doc-2 §9 "service-role
sensitive operations" outbox audit legs. No business-action change (the §9 family is enumerated — no
Doc-2 patch), no contract-shape change, no Doc-4B re-implementation, no dispatch-mechanics change, no
event/slug/schema change. Companion to BOARD-DECISION-D5-OUTBOX-AUDIT_v1.1. Frozen Doc-4B text not
edited in place. **APPROVED — Board ruling 2026-07-10 (run-level model ratified); Review-A → Team-6 →
Review-B + Authority-Map registration + corpus fold PENDING.***
