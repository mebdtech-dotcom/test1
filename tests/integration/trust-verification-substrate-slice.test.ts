import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-TRUST-1 — the BC-TRUST-1 Verification substrate realized by
// `prisma/migrations/20260711160000_trust_verification_substrate/migration.sql` (Doc-6G §3.1.1 /
// §3.1.2 / §3.x). Substrate-only conformance (NO endpoint / contract / command in this WP): the 4
// enums + 2 tables exist; the platform-internal RLS fails closed off the `app.is_platform_staff`
// backstop; `verification_records` is column-scoped immutable (state/expires_at/evidence mutable;
// subject/type/identity frozen; DELETE blocked); `verification_decisions` is fully append-only
// (every column immutable; DELETE blocked); `state` defaults to `requested`.
//
// RLS is asserted through the same Doc-8B §5 DB-role-switch backstop as
// `rls-identity-authz-tables` / `rls-buyer-profiles-byte-equivalence`: the restricted role
// `ivendorz_test_rls` (NOBYPASSRLS, non-owner) so the DB POLICY itself is proven, never a superuser
// false-pass. The shared harness `ensureRestrictedRlsRole` grants only `core`/`identity`; this suite
// additionally grants the `trust` schema + the two verification tables to that same role (below).
//
// Immutability/existence assertions run on the elevated (superuser) connection — triggers and
// catalog reads fire regardless of role (the same posture as `core-cr4-immutability-triggers`).
// verification_records / verification_decisions are append-only (DELETE trigger-blocked), so seeds
// accumulate by design; a fresh `uuidv7()` id per seed guarantees no cross-run PK collision (the
// house pattern for the other append-only fixtures — audit_records / outbox_events / id_sequences).

interface CountRow {
  n: number;
}

// Committed fixtures (fresh per run — append-only tables cannot be torn down by DELETE).
const SEED_RECORD_ID = uuidv7();
const SEED_RECORD_SUBJECT = uuidv7();
const SEED_DECISION_ID = uuidv7();

/** The four frozen `trust` enums and their VERBATIM label sets (Doc-6G §3.1.1 / §3.1.2), in
 *  definition order — the oracle for the label-completeness assertion. */
const TRUST_ENUMS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ["verification_subject_type", ["vendor_profile", "organization", "capacity", "declared_tier"]],
  ["verification_type", ["contact", "business", "factory", "organization", "tier", "capacity"]],
  ["verification_state", ["requested", "in_review", "approved", "rejected", "expired", "revoked"]],
  ["verification_decision", ["approve", "reject", "confirm", "downgrade", "request_info"]],
];

/** Grant the restricted RLS role the minimal privileges to prove the `trust` policies at the DB
 *  level. `ensureRestrictedRlsRole` (idempotent) provisions the role + its core/identity grants;
 *  the `trust` USAGE + full-CRUD grants are added here (full CRUD so a fail-closed 0-rows / a
 *  WITH CHECK rejection is observed, never a bare `permission denied for table` false-pass). */
async function grantTrustToRestrictedRole(): Promise<void> {
  await ensureRestrictedRlsRole();
  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA trust TO ${RESTRICTED_RLS_ROLE}`);
  await prisma.$executeRawUnsafe(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON trust.verification_records, trust.verification_decisions TO ${RESTRICTED_RLS_ROLE}`,
  );
}

/** Seed one committed verification_records row (superuser connection bypasses RLS). Returns its id. */
async function seedRecord(): Promise<string> {
  const id = uuidv7();
  await prisma.verificationRecord.create({
    data: {
      id,
      subjectId: uuidv7(),
      subjectType: "vendor_profile",
      verificationType: "business",
    },
  });
  return id;
}

/** Seed one committed verification_decisions row (with its FK parent record). Returns the decision id. */
async function seedDecision(): Promise<string> {
  const recordId = await seedRecord();
  const id = uuidv7();
  await prisma.verificationDecision.create({
    data: { id, verificationRecordId: recordId, decision: "approve" },
  });
  return id;
}

describe("W3-TRUST-1 — trust verification substrate (Doc-6G §3.1)", () => {
  beforeAll(async () => {
    await grantTrustToRestrictedRole();
    // Committed fixtures for the RLS read/insert assertions (a decision needs its FK parent record).
    await prisma.verificationRecord.create({
      data: {
        id: SEED_RECORD_ID,
        subjectId: SEED_RECORD_SUBJECT,
        subjectType: "vendor_profile",
        verificationType: "business",
      },
    });
    await prisma.verificationDecision.create({
      data: { id: SEED_DECISION_ID, verificationRecordId: SEED_RECORD_ID, decision: "approve" },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── Existence & enums (Doc-6G §3.1) ──────────────────────────────────────────

  describe("existence & enums", () => {
    it("both verification tables exist in the trust schema", async () => {
      const rows = await prisma.$queryRawUnsafe<
        Array<{ records: string | null; decisions: string | null }>
      >(
        `SELECT to_regclass('trust.verification_records')::text AS records,
                to_regclass('trust.verification_decisions')::text AS decisions`,
      );
      expect(rows[0]!.records).toBe("trust.verification_records");
      expect(rows[0]!.decisions).toBe("trust.verification_decisions");
    });

    it("all 4 trust enums exist", async () => {
      const rows = await prisma.$queryRawUnsafe<Array<{ typname: string }>>(
        `SELECT t.typname
           FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'trust' AND t.typtype = 'e'`,
      );
      const names = rows.map((r) => r.typname);
      expect(names).toEqual(expect.arrayContaining(TRUST_ENUMS.map(([name]) => name)));
    });

    it("each trust enum carries the frozen label set VERBATIM, in definition order (Doc-6G §3.1)", async () => {
      for (const [name, labels] of TRUST_ENUMS) {
        const rows = await prisma.$queryRawUnsafe<Array<{ labels: string[] }>>(
          `SELECT enum_range(NULL::"trust"."${name}")::text[] AS labels`,
        );
        expect(rows[0]!.labels).toEqual([...labels]);
      }
    });

    it("RLS is ENABLED on both verification tables", async () => {
      for (const table of ["verification_records", "verification_decisions"]) {
        const rows = await prisma.$queryRawUnsafe<Array<{ enabled: boolean }>>(
          `SELECT relrowsecurity AS enabled FROM pg_class WHERE oid = 'trust.${table}'::regclass`,
        );
        expect(rows[0]!.enabled).toBe(true);
      }
    });

    it("state DEFAULTS to 'requested' on insert (no explicit state — Doc-6G §3.1.1)", async () => {
      const id = uuidv7();
      const row = await prisma.verificationRecord.create({
        data: { id, subjectId: uuidv7(), subjectType: "capacity", verificationType: "capacity" },
      });
      expect(row.state).toBe("requested");
    });
  });

  // ── RLS: staff-only FOR ALL, DB-role backstop (Doc-6G §3.x) ──────────────────

  describe("RLS — staff-only FOR ALL (DB-role backstop, fail-closed)", () => {
    it("meta: the restricted role is NON-privileged (RLS enforces against it — no false-pass)", async () => {
      const attrs = await prisma.$queryRawUnsafe<
        Array<{ rolsuper: boolean; rolbypassrls: boolean }>
      >(`SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = '${RESTRICTED_RLS_ROLE}'`);
      expect(attrs[0]!.rolsuper).toBe(false);
      expect(attrs[0]!.rolbypassrls).toBe(false);
    });

    describe("verification_records", () => {
      it("POSITIVE: a STAFF caller SELECTs the seeded row", async () => {
        const rows = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
          tx.$queryRawUnsafe<Array<{ id: string }>>(
            `SELECT id FROM trust.verification_records WHERE id = $1::uuid`,
            SEED_RECORD_ID,
          ),
        );
        expect(rows).toHaveLength(1);
      });

      it("NEGATIVE (fail-closed): NO staff GUC ⇒ zero rows visible", async () => {
        const rows = await asRestrictedRole({}, (tx) =>
          tx.$queryRawUnsafe<CountRow[]>(
            `SELECT count(*)::int AS n FROM trust.verification_records`,
          ),
        );
        expect(rows[0]!.n).toBe(0);
      });

      it("WRITE (INSERT) by a NON-staff caller is REJECTED (WITH CHECK fails)", async () => {
        await expect(
          asRestrictedRole({}, (tx) =>
            tx.$executeRawUnsafe(
              `INSERT INTO trust.verification_records (id, subject_id, subject_type, verification_type)
               VALUES ($1::uuid, $2::uuid, 'organization', 'organization')`,
              uuidv7(),
              uuidv7(),
            ),
          ),
        ).rejects.toThrow(/row-level security/i);
      });

      it("WRITE (INSERT) by a STAFF caller is ADMITTED", async () => {
        await expect(
          asRestrictedRole({ isPlatformStaff: true }, (tx) =>
            tx.$executeRawUnsafe(
              `INSERT INTO trust.verification_records (id, subject_id, subject_type, verification_type)
               VALUES ($1::uuid, $2::uuid, 'organization', 'organization')`,
              uuidv7(),
              uuidv7(),
            ),
          ),
        ).resolves.toBe(1);
      });
    });

    describe("verification_decisions", () => {
      it("POSITIVE: a STAFF caller SELECTs the seeded decision", async () => {
        const rows = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
          tx.$queryRawUnsafe<Array<{ id: string }>>(
            `SELECT id FROM trust.verification_decisions WHERE id = $1::uuid`,
            SEED_DECISION_ID,
          ),
        );
        expect(rows).toHaveLength(1);
      });

      it("NEGATIVE (fail-closed): NO staff GUC ⇒ zero rows visible", async () => {
        const rows = await asRestrictedRole({}, (tx) =>
          tx.$queryRawUnsafe<CountRow[]>(
            `SELECT count(*)::int AS n FROM trust.verification_decisions`,
          ),
        );
        expect(rows[0]!.n).toBe(0);
      });

      it("WRITE (INSERT) by a NON-staff caller is REJECTED (WITH CHECK fails)", async () => {
        await expect(
          asRestrictedRole({}, (tx) =>
            tx.$executeRawUnsafe(
              `INSERT INTO trust.verification_decisions (id, verification_record_id, decision)
               VALUES ($1::uuid, $2::uuid, 'approve')`,
              uuidv7(),
              SEED_RECORD_ID,
            ),
          ),
        ).rejects.toThrow(/row-level security/i);
      });

      it("WRITE (INSERT) by a STAFF caller is ADMITTED (in-module FK → the seeded record)", async () => {
        await expect(
          asRestrictedRole({ isPlatformStaff: true }, (tx) =>
            tx.$executeRawUnsafe(
              `INSERT INTO trust.verification_decisions (id, verification_record_id, decision)
               VALUES ($1::uuid, $2::uuid, 'confirm')`,
              uuidv7(),
              SEED_RECORD_ID,
            ),
          ),
        ).resolves.toBe(1);
      });
    });
  });

  // ── Immutability — verification_records: column-scoped (Doc-6G §3.1.1) ───────

  describe("verification_records immutability (column-scoped)", () => {
    it("PERMITTED: state UPDATE requested → in_review (state is mutable)", async () => {
      const id = await seedRecord();
      await prisma.$executeRawUnsafe(
        `UPDATE trust.verification_records SET state = 'in_review' WHERE id = $1::uuid`,
        id,
      );
      const row = await prisma.verificationRecord.findUnique({ where: { id } });
      expect(row!.state).toBe("in_review");
    });

    it("REJECTED: UPDATE of the frozen subject_id is trigger-blocked", async () => {
      const id = await seedRecord();
      await expect(
        prisma.$executeRawUnsafe(
          `UPDATE trust.verification_records SET subject_id = $2::uuid WHERE id = $1::uuid`,
          id,
          uuidv7(),
        ),
      ).rejects.toThrow(/is immutable/i);
    });

    it("REJECTED: UPDATE of the frozen verification_type is trigger-blocked", async () => {
      const id = await seedRecord();
      await expect(
        prisma.$executeRawUnsafe(
          `UPDATE trust.verification_records SET verification_type = 'factory' WHERE id = $1::uuid`,
          id,
        ),
      ).rejects.toThrow(/is immutable/i);
    });

    it("REJECTED: DELETE is trigger-blocked (append-only)", async () => {
      const id = await seedRecord();
      await expect(
        prisma.$executeRawUnsafe(`DELETE FROM trust.verification_records WHERE id = $1::uuid`, id),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
      // Row survives the rejected DELETE.
      expect(await prisma.verificationRecord.findUnique({ where: { id } })).not.toBeNull();
    });
  });

  // ── Immutability — verification_decisions: fully append-only (Doc-6G §3.1.2) ──

  describe("verification_decisions immutability (append-only)", () => {
    it("REJECTED: any UPDATE (reason) is trigger-blocked", async () => {
      const id = await seedDecision();
      await expect(
        prisma.$executeRawUnsafe(
          `UPDATE trust.verification_decisions SET reason = 'tampered' WHERE id = $1::uuid`,
          id,
        ),
      ).rejects.toThrow(/is immutable/i);
    });

    it("REJECTED: UPDATE of the decision itself is trigger-blocked", async () => {
      const id = await seedDecision();
      await expect(
        prisma.$executeRawUnsafe(
          `UPDATE trust.verification_decisions SET decision = 'reject' WHERE id = $1::uuid`,
          id,
        ),
      ).rejects.toThrow(/is immutable/i);
    });

    it("REJECTED: DELETE is trigger-blocked (append-only)", async () => {
      const id = await seedDecision();
      await expect(
        prisma.$executeRawUnsafe(
          `DELETE FROM trust.verification_decisions WHERE id = $1::uuid`,
          id,
        ),
      ).rejects.toThrow(/append-only|DELETE forbidden/i);
      expect(await prisma.verificationDecision.findUnique({ where: { id } })).not.toBeNull();
    });
  });
});
