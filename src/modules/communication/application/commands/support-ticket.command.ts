// M6 application (PRIVATE) — the BC-COMM-4 Support-Ticket write commands (Doc-4H §HB-4.1…4.4; Doc-5H §7).
//
// ORCHESTRATION ONLY (owns no state): validate → (state adjudication) → write (repository) → append
// audit, all on the SAME caller-supplied RLS-scoped transaction executor. The command knows BOTH the
// business write AND the audit obligation — wiring them atomically — but knows neither the SQL (the
// repository owns it) NOR the audit MECHANISM (the M0 `core.append_audit_record.v1` facade owns it).
//
// THE M6 AUDITED-WRITE VARIANT (Doc-2_Patch_v1.0.9 / Doc-4H_SupportTicketAuditToken_Patch_v1.0): a
// SIMPLER D7 — `business write + audit append` in ONE transaction, **NO outbox/event leg** (BC-COMM-4
// emits no Doc-2 §8 event — R11 / Doc-4H §H7). The two invariants hold by sharing ONE tx:
//   • No business write without an audit row — the append runs in the SAME tx; if it throws, the tx
//     rolls back and the write is undone.
//   • No audit row without a successful write — the audit follows the write in the same tx.
//
// AUDIT ACTIONS (canonical, frozen — `domain/audit-actions.ts`): create → `support_ticket_created`
// (ONCE — the opener message is part of the create aggregate txn, not separately audited); update →
// `support_ticket_status_changed`; add-message → `support_ticket_message_appended` (ids + meta only —
// the `body` is NEVER written to the ledger); close → `support_ticket_closed`. Never a hardcoded literal.
//
// TWO-SIDED ACTOR (Doc-5H §7.3): the User leg runs on a `withActiveOrg` tx (audit org = active org);
// the Admin (Support Staff) leg runs on a staff-context tx (`app.is_platform_staff = true`, no active
// org — audit org = the ticket's own org). Actor authority for TRANSITIONS is the state machine's
// concern (User may only `resolved → closed`); the composition edge owns the slug gate
// (`can_raise_support_ticket` via `check_permission`) / staff-basis determination.

import { prisma, type DbExecutor } from "@/shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  appendTicketMessage,
  createTicketWithOpener,
  loadLiveTicket,
  transitionTicketStatus,
} from "../../infrastructure/data/support-ticket.repository";
import { adjudicateTransition } from "../../domain/state-machines/support-ticket.state-machine";
import {
  SUPPORT_TICKET_ENTITY_TYPE,
  SupportTicketAuditAction,
  TICKET_MESSAGE_ENTITY_TYPE,
} from "../../domain/audit-actions";
import { SupportTicketErrorCode } from "../../domain/error-codes";
import type {
  AddTicketMessageInput,
  AddTicketMessageOutcome,
  CloseTicketInput,
  CloseTicketOutcome,
  CreateTicketInput,
  CreateTicketOutcome,
  SupportTicketActorContext,
  SupportTicketError,
  UpdateTicketInput,
  UpdateTicketOutcome,
  UserTicketActorContext,
} from "../../contracts/types";

/** Injected Module 0 contract service — the ONLY audit-write surface (D7 rule 4). */
export interface SupportTicketCommandDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

// Doc-4H §H7 `comm_` error register — the codes live in one module-owned source (`domain/error-codes.ts`).
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TARGET_STATUSES: ReadonlySet<string> = new Set(["in_progress", "resolved", "closed"]);

function validationError(message: string): SupportTicketError {
  return { errorClass: "VALIDATION", errorCode: SupportTicketErrorCode.INVALID_INPUT, message };
}
function notFoundError(): SupportTicketError {
  // R10 non-disclosure: uniform, existence never confirmed (byte-identical to a genuine absence).
  return {
    errorClass: "NOT_FOUND",
    errorCode: SupportTicketErrorCode.NOT_FOUND,
    message: "Not found.",
  };
}
function stateError(message: string): SupportTicketError {
  return { errorClass: "STATE", errorCode: SupportTicketErrorCode.INVALID_STATE, message };
}
function conflictError(): SupportTicketError {
  return {
    errorClass: "CONFLICT",
    errorCode: SupportTicketErrorCode.CONFLICT,
    message: "The ticket was modified concurrently; reload and retry.",
  };
}

/** The audit-context org (Doc-2 §9): the User's active org, or (Admin leg) the ticket's own org. */
function auditOrgId(ctx: SupportTicketActorContext, ticketOrgId: string): string {
  return ctx.actorType === "user" ? ctx.activeOrgId : ticketOrgId;
}

/** The APP-LAYER read scope (own-org for the User; `null` = all for Staff — Doc-5H §7.3). Authorization
 *  is app-layer (RLS is the backstop): a User can only load/act on tickets in its own active org. */
function scopeOf(ctx: SupportTicketActorContext): string | null {
  return ctx.actorType === "user" ? ctx.activeOrgId : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.1 — comm.create_ticket.v1 (User only; enters `open`; audits ONCE — `support_ticket_created`).
// ─────────────────────────────────────────────────────────────────────────────

export async function createTicketCommand(
  input: CreateTicketInput,
  ctx: UserTicketActorContext,
  deps: SupportTicketCommandDeps,
  db: DbExecutor = prisma,
): Promise<CreateTicketOutcome> {
  // (1) SYNTAX (Doc-4H §HB-4.1 Stage 1): subject/body non-empty; priority present.
  if (typeof input.subject !== "string" || input.subject.trim().length === 0) {
    return { ok: false, error: validationError("subject is required (non-empty).") };
  }
  if (typeof input.priority !== "string" || input.priority.trim().length === 0) {
    return { ok: false, error: validationError("priority is required.") };
  }
  if (typeof input.body !== "string" || input.body.trim().length === 0) {
    return { ok: false, error: validationError("body is required (non-empty).") };
  }

  // (2) WRITE — the ticket at `open` + its opener message, in one aggregate write (repo owns the SQL).
  const write = await createTicketWithOpener(
    ctx.activeOrgId,
    ctx.userId,
    { subject: input.subject, priority: input.priority, body: input.body },
    db,
  );

  // (3) AUDIT — atomic with the write (SAME tx); canonical `support_ticket_created` (ONCE — the opener
  //     message is NOT separately audited). If this throws, the whole tx rolls back (Invariant 1).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: SUPPORT_TICKET_ENTITY_TYPE,
      entityId: write.ticketId,
      action: SupportTicketAuditAction.CREATED,
      oldValue: null,
      newValue: { status: "open", subject: input.subject, priority: input.priority },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: {
      ticketId: write.ticketId,
      organizationId: write.organizationId,
      openedBy: write.openedBy,
      status: "open",
      subject: write.subject,
      priority: write.priority,
      createdAt: write.createdAt,
      openerMessageId: write.openerMessageId,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.2 — comm.update_ticket.v1 (User / Admin; audits `support_ticket_status_changed`).
// ─────────────────────────────────────────────────────────────────────────────

export async function updateTicketCommand(
  input: UpdateTicketInput,
  ctx: SupportTicketActorContext,
  deps: SupportTicketCommandDeps,
  db: DbExecutor = prisma,
): Promise<UpdateTicketOutcome> {
  // (1) SYNTAX.
  if (typeof input.ticketId !== "string" || !UUID_PATTERN.test(input.ticketId)) {
    return { ok: false, error: validationError("id must be a UUID.") };
  }
  if (typeof input.targetStatus !== "string" || !TARGET_STATUSES.has(input.targetStatus)) {
    return {
      ok: false,
      error: validationError("target_status must be one of: in_progress, resolved, closed."),
    };
  }

  // (2) SCOPE (R10 collapse) — RLS-scoped load; absent/out-of-scope ⇒ NOT_FOUND (never AUTHORIZATION).
  const ticket = await loadLiveTicket(input.ticketId, scopeOf(ctx), db);
  if (ticket === null) {
    return { ok: false, error: notFoundError() };
  }

  // (3) STATE + ACTOR AUTHORITY (Doc-4H §HB-4.2 Stage 6): the state machine adjudicates BOTH. An
  //     out-of-sequence edge → STATE; a legal-but-staff-only edge requested by a User → AUTHORIZATION
  //     (actor-denied, NOT a relabeled STATE — Doc-5H §7.5).
  const decision = adjudicateTransition(ctx.actorType, ticket.status, input.targetStatus);
  if (decision.kind === "illegal_sequence") {
    return {
      ok: false,
      error: stateError(
        `Illegal transition ${ticket.status} → ${input.targetStatus} (out of sequence).`,
      ),
    };
  }
  if (decision.kind === "actor_unauthorized") {
    return {
      ok: false,
      error: {
        errorClass: "AUTHORIZATION",
        errorCode: SupportTicketErrorCode.FORBIDDEN,
        message: "That transition is performed by support staff only.",
      },
    };
  }

  // (4) WRITE — contract-internal OCC (Doc-5H §7.5): CAS on the observed status; lost race ⇒ CONFLICT
  //     (distinct from STATE). NO client `expected_status`.
  const write = await transitionTicketStatus(
    { ticketId: ticket.id, from: ticket.status, to: input.targetStatus, actorUserId: ctx.userId },
    db,
  );
  if (write.outcome === "conflict") {
    return { ok: false, error: conflictError() };
  }

  // (5) AUDIT — atomic; `support_ticket_status_changed` for EVERY transition (incl. resolved→closed via
  //     update_ticket — the invoked command distinguishes it from `close_ticket`'s CLOSED).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: ctx.actorType,
      organizationId: auditOrgId(ctx, ticket.organizationId),
      entityType: SUPPORT_TICKET_ENTITY_TYPE,
      entityId: ticket.id,
      action: SupportTicketAuditAction.STATUS_CHANGED,
      oldValue: { status: ticket.status },
      newValue: { status: input.targetStatus },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { ticketId: ticket.id, status: input.targetStatus } };
}

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.3 — comm.add_ticket_message.v1 (User / Admin; audits `support_ticket_message_appended`).
// ─────────────────────────────────────────────────────────────────────────────

export async function addTicketMessageCommand(
  input: AddTicketMessageInput,
  ctx: SupportTicketActorContext,
  deps: SupportTicketCommandDeps,
  db: DbExecutor = prisma,
): Promise<AddTicketMessageOutcome> {
  // (1) SYNTAX.
  if (typeof input.ticketId !== "string" || !UUID_PATTERN.test(input.ticketId)) {
    return { ok: false, error: validationError("id must be a UUID.") };
  }
  if (typeof input.body !== "string" || input.body.trim().length === 0) {
    return { ok: false, error: validationError("body is required (non-empty).") };
  }

  // (2) SCOPE (R10 collapse).
  const ticket = await loadLiveTicket(input.ticketId, scopeOf(ctx), db);
  if (ticket === null) {
    return { ok: false, error: notFoundError() };
  }

  // (3) STATE — a message cannot be appended to a `closed` ticket (Doc-4H §HB-4.3 Stage 6).
  if (ticket.status === "closed") {
    return { ok: false, error: stateError("Cannot append a message to a closed ticket.") };
  }

  // (4) WRITE — append-only (Doc-2 §10.7; never overwrite).
  const write = await appendTicketMessage(
    { ticketId: ticket.id, authorId: ctx.userId, body: input.body },
    db,
  );

  // (5) AUDIT — `support_ticket_message_appended`; ids + meta ONLY (the `body` is NEVER serialized).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: ctx.actorType,
      organizationId: auditOrgId(ctx, ticket.organizationId),
      entityType: TICKET_MESSAGE_ENTITY_TYPE,
      entityId: write.messageId,
      action: SupportTicketAuditAction.MESSAGE_APPENDED,
      oldValue: null,
      newValue: { support_ticket_id: ticket.id, author_id: ctx.userId },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: {
      messageId: write.messageId,
      ticketId: ticket.id,
      authorId: ctx.userId,
      body: input.body,
      createdAt: write.createdAt,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.4 — comm.close_ticket.v1 (User / Admin; `resolved → closed`; audits `support_ticket_closed`).
// ─────────────────────────────────────────────────────────────────────────────

export async function closeTicketCommand(
  input: CloseTicketInput,
  ctx: SupportTicketActorContext,
  deps: SupportTicketCommandDeps,
  db: DbExecutor = prisma,
): Promise<CloseTicketOutcome> {
  // (1) SYNTAX.
  if (typeof input.ticketId !== "string" || !UUID_PATTERN.test(input.ticketId)) {
    return { ok: false, error: validationError("id must be a UUID.") };
  }

  // (2) SCOPE (R10 collapse).
  const ticket = await loadLiveTicket(input.ticketId, scopeOf(ctx), db);
  if (ticket === null) {
    return { ok: false, error: notFoundError() };
  }

  // (3) STATE — `closed → closed` is an idempotent no-op (no write, no audit; Doc-4H §HB-4.4). A
  //     non-`resolved` (and non-`closed`) ticket cannot be closed → STATE.
  if (ticket.status === "closed") {
    return { ok: true, result: { ticketId: ticket.id, status: "closed" } };
  }
  if (ticket.status !== "resolved") {
    return { ok: false, error: stateError("Only a resolved ticket can be closed.") };
  }

  // (4) WRITE — CAS `resolved → closed`; lost race ⇒ CONFLICT (distinct from STATE).
  const write = await transitionTicketStatus(
    { ticketId: ticket.id, from: "resolved", to: "closed", actorUserId: ctx.userId },
    db,
  );
  if (write.outcome === "conflict") {
    return { ok: false, error: conflictError() };
  }

  // (5) AUDIT — `support_ticket_closed` (the dedicated terminal command).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: ctx.actorType,
      organizationId: auditOrgId(ctx, ticket.organizationId),
      entityType: SUPPORT_TICKET_ENTITY_TYPE,
      entityId: ticket.id,
      action: SupportTicketAuditAction.CLOSED,
      oldValue: { status: "resolved" },
      newValue: { status: "closed" },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { ticketId: ticket.id, status: "closed" } };
}
