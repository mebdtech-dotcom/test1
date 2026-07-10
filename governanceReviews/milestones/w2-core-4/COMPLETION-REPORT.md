# W2-CORE-4 — Completion Report (M0 hardening + [D-5] outbox audit-leg)

| Field | Value |
|---|---|
| Work package | **W2-CORE-4** — M0 hardening + the `[D-5]` outbox audit leg (FINAL Wave-2 M0 WP) |
| Branch | **`wp/2-core-4`** (off `wave/2-core-platform` HEAD `a275bf0`) |
| Baseline SHA | `a275bf0` — full wave suite **382 tests / 33 files PASS** (verified in an isolated worktree DB) |
| Outcome | **PARTIAL — fold-ins delivered + FLAG-AND-HALT on the audit-leg wiring.** The two independent Board-approved fold-ins (WI-CAS-FLAKE + RV-0145 NIT-1/OBS-2) are DONE, verified, committed. The **five audit legs are NOT wired** — three of the five conflict with the frozen Doc-4B §B6/§B10 outbox model and cannot be realized without inventing state or altering the frozen dispatch mechanics. Escalated via Handoff Note; **not resolved locally** (CLAUDE.md §7/§11; packet halt conditions). |
| Next gate | **Review-A · Team-6 pre-flag YES** (audit integrity + CR4′ immutability + System-attribution + the audit≠domain-event firewall) — for the fold-ins; the audit-leg design returns to the **Board** ([D-5] channel). |

---

## 0. Headline

The `[D-5]` audit-leg objective could not be completed as specified because the Board's Option-A
five-leg ruling, when confronted with the **actual frozen** Doc-4B §B6 (transport-less dispatch
worker) + §B10 (`core.write_outbox_event.v1` declared `Audit-Required: n/a`) model, requires — for
three of the five legs — either an invented state/token or an alteration of the frozen dispatch
mechanics the packet forbids. The packet anticipated exactly this ("If attempt and success cannot be
distinguished without inventing a state/token, Flag-and-Halt"; "apparent need to alter the dispatch
mechanics or coin an event → Flag-and-Halt via Handoff Note, never resolve locally").

**No audit rows were written.** Writing an unratified audit design into the immutable ledger would
violate the D7 governance prerequisite ("the audit action writes the immutable ledger — it must be
canonical from the first persisted row"). The full frozen-model analysis + a recommended realizable
design is handed to the Board in `HANDOFF-NOTE.md` (same directory).

---

## 1. Suite / gate evidence (before vs after)

| Gate | Baseline (`a275bf0`) | After fold-ins |
|---|---|---|
| Full wave suite (`npm test`) | **382 / 33 PASS** | **382 / 33 PASS** (run 2×, both green) |
| 8B outbox observer (`outbox-dispatch-hardening.test.ts`) | 9/9 | **9/9** (+ 8/8 isolated repeat runs; 9/9 under an unrelated blocked-backend load) |
| 8D immutability (`core-cr4-immutability-triggers.test.ts`) | 19/19 | **19/19** |
| `tsc --noEmit` | clean | **exit 0** |
| `eslint` (changed files) | clean | **exit 0** |
| `prettier --check` (changed files) | clean | **clean** |

Isolation note: the baseline + after suites were run in the **worktree** against a dedicated DB
(`ivendorz_wpcore4`) so runs never collided with the concurrent session on the main tree's `ivendorz`
DB (`.env.local` is gitignored — not committed).

---

## 2. FLAG-AND-HALT — the five audit legs vs the frozen §B6/§B10 model

**Channel:** `[D-5]` (Board). **Cite both:** `BOARD-DECISION-D5-OUTBOX-AUDIT_v1.0.md` (Option A, 5
legs) **vs** frozen `Doc-4B_Content_v1.0_PassB.md` §B6 (both worker contracts) + §B10
(`core.write_outbox_event.v1`) + Doc-2 §9 / §10.1.

The `[D-5]` **audit CHANNEL is NOT the blocker** — the §9 near-pointer EXISTS and is already frozen
(see §3). The blocker is that **three of the five legs have no realizable state-transition in the
frozen transport-less worker without inventing state or altering the frozen mechanics.**

| Leg (Board Option A) | Frozen realizability | Determination |
|---|---|---|
| **1 — Outbox record created** | The write path is `core.write_outbox_event.v1` (§B10), frozen **`Audit-Required: n/a — writing the outbox is the emit mechanism; the business action is audited by the caller (§17), not by this service`**. Also **not implemented** in `src/` (barrel exports only the workers) and **no producer exists** ([DC-1] — M0/M1 emit zero §8 events; rows are test-seeded). §B6 line 385 further cautions per-row/per-event audit "would recursively audit the delivery of audit events." | **CONFLICT** with frozen §B10 `Audit-Required: n/a`. Auditing "outbox created" at the write path overrides a frozen non-auditing declaration → additive **Doc-4B §B10 patch + human approval** required; not a builder decision. |
| **2 — Dispatch attempt** vs **3 — Dispatch success** | The worker is **transport-less**: delivery IS the `pending → dispatched` CAS advance (§B6 "this worker IS the delivery mechanism"; Mutation-Scope = the single `pending → dispatched` transition; `State-Machine-Effects: none`; Doc-2 §10.1 status set = {pending, dispatched, archived} only). The CAS-winning attempt IS the success — there is no committed "attempt" fact distinct from "success," and no "attempting" status to anchor one. | **INDISTINGUISHABLE without inventing** an intermediate `attempting` state/token the frozen model forbids — the packet's explicit halt condition. |
| **4 — Dispatch permanent failure (dead-letter park)** | In the frozen worker, `attempts` increments **only on the successful CAS advance** (drain-outbox.service.ts:138: `status:'dispatched', attempts:{increment:1}`), which moves the row OUT of `pending`. A pending row therefore **never organically accumulates attempts to the ceiling while staying pending → never organically parks.** `deadLettered` is a **static COUNT** of already-parked (test-seeded / future-real-transport) rows (drain-outbox.service.ts:96–98), NOT a transition the worker performs. | **NO realizable park transition.** Auditing "exactly once per state transition" would need either (a) altering the dispatch mechanics to write a park transition (forbidden — "PRESERVE the dispatch MECHANICS byte-for-byte"), (b) auditing the static count every pass (violates exactly-once), or (c) tracking already-audited-parked rows (new state — inventing). Halt condition: "apparent need to alter the dispatch mechanics." |
| **3 — Dispatch success** | The `pending → dispatched` CAS advance IS the §B6 dispatch-worker Mutation-Scope transition. | **CLEAN** — realizable now as a D7-atomic System audit; held pending full-design ratification. |
| **5 — Archive/retention** | The `dispatched → archived` CAS advance IS the §B6 archival-worker Mutation-Scope transition. | **CLEAN** — realizable now as a D7-atomic System audit; held pending full-design ratification. |

**Why halt the whole audit-leg design (not ship legs 3+5):** the five legs are ONE coherent
outbox-lifecycle audit design; legs 2/3/4 are entangled on the same dispatch worker (how "attempt"
and "park" are realized changes how "success" is tokenized). Shipping a 2-leg subset is itself a
local resolution of an unratified design and writes permanent audit history under it — barred by
"never resolve locally" (packet + CLAUDE.md §11) and the canonical-from-row-one prerequisite. The
Board must ratify the realizable design before the first immutable row.

**Recommended realizable design (for the Board — not applied):** see `HANDOFF-NOTE.md` §5. In brief:
realize legs 3 + 5 now (clean, bound to the §3 near-pointer); realize leg 2 as **collapsed into its
committed outcome** (the audited "dispatch attempt" IS the success/park — per the Board realization
plan §1 "the CAS-winning attempt that ADVANCES state or parks"), documented via an additive §B6
note; **defer legs 1 and 4** until a real external transport (or Board-approved additive §B10 / §B6
patches) provide their missing surfaces.

---

## 3. The five legs' §9 near-pointer binding (channel resolved — NOT the halt cause)

Per packet governing-doc 2 and the established `[ESC-*]` near-pointer convention, each leg's audit
`action` binds by pointer to the **nearest Doc-2 §9 action family**. That family EXISTS and is
already **frozen inside Doc-4B §B6 itself** for both workers:

> `Action-Ref: Doc-2 §9 (Platform) — "service-role sensitive operations" (by pointer)` — §B6 lines
> 456 (dispatch) & 534 (archive); `Attribution: system`.

Doc-2 §9 Platform domain row (line 695): *"system_configuration change, feature flag change, audit
redaction (event), Super Admin access (flagged), **service-role sensitive operations**."* This is the
identical near-pointer the identity module already uses by pointer for System/service-role
operations (`UserAccountAuditAction`, Doc-4C §C4 — "Domain Platform 'service-role sensitive
operations' by pointer").

**Conclusion: NO leg lacks a §9 near-pointer → NO Flag-and-Halt on the audit channel, and NO Doc-2
§9 patch is required.** The serialization tokens (Doc-4C-class, e.g. `outbox_event_dispatched` /
`outbox_event_archived` for the clean legs 3/5) would be M0-owned constants bound by pointer to this
frozen family — pinned only once the Board ratifies the full realizable design (§2). No token was
coined or written to code.

---

## 4. Attempt-vs-success resolution (frozen §B6 basis)

**Determination:** in the frozen transport-less dispatch worker, **"dispatch attempt" (leg 2) and
"dispatch success" (leg 3) are the SAME committed atomic action** — the `pending → dispatched`
CAS-winning advance. Basis, all frozen §B6:

- `core.phase2_dispatch_outbox_events.v1` **Mutation-Scope = the single `pending → dispatched`
  transition** (line 458); **`State-Machine-Effects: none`** (line 430).
- **Delivery IS the status transition** — "this worker IS the delivery mechanism for outbox events"
  (§B6 Trigger, line 409); there is no external transport that can be "attempted" then separately
  "succeed" (packet's own framing: "there is no external transport that can fail mid-attempt").
- Doc-2 §10.1 outbox status set is **{pending, dispatched, archived}** only — there is **no
  `attempting` status** to anchor a distinct committed "attempt" fact.
- Per-retry attempts are explicitly **"operational telemetry, not a business audit action (§17.1)"**
  (§B6 Reconciliation, line 447) — and are excluded by the Board noise rule anyway.

Recording a separate "attempt" audit row in the same atomic transaction as the "success" row would
be **fabricating a distinction the frozen model does not support** (both describe the one committed
transition; the "attempt" row carries no independent forensic fact). Per the packet, this is a
Flag-and-Halt, not a local fabrication. The **non-inventing realization** (recommended to the Board)
is to fold leg 2 into its committed outcome — the audited advance IS "the dispatch attempt that
succeeded"; the audited park (if/when a transport makes it organic) IS "the dispatch attempt that
permanently failed" — consistent with Board realization plan §1 ("the CAS-winning attempt that
ADVANCES state or parks").

---

## 5. WI-CAS-FLAKE — root cause + deterministic fix (DELIVERED)

**File:** `tests/integration/outbox-dispatch-hardening.test.ts` (the `CAS: a row advanced by a
concurrent pass…` test + its barrier helper).

**Root cause (why it flaked — RV-0146 OBS-1: "waitUntilAnyBackendBlocked bounded-poll throw under
load"):** the barrier that decides when to release the racer's row lock had two independent races:
1. **Wrong scope.** `waitUntilAnyBackendBlocked` matched **ANY** blocked backend platform-wide
   (`WHERE cardinality(pg_blocking_pids(pid)) > 0`). Under load (another suite/session on the shared
   server) an **unrelated** blocked backend satisfies the poll → `releaseLock()` fires **before** the
   dispatch worker is queued on OUR fixture row → the worker's CAS interleaves wrongly → the
   `attempts === 1` / `dispatched_at === racerDispatchedAt` pins false-fail.
2. **Wrong bound.** A fixed **500-iteration** `setImmediate` count can **exhaust before** a
   load-slowed worker reaches its advance → the helper throws "never blocked" (the observed
   intermittent symptom).

**Fix (root race, not `.skip`, not a loosened assertion):**
- **Scope the barrier to the racer's backend PID.** The racer captures `pg_backend_pid()` the instant
  it holds the `FOR UPDATE` lock and resolves it to the test; the new `waitUntilBlockedBy(racerPid)`
  polls `WHERE $1::int = ANY(pg_blocking_pids(pid))`. The racer holds **only** our fixture row's lock,
  so a backend it blocks is **provably** blocked on OUR row — unrelated blocks are ignored.
- **Handshake before starting the worker.** The worker is started only **after** `await racerHoldsLock`
  resolves — removing the racer-acquire-vs-worker-start race (the lock is provably held first).
- **Wall-clock deadline** (15 s) replaces the iteration count — a load-slowed worker no longer
  false-throws; the barrier still fails loud (never vacuous) if the worker genuinely never contends.

**Determinism evidence:** 8/8 isolated repeat runs green · **9/9 while an unrelated advisory-lock
blocked backend was held on the same DB the whole time** (directly exercising the false-positive the
old barrier tripped on) · 382/382 under two consecutive full-suite runs (the historical flake
condition).

---

## 6. RV-0145 hygiene folds (DELIVERED)

**File:** `tests/integration/core-cr4-immutability-triggers.test.ts`.
- **NIT-1 (comment undercount):** the forward-only block's comment said it adds "the two edges …
  same-state idempotent UPDATE, and an illegal FORWARD skip," but the block authors **four** cases,
  including an `archived → dispatched` backward reject that is a **distinct** edge from the drainer's
  cited `dispatched → pending`. Comment rewritten to inventory the four edges accurately and cite
  RV-0145 NIT-1. (Prose only — no test logic changed.)
- **OBS-2 (fixture-prefix cosmetic):** the audit fixture's `entity_type = core_cr4_fixture` /
  `action = cr4.archive_set_once.seed` did not carry the `test.` prefix the file's other fixtures use
  (`test.w2core3.*`); since audit rows are append-only/delete-blocked (permanent), aligned to
  `test.w2core3.cr4_fixture` / `test.w2core3.archive_set_once_seed`. Assertions read by `auditId`
  (ID), not by these strings — behavior unchanged.

---

## 7. Judgment-call log (every call)

1. **Isolated DB for the worktree** (`ivendorz_wpcore4`) rather than sharing the main tree's
   `ivendorz` DB — the concurrent session owns the main tree; the "review concurrency contamination"
   rule bars shared-DB full-suite runs during another session's window. `.env.local` gitignored.
2. **Baseline re-run in the worktree** after an accidental first run in the main tree — the true
   baseline must bind to `a275bf0`, not the concurrent branch's HEAD.
3. **§9 near-pointer = Platform "service-role sensitive operations"** (frozen in §B6 itself) — the
   audit channel is resolved by pointer; **no §9 patch, no coined token.** (Not a halt.)
4. **Attempt ≡ success in the transport-less worker** — not a fabricated two-row distinction (§4).
5. **Leg 4 has no organic park transition** — traced in code (attempts increment only on the
   successful advance) — auditing it would alter the frozen mechanics (§2).
6. **Leg 1 conflicts with frozen §B10 `Audit-Required: n/a`** — not overridable locally (§2).
7. **Halt the WHOLE audit-leg design, not ship legs 3+5** — the five legs are one entangled design;
   shipping a subset is a local resolution barred by "never resolve locally" + canonical-from-row-one.
8. **Deliver the independent fold-ins anyway** — WI-CAS-FLAKE + RV-0145 NIT-1/OBS-2 are Board-approved,
   independent of the audit design, verified green; net-positive regardless of the [D-5] ruling.
9. **CAS barrier: PID-scoped + wall-clock deadline + pre-start handshake** — the least-inventive fix
   for the documented root race; no assertion loosened, no `.skip`, no fixed sleep (setImmediate yield
   retained per the file's house style).

---

## 8. Discrimination / invariant evidence

- **Behavior-preserving dispatch mechanics:** ZERO change to `drain-outbox.service.ts` /
  `outbox-policy.ts` / `dispatch-outbox.ts` — the CAS advance, backoff, dead-letter, and
  reconciliation are byte-for-byte as CORE-2 built them (the Flag-and-Halt is precisely to avoid
  touching them).
- **[DC-1] respected:** no §8 domain event coined; no outbox row created by this WP; the audit legs
  (had they been wired) are `audit_records`, never events.
- **CR4′ immutability untouched:** the 8D suite is green; the only 8D change is prose + a test-shaped
  fixture-string prefix (append-only ledger semantics unchanged).
- **System-attribution / atomicity (design, not yet code):** the recommended clean legs (3/5) follow
  D7 verbatim — `actorType = 'system'`, appended on the worker's OWN tx executor, atomic with the
  state change (rollback ⇒ zero audit row). Documented for the Board; not written.
- **CAS-flake fix is discriminating:** proven to pass with an unrelated blocked backend present (the
  exact false-positive the old barrier tripped on) — a wrong fix would false-pass or false-throw.

---

## 9. Files

**Changed (committed on `wp/2-core-4`):**
- `tests/integration/outbox-dispatch-hardening.test.ts` — WI-CAS-FLAKE deterministic barrier fix.
- `tests/integration/core-cr4-immutability-triggers.test.ts` — RV-0145 NIT-1 (comment) + OBS-2
  (fixture prefix).

**Governance artifacts (this directory):**
- `COMPLETION-REPORT.md` (this file).
- `HANDOFF-NOTE.md` — the `[D-5]` audit-leg suspension artifact (Flag-and-Halt; the Board ruling to
  resume against).

**NOT touched (the Flag-and-Halt):** `src/modules/core/infrastructure/events/drain-outbox.service.ts`,
`outbox-policy.ts`, `audit-record.service.ts`, `contracts/*`, `inngest/functions/dispatch-outbox.ts`,
and any frozen doc.
