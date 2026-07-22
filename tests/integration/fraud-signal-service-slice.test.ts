import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma, type Prisma } from "../../src/shared/db";
import { UUID_PATTERN, uuidv7 } from "../../src/shared/ids";
import {
  actionFraudSignal,
  createFraudSignal,
  dismissFraudSignal,
  reviewFraudSignal,
  type FraudSignalActorContext,
} from "@/modules/trust/contracts";
import { appendAuditRecord } from "@/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-TRUST-4c — the BC-TRUST-4 Fraud & Risk Signal write-lifecycle (Doc-4G §G7.1/§G7.2; Doc-6G §3.4),
// exercised DIRECTLY (the §G7.3 staff reads, the Admin HTTP wiring + `staff_can_ban` comp-edge authz, the
// fraud→verification revocation, and the detection rules are DEFERRED). Proves, against a REAL PostgreSQL,
// the IN-BAND AUDITED-WRITE pattern (NO SD; NO event): every mutation writes `fraud_signals` + appends ONE
// `[ESC-TRUST-AUDIT]` audit on ONE tx, and NOTHING else — NO event anywhere, NO score/verification/tier write
// (the firewall). Covers: create (System no-slug / Admin); the advisory-lock DEDUP idempotency; the
// open→reviewed→actioned|dismissed lifecycle + STATE/CONFLICT/NOT_FOUND guards; audit-failure atomicity;
// the firewall; the `fraud_signals_admin FOR ALL` RLS fail-closed backstop; immutability + DELETE-blocked +
// enum labels.
//
// The shared `prisma` connection is superuser (bypasses RLS) — happy paths assert row/audit content; the
// DB-level RLS gate is proven through the Doc-8B §5 restricted-role backstop (`ivendorz_test_rls`,
// NOBYPASSRLS). fraud_signals is DELETE-blocked (immutable trigger), so every test uses a FRESH `uuidv7()`
// subject id — rows accumulate but never collide (the house append-only pattern).

const STAFF_ACTOR = "01920000-0000-7000-8000-00000000fa71"; // fixed admin staff id (Doc-2 §9 attribution)
const SYSTEM_CTX: FraudSignalActorContext = { actorType: "system", actorId: null };
const ADMIN_CTX: FraudSignalActorContext = { actorType: "admin", actorId: STAFF_ACTOR };
const deps = { appendAuditRecord }; // NO writeOutboxEvent — BC-TRUST-4 emits NO event (Doc-4G §H.7)

const SUBJECT_TYPE = "vendor_profile";
const SIGNAL_TYPE = "duplicate_account";
const SEVERITY = "high";

/** Run `fn` inside ONE tx with the platform-staff GUC set (the Admin/System actor context the in-band
 *  `fraud_signals` write + the audit append require). The service does read + in-band write + audit here. */
async function inStaffTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    return fn(tx);
  });
}

const fraudRow = (id: string) => prisma.fraudSignal.findUnique({ where: { id } });

const fraudBySubjectCount = (subjectId: string) =>
  prisma.fraudSignal.count({
    where: { subjectId, subjectType: SUBJECT_TYPE, signalType: SIGNAL_TYPE },
  });

const auditRows = (entityId: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "fraud_signal", entityId } });

const auditByAction = (entityId: string, action: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "fraud_signal", entityId, action } });

const outboxForSubject = (subjectId: string) =>
  prisma.outboxEvent.count({ where: { aggregateId: subjectId } });

/** Create a fresh `open` signal for a NEW subject; returns {subjectId, id, updatedAt}. */
async function seedOpen(ctx: FraudSignalActorContext = SYSTEM_CTX) {
  const subjectId = uuidv7();
  const outcome = await inStaffTx((tx) =>
    createFraudSignal(
      { subjectId, subjectType: SUBJECT_TYPE, signalType: SIGNAL_TYPE, severity: SEVERITY },
      ctx,
      deps,
      tx,
    ),
  );
  if (!outcome.ok) throw new Error(`seedOpen failed: ${outcome.error.errorCode}`);
  return { subjectId, id: outcome.result.fraudSignalId, updatedAt: outcome.result.updatedAt };
}

/** Create then review → a `reviewed` signal. */
async function seedReviewed() {
  const { subjectId, id } = await seedOpen();
  const outcome = await inStaffTx((tx) =>
    reviewFraudSignal({ fraudSignalId: id }, ADMIN_CTX, deps, tx),
  );
  if (!outcome.ok) throw new Error(`seedReviewed failed: ${outcome.error.errorCode}`);
  return { subjectId, id, updatedAt: outcome.result.updatedAt };
}

describe("W3-TRUST-4c — fraud_signals write-lifecycle (Doc-4G §G7.1/§G7.2; NO event; NO SD)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── create (Doc-4G §G7.1) ────────────────────────────────────────────────────
  describe("create", () => {
    it("SYSTEM (no slug): writes an `open` row + ONE fraud_signal_created audit (System, actorId null); NO event", async () => {
      const subjectId = uuidv7();
      const outcome = await inStaffTx((tx) =>
        createFraudSignal(
          {
            subjectId,
            subjectType: SUBJECT_TYPE,
            signalType: SIGNAL_TYPE,
            severity: SEVERITY,
            detectionRef: { rule: "dup-fingerprint", score: 0.92 },
          },
          SYSTEM_CTX,
          deps,
          tx,
        ),
      );

      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.state).toBe("open");
      expect(outcome.result.created).toBe(true);
      const id = outcome.result.fraudSignalId;

      const row = await fraudRow(id);
      expect(row?.state).toBe("open");
      expect(row?.subjectId).toBe(subjectId);
      expect(row?.subjectType).toBe(SUBJECT_TYPE);
      expect(row?.signalType).toBe(SIGNAL_TYPE);
      expect(row?.severity).toBe(SEVERITY);
      expect(row?.reportedBy).toBeNull(); // System
      expect(row?.createdBy).toBeNull();

      const audit = await auditRows(id);
      expect(audit).toHaveLength(1);
      expect(audit[0]!.action).toBe("fraud_signal_created");
      expect(audit[0]!.actorType).toBe("system");
      expect(audit[0]!.actorId).toBeNull();
      expect(audit[0]!.organizationId).toBeNull();
      // detection_ref rides the audit newValue (NO DB column — Doc-4G §H.10)
      expect(audit[0]!.newValue).toMatchObject({
        state: "open",
        detection_ref: { rule: "dup-fingerprint", score: 0.92 },
      });

      // NO event (Doc-4G §H.7 — Doc-2 §8 has no Trust fraud event)
      expect(await outboxForSubject(subjectId)).toBe(0);
    });

    it("ADMIN (staff-reported): `open` + audit (Admin attribution, actorId = staff, reported_by = staff)", async () => {
      const subjectId = uuidv7();
      const outcome = await inStaffTx((tx) =>
        createFraudSignal(
          { subjectId, subjectType: SUBJECT_TYPE, signalType: SIGNAL_TYPE, severity: SEVERITY },
          ADMIN_CTX,
          deps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      const id = outcome.result.fraudSignalId;

      const row = await fraudRow(id);
      expect(row?.reportedBy).toBe(STAFF_ACTOR);
      expect(row?.createdBy).toBe(STAFF_ACTOR);

      const audit = await auditRows(id);
      expect(audit).toHaveLength(1);
      expect(audit[0]!.actorType).toBe("admin");
      expect(audit[0]!.actorId).toBe(STAFF_ACTOR);
      expect(await outboxForSubject(subjectId)).toBe(0);
    });

    it("SYNTAX: non-uuid subject_id / empty subject_type|signal_type|severity → VALIDATION (no write)", async () => {
      const bad = [
        {
          subjectId: "not-a-uuid",
          subjectType: SUBJECT_TYPE,
          signalType: SIGNAL_TYPE,
          severity: SEVERITY,
        },
        { subjectId: uuidv7(), subjectType: "  ", signalType: SIGNAL_TYPE, severity: SEVERITY },
        { subjectId: uuidv7(), subjectType: SUBJECT_TYPE, signalType: "", severity: SEVERITY },
        { subjectId: uuidv7(), subjectType: SUBJECT_TYPE, signalType: SIGNAL_TYPE, severity: "" },
      ];
      for (const input of bad) {
        const outcome = await inStaffTx((tx) => createFraudSignal(input, SYSTEM_CTX, deps, tx));
        expect(outcome.ok).toBe(false);
        if (outcome.ok) throw new Error("unreachable");
        expect(outcome.error.errorClass).toBe("VALIDATION");
        expect(outcome.error.errorCode).toBe("trust_fraud_signal_invalid_input");
        // no write reached the table (skip the count for the deliberately non-uuid subject id, which is not
        // a valid Prisma UUID filter — its VALIDATION outcome already proves the write path was not reached).
        if (UUID_PATTERN.test(input.subjectId)) {
          expect(await fraudBySubjectCount(input.subjectId)).toBe(0);
        }
      }
    });
  });

  // ── DEDUP idempotency (Doc-4G §H.8 / §G7.1 §10) ──────────────────────────────
  describe("dedup idempotency", () => {
    it("dedups a duplicate indicator while a non-terminal signal exists; a fresh create after terminal MAY open a new one", async () => {
      const subjectId = uuidv7();
      const input = {
        subjectId,
        subjectType: SUBJECT_TYPE,
        signalType: SIGNAL_TYPE,
        severity: SEVERITY,
      };

      // first create → open
      const c1 = await inStaffTx((tx) => createFraudSignal(input, SYSTEM_CTX, deps, tx));
      expect(c1.ok).toBe(true);
      if (!c1.ok) throw new Error("unreachable");
      const id1 = c1.result.fraudSignalId;
      expect(c1.result.created).toBe(true);

      // duplicate while `open` → returns the SAME signal; NO 2nd row; NO 2nd audit
      const c2 = await inStaffTx((tx) => createFraudSignal(input, SYSTEM_CTX, deps, tx));
      expect(c2.ok).toBe(true);
      if (!c2.ok) throw new Error("unreachable");
      expect(c2.result.created).toBe(false);
      expect(c2.result.fraudSignalId).toBe(id1);
      expect(await fraudBySubjectCount(subjectId)).toBe(1);
      expect(await auditByAction(id1, "fraud_signal_created")).toHaveLength(1);

      // review → reviewed (still non-terminal); duplicate STILL dedups to the same signal
      const rev = await inStaffTx((tx) =>
        reviewFraudSignal({ fraudSignalId: id1 }, ADMIN_CTX, deps, tx),
      );
      expect(rev.ok).toBe(true);
      const c3 = await inStaffTx((tx) => createFraudSignal(input, SYSTEM_CTX, deps, tx));
      expect(c3.ok).toBe(true);
      if (!c3.ok) throw new Error("unreachable");
      expect(c3.result.created).toBe(false);
      expect(c3.result.fraudSignalId).toBe(id1);
      expect(await fraudBySubjectCount(subjectId)).toBe(1);

      // action → actioned (TERMINAL); a fresh create now MAY open a NEW signal
      const act = await inStaffTx((tx) =>
        actionFraudSignal({ fraudSignalId: id1 }, ADMIN_CTX, deps, tx),
      );
      expect(act.ok).toBe(true);
      const c4 = await inStaffTx((tx) => createFraudSignal(input, SYSTEM_CTX, deps, tx));
      expect(c4.ok).toBe(true);
      if (!c4.ok) throw new Error("unreachable");
      expect(c4.result.created).toBe(true);
      expect(c4.result.fraudSignalId).not.toBe(id1);
      expect(await fraudBySubjectCount(subjectId)).toBe(2);

      // no event across the whole lifecycle
      expect(await outboxForSubject(subjectId)).toBe(0);
    });
  });

  // ── triage lifecycle (Doc-4G §G7.2) ──────────────────────────────────────────
  describe("triage: review / action / dismiss", () => {
    it("review: open → reviewed (+ ONE fraud_signal_reviewed audit; NO event; triage_note in audit)", async () => {
      const { subjectId, id } = await seedOpen();
      const outcome = await inStaffTx((tx) =>
        reviewFraudSignal(
          { fraudSignalId: id, triageNote: "under investigation" },
          ADMIN_CTX,
          deps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.state).toBe("reviewed");

      expect((await fraudRow(id))?.state).toBe("reviewed");
      const audit = await auditByAction(id, "fraud_signal_reviewed");
      expect(audit).toHaveLength(1);
      expect(audit[0]!.actorType).toBe("admin");
      expect(audit[0]!.newValue).toMatchObject({
        state: "reviewed",
        triage_note: "under investigation",
      });
      expect(await outboxForSubject(subjectId)).toBe(0);
    });

    it("action: reviewed → actioned (terminal); NEVER issues a ban", async () => {
      const { subjectId, id } = await seedReviewed();
      const outcome = await inStaffTx((tx) =>
        actionFraudSignal({ fraudSignalId: id }, ADMIN_CTX, deps, tx),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.state).toBe("actioned");
      expect((await fraudRow(id))?.state).toBe("actioned");
      expect(await auditByAction(id, "fraud_signal_actioned")).toHaveLength(1);
      expect(await outboxForSubject(subjectId)).toBe(0);
    });

    it("dismiss: reviewed → dismissed (terminal)", async () => {
      const { subjectId, id } = await seedReviewed();
      const outcome = await inStaffTx((tx) =>
        dismissFraudSignal({ fraudSignalId: id }, ADMIN_CTX, deps, tx),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.state).toBe("dismissed");
      expect((await fraudRow(id))?.state).toBe("dismissed");
      expect(await auditByAction(id, "fraud_signal_dismissed")).toHaveLength(1);
      expect(await outboxForSubject(subjectId)).toBe(0);
    });

    it("STATE: action on an `open` source → STATE (no change/audit)", async () => {
      const { id } = await seedOpen();
      const outcome = await inStaffTx((tx) =>
        actionFraudSignal({ fraudSignalId: id }, ADMIN_CTX, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("STATE");
      expect(outcome.error.errorCode).toBe("trust_fraud_signal_illegal_state");
      expect((await fraudRow(id))?.state).toBe("open");
      expect(await auditByAction(id, "fraud_signal_actioned")).toHaveLength(0);
    });

    it("STATE: review on a `reviewed` source → STATE", async () => {
      const { id } = await seedReviewed();
      const outcome = await inStaffTx((tx) =>
        reviewFraudSignal({ fraudSignalId: id }, ADMIN_CTX, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("STATE");
    });

    it("STATE: any transition on a TERMINAL signal → STATE (never reopen)", async () => {
      const { id } = await seedReviewed();
      await inStaffTx((tx) => actionFraudSignal({ fraudSignalId: id }, ADMIN_CTX, deps, tx)); // → actioned
      for (const op of [reviewFraudSignal, actionFraudSignal, dismissFraudSignal]) {
        const outcome = await inStaffTx((tx) => op({ fraudSignalId: id }, ADMIN_CTX, deps, tx));
        expect(outcome.ok).toBe(false);
        if (outcome.ok) throw new Error("unreachable");
        expect(outcome.error.errorClass).toBe("STATE");
      }
      expect((await fraudRow(id))?.state).toBe("actioned"); // unchanged
    });

    it("CONFLICT: a stale expectedUpdatedAt → CONFLICT (no change/audit)", async () => {
      const { id } = await seedOpen();
      const outcome = await inStaffTx((tx) =>
        reviewFraudSignal(
          { fraudSignalId: id, expectedUpdatedAt: new Date(0) },
          ADMIN_CTX,
          deps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("CONFLICT");
      expect(outcome.error.errorCode).toBe("trust_fraud_signal_revision_conflict");
      expect((await fraudRow(id))?.state).toBe("open");
      expect(await auditByAction(id, "fraud_signal_reviewed")).toHaveLength(0);
    });

    it("optimistic token round-trips: review with the create-returned updatedAt succeeds (ms-truncation)", async () => {
      const { id, updatedAt } = await seedOpen();
      const outcome = await inStaffTx((tx) =>
        reviewFraudSignal(
          { fraudSignalId: id, expectedUpdatedAt: new Date(updatedAt) },
          ADMIN_CTX,
          deps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(true);
    });

    it("NOT_FOUND: triage on an absent signal → NOT_FOUND", async () => {
      const outcome = await inStaffTx((tx) =>
        reviewFraudSignal({ fraudSignalId: uuidv7() }, ADMIN_CTX, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("NOT_FOUND");
      expect(outcome.error.errorCode).toBe("trust_fraud_signal_not_found");
    });
  });

  // ── ATOMICITY — an audit-failure rolls back the write (Doc-8F pattern) ────────
  describe("atomicity: audit-failure rolls back the write", () => {
    it("create: audit failure → no fraud_signals row", async () => {
      const subjectId = uuidv7();
      const failingAudit = (() =>
        Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;

      await expect(
        inStaffTx((tx) =>
          createFraudSignal(
            { subjectId, subjectType: SUBJECT_TYPE, signalType: SIGNAL_TYPE, severity: SEVERITY },
            SYSTEM_CTX,
            { appendAuditRecord: failingAudit },
            tx,
          ),
        ),
      ).rejects.toThrow(/audit append failed/);

      expect(await fraudBySubjectCount(subjectId)).toBe(0); // insert rolled back
    });

    it("triage: audit failure → no state change", async () => {
      const { id } = await seedOpen();
      const failingAudit = (() =>
        Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;

      await expect(
        inStaffTx((tx) =>
          reviewFraudSignal(
            { fraudSignalId: id },
            ADMIN_CTX,
            { appendAuditRecord: failingAudit },
            tx,
          ),
        ),
      ).rejects.toThrow(/audit append failed/);

      expect((await fraudRow(id))?.state).toBe("open"); // transition rolled back
      expect(await auditByAction(id, "fraud_signal_reviewed")).toHaveLength(0);
    });
  });

  // ── FIREWALL (Doc-4G §H.9b/c; Invariant #6) ──────────────────────────────────
  describe("firewall: no score/verification/tier write; no event", () => {
    it("after create + full triage, NO write to trust_scores/performance_scores/verification_records/verified_financial_tiers; NO event anywhere", async () => {
      const { subjectId, id } = await seedReviewed();
      const done = await inStaffTx((tx) =>
        actionFraudSignal({ fraudSignalId: id }, ADMIN_CTX, deps, tx),
      );
      expect(done.ok).toBe(true);

      // the fraud service mutates ONLY fraud_signals (+ audit) — nothing in the governance-signal tables
      expect(await prisma.trustScore.count({ where: { vendorProfileId: subjectId } })).toBe(0);
      expect(await prisma.performanceScore.count({ where: { vendorProfileId: subjectId } })).toBe(
        0,
      );
      expect(await prisma.verificationRecord.count({ where: { subjectId } })).toBe(0);
      expect(
        await prisma.verifiedFinancialTier.count({ where: { vendorProfileId: subjectId } }),
      ).toBe(0);

      // NO event for the subject, and NO Fraud* event was EVER coined in the whole outbox (Doc-4G §H.7)
      expect(await outboxForSubject(subjectId)).toBe(0);
      expect(await prisma.outboxEvent.count({ where: { eventName: { contains: "raud" } } })).toBe(
        0,
      );
    });
  });

  // ── NON-DISCLOSURE / RLS (Doc-4G §H.9f; Doc-8B §5 restricted-role backstop) ───
  describe("substrate: RLS / immutability / enums", () => {
    beforeAll(async () => {
      await ensureRestrictedRlsRole();
      await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA trust TO ${RESTRICTED_RLS_ROLE}`);
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT, UPDATE ON trust.fraud_signals TO ${RESTRICTED_RLS_ROLE}`,
      );
    });

    it("meta: the restricted role is NON-privileged (RLS enforces — no false pass)", async () => {
      const attrs = await prisma.$queryRawUnsafe<
        Array<{ rolsuper: boolean; rolbypassrls: boolean }>
      >(`SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = '${RESTRICTED_RLS_ROLE}'`);
      expect(attrs[0]!.rolsuper).toBe(false);
      expect(attrs[0]!.rolbypassrls).toBe(false);
    });

    it("RLS read: STAFF sees a seeded row; NO staff GUC ⇒ fail-closed 0 rows", async () => {
      const { id } = await seedOpen();
      const staff = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM trust.fraud_signals WHERE id = $1::uuid`,
          id,
        ),
      );
      expect(staff).toHaveLength(1);

      const noCtx = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ n: number }>>(
          `SELECT count(*)::int AS n FROM trust.fraud_signals`,
        ),
      );
      expect(noCtx[0]!.n).toBe(0);
    });

    it("RLS write: a non-staff INSERT is DENIED (fail-closed); a staff GUC admits it", async () => {
      // no GUC ⇒ WITH CHECK false ⇒ rejected
      await expect(
        asRestrictedRole({}, (tx) =>
          tx.$executeRawUnsafe(
            `INSERT INTO trust.fraud_signals (id, subject_id, subject_type, signal_type, severity)
             VALUES ($1::uuid, $2::uuid, 'vendor_profile', 'test', 'low')`,
            uuidv7(),
            uuidv7(),
          ),
        ),
      ).rejects.toThrow(/row-level security/i);

      // staff GUC ⇒ admitted (the harness rolls the probe back)
      await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$executeRawUnsafe(
          `INSERT INTO trust.fraud_signals (id, subject_id, subject_type, signal_type, severity)
           VALUES ($1::uuid, $2::uuid, 'vendor_profile', 'test', 'low')`,
          uuidv7(),
          uuidv7(),
        ),
      );
    });

    it("RLS is ENABLED and the policy is FOR ALL (read + in-band write under the staff GUC)", async () => {
      const enabled = await prisma.$queryRawUnsafe<Array<{ e: boolean }>>(
        `SELECT relrowsecurity AS e FROM pg_class WHERE oid = 'trust.fraud_signals'::regclass`,
      );
      expect(enabled[0]!.e).toBe(true);
      const policies = await prisma.$queryRawUnsafe<Array<{ cmd: string }>>(
        `SELECT cmd FROM pg_policies WHERE schemaname = 'trust' AND tablename = 'fraud_signals'`,
      );
      expect(policies.map((p) => p.cmd)).toEqual(["ALL"]); // FOR ALL — in-band read + write (NO SD)
    });

    it("immutability: state is mutable; identity/creation facts frozen; DELETE blocked", async () => {
      const { id } = await seedOpen();

      // mutable state (superuser direct UPDATE — RLS bypassed; the trigger still fires)
      await prisma.$executeRawUnsafe(
        `UPDATE trust.fraud_signals SET state = 'reviewed' WHERE id = $1::uuid`,
        id,
      );
      expect((await fraudRow(id))?.state).toBe("reviewed");

      // frozen identity/creation facts (cast per column type so the immutability TRIGGER — not a bind
      // type-mismatch — is what rejects each UPDATE; subject_id is uuid, the rest are text).
      for (const [col, cast, val] of [
        ["subject_id", "::uuid", uuidv7()],
        ["subject_type", "", "organization"],
        ["signal_type", "", "other"],
        ["severity", "", "low"],
      ] as const) {
        await expect(
          prisma.$executeRawUnsafe(
            `UPDATE trust.fraud_signals SET ${col} = $2${cast} WHERE id = $1::uuid`,
            id,
            val,
          ),
        ).rejects.toThrow(/is immutable/i);
      }

      // DELETE blocked
      await expect(
        prisma.$executeRawUnsafe(`DELETE FROM trust.fraud_signals WHERE id = $1::uuid`, id),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
      expect(await fraudRow(id)).not.toBeNull();
    });

    it("enum labels are VERBATIM (Doc-6G §3.4)", async () => {
      const rows = await prisma.$queryRawUnsafe<Array<{ labels: string[] }>>(
        `SELECT enum_range(NULL::"trust"."fraud_signal_state")::text[] AS labels`,
      );
      expect(rows[0]!.labels).toEqual(["open", "reviewed", "actioned", "dismissed"]);
    });
  });
});
