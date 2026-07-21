// M6 domain — canonical audit-action constants for the Support Ticket aggregate (the realized
// serialization tokens). Realizes:
//   - `Doc-2_Patch_v1.0.11` — the four BUSINESS actions under the new §9 "Communication" domain
//     ("support ticket create, status change, message append, close"; business semantics only).
//   - `Doc-4H_SupportTicketAuditToken_Patch_v1.0` — the WIRE realization: the `action` token strings,
//     `entity_type`, and `old_value`/`new_value` mapping for those four business actions.
//
// These are the FROZEN serialization constants the M6 support-ticket writes append to
// `core.audit_records` via `core.append_audit_record.v1`. Imported as NAMED CONSTANTS — never a
// hardcoded string literal (Board ruling 2026-06-30). The BUSINESS meaning is owned by rank-0 Doc-2 §9
// (via Doc-2_Patch_v1.0.11); the SERIALIZATION (these tokens + entity_type) is owned by the Doc-4H
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
 * Communication business actions via Doc-2_Patch_v1.0.11). Four DISTINCT tokens so the immutable ledger
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
// BC-COMM-3 Outbound Log delivery audit actions (W3-COMM-GRW-1). Doc-2 §9 enumerates NO
// Communication/Delivery audit domain, so — UNLIKE the four support-ticket tokens (which ride a
// folded Doc-4H audit-token patch) — these bind INTERIM BY POINTER on the frozen
// **`[ESC-COMM-AUDIT]`** channel, exactly as the frozen Part-3 H.6 + the folded
// `Doc-4H_GrowthDelivery_Patch_v1.0.1` §HB-3.6 item 7 direct ("nearest enumerated §9 action by
// pointer; NO action invented"): nearest family = Doc-2 §9 Platform "service-role sensitive
// operations" (the M0 outbox-worker `[D-5]` precedent — System-attributed infrastructure legs).
// The token STRINGS are the Doc-4H-class serialization (the support-ticket-slice approach for
// M6-owned actions — DISCLOSED in the WP report; a future Doc-4H audit-token patch ratifies or
// renames them, never reopening Doc-2). Imported as NAMED CONSTANTS — never hardcoded literals
// (Board ruling 2026-06-30).
//
// GI-3 (binding on every call site — Doc-4H GrowthDelivery §HB-3.6 item 7/§5): a delivery audit
// record carries NO `recipient_identifier` and NO signed URL — the external address lives ONLY in
// the channel-log `recipient_ref`; the payload is ids + status facts only.
//
// The audit `entity_type` is the frozen `<channel>_logs` literal — derived per row via
// `channelLogEntityType` (domain/value-objects/delivery-channel.ts), never restated here.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Canonical BC-COMM-3 delivery audit actions (interim `[ESC-COMM-AUDIT]` serializations):
 *   DISPATCHED → `comm.dispatch_invitation_delivery.v1` (§HB-3.6 — the consumed-event dispatch
 *                effect; the channel-log row created at `queued`; System actor;
 *                `new_value = {status:'queued', source_event_id, delivery_reference_id}` — NO
 *                recipient, NO URL).
 *   RETRIED    → the minimal `comm.retry_delivery.v1` slice (frozen §HB-3.3 — `failed → queued`
 *                re-dispatch; System actor; `old_value={status:'failed'}`,
 *                `new_value={status:'queued'}`).
 */
export const DeliveryAuditAction = {
  /** `[ESC-COMM-AUDIT]` — invitation-delivery dispatch (§HB-3.6 item 7; System). */
  DISPATCHED: "invitation_delivery_dispatched",
  /** `[ESC-COMM-AUDIT]` — delivery retry `failed → queued` (frozen §HB-3.3 item 7; System). */
  RETRIED: "delivery_retried",
} as const;

export type DeliveryAuditActionToken =
  (typeof DeliveryAuditAction)[keyof typeof DeliveryAuditAction];
