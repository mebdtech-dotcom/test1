# HANDOFF NOTE — Engineering (W2-CORE-4 builder) · [D-5] outbox audit-leg · SUSPENDED 2026-07-10

## 0. Header
- **Role / Work item:** Engineering (M0 builder) · **W2-CORE-4** ([D-5] outbox audit-leg) · packet:
  the W2-CORE-4 activation packet + `BOARD-DECISION-D5-OUTBOX-AUDIT_v1.0.md` (Option A).
- **Checkpoint SHA:** see `wp/2-core-4` HEAD (the fold-in commit — WI-CAS-FLAKE + RV-0145 NIT-1/OBS-2;
  ALL surviving work is committed at/before it). Branch: `wp/2-core-4` (off `a275bf0`).
- **Tracker row set to:** ⛔ (Flag-and-Halt — the audit-leg portion only; fold-ins DONE).
- **Suspends:** ONLY the "wire the 5 audit legs" objective. The two fold-ins are complete + verified
  (see `COMPLETION-REPORT.md`); nothing about them is parked.

## 1. Current state
Audit-leg realization stopped at the design-verification step (before any code): the five Board
Option-A legs were mapped against the **actual frozen** Doc-4B §B6 (dispatch/archive workers) + §B10
(`core.write_outbox_event.v1`) model. **No audit code was written and no audit row was persisted** —
by design (canonical-from-row-one). The independent fold-ins (test files only) are done and green.

## 2. Completed work
- **WI-CAS-FLAKE** deterministic fix — `tests/integration/outbox-dispatch-hardening.test.ts`
  (PID-scoped, wall-clock-bounded barrier + pre-start lock handshake). 8/8 isolated repeats · 9/9
  under an unrelated blocked backend · 382/382 ×2 full suite.
- **RV-0145 NIT-1 + OBS-2** — `tests/integration/core-cr4-immutability-triggers.test.ts` (comment
  four-edge inventory + `test.w2core3.*` fixture prefix).
- Gates: baseline **382/33** and after **382/33** · tsc 0 · eslint 0 · prettier clean.
- **Decisions made within packet scope (do NOT re-decide):**
  - The `[D-5]` **§9 near-pointer EXISTS** and is frozen in §B6: `Doc-2 §9 (Platform) —
    "service-role sensitive operations" (by pointer)` (§B6 lines 456/534; Doc-2 §9 line 695). **No
    Doc-2 §9 patch is needed; no token was coined.** The audit CHANNEL is not the blocker.
  - **Attempt ≡ Success** in the transport-less worker — not separable into two committed rows
    without inventing an `attempting` state the frozen model lacks (Doc-2 §10.1 status set =
    {pending, dispatched, archived}; §B6 Mutation-Scope = the single `pending → dispatched`).

## 3. Blocker
- **Exact blocker:** **Flag-and-Halt** — `BOARD-DECISION-D5-OUTBOX-AUDIT_v1.0.md` (Option A, 5 legs)
  **vs** frozen `Doc-4B_Content_v1.0_PassB.md` §B6 (transport-less workers) + §B10
  (`core.write_outbox_event.v1` `Audit-Required: n/a`) + Doc-2 §9/§10.1. **Three of the five legs
  have no realizable state-transition without inventing state or altering the frozen mechanics:**
  - **Leg 1 (created)** conflicts with frozen §B10: `core.write_outbox_event.v1` is
    `Audit-Required: n/a — the business action is audited by the caller, not by this service` (and no
    producer/impl exists — [DC-1]).
  - **Leg 2 (attempt)** is indistinguishable from **Leg 3 (success)** without an invented
    `attempting` state (packet's explicit halt condition).
  - **Leg 4 (permanent failure / park)** has no organic park transition — `attempts` increments only
    on the successful advance (which moves the row to `dispatched`), so a pending row never
    organically reaches the ceiling; `deadLettered` is a static count, not a transition. Auditing it
    would alter the frozen dispatch mechanics ("PRESERVE the dispatch MECHANICS byte-for-byte").
- **Why it hard-stops:** Legs 1/2/4 need frozen-doc changes (§B10 lift of `Audit-Required: n/a`;
  §B6 + Doc-2 §10.1 introduction of an `attempting`/park transition) — **architecture-affecting,
  human/Board approval only** (CLAUDE.md §7/§8). Writing a partial/unratified audit design into the
  immutable ledger violates the canonical-from-row-one prerequisite. Building around it is forbidden;
  "never resolve locally."
- **Escalation filed:** this note + `COMPLETION-REPORT.md` §2–4 → the **`[D-5]` Board channel**
  (`BOARD-DECISION-D5-OUTBOX-AUDIT_v1.0.md`). Full frozen citations are in the Completion Report.

## 4. Dependency
Board ruling on the realizable audit-leg design (§5 menu). **Nothing else** — the fold-ins are
independent and already merged-ready.

## 5. Next action (first thing the successor does) — recommended realizable design for the Board
Do NOT re-derive from scratch; ratify or amend this menu, then implement the ratified subset D7-atomic
(System actor, own tx, atomic with the state change):
1. **Legs 3 (success) + 5 (archive) — realize now.** They ARE the frozen §B6 Mutation-Scope
   transitions (`pending → dispatched`, `dispatched → archived`). Tokens (Doc-4C-class, M0-owned,
   bound by pointer to the §3 near-pointer): `outbox_event_dispatched` / `outbox_event_archived`.
   Append via `core.append_audit_record.v1` on the worker's own tx, `actorType:'system'`,
   `entityType:'outbox_event'`, `entityId = row.id`; rollback ⇒ zero audit (D7 invariants). Audit
   ONLY the CAS-winning advance (`advanced.count === 1`) — never losing racers, never pure retries
   (noise rule).
2. **Leg 2 (attempt) — collapse into its committed outcome.** Per Board realization plan §1 ("the
   CAS-winning attempt that ADVANCES state or parks"), the audited advance IS "the dispatch attempt
   that succeeded"; no separate row. Document via an additive **Doc-4B §B6 note** (granularity =
   per-state-transition, attempt-folded-into-outcome) — no Doc-2 §10.1 change.
3. **Leg 4 (permanent failure) — defer** until a real external transport makes parking organic, OR
   ratify an additive §B6/Doc-2 §10.1 model for a park transition. Not realizable in today's
   transport-less worker without altering mechanics.
4. **Leg 1 (created) — defer / patch §B10.** Requires an additive Doc-4B §B10 patch to lift
   `write_outbox_event`'s `Audit-Required: n/a` (if an infra-forensic "outbox created" audit distinct
   from the caller's §17 business audit is wanted); note the §B6-line-385 recursion caution. No
   producer/impl exists today ([DC-1]) regardless.

If the Board wants all five as distinct rows, that mandates the §B10 + §B6/§10.1 additive patches
above (human approval) — the builder must NOT invent the states/tokens.

## 6. Resume instructions
- **Reactivation packet =** the W2-CORE-4 packet + this note + the Board's [D-5] realization ruling.
- **Files to re-read first (≤3):** `generatedDocs/Doc-4B_Content_v1.0_PassB.md` §B6 (lines 379–549) +
  §B10 (lines 892–921) · `src/modules/core/infrastructure/events/drain-outbox.service.ts` (the CAS
  advance + the static dead-letter count) · `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`
  (D7).
- **Re-verify at resume (do NOT trust this note for these):** whether the Board ruling changed the
  frozen §B6/§B10 text (a new additive patch) · current `wave/2-core-platform` HEAD (this WP branched
  at `a275bf0`) · whether a real outbox transport / a producer path now exists (would change legs
  1/4 realizability).
- **Known traps:** the CORE-2 worker is **transport-less** — `attempts` increments on the *successful*
  advance, not on a delivery failure; do not assume a real-transport retry model. `write_outbox_event`
  is unimplemented in `src/`. Do not "fix" the dead-letter count into a transition — that alters
  frozen mechanics. The `.env.local` in the worktree points at an isolated DB (`ivendorz_wpcore4`) —
  gitignored, not part of the deliverable.

## 7. Context-destruction attestation
- This context is discarded on filing; nothing survives it except this note, the checkpoint SHA,
  and the tracker records (org plan §4 binding context-destruction rule · §9 r6–r8): **CONFIRMED**

## Frozen Authority Checklist

Before execution, the assignee confirms:

☑ All cited documents are frozen. (Doc-4B §B6/§B10, Doc-2 §9/§10.1 — frozen corpus.)
☑ Every cited section has been re-read verbatim. (Not paraphrased — line-anchored above.)
☑ No draft document is treated as authority. (Board decision is rank-2 governance, not rank-0; on
  conflict the frozen doc wins — CLAUDE.md §7.)
☑ Any uncertainty results in Flag-and-Halt. (This note is that halt.)
