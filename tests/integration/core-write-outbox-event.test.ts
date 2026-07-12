import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "../../generated-contracts-registry/prisma";
import { writeOutboxEvent, CoreServiceError } from "@/modules/core/contracts";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-TRUST-3 (Part A) — `core.write_outbox_event.v1` (Doc-4B §B10): the producer-emit primitive — the twin
// of `core.append_audit_record.v1`. Proves, against a REAL PostgreSQL: (1) it inserts exactly one `pending`
// row with the frozen Doc-2 §10.1 columns on the caller's tx; (2) write-plus-emit atomicity via the PUBLIC
// primitive (a rollback leaves no row); (3) a failed INSERT (RLS-denied, non-staff) maps to the frozen error
// `core_outbox_write_failed` and rolls the caller's tx back (§16.2). Boundary-legal: imports ONLY
// `@/modules/core/contracts` + `src/shared/*` + the harness. It COINS NO event name (the caller supplies one).

// A synthetic fixture event NAME (not a Doc-2 §8 event — the primitive does NOT validate the catalog; this
// stands in for a real §8 emitter's name, as the W2-CORE-2 foundation fixture does — R-a; nothing is added
// to Doc-2 §8 / Doc-4J / Doc-4L).
const FIXTURE_EVENT_NAME = "test.w3trust3.write_outbox_primitive_fixture" as const;
const CONFIG_KEY_PREFIX = "test_w3trust3_outbox_primitive." as const;

class RollbackSentinel extends Error {}

function withParam(url: string, param: string): string {
  return url + (url.includes("?") ? "&" : "?") + param;
}

afterAll(async () => {
  await prisma.systemConfiguration.deleteMany({
    where: { key: { startsWith: CONFIG_KEY_PREFIX } },
  });
  await prisma.$disconnect();
});

describe("W3-TRUST-3 (Part A) — core.write_outbox_event.v1 (Doc-4B §B10)", () => {
  it("writes exactly ONE pending row with event_name/version/aggregate_id/payload on the caller's tx", async () => {
    const aggregateId = uuidv7();
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
      await writeOutboxEvent(
        {
          eventName: FIXTURE_EVENT_NAME,
          eventVersion: 1,
          aggregateId,
          payload: { note: "primitive-fixture (R-a)", n: 7 },
        },
        tx,
      );
    });

    const rows = await prisma.outboxEvent.findMany({ where: { aggregateId } });
    expect(rows).toHaveLength(1);
    const row = rows[0]!;
    // `id` is app-minted (UUIDv7) and NOT returned — the frozen contract declares Response: none
    // ([ESC-CORE-OUTBOX-MECH] Option A). Assert the persisted row's id SHAPE, not return equality.
    expect(row.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(row.eventName).toBe(FIXTURE_EVENT_NAME);
    expect(row.eventVersion).toBe(1);
    expect(row.aggregateId).toBe(aggregateId);
    expect(row.status).toBe("pending");
    expect(row.attempts).toBe(0);
    expect(row.payloadJsonb).toMatchObject({ note: "primitive-fixture (R-a)", n: 7 });
  });

  it("ATOMICITY: a business write + writeOutboxEvent roll back together (neither persists)", async () => {
    const configKey = `${CONFIG_KEY_PREFIX}${uuidv7()}`;
    const aggregateId = uuidv7();

    let caught: unknown;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
        await tx.systemConfiguration.create({
          data: { id: uuidv7(), key: configKey, valueJsonb: 1, valueType: "integer" },
        });
        await writeOutboxEvent(
          {
            eventName: FIXTURE_EVENT_NAME,
            eventVersion: 1,
            aggregateId,
            payload: { rolled: true },
          },
          tx,
        );
        throw new RollbackSentinel("abort the write-plus-emit transaction");
      });
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(RollbackSentinel);
    expect(await prisma.systemConfiguration.findUnique({ where: { key: configKey } })).toBeNull();
    expect(await prisma.outboxEvent.findMany({ where: { aggregateId } })).toHaveLength(0);
  });

  describe("RLS + error mapping (non-staff caller ⇒ core_outbox_write_failed, tx rolled back)", () => {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: withParam(process.env.DATABASE_URL ?? "postgresql://invalid", "connection_limit=1"),
        },
      },
    });

    beforeAll(async () => {
      // The restricted role needs the INSERT grant so a denied write is an RLS rejection, NOT a missing
      // grant (the `outbox_events_platform_staff` USING doubles as WITH CHECK — staff-only INSERT).
      await ensureRestrictedRlsRole();
      await prisma.$executeRawUnsafe(
        `GRANT INSERT ON core.outbox_events TO ${RESTRICTED_RLS_ROLE}`,
      );
    });

    afterAll(async () => {
      await client.$disconnect();
    });

    it("a NON-staff caller's outbox INSERT is RLS-denied → CoreServiceError(core_outbox_write_failed), rolled back", async () => {
      const aggregateId = uuidv7();
      let caught: unknown;
      try {
        await client.$transaction(async (tx) => {
          // Enter the NON-privileged role (RLS enforces); DO NOT set the staff GUC → WITH CHECK rejects.
          await tx.$executeRawUnsafe(`SET LOCAL ROLE ${RESTRICTED_RLS_ROLE}`);
          await writeOutboxEvent(
            {
              eventName: FIXTURE_EVENT_NAME,
              eventVersion: 1,
              aggregateId,
              payload: { denied: true },
            },
            tx,
          );
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(CoreServiceError);
      expect((caught as CoreServiceError).code).toBe("core_outbox_write_failed");
      // Rolled back — no phantom row (asserted on the superuser connection, which bypasses RLS).
      expect(await prisma.outboxEvent.findMany({ where: { aggregateId } })).toHaveLength(0);
    });
  });
});
