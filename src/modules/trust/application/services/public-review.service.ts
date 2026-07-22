// M5 application (PRIVATE) — the Public Review STAFF lifecycle SERVICE (Doc-4G §G8.2/§G8.3; Doc-6G §3.5.2).
// The three staff mutations the DEFERRED Admin commands will call — exercised DIRECTLY by tests. This is an
// IN-BAND AUDITED-WRITE aggregate (the D7 / WP4c fraud pattern) — ORCHESTRATION ONLY (owns no state).
//
// THREE FROZEN POSTURES (the crux — build EXACTLY):
//   • NO EVENT (Doc-4G §H.7): Doc-2 §8 has NO Trust review event → BC-TRUST-5 emits NONE. moderate/remove
//     inject `appendAuditRecord` ONLY; publish adds the in-module `ingestPerformanceInput` (Path B) — an
//     in-module SERVICE CALL, NOT an event. This service NEVER calls `core.write_outbox_event.v1`.
//   • NO SD (Doc-6G §3.5.2): `public_reviews` grants in-band write policies (`public_reviews_staff FOR ALL`)
//     → staff writes go IN-BAND under the platform-staff GUC (`app.is_platform_staff = true`). NO
//     SECURITY-DEFINER function.
//   • FIREWALL (Doc-4G §H.9; Invariant #6): a review mutates NO Trust Score / Performance Score /
//     Verification / Fraud Signal / Financial Tier row and issues NO ban. The ONLY downstream write — on
//     PUBLISH — is a `performance_inputs` row appended VIA the BC-TRUST-3 ingestion service (F4G-M2
//     single-writer, §H.9c), NEVER a direct write. Reviews are informational signals only.
//
// PUBLISH IS THE TWO-STEP MODEL (patch F4G-PB5-MA2 — authoritative, no interpretation permitted):
//   Step 1 (atomic tx): transition `approved → published` + the §9 `review_published` audit — BOTH in ONE tx.
//     If the audit append throws (Doc-4B unavailable) the WHOLE Step-1 tx rolls back → DEPENDENCY (both fail
//     cleanly; the review is NOT published). A stale `expected_revision` → CONFLICT.
//   Step 2 (SEPARATE tx): invoke the BC-TRUST-3 ingestion service (Path B). If Step 2 fails, Step 1 is NOT
//     rolled back — the review is already `published`; return success flagged `ingestionApplied:false` (the
//     composition-edge retry is DEFERRED). The review lifecycle outcome is INDEPENDENT of ingestion availability.
// Because publish owns TWO transaction boundaries it takes the BASE `client` (not a single injected tx) and
// sets the platform-staff GUC inside EACH of its transactions.
//
// AUDIT (Doc-4G §H.6): each mutation binds an ENUMERATED Doc-2 §9 line 693 Reviews action (moderation
// decision / publish / remove) — NO `[ESC-TRUST-AUDIT]`. `moderation_note` (reject; NO DB column, Doc-4G
// §H.10) rides the audit `newValue`; `removal_reason` persists as the SD `delete_reason` column.

import { prisma, type DbExecutor, type Prisma, type PrismaClient } from "@/shared/db";
import { UUID_PATTERN } from "@/shared/ids";
import {
  getReviewById,
  transitionReview,
} from "@/modules/trust/infrastructure/data/public-review.repository";
import { ingestPerformanceInput as ingestPerformanceInputInModule } from "@/modules/trust/application/services/performance-score.service";
import { PUBLIC_REVIEW_ENTITY_TYPE, ReviewAuditAction } from "@/modules/trust/domain/audit-actions";
import {
  isReviewModerationLegal,
  isReviewPublishLegal,
  isReviewRemoveLegal,
  reviewModerationTarget,
} from "@/modules/trust/domain/public-review.state";
import {
  REVIEW_DEPENDENCY_CODE,
  REVIEW_FEEDBACK_INPUT_TYPE,
  REVIEW_FEEDBACK_SOURCE_TYPE,
  REVIEW_ILLEGAL_STATE_CODE,
  REVIEW_INVALID_INPUT_CODE,
  REVIEW_MODERATION_DECISIONS,
  REVIEW_NOT_FOUND_CODE,
  REVIEW_NOTE_REQUIRED_CODE,
  REVIEW_REVISION_CONFLICT_CODE,
} from "@/modules/trust/domain/public-review.constants";
import type {
  ModerateReviewInput,
  ModerateReviewOutcome,
  PublishReviewDeps,
  PublishReviewInput,
  PublishReviewOutcome,
  RemoveReviewInput,
  RemoveReviewOutcome,
  ReviewStaffContext,
  ReviewStaffError,
  SubmitReviewDeps,
} from "@/modules/trust/contracts/types";

/** Build a staff-op failure outcome (moderate/remove share the shape; publish reuses the same error union). */
function staffFail(
  errorClass: ReviewStaffError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: ReviewStaffError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_PATTERN.test(v);
}

function isValidRevision(v: unknown): v is Date {
  return v instanceof Date && !Number.isNaN(v.getTime());
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** Pin the platform-staff GUC TRANSACTION-LOCAL — the in-band `public_reviews` staff write + the audit append
 *  read it (`public_reviews_staff FOR ALL`; the audit context-append staff leg). Publish sets this inside
 *  EACH of its own transactions; moderate/remove receive an already-staff-scoped `db` from the caller. */
async function setStaffGuc(tx: Prisma.TransactionClient): Promise<void> {
  await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
}

/**
 * `moderate_review` (Doc-4G §G8.2) — approve/reject a `submitted` review, IN-BAND, appending ONE ENUMERATED
 * `review_moderation_decision` audit atomically. Reject REQUIRES a `moderation_note` (BUSINESS). MUST run
 * inside a staff-scoped tx (`app.is_platform_staff = true`). NO event; NO Path-B; firewall.
 */
export async function moderateReview(
  input: ModerateReviewInput,
  ctx: ReviewStaffContext,
  deps: SubmitReviewDeps,
  db: DbExecutor = prisma,
): Promise<ModerateReviewOutcome> {
  // (1) SYNTAX.
  if (!isUuid(input.publicReviewId)) {
    return staffFail("VALIDATION", REVIEW_INVALID_INPUT_CODE, "public_review_id must be a uuid.");
  }
  if (!isValidRevision(input.expectedRevision)) {
    return staffFail(
      "VALIDATION",
      REVIEW_INVALID_INPUT_CODE,
      "expected_revision must be a valid revision token.",
    );
  }
  if (!REVIEW_MODERATION_DECISIONS.has(input.decision)) {
    return staffFail(
      "VALIDATION",
      REVIEW_INVALID_INPUT_CODE,
      "decision must be approve or reject.",
    );
  }

  // (2) REFERENCE — read the review (RLS staff policy admits any status). Absent → NOT_FOUND.
  const current = await getReviewById(input.publicReviewId, db);
  if (current === null) {
    return staffFail("NOT_FOUND", REVIEW_NOT_FOUND_CODE, "Not found.");
  }

  // (3) STATE — moderation acts ONLY on a `submitted` review (Doc-4G §G8.2). Wrong/terminal source → STATE.
  if (!isReviewModerationLegal(current.status)) {
    return staffFail(
      "STATE",
      REVIEW_ILLEGAL_STATE_CODE,
      "moderation requires a submitted review (Doc-4G §G8.2).",
    );
  }

  // (4) BUSINESS — reject REQUIRES a non-empty `moderation_note` (Doc-4G §G8.2 §8).
  if (input.decision === "reject" && !isNonEmptyString(input.moderationNote)) {
    return staffFail(
      "BUSINESS",
      REVIEW_NOTE_REQUIRED_CODE,
      "moderation_note is required to reject a review (Doc-4G §G8.2).",
    );
  }

  const target = reviewModerationTarget(input.decision);

  // (5) WRITE — IN-BAND optimistic transition (sets moderated_by/moderated_at; guarded by updated_at + status).
  const write = await transitionReview(
    {
      id: current.id,
      expectedUpdatedAt: input.expectedRevision,
      sourceStatus: current.status,
      targetStatus: target,
      actorId: ctx.staffUserId,
      kind: "moderate",
    },
    db,
  );
  if (write.matched === 0 || write.newUpdatedAt === null) {
    return staffFail(
      "CONFLICT",
      REVIEW_REVISION_CONFLICT_CODE,
      "The review changed since it was read; re-read then retry.",
    );
  }

  // (6) AUDIT — atomic with the transition (SAME tx `db`). ENUMERATED `review_moderation_decision`, Admin.
  //     `moderation_note` (no DB column) rides `newValue`. If this throws, the tx rolls back. NO event.
  await deps.appendAuditRecord(
    {
      actorId: ctx.staffUserId,
      actorType: "admin",
      organizationId: null,
      entityType: PUBLIC_REVIEW_ENTITY_TYPE,
      entityId: current.id,
      action: ReviewAuditAction.MODERATED,
      oldValue: { status: current.status },
      newValue: {
        decision: input.decision,
        moderation_note: input.moderationNote ?? null,
        status: target,
      },
    },
    db,
  );

  return {
    ok: true,
    result: {
      publicReviewId: current.id,
      status: target,
      updatedAt: write.newUpdatedAt.toISOString(),
    },
  };
}

/**
 * `remove_review` (Doc-4G §G8.3) — hide a review (soft-delete, SD=YES), IN-BAND, appending ONE ENUMERATED
 * `review_removed` audit atomically. Removable from submitted/approved/published; rejected/removed → STATE.
 * MUST run inside a staff-scoped tx. NO event; NO Path-B; firewall.
 */
export async function removeReview(
  input: RemoveReviewInput,
  ctx: ReviewStaffContext,
  deps: SubmitReviewDeps,
  db: DbExecutor = prisma,
): Promise<RemoveReviewOutcome> {
  // (1) SYNTAX.
  if (!isUuid(input.publicReviewId)) {
    return staffFail("VALIDATION", REVIEW_INVALID_INPUT_CODE, "public_review_id must be a uuid.");
  }
  if (!isValidRevision(input.expectedRevision)) {
    return staffFail(
      "VALIDATION",
      REVIEW_INVALID_INPUT_CODE,
      "expected_revision must be a valid revision token.",
    );
  }

  // (2) REFERENCE.
  const current = await getReviewById(input.publicReviewId, db);
  if (current === null) {
    return staffFail("NOT_FOUND", REVIEW_NOT_FOUND_CODE, "Not found.");
  }

  // (3) STATE — rejected/removed are terminal (not removable) → STATE (Doc-4G §G8.3).
  if (!isReviewRemoveLegal(current.status)) {
    return staffFail(
      "STATE",
      REVIEW_ILLEGAL_STATE_CODE,
      "this review is not in a removable state (Doc-4G §G8.3).",
    );
  }

  // (4) WRITE — IN-BAND optimistic transition → removed + SD (deleted_at/by, delete_reason = removal_reason).
  const write = await transitionReview(
    {
      id: current.id,
      expectedUpdatedAt: input.expectedRevision,
      sourceStatus: current.status,
      targetStatus: "removed",
      actorId: ctx.staffUserId,
      kind: "remove",
      removalReason: input.removalReason ?? null,
    },
    db,
  );
  if (write.matched === 0 || write.newUpdatedAt === null) {
    return staffFail(
      "CONFLICT",
      REVIEW_REVISION_CONFLICT_CODE,
      "The review changed since it was read; re-read then retry.",
    );
  }

  // (5) AUDIT — atomic with the transition. ENUMERATED `review_removed`, Admin. NO event.
  await deps.appendAuditRecord(
    {
      actorId: ctx.staffUserId,
      actorType: "admin",
      organizationId: null,
      entityType: PUBLIC_REVIEW_ENTITY_TYPE,
      entityId: current.id,
      action: ReviewAuditAction.REMOVED,
      oldValue: { status: current.status },
      newValue: { status: "removed", removal_reason: input.removalReason ?? null },
    },
    db,
  );

  return {
    ok: true,
    result: {
      publicReviewId: current.id,
      status: "removed",
      updatedAt: write.newUpdatedAt.toISOString(),
    },
  };
}

/** A private sentinel that signals a Step-1 optimistic CONFLICT from inside the Step-1 transaction (so the
 *  outer publish handler distinguishes CONFLICT from an audit/infrastructure DEPENDENCY). */
class ReviewPublishConflict extends Error {}

/** Step-1 outcome: the atomic transition + audit succeeded, or it failed cleanly (CONFLICT | DEPENDENCY). */
type PublishStep1 = { ok: true } | { ok: false; outcome: { ok: false; error: ReviewStaffError } };

/**
 * `publish_review` (Doc-4G §G8.3) — THE TWO-STEP MODEL (patch F4G-PB5-MA2). Takes the BASE `client` (owns two
 * transaction boundaries), sets the staff GUC inside each. Step 1 (atomic): transition `approved → published`
 * + the ENUMERATED `review_published` audit — audit failure rolls Step 1 back → DEPENDENCY; stale token →
 * CONFLICT. Step 2 (separate): the BC-TRUST-3 ingestion service (Path B) — failure does NOT roll back Step 1
 * (the review stays `published`; `ingestionApplied:false`). FIREWALL: Step 2 goes through the ingestion
 * SERVICE only (F4G-M2), never a direct `performance_inputs` write; nothing touches score/verification/fraud/
 * tier. NO event.
 */
export async function publishReview(
  input: PublishReviewInput,
  ctx: ReviewStaffContext,
  deps: PublishReviewDeps,
  client: PrismaClient = prisma,
): Promise<PublishReviewOutcome> {
  // (1) SYNTAX.
  if (!isUuid(input.publicReviewId)) {
    return staffFail("VALIDATION", REVIEW_INVALID_INPUT_CODE, "public_review_id must be a uuid.");
  }
  if (!isValidRevision(input.expectedRevision)) {
    return staffFail(
      "VALIDATION",
      REVIEW_INVALID_INPUT_CODE,
      "expected_revision must be a valid revision token.",
    );
  }

  // (2) PRE-READ (staff-scoped tx) — the staff RLS policy admits the `approved` review; capture the Step-2
  //     fields. Absent → NOT_FOUND; non-`approved` source → STATE (a re-publish of a `published` review is
  //     STATE, NOT a silent no-op — Doc-4G §H.5/§10 patched).
  const current = await client.$transaction(async (tx) => {
    await setStaffGuc(tx);
    return getReviewById(input.publicReviewId, tx);
  });
  if (current === null) {
    return staffFail("NOT_FOUND", REVIEW_NOT_FOUND_CODE, "Not found.");
  }
  if (!isReviewPublishLegal(current.status)) {
    return staffFail(
      "STATE",
      REVIEW_ILLEGAL_STATE_CODE,
      "publish requires an approved review (Doc-4G §G8.3).",
    );
  }

  // (3) STEP 1 (atomic) — transition + audit in ONE staff tx.
  const step1 = await runPublishStep1(input, ctx, current.id, deps, client);
  if (!step1.ok) return step1.outcome; // CONFLICT or DEPENDENCY — the review is NOT published.

  // (4) STEP 2 (separate tx) — Path-B ingestion (F4G-M2). Failure does NOT roll back Step 1. DEFAULTS to the
  //     in-module `ingestPerformanceInput` (the F4G-M2 sole writer); injectable so a test supplies a failing
  //     one. `occurred_at = the review's created_at` (STABLE) → a republish dedups at BC-TRUST-3 (no dup row).
  const ingest = deps.ingestPerformanceInput ?? ingestPerformanceInputInModule;
  let ingestionApplied = true;
  try {
    const outcome = await client.$transaction(async (tx2) => {
      await setStaffGuc(tx2);
      return ingest(
        {
          vendorProfileId: current.vendorProfileId,
          sourceType: REVIEW_FEEDBACK_SOURCE_TYPE,
          sourceEntityId: current.engagementId,
          inputType: REVIEW_FEEDBACK_INPUT_TYPE,
          occurredAt: current.createdAt,
          valueJsonb: { rating: current.rating },
        },
        { appendAuditRecord: deps.appendAuditRecord },
        tx2,
      );
    });
    ingestionApplied = outcome.ok;
  } catch {
    // The ingestion service was unavailable (Step 2). Step 1 is already committed — do NOT roll back the
    // `published` review (patch F4G-PB5-MA2). The composition-edge independent retry is DEFERRED.
    ingestionApplied = false;
  }

  return {
    ok: true,
    result: { publicReviewId: current.id, status: "published", ingestionApplied },
  };
}

/** Step 1 of publish — the atomic `approved → published` transition + `review_published` audit in ONE staff
 *  tx. `matched=0` → CONFLICT (via a sentinel throw so the tx rolls back); an audit/infra throw → the whole
 *  tx rolls back → DEPENDENCY (the review is NOT published — patch F4G-PB5-MA2). */
async function runPublishStep1(
  input: PublishReviewInput,
  ctx: ReviewStaffContext,
  reviewId: string,
  deps: PublishReviewDeps,
  client: PrismaClient,
): Promise<PublishStep1> {
  try {
    await client.$transaction(async (tx) => {
      await setStaffGuc(tx);
      const write = await transitionReview(
        {
          id: reviewId,
          expectedUpdatedAt: input.expectedRevision,
          sourceStatus: "approved",
          targetStatus: "published",
          actorId: ctx.staffUserId,
          kind: "publish",
        },
        tx,
      );
      if (write.matched === 0 || write.newUpdatedAt === null) {
        throw new ReviewPublishConflict();
      }
      await deps.appendAuditRecord(
        {
          actorId: ctx.staffUserId,
          actorType: "admin",
          organizationId: null,
          entityType: PUBLIC_REVIEW_ENTITY_TYPE,
          entityId: reviewId,
          action: ReviewAuditAction.PUBLISHED,
          oldValue: { status: "approved" },
          newValue: { status: "published" },
        },
        tx,
      );
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof ReviewPublishConflict) {
      return {
        ok: false,
        outcome: staffFail(
          "CONFLICT",
          REVIEW_REVISION_CONFLICT_CODE,
          "The review changed since it was read; re-read then retry.",
        ),
      };
    }
    // An audit / infrastructure failure — Step 1 rolled back cleanly (review NOT published) → DEPENDENCY.
    return {
      ok: false,
      outcome: staffFail(
        "DEPENDENCY",
        REVIEW_DEPENDENCY_CODE,
        "The audit service was transiently unavailable; publish was not applied — retry.",
      ),
    };
  }
}
