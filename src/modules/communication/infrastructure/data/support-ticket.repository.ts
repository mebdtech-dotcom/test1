// M6 infrastructure (PRIVATE) — thin Prisma repository over `communication.support_tickets` +
// `communication.ticket_messages` (Doc-6H §3.4). M6 reading/writing its OWN schema (One Module, One
// Owner); no module outside `communication` imports this file (it is reached via the M6 contracts facade).
//
// SCOPE is enforced in the APP LAYER (authorization is app-layer; RLS is the defense-in-depth backstop —
// CLAUDE.md §2). The reads/loads take an explicit `scopeOrgId`: the User leg passes its SERVER-RESOLVED
// active org (own-org scope); the Admin (Support Staff) leg passes `null` (staff all-scope, Doc-5H §7.3).
// This must NOT rely on RLS alone: the production/app DB connection may be the schema owner (RLS-bypassing),
// so the org predicate is applied HERE too (the identity `get_delegation_grant` party-scope precedent). RLS
// (Doc-6H §3.4) remains the backstop, proven at the DB level by the restricted-role RLS suite. It only
// excludes soft-deleted tickets (`deleted_at IS NULL`). The repository OWNS the SQL and knows NOTHING of
// audit policy — it returns DATA so the COMMAND chooses the audit action (D7 rule 3).

import { prisma, type DbExecutor } from "@/shared/db";
import { uuidv7 } from "@/shared/ids";
import type { SupportTicketStatusValue } from "../../domain/state-machines/support-ticket.state-machine";
import type { TicketMessageView, TicketView } from "../../contracts/types";

/** The live-ticket facts a write command needs (scope org + current status) — RLS-scoped read. */
export interface TicketWriteRow {
  id: string;
  organizationId: string;
  status: SupportTicketStatusValue;
}

/**
 * Load a live ticket for a write/close/message command, scoped in the APP LAYER. `scopeOrgId` = the
 * User's active org (own-org scope) or `null` (Staff all-scope). Returns `null` when the ticket is absent
 * OR outside scope — the caller collapses `null` to the R10 NOT_FOUND protected-fact (never AUTHORIZATION;
 * existence never confirmed). RLS is the backstop; the explicit org predicate is the primary gate.
 */
export async function loadLiveTicket(
  ticketId: string,
  scopeOrgId: string | null,
  db: DbExecutor = prisma,
): Promise<TicketWriteRow | null> {
  const row = await db.supportTicket.findFirst({
    where: {
      id: ticketId,
      deletedAt: null,
      ...(scopeOrgId !== null ? { organizationId: scopeOrgId } : {}),
    },
    select: { id: true, organizationId: true, status: true },
  });
  if (row === null) return null;
  return { id: row.id, organizationId: row.organizationId, status: row.status };
}

/** The created-ticket facts the create command audits (`support_ticket_created`) + returns. */
export interface CreateTicketWrite {
  ticketId: string;
  organizationId: string;
  openedBy: string;
  subject: string;
  priority: string | null;
  createdAt: Date;
  openerMessageId: string;
}

/**
 * Create a `support_tickets` row at `open` + its opener `ticket_messages` row, in ONE aggregate write
 * (Doc-4H §HB-4.1). `activeOrgId` (the SERVER-RESOLVED context — Invariant #5) is the `organization_id`
 * the RLS `WITH CHECK` re-verifies; `actorUserId` = `opened_by` / `author_id` / `created_by`. IDs are
 * app-minted UUIDv7 (the platform generator — never a raw UUID).
 */
export async function createTicketWithOpener(
  activeOrgId: string,
  actorUserId: string,
  input: { subject: string; priority: string; body: string },
  db: DbExecutor = prisma,
): Promise<CreateTicketWrite> {
  const ticketId = uuidv7();
  const messageId = uuidv7();

  const ticket = await db.supportTicket.create({
    data: {
      id: ticketId,
      organizationId: activeOrgId, // RLS WITH CHECK re-verifies = app.active_org
      openedBy: actorUserId,
      status: "open",
      subject: input.subject,
      priority: input.priority,
      createdBy: actorUserId,
      updatedBy: actorUserId,
    },
    select: { id: true, organizationId: true, subject: true, priority: true, createdAt: true },
  });

  await db.ticketMessage.create({
    data: {
      id: messageId,
      supportTicketId: ticketId,
      authorId: actorUserId,
      body: input.body,
      createdBy: actorUserId,
    },
  });

  return {
    ticketId: ticket.id,
    organizationId: ticket.organizationId,
    openedBy: actorUserId,
    subject: ticket.subject,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    openerMessageId: messageId,
  };
}

/** Outcome of a ticket status transition — the contract-internal OCC (Doc-5H §7.5): `conflict` = a lost
 *  race on the observed `from` status (a concurrent transition advanced it). Distinct from STATE (an
 *  illegal edge, adjudicated by the state machine BEFORE this write). */
export type TransitionTicketWrite = { outcome: "updated" } | { outcome: "conflict" };

/**
 * Advance a ticket `from → to` with a contract-internal optimistic-concurrency guard (Doc-5H §7.5 — no
 * client `expected_status`): a conditional UPDATE `WHERE id = ? AND status = <observed from>`. Zero rows
 * affected ⇒ a concurrent write changed the status ⇒ `conflict` (CONFLICT → 409, distinct from STATE).
 * The state machine has already adjudicated sequence legality + actor authority upstream (the command).
 */
export async function transitionTicketStatus(
  input: {
    ticketId: string;
    from: SupportTicketStatusValue;
    to: SupportTicketStatusValue;
    actorUserId: string;
  },
  db: DbExecutor = prisma,
): Promise<TransitionTicketWrite> {
  const result = await db.supportTicket.updateMany({
    where: { id: input.ticketId, status: input.from, deletedAt: null },
    data: { status: input.to, updatedBy: input.actorUserId, updatedAt: new Date() },
  });
  return result.count === 1 ? { outcome: "updated" } : { outcome: "conflict" };
}

/** The appended-message facts the add-message command audits (`support_ticket_message_appended`). */
export interface AppendMessageWrite {
  messageId: string;
  createdAt: Date;
}

/**
 * Append a `ticket_messages` row (Doc-4H §HB-4.3; append-only — never overwrite). `authorId` records
 * the acting User or Staff (Doc-2 §10.7). ID is an app-minted UUIDv7.
 */
export async function appendTicketMessage(
  input: { ticketId: string; authorId: string; body: string },
  db: DbExecutor = prisma,
): Promise<AppendMessageWrite> {
  const messageId = uuidv7();
  const row = await db.ticketMessage.create({
    data: {
      id: messageId,
      supportTicketId: input.ticketId,
      authorId: input.authorId,
      body: input.body,
      createdBy: input.authorId,
    },
    select: { id: true, createdAt: true },
  });
  return { messageId: row.id, createdAt: row.createdAt };
}

/**
 * Read one live ticket (RLS-scoped) with its `ticket_messages` (ordered by id — UUIDv7 ⇒ chronological)
 * for `comm.get_ticket.v1` (Doc-4H §HB-4.5). Returns `null` when absent / out-of-scope (→ NOT_FOUND
 * collapse). Messages inherit the ticket scope (§7.4 / N-05).
 */
export async function getTicketWithMessages(
  ticketId: string,
  scopeOrgId: string | null,
  db: DbExecutor = prisma,
): Promise<TicketView | null> {
  const row = await db.supportTicket.findFirst({
    where: {
      id: ticketId,
      deletedAt: null,
      ...(scopeOrgId !== null ? { organizationId: scopeOrgId } : {}),
    },
    select: {
      id: true,
      organizationId: true,
      openedBy: true,
      status: true,
      subject: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          supportTicketId: true,
          authorId: true,
          body: true,
          createdAt: true,
        },
      },
    },
  });
  if (row === null) return null;

  const messages: TicketMessageView[] = row.messages.map((m) => ({
    messageId: m.id,
    ticketId: m.supportTicketId,
    authorId: m.authorId,
    body: m.body,
    createdAt: m.createdAt,
  }));

  return {
    ticketId: row.id,
    organizationId: row.organizationId,
    openedBy: row.openedBy,
    status: row.status,
    subject: row.subject,
    priority: row.priority,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    messages,
  };
}

/** The list-page row projection (no messages — use `get_ticket` for the thread). */
export interface TicketListRow {
  id: string;
  organizationId: string;
  status: SupportTicketStatusValue;
  subject: string;
  priority: string | null;
  createdAt: Date;
}

/**
 * Fetch one keyset-paginated page of live tickets, scoped in the APP LAYER (`scopeOrgId` = User own-org /
 * `null` = Staff all), ordered by `id` asc (UUIDv7 ⇒ a stable total order / chronological). `afterId` is
 * the decoded cursor position (exclusive); `null` fetches the first page. `status`, when present, is the
 * allowlisted filter (§8.3). Out-of-scope tickets are never enumerated (R10).
 */
export async function listTicketsPage(
  filter: {
    status?: SupportTicketStatusValue;
    afterId: string | null;
    scopeOrgId: string | null;
  },
  limit: number,
  db: DbExecutor = prisma,
): Promise<TicketListRow[]> {
  const rows = await db.supportTicket.findMany({
    where: {
      deletedAt: null,
      ...(filter.scopeOrgId !== null ? { organizationId: filter.scopeOrgId } : {}),
      ...(filter.status !== undefined ? { status: filter.status } : {}),
      ...(filter.afterId !== null ? { id: { gt: filter.afterId } } : {}),
    },
    orderBy: { id: "asc" },
    take: limit,
    select: {
      id: true,
      organizationId: true,
      status: true,
      subject: true,
      priority: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    organizationId: r.organizationId,
    status: r.status,
    subject: r.subject,
    priority: r.priority,
    createdAt: r.createdAt,
  }));
}
