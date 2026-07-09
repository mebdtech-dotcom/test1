import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, describe, expect, it } from "vitest";
import { dispatchOutboxEvents } from "@/modules/core/contracts";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// W2-CORE-2 — Doc-8B §7 (8F) WRITE-PLUS-EMIT ATOMICITY FOUNDATION for the M0 transactional outbox
// (Doc-4B §B6 O-1: "insert exactly one `pending` row inside the caller's transaction"). Proves the
// foundation the whole outbox rests on: an outbox emit shares the caller's transaction with the
// business write — they COMMIT together or ROLL BACK together; an emit never leaks when the write
// aborts, and a dropped-write never leaves a phantom event. Boundary-legal: imports ONLY
// `@/modules/core/contracts` + `src/shared/*`.
//
// SINGLE-MODULE co-write: M0 owns no business entity, so the "business write" paired with the emit is
// a second M0-owned `core.system_configuration` row (CHK-6-030 mutable-config) — One Module, One Owner
// is intact (no cross-schema write). The pairing stands in for a real Wave-2 create-command that writes
// its business row and emits its outbox event in one transaction. The emit is a bootstrap FIXTURE, not
// a domain event (R-a); nothing is added to Doc-2 §8 / Doc-4J / Doc-4L.
//
// `core.outbox_events` is append-only / DELETE-blocked (Doc-6B §4.1); committed fixtures use a fresh
// UUIDv7 id and are asserted by id (never a global count). The paired `system_configuration` rows are
// mutable-config and are swept by the stable test-key prefix in the file-scoped afterAll.

const FIXTURE_EVENT_NAME = "test.w2core2.write_plus_emit_fixture" as const;
const CONFIG_KEY_PREFIX = "test_w2core2_atomicity." as const;

class RollbackSentinel extends Error {}

afterAll(async () => {
  await prisma.systemConfiguration.deleteMany({
    where: { key: { startsWith: CONFIG_KEY_PREFIX } },
  });
  await prisma.$disconnect();
});

/** A fresh (business-write key, emitted outbox id) pair for one write-plus-emit transaction. */
function freshPair(): { configKey: string; outboxId: string } {
  return { configKey: `${CONFIG_KEY_PREFIX}${uuidv7()}`, outboxId: uuidv7() };
}

describe("W2-CORE-2 write-plus-emit atomicity foundation (Doc-4B §B6 O-1 / Doc-8B 8F)", () => {
  it("COMMIT: a business write + its outbox emit persist together; the emitted row then enters the dispatch lifecycle", async () => {
    const { configKey, outboxId } = freshPair();

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
      // (a) the business write
      await tx.systemConfiguration.create({
        data: { id: uuidv7(), key: configKey, valueJsonb: 1, valueType: "integer" },
      });
      // (b) the outbox emit — same transaction (§B6 O-1)
      await tx.outboxEvent.create({
        data: {
          id: outboxId,
          eventName: FIXTURE_EVENT_NAME,
          eventVersion: 1,
          payloadJsonb: { fixture: "w2core2", note: "synthetic; not a domain event (R-a)" },
        },
      });
    });

    // Both committed atomically.
    expect(
      await prisma.systemConfiguration.findUnique({ where: { key: configKey } }),
    ).not.toBeNull();
    const emitted = await prisma.outboxEvent.findUnique({ where: { id: outboxId } });
    expect(emitted).not.toBeNull();
    expect(emitted!.status).toBe("pending");

    // FOUNDATION: the committed write-plus-emit row is drained identically to any other pending row
    // (emitter-agnostic, R-a) — the dispatch worker advances it pending → dispatched.
    await dispatchOutboxEvents();
    const afterDispatch = await prisma.outboxEvent.findUnique({ where: { id: outboxId } });
    expect(afterDispatch!.status).toBe("dispatched");
  });

  it("ROLLBACK: when the business write's transaction aborts, the outbox emit does NOT leak (both absent)", async () => {
    const { configKey, outboxId } = freshPair();

    let caught: unknown;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
        await tx.systemConfiguration.create({
          data: { id: uuidv7(), key: configKey, valueJsonb: 1, valueType: "integer" },
        });
        await tx.outboxEvent.create({
          data: {
            id: outboxId,
            eventName: FIXTURE_EVENT_NAME,
            eventVersion: 1,
            payloadJsonb: { fixture: "w2core2", note: "rolled back (R-a)" },
          },
        });
        throw new RollbackSentinel("abort the write-plus-emit transaction");
      });
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(RollbackSentinel);
    // Atomicity: neither the business write NOR the emit persisted — no phantom event.
    expect(await prisma.systemConfiguration.findUnique({ where: { key: configKey } })).toBeNull();
    expect(await prisma.outboxEvent.findUnique({ where: { id: outboxId } })).toBeNull();
  });
});
