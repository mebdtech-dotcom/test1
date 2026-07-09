import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, describe, expect, it } from "vitest";
import { drainOutbox } from "@/modules/core/contracts";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// WP-1.8 [W1-JOBS-001] verification — the minimal M0 transactional-outbox dispatcher/drainer
// (`pending → dispatched`), unparked by Board ruling R-a on ESC-W1-OUTBOX. Boundary-legal: imports
// only `@/modules/core/contracts` (the M0 public surface) + `src/shared/*`; never a module internal.
//
// SYNTHETIC FIXTURE ONLY (R-a binding condition #1): the `core.outbox_events` rows seeded below are a
// BOOTSTRAP/TEST FIXTURE for architecture validation — NOT a domain event. No event is coined (nothing
// added to the Doc-2 §8 emitter set / Doc-4J catalog / Doc-4L flow). The drainer is EMITTER-AGNOSTIC:
// it drains whatever `pending` rows exist; in Wave 2 the SAME drainer drains real write-plus-emit rows
// (R-a binding condition #2) — only the row's origin differs.
//
// No teardown DELETE: `core.outbox_events` is APPEND-ONLY / DELETE-blocked by trigger (Doc-6B §4.1 /
// Invariant #8) — the table cannot be cleaned by deletion, by design. Each test instead seeds a FRESH
// UUIDv7 fixture id (the same M0 ID mechanism a real emitter uses), so runs never collide and every
// assertion is scoped to its own row (never a global count). The test DB is ephemeral.

const FIXTURE_EVENT_NAME = "test.wp18.synthetic_outbox_fixture" as const;
const FIXTURE_EVENT_VERSION = 1 as const;

/**
 * Seed one synthetic `pending` outbox row as the System/platform-staff actor (transaction-local GUC —
 * the same context the drainer uses; never session-global). This stands in for the row a real Wave-2
 * emitter will write in the same transaction as its business write. Returns the fresh fixture id.
 */
async function seedPendingFixture(): Promise<string> {
  const id = uuidv7(); // M0 ID mechanism (Doc-4B §8) — fresh per call; mirrors a real emitter's id.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    await tx.outboxEvent.create({
      data: {
        id,
        eventName: FIXTURE_EVENT_NAME,
        eventVersion: FIXTURE_EVENT_VERSION,
        payloadJsonb: { fixture: "wp18", note: "synthetic; not a domain event (R-a)" },
        // status defaults to 'pending'; attempts defaults to 0 (Doc-6B §3.2).
      },
    });
  });
  return id;
}

async function readStatus(
  id: string,
): Promise<{ status: string; dispatchedAt: Date | null; attempts: number } | null> {
  const row = await prisma.outboxEvent.findUnique({
    where: { id },
    select: { status: true, dispatchedAt: true, attempts: true },
  });
  return row
    ? { status: row.status, dispatchedAt: row.dispatchedAt, attempts: row.attempts }
    : null;
}

describe("WP-1.8 M0 outbox dispatcher/drainer (pending → dispatched)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("dispatches a synthetic pending row → dispatched (status + dispatched_at set, attempts bumped)", async () => {
    const id = await seedPendingFixture();

    // BEFORE: pending, no dispatched_at, attempts 0.
    const before = await readStatus(id);
    expect(before).not.toBeNull();
    expect(before!.status).toBe("pending");
    expect(before!.dispatchedAt).toBeNull();
    expect(before!.attempts).toBe(0);

    const result = await drainOutbox();
    expect(result.dispatched).toBeGreaterThanOrEqual(1);

    // AFTER: dispatched, dispatched_at set, attempts incremented.
    const after = await readStatus(id);
    expect(after).not.toBeNull();
    expect(after!.status).toBe("dispatched");
    expect(after!.dispatchedAt).not.toBeNull();
    expect(after!.attempts).toBe(1);
  });

  it("is IDEMPOTENT: a second drain re-dispatches nothing (the dispatched row is untouched)", async () => {
    const id = await seedPendingFixture();

    await drainOutbox();
    const afterFirst = await readStatus(id);
    const dispatchedAtAfterFirst = afterFirst!.dispatchedAt;
    expect(afterFirst!.status).toBe("dispatched");
    expect(afterFirst!.attempts).toBe(1);

    // Run AGAIN: the now-dispatched fixture is no longer `pending`, so it is not re-processed.
    await drainOutbox();
    const afterSecond = await readStatus(id);
    expect(afterSecond!.status).toBe("dispatched");
    expect(afterSecond!.attempts).toBe(1); // NOT 2 — never re-dispatched
    expect(afterSecond!.dispatchedAt).toEqual(dispatchedAtAfterFirst); // unchanged
  });

  it("drains multiple pending rows in one pass; a re-run drains nothing new for them", async () => {
    const idA = await seedPendingFixture();
    const idB = await seedPendingFixture();

    const first = await drainOutbox();
    expect(first.dispatched).toBeGreaterThanOrEqual(2);
    expect((await readStatus(idA))!.status).toBe("dispatched");
    expect((await readStatus(idB))!.status).toBe("dispatched");

    // Both already dispatched → a re-run advances neither; attempts stay at 1.
    await drainOutbox();
    expect((await readStatus(idA))!.attempts).toBe(1);
    expect((await readStatus(idB))!.attempts).toBe(1);
  });

  it("forward-only trigger still BLOCKS an illegal backward transition (dispatched → pending) [sanity]", async () => {
    const id = await seedPendingFixture();
    await drainOutbox();
    expect((await readStatus(id))!.status).toBe("dispatched");

    // Attempt the illegal backward transition directly as System/staff — the DB trigger
    // (core.outbox_status_forward_only, Doc-6B §4.1) must reject it.
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
        await tx.outboxEvent.update({
          where: { id },
          data: { status: "pending" },
        });
      }),
    ).rejects.toThrow(/forward-only|illegal status transition/i);

    // The row remains dispatched — the backward write never took effect.
    expect((await readStatus(id))!.status).toBe("dispatched");
  });

  it("archival leg (opt-in) is RETENTION-bounded: a fresh dispatched row is NOT archived; a row past retention IS; idempotent", async () => {
    const id = await seedPendingFixture();

    await drainOutbox(); // pending → dispatched (dispatched_at = now)
    expect((await readStatus(id))!.status).toBe("dispatched");

    // A JUST-dispatched row is inside the retention window (core.outbox_archive_retention) → NOT
    // archived (W2-CORE-2 hardening: archival is retention-bounded per Doc-4B §B6, not unconditional).
    await drainOutbox({ archive: true });
    expect((await readStatus(id))!.status).toBe("dispatched");

    // Backdate dispatched_at well past any plausible retention window (the exact bound is POLICY-owned;
    // dispatched_at is not a payload/identity column, so this staff-context raw update is permitted).
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
      await tx.$executeRawUnsafe(
        `UPDATE core.outbox_events SET dispatched_at = now() - interval '400 days' WHERE id = $1::uuid`,
        id,
      );
    });

    const archived = await drainOutbox({ archive: true }); // distinct archival leg
    expect(archived.archived).toBeGreaterThanOrEqual(1);
    expect((await readStatus(id))!.status).toBe("archived");

    // Re-run with archival on: the archived row is terminal — nothing further advances it.
    await drainOutbox({ archive: true });
    expect((await readStatus(id))!.status).toBe("archived");
  });
});
