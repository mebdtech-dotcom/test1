// M5 infrastructure (PRIVATE) — the `trust.public_reviews` reads + the IN-BAND writes (the author `insertReview`
// + the optimistic staff `transitionReview`). This is M5 writing/reading its OWN schema (allowed); other
// modules reach it only via M5 contracts, never by importing infrastructure.
//
// WHY IN-BAND (NOT a SECURITY-DEFINER function — the crux vs the score-class tables): `trust.public_reviews`
// RLS grants in-band write policies — `public_reviews_author FOR ALL` (buyer submit under `app.active_org`)
// and `public_reviews_staff FOR ALL` (moderate/publish/remove under `app.is_platform_staff`) — so writes go
// IN-BAND on the caller's tx (the D7 / WP4c fraud audited-write pattern; NO SD function, unlike the
// verified-tier / score tables which grant no write policy and force an owner-role/SD write). This repository
// OWNS the SQL and knows NOTHING of audit policy — it returns raw outcomes so the SERVICE decides audit (and
// there is NO event — Doc-4G §H.7).
//
// The READS (`getReviewById`, `listPublishedReviewsByVendor`) use the Prisma model under RLS (the public-read
// policy admits only `published`+not-soft-deleted; the author/staff policies admit the caller's own scope).
// The WRITES use RAW SQL so `updated_at` is written millisecond-TRUNCATED (`date_trunc('milliseconds', …)`) —
// a value read back through Prisma (JS `Date`, ms precision) round-trips to an EXACT match on the next
// transition's optimistic WHERE (a microsecond token would falsely miss and read as CONFLICT; the WP3
// verified-tier / WP4c fraud precedent).

import { Prisma, prisma, type DbExecutor } from "@/shared/db";
import type { PublicReviewStatus } from "@/modules/trust/domain/public-review.state";

/** A read projection of one `public_reviews` row (the fields the services + reads need). */
export interface PublicReviewRow {
  id: string;
  vendorProfileId: string;
  authorOrganizationId: string;
  engagementId: string;
  rating: number;
  body: string | null;
  status: PublicReviewStatus;
  moderatedBy: string | null;
  moderatedAt: Date | null;
  createdAt: Date;
  /** The optimistic-concurrency token (Doc-4A §14; ms-truncated by the in-band writers). */
  updatedAt: Date;
}

/** `insertReview` arguments — server-resolved, already-validated (Doc-4G §G8.1). `authorOrganizationId` is
 *  the SERVER-derived active org (Invariant #5). `actorId` = the buyer user (`created_by`/`updated_by`). */
export interface InsertReviewArgs {
  /** App-minted UUIDv7 for the new row (M0 id generator; never a raw DB default). */
  id: string;
  vendorProfileId: string;
  authorOrganizationId: string;
  engagementId: string;
  rating: number;
  body: string | null;
  actorId: string;
}

/** Outcome of the submit insert. `created:false` ⇒ the `(engagement_id, author_organization_id)` UNIQUE was
 *  hit → a review already exists for this engagement from this author (the service maps it to BUSINESS). */
export interface InsertReviewResult {
  id: string;
  status: PublicReviewStatus;
  updatedAt: Date | null;
  created: boolean;
}

/** The three staff transition kinds (Doc-4G §G8.2/§G8.3). Each builds a distinct SET clause. */
export type ReviewTransitionKind = "moderate" | "publish" | "remove";

/** Optimistic in-band transition arguments (moderate/publish/remove). Optimistic on `expectedUpdatedAt`;
 *  source-status guarded (defense-in-depth; the service checks the domain machine first). */
export interface TransitionReviewArgs {
  id: string;
  /** The optimistic precondition — the current `updated_at` the caller observed. */
  expectedUpdatedAt: Date;
  /** The required source status (guarded in the WHERE). */
  sourceStatus: PublicReviewStatus;
  /** The target status. */
  targetStatus: PublicReviewStatus;
  /** The acting staff actor (`updated_by`; also `moderated_by` for moderate, `deleted_by` for remove). */
  actorId: string | null;
  /** Which SET clause to build. */
  kind: ReviewTransitionKind;
  /** `remove` only — persisted as the SD `delete_reason` column (Doc-4G §G8.3). */
  removalReason?: string | null;
}

/** Outcome of the transition write. `matched:0` ⇒ stale token / a concurrent state change (CONFLICT). */
export interface TransitionReviewResult {
  matched: number;
  newUpdatedAt: Date | null;
}

/** A decoded keyset cursor for the public list (`(created_at, id)` desc). */
export interface ReviewListCursor {
  createdAt: Date;
  id: string;
}

/** `listPublishedReviewsByVendor` options — page size + optional keyset cursor. */
export interface ListPublishedReviewsOptions {
  limit: number;
  cursor?: ReviewListCursor | null;
}

/** Map a Prisma `public_reviews` row to the read projection. */
function toRow(row: {
  id: string;
  vendorProfileId: string;
  authorOrganizationId: string;
  engagementId: string;
  rating: number;
  body: string | null;
  status: PublicReviewStatus;
  moderatedBy: string | null;
  moderatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): PublicReviewRow {
  return {
    id: row.id,
    vendorProfileId: row.vendorProfileId,
    authorOrganizationId: row.authorOrganizationId,
    engagementId: row.engagementId,
    rating: row.rating,
    body: row.body,
    status: row.status,
    moderatedBy: row.moderatedBy,
    moderatedAt: row.moderatedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Read one `public_reviews` row by id (Prisma, under the caller's RLS scope). `null` = the id does not
 * resolve. For a public/no-GUC caller, the `public_reviews_public_read` policy admits ONLY `published`
 * (not soft-deleted) rows → a non-published id yields `null` (the service maps it to NOT_FOUND). For a staff
 * caller (`app.is_platform_staff`) the staff policy admits any status.
 */
export async function getReviewById(
  id: string,
  db: DbExecutor = prisma,
): Promise<PublicReviewRow | null> {
  const row = await db.publicReview.findUnique({ where: { id } });
  if (row === null) return null;
  return toRow({ ...row, status: row.status as PublicReviewStatus });
}

/**
 * Read the vendor's `published` (not soft-deleted) reviews (Prisma), deterministically ordered
 * `(created_at desc, id desc)` and keyset-paginated. The `status:'published', deletedAt:null` filter is
 * EXPLICIT (defense-in-depth; the `public_reviews_public_read` RLS also enforces it). Returns up to `limit`
 * rows (the read service asks for `limit + 1` to detect a next page).
 */
export async function listPublishedReviewsByVendor(
  vendorProfileId: string,
  opts: ListPublishedReviewsOptions,
  db: DbExecutor = prisma,
): Promise<PublicReviewRow[]> {
  const where: Prisma.PublicReviewWhereInput = {
    vendorProfileId,
    status: "published",
    deletedAt: null,
  };
  if (opts.cursor != null) {
    // Keyset over the deterministic `(created_at desc, id desc)` sort.
    where.OR = [
      { createdAt: { lt: opts.cursor.createdAt } },
      { createdAt: opts.cursor.createdAt, id: { lt: opts.cursor.id } },
    ];
  }
  const rows = await db.publicReview.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: opts.limit,
  });
  return rows.map((r) => toRow({ ...r, status: r.status as PublicReviewStatus }));
}

/**
 * The submit insert (Doc-4G §G8.1), IN-BAND on the caller's active-org tx executor `db` (same tx as the
 * audit append — atomic). `INSERT … ON CONFLICT ("engagement_id","author_organization_id") DO NOTHING
 * RETURNING …` — an EMPTY result ⇒ `{ created:false }` (a review already exists for this engagement from
 * this author; the service maps it to BUSINESS `trust_review_duplicate`, NO audit on that path). `updated_at`
 * is written ms-truncated (the optimistic token); `created_by`/`updated_by` = the buyer user id; status
 * defaults to `submitted` (entry). NO event (Doc-4G §H.7).
 */
export async function insertReview(
  args: InsertReviewArgs,
  db: DbExecutor = prisma,
): Promise<InsertReviewResult> {
  const rows = await db.$queryRaw<Array<{ id: string; updated_at: Date }>>(Prisma.sql`
    INSERT INTO "trust"."public_reviews" (
      "id", "vendor_profile_id", "author_organization_id", "engagement_id", "rating", "body",
      "status", "updated_at", "created_by", "updated_by"
    ) VALUES (
      ${args.id}::uuid, ${args.vendorProfileId}::uuid, ${args.authorOrganizationId}::uuid,
      ${args.engagementId}::uuid, ${args.rating}::smallint, ${args.body}::text,
      'submitted'::"trust"."public_review_status",
      date_trunc('milliseconds', now()), ${args.actorId}::uuid, ${args.actorId}::uuid
    )
    ON CONFLICT ("engagement_id", "author_organization_id") DO NOTHING
    RETURNING "id", "updated_at"
  `);
  const row = rows[0];
  if (row === undefined) {
    // UNIQUE(engagement_id, author_organization_id) hit — a review already exists for this author+engagement.
    return { id: args.id, status: "submitted", updatedAt: null, created: false };
  }
  return { id: row.id, status: "submitted", updatedAt: row.updated_at, created: true };
}

/**
 * Apply a staff transition IN-BAND on the caller's tx executor `db` (same tx as the audit — atomic).
 * Optimistic on `updated_at = expectedUpdatedAt`; source-status guarded (`status = sourceStatus`) as
 * defense-in-depth (the service checks the domain machine BEFORE calling). Builds a distinct SET clause per
 * `kind`: `moderate` also sets `moderated_by`/`moderated_at`; `remove` also sets `deleted_at`/`deleted_by`/
 * `delete_reason`. `updated_at` is written ms-truncated (the next optimistic token). `matched=0` ⇒ stale
 * token / a concurrent state change (the caller maps it to CONFLICT). Returns the new token so the caller
 * rides the fresh optimistic revision. NO event.
 */
export async function transitionReview(
  args: TransitionReviewArgs,
  db: DbExecutor = prisma,
): Promise<TransitionReviewResult> {
  const status = Prisma.sql`${args.targetStatus}::"trust"."public_review_status"`;
  const ts = Prisma.sql`date_trunc('milliseconds', clock_timestamp())`;
  const actor = Prisma.sql`${args.actorId}::uuid`;

  let setClause: Prisma.Sql;
  switch (args.kind) {
    case "moderate":
      setClause = Prisma.sql`
        "status" = ${status}, "updated_at" = ${ts}, "updated_by" = ${actor},
        "moderated_by" = ${actor}, "moderated_at" = now()`;
      break;
    case "publish":
      setClause = Prisma.sql`
        "status" = ${status}, "updated_at" = ${ts}, "updated_by" = ${actor}`;
      break;
    case "remove":
      setClause = Prisma.sql`
        "status" = ${status}, "updated_at" = ${ts}, "updated_by" = ${actor},
        "deleted_at" = now(), "deleted_by" = ${actor},
        "delete_reason" = ${args.removalReason ?? null}::text`;
      break;
  }

  const rows = await db.$queryRaw<Array<{ id: string; updated_at: Date }>>(Prisma.sql`
    UPDATE "trust"."public_reviews"
       SET ${setClause}
     WHERE "id"         = ${args.id}::uuid
       AND "updated_at" = ${args.expectedUpdatedAt}::timestamptz
       AND "status"     = ${args.sourceStatus}::"trust"."public_review_status"
    RETURNING "id", "updated_at"
  `);
  const row = rows[0];
  return {
    matched: row === undefined ? 0 : 1,
    newUpdatedAt: row === undefined ? null : row.updated_at,
  };
}
