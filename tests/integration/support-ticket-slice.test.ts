import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { ensureProvisioned, type AuthSession } from "../../src/server/auth";
import { withActiveOrgContext } from "../../src/server/context";
import type { ResolveStaffContext } from "../../src/server/context";
import {
  handleAddTicketMessage,
  handleCloseTicket,
  handleCreateTicket,
  handleGetTicket,
  handleListTickets,
  handleUpdateTicket,
} from "../../src/server/communication";
import {
  addTicketMessage,
  closeTicket,
  createTicket,
  mapUpdateTicket,
  STAFF_CAN_SUPPORT_SLUG,
  updateTicket,
} from "../../src/modules/communication/contracts";
import type { StaffSupportAuthorityCheck } from "../../src/server/communication";
import { appendAuditRecord } from "../../src/modules/core/contracts";
import { resolveStaffContext as prodResolveStaffContext } from "../../src/server/context";
import { uuidv7 } from "../../src/shared/ids";

// W3-COMM-1 — BC-COMM-4 Support Communications conformance slice (Doc-4H §HB-4.1…4.5; Doc-5H §7). Proves,
// against a REAL PostgreSQL, the six wire contracts, the two-sided actor legs (User via withActiveOrg /
// Admin via an INJECTED staff context), the state machine + actor→transition authority, the R10
// non-disclosure collapse, idempotency replay, and the four audit tokens (write + audit in ONE tx, NO §8
// event — the M6 audited-write variant). Audit rows are read via the RLS-bypassing superuser `prisma`
// connection (audit SELECT is staff-only) — the assertion is the row's existence + content.

const USER_AUTH = "01920000-0000-7000-8000-00000000c001";
const USER_EMAIL = "comm-user@example.com";
const OTHER_AUTH = "01920000-0000-7000-8000-00000000c002";
const OTHER_EMAIL = "comm-other@example.com";
const STAFF_USER_ID = "01920000-0000-7000-8000-00000000cf01";

/** Test-scoped seeded session resolver — stands in for the live Supabase round-trip (auth boundary). */
function seededSession(session: AuthSession): () => Promise<AuthSession | null> {
  return async () => session;
}

/** An INJECTED staff-context port (the production resolver is DC-3 fail-closed — see the last test). */
const injectedStaff: ResolveStaffContext = async () => ({
  userId: STAFF_USER_ID,
  isPlatformStaff: true,
});

/** Audit rows for an entity (read via the superuser connection — audit SELECT is staff-only). */
async function auditRowsFor(entityType: string, entityId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType, entityId },
    orderBy: { eventTime: "asc" },
  });
}

async function cleanupProvisioned(authUserId: string): Promise<void> {
  const user = await prisma.user.findFirst({ where: { authUserId } });
  if (user === null) return;
  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  const orgIds = [...new Set(memberships.map((m) => m.organizationId))];
  // ticket_messages are append-only (the immutability trigger forbids DELETE) — cleared via TRUNCATE
  // in `cleanupAll` (TRUNCATE bypasses the BEFORE DELETE row trigger). support_tickets carry no trigger.
  if (orgIds.length > 0) {
    await prisma.supportTicket.deleteMany({ where: { organizationId: { in: orgIds } } });
  }
  await prisma.communicationCommandDedup.deleteMany({ where: { actorUserId: user.id } });
  await prisma.membership.deleteMany({ where: { userId: user.id } });
  if (orgIds.length > 0) await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
  await prisma.user.deleteMany({ where: { id: user.id } });
}

async function cleanupAll(): Promise<void> {
  // TRUNCATE the append-only messages first (bypasses the BEFORE DELETE trigger; DELETE is forbidden),
  // then the parent tickets can be removed (in-module FK). Ephemeral test DB only (Invariant #8 untouched).
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE communication.ticket_messages`);
  await cleanupProvisioned(USER_AUTH);
  await cleanupProvisioned(OTHER_AUTH);
  await prisma.communicationCommandDedup.deleteMany({ where: { actorUserId: STAFF_USER_ID } });
}

/** Provision the user + create a ticket (User leg) and return its id + org + the user id. */
async function provisionAndOpenTicket(
  session: AuthSession,
  key: string,
): Promise<{ ticketId: string; orgId: string; userId: string }> {
  const provisioned = await ensureProvisioned(session);
  const res = await handleCreateTicket(
    {
      subject: "Cannot upload spec docs",
      priority: "high",
      body: "The upload button does nothing.",
    },
    { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: key },
  );
  if (!("result" in res.body)) throw new Error("unreachable: expected a create success");
  return {
    ticketId: res.body.result.ticketId,
    orgId: provisioned.organizationId!,
    userId: provisioned.userId,
  };
}

/** Drive a ticket to `resolved` via the injected staff leg (open→in_progress→resolved). */
async function staffResolve(session: AuthSession, ticketId: string): Promise<void> {
  for (const target of ["in_progress", "resolved"] as const) {
    const res = await handleUpdateTicket(
      { ticketId, targetStatus: target },
      {
        resolveSession: seededSession(session),
        ensureProvisioned,
        resolveStaffContext: injectedStaff,
        idempotencyKey: `staff-${target}-${ticketId}`,
      },
    );
    expect(res.status).toBe(200);
  }
}

describe("W3-COMM-1 — comm support-ticket vertical (audit-on-write, real PostgreSQL)", () => {
  beforeEach(cleanupAll);
  afterAll(async () => {
    await cleanupAll();
    await prisma.$disconnect();
  });

  // ── 8C — contract / API ──────────────────────────────────────────────────────

  it("CREATE → 201 + Location + camelCase result + ONE support_ticket_created audit (atomic)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const provisioned = await ensureProvisioned(session);

    const res = await handleCreateTicket(
      { subject: "RFQ invite not received", priority: "high", body: "No invite email arrived." },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "k-create-1" },
    );

    expect(res.status).toBe(201);
    expect(res.headers?.Location).toMatch(/^\/communication\/tickets\/[0-9a-f-]{36}$/i);
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    expect(res.body).toHaveProperty("reference_id");
    const r = res.body.result;
    expect(r.status).toBe("open"); // camelCase result property (Doc-5A Option B)
    expect(r.organizationId).toBe(provisioned.organizationId);
    expect(r.openedBy).toBe(provisioned.userId);
    expect(r.openerMessageId).toMatch(/^[0-9a-f-]{36}$/i);

    // The ticket + opener message persisted.
    const ticket = await prisma.supportTicket.findFirst({ where: { id: r.ticketId } });
    expect(ticket?.status).toBe("open");
    const messages = await prisma.ticketMessage.findMany({
      where: { supportTicketId: r.ticketId },
    });
    expect(messages).toHaveLength(1);
    expect(messages[0]!.body).toBe("No invite email arrived.");

    // Exactly ONE audit row — `support_ticket_created` (the opener message is NOT separately audited).
    const audit = await auditRowsFor("support_tickets", r.ticketId);
    expect(audit).toHaveLength(1);
    expect(audit[0]!.action).toBe("support_ticket_created");
    expect(audit[0]!.actorType).toBe("user");
    expect(audit[0]!.actorId).toBe(provisioned.userId);
    expect(audit[0]!.organizationId).toBe(provisioned.organizationId);
    expect(audit[0]!.oldValue).toBeNull();
    expect(audit[0]!.newValue).toMatchObject({
      status: "open",
      subject: "RFQ invite not received",
    });
  });

  it("CREATE idempotency replay: same key → same result, NO duplicate row/audit", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    await ensureProvisioned(session);
    const deps = {
      resolveSession: seededSession(session),
      ensureProvisioned,
      idempotencyKey: "k-dup",
    };

    const first = await handleCreateTicket(
      { subject: "Dup test", priority: "normal", body: "first" },
      deps,
    );
    const second = await handleCreateTicket(
      { subject: "Dup test", priority: "normal", body: "first" },
      deps,
    );
    if (!("result" in first.body) || !("result" in second.body)) {
      throw new Error("unreachable: expected two success envelopes");
    }

    // Same ticket id + same ORIGINAL reference_id (Doc-5A §9.3 safe replay).
    expect(second.body.result.ticketId).toBe(first.body.result.ticketId);
    expect(second.body.reference_id).toBe(first.body.reference_id);
    expect(second.status).toBe(201);

    // Exactly ONE ticket + ONE opener message + ONE audit — no duplicate side effect.
    const ticketId = first.body.result.ticketId;
    const tickets = await prisma.supportTicket.count({ where: { id: ticketId } });
    expect(tickets).toBe(1);
    const messages = await prisma.ticketMessage.count({ where: { supportTicketId: ticketId } });
    expect(messages).toBe(1);
    const audit = await auditRowsFor("support_tickets", ticketId);
    expect(audit).toHaveLength(1);
  });

  it("ADD MESSAGE → 201, NO Location, audit records ids+meta (NO body in the ledger)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(session, "k-open-msg");

    const res = await handleAddTicketMessage(
      { ticketId, body: "Here are more details about the failure." },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "k-msg-1" },
    );

    expect(res.status).toBe(201);
    expect(res.headers?.Location).toBeUndefined(); // a ticket message has no standalone GET URL.
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    const messageId = res.body.result.messageId;

    const audit = await auditRowsFor("ticket_messages", messageId);
    expect(audit).toHaveLength(1);
    expect(audit[0]!.action).toBe("support_ticket_message_appended");
    expect(audit[0]!.newValue).toMatchObject({ support_ticket_id: ticketId });
    expect(audit[0]!.newValue).toHaveProperty("author_id");
    // The message body is NEVER written to the audit ledger (ids + meta only).
    expect(JSON.stringify(audit[0]!.newValue)).not.toContain("more details");
  });

  it("GET → 200 with the ticket + its messages; LIST → 200 with items/pageInfo", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(session, "k-getlist");

    const got = await handleGetTicket(ticketId, {
      resolveSession: seededSession(session),
      ensureProvisioned,
    });
    expect(got.status).toBe(200);
    if (!("result" in got.body)) throw new Error("unreachable: expected a get success");
    expect(got.body.result.ticketId).toBe(ticketId);
    expect(got.body.result.messages).toHaveLength(1);

    const listed = await handleListTickets(
      {},
      { resolveSession: seededSession(session), ensureProvisioned },
    );
    expect(listed.status).toBe(200);
    if (!("result" in listed.body)) throw new Error("unreachable: expected a list success");
    expect(listed.body.result.items.some((i) => i.ticketId === ticketId)).toBe(true);
    expect(listed.body.result.pageInfo).toHaveProperty("hasMore");
  });

  it("missing Idempotency-Key on a mutation → 400 VALIDATION", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    await ensureProvisioned(session);
    const res = await handleCreateTicket(
      { subject: "x", priority: "low", body: "y" },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: null },
    );
    expect(res.status).toBe(400);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("VALIDATION");
  });

  it("prohibited/empty field: create with empty subject → 400 (before any write)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const res = await handleCreateTicket(
      { subject: "   ", priority: "high", body: "body" },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "k-bad" },
    );
    expect(res.status).toBe(400);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("VALIDATION");
    const count = await prisma.supportTicket.count({
      where: { organizationId: provisioned.organizationId! },
    });
    expect(count).toBe(0);
  });

  // ── 8E — domain / state / authority / non-disclosure / audit ─────────────────

  it("FULL lifecycle open→in_progress→resolved→closed (staff drives; distinct audit tokens)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(session, "k-lifecycle");

    await staffResolve(session, ticketId); // open→in_progress→resolved (staff)

    // Close via update_ticket (resolved→closed) — records STATUS_CHANGED (not CLOSED — the invoked cmd).
    const closed = await handleUpdateTicket(
      { ticketId, targetStatus: "closed" },
      {
        resolveSession: seededSession(session),
        ensureProvisioned,
        resolveStaffContext: injectedStaff,
        idempotencyKey: "k-close-via-update",
      },
    );
    expect(closed.status).toBe(200);

    const finalTicket = await prisma.supportTicket.findFirst({ where: { id: ticketId } });
    expect(finalTicket?.status).toBe("closed");

    // Audit ledger: created + three status-change legs; staff legs attributed `admin`.
    const audit = await auditRowsFor("support_tickets", ticketId);
    expect(audit.map((a) => a.action)).toEqual([
      "support_ticket_created",
      "support_ticket_status_changed",
      "support_ticket_status_changed",
      "support_ticket_status_changed",
    ]);
    expect(audit[1]!.actorType).toBe("admin");
    expect(audit[1]!.oldValue).toMatchObject({ status: "open" });
    expect(audit[1]!.newValue).toMatchObject({ status: "in_progress" });
  });

  it("illegal transition open→resolved → STATE 409 (NOT CONFLICT); no write, no audit", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(session, "k-illegal");

    const res = await handleUpdateTicket(
      { ticketId, targetStatus: "resolved" },
      {
        resolveSession: seededSession(session),
        ensureProvisioned,
        resolveStaffContext: injectedStaff,
        idempotencyKey: "k-illegal-1",
      },
    );
    expect(res.status).toBe(409);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("STATE");
    expect(res.body.error.error_class).not.toBe("CONFLICT");

    const ticket = await prisma.supportTicket.findFirst({ where: { id: ticketId } });
    expect(ticket?.status).toBe("open"); // unchanged
    const audit = await auditRowsFor("support_tickets", ticketId);
    expect(audit).toHaveLength(1); // only the create; no status-change audit on a rejected transition
  });

  it("User requesting a staff-only transition (open→in_progress) → AUTHORIZATION 403 (NOT STATE)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(session, "k-user-staff-only");

    // No injected staff → the USER leg drives this. A staff-only edge → AUTHORIZATION, not STATE.
    const res = await handleUpdateTicket(
      { ticketId, targetStatus: "in_progress" },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "k-uso-1" },
    );
    expect(res.status).toBe(403);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("AUTHORIZATION");
    expect(res.body.error.error_class).not.toBe("STATE");
  });

  it("User MAY close own resolved ticket (resolved→closed) → 200 + support_ticket_closed audit", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(session, "k-user-close");
    await staffResolve(session, ticketId); // staff → resolved

    const res = await handleCloseTicket(
      { ticketId },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "k-uclose-1" },
    );
    expect(res.status).toBe(200);
    if (!("result" in res.body)) throw new Error("unreachable: expected a close success");
    expect(res.body.result.status).toBe("closed");

    const audit = await auditRowsFor("support_tickets", ticketId);
    const closeRow = audit[audit.length - 1]!;
    expect(closeRow.action).toBe("support_ticket_closed");
    expect(closeRow.actorType).toBe("user");
    expect(closeRow.oldValue).toMatchObject({ status: "resolved" });
    expect(closeRow.newValue).toMatchObject({ status: "closed" });
  });

  it("add-message to a closed ticket → STATE 409; close a non-resolved ticket → STATE 409", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(session, "k-state");

    // close a non-resolved (open) ticket → STATE.
    const badClose = await handleCloseTicket(
      { ticketId },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "k-badclose" },
    );
    expect(badClose.status).toBe(409);
    if (!("error" in badClose.body)) throw new Error("unreachable");
    expect(badClose.body.error.error_class).toBe("STATE");

    // Drive to closed, then add-message → STATE.
    await staffResolve(session, ticketId);
    await handleCloseTicket(
      { ticketId },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "k-realclose" },
    );
    const msgOnClosed = await handleAddTicketMessage(
      { ticketId, body: "too late" },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "k-msgclosed" },
    );
    expect(msgOnClosed.status).toBe(409);
    if (!("error" in msgOnClosed.body)) throw new Error("unreachable");
    expect(msgOnClosed.body.error.error_class).toBe("STATE");
  });

  it("out-of-scope get → NOT_FOUND, byte-identical (error object) to a non-existent id", async () => {
    const userSession: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(userSession, "k-scope");

    // A DIFFERENT org's user tries to read user A's ticket → RLS scopes it away → NOT_FOUND.
    const otherSession: AuthSession = { authUserId: OTHER_AUTH, email: OTHER_EMAIL };
    await ensureProvisioned(otherSession);
    const outOfScope = await handleGetTicket(ticketId, {
      resolveSession: seededSession(otherSession),
      ensureProvisioned,
    });
    // The same actor asking for a genuinely non-existent ticket.
    const nonExistent = await handleGetTicket("01920000-0000-7000-8000-0000000000ff", {
      resolveSession: seededSession(otherSession),
      ensureProvisioned,
    });

    expect(outOfScope.status).toBe(404);
    expect(nonExistent.status).toBe(404);
    if (!("error" in outOfScope.body) || !("error" in nonExistent.body)) {
      throw new Error("unreachable: expected error envelopes");
    }
    // Byte-identical error object (existence never confirmed) — only reference_id differs per request.
    expect(JSON.stringify(outOfScope.body.error)).toBe(JSON.stringify(nonExistent.body.error));
    expect(outOfScope.body.error.error_class).toBe("NOT_FOUND");
  });

  it("INVARIANT — audit failure rolls back the business write (no ticket, no audit)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const failingAppend = (() =>
      Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;

    await expect(
      withActiveOrgContext(
        { userId: provisioned.userId, activeOrgId: orgId, isPlatformStaff: false },
        (tx) =>
          createTicket(
            { subject: "rollback", priority: "high", body: "should roll back" },
            { actorType: "user", userId: provisioned.userId, activeOrgId: orgId },
            { appendAuditRecord: failingAppend },
            tx,
          ),
      ),
    ).rejects.toThrow(/audit append failed/);

    // The ticket create (AND its opener message) rolled back with the failed audit (Invariant 1).
    const tickets = await prisma.supportTicket.count({ where: { organizationId: orgId } });
    expect(tickets).toBe(0);
  });

  it("emits NO Doc-2 §8 event (R11) — a create produces zero outbox rows for the ticket", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(session, "k-noevent");
    const events = await prisma.outboxEvent.count({ where: { aggregateId: ticketId } });
    expect(events).toBe(0);
  });

  it("production resolveStaffContext is FAIL-CLOSED (DC-3) — never resolves a staff principal", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    // The production port resolves NO staff principal (no roster exists — the Admin surface is
    // live-but-unreachable in prod; the staff leg above is exercised only via an INJECTED context).
    await expect(prodResolveStaffContext(session)).resolves.toBeNull();
  });

  // ── FIX-1 — [ESC-COMM-STAFF-AUTHZ] the staff leg honors `staff_can_support` (advisory-until-DC-3) ──

  it("staff leg invokes the [ESC-COMM-STAFF-AUTHZ] advisory gate with `staff_can_support` (live, honored)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(session, "k-staffauthz");

    const seen: Array<{ staffUserId: string; requiredSlug: string }> = [];
    const spyAuthority: StaffSupportAuthorityCheck = async (input) => {
      seen.push(input);
    };

    const res = await handleUpdateTicket(
      { ticketId, targetStatus: "in_progress" },
      {
        resolveSession: seededSession(session),
        ensureProvisioned,
        resolveStaffContext: injectedStaff,
        staffSupportAuthority: spyAuthority,
        idempotencyKey: "k-staffauthz-1",
      },
    );

    // The staff leg proceeded (advisory, not a hard gate) AND referenced the SPECIFIC required slug.
    expect(res.status).toBe(200);
    expect(seen).toHaveLength(1);
    expect(seen[0]!.requiredSlug).toBe(STAFF_CAN_SUPPORT_SLUG);
    expect(seen[0]!.requiredSlug).toBe("staff_can_support");
    expect(seen[0]!.staffUserId).toBe(STAFF_USER_ID);
  });

  // ── FIX-2 MIN-2 — CONFLICT / OCC lost race (distinct from STATE; retryable) ──

  it("OCC lost race on update → CONFLICT (distinct from STATE), retryable:true, no audit", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(session, "k-occ");
    await handleUpdateTicket(
      { ticketId, targetStatus: "in_progress" },
      {
        resolveSession: seededSession(session),
        ensureProvisioned,
        resolveStaffContext: injectedStaff,
        idempotencyKey: "k-occ-toip",
      },
    ); // now `in_progress`

    // A racing db: the command's LOAD (findFirst) sees `in_progress`, then a concurrent COMMITTED write
    // advances the row to `resolved` BEFORE the CAS runs — so the CAS `WHERE status = 'in_progress'`
    // matches 0 rows (a genuine lost race). Deterministic; real Postgres.
    let raced = false;
    const racingDb = new Proxy(prisma, {
      get(target, prop, receiver) {
        if (prop === "supportTicket") {
          const st = Reflect.get(target, prop, receiver);
          return new Proxy(st, {
            get(t2, p2, r2) {
              if (p2 === "findFirst") {
                return async (...args: unknown[]) => {
                  const row = await (t2 as typeof st).findFirst(
                    ...(args as Parameters<typeof st.findFirst>),
                  );
                  if (!raced && row !== null) {
                    raced = true;
                    await prisma.supportTicket.update({
                      where: { id: ticketId },
                      data: { status: "resolved" },
                    });
                  }
                  return row;
                };
              }
              return Reflect.get(t2, p2, r2);
            },
          });
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as typeof prisma;

    const outcome = await updateTicket(
      { ticketId, targetStatus: "resolved" },
      { actorType: "admin", userId: STAFF_USER_ID },
      { appendAuditRecord },
      racingDb,
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) throw new Error("unreachable: expected a conflict");
    expect(outcome.error.errorClass).toBe("CONFLICT");
    expect(outcome.error.errorClass).not.toBe("STATE");

    // The wire maps CONFLICT → 409 with retryable:true (Doc-4A §14.7 / Doc-5A §9.6).
    const wire = mapUpdateTicket(outcome);
    expect(wire.status).toBe(409);
    if (!("error" in wire.body)) throw new Error("unreachable");
    expect(wire.body.error.retryable).toBe(true);

    // No status-change audit on the lost race (only the two prior legs: create + →in_progress).
    const audit = await auditRowsFor("support_tickets", ticketId);
    expect(audit.map((a) => a.action)).toEqual([
      "support_ticket_created",
      "support_ticket_status_changed",
    ]);
  });

  // ── FIX-2 MIN-3 — keyset pagination (4 SYNTAX-400s, multi-page, filter, valid cursor) ──

  it("list SYNTAX-400s: over-max page_size, malformed cursor, bad status, non-integer page_size", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    await ensureProvisioned(session);
    const deps = { resolveSession: seededSession(session), ensureProvisioned };

    for (const input of [
      { pageSize: 101 }, // over the communication.list_page_size_max (100) bound
      { cursor: "not a valid base64url cursor !!!" }, // malformed opaque cursor
      { status: "bogus" as never }, // non-allowlisted status filter
      { pageSize: 2.5 }, // non-integer page_size
    ]) {
      const res = await handleListTickets(input, deps);
      expect(res.status).toBe(400);
      if (!("error" in res.body)) throw new Error("unreachable: expected a 400");
      expect(res.body.error.error_class).toBe("VALIDATION");
    }
  });

  it("multi-page traversal: page_size=2 over 3 tickets → 2 + 1, no gap/overlap; valid cursor NOT 400", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    await ensureProvisioned(session);
    const deps = { resolveSession: seededSession(session), ensureProvisioned };
    const created: string[] = [];
    for (let i = 0; i < 3; i++) {
      const res = await handleCreateTicket(
        { subject: `page ${i}`, priority: "normal", body: `b${i}` },
        {
          resolveSession: seededSession(session),
          ensureProvisioned,
          idempotencyKey: `k-page-${i}`,
        },
      );
      if (!("result" in res.body)) throw new Error("unreachable");
      created.push(res.body.result.ticketId);
    }

    const p1 = await handleListTickets({ pageSize: 2 }, deps);
    if (!("result" in p1.body)) throw new Error("unreachable");
    expect(p1.body.result.items).toHaveLength(2);
    expect(p1.body.result.pageInfo.hasMore).toBe(true);
    const cursor = p1.body.result.pageInfo.nextCursor!;
    expect(cursor).toBeTruthy();

    const p2 = await handleListTickets({ pageSize: 2, cursor }, deps); // a VALID cursor must NOT 400
    expect(p2.status).toBe(200);
    if (!("result" in p2.body)) throw new Error("unreachable");
    expect(p2.body.result.items).toHaveLength(1);
    expect(p2.body.result.pageInfo.hasMore).toBe(false);

    // No gap / no overlap: the two pages together cover exactly the 3 created ids, each once.
    const seen = [...p1.body.result.items, ...p2.body.result.items].map((i) => i.ticketId);
    expect(new Set(seen).size).toBe(3);
    expect(seen.slice().sort()).toEqual(created.slice().sort());
  });

  it("filter[status] returns only matching tickets (allowlisted filter)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const openTicket = await provisionAndOpenTicket(session, "k-filter-open");
    const resolvedTicket = await provisionAndOpenTicket(session, "k-filter-res");
    await staffResolve(session, resolvedTicket.ticketId); // one ticket → resolved
    const deps = { resolveSession: seededSession(session), ensureProvisioned };

    const openList = await handleListTickets({ status: "open" }, deps);
    if (!("result" in openList.body)) throw new Error("unreachable");
    const openIds = openList.body.result.items.map((i) => i.ticketId);
    expect(openIds).toContain(openTicket.ticketId);
    expect(openIds).not.toContain(resolvedTicket.ticketId);

    const resolvedList = await handleListTickets({ status: "resolved" }, deps);
    if (!("result" in resolvedList.body)) throw new Error("unreachable");
    const resolvedIds = resolvedList.body.result.items.map((i) => i.ticketId);
    expect(resolvedIds).toContain(resolvedTicket.ticketId);
    expect(resolvedIds).not.toContain(openTicket.ticketId);
  });

  // ── FIX-2 MIN-5 — out-of-scope MUTATIONS collapse to NOT_FOUND; list omits other-org tickets ──

  it("out-of-scope update/close/add_message by another org's user → NOT_FOUND (collapse)", async () => {
    const userSession: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(userSession, "k-xscope");

    const otherSession: AuthSession = { authUserId: OTHER_AUTH, email: OTHER_EMAIL };
    await ensureProvisioned(otherSession);
    const otherDeps = (key: string) => ({
      resolveSession: seededSession(otherSession),
      ensureProvisioned,
      idempotencyKey: key,
    });

    const upd = await handleUpdateTicket(
      { ticketId, targetStatus: "closed" },
      otherDeps("k-xs-upd"),
    );
    const cls = await handleCloseTicket({ ticketId }, otherDeps("k-xs-cls"));
    const msg = await handleAddTicketMessage({ ticketId, body: "hi" }, otherDeps("k-xs-msg"));
    for (const res of [upd, cls, msg]) {
      expect(res.status).toBe(404);
      if (!("error" in res.body)) throw new Error("unreachable: expected NOT_FOUND");
      expect(res.body.error.error_class).toBe("NOT_FOUND");
    }
  });

  it("list_tickets for another org OMITS the first org's tickets", async () => {
    const userSession: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { ticketId } = await provisionAndOpenTicket(userSession, "k-xlist");

    const otherSession: AuthSession = { authUserId: OTHER_AUTH, email: OTHER_EMAIL };
    await ensureProvisioned(otherSession);
    const listed = await handleListTickets(
      {},
      { resolveSession: seededSession(otherSession), ensureProvisioned },
    );
    if (!("result" in listed.body)) throw new Error("unreachable");
    expect(listed.body.result.items.some((i) => i.ticketId === ticketId)).toBe(false);
  });

  // ── FIX-2 MIN-6 — a User lacking `can_raise_support_ticket` → 403 (deliberate deny fixture) ──

  it("User without `can_raise_support_ticket` → 403 forbidden (custom no-perms role)", async () => {
    const DENY_AUTH = "01920000-0000-7000-8000-00000000cd01";
    const DENY_USER = "01920000-0000-7000-8000-00000000cd02";
    const DENY_ORG = "01920000-0000-7000-8000-00000000cd03";
    const DENY_ROLE = "01920000-0000-7000-8000-00000000cd04";
    // Teardown any residue, then hand-build a user whose active role grants NO permissions.
    await prisma.membership.deleteMany({ where: { userId: DENY_USER } });
    await prisma.role.deleteMany({ where: { id: DENY_ROLE } });
    await prisma.organization.deleteMany({ where: { id: DENY_ORG } });
    await prisma.user.deleteMany({ where: { id: DENY_USER } });

    await prisma.user.create({ data: { id: DENY_USER, authUserId: DENY_AUTH, status: "active" } });
    await prisma.organization.create({
      data: {
        id: DENY_ORG,
        humanRef: "ORG-COMMDENY-CD03",
        name: "Comm Deny Org",
        slug: "comm-deny-org-cd03",
        orgStatus: "active",
      },
    });
    await prisma.role.create({
      data: { id: DENY_ROLE, organizationId: DENY_ORG, name: "NoPerms", isSystemBundle: false },
    });
    await prisma.membership.create({
      data: {
        id: uuidv7(),
        userId: DENY_USER,
        organizationId: DENY_ORG,
        roleId: DENY_ROLE,
        state: "active",
      },
    });

    const session: AuthSession = { authUserId: DENY_AUTH, email: "comm-deny@example.com" };
    const res = await handleCreateTicket(
      { subject: "should be denied", priority: "high", body: "x" },
      { resolveSession: seededSession(session), ensureProvisioned, idempotencyKey: "k-deny" },
    );
    expect(res.status).toBe(403);
    if (!("error" in res.body)) throw new Error("unreachable: expected a 403");
    expect(res.body.error.error_class).toBe("AUTHORIZATION");

    const count = await prisma.supportTicket.count({ where: { organizationId: DENY_ORG } });
    expect(count).toBe(0);

    // teardown
    await prisma.membership.deleteMany({ where: { userId: DENY_USER } });
    await prisma.role.deleteMany({ where: { id: DENY_ROLE } });
    await prisma.organization.deleteMany({ where: { id: DENY_ORG } });
    await prisma.user.deleteMany({ where: { id: DENY_USER } });
  });

  // ── FIX-2 MIN-7 — audit failure rolls back the business write for update / close / add_message ──

  it("INVARIANT — audit failure rolls back update / close / add_message (parity with create)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;
    const userCtx = { userId: provisioned.userId, activeOrgId: orgId };
    const failing = (() =>
      Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;

    // Fresh ticket driven to `resolved` (via the staff handler) for the close/update rollback checks.
    const { ticketId } = await provisionAndOpenTicket(session, "k-rollback-open");
    await staffResolve(session, ticketId); // → resolved

    // (a) close rollback — the resolved→closed CAS must undo with the failed audit.
    await expect(
      withActiveOrgContext(
        { userId: provisioned.userId, activeOrgId: orgId, isPlatformStaff: false },
        (tx) =>
          closeTicket(
            { ticketId },
            { actorType: "user", ...userCtx },
            { appendAuditRecord: failing },
            tx,
          ),
      ),
    ).rejects.toThrow(/audit append failed/);
    expect((await prisma.supportTicket.findFirst({ where: { id: ticketId } }))?.status).toBe(
      "resolved",
    );

    // (b) update rollback (resolved→closed via update_ticket) — same undo.
    await expect(
      withActiveOrgContext(
        { userId: provisioned.userId, activeOrgId: orgId, isPlatformStaff: false },
        (tx) =>
          updateTicket(
            { ticketId, targetStatus: "closed" },
            { actorType: "user", ...userCtx },
            { appendAuditRecord: failing },
            tx,
          ),
      ),
    ).rejects.toThrow(/audit append failed/);
    expect((await prisma.supportTicket.findFirst({ where: { id: ticketId } }))?.status).toBe(
      "resolved",
    );

    // (c) add_message rollback — the appended row must be undone with the failed audit.
    const before = await prisma.ticketMessage.count({ where: { supportTicketId: ticketId } });
    await expect(
      withActiveOrgContext(
        { userId: provisioned.userId, activeOrgId: orgId, isPlatformStaff: false },
        (tx) =>
          addTicketMessage(
            { ticketId, body: "should roll back" },
            { actorType: "user", ...userCtx },
            { appendAuditRecord: failing },
            tx,
          ),
      ),
    ).rejects.toThrow(/audit append failed/);
    const after = await prisma.ticketMessage.count({ where: { supportTicketId: ticketId } });
    expect(after).toBe(before);
  });
});
