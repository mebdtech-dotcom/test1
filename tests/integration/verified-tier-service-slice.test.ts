import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma, type Prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import {
  confirmVerifiedTier,
  downgradeVerifiedTier,
  establishVerifiedTier,
  expireVerifiedTier,
  suspendVerifiedTier,
} from "@/modules/trust/contracts";
import { appendAuditRecord, writeOutboxEvent } from "@/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-TRUST-3 (Part B) — the `verified_financial_tiers` write-service (Doc-4G §G4.6/§G4.7; Doc-6G §3.1.3),
// exercised DIRECTLY (the admin HTTP commands + System expire timer are DEFERRED). Proves, against a REAL
// PostgreSQL, the codebase's FIRST §8 emission and the load-bearing WRITE-PLUS-EMIT-PLUS-AUDIT ATOMICITY
// (Doc-8F): for each of set/confirm/downgrade/suspend/expire the SD tier write + exactly ONE pending
// `VendorTierChanged` outbox row + exactly ONE `verified_tier_*` audit row all commit on ONE tx; the UNIQUE
// / STATE / CONFLICT / BUSINESS guards; the expire no-op; emit-failure AND audit-failure each roll the WHOLE
// tx back; RLS admin-read + no-in-band-write + immutability + DELETE-blocked + the FULL unique; enum labels.
//
// The shared `prisma` connection is superuser (bypasses RLS) — happy paths assert row/event/audit content;
// the DB-level RLS/SD gates are proven through the Doc-8B §5 restricted-role backstop (`ivendorz_test_rls`,
// NOBYPASSRLS). verified_financial_tiers is DELETE-blocked (immutable trigger) + UNIQUE per vendor, so every
// test uses a FRESH `uuidv7()` vendor id — rows accumulate but never collide (the house append-only pattern).

const ADMIN_ACTOR = "01920000-0000-7000-8000-00000000ad31"; // fixed admin staff id (Doc-2 §9 attribution)
const deps = { appendAuditRecord, writeOutboxEvent };

interface OutboxPayload {
  tierType: string;
  vendorProfileId: string;
  oldTier: string | null;
  newTier: string;
}

/** Run `fn` inside ONE tx with the platform-staff GUC set (the Admin/System actor context the outbox INSERT
 *  + audit append require). The service does read + SD write + emit + audit on this single tx. */
async function inStaffTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    return fn(tx);
  });
}

const tierRow = (vendorProfileId: string) =>
  prisma.verifiedFinancialTier.findUnique({ where: { vendorProfileId } });

const outboxRows = (aggregateId: string) =>
  prisma.outboxEvent.findMany({ where: { aggregateId, eventName: "VendorTierChanged" } });

const auditRows = (entityId: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "verified_financial_tier", entityId } });

const auditByAction = (entityId: string, action: string) =>
  prisma.auditRecord.findMany({
    where: { entityType: "verified_financial_tier", entityId, action },
  });

const payloadOf = (row: { payloadJsonb: unknown }) => row.payloadJsonb as unknown as OutboxPayload;

/** Seed one APPROVED tier verification_records row (the §G4.6 stage-8 basis) for `vendorProfileId` — subject
 *  IS the vendor (`subject_type='vendor_profile'`, `verification_type='tier'`, `state='approved'`). Superuser
 *  create bypasses RLS; state is set directly at insert (the immutability trigger only guards UPDATE/DELETE).
 *  Returns the verification_records id to pass as `verificationRecordId`. */
async function seedApprovedTierBasis(
  vendorProfileId: string,
  overrides: Partial<{
    subjectId: string;
    subjectType: "vendor_profile" | "organization" | "capacity" | "declared_tier";
    verificationType: "tier" | "business" | "contact" | "factory" | "organization" | "capacity";
    state: "requested" | "in_review" | "approved" | "rejected" | "expired" | "revoked";
  }> = {},
): Promise<string> {
  const id = uuidv7();
  await prisma.verificationRecord.create({
    data: {
      id,
      subjectId: overrides.subjectId ?? vendorProfileId,
      subjectType: overrides.subjectType ?? "vendor_profile",
      verificationType: overrides.verificationType ?? "tier",
      state: overrides.state ?? "approved",
    },
  });
  return id;
}

/** Establish a fresh verified tier (with a seeded approved basis, staff tx) → {vendorProfileId, rowId, result}. */
async function seedVerified(tier: "A" | "B" | "C" | "D" | "E" = "A") {
  const vendorProfileId = uuidv7();
  const verificationRecordId = await seedApprovedTierBasis(vendorProfileId);
  const outcome = await inStaffTx((tx) =>
    establishVerifiedTier(
      { vendorProfileId, verificationRecordId, tier },
      { actorId: ADMIN_ACTOR },
      deps,
      tx,
    ),
  );
  if (!outcome.ok) throw new Error(`seedVerified failed: ${outcome.error.errorCode}`);
  return { vendorProfileId, rowId: outcome.result.verifiedFinancialTierId, result: outcome.result };
}

describe("W3-TRUST-3 (Part B) — verified_financial_tiers write-service (Doc-4G §G4.6/§G4.7)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── set / establish (Doc-4G §G4.6) ──────────────────────────────────────────
  describe("set (establish)", () => {
    it("HAPPY: writes a verified row + ONE pending VendorTierChanged + ONE verified_tier_set audit (atomic)", async () => {
      const vendorProfileId = uuidv7();
      const verificationRecordId = await seedApprovedTierBasis(vendorProfileId);
      const outcome = await inStaffTx((tx) =>
        establishVerifiedTier(
          { vendorProfileId, verificationRecordId, tier: "B", basisJsonb: { source: "test" } },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );

      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      const rowId = outcome.result.verifiedFinancialTierId;
      expect(outcome.result.status).toBe("verified");
      expect(outcome.result.tier).toBe("B");
      expect(outcome.result.applied).toBe(true);
      expect(outcome.result.nextReviewAt).not.toBeNull();

      // tier row
      const row = await tierRow(vendorProfileId);
      expect(row?.status).toBe("verified");
      expect(row?.tier).toBe("B");
      expect(row?.verifiedAt).not.toBeNull();
      expect(row?.nextReviewAt).not.toBeNull();
      expect(row?.createdBy).toBe(ADMIN_ACTOR);
      expect(row?.updatedBy).toBe(ADMIN_ACTOR);
      expect(row?.basisJsonb).toMatchObject({ source: "test" });

      // exactly ONE pending VendorTierChanged (v1) with the thin payload
      const events = await outboxRows(vendorProfileId);
      expect(events).toHaveLength(1);
      expect(events[0]!.status).toBe("pending");
      expect(events[0]!.eventVersion).toBe(1);
      expect(events[0]!.aggregateId).toBe(vendorProfileId);
      expect(payloadOf(events[0]!)).toMatchObject({
        tierType: "verified",
        vendorProfileId,
        oldTier: null,
        newTier: "B",
      });

      // exactly ONE audit row, verified_tier_set, Admin attribution
      const audit = await auditRows(rowId);
      expect(audit).toHaveLength(1);
      expect(audit[0]!.action).toBe("verified_tier_set");
      expect(audit[0]!.actorType).toBe("admin");
      expect(audit[0]!.actorId).toBe(ADMIN_ACTOR);
      expect(audit[0]!.organizationId).toBeNull();
      expect(audit[0]!.oldValue).toBeNull();
      expect(audit[0]!.newValue).toMatchObject({ tier: "B", status: "verified" });
    });

    it("UNIQUE: a second set for the same vendor → BUSINESS, still one row / one event / one audit", async () => {
      const { vendorProfileId, rowId } = await seedVerified("C");
      const verificationRecordId = await seedApprovedTierBasis(vendorProfileId); // a fresh valid basis

      const second = await inStaffTx((tx) =>
        establishVerifiedTier(
          { vendorProfileId, verificationRecordId, tier: "D" },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );
      expect(second.ok).toBe(false);
      if (second.ok) throw new Error("unreachable");
      expect(second.error.errorClass).toBe("BUSINESS");
      expect(second.error.errorCode).toBe("trust_verified_tier_already_exists");

      expect(await outboxRows(vendorProfileId)).toHaveLength(1); // no second event
      expect(await auditRows(rowId)).toHaveLength(1); // no second audit
      const row = await tierRow(vendorProfileId);
      expect(row?.tier).toBe("C"); // unchanged (the second set inserted nothing)
    });

    it("SYNTAX: a non-uuid vendor_profile_id → VALIDATION (no write)", async () => {
      const outcome = await inStaffTx((tx) =>
        establishVerifiedTier(
          { vendorProfileId: "not-a-uuid", verificationRecordId: uuidv7(), tier: "A" },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("VALIDATION");
      expect(outcome.error.errorCode).toBe("trust_verified_tier_invalid_input");
    });

    it("SYNTAX: a missing / malformed verification_record_id → VALIDATION (no write)", async () => {
      for (const bad of [undefined as unknown as string, "not-a-uuid"]) {
        const vendorProfileId = uuidv7();
        const outcome = await inStaffTx((tx) =>
          establishVerifiedTier(
            { vendorProfileId, verificationRecordId: bad, tier: "A" },
            { actorId: ADMIN_ACTOR },
            deps,
            tx,
          ),
        );
        expect(outcome.ok).toBe(false);
        if (outcome.ok) throw new Error("unreachable");
        expect(outcome.error.errorClass).toBe("VALIDATION");
        expect(outcome.error.errorCode).toBe("trust_verified_tier_invalid_input");
        expect(await tierRow(vendorProfileId)).toBeNull();
      }
    });

    it("BUSINESS basis (Review-B MAJOR): non-existent / non-approved / wrong-type / wrong-subject → invalid_basis, no row/event/audit", async () => {
      const auditSetBefore = await prisma.auditRecord.count({
        where: { entityType: "verified_financial_tier", action: "verified_tier_set" },
      });

      const cases: Array<{ label: string; verificationRecordId: (v: string) => Promise<string> }> =
        [
          // non-existent basis
          { label: "non-existent", verificationRecordId: async () => uuidv7() },
          // exists but state != approved
          {
            label: "non-approved",
            verificationRecordId: (v) => seedApprovedTierBasis(v, { state: "in_review" }),
          },
          // exists, approved, but verification_type != tier
          {
            label: "wrong-type",
            verificationRecordId: (v) => seedApprovedTierBasis(v, { verificationType: "business" }),
          },
          // exists, approved tier, but the subject is a DIFFERENT vendor (wrong subject_id)
          {
            label: "wrong-subject",
            verificationRecordId: (v) => seedApprovedTierBasis(v, { subjectId: uuidv7() }),
          },
          // exists, approved tier, but subject_type != vendor_profile
          {
            label: "wrong-subject-type",
            verificationRecordId: (v) => seedApprovedTierBasis(v, { subjectType: "organization" }),
          },
        ];

      for (const c of cases) {
        const vendorProfileId = uuidv7();
        const verificationRecordId = await c.verificationRecordId(vendorProfileId);
        const outcome = await inStaffTx((tx) =>
          establishVerifiedTier(
            { vendorProfileId, verificationRecordId, tier: "A" },
            { actorId: ADMIN_ACTOR },
            deps,
            tx,
          ),
        );
        expect(outcome.ok, `case ${c.label}`).toBe(false);
        if (outcome.ok) throw new Error("unreachable");
        expect(outcome.error.errorClass, `case ${c.label}`).toBe("BUSINESS");
        expect(outcome.error.errorCode, `case ${c.label}`).toBe(
          "trust_verified_tier_invalid_basis",
        );
        expect(await tierRow(vendorProfileId), `case ${c.label}`).toBeNull(); // no tier row
        expect(await outboxRows(vendorProfileId), `case ${c.label}`).toHaveLength(0); // no event
      }
      // no verified_tier_set audit was appended across any rejected basis
      expect(
        await prisma.auditRecord.count({
          where: { entityType: "verified_financial_tier", action: "verified_tier_set" },
        }),
      ).toBe(auditSetBefore);
    });
  });

  // ── confirm (Doc-4G §G4.6) ───────────────────────────────────────────────────
  describe("confirm", () => {
    it("HAPPY: renews next_review_at, emits VendorTierChanged, appends verified_tier_confirmed (atomic)", async () => {
      const { vendorProfileId, rowId, result } = await seedVerified("A");
      const before = new Date(result.nextReviewAt!).getTime();

      const outcome = await inStaffTx((tx) =>
        confirmVerifiedTier({ vendorProfileId }, { actorId: ADMIN_ACTOR }, deps, tx),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.status).toBe("verified");
      expect(outcome.result.tier).toBe("A");
      // new optimistic token — monotonic (two ms-truncated tokens can tie within the same millisecond).
      expect(new Date(outcome.result.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(result.updatedAt).getTime(),
      );
      expect(new Date(outcome.result.nextReviewAt!).getTime()).toBeGreaterThanOrEqual(before);

      const events = await outboxRows(vendorProfileId);
      expect(events).toHaveLength(2); // set + confirm
      const confirmEvent = events.find((e) => payloadOf(e).oldTier !== null)!;
      expect(payloadOf(confirmEvent)).toMatchObject({ oldTier: "A", newTier: "A" });

      const audit = await auditByAction(rowId, "verified_tier_confirmed");
      expect(audit).toHaveLength(1);
      expect(audit[0]!.actorType).toBe("admin");
    });

    it("optimistic token round-trips: confirm with the establish-returned updatedAt succeeds (ms-truncation)", async () => {
      const { vendorProfileId, result } = await seedVerified("A");
      const outcome = await inStaffTx((tx) =>
        confirmVerifiedTier(
          { vendorProfileId, expectedUpdatedAt: new Date(result.updatedAt) },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(true);
    });

    it("NOT_FOUND: confirm on an absent vendor → NOT_FOUND (no event/audit)", async () => {
      const vendorProfileId = uuidv7();
      const outcome = await inStaffTx((tx) =>
        confirmVerifiedTier({ vendorProfileId }, { actorId: ADMIN_ACTOR }, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("NOT_FOUND");
      expect(await outboxRows(vendorProfileId)).toHaveLength(0);
    });

    it("CONFLICT: a stale expectedUpdatedAt → CONFLICT, no second event/audit", async () => {
      const { vendorProfileId, rowId } = await seedVerified("A");
      const outcome = await inStaffTx((tx) =>
        confirmVerifiedTier(
          { vendorProfileId, expectedUpdatedAt: new Date(0) },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("CONFLICT");
      expect(outcome.error.errorCode).toBe("trust_verified_tier_revision_conflict");
      expect(await outboxRows(vendorProfileId)).toHaveLength(1); // only the set
      expect(await auditRows(rowId)).toHaveLength(1);
    });
  });

  // ── downgrade (Doc-4G §G4.6) ─────────────────────────────────────────────────
  describe("downgrade", () => {
    it("HAPPY: lowers the band, emits VendorTierChanged, appends verified_tier_downgraded", async () => {
      const { vendorProfileId, rowId } = await seedVerified("A");
      const outcome = await inStaffTx((tx) =>
        downgradeVerifiedTier(
          { vendorProfileId, newTier: "C" },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.tier).toBe("C");
      expect(outcome.result.status).toBe("verified");

      const row = await tierRow(vendorProfileId);
      expect(row?.tier).toBe("C");

      const dgEvent = (await outboxRows(vendorProfileId)).find(
        (e) => payloadOf(e).oldTier !== null,
      )!;
      expect(payloadOf(dgEvent)).toMatchObject({ oldTier: "A", newTier: "C" });
      expect(await auditByAction(rowId, "verified_tier_downgraded")).toHaveLength(1);
    });

    it("BUSINESS: a non-lower target tier is rejected (no event/audit)", async () => {
      const { vendorProfileId, rowId } = await seedVerified("C");
      // higher band
      const higher = await inStaffTx((tx) =>
        downgradeVerifiedTier(
          { vendorProfileId, newTier: "A" },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );
      expect(higher.ok).toBe(false);
      if (higher.ok) throw new Error("unreachable");
      expect(higher.error.errorClass).toBe("BUSINESS");
      expect(higher.error.errorCode).toBe("trust_verified_tier_invalid_downgrade");
      // same band
      const same = await inStaffTx((tx) =>
        downgradeVerifiedTier(
          { vendorProfileId, newTier: "C" },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );
      expect(same.ok).toBe(false);

      expect(await outboxRows(vendorProfileId)).toHaveLength(1); // only the set
      expect(await auditRows(rowId)).toHaveLength(1);
    });
  });

  // ── suspend (Doc-4G §G4.7) ───────────────────────────────────────────────────
  describe("suspend", () => {
    it("HAPPY: verified → suspended, emits VendorTierChanged, appends verified_tier_suspended (reason in audit)", async () => {
      const { vendorProfileId, rowId } = await seedVerified("B");
      const outcome = await inStaffTx((tx) =>
        suspendVerifiedTier(
          { vendorProfileId, reason: "compliance hold" },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.status).toBe("suspended");
      expect(outcome.result.tier).toBe("B"); // tier unchanged

      expect((await tierRow(vendorProfileId))?.status).toBe("suspended");
      const spEvent = (await outboxRows(vendorProfileId)).find(
        (e) => payloadOf(e).oldTier !== null,
      )!;
      expect(payloadOf(spEvent)).toMatchObject({ oldTier: "B", newTier: "B" });
      const audit = await auditByAction(rowId, "verified_tier_suspended");
      expect(audit).toHaveLength(1);
      expect(audit[0]!.newValue).toMatchObject({ status: "suspended", reason: "compliance hold" });
    });

    it("BUSINESS: an empty reason → suspend_reason_required (no event/audit)", async () => {
      const { vendorProfileId, rowId } = await seedVerified("B");
      const outcome = await inStaffTx((tx) =>
        suspendVerifiedTier({ vendorProfileId, reason: "  " }, { actorId: ADMIN_ACTOR }, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorCode).toBe("trust_verified_tier_suspend_reason_required");
      expect(await outboxRows(vendorProfileId)).toHaveLength(1);
      expect(await auditRows(rowId)).toHaveLength(1);
    });
  });

  // ── expire (Doc-4G §G4.7; System) ────────────────────────────────────────────
  describe("expire", () => {
    it("HAPPY (due): verified → expired (System attribution), emits VendorTierChanged + verified_tier_expired", async () => {
      const { vendorProfileId, rowId, result } = await seedVerified("D");
      const due = new Date(new Date(result.nextReviewAt!).getTime() + 1000); // just past the review date

      const outcome = await inStaffTx((tx) =>
        expireVerifiedTier({ vendorProfileId, now: due }, deps, tx),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.status).toBe("expired");
      expect(outcome.result.applied).toBe(true);

      expect((await tierRow(vendorProfileId))?.status).toBe("expired");
      const exEvent = (await outboxRows(vendorProfileId)).find(
        (e) => payloadOf(e).oldTier !== null,
      )!;
      expect(payloadOf(exEvent)).toMatchObject({ oldTier: "D", newTier: "D" });
      const audit = await auditByAction(rowId, "verified_tier_expired");
      expect(audit).toHaveLength(1);
      expect(audit[0]!.actorType).toBe("system");
      expect(audit[0]!.actorId).toBeNull();
    });

    it("BUSINESS (not due): review window not reached → review_not_due (no event/audit)", async () => {
      const { vendorProfileId, rowId } = await seedVerified("A");
      const outcome = await inStaffTx((tx) => expireVerifiedTier({ vendorProfileId }, deps, tx));
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorCode).toBe("trust_verified_tier_review_not_due");
      expect(await outboxRows(vendorProfileId)).toHaveLength(1);
      expect(await auditRows(rowId)).toHaveLength(1);
    });

    it("NO-OP: expire on a non-verified (suspended) source is a skip — applied:false, no event/audit", async () => {
      const { vendorProfileId, rowId } = await seedVerified("A");
      await inStaffTx((tx) =>
        suspendVerifiedTier(
          { vendorProfileId, reason: "hold" },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );
      const eventsBefore = (await outboxRows(vendorProfileId)).length; // set + suspend = 2
      const auditBefore = (await auditRows(rowId)).length;

      const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3); // 3 years out
      const outcome = await inStaffTx((tx) =>
        expireVerifiedTier({ vendorProfileId, now: future }, deps, tx),
      );
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      expect(outcome.result.applied).toBe(false);
      expect(outcome.result.status).toBe("suspended");

      expect(await outboxRows(vendorProfileId)).toHaveLength(eventsBefore); // no new event
      expect(await auditRows(rowId)).toHaveLength(auditBefore); // no new audit
      expect(await auditByAction(rowId, "verified_tier_expired")).toHaveLength(0);
    });
  });

  // ── STATE guard (Doc-4G §G4.6/§G4.7) ─────────────────────────────────────────
  describe("STATE guard", () => {
    it("confirm on a suspended source → STATE (illegal), no event/audit", async () => {
      const { vendorProfileId, rowId } = await seedVerified("A");
      await inStaffTx((tx) =>
        suspendVerifiedTier(
          { vendorProfileId, reason: "hold" },
          { actorId: ADMIN_ACTOR },
          deps,
          tx,
        ),
      );
      const eventsBefore = (await outboxRows(vendorProfileId)).length;
      const auditBefore = (await auditRows(rowId)).length;

      const outcome = await inStaffTx((tx) =>
        confirmVerifiedTier({ vendorProfileId }, { actorId: ADMIN_ACTOR }, deps, tx),
      );
      expect(outcome.ok).toBe(false);
      if (outcome.ok) throw new Error("unreachable");
      expect(outcome.error.errorClass).toBe("STATE");
      expect(outcome.error.errorCode).toBe("trust_verified_tier_illegal_state");
      expect(await outboxRows(vendorProfileId)).toHaveLength(eventsBefore);
      expect(await auditRows(rowId)).toHaveLength(auditBefore);
    });
  });

  // ── ATOMICITY — emit-failure AND audit-failure each roll back the whole tx (Doc-8F) ──────────
  describe("write-plus-emit-plus-audit atomicity (Doc-8F)", () => {
    it("EMIT failure rolls back the SD tier write (no row, no event, no audit)", async () => {
      const vendorProfileId = uuidv7();
      const verificationRecordId = await seedApprovedTierBasis(vendorProfileId);
      const failingEmit = (() =>
        Promise.reject(new Error("emit failed (injected)"))) as typeof writeOutboxEvent;

      // No `verified_tier_set` audit may be appended (audit is step 4, after the failed emit at step 3).
      const auditSetBefore = await prisma.auditRecord.count({
        where: { entityType: "verified_financial_tier", action: "verified_tier_set" },
      });

      await expect(
        inStaffTx((tx) =>
          establishVerifiedTier(
            { vendorProfileId, verificationRecordId, tier: "A" },
            { actorId: ADMIN_ACTOR },
            { appendAuditRecord, writeOutboxEvent: failingEmit },
            tx,
          ),
        ),
      ).rejects.toThrow(/emit failed/);

      expect(await tierRow(vendorProfileId)).toBeNull();
      expect(await outboxRows(vendorProfileId)).toHaveLength(0);
      expect(
        await prisma.auditRecord.count({
          where: { entityType: "verified_financial_tier", action: "verified_tier_set" },
        }),
      ).toBe(auditSetBefore); // no audit appended
    });

    it("AUDIT failure rolls back the SD tier write AND the emit (no row, no event, no audit)", async () => {
      const vendorProfileId = uuidv7();
      const verificationRecordId = await seedApprovedTierBasis(vendorProfileId);
      const failingAudit = (() =>
        Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;

      await expect(
        inStaffTx((tx) =>
          establishVerifiedTier(
            { vendorProfileId, verificationRecordId, tier: "A" },
            { actorId: ADMIN_ACTOR },
            { appendAuditRecord: failingAudit, writeOutboxEvent },
            tx,
          ),
        ),
      ).rejects.toThrow(/audit append failed/);

      expect(await tierRow(vendorProfileId)).toBeNull(); // SD insert rolled back
      expect(await outboxRows(vendorProfileId)).toHaveLength(0); // emit rolled back
    });
  });

  // ── RLS + SD-bypass + immutability + UNIQUE + enums (Doc-6G §3.1.3 / §3.x) ────────────────────
  describe("substrate: RLS / no-in-band-write / immutability / UNIQUE / enums", () => {
    beforeAll(async () => {
      await ensureRestrictedRlsRole();
      await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA trust TO ${RESTRICTED_RLS_ROLE}`);
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT ON trust.verified_financial_tiers TO ${RESTRICTED_RLS_ROLE}`,
      );
      await prisma.$executeRawUnsafe(
        `GRANT EXECUTE ON FUNCTION trust.establish_verified_tier(uuid, uuid, trust.financial_tier, timestamptz, timestamptz, jsonb, uuid) TO ${RESTRICTED_RLS_ROLE}`,
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
      const { vendorProfileId } = await seedVerified("A");
      const staff = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM trust.verified_financial_tiers WHERE vendor_profile_id = $1::uuid`,
          vendorProfileId,
        ),
      );
      expect(staff).toHaveLength(1);

      const noCtx = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ n: number }>>(
          `SELECT count(*)::int AS n FROM trust.verified_financial_tiers`,
        ),
      );
      expect(noCtx[0]!.n).toBe(0);
    });

    it("NO in-band write path: a direct INSERT is RLS-denied even for a STAFF caller (System-only writes)", async () => {
      for (const gucs of [{}, { isPlatformStaff: true }]) {
        await expect(
          asRestrictedRole(gucs, (tx) =>
            tx.$executeRawUnsafe(
              `INSERT INTO trust.verified_financial_tiers (id, vendor_profile_id, tier, status)
               VALUES ($1::uuid, $2::uuid, 'A', 'verified')`,
              uuidv7(),
              uuidv7(),
            ),
          ),
        ).rejects.toThrow(/row-level security/i);
      }
    });

    it("SD BYPASS: the SECURITY-DEFINER establish function inserts for a NON-staff caller (owner-role bypass)", async () => {
      const freshVendor = uuidv7();
      const rows = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ created: boolean }>>(
          `SELECT created FROM trust.establish_verified_tier(
             $1::uuid, $2::uuid, 'A'::trust.financial_tier, now(), now(), NULL::jsonb, $3::uuid)`,
          uuidv7(),
          freshVendor,
          uuidv7(),
        ),
      );
      expect(rows[0]!.created).toBe(true); // the probe tx is rolled back by the harness
    });

    it("immutability: status is mutable; vendor_profile_id is frozen; DELETE is blocked", async () => {
      const { vendorProfileId } = await seedVerified("A");
      const row = (await tierRow(vendorProfileId))!;

      // mutable status (superuser direct UPDATE — RLS bypassed; the trigger still fires)
      await prisma.$executeRawUnsafe(
        `UPDATE trust.verified_financial_tiers SET status = 'suspended' WHERE id = $1::uuid`,
        row.id,
      );
      expect((await tierRow(vendorProfileId))?.status).toBe("suspended");

      // frozen vendor_profile_id
      await expect(
        prisma.$executeRawUnsafe(
          `UPDATE trust.verified_financial_tiers SET vendor_profile_id = $2::uuid WHERE id = $1::uuid`,
          row.id,
          uuidv7(),
        ),
      ).rejects.toThrow(/is immutable/i);

      // DELETE blocked
      await expect(
        prisma.$executeRawUnsafe(
          `DELETE FROM trust.verified_financial_tiers WHERE id = $1::uuid`,
          row.id,
        ),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
      expect(await tierRow(vendorProfileId)).not.toBeNull();
    });

    it("FULL UNIQUE(vendor_profile_id): a second row for the same vendor is rejected", async () => {
      const { vendorProfileId } = await seedVerified("A");
      await expect(
        prisma.verifiedFinancialTier.create({
          data: { id: uuidv7(), vendorProfileId, tier: "B", status: "verified" },
        }),
      ).rejects.toThrow(/unique|verified_financial_tiers_vendor_uq/i);
    });

    it("enum labels are VERBATIM (Doc-6G §3.1.3)", async () => {
      const enums: ReadonlyArray<readonly [string, readonly string[]]> = [
        ["financial_tier", ["A", "B", "C", "D", "E"]],
        ["verified_tier_status", ["pending_verification", "verified", "suspended", "expired"]],
      ];
      for (const [name, labels] of enums) {
        const rows = await prisma.$queryRawUnsafe<Array<{ labels: string[] }>>(
          `SELECT enum_range(NULL::"trust"."${name}")::text[] AS labels`,
        );
        expect(rows[0]!.labels).toEqual([...labels]);
      }
    });

    it("RLS is ENABLED and there is NO write policy (only the SELECT read policy)", async () => {
      const enabled = await prisma.$queryRawUnsafe<Array<{ e: boolean }>>(
        `SELECT relrowsecurity AS e FROM pg_class WHERE oid = 'trust.verified_financial_tiers'::regclass`,
      );
      expect(enabled[0]!.e).toBe(true);
      const policies = await prisma.$queryRawUnsafe<Array<{ cmd: string }>>(
        `SELECT cmd FROM pg_policies WHERE schemaname = 'trust' AND tablename = 'verified_financial_tiers'`,
      );
      expect(policies.map((p) => p.cmd)).toEqual(["SELECT"]); // read only; no INSERT/UPDATE/DELETE policy
    });
  });
});
