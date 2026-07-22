import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma, type DbExecutor, type Prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { withActiveOrgContext } from "../../src/server/context";
import {
  getReview,
  ingestPerformanceInput,
  listReviews,
  moderateReview,
  publishReview,
  removeReview,
  submitReview,
  type PublishReviewIngestPerformanceInput,
  type ReviewStaffContext,
} from "@/modules/trust/contracts";
import { appendAuditRecord } from "@/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-TRUST-5a — the BC-TRUST-5 (Part A) Public Review lifecycle (Doc-4G §G8.1/§G8.2/§G8.3/§G8.5; Doc-6G
// §3.5.2) exercised DIRECTLY (the Admin HTTP wiring + the `can_submit_review`/`staff_can_verify` comp-edge
// authz + the DG-4 engagement / DG-2 vendor resolution are DEFERRED). Proves, against a REAL PostgreSQL, the
// IN-BAND AUDITED-WRITE pattern (NO SD; NO event) + the F4G-PB5-MA2 TWO-STEP publish:
//   • submit (User + active-org; `author_organization_id` = the active-org GUC, NOT input) → one
//     `review_submitted` audit; rating-range + one-review-per-engagement BUSINESS guards.
//   • moderate (approve/reject; reject-needs-note) → one `review_moderation_decision` audit; STATE/CONFLICT/
//     NOT_FOUND.
//   • publish TWO-STEP: Step 1 (state + `review_published` audit atomic) is INDEPENDENT of Step 2 (Path-B
//     BC-TRUST-3 ingestion) — a failing ingestion leaves the review `published` with zero performance_inputs;
//     the success path writes exactly ONE `feedback`/`engagement` input; a republish dedups on the stable key.
//   • remove (soft-delete, hidden) → one `review_removed` audit; STATE.
//   • reads: only `published` surface on the public (no-GUC) projection.
//   • FIREWALL: a review mutates no score/verification/fraud/tier and issues no ban; the ONLY downstream write
//     is the Path-B `performance_inputs` row VIA the ingestion service. NO event anywhere.
//
// The shared `prisma` connection is superuser (bypasses RLS) — happy paths assert row/audit content; the
// DB-level RLS public-read gate is proven through the Doc-8B §5 restricted-role backstop (`ivendorz_test_rls`,
// NOBYPASSRLS). public_reviews is DELETE-blocked (immutable trigger) + append-only, so every test uses FRESH
// FULL uuids (never sliced) — rows accumulate but never collide (the house append-only + test-DB-hygiene pattern).

const STAFF_ACTOR = "01920000-0000-7000-8000-00000000fb71"; // fixed admin staff id (Doc-2 §9 attribution)
const STAFF: ReviewStaffContext = { staffUserId: STAFF_ACTOR };
const deps = { appendAuditRecord }; // NO writeOutboxEvent — BC-TRUST-5 emits NO event (Doc-4G §H.7)

const readRow = (id: string) => prisma.publicReview.findUnique({ where: { id } });

const auditRows = (id: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "public_review", entityId: id } });

const auditByAction = (id: string, action: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "public_review", entityId: id, action } });

const outboxForAggregate = (aggregateId: string) =>
  prisma.outboxEvent.count({ where: { aggregateId } });

const feedbackInputsForEngagement = (engagementId: string) =>
  prisma.performanceInput.count({
    where: { sourceType: "engagement", sourceEntityId: engagementId, inputType: "feedback" },
  });

/** Run `fn` inside ONE tx with the platform-staff GUC set (the staff-scoped context moderate/remove require). */
async function inStaffTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    return fn(tx);
  });
}

interface Seed {
  publicReviewId: string;
  activeOrgId: string;
  userId: string;
  vendorProfileId: string;
  engagementId: string;
}

/** Submit a fresh review (User + active-org) → state `submitted`. Fresh FULL uuids per call. */
async function seedSubmitted(
  opts?: Partial<Omit<Seed, "publicReviewId">> & { rating?: number },
): Promise<Seed> {
  const activeOrgId = opts?.activeOrgId ?? uuidv7();
  const userId = opts?.userId ?? uuidv7();
  const vendorProfileId = opts?.vendorProfileId ?? uuidv7();
  const engagementId = opts?.engagementId ?? uuidv7();
  const outcome = await withActiveOrgContext(
    { userId, activeOrgId, isPlatformStaff: false },
    (tx) =>
      submitReview(
        { vendorProfileId, engagementId, rating: opts?.rating ?? 4, body: "solid delivery" },
        { userId, activeOrgId },
        deps,
        tx,
      ),
  );
  if (!outcome.ok) throw new Error(`seedSubmitted failed: ${outcome.error.errorCode}`);
  return {
    publicReviewId: outcome.result.publicReviewId,
    activeOrgId,
    userId,
    vendorProfileId,
    engagementId,
  };
}

/** Submit then approve → state `approved`, returning the moderate result's optimistic token (ISO). */
async function seedApproved(
  opts?: Partial<Omit<Seed, "publicReviewId">>,
): Promise<Seed & { updatedAt: string }> {
  const s = await seedSubmitted(opts);
  const token = (await readRow(s.publicReviewId))!.updatedAt;
  const out = await inStaffTx((tx) =>
    moderateReview(
      { publicReviewId: s.publicReviewId, expectedRevision: token, decision: "approve" },
      STAFF,
      deps,
      tx,
    ),
  );
  if (!out.ok) throw new Error(`seedApproved failed: ${out.error.errorCode}`);
  return { ...s, updatedAt: out.result.updatedAt };
}

describe("W3-TRUST-5a — public_reviews lifecycle (Doc-4G §G8.1-§G8.3/§G8.5; NO event; NO SD; two-step publish)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── submit (Doc-4G §G8.1) ─────────────────────────────────────────────────────
  describe("submit", () => {
    it("writes a `submitted` row + ONE review_submitted audit; author_organization_id === the active-org GUC (NOT input); NO event", async () => {
      const s = await seedSubmitted();

      const row = await readRow(s.publicReviewId);
      expect(row?.status).toBe("submitted");
      expect(row?.vendorProfileId).toBe(s.vendorProfileId);
      expect(row?.engagementId).toBe(s.engagementId);
      expect(row?.rating).toBe(4);
      // Invariant #5 — the author org is the SERVER-derived active org, never a caller field.
      expect(row?.authorOrganizationId).toBe(s.activeOrgId);
      expect(row?.createdBy).toBe(s.userId);

      const audit = await auditRows(s.publicReviewId);
      expect(audit).toHaveLength(1);
      expect(audit[0]!.action).toBe("review_submitted");
      expect(audit[0]!.actorType).toBe("user");
      expect(audit[0]!.actorId).toBe(s.userId);
      expect(audit[0]!.organizationId).toBe(s.activeOrgId);
      expect(audit[0]!.newValue).toMatchObject({ status: "submitted", rating: 4 });

      expect(await outboxForAggregate(s.publicReviewId)).toBe(0); // NO event (Doc-4G §H.7)
    });

    it("rating out of 1–5 → BUSINESS trust_review_rating_range (no row, no audit)", async () => {
      const activeOrgId = uuidv7();
      const userId = uuidv7();
      const vendorProfileId = uuidv7();
      const engagementId = uuidv7();
      const outcome = await withActiveOrgContext(
        { userId, activeOrgId, isPlatformStaff: false },
        (tx) =>
          submitReview(
            { vendorProfileId, engagementId, rating: 6 },
            { userId, activeOrgId },
            deps,
            tx,
          ),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("BUSINESS");
      expect(outcome.error.errorCode).toBe("trust_review_rating_range");
      expect(await prisma.publicReview.count({ where: { engagementId } })).toBe(0);
    });

    it("a second review for the same (engagement, author) → BUSINESS trust_review_duplicate (no 2nd row, no 2nd audit)", async () => {
      const s = await seedSubmitted();
      // same author org + same engagement, different vendor id → the UNIQUE(engagement, author) still fires.
      const dup = await withActiveOrgContext(
        { userId: s.userId, activeOrgId: s.activeOrgId, isPlatformStaff: false },
        (tx) =>
          submitReview(
            { vendorProfileId: uuidv7(), engagementId: s.engagementId, rating: 5 },
            { userId: s.userId, activeOrgId: s.activeOrgId },
            deps,
            tx,
          ),
      );
      expect(dup.ok).toBe(false);
      if (dup.ok) throw new Error("unreachable");
      expect(dup.error.errorClass).toBe("BUSINESS");
      expect(dup.error.errorCode).toBe("trust_review_duplicate");

      expect(
        await prisma.publicReview.count({
          where: { engagementId: s.engagementId, authorOrganizationId: s.activeOrgId },
        }),
      ).toBe(1);
      // only the FIRST review's submit audit exists.
      expect(await auditByAction(s.publicReviewId, "review_submitted")).toHaveLength(1);
    });

    it("SYNTAX: non-uuid engagement_id → VALIDATION trust_review_invalid_input", async () => {
      const activeOrgId = uuidv7();
      const userId = uuidv7();
      const outcome = await withActiveOrgContext(
        { userId, activeOrgId, isPlatformStaff: false },
        (tx) =>
          submitReview(
            { vendorProfileId: uuidv7(), engagementId: "not-a-uuid", rating: 4 },
            { userId, activeOrgId },
            deps,
            tx,
          ),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("VALIDATION");
      expect(outcome.error.errorCode).toBe("trust_review_invalid_input");
    });
  });

  // ── moderate (Doc-4G §G8.2) ───────────────────────────────────────────────────
  describe("moderate", () => {
    it("submitted → approved (+ ONE review_moderation_decision audit; NO event)", async () => {
      const s = await seedSubmitted();
      const token = (await readRow(s.publicReviewId))!.updatedAt;
      const out = await inStaffTx((tx) =>
        moderateReview(
          { publicReviewId: s.publicReviewId, expectedRevision: token, decision: "approve" },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(true);
      if (!out.ok) throw new Error("unreachable");
      expect(out.result.status).toBe("approved");
      expect((await readRow(s.publicReviewId))?.status).toBe("approved");
      expect((await readRow(s.publicReviewId))?.moderatedBy).toBe(STAFF_ACTOR);

      const audit = await auditByAction(s.publicReviewId, "review_moderation_decision");
      expect(audit).toHaveLength(1);
      expect(audit[0]!.actorType).toBe("admin");
      expect(audit[0]!.newValue).toMatchObject({ decision: "approve", status: "approved" });
      expect(await outboxForAggregate(s.publicReviewId)).toBe(0);
    });

    it("submitted → rejected with a moderation_note (note rides the audit newValue)", async () => {
      const s = await seedSubmitted();
      const token = (await readRow(s.publicReviewId))!.updatedAt;
      const out = await inStaffTx((tx) =>
        moderateReview(
          {
            publicReviewId: s.publicReviewId,
            expectedRevision: token,
            decision: "reject",
            moderationNote: "off-topic content",
          },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(true);
      if (!out.ok) throw new Error("unreachable");
      expect(out.result.status).toBe("rejected");
      const audit = await auditByAction(s.publicReviewId, "review_moderation_decision");
      expect(audit[0]!.newValue).toMatchObject({
        decision: "reject",
        moderation_note: "off-topic content",
        status: "rejected",
      });
    });

    it("reject WITHOUT a note → BUSINESS trust_review_note_required (no change, no audit)", async () => {
      const s = await seedSubmitted();
      const token = (await readRow(s.publicReviewId))!.updatedAt;
      const out = await inStaffTx((tx) =>
        moderateReview(
          { publicReviewId: s.publicReviewId, expectedRevision: token, decision: "reject" },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(false);
      if (out.ok) throw new Error("unreachable");
      expect(out.error.errorClass).toBe("BUSINESS");
      expect(out.error.errorCode).toBe("trust_review_note_required");
      expect((await readRow(s.publicReviewId))?.status).toBe("submitted");
      expect(await auditByAction(s.publicReviewId, "review_moderation_decision")).toHaveLength(0);
    });

    it("moderate a non-`submitted` review → STATE", async () => {
      const s = await seedApproved(); // now `approved`
      const token = (await readRow(s.publicReviewId))!.updatedAt;
      const out = await inStaffTx((tx) =>
        moderateReview(
          { publicReviewId: s.publicReviewId, expectedRevision: token, decision: "approve" },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(false);
      if (out.ok) throw new Error("unreachable");
      expect(out.error.errorClass).toBe("STATE");
      expect(out.error.errorCode).toBe("trust_review_state");
    });

    it("stale expected_revision → CONFLICT; unknown id → NOT_FOUND", async () => {
      const s = await seedSubmitted();
      const conflict = await inStaffTx((tx) =>
        moderateReview(
          { publicReviewId: s.publicReviewId, expectedRevision: new Date(0), decision: "approve" },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(conflict.ok).toBe(false);
      if (conflict.ok) throw new Error("unreachable");
      expect(conflict.error.errorClass).toBe("CONFLICT");
      expect((await readRow(s.publicReviewId))?.status).toBe("submitted");

      const notFound = await inStaffTx((tx) =>
        moderateReview(
          { publicReviewId: uuidv7(), expectedRevision: new Date(), decision: "approve" },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(notFound.ok).toBe(false);
      if (notFound.ok) throw new Error("unreachable");
      expect(notFound.error.errorClass).toBe("NOT_FOUND");
    });
  });

  // ── publish — TWO-STEP (Doc-4G §G8.3; patch F4G-PB5-MA2) ──────────────────────
  describe("publish (two-step)", () => {
    it("approved → published (+ ONE review_published audit) AND exactly ONE Path-B feedback input; republish dedups", async () => {
      const s = await seedApproved();
      const out = await publishReview(
        { publicReviewId: s.publicReviewId, expectedRevision: new Date(s.updatedAt) },
        STAFF,
        deps, // ingestPerformanceInput OMITTED → defaults to the in-module F4G-M2 sole writer
        prisma,
      );
      expect(out.ok).toBe(true);
      if (!out.ok) throw new Error("unreachable");
      expect(out.result.status).toBe("published");
      expect(out.result.ingestionApplied).toBe(true);
      expect((await readRow(s.publicReviewId))?.status).toBe("published");
      expect(await auditByAction(s.publicReviewId, "review_published")).toHaveLength(1);

      // Path B (F4G-M2/M3): exactly ONE feedback input, anchored on the engagement.
      expect(await feedbackInputsForEngagement(s.engagementId)).toBe(1);

      // republish dedup — a Step-2 re-invocation on the SAME stable key writes NO duplicate input.
      const replay = await inStaffTx((tx) =>
        ingestPerformanceInput(
          {
            vendorProfileId: s.vendorProfileId,
            sourceType: "engagement",
            sourceEntityId: s.engagementId,
            inputType: "feedback",
            occurredAt: new Date(),
            valueJsonb: { rating: 4 },
          },
          { appendAuditRecord },
          tx,
        ),
      );
      expect(replay.ok).toBe(true);
      if (!replay.ok) throw new Error("unreachable");
      expect(replay.result.created).toBe(false); // dedup — no 2nd row
      expect(await feedbackInputsForEngagement(s.engagementId)).toBe(1);

      expect(await outboxForAggregate(s.publicReviewId)).toBe(0); // NO event
    });

    it("a FAILING ingestion (Step 2 throws) leaves the review STILL `published` (Step 1 committed), ZERO feedback inputs, ingestionApplied=false", async () => {
      const s = await seedApproved();
      const failingIngest = (() =>
        Promise.reject(
          new Error("ingestion service unavailable"),
        )) as PublishReviewIngestPerformanceInput;

      const out = await publishReview(
        { publicReviewId: s.publicReviewId, expectedRevision: new Date(s.updatedAt) },
        STAFF,
        { appendAuditRecord, ingestPerformanceInput: failingIngest },
        prisma,
      );
      expect(out.ok).toBe(true);
      if (!out.ok) throw new Error("unreachable");
      expect(out.result.status).toBe("published");
      expect(out.result.ingestionApplied).toBe(false); // Step 2 failed
      // Step 1 committed independently — the review IS published and the audit exists.
      expect((await readRow(s.publicReviewId))?.status).toBe("published");
      expect(await auditByAction(s.publicReviewId, "review_published")).toHaveLength(1);
      // Step 2 rolled back cleanly — NO feedback input for the engagement.
      expect(await feedbackInputsForEngagement(s.engagementId)).toBe(0);
    });

    it("publish a non-`approved` review → STATE (no publish audit, no input)", async () => {
      const s = await seedSubmitted(); // still `submitted`
      const token = (await readRow(s.publicReviewId))!.updatedAt;
      const out = await publishReview(
        { publicReviewId: s.publicReviewId, expectedRevision: token },
        STAFF,
        deps,
        prisma,
      );
      expect(out.ok).toBe(false);
      if (out.ok) throw new Error("unreachable");
      expect(out.error.errorClass).toBe("STATE");
      expect((await readRow(s.publicReviewId))?.status).toBe("submitted");
      expect(await auditByAction(s.publicReviewId, "review_published")).toHaveLength(0);
      expect(await feedbackInputsForEngagement(s.engagementId)).toBe(0);
    });

    it("stale expected_revision → CONFLICT (review NOT published)", async () => {
      const s = await seedApproved();
      const out = await publishReview(
        { publicReviewId: s.publicReviewId, expectedRevision: new Date(0) },
        STAFF,
        deps,
        prisma,
      );
      expect(out.ok).toBe(false);
      if (out.ok) throw new Error("unreachable");
      expect(out.error.errorClass).toBe("CONFLICT");
      expect((await readRow(s.publicReviewId))?.status).toBe("approved");
    });

    it("Step-1 audit failure → DEPENDENCY: the review is NOT published (transition rolled back) AND Step 2 never runs", async () => {
      // The other half of the F4G-PB5-MA2 symmetry: Step 1 (transition + audit) is atomic — an audit failure
      // rolls the WHOLE Step-1 tx back → DEPENDENCY (review stays `approved`); Step 2 (ingestion) NEVER runs
      // because Step 1 did not commit.
      const s = await seedApproved();
      const failingAudit = (() =>
        Promise.reject(new Error("audit service unavailable"))) as typeof appendAuditRecord;
      let ingestCalled = false;
      const ingestSpy = (async (...args: Parameters<PublishReviewIngestPerformanceInput>) => {
        ingestCalled = true;
        return ingestPerformanceInput(...args);
      }) as PublishReviewIngestPerformanceInput;

      const out = await publishReview(
        { publicReviewId: s.publicReviewId, expectedRevision: new Date(s.updatedAt) },
        STAFF,
        { appendAuditRecord: failingAudit, ingestPerformanceInput: ingestSpy },
        prisma,
      );
      expect(out.ok).toBe(false);
      if (out.ok) throw new Error("unreachable");
      expect(out.error.errorClass).toBe("DEPENDENCY");

      // Step 1 rolled back cleanly — the review is STILL `approved`, with NO publish audit.
      expect((await readRow(s.publicReviewId))?.status).toBe("approved");
      expect(await auditByAction(s.publicReviewId, "review_published")).toHaveLength(0);
      // Step 2 never ran (Step 1 failed) — no ingestion call, no feedback input.
      expect(ingestCalled).toBe(false);
      expect(await feedbackInputsForEngagement(s.engagementId)).toBe(0);
    });
  });

  // ── remove (Doc-4G §G8.3) ─────────────────────────────────────────────────────
  describe("remove", () => {
    it("approved → removed (SD set; ONE review_removed audit); invisible to the public read", async () => {
      const s = await seedApproved();
      const token = (await readRow(s.publicReviewId))!.updatedAt;
      const out = await inStaffTx((tx) =>
        removeReview(
          {
            publicReviewId: s.publicReviewId,
            expectedRevision: token,
            removalReason: "policy violation",
          },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(true);
      if (!out.ok) throw new Error("unreachable");
      expect(out.result.status).toBe("removed");
      const row = await readRow(s.publicReviewId);
      expect(row?.status).toBe("removed");
      expect(row?.deletedAt).not.toBeNull();
      expect(row?.deletedBy).toBe(STAFF_ACTOR);
      expect(row?.deleteReason).toBe("policy violation");
      expect(await auditByAction(s.publicReviewId, "review_removed")).toHaveLength(1);

      // invisible to the public read (removed is hidden even if it were published).
      const got = await getReview({ publicReviewId: s.publicReviewId }, prisma);
      expect(got.ok).toBe(false);
    });

    it("remove a `rejected` (terminal) review → STATE", async () => {
      const s = await seedSubmitted();
      const token = (await readRow(s.publicReviewId))!.updatedAt;
      await inStaffTx((tx) =>
        moderateReview(
          {
            publicReviewId: s.publicReviewId,
            expectedRevision: token,
            decision: "reject",
            moderationNote: "spam",
          },
          STAFF,
          deps,
          tx,
        ),
      );
      const token2 = (await readRow(s.publicReviewId))!.updatedAt;
      const out = await inStaffTx((tx) =>
        removeReview(
          { publicReviewId: s.publicReviewId, expectedRevision: token2 },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(false);
      if (out.ok) throw new Error("unreachable");
      expect(out.error.errorClass).toBe("STATE");
    });

    it("published → removed (the primary takedown): hidden + audited; the already-ingested Path-B input PERSISTS", async () => {
      // Publish first (real deps) so a Path-B feedback input exists, then remove the PUBLISHED review —
      // exercising the `{submitted, approved, published}` removable-source set (published is removable).
      const s = await seedApproved();
      const published = await publishReview(
        { publicReviewId: s.publicReviewId, expectedRevision: new Date(s.updatedAt) },
        STAFF,
        deps,
        prisma,
      );
      expect(published.ok).toBe(true);
      if (!published.ok) throw new Error("unreachable");
      expect(published.result.status).toBe("published");
      expect(published.result.ingestionApplied).toBe(true);
      expect(await feedbackInputsForEngagement(s.engagementId)).toBe(1);

      // Remove the published review (fresh token — publish advanced updated_at).
      const token = (await readRow(s.publicReviewId))!.updatedAt;
      const out = await inStaffTx((tx) =>
        removeReview(
          {
            publicReviewId: s.publicReviewId,
            expectedRevision: token,
            removalReason: "verified fraud",
          },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(true);
      if (!out.ok) throw new Error("unreachable");
      expect(out.result.status).toBe("removed");

      const row = await readRow(s.publicReviewId);
      expect(row?.status).toBe("removed");
      expect(row?.deletedAt).not.toBeNull();
      expect(row?.deletedBy).toBe(STAFF_ACTOR);
      expect(row?.deleteReason).toBe("verified fraud");
      expect(await auditByAction(s.publicReviewId, "review_removed")).toHaveLength(1);

      // Now invisible to the public projection (removed is hidden; the get filters status !== published).
      const got = await getReview({ publicReviewId: s.publicReviewId }, prisma);
      expect(got.ok).toBe(false);

      // DELIBERATE (coin-nothing): removal does NOT retract the already-ingested Path-B performance input —
      // performance_inputs is append-only and the corpus specifies no retraction. Whether a removed review's
      // Buyer-Feedback should be retracted is a Board question (M5-exit-gate OBS), NOT built here.
      expect(await feedbackInputsForEngagement(s.engagementId)).toBe(1);
    });
  });

  // ── reads / public projection (Doc-4G §G8.5) ──────────────────────────────────
  describe("reads: public projection (published only)", () => {
    beforeAll(async () => {
      await ensureRestrictedRlsRole();
      await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA trust TO ${RESTRICTED_RLS_ROLE}`);
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT, UPDATE ON trust.public_reviews TO ${RESTRICTED_RLS_ROLE}`,
      );
    });

    it("get_review: a `published` review surfaces; a `submitted`/`approved` review → NOT_FOUND (public no-GUC tx)", async () => {
      // published review
      const pub = await seedApproved();
      const p = await publishReview(
        { publicReviewId: pub.publicReviewId, expectedRevision: new Date(pub.updatedAt) },
        STAFF,
        deps,
        prisma,
      );
      expect(p.ok).toBe(true);

      const submitted = await seedSubmitted();
      const approved = await seedApproved();

      // Under a PUBLIC (no-GUC) restricted-role tx the public-read RLS admits ONLY published.
      const gotPublished = await asRestrictedRole({}, (tx) =>
        getReview({ publicReviewId: pub.publicReviewId }, tx as unknown as DbExecutor),
      );
      expect(gotPublished.ok).toBe(true);
      if (!gotPublished.ok) throw new Error("unreachable");
      expect(gotPublished.result.status).toBe("published");
      expect(gotPublished.result.vendorProfileId).toBe(pub.vendorProfileId);
      expect(gotPublished.result.rating).toBe(4);

      const gotSubmitted = await asRestrictedRole({}, (tx) =>
        getReview({ publicReviewId: submitted.publicReviewId }, tx as unknown as DbExecutor),
      );
      expect(gotSubmitted.ok).toBe(false);
      if (gotSubmitted.ok) throw new Error("unreachable");
      expect(gotSubmitted.error.errorClass).toBe("NOT_FOUND");

      const gotApproved = await asRestrictedRole({}, (tx) =>
        getReview({ publicReviewId: approved.publicReviewId }, tx as unknown as DbExecutor),
      );
      expect(gotApproved.ok).toBe(false);
    });

    it("list_reviews: returns ONLY the vendor's published reviews (non-published excluded)", async () => {
      const vendorProfileId = uuidv7();
      // two published reviews (distinct engagements/authors) for one vendor + one submitted (excluded).
      const a = await seedApproved({ vendorProfileId });
      await publishReview(
        { publicReviewId: a.publicReviewId, expectedRevision: new Date(a.updatedAt) },
        STAFF,
        deps,
        prisma,
      );
      const b = await seedApproved({ vendorProfileId });
      await publishReview(
        { publicReviewId: b.publicReviewId, expectedRevision: new Date(b.updatedAt) },
        STAFF,
        deps,
        prisma,
      );
      const submitted = await seedSubmitted({ vendorProfileId });

      const listed = await asRestrictedRole({}, (tx) =>
        listReviews({ vendorProfileId }, tx as unknown as DbExecutor),
      );
      expect(listed.ok).toBe(true);
      if (!listed.ok) throw new Error("unreachable");
      const ids = listed.result.reviews.map((r) => r.publicReviewId).sort();
      expect(ids).toEqual([a.publicReviewId, b.publicReviewId].sort());
      expect(ids).not.toContain(submitted.publicReviewId);
      expect(listed.result.reviews.every((r) => r.status === "published")).toBe(true);
    });
  });

  // ── FIREWALL (Doc-4G §H.9; Invariant #6) ──────────────────────────────────────
  describe("firewall: only Path-B performance_inputs; no score/verification/fraud/tier; no ban; no event", () => {
    it("after a full submit→approve→publish, only the Path-B feedback input is written; NO score/verification/fraud/tier; NO event", async () => {
      const s = await seedApproved();
      const out = await publishReview(
        { publicReviewId: s.publicReviewId, expectedRevision: new Date(s.updatedAt) },
        STAFF,
        deps,
        prisma,
      );
      expect(out.ok).toBe(true);

      // ONLY the Path-B performance_inputs row — nothing in the governance-signal tables.
      expect(await feedbackInputsForEngagement(s.engagementId)).toBe(1);
      expect(await prisma.trustScore.count({ where: { vendorProfileId: s.vendorProfileId } })).toBe(
        0,
      );
      expect(
        await prisma.performanceScore.count({ where: { vendorProfileId: s.vendorProfileId } }),
      ).toBe(0);
      expect(
        await prisma.verificationRecord.count({ where: { subjectId: s.vendorProfileId } }),
      ).toBe(0);
      expect(
        await prisma.verifiedFinancialTier.count({ where: { vendorProfileId: s.vendorProfileId } }),
      ).toBe(0);
      expect(await prisma.fraudSignal.count({ where: { subjectId: s.vendorProfileId } })).toBe(0);

      // NO event anywhere in the whole publish flow (incl. Path-B ingestion) — Doc-4G §H.7. Checked on the
      // review aggregate AND its refs (a coined review event would carry one of these as `aggregate_id`).
      // NOTE: the sweep targets the `PublicReview` AGGREGATE name precisely — NOT a loose "Review" substring,
      // which would falsely match the legitimate BC-TRUST-3 `PerformanceReviewTriggered` event.
      expect(await outboxForAggregate(s.publicReviewId)).toBe(0);
      expect(await outboxForAggregate(s.vendorProfileId)).toBe(0);
      expect(await outboxForAggregate(s.engagementId)).toBe(0);
      expect(
        await prisma.outboxEvent.count({ where: { eventName: { contains: "PublicReview" } } }),
      ).toBe(0);
    });
  });

  // ── substrate: immutability / RLS / enums ─────────────────────────────────────
  describe("substrate: immutability / RLS / enums", () => {
    beforeAll(async () => {
      await ensureRestrictedRlsRole();
      await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA trust TO ${RESTRICTED_RLS_ROLE}`);
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT, UPDATE ON trust.public_reviews TO ${RESTRICTED_RLS_ROLE}`,
      );
    });

    it("immutability: status is mutable; authored/identity facts frozen; DELETE blocked", async () => {
      const s = await seedSubmitted();
      const id = s.publicReviewId;

      // mutable state (superuser direct UPDATE — RLS bypassed; the trigger still fires but permits it).
      await prisma.$executeRawUnsafe(
        `UPDATE trust.public_reviews SET status = 'approved' WHERE id = $1::uuid`,
        id,
      );
      expect((await readRow(id))?.status).toBe("approved");

      // frozen authored/identity facts (cast per column type so the immutability TRIGGER — not a bind
      // type-mismatch — is what rejects each UPDATE).
      for (const [col, cast, val] of [
        ["vendor_profile_id", "::uuid", uuidv7()],
        ["author_organization_id", "::uuid", uuidv7()],
        ["engagement_id", "::uuid", uuidv7()],
        ["rating", "::smallint", 3],
        ["body", "::text", "edited words"],
        ["created_by", "::uuid", uuidv7()],
      ] as const) {
        await expect(
          prisma.$executeRawUnsafe(
            `UPDATE trust.public_reviews SET ${col} = $2${cast} WHERE id = $1::uuid`,
            id,
            val,
          ),
        ).rejects.toThrow(/is immutable/i);
      }

      // DELETE blocked (removal is soft; append-only).
      await expect(
        prisma.$executeRawUnsafe(`DELETE FROM trust.public_reviews WHERE id = $1::uuid`, id),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
      expect(await readRow(id)).not.toBeNull();
    });

    it("RLS: public sees only `published`; a non-staff INSERT with a mismatched active_org is denied; the author's active_org admits it", async () => {
      // seed one published + one submitted, both freshly.
      const pub = await seedApproved();
      await publishReview(
        { publicReviewId: pub.publicReviewId, expectedRevision: new Date(pub.updatedAt) },
        STAFF,
        deps,
        prisma,
      );
      const sub = await seedSubmitted();

      // public (no-GUC) restricted role: the published row is visible, the submitted row is NOT.
      const visiblePublished = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM trust.public_reviews WHERE id = $1::uuid`,
          pub.publicReviewId,
        ),
      );
      expect(visiblePublished).toHaveLength(1);
      const hiddenSubmitted = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM trust.public_reviews WHERE id = $1::uuid`,
          sub.publicReviewId,
        ),
      );
      expect(hiddenSubmitted).toHaveLength(0);

      // author write: an INSERT under a MISMATCHED active_org is denied (WITH CHECK author = active_org).
      const authorOrg = uuidv7();
      await expect(
        asRestrictedRole({ activeOrg: uuidv7() }, (tx) =>
          tx.$executeRawUnsafe(
            `INSERT INTO trust.public_reviews (id, vendor_profile_id, author_organization_id, engagement_id, rating)
             VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 4)`,
            uuidv7(),
            uuidv7(),
            authorOrg,
            uuidv7(),
          ),
        ),
      ).rejects.toThrow(/row-level security/i);

      // author write: an INSERT whose author_organization_id === the active_org GUC is admitted.
      await asRestrictedRole({ activeOrg: authorOrg }, (tx) =>
        tx.$executeRawUnsafe(
          `INSERT INTO trust.public_reviews (id, vendor_profile_id, author_organization_id, engagement_id, rating)
           VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 4)`,
          uuidv7(),
          uuidv7(),
          authorOrg,
          uuidv7(),
        ),
      );
    });

    it("RLS is ENABLED; the three policies exist (public read + author + staff)", async () => {
      const enabled = await prisma.$queryRawUnsafe<Array<{ e: boolean }>>(
        `SELECT relrowsecurity AS e FROM pg_class WHERE oid = 'trust.public_reviews'::regclass`,
      );
      expect(enabled[0]!.e).toBe(true);
      const policies = await prisma.$queryRawUnsafe<Array<{ policyname: string }>>(
        `SELECT policyname FROM pg_policies WHERE schemaname = 'trust' AND tablename = 'public_reviews' ORDER BY policyname`,
      );
      expect(policies.map((p) => p.policyname)).toEqual([
        "public_reviews_author",
        "public_reviews_public_read",
        "public_reviews_staff",
      ]);
    });

    it("enum labels are VERBATIM (Doc-6G §3.5.2)", async () => {
      const rows = await prisma.$queryRawUnsafe<Array<{ labels: string[] }>>(
        `SELECT enum_range(NULL::"trust"."public_review_status")::text[] AS labels`,
      );
      expect(rows[0]!.labels).toEqual([
        "submitted",
        "approved",
        "published",
        "rejected",
        "removed",
      ]);
    });
  });
});
