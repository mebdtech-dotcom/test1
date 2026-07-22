// Public DTOs / IDs for module "communication" (cross-module surface). DTOs/IDs only — domain
// value-objects stay private. Realizes the BC-COMM-4 Support Communications contracts (Doc-4H Pass-B
// Part-4 §HB-4.1…4.6; Doc-5H §7; Doc-6H §3.4).
//
// Reference-never-restate: field names/semantics are owned by Doc-2 §10.7 (the support_tickets /
// ticket_messages column set) + Doc-4H §HB-4.x request/response schemas; bound by pointer, never
// re-authored here. RESULT property names are camelCase (Doc-5A v1.0.1 Option B); request/enum-values/
// identifiers are snake_case on the wire (mapped at the route/composition edge).

import type {
  SupportTicketStatusValue,
  SupportTicketTargetStatus,
} from "../domain/state-machines/support-ticket.state-machine";
import type { NotificationStatusValue } from "../domain/state-machines/notification.state-machine";

export type { SupportTicketStatusValue, SupportTicketTargetStatus, NotificationStatusValue };

// ─────────────────────────────────────────────────────────────────────────────
// Actor context — the SERVER-RESOLVED two-sided actor (Doc-5H §7.3). The command binds attribution +
// the audit-context org from this; it is NEVER client input (Invariant #5). Built at the composition
// edge: the User leg inside `withActiveOrg` (active org resolved), the Admin leg inside a staff context
// (`app.is_platform_staff = true`, no active org — Doc-4A §5.6).
// ─────────────────────────────────────────────────────────────────────────────

/** The acting User (ticket opener; `can_raise_support_ticket`, own active org). */
export interface UserTicketActorContext {
  actorType: "user";
  /** The acting `identity.users` id (audit `actor_id`). */
  userId: string;
  /** The server-resolved active org (the tenant anchor + audit-context org — Invariant #5). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** The acting Support Staff (`staff_can_support`, platform-staff, no active org — Doc-4A §5.6). */
export interface AdminTicketActorContext {
  actorType: "admin";
  /** The acting platform-staff principal's `identity.users` id (audit `actor_id`). */
  userId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** The two-sided actor context for a BC-COMM-4 command (Doc-5H §7.3). */
export type SupportTicketActorContext = UserTicketActorContext | AdminTicketActorContext;

// ─────────────────────────────────────────────────────────────────────────────
// Error model (Doc-5A §6.2; codes in the `comm_` namespace — Doc-4H §H7. The code STRINGS are
// development-document realization; Pass-B fixes class + trigger + retryable). Only the classes the
// BC-COMM-4 registers author are raised: VALIDATION · AUTHORIZATION · NOT_FOUND · STATE · CONFLICT.
// (REFERENCE ≠ DEPENDENCY and STATE ≠ CONFLICT are preserved as distinct in the closed class set —
// the ticket_id ref collapses to NOT_FOUND under the R10 non-disclosure firewall, so REFERENCE is not
// reachable on this surface; both remain unmerged in the platform error model — Doc-4H §H4.)
// ─────────────────────────────────────────────────────────────────────────────

/** Error outcome of a BC-COMM-4 mutation (Doc-4H §HB-4.x Error Register; classes per Doc-5A §6.2). */
export interface SupportTicketError {
  /** Doc-5A §6.2 class → HTTP status (VALIDATION→400 · AUTHORIZATION→403 · NOT_FOUND→404 · STATE→409 ·
   *  CONFLICT→409). */
  errorClass: "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "STATE" | "CONFLICT";
  /** The `comm_support_ticket_*` register code (namespaced `comm_`; realized, never coined upstream). */
  errorCode: string;
  /** Human-safe, non-leaking message (R10 non-disclosure — never confirms out-of-scope existence). */
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.1 — comm.create_ticket.v1 (User; enters `open`). Idempotency-Key is a WIRE HEADER (Doc-5H §7.5),
// handled at the composition edge — NOT a typed input field.
// ─────────────────────────────────────────────────────────────────────────────

/** Input to `comm.create_ticket.v1` (Doc-4H §HB-4.1 request schema). */
export interface CreateTicketInput {
  /** `subject : text : required : non-empty` (Doc-2 §10.7). */
  subject: string;
  /** `priority : enum : required` — `support_tickets.priority` (text; Doc-2 enumerates no values). */
  priority: string;
  /** `body : text : required : non-empty` — the opener `ticket_messages` body (Doc-4H §HB-4.1). */
  body: string;
}

/** Result of a successful `comm.create_ticket.v1` — the created ticket + its opener message (Doc-4H §HB-4.1). */
export interface CreateTicketResult {
  ticketId: string;
  organizationId: string;
  openedBy: string;
  status: "open";
  subject: string;
  priority: string | null;
  createdAt: Date;
  /** The opener `ticket_messages.id` created in the same aggregate transaction. */
  openerMessageId: string;
}

/** Outcome of `comm.create_ticket.v1`. */
export type CreateTicketOutcome =
  | { ok: true; result: CreateTicketResult }
  | { ok: false; error: SupportTicketError };

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.2 — comm.update_ticket.v1 (User / Admin; status/progress).
// ─────────────────────────────────────────────────────────────────────────────

/** Input to `comm.update_ticket.v1` (Doc-4H §HB-4.2 request schema). */
export interface UpdateTicketInput {
  /** The target ticket (path `{id}`). */
  ticketId: string;
  /** `target_status : enum(in_progress,resolved,closed)` — the requested transition (§7.3 actor authority). */
  targetStatus: SupportTicketTargetStatus;
}

/** Result of a successful `comm.update_ticket.v1` (Doc-4H §HB-4.2 response: id, status). */
export interface UpdateTicketResult {
  ticketId: string;
  status: SupportTicketStatusValue;
}

/** Outcome of `comm.update_ticket.v1`. */
export type UpdateTicketOutcome =
  | { ok: true; result: UpdateTicketResult }
  | { ok: false; error: SupportTicketError };

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.3 — comm.add_ticket_message.v1 (User / Admin; append-only).
// ─────────────────────────────────────────────────────────────────────────────

/** Input to `comm.add_ticket_message.v1` (Doc-4H §HB-4.3 request schema). */
export interface AddTicketMessageInput {
  /** The target ticket (path `{id}`). */
  ticketId: string;
  /** `body : text : required : non-empty` (Doc-2 §10.7). */
  body: string;
}

/** Result of a successful `comm.add_ticket_message.v1` — the appended `ticket_messages` row (Doc-4H §HB-4.3). */
export interface AddTicketMessageResult {
  messageId: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: Date;
}

/** Outcome of `comm.add_ticket_message.v1`. */
export type AddTicketMessageOutcome =
  | { ok: true; result: AddTicketMessageResult }
  | { ok: false; error: SupportTicketError };

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.4 — comm.close_ticket.v1 (User / Admin; `resolved → closed`, terminal).
// ─────────────────────────────────────────────────────────────────────────────

/** Input to `comm.close_ticket.v1` (Doc-4H §HB-4.4 request schema). */
export interface CloseTicketInput {
  /** The target ticket (path `{id}`) — a `resolved` ticket. */
  ticketId: string;
}

/** Result of a successful `comm.close_ticket.v1` (Doc-4H §HB-4.4 response: id, status=closed). */
export interface CloseTicketResult {
  ticketId: string;
  status: "closed";
}

/** Outcome of `comm.close_ticket.v1`. */
export type CloseTicketOutcome =
  | { ok: true; result: CloseTicketResult }
  | { ok: false; error: SupportTicketError };

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.5 — comm.get_ticket.v1 · comm.list_tickets.v1 (User / Admin; reads — unaudited).
// ─────────────────────────────────────────────────────────────────────────────

/** A `ticket_messages` projection returned within `get_ticket` (Doc-4H §HB-4.5; inherits ticket scope). */
export interface TicketMessageView {
  messageId: string;
  ticketId: string;
  authorId: string | null;
  body: string;
  createdAt: Date;
}

/** The `get_ticket` projection — the `support_tickets` row + its `ticket_messages` (Doc-4H §HB-4.5). */
export interface TicketView {
  ticketId: string;
  organizationId: string;
  openedBy: string | null;
  status: SupportTicketStatusValue;
  subject: string;
  priority: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessageView[];
}

/** Outcome of `comm.get_ticket.v1` — `found: false` collapses absent AND out-of-scope (R10 / §7.5). */
export type GetTicketResult = { found: true; ticket: TicketView } | { found: false };

/** A `list_tickets` item projection (the scoped page — Doc-4H §HB-4.5). */
export interface TicketListItem {
  ticketId: string;
  organizationId: string;
  status: SupportTicketStatusValue;
  subject: string;
  priority: string | null;
  createdAt: Date;
}

/** Input to `comm.list_tickets.v1` (Doc-4H §HB-4.5 request schema). */
export interface ListTicketsInput {
  /** `status : enum : optional` — allowlisted filter (Doc-4A §9.6). */
  status?: SupportTicketStatusValue;
  /** `page_size : int : optional` — within the `communication.list_page_size_max` POLICY bound. */
  pageSize?: number;
  /** `cursor : string : optional` — opaque keyset token (Doc-5A §8.2). */
  cursor?: string;
}

/** Result of `comm.list_tickets.v1` — the Doc-5A §8.6 list shape (items + page_info). */
export interface ListTicketsResult {
  items: TicketListItem[];
  pageInfo: { hasMore: boolean; nextCursor?: string };
}

/** Outcome of `comm.list_tickets.v1` — `{ invalidInput: true }` is the SYNTAX 400 (filter/cursor/page_size). */
export type ListTicketsOutcome = ListTicketsResult | { invalidInput: true };

// ─────────────────────────────────────────────────────────────────────────────
// §B.6 — the M6 command-dedup / Idempotency-Key replay store (Doc-6A §10.3 vehicle; the frozen
// `Idempotency: required` realization — Doc-4H §H8 / Doc-5H §7.5). Same shapes as the ratified M1 store.
// ─────────────────────────────────────────────────────────────────────────────

/** The replay scope key — a stored response is replayable ONLY to the same (contract, actor, org, key)
 *  that produced it (Doc-4A §7.5 replay-cache poisoning guard). */
export interface CommandDedupScope {
  /** The frozen Doc-4H contract id (e.g. `comm.create_ticket.v1`). */
  contractId: string;
  /** The SERVER-RESOLVED acting principal (never client input). */
  actorUserId: string;
  /** The server-resolved org context; `null` for the org-less staff scope. */
  organizationId: string | null;
  /** The client-generated opaque Idempotency-Key (Doc-5A §9.2; bounded at the wire). */
  idempotencyKey: string;
}

/** A stored wire response (Doc-5A §9.3 — same result, same status, same original `reference_id`). */
export interface StoredCommandResponse {
  status: number;
  /** The stored §5.6/§6.1 envelope, verbatim (incl. the original `reference_id`). */
  body: unknown;
  /** Stored standard HTTP infrastructure headers (e.g. the create `Location`), when any. */
  headers?: Record<string, string>;
}

// ═════════════════════════════════════════════════════════════════════════════
// W3-COMM-2 — BC-COMM-2 Notifications (Doc-4H Pass-B Part-2 §HB-2.1…2.4 + Patch v1.0; Doc-5H §5;
// Doc-6H §3.2). Recipient-scoped User surface + the out-of-wire System consumed-event effect.
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Actor context — the SERVER-RESOLVED recipient (Doc-4H H.2/H.5: User recipient for reads + state
// commands; NO Admin surface in BC-COMM-2). Built at the composition edge inside `withActiveOrg`;
// NEVER client input (Invariant #5). No distinct Doc-2 §7 slug exists for the recipient scope —
// `[ESC-COMM-SLUG]` (no slug invented, none borrowed); the gate is authenticated User + server-resolved
// active org + the recipient row predicate (RLS backstop).
// ─────────────────────────────────────────────────────────────────────────────

/** The acting recipient User (Doc-4H H.5 — `recipient_user_id`/`recipient_organization_id` scope). */
export interface NotificationRecipientContext {
  /** The acting `identity.users` id (audit `actor_id`; gates user-targeted rows). */
  userId: string;
  /** The server-resolved active org (the recipient-tenant anchor — Invariant #5). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Error outcome of a BC-COMM-2 operation (Doc-4H §HB-2.x Error Registers; classes per Doc-5A §6.2).
 *  Reachable classes: VALIDATION · NOT_FOUND (H.9 collapse) · STATE · CONFLICT (OCC — distinct). */
export interface NotificationError {
  errorClass: "VALIDATION" | "NOT_FOUND" | "STATE" | "CONFLICT";
  /** The `comm_notification_*` register code (namespaced `comm_`; realized, never coined upstream). */
  errorCode: string;
  /** Human-safe, non-leaking message (H.9/R10 — never confirms out-of-scope existence). */
  message: string;
}

/** The `notifications` row projection (Doc-2 §10.7 fields; `status` DERIVED per Doc-6H §3.2). */
export interface NotificationView {
  notificationId: string;
  /** `null` = org-wide recipient (visible to any active member of the recipient org). */
  recipientUserId: string | null;
  recipientOrganizationId: string;
  /** The consumed Doc-2 §8 event id (M0 `core.outbox_events` — bare UUID; CM-CR7). */
  sourceEventId: string | null;
  channel: "in_app";
  title: string | null;
  body: string | null;
  /** `payload_jsonb` — structured references by UUID; owns no producer entity (H.10). */
  payload: unknown;
  /** Derived lifecycle state (`unread → read → archived` — Doc-2 §3.7). */
  status: NotificationStatusValue;
  readAt: Date | null;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// §HB-2.1 — comm.create_notification.v1 (System consumed-event effect; OUT-OF-WIRE — Doc-5H §8; no
// HTTP face in any protocol). Recipients arrive PRE-RESOLVED per the frozen request schema (resolution
// per Identity-owned rules is the CONSUMER's obligation — DH-1; `[ESC-COMM-NOTIF-RULES]`, gap analysis N2).
// ─────────────────────────────────────────────────────────────────────────────

/** Input to `comm.create_notification.v1` (Doc-4H §HB-2.1 request schema — internal consumer input). */
export interface CreateNotificationInput {
  /** The inbound Doc-2 §8 event id — the H.8 natural idempotency key. */
  sourceEventId: string;
  /** Recipient user (`null` = org-wide) — resolved upstream per Identity rules (DH-1). */
  recipientUserId: string | null;
  /** Recipient org (the RLS tenant scope). */
  recipientOrganizationId: string;
  /** Rendered notification title (derived from the event per DH-1 rules; no business decision). */
  title: string;
  /** Rendered notification text — producer/Trust outputs consumed as TEXT only (H.10). */
  body: string;
  /** Structured references by UUID (e.g. `rfq_id`); owns no producer entity. Optional. */
  payload?: unknown;
}

/** Outcome of `comm.create_notification.v1` — the created OR idempotently-returned row (H.8). */
export type CreateNotificationOutcome =
  | { ok: true; result: NotificationView; replayed: boolean }
  | { ok: false; error: NotificationError };

// ─────────────────────────────────────────────────────────────────────────────
// §HB-2.3 / §HB-2.4 — the recipient state commands (Idempotency-Key is a WIRE HEADER, handled at the
// composition edge — NOT a typed input field).
// ─────────────────────────────────────────────────────────────────────────────

/** Input to `comm.mark_notification_read.v1` (Doc-4H §HB-2.3). */
export interface MarkNotificationReadInput {
  /** The recipient's own notification (path `{id}`). */
  notificationId: string;
}

/** Result of `comm.mark_notification_read.v1` (Doc-4H §HB-2.3 response: id, status=read, read_at). */
export interface MarkNotificationReadResult {
  notificationId: string;
  status: "read";
  readAt: Date;
}

/** Outcome of `comm.mark_notification_read.v1`. */
export type MarkNotificationReadOutcome =
  | { ok: true; result: MarkNotificationReadResult }
  | { ok: false; error: NotificationError };

/** Input to `comm.archive_notification.v1` (Doc-4H §HB-2.4). */
export interface ArchiveNotificationInput {
  /** The recipient's own notification (path `{id}`) — a `read` notification (Patch Outcome A). */
  notificationId: string;
}

/** Result of `comm.archive_notification.v1` (Doc-4H §HB-2.4 response: id, status=archived). */
export interface ArchiveNotificationResult {
  notificationId: string;
  status: "archived";
}

/** Outcome of `comm.archive_notification.v1`. */
export type ArchiveNotificationOutcome =
  | { ok: true; result: ArchiveNotificationResult }
  | { ok: false; error: NotificationError };

// ─────────────────────────────────────────────────────────────────────────────
// §HB-2.2 — comm.get_notification.v1 · comm.list_notifications.v1 (recipient reads — unaudited).
// ─────────────────────────────────────────────────────────────────────────────

/** Outcome of `comm.get_notification.v1` — `found: false` collapses absent AND non-recipient (H.9). */
export type GetNotificationResult =
  | { found: true; notification: NotificationView }
  | { found: false };

/** Input to `comm.list_notifications.v1` (Doc-4H §HB-2.2 request schema). */
export interface ListNotificationsInput {
  /** `status : enum(unread,read,archived) : optional` — allowlisted filter (Doc-4A §9.6). */
  status?: NotificationStatusValue;
  /** `page_size : int : optional` — within the `communication.list_page_size_max` POLICY bound. */
  pageSize?: number;
  /** `cursor : string : optional` — opaque keyset token (Doc-5A §8.2). */
  cursor?: string;
}

/** Result of `comm.list_notifications.v1` — the Doc-5A §8.6 list shape (items + page_info). */
export interface ListNotificationsResult {
  items: NotificationView[];
  pageInfo: { hasMore: boolean; nextCursor?: string };
}

/** Outcome of `comm.list_notifications.v1` — `{ invalidInput: true }` is the SYNTAX 400. */
export type ListNotificationsOutcome = ListNotificationsResult | { invalidInput: true };
