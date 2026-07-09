// M0 infrastructure (PRIVATE) — the transactional-outbox Phase-2 workers (`core.outbox_events`).
//
// Realizes the two Doc-4B §B6 System/Phase-2 worker contracts VERBATIM:
//   • `core.phase2_dispatch_outbox_events.v1`   — `pending → dispatched`, with retry+backoff,
//                                                 dead-letter park, and the reconciliation sweep.
//   • `core.phase2_archive_dispatched_events.v1`— `dispatched → archived`, retention-bounded.
// Both are DISPATCH MECHANICS ONLY. Per the [D-5] BOARD-PENDING gate (Doc-4B §B6), the audit-
// granularity leg of these workers is NOT built here — these functions make NO `core.append_audit_
// record.v1` call of any granularity; that leg lands with the D-5 ruling. The forward-only status
// trigger (`core.outbox_status_forward_only`, Doc-6B §4.1) enforces the legal transition at the DB;
// this code only advances rows along it. M0 reads/writes its OWN `core` schema (One Module, One Owner).
//
// TRANSPORT, NEVER AUTHOR (§B6 Events-Produced: none): the dispatcher DELIVERS existing outbox
// envelopes; it coins NO domain event (Doc-2 §8 / Doc-4J catalog / Doc-4L flow untouched). The
// observable delivery is the status transition `pending → dispatched` (the dedup guard: a row already
// `dispatched` is never re-processed). EMITTER-AGNOSTIC (R-a / ESC-W1-OUTBOX): it advances whatever
// `pending` rows exist — test-seeded now, real write-plus-emit rows in Wave 2 — identically.
//
// SYSTEM/PLATFORM-STAFF ACTOR (§B6 Actor: System): each worker opens its OWN transaction and sets
// `app.is_platform_staff = 'true'` TRANSACTION-LOCAL (`set_config(.,.,true)` — WP-1.3/1.4 GUC pattern)
// so the Doc-6B §2.2 platform-staff RLS backstop admits the read/write; the GUC never leaks past the
// transaction (no pooled-connection bleed, never session-global).
//
// POLICY-BOUNDED, NEVER LITERAL (Doc-4A §18.2): max attempts, retry backoff, dead-letter policy, and
// archive retention are read from `core.system_configuration` via the W2-CORE-1 service
// `core.config_value_query.v1` (Doc-4B §B8) — see `outbox-policy.ts`. No bound is hardcoded.

import { prisma } from "../../../../shared/db";
import type {
  OutboxArchiveInput,
  OutboxArchiveResult,
  OutboxDispatchInput,
  OutboxDispatchResult,
} from "../../contracts/types";
import {
  isBackoffElapsed,
  readOutboxArchiveRetentionMs,
  readOutboxDispatchPolicy,
} from "./outbox-policy";

/** Options for the legacy combined drain pass (Doc-8B §7.2; kept for backward-compatible callers). */
export interface DrainOutboxOptions {
  /** Cap on rows processed per leg in one pass (a poll batch). Defaults to a bounded batch. */
  batchSize?: number;
  /**
   * Run the distinct archival leg (`dispatched → archived`) this pass. Doc-4B §B6 makes archival a
   * SEPARATE retention-bounded worker; the minimal per-pass obligation is dispatch, so archival is
   * opt-in here (default off).
   */
  archive?: boolean;
}

/** Result of one legacy combined drain pass (mechanical counters only — Doc-8B §7.2). */
export interface DrainOutboxResult {
  /** Rows advanced `pending → dispatched` this pass. */
  dispatched: number;
  /** Rows advanced `dispatched → archived` this pass (the distinct archival leg). */
  archived: number;
  /** `pending` rows parked at `attempts >= max` this pass (dead-lettered; retained, never dropped). */
  skippedMaxAttempts: number;
}

const DEFAULT_BATCH_SIZE = 100 as const;

/**
 * `core.phase2_dispatch_outbox_events.v1` (Doc-4B §B6) — advance re-attempt-eligible `pending` rows to
 * `dispatched`, with retry+backoff, dead-letter park, and reconciliation. Runs as the System/platform-
 * staff actor in its OWN transaction. Idempotent (the `pending` source-status filter is the dedup
 * guard); forward-only (DB-trigger-enforced). Delivery is the status transition; coins no event.
 *
 * Retry/backoff (§B6): a `pending` row that has been re-attempted `attempts` times is only re-attempted
 * once its `core.outbox_dispatch_backoff` delay has elapsed since `updated_at`; otherwise it is left
 * `pending` (counted `skippedBackoff`). Each advance bumps `attempts` (Doc-2 §10.1).
 *
 * Dead-letter (§B6 — "never silently drop"): rows at `attempts >= core.outbox_dispatch_max_attempts`
 * are PARKED — retained `pending` with attempts at the ceiling, never advanced or deleted — and counted
 * `deadLettered` per `core.outbox_dlq_policy` (the ops-telemetry alert surface).
 *
 * Reconciliation (§B6): `pending` rows stuck beyond the expected dispatch latency (the backoff cap)
 * with `attempts` in `[1, max)` are counted `reconciledStuck` — flagged for the next tick / alerted;
 * operational telemetry, not a business audit action (§17.1). No new entity or state is introduced.
 */
export async function dispatchOutboxEvents(
  options: OutboxDispatchInput = {},
): Promise<OutboxDispatchResult> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const { maxAttempts, backoff, dlqPolicy } = await readOutboxDispatchPolicy(tx);
    const now = new Date();

    // Dead-letter backlog (§B6): pending rows that have exhausted the retry ceiling. Parked — never
    // advanced, never dropped; the count IS the alert surface (per core.outbox_dlq_policy).
    const deadLettered = await tx.outboxEvent.count({
      where: { status: "pending", attempts: { gte: maxAttempts } },
    });

    // Reconciliation (§B6): pending rows stuck beyond the expected dispatch latency (backoff cap) while
    // still under the ceiling — lagging retries the next tick re-attempts once their backoff elapses.
    const stuckBefore = new Date(now.getTime() - backoff.capMs);
    const reconciledStuck = await tx.outboxEvent.count({
      where: {
        status: "pending",
        attempts: { gte: 1, lt: maxAttempts },
        createdAt: { lt: stuckBefore },
      },
    });

    // Advancement candidates: pending, under the retry ceiling, oldest-first (serves the
    // (status, created_at) poll index). Backoff eligibility is a per-row check below.
    const candidates = await tx.outboxEvent.findMany({
      where: { status: "pending", attempts: { lt: maxAttempts } },
      orderBy: { createdAt: "asc" },
      take: batchSize,
      select: { id: true, attempts: true, updatedAt: true },
    });

    let dispatched = 0;
    let skippedBackoff = 0;
    for (const row of candidates) {
      if (!isBackoffElapsed(backoff, row.attempts, row.updatedAt, now)) {
        // Re-attempt backoff not yet elapsed — leave pending for a later tick.
        skippedBackoff += 1;
        continue;
      }
      // Forward-only `pending → dispatched`; the trigger blocks any illegal transition. Operational
      // columns only (status/dispatched_at/attempts/updated_at) — payload columns stay immutable.
      await tx.outboxEvent.update({
        where: { id: row.id },
        data: { status: "dispatched", dispatchedAt: now, attempts: { increment: 1 } },
      });
      dispatched += 1;
    }

    return { dispatched, deadLettered, skippedBackoff, reconciledStuck, dlqPolicy };
  });
}

/**
 * `core.phase2_archive_dispatched_events.v1` (Doc-4B §B6) — advance `dispatched` rows whose
 * `dispatched_at` is older than `core.outbox_archive_retention` to `archived` (the distinct, retention-
 * bounded archival worker). System/platform-staff actor, own transaction. Idempotent (the `dispatched`
 * source-status filter guards); forward-only. A fresher `dispatched` row inside the retention window is
 * left untouched (§B6 Request Contract). Coins no event.
 */
export async function archiveDispatchedEvents(
  options: OutboxArchiveInput = {},
): Promise<OutboxArchiveResult> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const retentionMs = await readOutboxArchiveRetentionMs(tx);
    const archiveBefore = new Date(Date.now() - retentionMs);

    const toArchive = await tx.outboxEvent.findMany({
      where: { status: "dispatched", dispatchedAt: { lt: archiveBefore } },
      orderBy: { createdAt: "asc" },
      take: batchSize,
      select: { id: true },
    });

    let archived = 0;
    for (const row of toArchive) {
      await tx.outboxEvent.update({
        where: { id: row.id },
        data: { status: "archived" },
      });
      archived += 1;
    }

    return { archived };
  });
}

/**
 * Legacy combined drain pass — kept so existing callers (the Inngest job, WP-1.8 observer) keep a
 * stable entry point. Runs the §B6 dispatch worker, then (when `options.archive`) the retention-bounded
 * archival worker, and maps their counters to the historical `DrainOutboxResult` shape.
 */
export async function drainOutbox(options: DrainOutboxOptions = {}): Promise<DrainOutboxResult> {
  const dispatch = await dispatchOutboxEvents({ batchSize: options.batchSize });
  const archived = options.archive
    ? (await archiveDispatchedEvents({ batchSize: options.batchSize })).archived
    : 0;
  return {
    dispatched: dispatch.dispatched,
    archived,
    skippedMaxAttempts: dispatch.deadLettered,
  };
}
