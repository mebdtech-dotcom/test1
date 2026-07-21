import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma, type Prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import {
  computePerformanceScore,
  ingestPerformanceInput,
  triggerPerformanceReview,
} from "@/modules/trust/contracts";
import { appendAuditRecord, writeOutboxEvent } from "@/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-TRUST-4a — the BC-TRUST-3 Performance-Score compute machinery (Doc-4G §G6.1/§G6.2/§G6.4; Doc-6G §3.3),
// exercised DIRECTLY (the live production triggers + reads + freeze/reactivate are DEFERRED). Proves, against a
// REAL PostgreSQL, PIPELINE behavior (NOT specific score values — the formula is an [ESC-TRUST-POLICY] interim
// plug): the FROZEN Not-Rated NULL gate (never 0), publish-on-change, the WRITE-PLUS-EMIT-PLUS-AUDIT ATOMICITY
// (Doc-8F — emit-fail AND audit-fail each roll back the whole tx), ingestion idempotency/append-only, the
// firewall (components carry performance inputs only), frozen-state publication suppression, trigger_review,
// and the RLS admin-read + no-in-band-write + immutability + dedup substrate.
//
// The shared `prisma` connection is superuser (bypasses RLS) — happy paths assert row/event/audit content; the
// DB-level RLS/SD gates run through the Doc-8B §5 restricted-role backstop (`ivendorz_test_rls`, NOBYPASSRLS).
// Every test uses FRESH `uuidv7()` vendor + source ids — the append-only tables accumulate but never collide.

const deps = { appendAuditRecord, writeOutboxEvent };
const ingestDeps = { appendAuditRecord };

/** Run `fn` inside ONE tx with the platform-staff GUC set (the System actor context the SD reads + outbox
 *  INSERT + audit append require). The service does read + SD write + emit + audit on this single tx. */
async function inStaffTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    return fn(tx);
  });
}

const headRow = (vendorProfileId: string) =>
  prisma.performanceScore.findUnique({ where: { vendorProfileId } });

const historyRows = (vendorProfileId: string) =>
  prisma.performanceScoreHistory.findMany({ where: { vendorProfileId } });

const inputRows = (vendorProfileId: string) =>
  prisma.performanceInput.findMany({ where: { vendorProfileId } });

const updatedEvents = (aggregateId: string) =>
  prisma.outboxEvent.findMany({ where: { aggregateId, eventName: "PerformanceScoreUpdated" } });

const reviewEvents = (aggregateId: string) =>
  prisma.outboxEvent.findMany({ where: { aggregateId, eventName: "PerformanceReviewTriggered" } });

const allEvents = (aggregateId: string) => prisma.outboxEvent.findMany({ where: { aggregateId } });

const scoreAudit = (entityId: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "performance_score", entityId } });

const scoreAuditByAction = (entityId: string, action: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "performance_score", entityId, action } });

const inputAudit = (entityId: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "performance_input", entityId } });

/** Ingest `count` distinct `response`/`invitation` inputs (each a fresh source_entity_id → no dedup). */
async function ingestResponses(vendorProfileId: string, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    const outcome = await inStaffTx((tx) =>
      ingestPerformanceInput(
        {
          vendorProfileId,
          sourceType: "invitation",
          sourceEntityId: uuidv7(),
          inputType: "response",
          occurredAt: new Date(),
        },
        ingestDeps,
        tx,
      ),
    );
    if (!outcome.ok) throw new Error(`ingestResponses failed: ${outcome.error.errorCode}`);
  }
}

/** Ingest `count` distinct `completion`/`wcc` inputs (the FROZEN "2 completed projects" gate leg; Doc-3 §5 line 250). */
async function ingestCompletions(vendorProfileId: string, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    const outcome = await inStaffTx((tx) =>
      ingestPerformanceInput(
        {
          vendorProfileId,
          sourceType: "wcc",
          sourceEntityId: uuidv7(),
          inputType: "completion",
          occurredAt: new Date(),
        },
        ingestDeps,
        tx,
      ),
    );
    if (!outcome.ok) throw new Error(`ingestCompletions failed: ${outcome.error.errorCode}`);
  }
}

/** Ingest `count` distinct `decline`/`invitation` inputs — a formal decline is a "response" (Doc-2 §10.6 A-10). */
async function ingestDeclines(vendorProfileId: string, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    const outcome = await inStaffTx((tx) =>
      ingestPerformanceInput(
        {
          vendorProfileId,
          sourceType: "invitation",
          sourceEntityId: uuidv7(),
          inputType: "decline",
          occurredAt: new Date(),
        },
        ingestDeps,
        tx,
      ),
    );
    if (!outcome.ok) throw new Error(`ingestDeclines failed: ${outcome.error.errorCode}`);
  }
}

/** Ingest `count` distinct `non_response`/`invitation` inputs — an ABSENCE; NEVER a "response" (Doc-2 §10.6 A-10). */
async function ingestNonResponses(vendorProfileId: string, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    const outcome = await inStaffTx((tx) =>
      ingestPerformanceInput(
        {
          vendorProfileId,
          sourceType: "invitation",
          sourceEntityId: uuidv7(),
          inputType: "non_response",
          occurredAt: new Date(),
        },
        ingestDeps,
        tx,
      ),
    );
    if (!outcome.ok) throw new Error(`ingestNonResponses failed: ${outcome.error.errorCode}`);
  }
}

const compute = (vendorProfileId: string) =>
  inStaffTx((tx) =>
    computePerformanceScore({ vendorProfileId, trigger: "input_change" }, deps, tx),
  );

describe("W3-TRUST-4a — BC-TRUST-3 Performance Scoring (Doc-4G §G6; Doc-6G §3.3)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── ingest_performance_input (Doc-4G §G6.1) ──────────────────────────────────
  describe("ingest_performance_input", () => {
    it("HAPPY: appends ONE input + ONE performance_input_ingested audit (System); emits NO event", async () => {
      const vendorProfileId = uuidv7();
      const sourceEntityId = uuidv7();
      const outcome = await inStaffTx((tx) =>
        ingestPerformanceInput(
          {
            vendorProfileId,
            sourceType: "invitation",
            sourceEntityId,
            inputType: "response",
            occurredAt: new Date(),
            valueJsonb: { note: "test" },
          },
          ingestDeps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.created).toBe(true);

      const rows = await inputRows(vendorProfileId);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.inputType).toBe("response");
      expect(rows[0]!.sourceType).toBe("invitation");
      expect(rows[0]!.createdBy).toBeNull(); // System attribution

      // NO event (ingestion appends inputs; computation publishes — Doc-4G §G6.1 §8)
      expect(await allEvents(vendorProfileId)).toHaveLength(0);

      const audit = await inputAudit(outcome.result.performanceInputId);
      expect(audit).toHaveLength(1);
      expect(audit[0]!.action).toBe("performance_input_ingested");
      expect(audit[0]!.actorType).toBe("system");
      expect(audit[0]!.actorId).toBeNull();
      expect(audit[0]!.organizationId).toBeNull();
    });

    it("IDEMPOTENT: re-ingesting the same (source_type, source_entity_id, input_type) is a no-op (created:false, no second row/audit)", async () => {
      const vendorProfileId = uuidv7();
      const sourceEntityId = uuidv7();
      const args = {
        vendorProfileId,
        sourceType: "invitation" as const,
        sourceEntityId,
        inputType: "response" as const,
        occurredAt: new Date(),
      };
      const first = await inStaffTx((tx) => ingestPerformanceInput(args, ingestDeps, tx));
      expect(first.ok && first.result.created).toBe(true);
      if (!first.ok) throw new Error("unreachable");

      const second = await inStaffTx((tx) => ingestPerformanceInput(args, ingestDeps, tx));
      expect(second.ok).toBe(true);
      if (!second.ok) throw new Error("unreachable");
      expect(second.result.created).toBe(false); // dedup hit
      expect(second.result.performanceInputId).toBe(first.result.performanceInputId); // same row

      expect(await inputRows(vendorProfileId)).toHaveLength(1); // no duplicate row
      expect(await inputAudit(first.result.performanceInputId)).toHaveLength(1); // no second audit
    });

    it("SEMANTIC: a `response` on a non-invitation source → BUSINESS (no row/audit)", async () => {
      const vendorProfileId = uuidv7();
      const outcome = await inStaffTx((tx) =>
        ingestPerformanceInput(
          {
            vendorProfileId,
            sourceType: "engagement",
            sourceEntityId: uuidv7(),
            inputType: "response",
            occurredAt: new Date(),
          },
          ingestDeps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("BUSINESS");
      expect(outcome.error.errorCode).toBe("trust_performance_input_inconsistent");
      expect(await inputRows(vendorProfileId)).toHaveLength(0);
    });

    it("SYNTAX: a bad uuid / bad enum → VALIDATION (no row)", async () => {
      const bad = await inStaffTx((tx) =>
        ingestPerformanceInput(
          {
            vendorProfileId: "not-a-uuid",
            sourceType: "invitation",
            sourceEntityId: uuidv7(),
            inputType: "response",
            occurredAt: new Date(),
          },
          ingestDeps,
          tx,
        ),
      );
      expect(bad.ok).toBe(false);
      if (bad.ok) throw new Error("unreachable");
      expect(bad.error.errorClass).toBe("VALIDATION");
      expect(bad.error.errorCode).toBe("trust_performance_invalid_input");
    });

    it("ATOMICITY: an audit failure rolls back the input append (no row, no audit)", async () => {
      const vendorProfileId = uuidv7();
      const failingAudit = (() =>
        Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;

      await expect(
        inStaffTx((tx) =>
          ingestPerformanceInput(
            {
              vendorProfileId,
              sourceType: "invitation",
              sourceEntityId: uuidv7(),
              inputType: "response",
              occurredAt: new Date(),
            },
            { appendAuditRecord: failingAudit },
            tx,
          ),
        ),
      ).rejects.toThrow(/audit append failed/);

      expect(await inputRows(vendorProfileId)).toHaveLength(0); // SD append rolled back
    });
  });

  // ── compute_performance_score (Doc-4G §G6.2) ─────────────────────────────────
  describe("compute_performance_score", () => {
    it("NOT-RATED gate: below 5 responses / 2 projects → score NULL (Not Rated), NEVER 0", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 3); // below the 5-response gate; 0 projects
      const outcome = await compute(vendorProfileId);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.score).toBeNull(); // NULL — Not Rated
      expect(outcome.result.score).not.toBe(0); // NEVER 0 (absence ≠ 0)
      expect(outcome.result.rated).toBe(false);
      expect(outcome.result.minThresholdMet).toBe(false);

      const head = await headRow(vendorProfileId);
      expect(head?.score).toBeNull();
      expect(head?.minThresholdMet).toBe(false);
      expect(head?.performanceFormulaVersion).toBe("esc-interim-0"); // the documented interim stamp
    });

    it("ABSENCE gate: computing a vendor with ZERO inputs → NULL Not Rated (absence is never 0)", async () => {
      const vendorProfileId = uuidv7();
      const outcome = await compute(vendorProfileId);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.score).toBeNull();
      expect(outcome.result.rated).toBe(false);
      expect((await headRow(vendorProfileId))?.score).toBeNull();
    });

    it("RATED (5 responses): a rated head + ONE history snapshot + ONE PerformanceScoreUpdated + ONE recalculation audit (atomic)", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 5); // meets the 5-response gate
      const outcome = await compute(vendorProfileId);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      const scoreId = outcome.result.performanceScoreId;
      expect(outcome.result.score).not.toBeNull(); // a real score
      expect(outcome.result.rated).toBe(true);
      expect(outcome.result.minThresholdMet).toBe(true);
      expect(outcome.result.changed).toBe(true);
      expect(outcome.result.published).toBe(true);

      const head = await headRow(vendorProfileId);
      expect(head?.minThresholdMet).toBe(true);
      expect(head?.score).not.toBeNull();

      // exactly ONE history snapshot
      expect(await historyRows(vendorProfileId)).toHaveLength(1);

      // exactly ONE PerformanceScoreUpdated (v1, pending, thin payload — rated:true, NO numeric score)
      const events = await updatedEvents(vendorProfileId);
      expect(events).toHaveLength(1);
      expect(events[0]!.status).toBe("pending");
      expect(events[0]!.eventVersion).toBe(1);
      expect(events[0]!.aggregateId).toBe(vendorProfileId);
      const payload = events[0]!.payloadJsonb as Record<string, unknown>;
      expect(payload).toMatchObject({ vendor_profile_id: vendorProfileId, rated: true });
      expect(payload).not.toHaveProperty("score"); // the numeric score is never public/in-event

      // exactly ONE recalculation audit (System)
      const audit = await scoreAuditByAction(scoreId, "performance_score_recalculated");
      expect(audit).toHaveLength(1);
      expect(audit[0]!.actorType).toBe("system");
      expect(audit[0]!.actorId).toBeNull();
    });

    it("RATED via the 2-projects leg (completions, 0 responses): the frozen OR-gate rates the vendor", async () => {
      const vendorProfileId = uuidv7();
      await ingestCompletions(vendorProfileId, 2); // 2 projects — the OR leg of the frozen gate
      const outcome = await compute(vendorProfileId);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.rated).toBe(true);
      expect(outcome.result.minThresholdMet).toBe(true);
      expect(outcome.result.score).not.toBeNull();
    });

    it("A-10 RESPONSE = quote OR formal decline: 5 formal declines (0 quotes) → RATED (Doc-2 §10.6 A-10)", async () => {
      const vendorProfileId = uuidv7();
      await ingestDeclines(vendorProfileId, 5); // 5 formal declines — each a "response" per A-10; 0 quotes/projects
      const outcome = await compute(vendorProfileId);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.minThresholdMet).toBe(true); // declines COUNT toward "5 responses" (A-10)
      expect(outcome.result.rated).toBe(true);
      expect(outcome.result.score).not.toBeNull();
    });

    it("A-10 MIXED responses (3 quotes + 2 declines = 5) → RATED: the response leg sums quote + decline", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 3); // 3 quotes
      await ingestDeclines(vendorProfileId, 2); // + 2 formal declines = 5 responses (A-10)
      const outcome = await compute(vendorProfileId);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.minThresholdMet).toBe(true);
      expect(outcome.result.rated).toBe(true);
    });

    it("A-10 NON-RESPONSE is an absence, NOT a response: 5 non_responses (0 quotes/declines/projects) → NOT RATED", async () => {
      const vendorProfileId = uuidv7();
      await ingestNonResponses(vendorProfileId, 5); // absences — NEVER count toward the gate (A-10)
      const outcome = await compute(vendorProfileId);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.minThresholdMet).toBe(false); // non_response excluded from "responses"
      expect(outcome.result.rated).toBe(false);
      expect(outcome.result.score).toBeNull(); // Not Rated (NULL), never 0
      expect(outcome.result.score).not.toBe(0);
    });

    it("PUBLISH-ON-CHANGE idempotency: recompute with unchanged inputs → NO new event/snapshot/audit", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 5);
      const first = await compute(vendorProfileId);
      expect(first.ok).toBe(true);
      if (!first.ok) throw new Error("unreachable");
      const scoreId = first.result.performanceScoreId;

      const eventsBefore = (await updatedEvents(vendorProfileId)).length; // 1
      const historyBefore = (await historyRows(vendorProfileId)).length; // 1
      const auditBefore = (await scoreAudit(scoreId)).length; // 1

      const second = await compute(vendorProfileId); // identical inputs + formula
      expect(second.ok).toBe(true);
      if (!second.ok) throw new Error("unreachable");
      expect(second.result.changed).toBe(false); // idempotent — nothing changed
      expect(second.result.published).toBe(false);

      expect(await updatedEvents(vendorProfileId)).toHaveLength(eventsBefore); // no new event
      expect(await historyRows(vendorProfileId)).toHaveLength(historyBefore); // no new snapshot
      expect(await scoreAudit(scoreId)).toHaveLength(auditBefore); // no new audit
    });

    it("CHANGE: crossing the threshold changes the score → a new event + snapshot + audit", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 3); // below gate
      const below = await compute(vendorProfileId);
      expect(below.ok && below.result.score === null).toBe(true);
      if (!below.ok) throw new Error("unreachable");
      const scoreId = below.result.performanceScoreId;
      const eventsBefore = (await updatedEvents(vendorProfileId)).length; // 1 (establishment)
      const historyBefore = (await historyRows(vendorProfileId)).length; // 1

      await ingestResponses(vendorProfileId, 2); // now 5 — crosses the gate
      const above = await compute(vendorProfileId);
      expect(above.ok).toBe(true);
      if (!above.ok) throw new Error("unreachable");
      expect(above.result.rated).toBe(true);
      expect(above.result.changed).toBe(true);

      expect((await updatedEvents(vendorProfileId)).length).toBe(eventsBefore + 1);
      expect((await historyRows(vendorProfileId)).length).toBe(historyBefore + 1);
      expect((await scoreAuditByAction(scoreId, "performance_score_recalculated")).length).toBe(2);
    });

    it("ATOMICITY: an EMIT failure rolls back the head + history + audit (nothing committed)", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 5); // rated → the compute will attempt to publish
      const failingEmit = (() =>
        Promise.reject(new Error("emit failed (injected)"))) as typeof writeOutboxEvent;

      await expect(
        inStaffTx((tx) =>
          computePerformanceScore(
            { vendorProfileId, trigger: "input_change" },
            { appendAuditRecord, writeOutboxEvent: failingEmit },
            tx,
          ),
        ),
      ).rejects.toThrow(/emit failed/);

      expect(await headRow(vendorProfileId)).toBeNull(); // SD head upsert rolled back
      expect(await historyRows(vendorProfileId)).toHaveLength(0); // snapshot rolled back
      expect(await updatedEvents(vendorProfileId)).toHaveLength(0); // no event
    });

    it("ATOMICITY: an AUDIT failure rolls back the head + history + emit (nothing committed)", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 5);
      const failingAudit = (() =>
        Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;

      await expect(
        inStaffTx((tx) =>
          computePerformanceScore(
            { vendorProfileId, trigger: "input_change" },
            { appendAuditRecord: failingAudit, writeOutboxEvent },
            tx,
          ),
        ),
      ).rejects.toThrow(/audit append failed/);

      expect(await headRow(vendorProfileId)).toBeNull();
      expect(await historyRows(vendorProfileId)).toHaveLength(0);
      expect(await updatedEvents(vendorProfileId)).toHaveLength(0); // emit rolled back
    });

    it("FROZEN suppression: a frozen head recomputes + snapshots + audits, but publication is SUPPRESSED (no event)", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 5);
      const first = await compute(vendorProfileId); // creates head + 1 event
      expect(first.ok).toBe(true);
      if (!first.ok) throw new Error("unreachable");
      const scoreId = first.result.performanceScoreId;
      expect(await updatedEvents(vendorProfileId)).toHaveLength(1);

      // Freeze the head directly (freeze/reactivate is a DEFERRED WP; freeze_state is not an immutable column).
      await prisma.$executeRawUnsafe(
        `UPDATE trust.performance_scores SET freeze_state = 'frozen' WHERE vendor_profile_id = $1::uuid`,
        vendorProfileId,
      );

      await ingestResponses(vendorProfileId, 5); // change the tally → recompute yields a different score
      const frozen = await compute(vendorProfileId);
      expect(frozen.ok).toBe(true);
      if (!frozen.ok) throw new Error("unreachable");
      expect(frozen.result.freezeState).toBe("frozen");
      expect(frozen.result.changed).toBe(true); // recompute + snapshot ALLOWED while frozen
      expect(frozen.result.published).toBe(false); // publication SUPPRESSED

      // head updated + a 2nd snapshot + a 2nd recalculation audit, but STILL only ONE PerformanceScoreUpdated
      expect(await historyRows(vendorProfileId)).toHaveLength(2);
      expect((await scoreAuditByAction(scoreId, "performance_score_recalculated")).length).toBe(2);
      expect(await updatedEvents(vendorProfileId)).toHaveLength(1); // NO new event while frozen
    });

    it("SYNTAX: a bad trigger enum → VALIDATION (no write)", async () => {
      const vendorProfileId = uuidv7();
      const outcome = await inStaffTx((tx) =>
        computePerformanceScore({ vendorProfileId, trigger: "bogus" as never }, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("VALIDATION");
      expect(await headRow(vendorProfileId)).toBeNull();
    });
  });

  // ── FIREWALL (Doc-6G §3.3.1 line 84; Invariant #6) ───────────────────────────
  describe("firewall", () => {
    it("components_jsonb carries performance inputs ONLY — no Financial Tier / Trust Score / Buyer-Vendor Status", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 5);
      await compute(vendorProfileId);
      const head = await headRow(vendorProfileId);
      const serialized = JSON.stringify(head?.componentsJsonb).toLowerCase();
      expect(serialized).not.toMatch(/financial/);
      expect(serialized).not.toMatch(/trustscore|trust_score/);
      expect(serialized).not.toMatch(/buyer/);
      expect(serialized).not.toMatch(/blacklist|approved/);
    });
  });

  // ── trigger_performance_review (Doc-4G §G6.4) ────────────────────────────────
  describe("trigger_performance_review", () => {
    it("HAPPY: an existing head → emits PerformanceReviewTriggered + a review-triggered audit; NO score write", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 5);
      const c = await compute(vendorProfileId);
      expect(c.ok).toBe(true);
      if (!c.ok) throw new Error("unreachable");
      const scoreId = c.result.performanceScoreId;
      const scoreBefore = (await headRow(vendorProfileId))?.score;
      const updatedBefore = (await headRow(vendorProfileId))?.updatedAt;

      const outcome = await inStaffTx((tx) =>
        triggerPerformanceReview(
          { vendorProfileId, triggerReason: "threshold_crossing" },
          deps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.triggered).toBe(true);

      const events = await reviewEvents(vendorProfileId);
      expect(events).toHaveLength(1);
      expect(events[0]!.eventVersion).toBe(1);
      expect(events[0]!.payloadJsonb).toMatchObject({
        vendor_profile_id: vendorProfileId,
        trigger_reason: "threshold_crossing",
      });

      const audit = await scoreAuditByAction(scoreId, "performance_review_triggered");
      expect(audit).toHaveLength(1);
      expect(audit[0]!.actorType).toBe("system");

      // NO score write — the head is untouched (score + updated_at unchanged)
      const head = await headRow(vendorProfileId);
      expect(head?.score).toBe(scoreBefore ?? null);
      expect(head?.updatedAt.getTime()).toBe(updatedBefore?.getTime());
    });

    it("REFERENCE: trigger on a vendor with NO head → REFERENCE (no event/audit)", async () => {
      const vendorProfileId = uuidv7();
      const outcome = await inStaffTx((tx) =>
        triggerPerformanceReview({ vendorProfileId, triggerReason: "periodic_cadence" }, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("REFERENCE");
      expect(outcome.error.errorCode).toBe("trust_performance_review_subject_unresolved");
      expect(await reviewEvents(vendorProfileId)).toHaveLength(0);
    });

    it("SYNTAX: a bad trigger_reason enum → VALIDATION", async () => {
      const vendorProfileId = uuidv7();
      const outcome = await inStaffTx((tx) =>
        triggerPerformanceReview({ vendorProfileId, triggerReason: "bogus" as never }, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("VALIDATION");
    });
  });

  // ── RLS / no-in-band-write / immutability / append-only / dedup / enums (Doc-6G §3.3 / §3.x) ────────
  describe("substrate: RLS / no-in-band-write / immutability / append-only / dedup / enums", () => {
    beforeAll(async () => {
      await ensureRestrictedRlsRole();
      await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA trust TO ${RESTRICTED_RLS_ROLE}`);
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON trust.performance_scores TO ${RESTRICTED_RLS_ROLE}`,
      );
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON trust.performance_score_history TO ${RESTRICTED_RLS_ROLE}`,
      );
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON trust.performance_inputs TO ${RESTRICTED_RLS_ROLE}`,
      );
      await prisma.$executeRawUnsafe(
        `GRANT EXECUTE ON FUNCTION trust.append_performance_input(uuid, uuid, uuid, trust.performance_source_type, trust.performance_input_type, timestamptz, jsonb, uuid) TO ${RESTRICTED_RLS_ROLE}`,
      );
    });

    it("meta: the restricted role is NON-privileged (RLS enforces — no false pass)", async () => {
      const attrs = await prisma.$queryRawUnsafe<
        Array<{ rolsuper: boolean; rolbypassrls: boolean }>
      >(`SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = '${RESTRICTED_RLS_ROLE}'`);
      expect(attrs[0]!.rolsuper).toBe(false);
      expect(attrs[0]!.rolbypassrls).toBe(false);
    });

    it("RLS read: STAFF sees a computed head; NO staff GUC ⇒ fail-closed 0 rows", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 5);
      await compute(vendorProfileId);

      const staff = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM trust.performance_scores WHERE vendor_profile_id = $1::uuid`,
          vendorProfileId,
        ),
      );
      expect(staff).toHaveLength(1);

      const noCtx = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM trust.performance_scores WHERE vendor_profile_id = $1::uuid`,
          vendorProfileId,
        ),
      );
      expect(noCtx).toHaveLength(0);
    });

    it("NO in-band write path: a direct INSERT into each score-class table is RLS-denied even for STAFF", async () => {
      for (const gucs of [{}, { isPlatformStaff: true }]) {
        await expect(
          asRestrictedRole(gucs, (tx) =>
            tx.$executeRawUnsafe(
              `INSERT INTO trust.performance_scores (id, vendor_profile_id, performance_formula_version)
               VALUES ($1::uuid, $2::uuid, 'esc-interim-0')`,
              uuidv7(),
              uuidv7(),
            ),
          ),
        ).rejects.toThrow(/row-level security/i);

        await expect(
          asRestrictedRole(gucs, (tx) =>
            tx.$executeRawUnsafe(
              `INSERT INTO trust.performance_inputs (id, vendor_profile_id, source_entity_id, source_type, input_type, occurred_at)
               VALUES ($1::uuid, $2::uuid, $3::uuid, 'invitation', 'response', now())`,
              uuidv7(),
              uuidv7(),
              uuidv7(),
            ),
          ),
        ).rejects.toThrow(/row-level security/i);
      }
    });

    it("SD BYPASS: append_performance_input inserts for a NON-staff caller (owner-role bypass)", async () => {
      const rows = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ created: boolean }>>(
          `SELECT created FROM trust.append_performance_input(
             $1::uuid, $2::uuid, $3::uuid, 'invitation'::trust.performance_source_type,
             'response'::trust.performance_input_type, now(), NULL::jsonb, NULL::uuid)`,
          uuidv7(),
          uuidv7(),
          uuidv7(),
        ),
      );
      expect(rows[0]!.created).toBe(true); // the probe tx is rolled back by the harness
    });

    it("immutability: head score is mutable; vendor_profile_id is frozen; DELETE is blocked", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 5);
      await compute(vendorProfileId);
      const row = (await headRow(vendorProfileId))!;

      // mutable score (superuser direct UPDATE — RLS bypassed; the trigger still fires and allows it)
      await prisma.$executeRawUnsafe(
        `UPDATE trust.performance_scores SET score = 42 WHERE id = $1::uuid`,
        row.id,
      );
      expect((await headRow(vendorProfileId))?.score).toBe(42);

      // frozen vendor_profile_id
      await expect(
        prisma.$executeRawUnsafe(
          `UPDATE trust.performance_scores SET vendor_profile_id = $2::uuid WHERE id = $1::uuid`,
          row.id,
          uuidv7(),
        ),
      ).rejects.toThrow(/is immutable/i);

      // DELETE blocked
      await expect(
        prisma.$executeRawUnsafe(
          `DELETE FROM trust.performance_scores WHERE id = $1::uuid`,
          row.id,
        ),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
    });

    it("append-only: performance_inputs UPDATE + DELETE are blocked (immutable trigger)", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 1);
      const input = (await inputRows(vendorProfileId))[0]!;

      await expect(
        prisma.$executeRawUnsafe(
          `UPDATE trust.performance_inputs SET input_type = 'decline' WHERE id = $1::uuid`,
          input.id,
        ),
      ).rejects.toThrow(/is immutable/i);

      await expect(
        prisma.$executeRawUnsafe(
          `DELETE FROM trust.performance_inputs WHERE id = $1::uuid`,
          input.id,
        ),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
    });

    it("append-only: performance_score_history UPDATE + DELETE are blocked (immutable trigger)", async () => {
      const vendorProfileId = uuidv7();
      await ingestResponses(vendorProfileId, 5);
      await compute(vendorProfileId);
      const snap = (await historyRows(vendorProfileId))[0]!;

      await expect(
        prisma.$executeRawUnsafe(
          `UPDATE trust.performance_score_history SET score = 1 WHERE id = $1::uuid`,
          snap.id,
        ),
      ).rejects.toThrow(/is immutable/i);
      await expect(
        prisma.$executeRawUnsafe(
          `DELETE FROM trust.performance_score_history WHERE id = $1::uuid`,
          snap.id,
        ),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
    });

    it("dedup UNIQUE(source_type, source_entity_id, input_type): a second identical triple is rejected", async () => {
      const sourceEntityId = uuidv7();
      await prisma.performanceInput.create({
        data: {
          id: uuidv7(),
          vendorProfileId: uuidv7(),
          sourceEntityId,
          sourceType: "invitation",
          inputType: "response",
          occurredAt: new Date(),
        },
      });
      await expect(
        prisma.performanceInput.create({
          data: {
            id: uuidv7(),
            vendorProfileId: uuidv7(),
            sourceEntityId,
            sourceType: "invitation",
            inputType: "response",
            occurredAt: new Date(),
          },
        }),
      ).rejects.toThrow(/unique|performance_inputs_dedup_uq/i);
    });

    it("enum labels are VERBATIM (Doc-6G §3.3)", async () => {
      const enums: ReadonlyArray<readonly [string, readonly string[]]> = [
        ["score_freeze_state", ["none", "frozen"]],
        [
          "performance_input_type",
          ["response", "decline", "non_response", "delivery", "feedback", "dispute", "completion"],
        ],
        ["performance_source_type", ["invitation", "quotation", "engagement", "wcc"]],
      ];
      for (const [name, labels] of enums) {
        const rows = await prisma.$queryRawUnsafe<Array<{ labels: string[] }>>(
          `SELECT enum_range(NULL::"trust"."${name}")::text[] AS labels`,
        );
        expect(rows[0]!.labels).toEqual([...labels]);
      }
    });

    it("RLS is ENABLED with ONLY a SELECT read policy on all three score-class tables (no write policy)", async () => {
      for (const table of [
        "performance_scores",
        "performance_score_history",
        "performance_inputs",
      ]) {
        const enabled = await prisma.$queryRawUnsafe<Array<{ e: boolean }>>(
          `SELECT relrowsecurity AS e FROM pg_class WHERE oid = 'trust.${table}'::regclass`,
        );
        expect(enabled[0]!.e, table).toBe(true);
        const policies = await prisma.$queryRawUnsafe<Array<{ cmd: string }>>(
          `SELECT cmd FROM pg_policies WHERE schemaname = 'trust' AND tablename = '${table}'`,
        );
        expect(
          policies.map((p) => p.cmd),
          table,
        ).toEqual(["SELECT"]);
      }
    });
  });
});
