// M0 infrastructure (PRIVATE) — the transactional-outbox Phase-2 workers (`core.outbox_events`).
//
// Realizes the two Doc-4B §B6 System/Phase-2 worker contracts VERBATIM:
//   • `core.phase2_dispatch_outbox_events.v1`   — `pending → dispatched`, with retry+backoff,
//                                                 dead-letter park, and the reconciliation sweep.
//   • `core.phase2_archive_dispatched_events.v1`— `dispatched → archived`, retention-bounded.
// DISPATCH MECHANICS + the [D-5] audit leg. The mechanics are unchanged (byte-for-byte); on top, each
// worker appends ONE System-attributed immutable audit record per run that ADVANCED ≥ 1 row — per-run/
// batch granularity (Doc-4B_OutboxAuditToken_Patch_v1.0 / BOARD-DECISION-D5-OUTBOX-AUDIT_v1.1, realizing
// [D-5] Legs 3 (dispatch success) + 5 (archive); Leg 2 folds into the advance; Legs 1 (created) + 4
// (dead-letter park) are CARRIED, not written). The audit is `core.append_audit_record.v1` on the
// worker's OWN transaction (atomic with the advances — D7 rule 5: an append failure rolls the advances
// back). An empty pass (0 advances) writes NO record (noise rule); dead-letter/reconciliation counts are
// §B6/§17.1 operational telemetry, never audited. The forward-only status trigger
// (`core.outbox_status_forward_only`, Doc-6B §4.1) enforces the legal transition at the DB; this code
// only advances rows along it. M0 reads/writes its OWN `core` schema (One Module, One Owner).
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
import { uuidv7 } from "../../../../shared/ids";
import type {
  OutboxArchiveInput,
  OutboxArchiveResult,
  OutboxDispatchInput,
  OutboxDispatchResult,
} from "../../contracts/types";
// Same-module infra wiring (events/ → data/), the outbox-policy → system-configuration precedent: the
// M0 audit-append impl is imported DIRECTLY (not via `../../contracts`) to avoid the
// contracts→infrastructure→contracts import cycle. Still `core.append_audit_record.v1` — the one append.
import { appendAuditRecord } from "../data/audit-record.service";
import {
  OUTBOX_ARCHIVE_RUN_ENTITY_TYPE,
  OUTBOX_DISPATCH_RUN_ENTITY_TYPE,
  OutboxAuditAction,
} from "../../domain/audit-actions";
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
      // Forward-only `pending → dispatched` under a WRITE-TIME compare-and-set on source status: the
      // §B6 status-transition dedup guard is enforced at the WRITE, not only at SELECT. A row already
      // advanced by a concurrent pass between our select and this write matches zero rows here — a
      // 0-count no-op, never a same-state `dispatched → dispatched` re-advance (which the forward-only
      // trigger admits as idempotent) that would double-bump `attempts`, overwrite `dispatched_at`
      // (the archival-retention anchor), or double-count. Operational columns only (status/
      // dispatched_at/attempts/updated_at) — payload columns stay immutable. Counting the returned
      // `.count` keeps `dispatched` truthful under a lost race.
      const advanced = await tx.outboxEvent.updateMany({
        where: { id: row.id, status: "pending" },
        data: { status: "dispatched", dispatchedAt: now, attempts: { increment: 1 } },
      });
      if (advanced.count === 1) {
        dispatched += 1;
      }
    }

    // [D-5] audit leg — run/batch granularity (Doc-4B_OutboxAuditToken_Patch_v1.0 / BOARD-DECISION-D5-
    // OUTBOX-AUDIT_v1.1). ONE System-attributed immutable audit record per dispatch run that ADVANCED
    // ≥ 1 row (`pending → dispatched`, the §B6 Mutation-Scope; Leg 2 folded into this advance), on THIS
    // worker's own tx so it is atomic with the advances (D7 rule 5 — an append failure rolls the
    // advances back; a committed run carries its audit). Noise rule: an empty pass writes NO record, and
    // `deadLettered`/`reconciledStuck` are §B6/§17.1 telemetry, NOT a business audit action — never
    // audited. `entity_id` is a fresh per-run UUIDv7 correlation id (the audited unit is the run, not a
    // row); the platform-staff GUC set above admits the System `audit_records_context_append` leg.
    if (dispatched >= 1) {
      await appendAuditRecord(
        {
          actorType: "system",
          actorId: null,
          organizationId: null,
          entityType: OUTBOX_DISPATCH_RUN_ENTITY_TYPE,
          entityId: uuidv7(),
          action: OutboxAuditAction.DISPATCHED,
          oldValue: null,
          newValue: { dispatched, batchSize },
        },
        tx,
      );
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
      // Compare-and-set on source status (`dispatched`): a row already archived by a concurrent pass
      // between our select and this write matches zero rows — a 0-count no-op, so `archived` stays
      // truthful under a lost race (never a same-state `archived → archived` re-count).
      const advanced = await tx.outboxEvent.updateMany({
        where: { id: row.id, status: "dispatched" },
        data: { status: "archived" },
      });
      if (advanced.count === 1) {
        archived += 1;
      }
    }

    // [D-5] audit leg — run/batch granularity (Doc-4B_OutboxAuditToken_Patch_v1.0 / BOARD-DECISION-D5-
    // OUTBOX-AUDIT_v1.1). ONE System-attributed immutable audit record per archival run that ADVANCED
    // ≥ 1 row (`dispatched → archived`, the §B6 Mutation-Scope), atomic on this worker's own tx (D7 rule
    // 5). Empty pass → NO record (noise rule). Same posture as the dispatch leg above.
    if (archived >= 1) {
      await appendAuditRecord(
        {
          actorType: "system",
          actorId: null,
          organizationId: null,
          entityType: OUTBOX_ARCHIVE_RUN_ENTITY_TYPE,
          entityId: uuidv7(),
          action: OutboxAuditAction.ARCHIVED,
          oldValue: null,
          newValue: { archived, batchSize },
        },
        tx,
      );
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
