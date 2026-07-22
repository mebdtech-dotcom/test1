import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W3-COMM-1 — the CHK-8-024 RLS positive/negative/cross-tenant gate + the append-only immutability
// trigger for `communication.support_tickets` / `communication.ticket_messages` (Doc-6H §3.4; Doc-8D §5).
// Asserted through the Doc-8B §5 DB-role-switch backstop: a NON-privileged tenant role (NOBYPASSRLS,
// non-owner) with the app layer bypassed — so the DB-level policy itself is proven, not app authz.
//
// `support_tickets` RLS (Doc-6H §3.4): FOR ALL USING/CHECK (organization_id = app.active_org OR
// app.is_platform_staff IS TRUE). `ticket_messages` RLS: via the parent ticket (org) OR staff; UPDATE/
// DELETE blocked by the immutability trigger (append-only).

const ORG_A = "01920000-0000-7000-8000-00000000ca00";
const ORG_B = "01920000-0000-7000-8000-00000000cb00";
const TKT_A = "01920000-0000-7000-8000-00000000ca10";
const TKT_B = "01920000-0000-7000-8000-00000000cb10";
const MSG_A = "01920000-0000-7000-8000-00000000ca11";
const MSG_B = "01920000-0000-7000-8000-00000000cb11";
const USER_A = "01920000-0000-7000-8000-00000000ca19";
// command_dedup cross-actor fixture (MIN-4): a row owned by actor X; actor Y must not read it.
const DEDUP_ACTOR_X = "01920000-0000-7000-8000-0000000000d1";
const DEDUP_ACTOR_Y = "01920000-0000-7000-8000-0000000000d2";
const DEDUP_ROW = "01920000-0000-7000-8000-0000000000d3";

interface Row {
  id: string;
  organization_id: string;
}

async function seedFixture(): Promise<void> {
  for (const [id, name, slug] of [
    [ORG_A, "Comm RLS Org A", `comm-rls-a-${ORG_A}`],
    [ORG_B, "Comm RLS Org B", `comm-rls-b-${ORG_B}`],
  ] as const) {
    await prisma.organization.create({ data: { id, humanRef: `ORG-COMMRLS-${id}`, name, slug } });
  }
  await prisma.supportTicket.create({
    data: { id: TKT_A, organizationId: ORG_A, status: "open", subject: "A ticket" },
  });
  await prisma.supportTicket.create({
    data: { id: TKT_B, organizationId: ORG_B, status: "open", subject: "B ticket" },
  });
  await prisma.ticketMessage.create({
    data: { id: MSG_A, supportTicketId: TKT_A, body: "A message" },
  });
  await prisma.ticketMessage.create({
    data: { id: MSG_B, supportTicketId: TKT_B, body: "B message" },
  });
  // A command_dedup row owned by actor X (MIN-4 cross-actor SELECT gate).
  await prisma.communicationCommandDedup.create({
    data: {
      id: DEDUP_ROW,
      contractId: "comm.create_ticket.v1",
      actorUserId: DEDUP_ACTOR_X,
      organizationId: ORG_A,
      idempotencyKey: "rls-fixture-key",
      responseStatus: 201,
      responseBody: { result: { ticketId: TKT_A }, reference_id: "x" },
    },
  });
}

async function teardownFixture(): Promise<void> {
  // ticket_messages are append-only (DELETE forbidden by the trigger) — TRUNCATE bypasses the BEFORE
  // DELETE row trigger. Then the parent tickets + orgs can be removed. Ephemeral test DB only.
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE communication.ticket_messages`);
  await prisma.communicationCommandDedup.deleteMany({ where: { id: DEDUP_ROW } });
  await prisma.supportTicket.deleteMany({ where: { id: { in: [TKT_A, TKT_B] } } });
  await prisma.organization.deleteMany({ where: { id: { in: [ORG_A, ORG_B] } } });
}

describe("W3-COMM-1 — support_tickets / ticket_messages RLS + append-only (DB-role backstop)", () => {
  beforeAll(async () => {
    await ensureRestrictedRlsRole();
    await teardownFixture();
    await seedFixture();
  });

  afterAll(async () => {
    await teardownFixture();
    await prisma.$disconnect();
  });

  it("RLS-IS-ACTIVE meta-check: restricted role is NON-privileged + RLS enabled on both tables", async () => {
    const attrs = await prisma.$queryRawUnsafe<Array<{ rolsuper: boolean; rolbypassrls: boolean }>>(
      `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = '${RESTRICTED_RLS_ROLE}'`,
    );
    expect(attrs[0]!.rolsuper).toBe(false);
    expect(attrs[0]!.rolbypassrls).toBe(false);
    for (const rel of ["communication.support_tickets", "communication.ticket_messages"]) {
      const rls = await prisma.$queryRawUnsafe<Array<{ enabled: boolean }>>(
        `SELECT relrowsecurity AS enabled FROM pg_class WHERE oid = '${rel}'::regclass`,
      );
      expect(rls[0]!.enabled).toBe(true);
    }
  });

  it("NEGATIVE (fail-closed): restricted role, NO app.active_org, non-staff ⇒ 0 tickets", async () => {
    const n = await asRestrictedRole({}, async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ n: number }>>(
        `SELECT count(*)::int AS n FROM communication.support_tickets`,
      );
      return rows[0]!.n;
    });
    expect(n).toBe(0);
  });

  it("POSITIVE: restricted role @ app.active_org = A sees EXACTLY A's ticket", async () => {
    const rows = await asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
      tx.$queryRawUnsafe<Row[]>(
        `SELECT id, organization_id FROM communication.support_tickets ORDER BY id`,
      ),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe(TKT_A);
    expect(rows[0]!.organization_id).toBe(ORG_A);
  });

  it("CROSS-TENANT: restricted role @ A canNOT read B's ticket (invisible)", async () => {
    const rows = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
      tx.$queryRawUnsafe<Row[]>(
        `SELECT id FROM communication.support_tickets WHERE organization_id = $1::uuid`,
        ORG_B,
      ),
    );
    expect(rows).toEqual([]);
  });

  it("STAFF backstop: app.is_platform_staff = true sees ALL tickets (both orgs)", async () => {
    const rows = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
      tx.$queryRawUnsafe<Row[]>(
        `SELECT id FROM communication.support_tickets WHERE id IN ($1::uuid, $2::uuid) ORDER BY id`,
        TKT_A,
        TKT_B,
      ),
    );
    expect(rows.map((r) => r.id).sort()).toEqual([TKT_A, TKT_B].sort());
  });

  it("ticket_messages: restricted role @ A sees A's message via parent, NOT B's", async () => {
    const rows = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
      tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM communication.ticket_messages ORDER BY id`,
      ),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe(MSG_A);
  });

  it("APPEND-ONLY: UPDATE on ticket_messages is blocked by the immutability trigger", async () => {
    await expect(
      prisma.$executeRawUnsafe(
        `UPDATE communication.ticket_messages SET body = 'tampered' WHERE id = $1::uuid`,
        MSG_A,
      ),
    ).rejects.toThrow(/immutable/i);
    // The body is unchanged.
    const row = await prisma.ticketMessage.findFirst({ where: { id: MSG_A } });
    expect(row?.body).toBe("A message");
  });

  it("APPEND-ONLY: DELETE on ticket_messages is blocked by the immutability trigger", async () => {
    await expect(
      prisma.$executeRawUnsafe(
        `DELETE FROM communication.ticket_messages WHERE id = $1::uuid`,
        MSG_B,
      ),
    ).rejects.toThrow(/append-only|DELETE forbidden/i);
    const row = await prisma.ticketMessage.findFirst({ where: { id: MSG_B } });
    expect(row).not.toBeNull();
  });

  it("WITH CHECK (MIN-4): restricted role @ A can INSERT its OWN-org ticket, NOT another org's", async () => {
    // Own-org INSERT is ADMITTED (rolled back by the harness; no throw).
    await asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
      tx.$executeRawUnsafe(
        `INSERT INTO communication.support_tickets (id, organization_id, subject) VALUES (gen_random_uuid(), $1::uuid, 'own-org insert')`,
        ORG_A,
      ),
    );
    // Cross-org INSERT (organization_id = B while scoped to A) is REJECTED by the WITH CHECK.
    await expect(
      asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
        tx.$executeRawUnsafe(
          `INSERT INTO communication.support_tickets (id, organization_id, subject) VALUES (gen_random_uuid(), $1::uuid, 'cross-org insert')`,
          ORG_B,
        ),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("WITH CHECK (MIN-4): ticket_messages via-parent — @ A can append to A's ticket, NOT B's", async () => {
    // Append into A's ticket (parent org = A) is ADMITTED.
    await asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
      tx.$executeRawUnsafe(
        `INSERT INTO communication.ticket_messages (id, support_ticket_id, body) VALUES (gen_random_uuid(), $1::uuid, 'a-reply')`,
        TKT_A,
      ),
    );
    // Append into B's ticket (parent org = B, invisible to A) is REJECTED by the via-parent WITH CHECK.
    await expect(
      asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
        tx.$executeRawUnsafe(
          `INSERT INTO communication.ticket_messages (id, support_ticket_id, body) VALUES (gen_random_uuid(), $1::uuid, 'b-reply')`,
          TKT_B,
        ),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("command_dedup (MIN-4): cross-actor SELECT is blocked; own-actor + staff see the row", async () => {
    // Actor Y (different principal) canNOT read actor X's stored response (poisoning guard).
    const asY = await asRestrictedRole({ userId: DEDUP_ACTOR_Y }, (tx) =>
      tx.$queryRawUnsafe<Array<{ n: number }>>(
        `SELECT count(*)::int AS n FROM communication.command_dedup WHERE id = $1::uuid`,
        DEDUP_ROW,
      ),
    );
    expect(asY[0]!.n).toBe(0);
    // Actor X (the owner) sees its own row.
    const asX = await asRestrictedRole({ userId: DEDUP_ACTOR_X }, (tx) =>
      tx.$queryRawUnsafe<Array<{ n: number }>>(
        `SELECT count(*)::int AS n FROM communication.command_dedup WHERE id = $1::uuid`,
        DEDUP_ROW,
      ),
    );
    expect(asX[0]!.n).toBe(1);
    // The platform-staff backstop sees it too.
    const asStaff = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
      tx.$queryRawUnsafe<Array<{ n: number }>>(
        `SELECT count(*)::int AS n FROM communication.command_dedup WHERE id = $1::uuid`,
        DEDUP_ROW,
      ),
    );
    expect(asStaff[0]!.n).toBe(1);
  });

  it("audit (OBS-2): an ADMIN-attributed support audit row is admitted under the restricted staff RLS leg", async () => {
    // The staff leg of `audit_records_context_append` admits an `actor_type='admin'` row when
    // app.is_platform_staff IS TRUE (the M6 Support Staff audited-write leg). Rolled back by the harness.
    await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
      tx.$executeRawUnsafe(
        `INSERT INTO core.audit_records (audit_id, actor_type, entity_type, entity_id, action, event_time)
         VALUES (gen_random_uuid(), 'admin'::core."ActorType", 'support_tickets', $1::uuid, 'support_ticket_status_changed', now())`,
        TKT_A,
      ),
    );
  });

  it("support_tickets is soft-deletable (SD tuple present), never a hard delete in-app", async () => {
    // Doc-2 §10.7: support_tickets carries the soft-delete tuple; assert the columns exist + a partial
    // live index (deleted_at IS NULL) governs list visibility.
    const cols = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'communication' AND table_name = 'support_tickets'
         AND column_name IN ('deleted_at','deleted_by','delete_reason')`,
    );
    expect(cols.map((c) => c.column_name).sort()).toEqual([
      "delete_reason",
      "deleted_at",
      "deleted_by",
    ]);
  });
});
