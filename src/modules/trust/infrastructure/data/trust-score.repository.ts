// M5 infrastructure (PRIVATE) — the `trust.trust_*` reads + the ONE privileged SECURITY-DEFINER write
// (`trust.upsert_trust_score(...)`, prisma/migrations/20260711200000_trust_trust_scoring), PLUS the
// firewall-scoped INPUT reads the Trust Score CONSUMES: Verification (`verification_records`, WP1) +
// Performance (`performance_scores` head, WP4a) + the Fraud read-seam (neutral-absent; BC-TRUST-4 UNBUILT).
// This is M5 writing/reading its OWN schema (allowed); other modules reach it only via M5 contracts, never by
// importing infrastructure.
//
// ⛔ FIREWALL (Invariant #6 / Doc-4G §H.9b/c; Doc-6G §3.2.1): the input reads below touch `verification_records`
// + `performance_scores` ONLY. This file NEVER reads `verified_financial_tiers` (the Financial Tier signal) and
// NEVER reads Buyer-Vendor Status. Verification + Performance are TRUST's OWN tables (same-module reads, not a
// cross-module DB access). The Trust Score is INVARIANT to Financial Tier.
//
// WHY THE SD FUNCTION (not a Prisma create/update): the two score-class tables grant NO write policy (Doc-6G
// §3.x — System-only writes, never hand-edited, Invariant #6). Even a staff caller cannot write in-band. The
// Doc-6G §2.2-sanctioned owner-role / SECURITY DEFINER function bypasses RLS and performs the advisory-lock-
// serialized change-detecting head upsert + history append. The function is DUMB — NO authorization inside; the
// app layer authorizes (System actor, no slug) BEFORE the call. This repository OWNS the SQL and knows NOTHING
// of audit/event policy — it returns raw outcomes so the SERVICE decides audit + emit.
//
// The READS use the Prisma models under RLS (the caller's staff-GUC tx admits the `*_read` SELECT policies —
// `verification_records` is admin FOR ALL, `performance_scores`/`trust_scores` admin-read); the WRITE bypasses
// RLS via the SD function.

import { Prisma, prisma, type DbExecutor } from "@/shared/db";
import type { ScoreFreezeStateValue } from "@/modules/trust/contracts/types";
import type {
  FraudSignalState,
  PerformanceSummary,
  VerificationSummary,
} from "@/modules/trust/domain/trust-score.formula";

/** `upsert_trust_score` arguments — the already-computed head values (Doc-4G §G5.1). */
export interface UpsertTrustScoreArgs {
  /** App-minted UUIDv7 for the head row IF this is the first compute (ignored when a head already exists). */
  id: string;
  /** App-minted UUIDv7 for the appended `trust_score_history` snapshot (used only on a change). */
  historyId: string;
  vendorProfileId: string;
  /** 0–100 — ALWAYS a real score (Trust Score has no Not-Rated NULL; Doc-6G §3.2.1). */
  score: number;
  /** The interim band bucket (text). */
  band: string;
  formulaVersion: string;
  /** The acting System actor (`created_by`/`updated_by`) — null for System attribution. */
  actorId: string | null;
}

/** Outcome of the head upsert. `changed` gates the SERVICE's emit + audit (publish-on-change). */
export interface UpsertTrustScoreResult {
  id: string;
  /** `true` iff score/band/formula changed (or first compute) → a snapshot was appended. */
  changed: boolean;
  /** `true` iff `trust_formula_version` changed on an existing head (drives the audit action). */
  formulaChanged: boolean;
  /** The current freeze state (compute never mutates it); `frozen` ⇒ the SERVICE suppresses publication. */
  freezeState: ScoreFreezeStateValue;
  /** The new `trust_score_updated_at` / optimistic token. */
  updatedAt: Date;
}

/** A read projection of one `trust_scores` head row (the fields the service needs). */
export interface TrustScoreRow {
  id: string;
  vendorProfileId: string;
  score: number;
  band: string;
  freezeState: ScoreFreezeStateValue;
  updatedAt: Date;
}

/**
 * Upsert the `trust_scores` head + append a `trust_score_history` snapshot on change, via
 * `trust.upsert_trust_score(...)`, on the caller's tx executor `db` (same tx as the emit + audit — atomic).
 * Change-detection is performed UNDER the SD function's advisory lock (race-free, no double-snapshot).
 */
export async function upsertTrustScore(
  args: UpsertTrustScoreArgs,
  db: DbExecutor = prisma,
): Promise<UpsertTrustScoreResult> {
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
      FROM "trust".upsert_trust_score(
        ${args.id}::uuid,
        ${args.historyId}::uuid,
        ${args.vendorProfileId}::uuid,
        ${args.score}::smallint,
        ${args.band}::text,
        ${args.formulaVersion}::text,
        ${args.actorId}::uuid
      )
  `);
  const row = rows[0];
  if (row === undefined) {
    throw new Error("trust.upsert_trust_score returned no row (unreachable).");
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
 * Read the vendor's `trust_scores` head (Prisma, under the caller's staff-GUC RLS scope). `null` = absence (no
 * score computed yet).
 */
export async function getTrustScoreByVendor(
  vendorProfileId: string,
  db: DbExecutor = prisma,
): Promise<TrustScoreRow | null> {
  const row = await db.trustScore.findUnique({ where: { vendorProfileId } });
  if (row === null) return null;
  return {
    id: row.id,
    vendorProfileId: row.vendorProfileId,
    score: row.score,
    band: row.band,
    freezeState: row.freezeState as ScoreFreezeStateValue,
    updatedAt: row.updatedAt,
  };
}

// ── FIREWALL-SCOPED INPUT READS (Verification + Performance + Fraud ONLY — Doc-4G §H.9b) ─────────────────

/**
 * Read the Verification (BC-TRUST-1) summary from `trust.verification_records` (WP1, TRUST's OWN table) — the
 * count of APPROVED records for the subject vendor, under the caller's staff-GUC RLS scope. Firewall-safe:
 * reads `verification_records` ONLY (never `verified_financial_tiers`); tier-verification records are NOT
 * special-cased — an approved verification counts uniformly (owner-directed). Absence ⇒ count 0 (absence ≠
 * 0-score — the formula plug settles a no-input vendor at the NON-ZERO baseline, Doc-3 §12.1 FIXED).
 */
export async function getApprovedVerificationSummary(
  vendorProfileId: string,
  db: DbExecutor = prisma,
): Promise<VerificationSummary> {
  const approvedCount = await db.verificationRecord.count({
    where: { subjectId: vendorProfileId, state: "approved" },
  });
  return { approvedCount, hasAnyApproved: approvedCount > 0 };
}

/**
 * Read the Performance (BC-TRUST-3) summary from the `trust.performance_scores` HEAD (WP4a, TRUST's OWN table),
 * under the caller's staff-GUC RLS scope. `null` head ⇒ `present:false` (contributes NEUTRALLY, never 0). A
 * Not-Rated head (score null / min-threshold not met) ⇒ `rated:false` (also neutral). Firewall-safe: reads the
 * performance signal, never mutates it (BC-TRUST-2 is consumer-only — Doc-4G §H.9b).
 */
export async function getPerformanceSummaryForTrust(
  vendorProfileId: string,
  db: DbExecutor = prisma,
): Promise<PerformanceSummary> {
  const row = await db.performanceScore.findUnique({ where: { vendorProfileId } });
  if (row === null) return { present: false, rated: false, score: null };
  const rated = row.minThresholdMet && row.score !== null;
  return { present: true, rated, score: rated ? row.score : null };
}

/**
 * Read the Fraud (BC-TRUST-4) signal state — the read-SEAM. BC-TRUST-4 is UNBUILT: there is NO `fraud_signals`
 * table today, so the seam returns a NEUTRAL "absent" state with NO DB access. This is a TOLERATED valid input,
 * NOT a `DEPENDENCY`/`REFERENCE` error (owner-directed — most vendors have no fraud signal). When BC-TRUST-4
 * lands, this seam reads the real `trust.fraud_signals` table and the SAME `input_signal_change` trigger drives
 * recompute — ZERO engine redesign. Pure/synchronous and vendor-agnostic today (NO DB, NO subject read — the
 * owner-directed neutral-absent posture); BC-TRUST-4 will add the `(vendorProfileId, db)` read shape here
 * without touching the plug or the compute pipeline (the plug already consumes `FraudSignalState`).
 */
export function readFraudSignalState(): FraudSignalState {
  return { present: false, riskLevel: null }; // neutral-absent (BC-TRUST-4 DEFERRAL; NO temp substrate)
}
