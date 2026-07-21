// M0 infrastructure — realizes `core.write_outbox_event.v1` (Doc-4B): appends exactly one
// `pending` envelope row to `core.outbox_events` (Doc-2 §10.1). This is M0 writing its OWN schema
// (allowed); emitting modules invoke it via the contract surface, injected by TYPE — never a raw
// cross-schema INSERT (One Module, One Owner). M0 TRANSPORTS the envelope and authors NO event:
// the name/version/payload are the emitting module's frozen Doc-2 §8 declaration (catalog =
// Doc-4J), bound by pointer.
//
// ATOMICITY (load-bearing — Doc-6A §7.1 write+emit): the append MUST ride the CALLER'S transaction
// (business write + event insert in ONE txn); callers therefore pass their transaction executor.
// The row `id` is a time-ordered UUIDv7 minted in-process (Doc-4B §8) and doubles as the envelope
// `event_id`; `occurred_at` is stamped here so every persisted payload carries the Doc-2 §8
// envelope fields without the caller restating them. Dispatch/архival is the SEPARATE Doc-4B §B6
// worker surface (`drain-outbox.service.ts`) — this service only appends `pending`.
//
// NON-RETURNING (the audit-record.service precedent): `createMany` (single-row) emits an INSERT
// with NO `RETURNING` clause. `core.outbox_events` SELECT is platform-staff-only RLS (`core_init`
// §7) — a `RETURNING` under a non-staff context would abort with SQLSTATE 42501 and roll back the
// caller's business write. The id is app-minted, so no DB-returned key is needed.
//
// RLS ADMISSION [logged judgment call — carried flag]: `core.outbox_events` carries ONLY the
// platform-staff FOR-ALL policy (`core_init` §7), whose implicit INSERT `WITH CHECK` admits the
// staff/System GUC leg alone — there is (yet) no ADR-021-class context-bound tenant INSERT policy
// (the `audit_records_context_append` precedent). Producers therefore append under the
// staff/System transaction context (the provisioning txn already is; the create_invitation
// targeted leg escalates transaction-locally — see its header). An ADR-021-class outbox
// INSERT-admission widening is a carried M0 follow-up, escalated in the slice report — never
// resolved locally here.

import { prisma, Prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { WriteOutboxEvent, CoreServiceExecutor } from "../../contracts/services";
import type { WriteOutboxEventInput } from "../../contracts/types";

async function append(input: WriteOutboxEventInput, db: DbExecutor): Promise<{ eventId: string }> {
  const eventId = uuidv7(); // M0 ID generator (Doc-4B §8) — never a raw UUID in app code.

  // The persisted payload = the Doc-2 §8 envelope (event_id + occurred_at) + the caller's thin
  // domain payload (IDs + metadata only — §16.5; the caller's declaration owns the field set).
  // Envelope LAST so the caller's payload can never clobber the stamped envelope fields
  // (`event_id === row id` is the consumer dedup invariant).
  const payloadJsonb = {
    ...input.payload,
    event_id: eventId,
    occurred_at: new Date().toISOString(),
  } as Prisma.InputJsonValue;

  await db.outboxEvent.createMany({
    data: [
      {
        id: eventId,
        aggregateId: input.aggregateId ?? null,
        eventName: input.eventName,
        eventVersion: input.eventVersion,
        payloadJsonb,
        // status: `pending` (DB default — Doc-2 §10.1; the §B6 worker advances it, never this leg).
      },
    ],
  });

  return { eventId };
}

/**
 * Append one `pending` outbox envelope (Doc-4B `core.write_outbox_event.v1` / Doc-2 §10.1). Runs
 * on the supplied transaction executor when present (write+emit atomic — Doc-6A §7.1); otherwise
 * on the shared client (an out-of-txn append is legal only where no business write accompanies it).
 */
export const writeOutboxEvent: WriteOutboxEvent = (input, executor?: CoreServiceExecutor) =>
  append(input, (executor as DbExecutor | undefined) ?? prisma);
