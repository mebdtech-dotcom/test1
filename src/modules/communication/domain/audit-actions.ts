// M6 domain — canonical audit-action constants for the Support Ticket aggregate (the realized
// serialization tokens). Realizes:
//   - `Doc-2_Patch_v1.0.9` — the four BUSINESS actions under the new §9 "Communication" domain
//     ("support ticket create, status change, message append, close"; business semantics only).
//   - `Doc-4H_SupportTicketAuditToken_Patch_v1.0` — the WIRE realization: the `action` token strings,
//     `entity_type`, and `old_value`/`new_value` mapping for those four business actions.
//
// These are the FROZEN serialization constants the M6 support-ticket writes append to
// `core.audit_records` via `core.append_audit_record.v1`. Imported as NAMED CONSTANTS — never a
// hardcoded string literal (Board ruling 2026-06-30). The BUSINESS meaning is owned by rank-0 Doc-2 §9
// (via Doc-2_Patch_v1.0.9); the SERIALIZATION (these tokens + entity_type) is owned by the Doc-4H
// realization patch — so a future token rename touches Doc-4H + this constant, NEVER reopens Doc-2.
//
// M6 emits NO Doc-2 §8 event (R11 / Doc-4H §H7): the audited write is `business write + audit append` in
// ONE transaction — a SIMPLER variant of the D7 pattern (no outbox/event leg).

/** The audit `entity_type` for `communication.support_tickets` rows (Doc-4H patch §1). */
export const SUPPORT_TICKET_ENTITY_TYPE = "support_tickets" as const;

/** The audit `entity_type` for `communication.ticket_messages` rows (Doc-4H patch §1). */
export const TICKET_MESSAGE_ENTITY_TYPE = "ticket_messages" as const;

/**
 * Canonical support-ticket audit actions (Doc-4H_SupportTicketAuditToken_Patch_v1.0 §1 → Doc-2 §9
 * Communication business actions via Doc-2_Patch_v1.0.9). Four DISTINCT tokens so the immutable ledger
 * records the EXECUTED command leg (Doc-4H patch §1 "Action ≡ contract executed"):
 *   CREATED          → `comm.create_ticket.v1` (the ticket + its opener message; audited ONCE — the
 *                      opener message is part of the create aggregate txn, NOT a separate MESSAGE_APPENDED).
 *   STATUS_CHANGED   → `comm.update_ticket.v1` (EVERY transition it performs, incl. `resolved→closed`
 *                      when reached via update_ticket — the §9 Engagement "status change" precedent).
 *   MESSAGE_APPENDED → `comm.add_ticket_message.v1` (append-only; ids + meta only — the `body` is NEVER
 *                      serialized into the audit ledger, it lives in the immutable ticket_messages row).
 *   CLOSED           → `comm.close_ticket.v1` (the dedicated terminal command).
 */
export const SupportTicketAuditAction = {
  /** §9 "support ticket create" → `old_value = null`, `new_value = { status:'open', subject, priority }`. */
  CREATED: "support_ticket_created",
  /** §9 "support ticket status change" → `old_value = { status:prior }`, `new_value = { status:target }`. */
  STATUS_CHANGED: "support_ticket_status_changed",
  /** §9 "support ticket message append" → `old_value = null`, `new_value = { support_ticket_id, author_id }`. */
  MESSAGE_APPENDED: "support_ticket_message_appended",
  /** §9 "support ticket close" → `old_value = { status:'resolved' }`, `new_value = { status:'closed' }`. */
  CLOSED: "support_ticket_closed",
} as const;

export type SupportTicketAuditActionToken =
  (typeof SupportTicketAuditAction)[keyof typeof SupportTicketAuditAction];

// ─────────────────────────────────────────────────────────────────────────────
// BC-COMM-2 Notifications (W3-COMM-2) — INTERIM `[ESC-COMM-AUDIT]` serializations.
//
// Doc-2_Patch_v1.0.9 resolved `[ESC-COMM-AUDIT]` for the BC-COMM-4 mutations ONLY and states verbatim
// that the BC-COMM-2 notification mutations (`create_notification`, `mark_notification_read`,
// `archive_notification`) "remain on their interim binding" pending "a future, separate §9 additive
// that appends to this same Communication row." No canonical §9 business action exists yet for these
// three mutations; the frozen Doc-4H §H6/H.6 interim mechanism applies.
//
// These tokens follow the accepted W3-COMM-GRW-1 precedent (`wave/3-communication-growth` — interim
// `[ESC-COMM-AUDIT]` action strings, gate-closed with a recorded carry): DISTINCT, disclosed interim
// serializations pending the Doc-2 §9 additive + its Doc-4H token-ratification companion (Board item —
// see `docs/backend/wp/W3-COMM-GAP-ANALYSIS.md` N3). They mirror the §9 Communication-row style so the
// future additive can ratify them verbatim. NEVER a hardcoded literal at a call site.
// ─────────────────────────────────────────────────────────────────────────────

/** The audit `entity_type` for `communication.notifications` rows (Doc-4H §HB-2.x audit binding). */
export const NOTIFICATION_ENTITY_TYPE = "notifications" as const;

/**
 * Interim BC-COMM-2 notification audit actions (`[ESC-COMM-AUDIT]` — pending §9 additive; see block
 * comment). Three DISTINCT tokens so the ledger records the executed command leg:
 *   CREATED     → `comm.create_notification.v1` (System consumed-event effect; enters `unread`).
 *   MARKED_READ → `comm.mark_notification_read.v1` (recipient; `unread → read`).
 *   ARCHIVED    → `comm.archive_notification.v1` (recipient; `read → archived` — SD, never deleted).
 */
export const NotificationAuditAction = {
  /** `[ESC-COMM-AUDIT]` interim — `old_value = null`, `new_value = { status:'unread', source_event_id }`. */
  CREATED: "notification_created",
  /** `[ESC-COMM-AUDIT]` interim — `old_value = { status:'unread' }`, `new_value = { status:'read' }`. */
  MARKED_READ: "notification_marked_read",
  /** `[ESC-COMM-AUDIT]` interim — `old_value = { status:'read' }`, `new_value = { status:'archived' }`. */
  ARCHIVED: "notification_archived",
} as const;

export type NotificationAuditActionToken =
  (typeof NotificationAuditAction)[keyof typeof NotificationAuditAction];
