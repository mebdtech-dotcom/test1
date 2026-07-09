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
    // attempts=1, last touched just now → inside the core.outbox_dispatch_backoff delay → left pending.
    const id = await seedPending({ attempts: 1, updatedAgoMs: 0 });

    const first = await dispatchOutboxEvents();
    expect(first.skippedBackoff).toBeGreaterThanOrEqual(1);
    const afterFirst = await readRow(id);
    expect(afterFirst!.status).toBe("pending"); // not advanced — backoff not elapsed
    expect(afterFirst!.attempts).toBe(1); // untouched

    // Move the last-attempt time well into the past (beyond any plausible per-attempt backoff delay).
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
    expect(afterSecond!.attempts).toBe(2); // one more attempt recorded
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
