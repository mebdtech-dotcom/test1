import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma, type DbExecutor, type Prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import {
  listAdminRatings,
  setAdminRating,
  type AdminRatingStaffContext,
} from "@/modules/trust/contracts";
import { appendAuditRecord } from "@/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-TRUST-5b — the BC-TRUST-5 (Part B) Admin Rating aggregate (Doc-4G §G8.4/§G8.5; Doc-6G §3.5.1) exercised
// DIRECTLY (the Admin HTTP wiring + the `staff_can_verify`/`staff_super_admin` comp-edge authz + the DG-2
// vendor resolution are DEFERRED). Proves, against a REAL PostgreSQL, the IN-BAND AUDITED-WRITE pattern (NO SD;
// NO event) + the SEPARATE-authority non-disclosure posture (H.9a):
//   • create-or-update the vendor's SINGLETON (advisory-xact-lock; the frozen §3.5.1 has NO UNIQUE) — create,
//     update, stale→CONFLICT, update-no-row→NOT_FOUND, create-over-existing→CONFLICT.
//   • the contract `rating_value`/`rating_note` map to the frozen DB columns `score`/`comment` (asserted).
//   • NON-DISCLOSURE (the crux): the table has ONLY the `admin_ratings_staff FOR ALL` RLS policy — a non-staff
//     (no-GUC) caller sees ZERO rows; a staff caller sees the row; `list_admin_ratings` returns it under staff.
//   • FIREWALL: an admin rating mutates no score/verification/fraud/tier and issues no ban; NO event anywhere.
//   • immutability: score/comment mutable; identity facts frozen; DELETE blocked.
//
// The shared `prisma` connection is superuser (bypasses RLS) — happy paths assert row/audit content; the
// DB-level RLS non-disclosure gate is proven through the Doc-8B §5 restricted-role backstop (`ivendorz_test_rls`,
// NOBYPASSRLS). admin_ratings is DELETE-blocked (immutable trigger) + append-only, so every test uses FRESH
// FULL uuids (never sliced) — rows accumulate but never collide (the house append-only + test-DB-hygiene pattern).

const STAFF_ACTOR = "01920000-0000-7000-8000-00000000fc71"; // fixed admin staff id (Doc-2 §9 attribution)
const STAFF: AdminRatingStaffContext = { staffUserId: STAFF_ACTOR };
const deps = { appendAuditRecord }; // NO writeOutboxEvent — BC-TRUST-5 emits NO event (Doc-4G §H.7)

const readRow = (id: string) => prisma.adminRating.findUnique({ where: { id } });

/** The DB `score` column (`numeric` → Prisma Decimal) mapped to a JS number for assertions. */
const scoreOf = (row: { score: { toNumber(): number } | null } | null): number | null =>
  row == null || row.score === null ? null : row.score.toNumber();

const auditRows = (id: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "admin_rating", entityId: id } });

const auditByAction = (id: string, action: string) =>
  prisma.auditRecord.findMany({ where: { entityType: "admin_rating", entityId: id, action } });

const outboxForAggregate = (aggregateId: string) =>
  prisma.outboxEvent.count({ where: { aggregateId } });

/** Run `fn` inside ONE tx with the platform-staff GUC set (the staff-scoped context the writes/reads require). */
async function inStaffTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    return fn(tx);
  });
}

/** Create a fresh admin rating for a NEW vendor; returns { vendorProfileId, adminRatingId }. */
async function seedCreate(opts?: { ratingValue?: number; ratingNote?: string | null }) {
  const vendorProfileId = uuidv7();
  const outcome = await inStaffTx((tx) =>
    setAdminRating(
      {
        vendorProfileId,
        ratingValue: opts?.ratingValue ?? 7.5,
        ratingNote: opts?.ratingNote ?? "internal: strong technical, weak on lead time",
      },
      STAFF,
      deps,
      tx,
    ),
  );
  if (!outcome.ok) throw new Error(`seedCreate failed: ${outcome.error.errorCode}`);
  return { vendorProfileId, adminRatingId: outcome.result.adminRatingId };
}

describe("W3-TRUST-5b — admin_ratings (Doc-4G §G8.4/§G8.5; internal-only; NO event; NO SD; app-enforced singleton)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── create (Doc-4G §G8.4) ─────────────────────────────────────────────────────
  describe("create", () => {
    it("writes ONE row + ONE admin_rating_set audit (operation:create, Admin); score/comment columns = rating_value/rating_note; rated_by/created_by = staff; NO event", async () => {
      const vendorProfileId = uuidv7();
      const out = await inStaffTx((tx) =>
        setAdminRating(
          { vendorProfileId, ratingValue: 7.5, ratingNote: "internal note" },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(true);
      if (!out.ok) throw new Error("unreachable");
      expect(out.result.operation).toBe("create");
      const id = out.result.adminRatingId;

      const row = await readRow(id);
      expect(row?.vendorProfileId).toBe(vendorProfileId);
      // COLUMN MAPPING (the crux): rating_value → `score`, rating_note → `comment` (Doc-6G §3.5.1).
      expect(scoreOf(row)).toBe(7.5);
      expect(row?.comment).toBe("internal note");
      expect(row?.ratedBy).toBe(STAFF_ACTOR);
      expect(row?.createdBy).toBe(STAFF_ACTOR);
      expect(row?.deletedAt).toBeNull();

      const audit = await auditRows(id);
      expect(audit).toHaveLength(1);
      expect(audit[0]!.action).toBe("admin_rating_set");
      expect(audit[0]!.actorType).toBe("admin");
      expect(audit[0]!.actorId).toBe(STAFF_ACTOR);
      expect(audit[0]!.organizationId).toBeNull();
      expect(audit[0]!.oldValue).toBeNull(); // create leg
      expect(audit[0]!.newValue).toMatchObject({
        operation: "create",
        vendor_profile_id: vendorProfileId,
        score: 7.5,
        comment: "internal note",
      });

      expect(await outboxForAggregate(id)).toBe(0); // NO event (Doc-4G §H.7)
      expect(await outboxForAggregate(vendorProfileId)).toBe(0);
    });

    it("SYNTAX: non-uuid vendor_profile_id / non-finite rating_value → VALIDATION (no row)", async () => {
      const badVendor = await inStaffTx((tx) =>
        setAdminRating({ vendorProfileId: "not-a-uuid", ratingValue: 5 }, STAFF, deps, tx),
      );
      expect(badVendor.ok).toBe(false);
      if (badVendor.ok) throw new Error("unreachable");
      expect(badVendor.error.errorClass).toBe("VALIDATION");
      expect(badVendor.error.errorCode).toBe("trust_admin_rating_invalid_input");

      const vendorProfileId = uuidv7();
      const badScore = await inStaffTx((tx) =>
        setAdminRating({ vendorProfileId, ratingValue: Number.POSITIVE_INFINITY }, STAFF, deps, tx),
      );
      expect(badScore.ok).toBe(false);
      if (badScore.ok) throw new Error("unreachable");
      expect(badScore.error.errorClass).toBe("VALIDATION");
      expect(await prisma.adminRating.count({ where: { vendorProfileId } })).toBe(0);
    });
  });

  // ── update (Doc-4G §G8.4) ─────────────────────────────────────────────────────
  describe("update", () => {
    it("updates score/comment with the live token → ONE admin_rating_set audit (operation:update, oldValue)", async () => {
      const { vendorProfileId, adminRatingId } = await seedCreate({
        ratingValue: 4,
        ratingNote: "first",
      });
      const token = (await readRow(adminRatingId))!.updatedAt;
      const out = await inStaffTx((tx) =>
        setAdminRating(
          { vendorProfileId, expectedRevision: token, ratingValue: 9, ratingNote: "revised" },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(true);
      if (!out.ok) throw new Error("unreachable");
      expect(out.result.operation).toBe("update");
      expect(out.result.adminRatingId).toBe(adminRatingId); // same singleton row

      const row = await readRow(adminRatingId);
      expect(scoreOf(row)).toBe(9);
      expect(row?.comment).toBe("revised");

      const setAudits = await auditByAction(adminRatingId, "admin_rating_set");
      expect(setAudits).toHaveLength(2); // create + update
      const update = setAudits.find(
        (a) => (a.newValue as { operation?: string }).operation === "update",
      );
      expect(update?.oldValue).toMatchObject({ score: 4, comment: "first" });
      expect(update?.newValue).toMatchObject({ operation: "update", score: 9, comment: "revised" });
    });

    it("stale expected_revision → CONFLICT (no change)", async () => {
      const { vendorProfileId, adminRatingId } = await seedCreate();
      const out = await inStaffTx((tx) =>
        setAdminRating(
          { vendorProfileId, expectedRevision: new Date(0), ratingValue: 1 },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(false);
      if (out.ok) throw new Error("unreachable");
      expect(out.error.errorClass).toBe("CONFLICT");
      expect(out.error.errorCode).toBe("trust_admin_rating_conflict");
      // unchanged (still the seed value 7.5)
      expect(scoreOf(await readRow(adminRatingId))).toBe(7.5);
    });

    it("update when NO live row exists → NOT_FOUND", async () => {
      const out = await inStaffTx((tx) =>
        setAdminRating(
          { vendorProfileId: uuidv7(), expectedRevision: new Date(), ratingValue: 5 },
          STAFF,
          deps,
          tx,
        ),
      );
      expect(out.ok).toBe(false);
      if (out.ok) throw new Error("unreachable");
      expect(out.error.errorClass).toBe("NOT_FOUND");
      expect(out.error.errorCode).toBe("trust_admin_rating_not_found");
    });
  });

  // ── create-over-existing (the interpretive OBS) ───────────────────────────────
  describe("create-over-existing", () => {
    it("a create (no expected_revision) over an existing live rating → CONFLICT (no 2nd row)", async () => {
      const { vendorProfileId } = await seedCreate();
      const out = await inStaffTx((tx) =>
        setAdminRating({ vendorProfileId, ratingValue: 2 }, STAFF, deps, tx),
      );
      expect(out.ok).toBe(false);
      if (out.ok) throw new Error("unreachable");
      expect(out.error.errorClass).toBe("CONFLICT");
      expect(out.error.errorCode).toBe("trust_admin_rating_conflict");
      // still exactly ONE row for the vendor (the app-enforced singleton).
      expect(await prisma.adminRating.count({ where: { vendorProfileId } })).toBe(1);
    });
  });

  // ── FIREWALL (Doc-4G §H.9b; Invariant #6) ─────────────────────────────────────
  describe("firewall: internal signal only; no score/verification/fraud/tier; no event", () => {
    it("after set_admin_rating, NO write to trust_scores/performance_scores/verification_records/verified_financial_tiers/fraud_signals; NO event", async () => {
      const { vendorProfileId, adminRatingId } = await seedCreate();

      expect(await prisma.trustScore.count({ where: { vendorProfileId } })).toBe(0);
      expect(await prisma.performanceScore.count({ where: { vendorProfileId } })).toBe(0);
      expect(await prisma.verificationRecord.count({ where: { subjectId: vendorProfileId } })).toBe(
        0,
      );
      expect(await prisma.verifiedFinancialTier.count({ where: { vendorProfileId } })).toBe(0);
      expect(await prisma.fraudSignal.count({ where: { subjectId: vendorProfileId } })).toBe(0);

      // NO event, and NO AdminRating event was EVER coined in the whole outbox (Doc-4G §H.7).
      expect(await outboxForAggregate(adminRatingId)).toBe(0);
      expect(await outboxForAggregate(vendorProfileId)).toBe(0);
      expect(
        await prisma.outboxEvent.count({ where: { eventName: { contains: "AdminRating" } } }),
      ).toBe(0);
    });
  });

  // ── NON-DISCLOSURE / RLS (the crux — F4G-PB5-M3; Doc-8B §5 restricted-role backstop) ──
  describe("non-disclosure: staff-only RLS", () => {
    beforeAll(async () => {
      await ensureRestrictedRlsRole();
      await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA trust TO ${RESTRICTED_RLS_ROLE}`);
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT, UPDATE ON trust.admin_ratings TO ${RESTRICTED_RLS_ROLE}`,
      );
    });

    it("a NON-staff (no-GUC) SELECT sees ZERO rows; a staff-GUC SELECT sees the row", async () => {
      const { vendorProfileId } = await seedCreate();

      const noCtx = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ n: number }>>(
          `SELECT count(*)::int AS n FROM trust.admin_ratings WHERE vendor_profile_id = $1::uuid`,
          vendorProfileId,
        ),
      );
      expect(noCtx[0]!.n).toBe(0); // RLS fail-closed — non-staff learns nothing

      const staff = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM trust.admin_ratings WHERE vendor_profile_id = $1::uuid`,
          vendorProfileId,
        ),
      );
      expect(staff).toHaveLength(1);
    });

    it("list_admin_ratings returns the vendor's rating under staff scope; an EMPTY page under a non-staff (no-GUC) tx", async () => {
      const { vendorProfileId, adminRatingId } = await seedCreate({
        ratingValue: 6,
        ratingNote: "note-x",
      });

      const staffList = await inStaffTx((tx) => listAdminRatings({ vendorProfileId }, tx));
      expect(staffList.ok).toBe(true);
      if (!staffList.ok) throw new Error("unreachable");
      expect(staffList.result.adminRatings).toHaveLength(1);
      expect(staffList.result.adminRatings[0]!.adminRatingId).toBe(adminRatingId);
      expect(staffList.result.adminRatings[0]!.score).toBe(6);
      expect(staffList.result.adminRatings[0]!.comment).toBe("note-x");
      expect(staffList.result.adminRatings[0]!.ratedBy).toBe(STAFF_ACTOR);

      // non-disclosure at the service level: under a non-staff (no-GUC) tx the RLS yields an EMPTY page.
      const publicList = await asRestrictedRole({}, (tx) =>
        listAdminRatings({ vendorProfileId }, tx as unknown as DbExecutor),
      );
      expect(publicList.ok).toBe(true);
      if (!publicList.ok) throw new Error("unreachable");
      expect(publicList.result.adminRatings).toHaveLength(0);
    });

    it("list_admin_ratings: non-uuid vendor_profile_id → VALIDATION", async () => {
      const out = await listAdminRatings({ vendorProfileId: "not-a-uuid" }, prisma);
      expect(out.ok).toBe(false);
      if (out.ok) throw new Error("unreachable");
      expect(out.error.errorClass).toBe("VALIDATION");
    });
  });

  // ── substrate: RLS shape / immutability ───────────────────────────────────────
  describe("substrate: RLS shape / immutability", () => {
    it("RLS is ENABLED and EXACTLY ONE policy exists: admin_ratings_staff (NO public/author/tenant — the non-disclosure contrast with public_reviews)", async () => {
      const enabled = await prisma.$queryRawUnsafe<Array<{ e: boolean }>>(
        `SELECT relrowsecurity AS e FROM pg_class WHERE oid = 'trust.admin_ratings'::regclass`,
      );
      expect(enabled[0]!.e).toBe(true);
      const policies = await prisma.$queryRawUnsafe<Array<{ policyname: string; cmd: string }>>(
        `SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'trust' AND tablename = 'admin_ratings'`,
      );
      expect(policies).toHaveLength(1);
      expect(policies[0]!.policyname).toBe("admin_ratings_staff");
      expect(policies[0]!.cmd).toBe("ALL");
    });

    it("the frozen Doc-6G §6 partial index exists: admin_ratings_vendor_live_idx WHERE deleted_at IS NULL (SD + Band-H cursor sort-key)", async () => {
      const rows = await prisma.$queryRawUnsafe<Array<{ indexdef: string }>>(
        `SELECT indexdef FROM pg_indexes WHERE schemaname = 'trust' AND tablename = 'admin_ratings' AND indexname = 'admin_ratings_vendor_live_idx'`,
      );
      expect(rows).toHaveLength(1);
      // partial (Doc-6G §6 `WHERE deleted_at IS NULL`) over the live singleton + keyset sort-key.
      expect(rows[0]!.indexdef).toMatch(/WHERE \(deleted_at IS NULL\)/);
      expect(rows[0]!.indexdef).toContain("vendor_profile_id");
    });

    it("immutability: score/comment mutable; id/vendor_profile_id/created_at/created_by frozen; DELETE blocked", async () => {
      const { adminRatingId: id } = await seedCreate();

      // mutable rating/note (superuser direct UPDATE — RLS bypassed; the trigger permits these columns).
      await prisma.$executeRawUnsafe(
        `UPDATE trust.admin_ratings SET score = 3.14, comment = 'edited' WHERE id = $1::uuid`,
        id,
      );
      const row = await readRow(id);
      expect(scoreOf(row)).toBe(3.14);
      expect(row?.comment).toBe("edited");

      // frozen identity facts (cast per column type so the immutability TRIGGER — not a bind mismatch — rejects).
      for (const [col, cast, val] of [
        ["vendor_profile_id", "::uuid", uuidv7()],
        ["created_by", "::uuid", uuidv7()],
        ["created_at", "::timestamptz", "2020-01-01T00:00:00Z"],
      ] as const) {
        await expect(
          prisma.$executeRawUnsafe(
            `UPDATE trust.admin_ratings SET ${col} = $2${cast} WHERE id = $1::uuid`,
            id,
            val,
          ),
        ).rejects.toThrow(/is immutable/i);
      }

      // DELETE blocked (SD=YES; append-only).
      await expect(
        prisma.$executeRawUnsafe(`DELETE FROM trust.admin_ratings WHERE id = $1::uuid`, id),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
      expect(await readRow(id)).not.toBeNull();
    });
  });
});
