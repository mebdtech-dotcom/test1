// M5 infrastructure (PRIVATE) — the `trust.performance_*` reads + the two privileged SECURITY-DEFINER writes
// (`trust.append_performance_input(...)` / `trust.upsert_performance_score(...)`,
// prisma/migrations/20260711190000_trust_performance_scoring). This is M5 writing/reading its OWN schema
// (allowed); other modules reach it only via M5 contracts, never by importing infrastructure.
//
// WHY THE FUNCTIONS (not a Prisma create/update): the three score-class tables grant NO write policy (Doc-6G
// §3.x — System-only writes, never hand-edited, Invariant #6). Even a staff caller cannot write in-band. The
// Doc-6G §2.2-sanctioned owner-role / SECURITY DEFINER functions bypass RLS and perform the idempotent input
// append (ON CONFLICT dedup) / the advisory-lock-serialized change-detecting head upsert + history append. The
// functions are DUMB — NO authorization inside; the app layer authorizes (System actor, no slug) BEFORE the
// call. This repository OWNS the SQL and knows NOTHING of audit/event policy — it returns raw outcomes so the
// SERVICE decides audit + emit.
//
// The READS (tally / head) use the Prisma models under RLS (the caller's staff-GUC tx admits the
// `performance_*_read` SELECT policies); the WRITES bypass RLS via the SD functions.

import { Prisma, prisma, type DbExecutor } from "@/shared/db";
import type {
  PerformanceInputTypeValue,
  PerformanceSourceTypeValue,
  ScoreFreezeStateValue,
} from "@/modules/trust/contracts/types";
import type { PerformanceInputTally } from "@/modules/trust/domain/performance-score.formula";

/** `append_performance_input` arguments — server-resolved, already-validated (Doc-4G §G6.1). */
export interface AppendPerformanceInputArgs {
  /** App-minted UUIDv7 for the new row (M0 id generator; never a raw DB default). */
  id: string;
  vendorProfileId: string;
  sourceEntityId: string;
  sourceType: PerformanceSourceTypeValue;
  inputType: PerformanceInputTypeValue;
  occurredAt: Date;
  /** Opaque `value_jsonb` (dev-doc shape) or null. */
  valueJsonb: Record<string, unknown> | null;
  /** The acting System actor (`created_by`) — null for System attribution. */
  actorId: string | null;
}

/** Outcome of the input append. `created:false` ⇒ an idempotent dedup hit (the row already existed). */
export interface AppendPerformanceInputResult {
  id: string;
  created: boolean;
}

/** `upsert_performance_score` arguments — the already-computed head values (Doc-4G §G6.2). */
export interface UpsertPerformanceScoreArgs {
  /** App-minted UUIDv7 for the head row IF this is the first compute (ignored when a head already exists). */
  id: string;
  /** App-minted UUIDv7 for the appended `performance_score_history` snapshot (used only on a change). */
  historyId: string;
  vendorProfileId: string;
  /** 0–100, or null = Not Rated (never 0). */
  score: number | null;
  level: string | null;
  componentsJson: Record<string, unknown>;
  formulaVersion: string;
  minThresholdMet: boolean;
  /** The acting System actor (`created_by`/`updated_by`) — null for System attribution. */
  actorId: string | null;
}

/** Outcome of the head upsert. `changed` gates the SERVICE's emit + audit (publish-on-change). */
export interface UpsertPerformanceScoreResult {
  id: string;
  /** `true` iff score/level/formula changed (or first compute) → a snapshot was appended. */
  changed: boolean;
  /** `true` iff `performance_formula_version` changed on an existing head (drives the audit action). */
  formulaChanged: boolean;
  /** The current freeze state (compute never mutates it); `frozen` ⇒ the SERVICE suppresses publication. */
  freezeState: ScoreFreezeStateValue;
  /** The new `performance_score_updated_at` / optimistic token. */
  updatedAt: Date;
}

/** A read projection of one `performance_scores` head row (the fields the service needs). */
export interface PerformanceScoreRow {
  id: string;
  vendorProfileId: string;
  score: number | null;
  level: string | null;
  freezeState: ScoreFreezeStateValue;
  minThresholdMet: boolean;
  updatedAt: Date;
}

/**
 * Append a `performance_inputs` row via `trust.append_performance_input(...)`, on the caller's tx executor
 * `db` (same tx as the audit — atomic). Idempotent consumer: `created=false` ⇒ the dedup UNIQUE
 * (source_type, source_entity_id, input_type) already held a row (the caller writes no audit — no-op).
 */
export async function appendPerformanceInput(
  args: AppendPerformanceInputArgs,
  db: DbExecutor = prisma,
): Promise<AppendPerformanceInputResult> {
  const valueParam = args.valueJsonb === null ? null : JSON.stringify(args.valueJsonb);
  const rows = await db.$queryRaw<Array<{ id: string; created: boolean }>>(Prisma.sql`
    SELECT "id", "created"
      FROM "trust".append_performance_input(
        ${args.id}::uuid,
        ${args.vendorProfileId}::uuid,
        ${args.sourceEntityId}::uuid,
        ${args.sourceType}::"trust"."performance_source_type",
        ${args.inputType}::"trust"."performance_input_type",
        ${args.occurredAt}::timestamptz,
        ${valueParam}::jsonb,
        ${args.actorId}::uuid
      )
  `);
  const row = rows[0];
  if (row === undefined) {
    throw new Error("trust.append_performance_input returned no row (unreachable).");
  }
  return { id: row.id, created: row.created };
}

/**
 * Upsert the `performance_scores` head + append a `performance_score_history` snapshot on change, via
 * `trust.upsert_performance_score(...)`, on the caller's tx executor `db` (same tx as the emit + audit —
 * atomic). Change-detection is performed UNDER the SD function's advisory lock (race-free, no double-snapshot).
 */
export async function upsertPerformanceScore(
  args: UpsertPerformanceScoreArgs,
  db: DbExecutor = prisma,
): Promise<UpsertPerformanceScoreResult> {
  const componentsParam = JSON.stringify(args.componentsJson);
  const rows = await db.$queryRaw<
    Array<{
      id: string;
      changed: boolean;
      formula_changed: boolean;
      freeze_state: ScoreFreezeStateValue;
      updated_at: Date;
    }>
  >(Prisma.sql`
    SELECT "id", "changed", "formula_changed", "freeze_state", "updated_at"
      FROM "trust".upsert_performance_score(
        ${args.id}::uuid,
        ${args.historyId}::uuid,
        ${args.vendorProfileId}::uuid,
        ${args.score}::smallint,
        ${args.level}::text,
        ${componentsParam}::jsonb,
        ${args.formulaVersion}::text,
        ${args.minThresholdMet}::boolean,
        ${args.actorId}::uuid
      )
  `);
  const row = rows[0];
  if (row === undefined) {
    throw new Error("trust.upsert_performance_score returned no row (unreachable).");
  }
  return {
    id: row.id,
    changed: row.changed,
    formulaChanged: row.formula_changed,
    freezeState: row.freeze_state,
    updatedAt: row.updated_at,
  };
}

/**
 * Read one vendor's per-`input_type` tally from `performance_inputs` (Prisma groupBy, under the caller's
 * staff-GUC RLS scope). Absence of an `input_type` ⇒ count 0 (absence ≠ 0-score — the gate reads counts).
 */
export async function getPerformanceInputTally(
  vendorProfileId: string,
  db: DbExecutor = prisma,
): Promise<PerformanceInputTally> {
  const grouped = await db.performanceInput.groupBy({
    by: ["inputType"],
    where: { vendorProfileId },
    _count: { _all: true },
  });
  const counts: Record<PerformanceInputTypeValue, number> = {
    response: 0,
    decline: 0,
    non_response: 0,
    delivery: 0,
    feedback: 0,
    dispute: 0,
    completion: 0,
  };
  for (const g of grouped) {
    counts[g.inputType as PerformanceInputTypeValue] = g._count._all;
  }
  return {
    responseCount: counts.response,
    declineCount: counts.decline,
    nonResponseCount: counts.non_response,
    deliveryCount: counts.delivery,
    feedbackCount: counts.feedback,
    disputeCount: counts.dispute,
    completionCount: counts.completion,
  };
}

/**
 * Read the vendor's `performance_scores` head (Prisma, under the caller's staff-GUC RLS scope). `null` =
 * absence (no score computed yet). Used by `trigger_performance_review` (REFERENCE gate).
 */
export async function getPerformanceScoreByVendor(
  vendorProfileId: string,
  db: DbExecutor = prisma,
): Promise<PerformanceScoreRow | null> {
  const row = await db.performanceScore.findUnique({ where: { vendorProfileId } });
  if (row === null) return null;
  return {
    id: row.id,
    vendorProfileId: row.vendorProfileId,
    score: row.score,
    level: row.level,
    freezeState: row.freezeState as ScoreFreezeStateValue,
    minThresholdMet: row.minThresholdMet,
    updatedAt: row.updatedAt,
  };
}
