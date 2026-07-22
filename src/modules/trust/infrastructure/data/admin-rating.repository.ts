// M5 infrastructure (PRIVATE) — the `trust.admin_ratings` reads + the IN-BAND writes (the staff
// `insertAdminRating` create + the optimistic `updateAdminRating`). This is M5 writing/reading its OWN schema
// (allowed); other modules reach it only via M5 contracts, never by importing infrastructure.
//
// WHY IN-BAND (NOT a SECURITY-DEFINER function — the WP4c fraud / WP5a public-review precedent): the frozen
// `admin_ratings` RLS is `admin_ratings_staff FOR ALL` (Doc-6G §3.x) — it ADMITS read AND write under the
// platform-staff GUC (`app.is_platform_staff = true`), so writes go IN-BAND on the caller's staff tx (the D7
// audited-write pattern; NO SD function, unlike the score/verified-tier tables which grant no write policy).
// The per-vendor SINGLETON is enforced by the SERVICE via a `pg_advisory_xact_lock` check-then-write (the
// frozen §3.5.1 DDL has NO `UNIQUE(vendor_profile_id)`). This repository OWNS the SQL and knows NOTHING of
// audit policy — it returns raw outcomes so the SERVICE decides audit (and there is NO event — Doc-4G §H.7).
//
// NON-DISCLOSURE: the reads run under the caller's RLS scope — the staff-only `admin_ratings_staff` policy
// means a non-staff / no-GUC caller sees ZERO rows (F4G-PB5-M3 / §H.9f). The WRITES use RAW SQL so `updated_at`
// is written millisecond-TRUNCATED (`date_trunc('milliseconds', …)`) — a value read back through Prisma
// (JS `Date`, ms precision) round-trips to an EXACT match on the next update's optimistic WHERE (a microsecond
// token would falsely miss and read as CONFLICT; the WP3/WP4c/WP5a precedent). The frozen `score` is `numeric`
// (Prisma `Decimal`) — mapped to `number` here (the contract-facing DTO uses `number`).

import { prisma, type DbExecutor } from "@/shared/db";

/** A read projection of one `admin_ratings` row (the fields the service + reads need; `score` mapped to number). */
export interface AdminRatingRow {
  id: string;
  vendorProfileId: string;
  ratedBy: string | null;
  score: number | null;
  comment: string | null;
  createdAt: Date;
  /** The optimistic-concurrency token (Doc-4A §14; ms-truncated by the in-band writers). */
  updatedAt: Date;
}

/** `insertAdminRating` arguments — server-resolved, already-validated (Doc-4G §G8.4). `actorId` = the staff
 *  rater (`rated_by`/`created_by`/`updated_by`). `score`/`comment` are the frozen DB columns (the contract's
 *  `rating_value`/`rating_note`). */
export interface InsertAdminRatingArgs {
  /** App-minted UUIDv7 for the new row (M0 id generator; never a raw DB default). */
  id: string;
  vendorProfileId: string;
  score: number;
  comment: string | null;
  actorId: string;
}

/** Optimistic in-band update arguments. Optimistic on `expectedUpdatedAt`; guarded on `deleted_at IS NULL`. */
export interface UpdateAdminRatingArgs {
  id: string;
  /** The optimistic precondition — the current `updated_at` the caller observed. */
  expectedUpdatedAt: Date;
  score: number;
  comment: string | null;
  /** The acting staff actor (`rated_by`/`updated_by` — the last setter). */
  actorId: string;
}

/** Outcome of the optimistic update. `matched:0` ⇒ stale token / a concurrent change (CONFLICT). */
export interface UpdateAdminRatingResult {
  matched: number;
  newUpdatedAt: Date | null;
}

/** A decoded keyset cursor for the staff list (`(created_at, id)` desc). */
export interface AdminRatingListCursor {
  createdAt: Date;
  id: string;
}

/** `listAdminRatingsByVendor` options — page size + optional keyset cursor. */
export interface ListAdminRatingsOptions {
  limit: number;
  cursor?: AdminRatingListCursor | null;
}

/** Map a Prisma `admin_ratings` row to the read projection (`score` Decimal → number). */
function toRow(row: {
  id: string;
  vendorProfileId: string;
  ratedBy: string | null;
  score: { toNumber(): number } | null;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminRatingRow {
  return {
    id: row.id,
    vendorProfileId: row.vendorProfileId,
    ratedBy: row.ratedBy,
    score: row.score === null ? null : row.score.toNumber(),
    comment: row.comment,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Read the vendor's LIVE (not soft-deleted) singleton admin rating (Prisma, under the caller's RLS scope —
 * the `admin_ratings_staff` policy admits only a platform-staff caller; a non-staff / no-GUC caller gets
 * `null`). Deterministic (earliest first) in case a residual duplicate ever exists. `null` = no live rating.
 */
export async function getLiveAdminRatingByVendor(
  vendorProfileId: string,
  db: DbExecutor = prisma,
): Promise<AdminRatingRow | null> {
  const row = await db.adminRating.findFirst({
    where: { vendorProfileId, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
  if (row === null) return null;
  return toRow(row);
}

/**
 * List the vendor's LIVE (`deleted_at IS NULL`) admin ratings (Prisma), under the caller's RLS scope,
 * deterministically ordered `(created_at desc, id desc)` and keyset-paginated. The `deletedAt:null` filter is
 * EXPLICIT (defense-in-depth). A non-staff / no-GUC caller sees ZERO rows (the `admin_ratings_staff` RLS —
 * F4G-PB5-M3 non-disclosure). Returns up to `limit` rows (the service asks for `limit + 1` to detect a page).
 */
export async function listAdminRatingsByVendor(
  vendorProfileId: string,
  opts: ListAdminRatingsOptions,
  db: DbExecutor = prisma,
): Promise<AdminRatingRow[]> {
  const rows = await db.adminRating.findMany({
    where: {
      vendorProfileId,
      deletedAt: null,
      ...(opts.cursor != null
        ? {
            OR: [
              { createdAt: { lt: opts.cursor.createdAt } },
              { createdAt: opts.cursor.createdAt, id: { lt: opts.cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: opts.limit,
  });
  return rows.map(toRow);
}

/**
 * Create the vendor's admin rating (Doc-4G §G8.4), IN-BAND on the caller's staff tx executor `db` (same tx as
 * the audit append — atomic). `updated_at` is written ms-truncated (the optimistic token); `rated_by`/
 * `created_by`/`updated_by` = the staff rater; `score`/`comment` are the frozen DB columns. NO event.
 * The per-vendor singleton is guaranteed by the SERVICE's advisory-xact-lock + probe (this repository only writes).
 */
export async function insertAdminRating(
  args: InsertAdminRatingArgs,
  db: DbExecutor = prisma,
): Promise<{ id: string; updatedAt: Date }> {
  const rows = await db.$queryRaw<Array<{ id: string; updated_at: Date }>>`
    INSERT INTO "trust"."admin_ratings" (
      "id", "vendor_profile_id", "rated_by", "score", "comment", "updated_at", "created_by", "updated_by"
    ) VALUES (
      ${args.id}::uuid, ${args.vendorProfileId}::uuid, ${args.actorId}::uuid, ${args.score}::numeric,
      ${args.comment}::text, date_trunc('milliseconds', now()), ${args.actorId}::uuid, ${args.actorId}::uuid
    )
    RETURNING "id", "updated_at"
  `;
  const row = rows[0];
  if (row === undefined) {
    throw new Error("trust.admin_ratings insert returned no row (unreachable).");
  }
  return { id: row.id, updatedAt: row.updated_at };
}

/**
 * Update the vendor's live admin rating IN-BAND on the caller's staff tx executor `db` (same tx as the audit —
 * atomic). Optimistic on `updated_at = expectedUpdatedAt`; guarded on `deleted_at IS NULL`. Sets `score`/
 * `comment`/`rated_by` (the last setter) + a fresh ms-truncated `updated_at`. `matched=0` ⇒ stale token / a
 * concurrent change (the service maps it to CONFLICT). Returns the new token so the caller rides the fresh
 * optimistic revision. NO event.
 */
export async function updateAdminRating(
  args: UpdateAdminRatingArgs,
  db: DbExecutor = prisma,
): Promise<UpdateAdminRatingResult> {
  const rows = await db.$queryRaw<Array<{ id: string; updated_at: Date }>>`
    UPDATE "trust"."admin_ratings"
       SET "score"      = ${args.score}::numeric,
           "comment"    = ${args.comment}::text,
           "rated_by"   = ${args.actorId}::uuid,
           "updated_at" = date_trunc('milliseconds', clock_timestamp()),
           "updated_by" = ${args.actorId}::uuid
     WHERE "id"         = ${args.id}::uuid
       AND "updated_at" = ${args.expectedUpdatedAt}::timestamptz
       AND "deleted_at" IS NULL
    RETURNING "id", "updated_at"
  `;
  const row = rows[0];
  return {
    matched: row === undefined ? 0 : 1,
    newUpdatedAt: row === undefined ? null : row.updated_at,
  };
}
