import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma, type Prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import {
  computePerformanceScore,
  computeTrustScore,
  ingestPerformanceInput,
} from "@/modules/trust/contracts";
import { appendAuditRecord, writeOutboxEvent } from "@/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-TRUST-4b — the BC-TRUST-2 Trust-Score compute machinery (Doc-4G §G5.1 / §H; Doc-6G §3.2), exercised
// DIRECTLY (the live production triggers + reads + freeze/reactivate are DEFERRED). Proves, against a REAL
// PostgreSQL, PIPELINE behavior (NOT specific score/band values — the formula is an [ESC-TRUST-POLICY] interim
// plug): the FROZEN score-ALWAYS-0–100 head (no Not-Rated NULL; absence ≠ 0 — a NON-ZERO baseline), the
// ⛔ FIREWALL (the Trust Score is INVARIANT to Financial Tier — inserting a `verified_financial_tiers` row never
// changes it), fraud-absence tolerance (a neutral seam; NO `fraud_signals` table), publish-on-change, the
// WRITE-PLUS-EMIT-PLUS-AUDIT ATOMICITY (Doc-8F — emit-fail AND audit-fail each roll back the whole tx),
// frozen-state publication suppression, and the RLS admin-read + no-in-band-write + immutability + shared-enum
// substrate.
//
// The shared `prisma` connection is superuser (bypasses RLS) — happy paths assert row/event/audit content; the
// DB-level RLS/SD gates run through the Doc-8B §5 restricted-role backstop (`ivendorz_test_rls`, NOBYPASSRLS).
// Every test uses FRESH `uuidv7()` vendor + source ids — the append-only tables accumulate but never collide.

const deps = { appendAuditRecord, writeOutboxEvent };
const ingestDeps = { appendAuditRecord };

/** Run `fn` inside ONE tx with the platform-staff GUC set (the System actor context the firewall-scoped input
 *  reads + SD write + outbox INSERT + audit append require). The service does read + SD write + emit + audit on
 *  this single tx. */
async function inStaffTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    return fn(tx);
  });
}

const headRow = (vendorProfileId: string) =>
  prisma.trustScore.findUnique({ where: { vendorProfileId } });

const historyRows = (vendorProfileId: string) =>
  prisma.trustScoreHistory.findMany({ where: { vendorProfileId } });

const updatedEvents = (aggregateId: string) =>
  prisma.outboxEvent.findMany({ where: { aggregateId, eventName: "TrustScoreUpdated" } });

const scoreAudit = (entityId: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "trust_score", entityId } });

const scoreAuditByAction = (entityId: string, action: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "trust_score", entityId, action } });

/** The Trust-Score compute (System) on a staff-scoped tx, trigger `input_signal_change` (the §G5.1 label). */
const compute = (vendorProfileId: string) =>
  inStaffTx((tx) =>
    computeTrustScore({ vendorProfileId, trigger: "input_signal_change" }, deps, tx),
  );

/** Add ONE approved `verification_records` row for the subject (superuser create — RLS bypassed; a legitimate
 *  Verification-signal input to the Trust Score). NOT special-cased by type (owner-directed). */
async function addApprovedVerification(vendorProfileId: string): Promise<void> {
  await prisma.verificationRecord.create({
    data: {
      id: uuidv7(),
      subjectId: vendorProfileId,
      subjectType: "vendor_profile",
      verificationType: "business",
      state: "approved",
    },
  });
}

/** Establish a RATED `performance_scores` head for the vendor via the WP4a machinery (ingest 5 responses +
 *  compute performance) — a legitimate Performance-signal input the Trust Score CONSUMES read-only. */
async function setupRatedPerformance(vendorProfileId: string): Promise<void> {
  for (let i = 0; i < 5; i++) {
    const out = await inStaffTx((tx) =>
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
    if (!out.ok) throw new Error(`setupRatedPerformance ingest failed: ${out.error.errorCode}`);
  }
  const perf = await inStaffTx((tx) =>
    computePerformanceScore({ vendorProfileId, trigger: "input_change" }, deps, tx),
  );
  if (!perf.ok) throw new Error(`setupRatedPerformance compute failed: ${perf.error.errorCode}`);
}

describe("W3-TRUST-4b — BC-TRUST-2 Trust Scoring (Doc-4G §G5.1; Doc-6G §3.2)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── compute_trust_score (Doc-4G §G5.1) ───────────────────────────────────────
  describe("compute_trust_score", () => {
    it("HAPPY (verification + performance inputs): a computed head (score 0–100 NOT NULL) + band + ONE snapshot + ONE TrustScoreUpdated + ONE recalculation audit (atomic)", async () => {
      const vendorProfileId = uuidv7();
      await addApprovedVerification(vendorProfileId);
      await setupRatedPerformance(vendorProfileId);

      const outcome = await compute(vendorProfileId);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      const scoreId = outcome.result.trustScoreId;

      // score ALWAYS 0–100 and NOT NULL (Doc-6G §3.2.1 `smallint NOT NULL`; no Not-Rated state)
      expect(outcome.result.score).not.toBeNull();
      expect(outcome.result.score).toBeGreaterThanOrEqual(0);
      expect(outcome.result.score).toBeLessThanOrEqual(100);
      expect(typeof outcome.result.band).toBe("string");
      expect(outcome.result.band.length).toBeGreaterThan(0);
      expect(outcome.result.changed).toBe(true);
      expect(outcome.result.published).toBe(true);

      const head = await headRow(vendorProfileId);
      expect(head?.score).not.toBeNull();
      expect(head?.band).toBe(outcome.result.band);
      expect(head?.trustFormulaVersion).toBe("esc-interim-0"); // the documented interim stamp

      // exactly ONE history snapshot
      expect(await historyRows(vendorProfileId)).toHaveLength(1);

      // exactly ONE TrustScoreUpdated (v1, pending, thin payload — {vendorProfileId, band}, NO numeric score)
      const events = await updatedEvents(vendorProfileId);
      expect(events).toHaveLength(1);
      expect(events[0]!.status).toBe("pending");
      expect(events[0]!.eventVersion).toBe(1);
      expect(events[0]!.aggregateId).toBe(vendorProfileId);
      const payload = events[0]!.payloadJsonb as Record<string, unknown>;
      expect(payload).toMatchObject({ vendorProfileId, band: outcome.result.band });
      expect(payload).not.toHaveProperty("score"); // the numeric score is never public/in-event

      // exactly ONE recalculation audit (System)
      const audit = await scoreAuditByAction(scoreId, "trust_score_recalculated");
      expect(audit).toHaveLength(1);
      expect(audit[0]!.actorType).toBe("system");
      expect(audit[0]!.actorId).toBeNull();
      expect(audit[0]!.organizationId).toBeNull();
    });

    it("ABSENCE ≠ 0 (frozen): a vendor with NO verification and NO performance → a computed head with score !== 0 and a non-empty band (never 0; never NULL)", async () => {
      const vendorProfileId = uuidv7();
      const outcome = await compute(vendorProfileId);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");

      // absence-of-history is NEVER 0 (Doc-3 §12.1 FIXED) — a documented NON-ZERO baseline
      expect(outcome.result.score).not.toBeNull();
      expect(outcome.result.score).not.toBe(0);
      expect(outcome.result.score).toBeGreaterThan(0);
      expect(outcome.result.band.length).toBeGreaterThan(0);

      const head = await headRow(vendorProfileId);
      expect(head?.score).not.toBeNull();
      expect(head?.score).not.toBe(0);
      expect(head?.band).not.toBe("");
    });

    it("FRAUD-TOLERANCE + determinism: compute for a vendor with NO fraud table SUCCEEDS (neutral); the same inputs twice → identical score/band, second compute changed:false", async () => {
      const vendorProfileId = uuidv7();
      await addApprovedVerification(vendorProfileId);

      const first = await compute(vendorProfileId); // no fraud_signals table exists — neutral seam
      expect(first.ok).toBe(true);
      if (!first.ok) throw new Error("unreachable");
      expect(first.result.score).not.toBeNull();
      expect(first.result.changed).toBe(true);

      const second = await compute(vendorProfileId); // identical inputs + formula → deterministic
      expect(second.ok).toBe(true);
      if (!second.ok) throw new Error("unreachable");
      expect(second.result.score).toBe(first.result.score); // identical score (deterministic)
      expect(second.result.band).toBe(first.result.band); // identical band
      expect(second.result.changed).toBe(false); // publish-on-change: nothing changed
      expect(second.result.published).toBe(false);
    });

    it("PUBLISH-ON-CHANGE idempotency: recompute with unchanged inputs → NO new event/snapshot/audit", async () => {
      const vendorProfileId = uuidv7();
      await addApprovedVerification(vendorProfileId);
      const first = await compute(vendorProfileId);
      expect(first.ok).toBe(true);
      if (!first.ok) throw new Error("unreachable");
      const scoreId = first.result.trustScoreId;

      const eventsBefore = (await updatedEvents(vendorProfileId)).length; // 1
      const historyBefore = (await historyRows(vendorProfileId)).length; // 1
      const auditBefore = (await scoreAudit(scoreId)).length; // 1

      const second = await compute(vendorProfileId); // identical inputs + formula
      expect(second.ok).toBe(true);
      if (!second.ok) throw new Error("unreachable");
      expect(second.result.changed).toBe(false);
      expect(second.result.published).toBe(false);

      expect(await updatedEvents(vendorProfileId)).toHaveLength(eventsBefore); // no new event
      expect(await historyRows(vendorProfileId)).toHaveLength(historyBefore); // no new snapshot
      expect(await scoreAudit(scoreId)).toHaveLength(auditBefore); // no new audit
    });

    it("CHANGE: adding an input that changes the score → a new event + snapshot + audit", async () => {
      const vendorProfileId = uuidv7();
      const first = await compute(vendorProfileId); // baseline (no inputs)
      expect(first.ok).toBe(true);
      if (!first.ok) throw new Error("unreachable");
      const scoreId = first.result.trustScoreId;
      const eventsBefore = (await updatedEvents(vendorProfileId)).length; // 1 (establishment)
      const historyBefore = (await historyRows(vendorProfileId)).length; // 1

      await addApprovedVerification(vendorProfileId); // a new positive input → the score moves
      const second = await compute(vendorProfileId);
      expect(second.ok).toBe(true);
      if (!second.ok) throw new Error("unreachable");
      expect(second.result.changed).toBe(true);
      expect(second.result.score).not.toBe(first.result.score);

      expect((await updatedEvents(vendorProfileId)).length).toBe(eventsBefore + 1);
      expect((await historyRows(vendorProfileId)).length).toBe(historyBefore + 1);
      expect((await scoreAuditByAction(scoreId, "trust_score_recalculated")).length).toBe(2);
    });

    it("ATOMICITY: an EMIT failure rolls back the head + history + audit (nothing committed)", async () => {
      const vendorProfileId = uuidv7(); // fresh vendor → first compute is changed → attempts to publish
      const failingEmit = (() =>
        Promise.reject(new Error("emit failed (injected)"))) as typeof writeOutboxEvent;

      await expect(
        inStaffTx((tx) =>
          computeTrustScore(
            { vendorProfileId, trigger: "input_signal_change" },
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
      const failingAudit = (() =>
        Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;

      await expect(
        inStaffTx((tx) =>
          computeTrustScore(
            { vendorProfileId, trigger: "input_signal_change" },
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
      const first = await compute(vendorProfileId); // creates head + 1 event
      expect(first.ok).toBe(true);
      if (!first.ok) throw new Error("unreachable");
      const scoreId = first.result.trustScoreId;
      expect(await updatedEvents(vendorProfileId)).toHaveLength(1);

      // Freeze the head directly (freeze/reactivate is a DEFERRED WP; freeze_state is not an immutable column).
      await prisma.$executeRawUnsafe(
        `UPDATE trust.trust_scores SET freeze_state = 'frozen' WHERE vendor_profile_id = $1::uuid`,
        vendorProfileId,
      );

      await addApprovedVerification(vendorProfileId); // change the inputs → recompute yields a different score
      const frozen = await compute(vendorProfileId);
      expect(frozen.ok).toBe(true);
      if (!frozen.ok) throw new Error("unreachable");
      expect(frozen.result.freezeState).toBe("frozen");
      expect(frozen.result.changed).toBe(true); // recompute + snapshot ALLOWED while frozen
      expect(frozen.result.published).toBe(false); // publication SUPPRESSED

      // head updated + a 2nd snapshot + a 2nd recalculation audit, but STILL only ONE TrustScoreUpdated
      expect(await historyRows(vendorProfileId)).toHaveLength(2);
      expect((await scoreAuditByAction(scoreId, "trust_score_recalculated")).length).toBe(2);
      expect(await updatedEvents(vendorProfileId)).toHaveLength(1); // NO new event while frozen
    });

    it("SYNTAX: a bad trigger enum → VALIDATION (no write)", async () => {
      const vendorProfileId = uuidv7();
      const outcome = await inStaffTx((tx) =>
        computeTrustScore({ vendorProfileId, trigger: "bogus" as never }, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("VALIDATION");
      expect(outcome.error.errorCode).toBe("trust_trust_score_invalid_input");
      expect(await headRow(vendorProfileId)).toBeNull();
    });

    it("SYNTAX: a bad vendor_profile_id uuid → VALIDATION", async () => {
      const outcome = await inStaffTx((tx) =>
        computeTrustScore({ vendorProfileId: "not-a-uuid", trigger: "scheduled_recalc" }, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("VALIDATION");
    });
  });

  // ── ⛔ FIREWALL (Invariant #6 / Doc-4G §H.9b/c; Doc-6G §3.2.1) ────────────────
  describe("firewall — the Trust Score is INVARIANT to Financial Tier", () => {
    it("inserting a verified_financial_tiers row (ANY tier) never changes the Trust Score (tier never feeds it)", async () => {
      const vendorProfileId = uuidv7();
      await addApprovedVerification(vendorProfileId); // give it a real, non-baseline score
      const before = await compute(vendorProfileId);
      expect(before.ok).toBe(true);
      if (!before.ok) throw new Error("unreachable");
      const scoreX = before.result.score;
      const bandX = before.result.band;

      // Introduce the FINANCIAL TIER signal for this vendor (superuser insert — RLS bypassed; ANY tier).
      await prisma.verifiedFinancialTier.create({
        data: { id: uuidv7(), vendorProfileId, tier: "A", status: "verified" },
      });

      const after = await compute(vendorProfileId); // recompute with the tier row present
      expect(after.ok).toBe(true);
      if (!after.ok) throw new Error("unreachable");
      expect(after.result.changed).toBe(false); // the tier value never fed the score → nothing changed
      expect(after.result.score).toBe(scoreX); // identical score
      expect(after.result.band).toBe(bandX); // identical band
      expect(await historyRows(vendorProfileId)).toHaveLength(1); // no new snapshot (unchanged)
      expect(await updatedEvents(vendorProfileId)).toHaveLength(1); // no new event
    });
  });

  // ── RLS / no-in-band-write / SD-bypass / immutability / append-only / shared-enum (Doc-6G §3.2 / §3.x) ──
  describe("substrate: RLS / no-in-band-write / SD-bypass / immutability / append-only / shared-enum", () => {
    beforeAll(async () => {
      await ensureRestrictedRlsRole();
      await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA trust TO ${RESTRICTED_RLS_ROLE}`);
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON trust.trust_scores TO ${RESTRICTED_RLS_ROLE}`,
      );
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON trust.trust_score_history TO ${RESTRICTED_RLS_ROLE}`,
      );
      await prisma.$executeRawUnsafe(
        `GRANT EXECUTE ON FUNCTION trust.upsert_trust_score(uuid, uuid, uuid, smallint, text, text, uuid) TO ${RESTRICTED_RLS_ROLE}`,
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
      await compute(vendorProfileId);

      const staff = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM trust.trust_scores WHERE vendor_profile_id = $1::uuid`,
          vendorProfileId,
        ),
      );
      expect(staff).toHaveLength(1);

      const noCtx = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM trust.trust_scores WHERE vendor_profile_id = $1::uuid`,
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
              `INSERT INTO trust.trust_scores (id, vendor_profile_id, score, band, trust_formula_version)
               VALUES ($1::uuid, $2::uuid, 50, 'esc-interim-mid', 'esc-interim-0')`,
              uuidv7(),
              uuidv7(),
            ),
          ),
        ).rejects.toThrow(/row-level security/i);
      }
    });

    it("SD BYPASS: upsert_trust_score inserts for a NON-staff caller (owner-role bypass)", async () => {
      const rows = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ changed: boolean }>>(
          `SELECT changed FROM trust.upsert_trust_score(
             $1::uuid, $2::uuid, $3::uuid, 50::smallint, 'esc-interim-mid'::text, 'esc-interim-0'::text, NULL::uuid)`,
          uuidv7(),
          uuidv7(),
          uuidv7(),
        ),
      );
      expect(rows[0]!.changed).toBe(true); // first compute; the probe tx is rolled back by the harness
    });

    it("immutability: head score/band are mutable; vendor_profile_id is frozen; DELETE is blocked", async () => {
      const vendorProfileId = uuidv7();
      await compute(vendorProfileId);
      const row = (await headRow(vendorProfileId))!;

      // mutable score/band (superuser direct UPDATE — RLS bypassed; the trigger fires and allows it)
      await prisma.$executeRawUnsafe(
        `UPDATE trust.trust_scores SET score = 42, band = 'esc-interim-low' WHERE id = $1::uuid`,
        row.id,
      );
      expect((await headRow(vendorProfileId))?.score).toBe(42);

      // frozen vendor_profile_id
      await expect(
        prisma.$executeRawUnsafe(
          `UPDATE trust.trust_scores SET vendor_profile_id = $2::uuid WHERE id = $1::uuid`,
          row.id,
          uuidv7(),
        ),
      ).rejects.toThrow(/is immutable/i);

      // DELETE blocked
      await expect(
        prisma.$executeRawUnsafe(`DELETE FROM trust.trust_scores WHERE id = $1::uuid`, row.id),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
    });

    it("append-only: trust_score_history UPDATE + DELETE are blocked (immutable trigger)", async () => {
      const vendorProfileId = uuidv7();
      await compute(vendorProfileId);
      const snap = (await historyRows(vendorProfileId))[0]!;

      await expect(
        prisma.$executeRawUnsafe(
          `UPDATE trust.trust_score_history SET score = 1 WHERE id = $1::uuid`,
          snap.id,
        ),
      ).rejects.toThrow(/is immutable/i);
      await expect(
        prisma.$executeRawUnsafe(
          `DELETE FROM trust.trust_score_history WHERE id = $1::uuid`,
          snap.id,
        ),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
    });

    it("shared enum: score_freeze_state PRESENT with labels ['none','frozen'] (NOT re-created by this migration)", async () => {
      const rows = await prisma.$queryRawUnsafe<Array<{ labels: string[] }>>(
        `SELECT enum_range(NULL::"trust"."score_freeze_state")::text[] AS labels`,
      );
      expect(rows[0]!.labels).toEqual(["none", "frozen"]);
    });

    it("RLS is ENABLED with ONLY a SELECT read policy on both trust-score tables (no write policy)", async () => {
      for (const table of ["trust_scores", "trust_score_history"]) {
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
