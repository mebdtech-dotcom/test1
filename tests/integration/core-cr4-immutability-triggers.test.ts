import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// W2-CORE-3 — Doc-8D CR4′ immutability band: the 5 column-scoped immutability triggers realized in
// `prisma/migrations/20260627183528_core_init/migration.sql` §(6) (Doc-6B §4.1). Each trigger is
// asserted for BOTH its rejected path (the immutability it enforces) AND its permitted path (so the
// gate proves the trigger is scoped correctly — not over-blocking a legal mutation).
//
// GAP-CHECK (per the W2-CORE-3 activation packet): payload/identity UPDATE-reject + DELETE-reject on
// `core.audit_records` are ALREADY covered by `audit-records-context-append-rls.test.ts` ("(h)" cases)
// — NOT duplicated here. The backward-transition reject on `core.outbox_events.status` is ALREADY
// covered by `outbox-drainer.test.ts` ("forward-only trigger still BLOCKS…") — NOT duplicated here.
// This file adds ONLY the previously-uncovered triggers/paths: `audit_records_archive_set_once`
// (entirely uncovered), `outbox_events_block_payload_mutation` (entirely uncovered), the forward-only
// trigger's same-state + illegal-skip edges (uncovered), `id_sequences_block_delete` (entirely
// uncovered — DELETE reject + UPDATE permitted), and an explicit CHK-6-030 mutable-config
// not-over-blocked proof for `system_configuration`/`feature_flags` (no trigger exists on either;
// this pins that fact rather than leaving it only incidental to other suites' cleanup calls).
//
// Superuser test connection (RLS bypassed) — the same posture every existing M0 trigger-adjacent
// suite runs under (`outbox-drainer.test.ts`, `outbox-dispatch-hardening.test.ts`): triggers fire
// regardless of RLS/role, so no restricted-role harness is needed for a DB-trigger-only assertion.
// Staff GUC is still set where a service-shaped write path is exercised, matching the existing style.

async function setStaffGuc(tx: { $executeRaw: (q: TemplateStringsArray) => Promise<unknown> }) {
  await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
}

describe("W2-CORE-3 — core.audit_records: audit_records_archive_set_once (Doc-6B §4.1)", () => {
  const AUDIT_ID = uuidv7();
  const ENTITY_ID = uuidv7();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("seed: one committed audit row with archived_at initially NULL", async () => {
    await prisma.$transaction(async (tx) => {
      await setStaffGuc(tx);
      await tx.$executeRawUnsafe(
        `INSERT INTO "core"."audit_records"
           (audit_id, actor_id, actor_type, organization_id, entity_type, entity_id, action, event_time)
         VALUES ($1::uuid, NULL, 'system'::"core"."ActorType", NULL, 'test.w2core3.cr4_fixture', $2::uuid, 'test.w2core3.archive_set_once_seed', now())`,
        AUDIT_ID,
        ENTITY_ID,
      );
    });
    const row = await prisma.auditRecord.findUnique({ where: { auditId: AUDIT_ID } });
    expect(row).not.toBeNull();
    expect(row!.archivedAt).toBeNull();
  });

  it("PERMITTED: first-time set of archived_at (NULL → timestamp) succeeds — not blocked by either trigger", async () => {
    // Not blocked by `audit_records_block_payload_mutation`: archived_at is absent from its protected
    // column list. Not blocked by `audit_records_archive_set_once`: OLD.archived_at IS NULL, so the
    // guard condition (`OLD.archived_at IS NOT NULL AND …`) is false.
    await prisma.$transaction(async (tx) => {
      await setStaffGuc(tx);
      await tx.$executeRawUnsafe(
        `UPDATE core.audit_records SET archived_at = now() WHERE audit_id = $1::uuid`,
        AUDIT_ID,
      );
    });
    const row = await prisma.auditRecord.findUnique({ where: { auditId: AUDIT_ID } });
    expect(row!.archivedAt).not.toBeNull();
  });

  it("REJECTED: re-setting an already-set archived_at to a DIFFERENT timestamp is trigger-blocked (set-once)", async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        await setStaffGuc(tx);
        await tx.$executeRawUnsafe(
          `UPDATE core.audit_records SET archived_at = now() + interval '1 hour' WHERE audit_id = $1::uuid`,
          AUDIT_ID,
        );
      }),
    ).rejects.toThrow(/archived_at is set-once/i);
  });

  it("REJECTED: clearing an already-set archived_at back to NULL is trigger-blocked (set-once, not clearable)", async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        await setStaffGuc(tx);
        await tx.$executeRawUnsafe(
          `UPDATE core.audit_records SET archived_at = NULL WHERE audit_id = $1::uuid`,
          AUDIT_ID,
        );
      }),
    ).rejects.toThrow(/archived_at is set-once/i);
  });

  it("PERMITTED: a same-value no-op UPDATE of the already-set archived_at is NOT blocked (IS DISTINCT FROM is false)", async () => {
    // Self-referential SET (archived_at = archived_at) — guaranteed byte-identical, no JS Date
    // round-trip (a re-serialized ISO string loses Postgres's microsecond precision and would falsely
    // register as DISTINCT). This isolates the trigger's same-value branch from serialization noise.
    const before = await prisma.auditRecord.findUnique({ where: { auditId: AUDIT_ID } });
    await prisma.$transaction(async (tx) => {
      await setStaffGuc(tx);
      await tx.$executeRawUnsafe(
        `UPDATE core.audit_records SET archived_at = archived_at WHERE audit_id = $1::uuid`,
        AUDIT_ID,
      );
    });
    const after = await prisma.auditRecord.findUnique({ where: { auditId: AUDIT_ID } });
    expect(after!.archivedAt!.getTime()).toBe(before!.archivedAt!.getTime());
  });
});

describe("W2-CORE-3 — core.outbox_events: outbox_events_block_payload_mutation (Doc-6B §4.1)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedRow(): Promise<string> {
    const id = uuidv7();
    await prisma.$transaction(async (tx) => {
      await setStaffGuc(tx);
      await tx.outboxEvent.create({
        data: {
          id,
          eventName: "test.w2core3.payload_immutability_fixture",
          eventVersion: 1,
          payloadJsonb: { fixture: "w2core3" },
        },
      });
    });
    return id;
  }

  it("REJECTED: UPDATE of event_name (protected identity column) is trigger-blocked", async () => {
    const id = await seedRow();
    await expect(
      prisma.$transaction(async (tx) => {
        await setStaffGuc(tx);
        await tx.$executeRawUnsafe(
          `UPDATE core.outbox_events SET event_name = 'tampered' WHERE id = $1::uuid`,
          id,
        );
      }),
    ).rejects.toThrow(/is immutable/i);
  });

  it("REJECTED: UPDATE of payload_jsonb (protected payload column) is trigger-blocked", async () => {
    const id = await seedRow();
    await expect(
      prisma.$transaction(async (tx) => {
        await setStaffGuc(tx);
        await tx.$executeRawUnsafe(
          `UPDATE core.outbox_events SET payload_jsonb = '{"tampered":true}'::jsonb WHERE id = $1::uuid`,
          id,
        );
      }),
    ).rejects.toThrow(/is immutable/i);
  });

  it("REJECTED: UPDATE of event_version (protected identity column) is trigger-blocked", async () => {
    const id = await seedRow();
    await expect(
      prisma.$transaction(async (tx) => {
        await setStaffGuc(tx);
        await tx.$executeRawUnsafe(
          `UPDATE core.outbox_events SET event_version = 2 WHERE id = $1::uuid`,
          id,
        );
      }),
    ).rejects.toThrow(/is immutable/i);
  });

  it("REJECTED: DELETE is trigger-blocked (append-only outbox)", async () => {
    const id = await seedRow();
    await expect(
      prisma.$transaction(async (tx) => {
        await setStaffGuc(tx);
        await tx.$executeRawUnsafe(`DELETE FROM core.outbox_events WHERE id = $1::uuid`, id);
      }),
    ).rejects.toThrow(/append-only|DELETE forbidden/i);
  });

  it("PERMITTED: UPDATE of a non-protected column (status → the next legal forward state) is NOT blocked by the payload trigger", async () => {
    // `status` is absent from the payload-mutation trigger's protected column list; only the SEPARATE
    // forward-only trigger governs it (asserted below). This pins that the payload trigger itself does
    // not over-block a legal status advance.
    const id = await seedRow();
    await prisma.$transaction(async (tx) => {
      await setStaffGuc(tx);
      await tx.$executeRawUnsafe(
        `UPDATE core.outbox_events SET status = 'dispatched', dispatched_at = now() WHERE id = $1::uuid`,
        id,
      );
    });
    const row = await prisma.outboxEvent.findUnique({ where: { id } });
    expect(row!.status).toBe("dispatched");
  });
});

describe("W2-CORE-3 — core.outbox_events: outbox_events_status_forward_only (Doc-6B §4.1)", () => {
  // Existing coverage (cited, not duplicated): `outbox-drainer.test.ts` "forward-only trigger still
  // BLOCKS an illegal backward transition (dispatched → pending)"; the legal forward edges
  // pending→dispatched and dispatched→archived are exercised continuously by the dispatch/archive
  // service suites (`outbox-dispatch-hardening.test.ts`, `outbox-drainer.test.ts`,
  // `outbox-write-plus-emit-atomicity.test.ts`). This block adds the four edges those suites do not
  // exercise: two same-state idempotent UPDATEs (pending→pending carrying a non-status column change,
  // and dispatched→dispatched), an illegal FORWARD skip (pending → archived), and an illegal BACKWARD
  // transition archived → dispatched — a DISTINCT edge from the drainer's cited dispatched → pending
  // (RV-0145 NIT-1: the prior "two edges" wording undercounted this block's own coverage).

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedRow(): Promise<string> {
    const id = uuidv7();
    await prisma.$transaction(async (tx) => {
      await setStaffGuc(tx);
      await tx.outboxEvent.create({
        data: {
          id,
          eventName: "test.w2core3.forward_only_fixture",
          eventVersion: 1,
          payloadJsonb: { fixture: "w2core3" },
        },
      });
    });
    return id;
  }

  it("PERMITTED: a same-state UPDATE (pending → pending) is idempotent, not blocked", async () => {
    const id = await seedRow();
    await prisma.$transaction(async (tx) => {
      await setStaffGuc(tx);
      await tx.$executeRawUnsafe(
        `UPDATE core.outbox_events SET status = 'pending', attempts = attempts + 1 WHERE id = $1::uuid`,
        id,
      );
    });
    const row = await prisma.outboxEvent.findUnique({ where: { id } });
    expect(row!.status).toBe("pending");
    expect(row!.attempts).toBe(1); // the non-status column change went through unimpeded
  });

  it("PERMITTED: a same-state UPDATE (dispatched → dispatched) is idempotent, not blocked", async () => {
    const id = await seedRow();
    await prisma.$transaction(async (tx) => {
      await setStaffGuc(tx);
      await tx.$executeRawUnsafe(
        `UPDATE core.outbox_events SET status = 'dispatched', dispatched_at = now() WHERE id = $1::uuid`,
        id,
      );
    });
    await prisma.$transaction(async (tx) => {
      await setStaffGuc(tx);
      await tx.$executeRawUnsafe(
        `UPDATE core.outbox_events SET status = 'dispatched' WHERE id = $1::uuid`,
        id,
      );
    });
    const row = await prisma.outboxEvent.findUnique({ where: { id } });
    expect(row!.status).toBe("dispatched");
  });

  it("REJECTED: an illegal FORWARD skip (pending → archived, bypassing dispatched) is trigger-blocked", async () => {
    const id = await seedRow();
    await expect(
      prisma.$transaction(async (tx) => {
        await setStaffGuc(tx);
        await tx.$executeRawUnsafe(
          `UPDATE core.outbox_events SET status = 'archived' WHERE id = $1::uuid`,
          id,
        );
      }),
    ).rejects.toThrow(/illegal status transition|forward-only/i);
    const row = await prisma.outboxEvent.findUnique({ where: { id } });
    expect(row!.status).toBe("pending"); // rejected write never took effect
  });

  it("REJECTED: an illegal BACKWARD transition (archived → dispatched) is trigger-blocked", async () => {
    const id = await seedRow();
    await prisma.$transaction(async (tx) => {
      await setStaffGuc(tx);
      await tx.$executeRawUnsafe(
        `UPDATE core.outbox_events SET status = 'dispatched', dispatched_at = now() WHERE id = $1::uuid`,
        id,
      );
      await tx.$executeRawUnsafe(
        `UPDATE core.outbox_events SET status = 'archived' WHERE id = $1::uuid`,
        id,
      );
    });
    await expect(
      prisma.$transaction(async (tx) => {
        await setStaffGuc(tx);
        await tx.$executeRawUnsafe(
          `UPDATE core.outbox_events SET status = 'dispatched' WHERE id = $1::uuid`,
          id,
        );
      }),
    ).rejects.toThrow(/illegal status transition|forward-only/i);
    const row = await prisma.outboxEvent.findUnique({ where: { id } });
    expect(row!.status).toBe("archived"); // rejected write never took effect
  });
});

describe("W2-CORE-3 — core.id_sequences: id_sequences_block_delete (Doc-6B §4.1; never-reused, Doc-2 §10.11)", () => {
  // Existing coverage (cited, not duplicated): `identity-provisioning.test.ts` exercises
  // `core.allocate_human_ref`'s real row-locked UPDATE path end-to-end (proving UPDATE is not
  // over-blocked, incidentally). This block adds the DELETE-reject the trigger exists for (entirely
  // uncovered) and an explicit direct UPDATE-permitted pin at the trigger level.

  // id_sequences rows can NEVER be deleted (the very trigger under test) — they accumulate across runs
  // by design, same as audit_records/outbox_events fixtures elsewhere in this suite. A fresh
  // uuidv7-derived entity_type per test invocation guarantees THIS run starts its own sequence at 1,
  // so the absolute-value assertions below are never a re-run collision with a prior run's leftover row.
  const ENTITY_TYPE = `W2C3${uuidv7().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
  const YEAR = 2031;

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("seed: one id_sequences row via the real allocator (core.allocate_human_ref)", async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ human_ref: string }>>(
      `SELECT core.allocate_human_ref($1, $2::integer) AS human_ref`,
      ENTITY_TYPE,
      YEAR,
    );
    expect(rows[0]!.human_ref).toBe(`${ENTITY_TYPE}-${YEAR}-000001`);
    const row = await prisma.idSequence.findUnique({
      where: { entityType_year: { entityType: ENTITY_TYPE, year: YEAR } },
    });
    expect(row).not.toBeNull();
    expect(row!.nextValue).toBe(2n);
  });

  it("PERMITTED: a direct UPDATE of next_value is NOT blocked (DELETE-only trigger; empty TG_ARGV)", async () => {
    await prisma.$executeRawUnsafe(
      `UPDATE core.id_sequences SET next_value = next_value + 1 WHERE entity_type = $1 AND year = $2::integer`,
      ENTITY_TYPE,
      YEAR,
    );
    const row = await prisma.idSequence.findUnique({
      where: { entityType_year: { entityType: ENTITY_TYPE, year: YEAR } },
    });
    expect(row!.nextValue).toBe(3n);
  });

  it("REJECTED: DELETE is trigger-blocked (never-reused allocation, Doc-2 §10.11)", async () => {
    await expect(
      prisma.$executeRawUnsafe(
        `DELETE FROM core.id_sequences WHERE entity_type = $1 AND year = $2::integer`,
        ENTITY_TYPE,
        YEAR,
      ),
    ).rejects.toThrow(/append-only|DELETE forbidden/i);
    // Row survives the rejected DELETE.
    const row = await prisma.idSequence.findUnique({
      where: { entityType_year: { entityType: ENTITY_TYPE, year: YEAR } },
    });
    expect(row).not.toBeNull();
  });
});

describe("W2-CORE-3 — CHK-6-030 mutable-config tables are NOT over-blocked (no trigger exists on either)", () => {
  // `system_configuration` and `feature_flags` carry ZERO immutability triggers (Doc-6B Appendix A
  // CHK-6-030: "DELETE permitted for admin ops — mutable configuration, not authoritative history").
  // Existing suites already rely on this incidentally via afterAll `deleteMany` cleanup
  // (`core-config-flag-reads.test.ts`, `outbox-write-plus-emit-atomicity.test.ts`) — this block makes
  // the fact an explicit, first-class assertion rather than leaving it implicit in teardown code.

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("PERMITTED: system_configuration UPDATE and DELETE both succeed (mutable config, no trigger)", async () => {
    const id = uuidv7();
    const key = `test.w2core3.mutable_config.${uuidv7()}`;
    await prisma.systemConfiguration.create({
      data: { id, key, valueJsonb: 1, valueType: "integer" },
    });

    await prisma.systemConfiguration.update({ where: { key }, data: { valueJsonb: 2 } });
    const updated = await prisma.systemConfiguration.findUnique({ where: { key } });
    expect(updated!.valueJsonb).toBe(2);

    await prisma.systemConfiguration.delete({ where: { key } });
    expect(await prisma.systemConfiguration.findUnique({ where: { key } })).toBeNull();
  });

  it("PERMITTED: feature_flags UPDATE and DELETE both succeed (mutable config, no trigger)", async () => {
    const id = uuidv7();
    const flagKey = `test.w2core3.mutable_flag.${uuidv7()}`;
    await prisma.featureFlag.create({ data: { id, flagKey, enabled: false } });

    await prisma.featureFlag.update({ where: { flagKey }, data: { enabled: true } });
    const updated = await prisma.featureFlag.findUnique({ where: { flagKey } });
    expect(updated!.enabled).toBe(true);

    await prisma.featureFlag.delete({ where: { flagKey } });
    expect(await prisma.featureFlag.findUnique({ where: { flagKey } })).toBeNull();
  });
});
