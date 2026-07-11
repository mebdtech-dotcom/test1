// M0 infrastructure — realizes `core.write_outbox_event.v1` (Doc-4B §16) by invoking the M0-owned
// SECURITY DEFINER function `core.write_outbox_event(...)` (the `allocate_human_ref` precedent,
// Doc-6B §3.3). The row is inserted into `core.outbox_events` (status `pending`) INSIDE the caller's
// transaction — atomic with the business write (Doc-4B §16.2) — and the SECURITY DEFINER function
// bypasses the direct-table `outbox_events_platform_staff` RLS so a tenant-context emitter (e.g.
// `billing.purchase_subscription`) can write it. This is M0 calling its OWN schema (allowed); other
// modules consume this via the contract surface, never raw `core` SQL (One Module, One Owner).
//
// STRUCTURAL insert only (Doc-4B §16): the service does not validate business semantics — the OWNING
// module (§16.6) is responsible for `event_name` existing in Doc-2 §8, event ownership, thin-payload
// (§16.5), and the Privacy-Review assertion (§16.3). Idempotency is the caller's (§14.3): a safe replay
// of the caller's command must not re-emit — the outbox write inherits the caller's transaction.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { CoreServiceExecutor, WriteOutboxEvent } from "../../contracts/services";

/**
 * Write one `pending` outbox event (Doc-4B §16). Runs on the supplied transaction executor when present
 * (atomic with the caller's business write — Doc-4B §16.2); otherwise on the shared client. The outbox
 * `id` is a time-ordered UUIDv7 minted in-process (the dispatcher orders by it).
 */
export const writeOutboxEvent: WriteOutboxEvent = async (input, executor?: CoreServiceExecutor) => {
  const db = (executor as DbExecutor | undefined) ?? prisma;
  const eventId = uuidv7();
  // The frozen function signature is core.write_outbox_event(uuid, text, integer, uuid, jsonb) — the
  // payload is passed as a JSON string cast to jsonb (never string-interpolated). `$executeRawUnsafe`
  // (not `$queryRawUnsafe`) because the function RETURNS void — nothing to deserialize.
  await db.$executeRawUnsafe(
    "SELECT core.write_outbox_event($1::uuid, $2, $3::integer, $4::uuid, $5::jsonb)",
    eventId,
    input.eventName,
    input.eventVersion,
    input.aggregateId,
    JSON.stringify(input.payload),
  );
  return { eventId };
};
