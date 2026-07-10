import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, describe, expect, it } from "vitest";
import { archiveDispatchedEvents, dispatchOutboxEvents } from "@/modules/core/contracts";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// W2-CORE-2 — Doc-8B §7.2 outbox-OBSERVER band for the hardened Doc-4B §B6 dispatch/archive workers
// (`core.phase2_dispatch_outbox_events.v1` · `core.phase2_archive_dispatched_events.v1`). Boundary-
// legal: imports ONLY `@/modules/core/contracts` (the M0 public surface) + `src/shared/*` — never a
// module internal (eslint-plugin-boundaries: tests may reach `module-contracts`/`shared` only).
//
// SYNTHETIC FIXTURES ONLY (R-a): the `core.outbox_events` rows seeded below are bootstrap/test
// fixtures — NOT domain events (nothing added to Doc-2 §8 / Doc-4J / Doc-4L). The workers are
// EMITTER-AGNOSTIC: identical behavior on test-seeded vs. real Wave-2 write-plus-emit rows.
//
// ROW-SCOPED, NEVER GLOBAL-COUNT: `core.outbox_events` is APPEND-ONLY / DELETE-blocked by trigger
// (Doc-6B §4.1 / Invariant #8) — prior tests' rows persist. Every state assertion is scoped to a
// FRESH UUIDv7 fixture id; the mechanical run counters (deadLettered/skippedBackoff/reconciledStuck)
// are asserted `>= 1` (this row is among them), never as exact platform-wide totals.
//
// POLICY VALUES NEVER RESTATED (Doc-4A §18.2): where a seed needs a bound (max attempts, dlq policy),
// it reads the value back from the SEEDED `core.system_configuration` row — never a literal. Backoff /
// retention THRESHOLDS the fixtures cross (10 min, 400 days) are deliberately far beyond the POLICY-
// owned bounds (backoff cap, archive retention) so the test is independent of the exact stored values.
//
// The superuser test connection bypasses the platform-staff RLS backstop — the posture every existing
// M0 suite runs under (RLS = defense-in-depth, not the model).

const FIXTURE_EVENT_NAME = "test.w2core2.outbox_hardening_fixture" as const;
const FIXTURE_EVENT_VERSION = 1 as const;
const PAYLOAD = { fixture: "w2core2", note: "synthetic; not a domain event (R-a)" };

const MAX_ATTEMPTS_KEY = "core.outbox_dispatch_max_attempts" as const;
const DLQ_POLICY_KEY = "core.outbox_dlq_policy" as const;

interface SeedPendingOptions {
  /** Prior re-attempt count to stamp on the row (Doc-2 §10.1 `attempts`). Default 0. */
  attempts?: number;
  /** Age of `created_at` (ms in the past) — used to cross the reconciliation stuck threshold. */
  createdAgoMs?: number;
  /** Age of `updated_at` (ms in the past) — the last-attempt time the backoff gate reads. */
  updatedAgoMs?: number;
}

/**
 * Seed one `pending` fixture as the System/platform-staff actor (transaction-local GUC — the same
 * context the workers use). `created_at` is set on INSERT (permitted — the immutability trigger is
 * BEFORE UPDATE/DELETE only); `updated_at` (Prisma-managed) is set via a staff-context raw UPDATE
 * afterwards (it is not a payload/identity column, and status is unchanged so the forward-only trigger
 * is satisfied). Returns the fresh fixture id.
 */
async function seedPending(opts: SeedPendingOptions = {}): Promise<string> {
  const id = uuidv7();
  const now = Date.now();
  const createdAt = new Date(now - (opts.createdAgoMs ?? 0));
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    await tx.outboxEvent.create({
      data: {
        id,
        eventName: FIXTURE_EVENT_NAME,
        eventVersion: FIXTURE_EVENT_VERSION,
        payloadJsonb: PAYLOAD,
        status: "pending",
        attempts: opts.attempts ?? 0,
        createdAt,
      },
    });
    if (opts.updatedAgoMs !== undefined) {
      await tx.$executeRawUnsafe(
        `UPDATE core.outbox_events SET updated_at = $1::timestamptz WHERE id = $2::uuid`,
        new Date(now - opts.updatedAgoMs).toISOString(),
        id,
      );
    }
  });
  return id;
}

/** Seed one `dispatched` fixture directly (INSERT is not gated by the forward-only UPDATE trigger). */
async function seedDispatched(dispatchedAgoMs: number): Promise<string> {
  const id = uuidv7();
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    await tx.outboxEvent.create({
      data: {
        id,
        eventName: FIXTURE_EVENT_NAME,
        eventVersion: FIXTURE_EVENT_VERSION,
        payloadJsonb: PAYLOAD,
        status: "dispatched",
        dispatchedAt: new Date(Date.now() - dispatchedAgoMs),
      },
    });
  });
  return id;
}

async function readRow(
  id: string,
): Promise<{ status: string; attempts: number; dispatchedAt: Date | null } | null> {
  const row = await prisma.outboxEvent.findUnique({
    where: { id },
    select: { status: true, attempts: true, dispatchedAt: true },
  });
  return row
    ? { status: row.status, attempts: row.attempts, dispatchedAt: row.dispatchedAt }
    : null;
}

/**
 * Poll (yielding via setImmediate, no fixed sleep) until some backend is blocked SPECIFICALLY BY
 * `blockerPid` — i.e. the dispatch worker's per-row advance is queued behind THIS racer's row lock.
 *
 * WI-CAS-FLAKE root-cause fix (RV-0146 OBS-1 — "waitUntilAnyBackendBlocked bounded-poll throw under
 * load"): the prior barrier had two races. (1) It matched ANY blocked backend platform-wide
 * (`cardinality(pg_blocking_pids(pid)) > 0`), so an unrelated backend blocked elsewhere on the shared
 * server (another suite/session under load) could satisfy it and release the lock BEFORE the worker
 * was queued on OUR row. Scoping to the racer's backend PID cures this: the racer holds ONLY our
 * fixture row's `FOR UPDATE` lock, so any backend it blocks is provably blocked on OUR row. (2) The
 * bound was a fixed 500-iteration count that can EXHAUST before a load-slowed worker reaches its
 * advance (the observed intermittent throw); a generous WALL-CLOCK deadline removes that false-throw
 * while still failing loud (never vacuously) if the worker genuinely never contends.
 */
async function waitUntilBlockedBy(blockerPid: number): Promise<void> {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const rows = await prisma.$queryRawUnsafe<Array<{ blocked: number }>>(
      `SELECT count(*)::int AS blocked FROM pg_stat_activity WHERE $1::int = ANY(pg_blocking_pids(pid))`,
      blockerPid,
    );
    if ((rows[0]?.blocked ?? 0) > 0) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  throw new Error(
    `dispatch worker never blocked on the racer-held row lock (blocker pid ${blockerPid}) within 15s (CAS race not reproduced)`,
  );
}

async function seededNumber(key: string): Promise<number> {
  const row = await prisma.systemConfiguration.findUnique({
    where: { key },
    select: { valueJsonb: true },
  });
  expect(row, `seed row missing for ${key}`).not.toBeNull();
  return row!.valueJsonb as number;
}

describe("W2-CORE-2 core.phase2_dispatch_outbox_events.v1 — retry/backoff + dead-letter + reconciliation (Doc-4B §B6)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("BACKOFF: a recently re-attempted pending row is NOT re-attempted this pass; once its backoff elapses it advances", async () => {
    // Seed attempts NEAR the ceiling (max−1): the exponential backoff has saturated at the POLICY CAP
    // (minutes), so the "not yet elapsed" phase is governed by the cap — no implicit ~2s real-clock
    // margin that a cold/slow CI could cross (B-2). Value-agnostic: the ceiling is read from the seed.
    const nearCeiling = (await seededNumber(MAX_ATTEMPTS_KEY)) - 1;
    const id = await seedPending({ attempts: nearCeiling, updatedAgoMs: 0 });

    const first = await dispatchOutboxEvents();
    expect(first.skippedBackoff).toBeGreaterThanOrEqual(1);
    const afterFirst = await readRow(id);
    expect(afterFirst!.status).toBe("pending"); // not advanced — cap-governed backoff not elapsed
    expect(afterFirst!.attempts).toBe(nearCeiling); // untouched

    // Move the last-attempt time well into the past (beyond the backoff cap).
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
      await tx.$executeRawUnsafe(
        `UPDATE core.outbox_events SET updated_at = now() - interval '10 minutes' WHERE id = $1::uuid`,
        id,
      );
    });

    await dispatchOutboxEvents();
    const afterSecond = await readRow(id);
    expect(afterSecond!.status).toBe("dispatched"); // backoff elapsed → advanced
    expect(afterSecond!.attempts).toBe(nearCeiling + 1); // one more attempt recorded
  });

  it("DEAD-LETTER PARK: a pending row at the max-attempts ceiling is retained (never advanced, never dropped) and counted per core.outbox_dlq_policy", async () => {
    const maxAttempts = await seededNumber(MAX_ATTEMPTS_KEY); // POLICY value; never a literal here
    const id = await seedPending({ attempts: maxAttempts, updatedAgoMs: 10 * 60_000 });

    const result = await dispatchOutboxEvents();
    expect(result.deadLettered).toBeGreaterThanOrEqual(1);

    // Parked: retained in `pending`, attempts unchanged, never advanced — and never deleted (§B6).
    const after = await readRow(id);
    expect(after).not.toBeNull();
    expect(after!.status).toBe("pending");
    expect(after!.attempts).toBe(maxAttempts);

    // The governing dead-letter policy is surfaced on the run, equal to its seeded row (not restated).
    const dlqRow = await prisma.systemConfiguration.findUnique({ where: { key: DLQ_POLICY_KEY } });
    expect(result.dlqPolicy).toBe(dlqRow!.valueJsonb);
  });

  it("RECONCILIATION: a pending row stuck beyond the expected dispatch latency (attempts in [1,max)) is flagged", async () => {
    // created long ago (beyond the backoff cap), re-attempted recently (so it stays pending this pass) →
    // the reconciliation sweep counts it as stuck.
    const id = await seedPending({ attempts: 1, createdAgoMs: 10 * 60_000, updatedAgoMs: 0 });

    const result = await dispatchOutboxEvents();
    expect(result.reconciledStuck).toBeGreaterThanOrEqual(1);
    expect(result.skippedBackoff).toBeGreaterThanOrEqual(1);
    expect((await readRow(id))!.status).toBe("pending"); // still pending — recon flags, does not drop
  });

  it("a fresh pending row still dispatches normally (attempts 0 → dispatched, attempts 1)", async () => {
    const id = await seedPending();
    await dispatchOutboxEvents();
    const after = await readRow(id);
    expect(after!.status).toBe("dispatched");
    expect(after!.attempts).toBe(1);
  });

  it("LAST-PERMITTED ATTEMPT: a pending row at attempts = max−1 (backoff elapsed) still dispatches — never prematurely parked", async () => {
    // `attempts = max − 1` is the LAST re-attempt-eligible value (strictly < the dead-letter ceiling).
    // Backoff moved well past the cap so timing is not the gate — this pins the ceiling boundary itself:
    // a `lt: max − 1` premature-park off-by-one would park this row (deadLettered) instead of advancing
    // it (B-3). The at-ceiling side is already pinned by the DEAD-LETTER PARK case.
    const maxAttempts = await seededNumber(MAX_ATTEMPTS_KEY);
    const id = await seedPending({ attempts: maxAttempts - 1, updatedAgoMs: 10 * 60_000 });

    await dispatchOutboxEvents();

    const after = await readRow(id);
    expect(after!.status).toBe("dispatched"); // advanced, NOT parked
    expect(after!.attempts).toBe(maxAttempts); // the final permitted attempt recorded
  });

  it("BATCH SIZE caps rows advanced per dispatch pass (oldest-first) and per archive pass", async () => {
    // Two dispatch-eligible rows made the OLDEST pending rows in the table (createdAgo ≈ 1yr) so the
    // oldest-first candidate scan puts them at the FRONT deterministically — no other test seeds
    // year-old pending rows (B-3 batchSize exercise, dispatch worker).
    const older = await seedPending({ createdAgoMs: 366 * 86_400_000 });
    const newer = await seedPending({ createdAgoMs: 365 * 86_400_000 });

    const pass1 = await dispatchOutboxEvents({ batchSize: 1 });
    expect(pass1.dispatched).toBe(1); // the cap advanced exactly one row this pass
    expect((await readRow(older))!.status).toBe("dispatched"); // oldest advanced first
    expect((await readRow(newer))!.status).toBe("pending"); // capped out — deferred to a later tick

    const pass2 = await dispatchOutboxEvents({ batchSize: 1 });
    expect(pass2.dispatched).toBe(1);
    expect((await readRow(newer))!.status).toBe("dispatched"); // now the oldest pending → advanced

    // Archive worker honours batchSize too: two archive-eligible rows, batchSize:1 leaves one behind.
    const arcA = await seedDispatched(400 * 86_400_000);
    const arcB = await seedDispatched(400 * 86_400_000);
    const arch = await archiveDispatchedEvents({ batchSize: 1 });
    expect(arch.archived).toBeGreaterThanOrEqual(1);
    const stillDispatched = [await readRow(arcA), await readRow(arcB)].filter(
      (r) => r!.status === "dispatched",
    ).length;
    expect(stillDispatched).toBeGreaterThanOrEqual(1); // batchSize:1 could not archive both this pass
  });

  it("CAS: a row advanced by a concurrent pass between selection and advance is NOT re-advanced (attempts/dispatched_at truthful)", async () => {
    // Deterministic, sleep-free lost-race reproduction (B-1). A lock-holding transaction stands in for
    // the CONCURRENT pass: it locks the row `FOR UPDATE` so the dispatch worker BLOCKS on its per-row
    // advance AFTER it has already SELECTed the row as `pending` (a lock-free SELECT is never blocked).
    // We poll pg_stat_activity until the worker is provably blocked, then the racer advances the row
    // (its OWN earlier `dispatched_at` + a single attempt bump) and COMMITS, freeing the worker. Under
    // the write-time compare-and-set the worker's advance re-checks `status = pending`, matches ZERO
    // rows and is a no-op — `attempts` is not double-bumped and `dispatched_at` is not overwritten.
    // Under the OLD `update({ where: { id } })` the worker's same-state `dispatched → dispatched` write
    // WOULD land — attempts → 2, dispatched_at → the worker's later `now` — failing both pins.
    const id = await seedPending();
    const racerDispatchedAt = new Date(Date.now() - 60_000); // distinct, earlier than any worker `now`

    let releaseLock!: () => void;
    const lockReleased = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    // The racer resolves this with its backend PID the instant it PROVABLY HOLDS the row lock. Two
    // determinism roles: the worker is started only AFTER the lock is held (removes the racer-acquire-
    // vs-worker-start race), and the PID scopes the block barrier to THIS racer (removes the shared-
    // server false-positive) — see `waitUntilBlockedBy`.
    let markRacerHoldingLock!: (pid: number) => void;
    const racerHoldsLock = new Promise<number>((resolve) => {
      markRacerHoldingLock = resolve;
    });

    const racer = prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
        // Hold the row lock so the worker blocks on its ADVANCE (not on its lock-free candidate SELECT).
        await tx.$executeRawUnsafe(
          `SELECT id FROM core.outbox_events WHERE id = $1::uuid FOR UPDATE`,
          id,
        );
        // Signal the row lock is held (this backend now owns ONLY our fixture row's lock) + expose the
        // backend PID the barrier scopes to.
        const pidRows = await tx.$queryRawUnsafe<Array<{ pid: number }>>(
          `SELECT pg_backend_pid()::int AS pid`,
        );
        markRacerHoldingLock(pidRows[0]!.pid);
        await lockReleased;
        // Racer wins: advance to dispatched with its OWN dispatched_at + a single attempt bump, then
        // COMMIT (callback return) — releasing the lock the worker's advance is queued behind.
        await tx.$executeRawUnsafe(
          `UPDATE core.outbox_events SET status = 'dispatched', dispatched_at = $1::timestamptz, attempts = attempts + 1 WHERE id = $2::uuid`,
          racerDispatchedAt.toISOString(),
          id,
        );
      },
      { timeout: 20_000, maxWait: 15_000 },
    );

    const racerPid = await racerHoldsLock; // lock provably held BEFORE the worker starts (no acquire race)
    const worker = dispatchOutboxEvents();
    await waitUntilBlockedBy(racerPid); // no fixed sleep — poll until the worker is blocked BY the racer
    releaseLock();
    await Promise.all([racer, worker]);

    const after = await readRow(id);
    expect(after!.status).toBe("dispatched");
    expect(after!.attempts).toBe(1); // racer's single bump — NOT 2 (old non-CAS write double-bumps)
    expect(after!.dispatchedAt!.getTime()).toBe(racerDispatchedAt.getTime()); // NOT overwritten to `now`
  });
});

describe("W2-CORE-2 core.phase2_archive_dispatched_events.v1 — retention-bounded archival (Doc-4B §B6)", () => {
  it("archives ONLY dispatched rows past core.outbox_archive_retention; a fresh dispatched row is left untouched", async () => {
    const oldId = await seedDispatched(400 * 86_400_000); // well past any plausible retention window
    const freshId = await seedDispatched(0); // just dispatched → inside the retention window

    const result = await archiveDispatchedEvents();
    expect(result.archived).toBeGreaterThanOrEqual(1);

    expect((await readRow(oldId))!.status).toBe("archived");
    expect((await readRow(freshId))!.status).toBe("dispatched"); // retention not elapsed → untouched
  });

  it("is IDEMPOTENT: a re-run does not re-advance an already-archived row", async () => {
    const id = await seedDispatched(400 * 86_400_000);
    await archiveDispatchedEvents();
    expect((await readRow(id))!.status).toBe("archived");
    await archiveDispatchedEvents();
    expect((await readRow(id))!.status).toBe("archived"); // terminal — unchanged
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// W2-CORE-4 — the [D-5] outbox audit leg (RUN/BATCH granularity). Doc-4B_OutboxAuditToken_Patch_v1.0
// (PROPOSED) + BOARD-DECISION-D5-OUTBOX-AUDIT_v1.1: each §B6 worker appends ONE System-attributed
// immutable audit record per run that ADVANCED ≥ 1 row (Leg 3 dispatch success + Leg 5 archive; Leg 2
// folded into the advance; Legs 1+4 carried, never written). Verified vs real Postgres.
//
// Token/entity strings are hardcoded expectations here — a TEST oracle asserting the frozen
// serialization. The "named-constant, never a literal" rule (Board 2026-06-30) governs PRODUCTION code;
// and eslint-plugin-boundaries forbids a test importing the M0 domain constant (a module internal —
// tests reach only module-contracts/shared). Delta-counting scopes each assertion to its own run
// (append-only `core.audit_records`; tests within a file run sequentially).
const DISPATCH_RUN_ACTION = "outbox_events_dispatched" as const;
const DISPATCH_RUN_ENTITY = "outbox_dispatch_run" as const;
const ARCHIVE_RUN_ACTION = "outbox_events_archived" as const;
const ARCHIVE_RUN_ENTITY = "outbox_archive_run" as const;

async function countAudit(action: string): Promise<number> {
  return prisma.auditRecord.count({ where: { action } });
}

async function latestAudit(action: string) {
  return prisma.auditRecord.findFirst({ where: { action }, orderBy: { auditId: "desc" } });
}

describe("W2-CORE-4 [D-5] outbox audit leg — run/batch granularity (Doc-4B §B6 · Doc-4B_OutboxAuditToken_Patch_v1.0)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("DISPATCH RUN: a pass that advances MULTIPLE rows appends EXACTLY ONE System-attributed run-level audit record (one-per-run, NOT one-per-event)", async () => {
    // Seed TWO fresh advanceable rows so the run provably advances ≥ 2 — this is what deterministically
    // distinguishes one-per-RUN from a one-per-EVENT regression (Review-B MINOR): a per-event impl would
    // write ≥ 2 records here, a per-run impl exactly 1.
    await seedPending();
    await seedPending();

    const before = await countAudit(DISPATCH_RUN_ACTION);
    const result = await dispatchOutboxEvents();
    const after = await countAudit(DISPATCH_RUN_ACTION);

    expect(result.dispatched).toBeGreaterThanOrEqual(2); // ≥ 2 rows advanced this run…
    expect(after - before).toBe(1); // …yet EXACTLY one run-level record (one-per-run, not per-event)

    const row = await latestAudit(DISPATCH_RUN_ACTION);
    expect(row).not.toBeNull();
    expect(row!.actorType).toBe("system"); // System-attributed (§B6 Actor: System)
    expect(row!.actorId).toBeNull();
    expect(row!.organizationId).toBeNull(); // platform-scoped; no active-org
    expect(row!.entityType).toBe(DISPATCH_RUN_ENTITY); // the RUN is the audited unit, not a row
    expect(typeof row!.entityId).toBe("string"); // a fresh per-run UUIDv7 correlation id
    expect((row!.newValue as { dispatched: number }).dispatched).toBe(result.dispatched);
  });

  it("NOISE RULE: a fully-drained dispatch pass (0 advances) writes NO audit record even when dead-letter telemetry fires", async () => {
    // A parked (dead-letter) row keeps deadLettered ≥ 1; it never advances (attempts ≥ max), so once the
    // advanceable backlog is drained the next pass advances 0 while telemetry still fires — the exact
    // "telemetry ≠ business audit" case (§B6/§17.1). Deterministic; no reliance on take:0 semantics.
    const maxAttempts = await seededNumber(MAX_ATTEMPTS_KEY);
    await seedPending({ attempts: maxAttempts, updatedAgoMs: 10 * 60_000 }); // parked, counts to DLQ

    let guard = 0;
    while ((await dispatchOutboxEvents()).dispatched > 0) {
      if (++guard > 50) throw new Error("dispatch backlog did not drain within 50 passes");
    }

    const before = await countAudit(DISPATCH_RUN_ACTION);
    const result = await dispatchOutboxEvents(); // a genuinely zero-advance pass
    const after = await countAudit(DISPATCH_RUN_ACTION);

    expect(result.dispatched).toBe(0);
    expect(result.deadLettered).toBeGreaterThanOrEqual(1); // telemetry present…
    expect(after - before).toBe(0); // …but NO audit record (noise rule)
  });

  it("ARCHIVE RUN: a pass that archives MULTIPLE rows appends EXACTLY ONE System-attributed run-level audit record (one-per-run, NOT one-per-event)", async () => {
    // Two retention-elapsed dispatched rows so the run provably archives ≥ 2 — the one-per-run vs
    // one-per-event distinguisher (Review-B MINOR).
    await seedDispatched(400 * 86_400_000);
    await seedDispatched(400 * 86_400_000);

    const before = await countAudit(ARCHIVE_RUN_ACTION);
    const result = await archiveDispatchedEvents();
    const after = await countAudit(ARCHIVE_RUN_ACTION);

    expect(result.archived).toBeGreaterThanOrEqual(2); // ≥ 2 rows archived this run…
    expect(after - before).toBe(1); // …yet EXACTLY one run-level record (one-per-run, not per-event)

    const row = await latestAudit(ARCHIVE_RUN_ACTION);
    expect(row).not.toBeNull();
    expect(row!.actorType).toBe("system");
    expect(row!.actorId).toBeNull();
    expect(row!.organizationId).toBeNull();
    expect(row!.entityType).toBe(ARCHIVE_RUN_ENTITY);
    expect((row!.newValue as { archived: number }).archived).toBe(result.archived);
  });

  it("ARCHIVE NOISE RULE: a fully-drained archive pass (0 archived) writes NO audit record", async () => {
    let guard = 0;
    while ((await archiveDispatchedEvents()).archived > 0) {
      if (++guard > 50) throw new Error("archive backlog did not drain within 50 passes");
    }

    const before = await countAudit(ARCHIVE_RUN_ACTION);
    const result = await archiveDispatchedEvents();
    const after = await countAudit(ARCHIVE_RUN_ACTION);

    expect(result.archived).toBe(0);
    expect(after - before).toBe(0);
  });
});
