// M5 infrastructure (PRIVATE) — the `trust.fraud_signals` reads + the two IN-BAND writes (the dedup
// check-then-insert `openFraudSignalDeduped` + the optimistic triage `transitionFraudSignal`). This is M5
// writing/reading its OWN schema (allowed); other modules reach it only via M5 contracts, never by importing
// infrastructure.
//
// WHY IN-BAND (NOT a SECURITY-DEFINER function — the crux vs the score-class tables): `trust.fraud_signals`
// RLS is `fraud_signals_admin FOR ALL` (Doc-6G §3.4 — "NO SD"), which ADMITS read AND write under the
// platform-staff GUC (`app.is_platform_staff = true` — natural for Admin AND System). So writes go IN-BAND on
// the caller's staff tx — the D7/WP1 audited-write pattern, no owner-role/SD bypass. The create-dedup uses a
// plain `pg_advisory_xact_lock` (any role) inside the caller's staff tx so the check-then-insert has no race
// window; NO SECURITY-DEFINER function is defined or called. This repository OWNS the SQL and knows NOTHING
// of audit policy — it returns raw outcomes so the SERVICE decides audit (and there is NO event — Doc-4G §H.7).
//
// The READS (`getFraudSignalById`, the dedup probe inside `openFraudSignalDeduped`) use the Prisma model
// under RLS (the caller's staff-GUC tx admits the `fraud_signals_admin` SELECT). The WRITES use RAW SQL so
// `updated_at` is written millisecond-TRUNCATED (`date_trunc('milliseconds', …)`) — a value read back through
// Prisma (JS `Date`, ms precision) round-trips to an EXACT match on the next transition's optimistic WHERE (a
// microsecond token would falsely miss and read as CONFLICT; the WP3 verified-tier token precedent).

import { Prisma, prisma, type DbExecutor } from "@/shared/db";
import {
  FRAUD_SIGNAL_NON_TERMINAL_STATES,
  type FraudSignalState,
} from "@/modules/trust/domain/fraud-signal.state";

/** A read projection of one `fraud_signals` row (the fields the write-service needs). */
export interface FraudSignalRow {
  id: string;
  subjectId: string;
  subjectType: string;
  signalType: string;
  severity: string;
  state: FraudSignalState;
  reportedBy: string | null;
  /** The optimistic-concurrency token (Doc-4A §14; ms-truncated by the in-band writers). */
  updatedAt: Date;
}

/** `openFraudSignalDeduped` arguments — server-resolved, already-validated (Doc-4G §G7.1). */
export interface OpenFraudSignalArgs {
  /** App-minted UUIDv7 for the (possibly) new row (M0 id generator; never a raw DB default). */
  id: string;
  subjectId: string;
  subjectType: string;
  signalType: string;
  severity: string;
  /** M1 staff reporter (staff-reported create) or `null` (System-detected). Also `created_by`/`updated_by`. */
  reportedBy: string | null;
}

/** Outcome of the dedup check-then-insert. `created:false` ⇒ a NON-terminal signal already exists for the
 *  detection key `(subject_id, subject_type, signal_type)` → the existing row is returned (idempotent). */
export interface OpenFraudSignalResult {
  id: string;
  state: FraudSignalState;
  updatedAt: Date;
  created: boolean;
}

/** Triage transition arguments (Doc-4G §G7.2). Optimistic on `expectedUpdatedAt`; source-state guarded. */
export interface TransitionFraudSignalArgs {
  id: string;
  /** The optimistic precondition — the current `updated_at` the caller observed. */
  expectedUpdatedAt: Date;
  /** The required source state (defense-in-depth; the service also checks the domain machine first). */
  sourceState: FraudSignalState;
  targetState: FraudSignalState;
  /** The acting Admin/System actor (`updated_by`). */
  actorId: string | null;
}

/** Outcome of the transition write. `matched:0` ⇒ stale token / a concurrent state change (CONFLICT). */
export interface TransitionFraudSignalResult {
  matched: number;
  newUpdatedAt: Date | null;
}

/**
 * Read one `fraud_signals` row by id (Prisma, under the caller's staff-GUC RLS scope — the
 * `fraud_signals_admin FOR ALL` policy admits the platform-staff read). `null` = the id does not resolve
 * (a triage target that is absent, OR — for a non-staff caller under RLS — the protected-fact collapse).
 */
export async function getFraudSignalById(
  id: string,
  db: DbExecutor = prisma,
): Promise<FraudSignalRow | null> {
  const row = await db.fraudSignal.findUnique({ where: { id } });
  if (row === null) return null;
  return {
    id: row.id,
    subjectId: row.subjectId,
    subjectType: row.subjectType,
    signalType: row.signalType,
    severity: row.severity,
    state: row.state as FraudSignalState,
    reportedBy: row.reportedBy,
    updatedAt: row.updatedAt,
  };
}

/**
 * The dedup check-then-insert (Doc-4G §H.8 / §G7.1 §10), on the caller's staff tx executor `db` (same tx as
 * the audit append — atomic). Runs IN-BAND (no SD):
 *   (1) `pg_advisory_xact_lock` on the detection key so concurrent same-key creates serialize (no race
 *       window between the probe and the insert; TRANSACTION-scoped — released at commit OR rollback).
 *   (2) probe for a NON-TERMINAL (`open`/`reviewed`) signal for `(subject_id, subject_type, signal_type)`.
 *       If found → return it with `created=false` (idempotent — the caller writes NO row / NO audit).
 *   (3) else INSERT a fresh `open` row (`updated_at` ms-truncated) and return it with `created=true`.
 * NO DB unique index backs this (the frozen DDL has none) — the advisory lock + the probe are the guard.
 */
export async function openFraudSignalDeduped(
  args: OpenFraudSignalArgs,
  db: DbExecutor = prisma,
): Promise<OpenFraudSignalResult> {
  // (1) Serialize concurrent same-detection-key creates. hashtextextended(<key text>, 0) → bigint lock key.
  const lockKey = `${args.subjectId}|${args.subjectType}|${args.signalType}`;
  await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;

  // (2) Probe for a live (non-terminal) signal for the detection key. Deterministic (earliest first).
  const existing = await db.fraudSignal.findFirst({
    where: {
      subjectId: args.subjectId,
      subjectType: args.subjectType,
      signalType: args.signalType,
      state: { in: [...FRAUD_SIGNAL_NON_TERMINAL_STATES] },
    },
    orderBy: { createdAt: "asc" },
  });
  if (existing !== null) {
    return {
      id: existing.id,
      state: existing.state as FraudSignalState,
      updatedAt: existing.updatedAt,
      created: false,
    };
  }

  // (3) No live signal → INSERT a fresh `open` row IN-BAND. `updated_at` ms-truncated (optimistic token);
  //     `created_by`/`updated_by` = the acting actor (staff id, or NULL for System). RETURNING the token.
  const rows = await db.$queryRaw<Array<{ id: string; state: FraudSignalState; updated_at: Date }>>(
    Prisma.sql`
      INSERT INTO "trust"."fraud_signals" (
        "id", "subject_id", "subject_type", "reported_by", "signal_type", "severity", "state",
        "updated_at", "created_by", "updated_by"
      ) VALUES (
        ${args.id}::uuid, ${args.subjectId}::uuid, ${args.subjectType}, ${args.reportedBy}::uuid,
        ${args.signalType}, ${args.severity}, 'open'::"trust"."fraud_signal_state",
        date_trunc('milliseconds', now()), ${args.reportedBy}::uuid, ${args.reportedBy}::uuid
      )
      RETURNING "id", "state", "updated_at"
    `,
  );
  const row = rows[0];
  if (row === undefined) {
    throw new Error("trust.fraud_signals insert returned no row (unreachable).");
  }
  return { id: row.id, state: row.state, updatedAt: row.updated_at, created: true };
}

/**
 * Apply a triage transition IN-BAND on the caller's tx executor `db` (same tx as the audit — atomic).
 * Optimistic on `updated_at = expectedUpdatedAt`; source-status guarded (`state = sourceState`) as
 * defense-in-depth (the service checks the domain machine BEFORE calling). `updated_at` is written
 * ms-truncated (the next optimistic token). `matched=0` ⇒ stale token / a concurrent state change (the
 * caller maps it to CONFLICT). Returns the new token so the caller rides the fresh optimistic revision.
 */
export async function transitionFraudSignal(
  args: TransitionFraudSignalArgs,
  db: DbExecutor = prisma,
): Promise<TransitionFraudSignalResult> {
  const rows = await db.$queryRaw<Array<{ id: string; updated_at: Date }>>(Prisma.sql`
    UPDATE "trust"."fraud_signals"
       SET "state"      = ${args.targetState}::"trust"."fraud_signal_state",
           "updated_at" = date_trunc('milliseconds', clock_timestamp()),
           "updated_by" = ${args.actorId}::uuid
     WHERE "id"         = ${args.id}::uuid
       AND "updated_at" = ${args.expectedUpdatedAt}::timestamptz
       AND "state"      = ${args.sourceState}::"trust"."fraud_signal_state"
    RETURNING "id", "updated_at"
  `);
  const row = rows[0];
  return {
    matched: row === undefined ? 0 : 1,
    newUpdatedAt: row === undefined ? null : row.updated_at,
  };
}
