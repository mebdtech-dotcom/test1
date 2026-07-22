// M5 infrastructure (PRIVATE) — the `trust.verified_financial_tiers` reads + the two privileged
// SECURITY-DEFINER writes (`trust.establish_verified_tier(...)` / `trust.transition_verified_tier(...)`,
// prisma/migrations/20260711180000_trust_verified_financial_tiers). This is M5 writing/reading its OWN
// schema (allowed); other modules reach it only via M5 contracts, never by importing infrastructure.
//
// WHY THE FUNCTIONS (not a Prisma `create`/`update`): `trust.verified_financial_tiers` RLS grants NO write
// policy (Doc-6G §3.x — System-only writes, never hand-edited, Invariant #6). Even a staff caller cannot
// write in-band. The Doc-6G §2.2-sanctioned owner-role / SECURITY DEFINER functions bypass RLS and perform
// the serialized UNIQUE-guarded establish / optimistic-guarded transition. The functions are DUMB — NO
// authorization inside; the app layer authorizes BEFORE the call. This repository OWNS the SQL and knows
// NOTHING of audit/event policy — it returns raw outcomes so the SERVICE decides audit + emit.
//
// The READ (`getVerifiedTierByVendor`) uses the Prisma model under RLS (the caller's staff-GUC tx admits
// the `verified_financial_tiers_read` SELECT policy); the WRITES bypass RLS via the SD functions.

import { Prisma, prisma, type DbExecutor } from "@/shared/db";
import type {
  FinancialTier,
  VerifiedTierStatus,
} from "@/modules/trust/domain/verified-tier.state-machine";

/** A read projection of one `verified_financial_tiers` row (the fields the write-service needs). */
export interface VerifiedTierRow {
  id: string;
  vendorProfileId: string;
  tier: FinancialTier;
  status: VerifiedTierStatus;
  verifiedAt: Date | null;
  nextReviewAt: Date | null;
  /** The optimistic-concurrency token (Doc-4A §10.2; ms-truncated by the SD writers). */
  updatedAt: Date;
}

/** `set` (establish) arguments — server-resolved, already-validated (Doc-4G §G4.6). */
export interface EstablishVerifiedTierArgs {
  /** App-minted UUIDv7 for the new row (M0 id generator; never a raw DB default). */
  id: string;
  vendorProfileId: string;
  tier: FinancialTier;
  verifiedAt: Date;
  nextReviewAt: Date;
  /** Opaque basis (dev-doc shape) or null. */
  basisJsonb: Record<string, unknown> | null;
  /** The acting System/Admin actor (`created_by`/`updated_by`). */
  actorId: string | null;
}

/** Outcome of the establish SD write. `created:false` ⇒ a row already exists for the vendor (UNIQUE guard). */
export interface EstablishVerifiedTierResult {
  id: string;
  created: boolean;
}

/** `confirm`/`downgrade`/`suspend`/`expire` transition arguments (Doc-4G §G4.6/§G4.7). A `null` newTier /
 *  verifiedAt / nextReviewAt KEEPS the current column value (COALESCE in the SD function). */
export interface TransitionVerifiedTierArgs {
  vendorProfileId: string;
  /** The optimistic precondition — the current `updated_at` the caller observed. */
  expectedUpdatedAt: Date;
  newStatus: VerifiedTierStatus;
  newTier: FinancialTier | null;
  verifiedAt: Date | null;
  nextReviewAt: Date | null;
  actorId: string | null;
}

/** Outcome of the transition SD write. `matched:0` ⇒ stale token / concurrent change (CONFLICT). */
export interface TransitionVerifiedTierResult {
  matched: number;
  newUpdatedAt: Date | null;
}

/** A read projection of the `trust.verification_records` fields the tier-basis check needs (WP1 table). */
export interface VerificationRecordBasisRow {
  id: string;
  subjectId: string;
  subjectType: string;
  verificationType: string;
  state: string;
}

/**
 * Read one `trust.verification_records` row by id (Prisma, under the caller's staff-GUC RLS scope — the
 * `verification_records_admin` FOR ALL policy admits the platform-staff read). This is trust reading its OWN
 * WP1 table (in-band; NOT cross-module) — the establish `set` basis check (Doc-4G §G4.6 stage-8) consumes it.
 * `null` = the basis id does not resolve.
 */
export async function getVerificationRecordById(
  id: string,
  db: DbExecutor = prisma,
): Promise<VerificationRecordBasisRow | null> {
  const row = await db.verificationRecord.findUnique({ where: { id } });
  if (row === null) return null;
  return {
    id: row.id,
    subjectId: row.subjectId,
    subjectType: row.subjectType,
    verificationType: row.verificationType,
    state: row.state,
  };
}

/** Read the vendor's verified-tier row (Prisma, under the caller's staff-GUC RLS scope). `null` = absence
 *  (`Declared`-only). */
export async function getVerifiedTierByVendor(
  vendorProfileId: string,
  db: DbExecutor = prisma,
): Promise<VerifiedTierRow | null> {
  const row = await db.verifiedFinancialTier.findUnique({ where: { vendorProfileId } });
  if (row === null) return null;
  return {
    id: row.id,
    vendorProfileId: row.vendorProfileId,
    tier: row.tier as FinancialTier,
    status: row.status as VerifiedTierStatus,
    verifiedAt: row.verifiedAt,
    nextReviewAt: row.nextReviewAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Establish a verified tier via `trust.establish_verified_tier(...)`, on the caller's tx executor `db`
 * (same `withActiveOrgContext`/staff-context tx as the emit + audit — atomic). Advisory-locks the vendor,
 * guards UNIQUE(vendor_profile_id): `created=false` ⇒ a row already exists (the caller maps it to BUSINESS).
 */
export async function establishVerifiedTier(
  args: EstablishVerifiedTierArgs,
  db: DbExecutor = prisma,
): Promise<EstablishVerifiedTierResult> {
  const basisParam = args.basisJsonb === null ? null : JSON.stringify(args.basisJsonb);
  const rows = await db.$queryRaw<Array<{ id: string; created: boolean }>>(Prisma.sql`
    SELECT "id", "created"
      FROM "trust".establish_verified_tier(
        ${args.id}::uuid,
        ${args.vendorProfileId}::uuid,
        ${args.tier}::"trust"."financial_tier",
        ${args.verifiedAt}::timestamptz,
        ${args.nextReviewAt}::timestamptz,
        ${basisParam}::jsonb,
        ${args.actorId}::uuid
      )
  `);
  const row = rows[0];
  if (row === undefined) {
    throw new Error("trust.establish_verified_tier returned no row (unreachable).");
  }
  return { id: row.id, created: row.created };
}

/**
 * Apply a verified-tier transition via `trust.transition_verified_tier(...)`, on the caller's tx executor
 * `db`. Optimistic on `expectedUpdatedAt`; source-status guarded (`= 'verified'`). `matched=0` ⇒ stale
 * token / a concurrent status change (the caller maps it to CONFLICT).
 */
export async function transitionVerifiedTier(
  args: TransitionVerifiedTierArgs,
  db: DbExecutor = prisma,
): Promise<TransitionVerifiedTierResult> {
  const rows = await db.$queryRaw<
    Array<{ matched: number; new_updated_at: Date | null }>
  >(Prisma.sql`
    SELECT "matched", "new_updated_at"
      FROM "trust".transition_verified_tier(
        ${args.vendorProfileId}::uuid,
        ${args.expectedUpdatedAt}::timestamptz,
        ${args.newStatus}::"trust"."verified_tier_status",
        ${args.newTier}::"trust"."financial_tier",
        ${args.verifiedAt}::timestamptz,
        ${args.nextReviewAt}::timestamptz,
        ${args.actorId}::uuid
      )
  `);
  const row = rows[0];
  if (row === undefined) {
    throw new Error("trust.transition_verified_tier returned no row (unreachable).");
  }
  return { matched: Number(row.matched), newUpdatedAt: row.new_updated_at };
}
