// M5 application (PRIVATE) — the Public Review READ SERVICES (Doc-4G §G8.5 — `get_review` / `list_reviews`).
// CQRS reads: side-effect-free, NOT audited (Doc-4A §17.1), `Idempotency: not-applicable`. The public
// projection returns ONLY `published` reviews — non-published states never leave M5 on the public read
// (Doc-4G §G8.5 §6). Defense-in-depth: the read filters `status='published'` EXPLICITLY (get) / in the
// repository where-clause (list), AND the `public_reviews_public_read` RLS enforces the same for a
// public/no-GUC caller (a non-published id resolves to `null` → NOT_FOUND).
//
// SCOPE: the Public Review reads ONLY. The Admin Rating read (`list_admin_ratings`, §G8.5) is a SEPARATE
// aggregate (WP5b) and is NOT built here.

import { prisma, type DbExecutor } from "@/shared/db";
import { UUID_PATTERN } from "@/shared/ids";
import {
  getReviewById,
  listPublishedReviewsByVendor,
  type PublicReviewRow,
  type ReviewListCursor,
} from "@/modules/trust/infrastructure/data/public-review.repository";
import {
  REVIEW_INVALID_INPUT_CODE,
  REVIEW_LIST_DEFAULT_LIMIT,
  REVIEW_LIST_MAX_LIMIT,
  REVIEW_NOT_FOUND_CODE,
} from "@/modules/trust/domain/public-review.constants";
import type {
  GetReviewInput,
  GetReviewOutcome,
  ListReviewsInput,
  ListReviewsOutcome,
  PublicReviewView,
  ReviewReadError,
} from "@/modules/trust/contracts/types";

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_PATTERN.test(v);
}

function readFail(
  errorClass: ReviewReadError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: ReviewReadError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** Map a `public_reviews` read row to the public projection (Doc-4G §G8.5 §3 — only `published` surfaces). */
function toView(row: PublicReviewRow): PublicReviewView {
  return {
    publicReviewId: row.id,
    vendorProfileId: row.vendorProfileId,
    rating: row.rating,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    // The published/moderation timestamp is realized against `updated_at` (no dedicated published_at column).
    publishedAt: row.updatedAt.toISOString(),
  };
}

/** Encode an opaque keyset cursor from a page's last row (`(created_at, id)`). */
function encodeCursor(row: PublicReviewRow): string {
  return Buffer.from(`${row.createdAt.toISOString()}|${row.id}`, "utf8").toString("base64url");
}

/** Decode an opaque keyset cursor; `null` when malformed (→ VALIDATION). */
function decodeCursor(cursor: string): ReviewListCursor | null {
  let raw: string;
  try {
    raw = Buffer.from(cursor, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const sep = raw.lastIndexOf("|");
  if (sep <= 0) return null;
  const iso = raw.slice(0, sep);
  const id = raw.slice(sep + 1);
  const createdAt = new Date(iso);
  if (Number.isNaN(createdAt.getTime()) || !isUuid(id)) return null;
  return { createdAt, id };
}

/** Clamp the requested page size to the [ESC-TRUST-POLICY] window (default when omitted / out of range). */
function clampLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1) {
    return REVIEW_LIST_DEFAULT_LIMIT;
  }
  return Math.min(limit, REVIEW_LIST_MAX_LIMIT);
}

/**
 * `get_review` (Doc-4G §G8.5) — read one PUBLISHED review by id under the caller's RLS scope. A non-published
 * id (or a public/no-GUC caller hitting a non-published row) resolves to NOT_FOUND (defense-in-depth: the
 * explicit `status === 'published'` check + the RLS public-read policy). Not audited.
 */
export async function getReview(
  input: GetReviewInput,
  db: DbExecutor = prisma,
): Promise<GetReviewOutcome> {
  if (!isUuid(input.publicReviewId)) {
    return readFail("VALIDATION", REVIEW_INVALID_INPUT_CODE, "public_review_id must be a uuid.");
  }
  const row = await getReviewById(input.publicReviewId, db);
  if (row === null || row.status !== "published") {
    // Non-published states are not exposed on the public read (Doc-4G §G8.5 §6/§9).
    return readFail("NOT_FOUND", REVIEW_NOT_FOUND_CODE, "Not found.");
  }
  return { ok: true, result: toView(row) };
}

/**
 * `list_reviews` (Doc-4G §G8.5) — list a vendor's PUBLISHED reviews (only `published`), keyset-paginated over
 * `(created_at desc, id desc)`. Allowlisted params only (`limit`, `cursor` — Doc-4A §9.6); a malformed cursor
 * is VALIDATION. Not audited.
 */
export async function listReviews(
  input: ListReviewsInput,
  db: DbExecutor = prisma,
): Promise<ListReviewsOutcome> {
  if (!isUuid(input.vendorProfileId)) {
    return readFail("VALIDATION", REVIEW_INVALID_INPUT_CODE, "vendor_profile_id must be a uuid.");
  }
  const limit = clampLimit(input.limit);

  let cursor: ReviewListCursor | null = null;
  if (input.cursor != null) {
    cursor = decodeCursor(input.cursor);
    if (cursor === null) {
      return readFail("VALIDATION", REVIEW_INVALID_INPUT_CODE, "cursor is malformed.");
    }
  }

  // Fetch limit + 1 to detect a next page without a second round-trip.
  const rows = await listPublishedReviewsByVendor(
    input.vendorProfileId,
    { limit: limit + 1, cursor },
    db,
  );
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last !== undefined ? encodeCursor(last) : null;

  return { ok: true, result: { reviews: page.map(toView), nextCursor } };
}
