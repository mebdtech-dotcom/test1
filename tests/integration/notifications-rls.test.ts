import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-COMM-2 — the CHK-8-024 RLS positive/negative/cross-tenant gate for
// `communication.notifications` (Doc-6H §3.2/§3.x Pass-2; Doc-8D §5). Asserted through the Doc-8B §5
// DB-role-switch backstop: a NON-privileged tenant role (NOBYPASSRLS, non-owner) with the app layer
// bypassed — so the DB-level `notifications_recipient` policy ITSELF is proven, not app authz.
//
// Policy (Doc-6H §3.x verbatim): FOR ALL USING/CHECK (recipient_organization_id = app.active_org OR
// app.is_platform_staff IS TRUE). App-layer recipient scope (the recipient_user_id pair predicate) is
// PRIMARY and proven by the slice suite; this suite proves the tenant backstop.

const ORG_A = "01920000-0000-7000-8000-00000000da00";
const ORG_B = "01920000-0000-7000-8000-00000000db00";
const NOTIF_A = "01920000-0000-7000-8000-00000000da10";
const NOTIF_B = "01920000-0000-7000-8000-00000000db10";
const USER_A = "01920000-0000-7000-8000-00000000da19";

interface Row {
  id: string;
  recipient_organization_id: string;
}

async function seedFixture(): Promise<void> {
  for (const [id, name, slug] of [
    [ORG_A, "Notif RLS Org A", `notif-rls-a-${ORG_A}`],
    [ORG_B, "Notif RLS Org B", `notif-rls-b-${ORG_B}`],
  ] as const) {
    await prisma.organization.create({ data: { id, humanRef: `ORG-NOTIFRLS-${id}`, name, slug } });
  }
  await prisma.notification.create({
    data: { id: NOTIF_A, recipientOrganizationId: ORG_A, title: "A notif", body: "a" },
  });
  await prisma.notification.create({
    data: { id: NOTIF_B, recipientOrganizationId: ORG_B, title: "B notif", body: "b" },
  });
}

async function teardownFixture(): Promise<void> {
  await prisma.notification.deleteMany({ where: { id: { in: [NOTIF_A, NOTIF_B] } } });
  await prisma.notification.deleteMany({
    where: { recipientOrganizationId: { in: [ORG_A, ORG_B] } },
  });
  await prisma.organization.deleteMany({ where: { id: { in: [ORG_A, ORG_B] } } });
}

describe("W3-COMM-2 — notifications RLS (DB-role backstop)", () => {
  beforeAll(async () => {
    await ensureRestrictedRlsRole();
    await teardownFixture();
    await seedFixture();
  });

  afterAll(async () => {
    await teardownFixture();
    await prisma.$disconnect();
  });

  it("RLS-IS-ACTIVE meta-check: restricted role is NON-privileged + RLS enabled on notifications", async () => {
    const attrs = await prisma.$queryRawUnsafe<Array<{ rolsuper: boolean; rolbypassrls: boolean }>>(
      `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = '${RESTRICTED_RLS_ROLE}'`,
    );
    expect(attrs[0]!.rolsuper).toBe(false);
    expect(attrs[0]!.rolbypassrls).toBe(false);
    const rls = await prisma.$queryRawUnsafe<Array<{ enabled: boolean }>>(
      `SELECT relrowsecurity AS enabled FROM pg_class WHERE oid = 'communication.notifications'::regclass`,
    );
    expect(rls[0]!.enabled).toBe(true);
  });

  it("NEGATIVE (fail-closed): restricted role, NO app.active_org, non-staff ⇒ 0 fixture notifications", async () => {
    const n = await asRestrictedRole({}, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ n: number }>>(
        `SELECT count(*)::int AS n FROM communication.notifications WHERE id IN ($1::uuid, $2::uuid)`,
        NOTIF_A,
        NOTIF_B,
      );
      return rows[0]!.n;
    });
    expect(n).toBe(0);
  });

  it("POSITIVE: restricted role @ app.active_org = A sees EXACTLY A's notification", async () => {
    const rows = await asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
      tx.$queryRawUnsafe<Row[]>(
        `SELECT id, recipient_organization_id FROM communication.notifications
         WHERE id IN ($1::uuid, $2::uuid) ORDER BY id`,
        NOTIF_A,
        NOTIF_B,
      ),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe(NOTIF_A);
    expect(rows[0]!.recipient_organization_id).toBe(ORG_A);
  });

  it("CROSS-TENANT: restricted role @ A canNOT read B's notification (invisible)", async () => {
    const rows = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
      tx.$queryRawUnsafe<Row[]>(
        `SELECT id, recipient_organization_id FROM communication.notifications
         WHERE recipient_organization_id = $1::uuid`,
        ORG_B,
      ),
    );
    expect(rows).toEqual([]);
  });

  it("STAFF backstop: app.is_platform_staff = true sees BOTH orgs' notifications", async () => {
    const rows = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
      tx.$queryRawUnsafe<Row[]>(
        `SELECT id, recipient_organization_id FROM communication.notifications
         WHERE id IN ($1::uuid, $2::uuid) ORDER BY id`,
        NOTIF_A,
        NOTIF_B,
      ),
    );
    expect(rows.map((r) => r.id).sort()).toEqual([NOTIF_A, NOTIF_B].sort());
  });

  it("WITH CHECK: restricted role @ A can INSERT its OWN-org notification, NOT another org's", async () => {
    // Own-org INSERT is ADMITTED (rolled back by the harness; no throw).
    await asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
      tx.$executeRawUnsafe(
        `INSERT INTO communication.notifications (id, recipient_organization_id, title, body)
         VALUES (gen_random_uuid(), $1::uuid, 'own-org insert', 'x')`,
        ORG_A,
      ),
    );
    // Cross-org INSERT (recipient org = B while scoped to A) is REJECTED by the WITH CHECK.
    await expect(
      asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
        tx.$executeRawUnsafe(
          `INSERT INTO communication.notifications (id, recipient_organization_id, title, body)
           VALUES (gen_random_uuid(), $1::uuid, 'cross-org insert', 'x')`,
          ORG_B,
        ),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("WITH CHECK (write leg): @ A canNOT mutate B's row (0 rows affected — invisible)", async () => {
    const affected = await asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
      tx.$executeRawUnsafe(
        `UPDATE communication.notifications SET read_at = now() WHERE id = $1::uuid`,
        NOTIF_B,
      ),
    );
    expect(affected).toBe(0);
    const row = await prisma.notification.findFirst({ where: { id: NOTIF_B } });
    expect(row!.readAt).toBeNull();
  });

  it("notifications carry the SD tuple (archive = soft delete; never a hard delete in-app)", async () => {
    const cols = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'communication' AND table_name = 'notifications'
         AND column_name IN ('deleted_at','deleted_by','delete_reason','read_at')`,
    );
    expect(cols.map((c) => c.column_name).sort()).toEqual([
      "delete_reason",
      "deleted_at",
      "deleted_by",
      "read_at",
    ]);
  });
});
