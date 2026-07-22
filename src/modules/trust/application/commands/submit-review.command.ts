// M5 application (PRIVATE) — the `trust.submit_review.v1` write command (Doc-4G §G8.1; the D7 / WP4c
// audited-write pattern). Buyer-authored (User + active-org). ORCHESTRATION ONLY (owns no state): SYNTAX →
// BUSINESS (rating range) → in-band `public_reviews` write → append ONE §9 audit — ALL on the SAME
// caller-supplied active-org RLS-scoped transaction executor.
//
// THE TWO INVARIANTS (guaranteed by sharing ONE transaction `db`, RLS-scoped by `withActiveOrgContext`
// upstream):
//   • No business write without an audit row — a successful insert appends its audit row in the SAME tx; if
//     the append fails, the tx rolls back and the in-band insert is undone (no orphan review).
//   • No audit row without a successful write — audit is appended ONLY when the insert `created === true`
//     (a genuine new row); the duplicate path (`created === false`) writes NO audit.
//
// USERS ACT, ORGANIZATIONS OWN (Invariant #5): `author_organization_id = ctx.activeOrgId` — SERVER-derived
// from the authenticated active-org context, NEVER a caller-supplied field (it is not even in the input).
//
// DEFERRED cross-module seams (STANDING CONSTRAINT — build NO placeholder resolver; the request_verification
// precedent): the DG-4 post-award ENGAGEMENT gate (engagement resolves + is the caller-org's completed
// engagement with the vendor — Operations, service-validated) and DG-2 VENDOR_PROFILE resolution
// (Marketplace) are validated at the COMPOSITION EDGE and are DEFERRED. This command imports NOTHING from
// M2/M4 and stubs no resolver — `engagement_id`/`vendor_profile_id` are stored as bare UUID refs; the DB
// `UNIQUE(engagement_id, author_organization_id)` enforces one-review-per-engagement-per-author. [ESC]-class
// deferral: DG-4/DG-2 REFERENCE/NOT_FOUND/DEPENDENCY handling lands with the composition edge (a later WP).
//
// AUDIT ACTION (canonical, ENUMERATED): `review_submitted` — the M5 constant (`domain/audit-actions.ts`)
// realizing the Doc-2 §9 line 693 Reviews action "review submit" (Doc-4G §G8.1 §7), User-attributed. NO
// event (Doc-4G §H.7 — Doc-2 §8 has no Trust review event).

import { prisma, type DbExecutor } from "@/shared/db";
import { UUID_PATTERN, uuidv7 } from "@/shared/ids";
import { insertReview } from "@/modules/trust/infrastructure/data/public-review.repository";
import { PUBLIC_REVIEW_ENTITY_TYPE, ReviewAuditAction } from "@/modules/trust/domain/audit-actions";
import {
  REVIEW_DUPLICATE_CODE,
  REVIEW_INVALID_INPUT_CODE,
  REVIEW_RATING_RANGE_CODE,
} from "@/modules/trust/domain/public-review.constants";
import type {
  SubmitReviewContext,
  SubmitReviewDeps,
  SubmitReviewInput,
  SubmitReviewOutcome,
} from "@/modules/trust/contracts/types";

/** The stage-1 SYNTAX result (Doc-4G §G8.1 stage 1/2). `null` message when it passes. */
export type SubmitReviewSyntaxResult = { ok: true } | { ok: false; message: string };

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_PATTERN.test(v);
}

/**
 * Stage-1 body SYNTAX (Doc-4A §11.2 category 1; Doc-4G §G8.1 stage 1/2) — PURE (no context): `vendorProfileId`
 * / `engagementId` present + uuid; `rating` present + integer; `body` optional text. SINGLE SOURCE — run at
 * the composition edge (before AUTHZ, §11.2 order) AND re-run by the command (self-guard / defense-in-depth,
 * the request_verification precedent). The rating DOMAIN (1–5) is a stage-3 BUSINESS check in the command,
 * NOT here.
 */
export function validateSubmitReviewInput(input: SubmitReviewInput): SubmitReviewSyntaxResult {
  if (!isUuid(input.vendorProfileId)) {
    return { ok: false, message: "vendor_profile_id is required and must be a uuid." };
  }
  if (!isUuid(input.engagementId)) {
    return { ok: false, message: "engagement_id is required and must be a uuid." };
  }
  if (typeof input.rating !== "number" || !Number.isInteger(input.rating)) {
    return { ok: false, message: "rating is required and must be an integer." };
  }
  if (input.body !== undefined && input.body !== null && typeof input.body !== "string") {
    return { ok: false, message: "body must be text." };
  }
  return { ok: true };
}

/**
 * Map a failed stage-1 SYNTAX result to its VALIDATION outcome; `null` when SYNTAX passes. SINGLE SOURCE
 * consumed by BOTH the command (below) and the DEFERRED composition edge — so the mapping lives in one place.
 */
export function submitReviewSyntaxOutcome(
  result: SubmitReviewSyntaxResult,
): SubmitReviewOutcome | null {
  if (result.ok) return null;
  return {
    ok: false,
    error: {
      errorClass: "VALIDATION",
      errorCode: REVIEW_INVALID_INPUT_CODE,
      message: result.message,
    },
  };
}

/**
 * Submit a Public Review (Doc-4G §G8.1). Opens a `public_reviews` row in state `submitted`, appending the
 * canonical ENUMERATED audit action (`review_submitted`) atomically.
 *
 * @param input the request fields (Doc-4G §G8.1 request schema).
 * @param ctx   the server-resolved context (userId/activeOrgId — never client input; Invariant #5).
 * @param deps  the injected M0 `appendAuditRecord` contract service (no outbox — no event).
 * @param db    the active-org RLS-scoped transaction executor (from `withActiveOrgContext`); write + audit share it.
 */
export async function submitReview(
  input: SubmitReviewInput,
  ctx: SubmitReviewContext,
  deps: SubmitReviewDeps,
  db: DbExecutor = prisma,
): Promise<SubmitReviewOutcome> {
  // (1) SYNTAX (Doc-4G §G8.1 stage 1/2) — re-run the shared validator (single source; self-guard).
  const badSyntax = submitReviewSyntaxOutcome(validateSubmitReviewInput(input));
  if (badSyntax !== null) return badSyntax;

  // (2) BUSINESS (Doc-4G §G8.1 stage 3 SEMANTIC → BUSINESS class) — rating ∈ 1–5.
  if (input.rating < 1 || input.rating > 5) {
    return {
      ok: false,
      error: {
        errorClass: "BUSINESS",
        errorCode: REVIEW_RATING_RANGE_CODE,
        message: "rating must be within 1–5 (Doc-2 §10.6).",
      },
    };
  }

  // (3) WRITE — the IN-BAND submit insert. `author_organization_id` = the SERVER-derived active org
  //     (Invariant #5 — never input). `created_by`/`updated_by` = the buyer user id. The DB
  //     UNIQUE(engagement_id, author_organization_id) is the one-review-per-engagement-per-author gate.
  const write = await insertReview(
    {
      id: uuidv7(),
      vendorProfileId: input.vendorProfileId,
      authorOrganizationId: ctx.activeOrgId,
      engagementId: input.engagementId,
      rating: input.rating,
      body: input.body ?? null,
      actorId: ctx.userId,
    },
    db,
  );

  // (4) BUSINESS (Doc-4G §G8.1 §8) — a review already exists for this (engagement, author). NO audit on this
  //     path (Invariant 2: no audit row without a real create).
  if (!write.created) {
    return {
      ok: false,
      error: {
        errorClass: "BUSINESS",
        errorCode: REVIEW_DUPLICATE_CODE,
        message: "A review already exists for this engagement from this organization.",
      },
    };
  }

  // (5) AUDIT — atomic with the write (SAME tx `db`), via the M0 facade ONLY (Doc-4B §B10). Canonical
  //     ENUMERATED action `review_submitted`, User-attributed (`author_organization_id`). If this throws,
  //     the whole tx (incl. the insert) rolls back (Invariant 1). NO event (Doc-4G §H.7).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: PUBLIC_REVIEW_ENTITY_TYPE,
      entityId: write.id,
      action: ReviewAuditAction.SUBMITTED,
      oldValue: null,
      newValue: {
        vendor_profile_id: input.vendorProfileId,
        engagement_id: input.engagementId,
        rating: input.rating,
        status: "submitted",
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { publicReviewId: write.id, status: "submitted" } };
}
