import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { ensureProvisioned, type AuthSession } from "../../src/server/auth";
import { withActiveOrgContext } from "../../src/server/context";
import { handleRequestVerification } from "../../src/server/trust";
import { requestVerification } from "../../src/modules/trust/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-TRUST-2 — `trust.request_verification.v1` WRITE-vertical conformance slice (Doc-4G §G4.1),
// RESTRICTED to `subject_type = organization`. Proves, against a REAL PostgreSQL, the full
// composition → AUTHZ (M1 check_permission via src/server/authz) → command → SECURITY-DEFINER write →
// audit path AND the two CTO invariants:
//   • No business write without an audit row.
//   • No audit row without a successful business write (audit atomic with the SD-function write).
// The audit action is the canonical ENUMERATED Doc-2 §9 / Doc-4G §G4.1 §7 token `verification_requested`.
// `verification_records` READ + audit READ are staff-only (RLS), so the test inspects rows via the
// superuser `prisma` (RLS-bypassing) connection — the assertion is the row's existence + content.
//
// verification_records is APPEND-ONLY (DELETE trigger-blocked). Teardown therefore deletes the
// PROVISIONED identity (fresh org id per run) so each run's subject_id is fresh — orphaned
// verification_records accumulate but never collide (the house append-only pattern; the same seeds-
// accumulate posture as the substrate slice). Audit rows are immutable — never deleted.

const TV_AUTH_USER_ID = "01920000-0000-7000-8000-0000000005d1";
const TV_EMAIL = "trust-verify@example.com";

// Hand-built FORBIDDEN fixture ids — full, valid, distinct UUIDv7-shaped literals.
const FB_AUTH_USER_ID = "01920000-0000-7000-8000-0000000005fa";
const FB_USER_ID = "01920000-0000-7000-8000-0000000005f1";
const FB_ORG_ID = "01920000-0000-7000-8000-0000000005f2";
const FB_ROLE_ID = "01920000-0000-7000-8000-0000000005f3";

/** Test-scoped seeded session resolver — stands in for the parked live Supabase round-trip (auth boundary). */
function seededSession(session: AuthSession): () => Promise<AuthSession | null> {
  return async () => session;
}

/** A no-op provisioning stub for the hand-built fixtures (never materialize a second org). */
const noopProvision = (async () => ({
  created: false,
  userId: FB_USER_ID,
  organizationId: FB_ORG_ID,
  organizationHumanRef: null,
  ownerMembershipId: null,
})) as typeof ensureProvisioned;

/** Audit rows for a verification_record (read via the superuser connection — audit SELECT is staff-only). */
async function auditRowsFor(verificationRecordId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType: "verification_record", entityId: verificationRecordId },
    orderBy: { eventTime: "asc" },
  });
}

/** Open verification_records for a subject (superuser read; RLS-bypassing). */
async function recordsForSubject(subjectId: string) {
  return prisma.verificationRecord.findMany({ where: { subjectId } });
}

/** Teardown the provisioned identity + its org (fresh org id per run avoids append-only collision). */
async function cleanupProvisioned(authUserId: string): Promise<void> {
  const user = await prisma.user.findFirst({ where: { authUserId } });
  if (user === null) return;
  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  const orgIds = [...new Set(memberships.map((m) => m.organizationId))];
  await prisma.membership.deleteMany({ where: { userId: user.id } });
  if (orgIds.length > 0) await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
  await prisma.user.deleteMany({ where: { id: user.id } });
}

/** Teardown the hand-built forbidden fixture (user + org + no-permission role + membership). */
async function cleanupForbiddenFixture(): Promise<void> {
  await prisma.membership.deleteMany({ where: { userId: FB_USER_ID } });
  await prisma.role.deleteMany({ where: { id: FB_ROLE_ID } });
  await prisma.organization.deleteMany({ where: { id: FB_ORG_ID } });
  await prisma.user.deleteMany({ where: { id: FB_USER_ID } });
}

/** Grant the restricted RLS role the minimal privileges to prove the SD-function RLS bypass at the DB
 *  level: schema USAGE + table SELECT/INSERT (so a denied direct INSERT is an RLS rejection, not a
 *  missing grant) + EXECUTE on the SECURITY-DEFINER function (the migration REVOKEd the PUBLIC default). */
async function grantTrustExecToRestrictedRole(): Promise<void> {
  await ensureRestrictedRlsRole();
  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA trust TO ${RESTRICTED_RLS_ROLE}`);
  await prisma.$executeRawUnsafe(
    `GRANT SELECT, INSERT ON trust.verification_records TO ${RESTRICTED_RLS_ROLE}`,
  );
  await prisma.$executeRawUnsafe(
    `GRANT EXECUTE ON FUNCTION trust.request_verification_open_case(uuid, uuid, trust.verification_subject_type, trust.verification_type, uuid[], uuid) TO ${RESTRICTED_RLS_ROLE}`,
  );
}

describe("W3-TRUST-2 — trust.request_verification.v1 write vertical (audit-on-write, real PostgreSQL)", () => {
  beforeAll(async () => {
    await grantTrustExecToRestrictedRole();
  });

  beforeEach(async () => {
    await cleanupProvisioned(TV_AUTH_USER_ID);
    await cleanupForbiddenFixture();
  });

  afterAll(async () => {
    await cleanupProvisioned(TV_AUTH_USER_ID);
    await cleanupForbiddenFixture();
    await prisma.$disconnect();
  });

  it("HAPPY: Owner, org subject, subject_id == active org → 201 + Location + a `verification_requested` audit row (atomic)", async () => {
    const session: AuthSession = { authUserId: TV_AUTH_USER_ID, email: TV_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const res = await handleRequestVerification(
      { subjectId: orgId, subjectType: "organization", verificationType: "organization" },
      {
        resolveSession: seededSession(session),
        ensureProvisioned,
        idempotencyKey: "iv-key-happy-1",
      },
    );

    expect(res.status).toBe(201);
    expect(res.headers?.Location).toBeDefined();
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    expect(res.body).toHaveProperty("reference_id");
    const recordId = res.body.result.verificationRecordId;
    expect(res.body.result.state).toBe("requested");
    expect(res.headers?.Location).toBe(`/trust/verifications/${recordId}`);

    // The business row persisted in state `requested`, scoped to the submitting org, User-attributed.
    const row = await prisma.verificationRecord.findFirst({ where: { id: recordId } });
    expect(row?.subjectId).toBe(orgId);
    expect(row?.subjectType).toBe("organization");
    expect(row?.verificationType).toBe("organization");
    expect(row?.state).toBe("requested");
    expect(row?.requestedBy).toBe(provisioned.userId);

    // Exactly ONE audit row, the canonical ENUMERATED `verification_requested` action (Invariant 1).
    const audit = await auditRowsFor(recordId);
    expect(audit).toHaveLength(1);
    expect(audit[0]!.action).toBe("verification_requested");
    expect(audit[0]!.actorType).toBe("user");
    expect(audit[0]!.actorId).toBe(provisioned.userId);
    expect(audit[0]!.organizationId).toBe(orgId);
    expect(audit[0]!.oldValue).toBeNull(); // open leg: old_value = null
    expect(audit[0]!.newValue).toMatchObject({ subject_type: "organization", state: "requested" });
  });

  it("AUTHZ: a member WITHOUT `can_submit_verification` → 403, no row, no audit", async () => {
    // Hand-built fixture: a user whose active membership role holds NO permission slugs.
    await prisma.user.create({
      data: { id: FB_USER_ID, authUserId: FB_AUTH_USER_ID, status: "active" },
    });
    await prisma.organization.create({
      data: {
        id: FB_ORG_ID,
        humanRef: "ORG-TV2TEST-0005F2",
        name: "TV2 Forbidden Org",
        slug: "tv2-forbidden-org-0005f2",
        orgStatus: "active",
      },
    });
    await prisma.role.create({
      data: {
        id: FB_ROLE_ID,
        organizationId: FB_ORG_ID,
        name: "NoPermRole",
        isSystemBundle: false,
      },
    });
    await prisma.membership.create({
      data: {
        id: uuidv7(),
        userId: FB_USER_ID,
        organizationId: FB_ORG_ID,
        roleId: FB_ROLE_ID,
        state: "active",
      },
    });

    const session: AuthSession = { authUserId: FB_AUTH_USER_ID, email: "fb-trust@example.com" };
    const res = await handleRequestVerification(
      { subjectId: FB_ORG_ID, subjectType: "organization", verificationType: "organization" },
      {
        resolveSession: seededSession(session),
        ensureProvisioned: noopProvision,
        idempotencyKey: "iv-key-forbidden-1",
      },
    );

    expect(res.status).toBe(403);
    if (!("error" in res.body)) throw new Error("unreachable: expected an authorization error");
    expect(res.body.error.error_class).toBe("AUTHORIZATION");
    expect(res.body.error.error_code).toBe("trust_verification_forbidden");

    // No verification_records row, no audit — authorization rejected before any write.
    expect(await recordsForSubject(FB_ORG_ID)).toHaveLength(0);
    expect(
      await prisma.auditRecord.findMany({
        where: { action: "verification_requested", organizationId: FB_ORG_ID },
      }),
    ).toHaveLength(0);
  });

  it("SCOPE: subject_id != active org → 404 (non-disclosure collapse), no row", async () => {
    const session: AuthSession = { authUserId: TV_AUTH_USER_ID, email: TV_EMAIL };
    await ensureProvisioned(session);
    const otherSubject = uuidv7(); // a subject the submitting org does not own

    const res = await handleRequestVerification(
      { subjectId: otherSubject, subjectType: "organization", verificationType: "organization" },
      {
        resolveSession: seededSession(session),
        ensureProvisioned,
        idempotencyKey: "iv-key-scope-1",
      },
    );

    expect(res.status).toBe(404);
    if (!("error" in res.body)) throw new Error("unreachable: expected a not-found error");
    expect(res.body.error.error_class).toBe("NOT_FOUND");
    expect(res.body.error.error_code).toBe("trust_verification_not_found");
    expect(await recordsForSubject(otherSubject)).toHaveLength(0);
  });

  it("UNSUPPORTED subject_type: vendor_profile → 400 (WP-scope reject), no row", async () => {
    const session: AuthSession = { authUserId: TV_AUTH_USER_ID, email: TV_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const res = await handleRequestVerification(
      { subjectId: orgId, subjectType: "vendor_profile", verificationType: "business" },
      {
        resolveSession: seededSession(session),
        ensureProvisioned,
        idempotencyKey: "iv-key-unsupported-1",
      },
    );

    expect(res.status).toBe(400);
    if (!("error" in res.body)) throw new Error("unreachable: expected a validation error");
    expect(res.body.error.error_class).toBe("VALIDATION");
    expect(res.body.error.error_code).toBe("trust_verification_unsupported_subject");
    expect(await recordsForSubject(orgId)).toHaveLength(0);
  });

  it("SYNTAX: a non-uuid evidence_document_refs element → 400 (before any write)", async () => {
    const session: AuthSession = { authUserId: TV_AUTH_USER_ID, email: TV_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const res = await handleRequestVerification(
      {
        subjectId: orgId,
        subjectType: "organization",
        verificationType: "organization",
        evidenceDocumentRefs: ["not-a-uuid"],
      },
      {
        resolveSession: seededSession(session),
        ensureProvisioned,
        idempotencyKey: "iv-key-badref-1",
      },
    );

    expect(res.status).toBe(400);
    if (!("error" in res.body)) throw new Error("unreachable: expected a validation error");
    expect(res.body.error.error_class).toBe("VALIDATION");
    expect(res.body.error.error_code).toBe("trust_verification_invalid_input");
    expect(await recordsForSubject(orgId)).toHaveLength(0);
  });

  it("BUSINESS: a second open request (same subject + type) → 422, still one row, no second audit", async () => {
    const session: AuthSession = { authUserId: TV_AUTH_USER_ID, email: TV_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const first = await handleRequestVerification(
      { subjectId: orgId, subjectType: "organization", verificationType: "organization" },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "iv-key-biz-1" },
    );
    expect(first.status).toBe(201);
    if (!("result" in first.body)) throw new Error("unreachable: expected create success");
    const firstRecordId = first.body.result.verificationRecordId;

    const second = await handleRequestVerification(
      { subjectId: orgId, subjectType: "organization", verificationType: "organization" },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "iv-key-biz-2" },
    );
    expect(second.status).toBe(422);
    if (!("error" in second.body)) throw new Error("unreachable: expected a business error");
    expect(second.body.error.error_class).toBe("BUSINESS");
    expect(second.body.error.error_code).toBe("trust_verification_open_case_exists");

    // Still exactly ONE open case for the subject, and only the FIRST request's audit row (no second audit).
    expect(await recordsForSubject(orgId)).toHaveLength(1);
    expect(await auditRowsFor(firstRecordId)).toHaveLength(1);
  });

  it("SYNTAX: missing Idempotency-Key → 400 (before any write)", async () => {
    const session: AuthSession = { authUserId: TV_AUTH_USER_ID, email: TV_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const res = await handleRequestVerification(
      { subjectId: orgId, subjectType: "organization", verificationType: "organization" },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: null },
    );

    expect(res.status).toBe(400);
    if (!("error" in res.body)) throw new Error("unreachable: expected a validation error");
    expect(res.body.error.error_class).toBe("VALIDATION");
    expect(res.body.error.error_code).toBe("trust_verification_invalid_input");
    expect(await recordsForSubject(orgId)).toHaveLength(0);
  });

  it("INVARIANT — audit failure rolls back the SD-function write (no row, no audit)", async () => {
    // The load-bearing atomicity proof: inject a FAILING appendAuditRecord. The command appends audit in
    // the SAME tx as the SD-function insert, so the throw must roll the whole transaction back — leaving
    // NO verification_records row (the SECURITY-DEFINER insert participates in the caller's tx).
    const session: AuthSession = { authUserId: TV_AUTH_USER_ID, email: TV_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const failingAppend = (() => {
      return Promise.reject(new Error("audit append failed (injected)"));
    }) as typeof appendAuditRecord;

    await expect(
      withActiveOrgContext(
        { userId: provisioned.userId, activeOrgId: orgId, isPlatformStaff: false },
        (tx) =>
          requestVerification(
            { subjectId: orgId, subjectType: "organization", verificationType: "organization" },
            { userId: provisioned.userId, activeOrgId: orgId },
            { appendAuditRecord: failingAppend },
            tx,
          ),
      ),
    ).rejects.toThrow(/audit append failed/);

    // The SD-function insert was rolled back with the failed audit — NO orphan business write (Invariant 1).
    expect(await recordsForSubject(orgId)).toHaveLength(0);
  });

  it("SD BYPASS: a NON-staff caller's direct INSERT is RLS-denied, but the SECURITY-DEFINER function inserts", async () => {
    // Direct in-band INSERT as the restricted (non-staff) role → RLS WITH CHECK rejection (staff-only).
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

    // The SAME non-staff role calling the SECURITY-DEFINER function SUCCEEDS (the function runs as its
    // owner and bypasses RLS) — `created = true` for a fresh subject. The tx is rolled back (probe only).
    const freshSubject = uuidv7();
    const rows = await asRestrictedRole({}, (tx) =>
      tx.$queryRawUnsafe<Array<{ created: boolean }>>(
        `SELECT created FROM trust.request_verification_open_case(
           $1::uuid, $2::uuid, 'organization'::trust.verification_subject_type,
           'organization'::trust.verification_type, NULL::uuid[], $3::uuid)`,
        uuidv7(),
        freshSubject,
        uuidv7(),
      ),
    );
    expect(rows[0]!.created).toBe(true);
  });
});
