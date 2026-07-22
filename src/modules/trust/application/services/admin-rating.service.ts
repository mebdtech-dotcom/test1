// M5 application (PRIVATE) — the BC-TRUST-5 Admin Rating SERVICE (Doc-4G §G8.4/§G8.5; Doc-6G §3.5.1). The
// staff create-or-update `setAdminRating` + the staff-only read `listAdminRatings` — exercised DIRECTLY by
// tests (the Admin HTTP wiring + the `staff_can_verify`/`staff_super_admin` comp-edge authz are DEFERRED).
// This is an IN-BAND AUDITED-WRITE aggregate (the D7 / WP4c fraud / WP5a public-review pattern) — ORCHESTRATION
// ONLY (owns no state).
//
// SEPARATE AUTHORITY (Doc-4G §H.9a): the Admin Rating is a DISTINCT aggregate from the Public Review — "never
// merged". This file imports NOTHING from the public-review aggregate.
//
// FROZEN POSTURES (build EXACTLY):
//   • NON-DISCLOSURE (F4G-PB5-M3 / §H.9f / Doc-4A §7.5): admin ratings are STAFF-INTERNAL — never public/
//     tenant-visible/externally exposed. The `admin_ratings_staff FOR ALL` RLS means a non-staff / no-GUC
//     caller sees ZERO rows (list returns an EMPTY page); the DEFERRED comp-edge collapses a non-staff single
//     access to NOT_FOUND (never AUTHORIZATION).
//   • NO EVENT (Doc-4G §H.7): Doc-2 §8 has NO Trust admin-rating event → emit NONE. The injected dep is
//     `appendAuditRecord` ONLY (no `writeOutboxEvent`).
//   • NO SD (Doc-6G §3.x): `admin_ratings_staff FOR ALL` admits in-band writes under the staff GUC — the
//     repository does plain in-band SQL. NO SECURITY-DEFINER function.
//   • FIREWALL (Doc-4G §H.9b; Invariant #6): an admin rating is an INTERNAL SIGNAL — it is NOT a platform
//     score and mutates NO Trust/Performance/Verification/Fraud/Financial-Tier row and issues no ban. This
//     service writes `admin_ratings` (+ audit) and NOTHING else.
//
// THE PER-VENDOR SINGLETON (the frozen §3.5.1 has NO `UNIQUE(vendor_profile_id)`): enforced in the app layer
// via a `pg_advisory_xact_lock(vendor_profile_id)` inside the caller's staff tx (the fraud check-then-write
// precedent) so the probe-then-write has no race window. `expected_revision` PRESENT ⇒ update intent (no live
// row → NOT_FOUND; stale token → CONFLICT); ABSENT ⇒ create intent (a live row already existing → CONFLICT —
// the one interpretive call, an OBS for the M5 exit gate: §G8.4 gives no explicit class for create-over-existing).
//
// AUDIT (Doc-4G §G8.4 §7): `admin_rating_set` carries `[ESC-TRUST-AUDIT]` (Doc-2 §9 693/694 enumerate no
// admin-rating action → nearest §9 Trust action by pointer; NO action invented). Attribution: Admin. The
// create-vs-update `operation` rides the audit `newValue` (no dedicated column). Reads are not audited.
//
// DEFERRED (STANDING CONSTRAINT — no placeholder resolver): the §G8.4 §7 DG-2 `vendor_profile_id` resolution
// (Marketplace read → REFERENCE/DEPENDENCY) is validated at the COMPOSITION EDGE and DEFERRED (the
// request_verification / WP5a precedent). This service imports NOTHING from M2 and stubs no resolver.

import { prisma, type DbExecutor } from "@/shared/db";
import { UUID_PATTERN, uuidv7 } from "@/shared/ids";
import {
  getLiveAdminRatingByVendor,
  insertAdminRating,
  listAdminRatingsByVendor,
  updateAdminRating,
  type AdminRatingListCursor,
  type AdminRatingRow,
} from "@/modules/trust/infrastructure/data/admin-rating.repository";
import {
  ADMIN_RATING_ENTITY_TYPE,
  AdminRatingAuditAction,
} from "@/modules/trust/domain/audit-actions";
import {
  ADMIN_RATING_CONFLICT_CODE,
  ADMIN_RATING_INVALID_INPUT_CODE,
  ADMIN_RATING_LIST_DEFAULT_LIMIT,
  ADMIN_RATING_LIST_MAX_LIMIT,
  ADMIN_RATING_NOT_FOUND_CODE,
} from "@/modules/trust/domain/admin-rating.constants";
import type {
  AdminRatingOperation,
  AdminRatingReadError,
  AdminRatingStaffContext,
  AdminRatingView,
  ListAdminRatingsInput,
  ListAdminRatingsOutcome,
  SetAdminRatingDeps,
  SetAdminRatingError,
  SetAdminRatingInput,
  SetAdminRatingOutcome,
} from "@/modules/trust/contracts/types";

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_PATTERN.test(v);
}

function setFail(
  errorClass: SetAdminRatingError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: SetAdminRatingError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

function readFail(
  errorClass: AdminRatingReadError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: AdminRatingReadError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/**
 * `set_admin_rating` (Doc-4G §G8.4) — staff create-or-update the vendor's SINGLETON admin rating, IN-BAND,
 * appending ONE `[ESC-TRUST-AUDIT]` `admin_rating_set` audit atomically. MUST run inside a staff-scoped tx
 * (`app.is_platform_staff = true`). NO event; firewall.
 */
export async function setAdminRating(
  input: SetAdminRatingInput,
  ctx: AdminRatingStaffContext,
  deps: SetAdminRatingDeps,
  db: DbExecutor = prisma,
): Promise<SetAdminRatingOutcome> {
  // (1) SYNTAX (Doc-4G §G8.4 stage 1/2).
  if (!isUuid(input.vendorProfileId)) {
    return setFail(
      "VALIDATION",
      ADMIN_RATING_INVALID_INPUT_CODE,
      "vendor_profile_id must be a uuid.",
    );
  }
  if (typeof input.ratingValue !== "number" || !Number.isFinite(input.ratingValue)) {
    return setFail(
      "VALIDATION",
      ADMIN_RATING_INVALID_INPUT_CODE,
      "rating_value must be a finite number.",
    );
  }
  if (
    input.ratingNote !== undefined &&
    input.ratingNote !== null &&
    typeof input.ratingNote !== "string"
  ) {
    return setFail("VALIDATION", ADMIN_RATING_INVALID_INPUT_CODE, "rating_note must be text.");
  }
  const isUpdateIntent = input.expectedRevision !== undefined && input.expectedRevision !== null;
  if (
    isUpdateIntent &&
    !(input.expectedRevision instanceof Date && !Number.isNaN(input.expectedRevision.getTime()))
  ) {
    return setFail(
      "VALIDATION",
      ADMIN_RATING_INVALID_INPUT_CODE,
      "expected_revision must be a valid revision token.",
    );
  }

  const comment = input.ratingNote ?? null;

  // (2) SINGLETON via advisory-xact-lock (the fraud check-then-write; the frozen §3.5.1 has NO
  //     UNIQUE(vendor_profile_id)) — serialize concurrent same-vendor sets so probe-then-write has no race.
  //     TRANSACTION-scoped (released at commit OR rollback). hashtextextended(<uuid text>, 0) → bigint key.
  await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${input.vendorProfileId}, 0))`;
  const live = await getLiveAdminRatingByVendor(input.vendorProfileId, db);

  let adminRatingId: string;
  let operation: AdminRatingOperation;
  let oldValue: Record<string, unknown> | null;

  if (isUpdateIntent) {
    // (3a) UPDATE — no live row ⇒ NOT_FOUND ("rating row absent on update", §G8.4 §9).
    if (live === null) {
      return setFail("NOT_FOUND", ADMIN_RATING_NOT_FOUND_CODE, "Not found.");
    }
    const write = await updateAdminRating(
      {
        id: live.id,
        expectedUpdatedAt: input.expectedRevision as Date,
        score: input.ratingValue,
        comment,
        actorId: ctx.staffUserId,
      },
      db,
    );
    if (write.matched === 0 || write.newUpdatedAt === null) {
      return setFail(
        "CONFLICT",
        ADMIN_RATING_CONFLICT_CODE,
        "The admin rating changed since it was read; re-read then retry.",
      );
    }
    adminRatingId = live.id;
    operation = "update";
    oldValue = { score: live.score, comment: live.comment };
  } else {
    // (3b) CREATE — a live row already exists ⇒ CONFLICT (the vendor already has a rating; re-read then update
    //      with expected_revision). OBS (M5 exit gate): §G8.4 gives no explicit class for create-over-existing;
    //      CONFLICT is the interpretive call (the app-enforced singleton vs the missing DB UNIQUE).
    if (live !== null) {
      return setFail(
        "CONFLICT",
        ADMIN_RATING_CONFLICT_CODE,
        "This vendor already has an admin rating; re-read then update with expected_revision.",
      );
    }
    const rowId = uuidv7();
    const write = await insertAdminRating(
      {
        id: rowId,
        vendorProfileId: input.vendorProfileId,
        score: input.ratingValue,
        comment,
        actorId: ctx.staffUserId,
      },
      db,
    );
    adminRatingId = write.id;
    operation = "create";
    oldValue = null;
  }

  // (4) AUDIT — atomic with the write (SAME tx `db`), via the M0 facade ONLY. `[ESC-TRUST-AUDIT]`
  //     `admin_rating_set`, Admin attribution. `operation` (create|update) + the mapped `score`/`comment` ride
  //     `newValue`. If this throws, the whole tx rolls back. NO event (Doc-4G §H.7).
  await deps.appendAuditRecord(
    {
      actorId: ctx.staffUserId,
      actorType: "admin",
      organizationId: null,
      entityType: ADMIN_RATING_ENTITY_TYPE,
      entityId: adminRatingId,
      action: AdminRatingAuditAction.SET,
      oldValue,
      newValue: {
        operation,
        vendor_profile_id: input.vendorProfileId,
        score: input.ratingValue,
        comment,
      },
    },
    db,
  );

  return { ok: true, result: { adminRatingId, operation } };
}

/** Map an `admin_ratings` read row to the staff view (Doc-4G §G8.5 §3 — staff-only projection). */
function toView(row: AdminRatingRow): AdminRatingView {
  return {
    adminRatingId: row.id,
    vendorProfileId: row.vendorProfileId,
    score: row.score,
    ratedBy: row.ratedBy,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Encode an opaque keyset cursor from a page's last row (`(created_at, id)`). Local to this aggregate (H.9a). */
function encodeCursor(row: AdminRatingRow): string {
  return Buffer.from(`${row.createdAt.toISOString()}|${row.id}`, "utf8").toString("base64url");
}

/** Decode an opaque keyset cursor; `null` when malformed (→ VALIDATION). */
function decodeCursor(cursor: string): AdminRatingListCursor | null {
  let raw: string;
  try {
    raw = Buffer.from(cursor, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const sep = raw.lastIndexOf("|");
  if (sep <= 0) return null;
  const createdAt = new Date(raw.slice(0, sep));
  const id = raw.slice(sep + 1);
  if (Number.isNaN(createdAt.getTime()) || !isUuid(id)) return null;
  return { createdAt, id };
}

/** Clamp the requested page size to the [ESC-TRUST-POLICY] window (default when omitted / out of range). */
function clampLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1) {
    return ADMIN_RATING_LIST_DEFAULT_LIMIT;
  }
  return Math.min(limit, ADMIN_RATING_LIST_MAX_LIMIT);
}

/**
 * `list_admin_ratings` (Doc-4G §G8.5) — STAFF-ONLY read of the vendor's live admin ratings, keyset-paginated
 * over `(created_at desc, id desc)`. NON-DISCLOSURE (F4G-PB5-M3): under a non-staff / no-GUC caller the
 * `admin_ratings_staff` RLS yields ZERO rows → an EMPTY page (the DEFERRED comp-edge additionally enforces
 * `staff_can_verify` and collapses to NOT_FOUND). Not audited; `Idempotency: not-applicable`.
 */
export async function listAdminRatings(
  input: ListAdminRatingsInput,
  db: DbExecutor = prisma,
): Promise<ListAdminRatingsOutcome> {
  if (!isUuid(input.vendorProfileId)) {
    return readFail(
      "VALIDATION",
      ADMIN_RATING_INVALID_INPUT_CODE,
      "vendor_profile_id must be a uuid.",
    );
  }
  const limit = clampLimit(input.limit);

  let cursor: AdminRatingListCursor | null = null;
  if (input.cursor != null) {
    cursor = decodeCursor(input.cursor);
    if (cursor === null) {
      return readFail("VALIDATION", ADMIN_RATING_INVALID_INPUT_CODE, "cursor is malformed.");
    }
  }

  const rows = await listAdminRatingsByVendor(
    input.vendorProfileId,
    { limit: limit + 1, cursor },
    db,
  );
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last !== undefined ? encodeCursor(last) : null;

  return { ok: true, result: { adminRatings: page.map(toView), nextCursor } };
}
