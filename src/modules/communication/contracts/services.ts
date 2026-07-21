// Public service interfaces + callables for module "communication" — the ONLY cross-module call surface
// (REPOSITORY_STRUCTURE §3). Realizes the BC-COMM-4 Support Communications surface (Doc-4H Pass-B Part-4;
// Doc-5H §7). The contracts facade delegates to its OWN module's private application/infrastructure
// layers (same-module import; the cross-module One-Module rule is untouched — `${from.module}`-scoped).
//
// Every mutation is an AUDITED, ATOMIC write (the M6 variant of D7 — write + audit in ONE tx, NO outbox
// event; Doc-2_Patch_v1.0.11 / Doc-4H_SupportTicketAuditToken_Patch_v1.0). The M0 `appendAuditRecord`
// (`core.append_audit_record.v1`) is INJECTED by the contract TYPE (`@/modules/core/contracts`); the
// app-layer composition edge (`src/server/communication`) supplies the concrete. Reads are unaudited.

import type { DbExecutor } from "@/shared/db";
import {
  addTicketMessageCommand,
  closeTicketCommand,
  createTicketCommand,
  updateTicketCommand,
  type SupportTicketCommandDeps,
} from "../application/commands/support-ticket.command";
import {
  getTicket as getTicketQuery,
  listTickets as listTicketsQuery,
  type ListTicketsDeps,
} from "../application/queries/support-ticket.query";
import {
  claimCommandDedupRecord as claimCommandDedupRecordImpl,
  findCommandDedupRecord as findCommandDedupRecordImpl,
  persistCommandDedupRecord as persistCommandDedupRecordImpl,
  releaseCommandDedupRecord as releaseCommandDedupRecordImpl,
  type FindCommandDedupDeps,
} from "../infrastructure/data/command-dedup.repository";
import type {
  AddTicketMessageInput,
  AddTicketMessageOutcome,
  CloseTicketInput,
  CloseTicketOutcome,
  CommandDedupScope,
  CreateTicketInput,
  CreateTicketOutcome,
  GetTicketResult,
  ListTicketsInput,
  ListTicketsOutcome,
  StoredCommandResponse,
  SupportTicketActorContext,
  UpdateTicketInput,
  UpdateTicketOutcome,
  UserTicketActorContext,
} from "./types";

// Re-export the command/query deps shapes so the app-layer composition edge builds them via
// `@/modules/communication/contracts` (contracts-only).
export type { SupportTicketCommandDeps, ListTicketsDeps, FindCommandDedupDeps };

// ─────────────────────────────────────────────────────────────────────────────
// Doc-2 §7 authority slugs (bound BY POINTER to the frozen catalog tokens — verified seeded in the
// identity permission catalog; NEVER invented). `can_raise_support_ticket` = the User opener (all active
// members; tenant space); `staff_can_support` = the Support Admin (platform-staff space; no private-RFQ
// read). The composition edge gates the User leg via `check_permission(can_raise_support_ticket)` and
// determines the Admin leg via the staff-context port (Doc-5H §7.3).
// ─────────────────────────────────────────────────────────────────────────────

/** Doc-2 §7 tenant slug — the ticket opener (all active members). */
export const CAN_RAISE_SUPPORT_TICKET_SLUG = "can_raise_support_ticket" as const;
/** Doc-2 §7 platform-staff slug — the Support Admin (no private-RFQ read). */
export const STAFF_CAN_SUPPORT_SLUG = "staff_can_support" as const;

// The canonical `comm_support_ticket_*` error-code register (Doc-4H §H7 `comm_` namespace) — one
// module-owned source (`domain/error-codes.ts`), re-exported so the api wire mapper + the app-layer
// composition bind the SAME codes as the command (NIT-1 — no drift across layers).
export { SupportTicketErrorCode } from "../domain/error-codes";
export type { SupportTicketErrorCodeValue } from "../domain/error-codes";

// ─────────────────────────────────────────────────────────────────────────────
// POLICY keys (Doc-3 v1.5 — the full Doc-4A §18.2 reference form; read via `core.config_value_query.v1`,
// NEVER a literal). Seeded by the `communication_support_tickets` migration.
// ─────────────────────────────────────────────────────────────────────────────

/** `communication.idempotency_dedup_window` (duration; start `24h`) — the §B.6 replay window. */
export const COMMUNICATION_DEDUP_WINDOW_KEY =
  "core.system_configuration.communication.idempotency_dedup_window" as const;
/** `communication.list_page_size_max` (integer; start `100`) — the `list_tickets` page-size bound. */
export const COMMUNICATION_LIST_PAGE_SIZE_MAX_KEY =
  "core.system_configuration.communication.list_page_size_max" as const;

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.1…4.4 — the four AUDITED, ATOMIC Support-Ticket write commands. MUST run INSIDE the RLS-scoped
// tx the composition edge opens (User → `withActiveOrg`; Admin → `withStaffContext`); the `db` executor
// carries the GUCs that BOTH the support_tickets/ticket_messages RLS and the audit `WITH CHECK` read.
// ─────────────────────────────────────────────────────────────────────────────

/** `comm.create_ticket.v1` (Doc-4H §HB-4.1; Doc-5H §7.1 → POST /communication/tickets · 201+Location).
 *  User only; enters `open`; audited (`support_ticket_created`) atomically with the aggregate write. */
export type CreateTicket = (
  input: CreateTicketInput,
  ctx: UserTicketActorContext,
  deps: SupportTicketCommandDeps,
  db?: DbExecutor,
) => Promise<CreateTicketOutcome>;
export const createTicket: CreateTicket = (input, ctx, deps, db) =>
  createTicketCommand(input, ctx, deps, db);

/** `comm.update_ticket.v1` (Doc-4H §HB-4.2; Doc-5H §7.1 → POST …/{id}/update_ticket · 200). User/Admin;
 *  actor→transition authority enforced (User → `resolved → closed` only). Audited (`..._status_changed`). */
export type UpdateTicket = (
  input: UpdateTicketInput,
  ctx: SupportTicketActorContext,
  deps: SupportTicketCommandDeps,
  db?: DbExecutor,
) => Promise<UpdateTicketOutcome>;
export const updateTicket: UpdateTicket = (input, ctx, deps, db) =>
  updateTicketCommand(input, ctx, deps, db);

/** `comm.add_ticket_message.v1` (Doc-4H §HB-4.3; Doc-5H §7.1 → POST …/{id}/ticket-messages · 201, no
 *  Location). User/Admin; blocked on a `closed` ticket. Audited (`..._message_appended`; ids+meta only). */
export type AddTicketMessage = (
  input: AddTicketMessageInput,
  ctx: SupportTicketActorContext,
  deps: SupportTicketCommandDeps,
  db?: DbExecutor,
) => Promise<AddTicketMessageOutcome>;
export const addTicketMessage: AddTicketMessage = (input, ctx, deps, db) =>
  addTicketMessageCommand(input, ctx, deps, db);

/** `comm.close_ticket.v1` (Doc-4H §HB-4.4; Doc-5H §7.1 → POST …/{id}/close_ticket · 200). User/Admin;
 *  only a `resolved` ticket closable (`closed → closed` no-op). Audited (`support_ticket_closed`). */
export type CloseTicket = (
  input: CloseTicketInput,
  ctx: SupportTicketActorContext,
  deps: SupportTicketCommandDeps,
  db?: DbExecutor,
) => Promise<CloseTicketOutcome>;
export const closeTicket: CloseTicket = (input, ctx, deps, db) =>
  closeTicketCommand(input, ctx, deps, db);

// ─────────────────────────────────────────────────────────────────────────────
// §HB-4.5 — the two Support-Ticket reads (unaudited; RLS-scoped: User own-org / Staff all). MUST run
// INSIDE the RLS-scoped tx (User → `withActiveOrg`; Admin → `withStaffContext`).
// ─────────────────────────────────────────────────────────────────────────────

/** `comm.get_ticket.v1` (Doc-4H §HB-4.5; Doc-5H §7.1 → GET /communication/tickets/{id} · 200/404).
 *  `scopeOrgId` = the User's active org (own-org scope) or `null` (Staff all-scope) — the app-layer
 *  authorization gate (RLS is the backstop). */
export type GetTicket = (
  ticketId: string,
  scopeOrgId: string | null,
  db?: DbExecutor,
) => Promise<GetTicketResult>;
export const getTicket: GetTicket = (ticketId, scopeOrgId, db) =>
  getTicketQuery(ticketId, scopeOrgId, db);

/** `comm.list_tickets.v1` (Doc-4H §HB-4.5; Doc-5H §7.1 → GET /communication/tickets · 200). Keyset;
 *  `status` allowlisted filter; `page_size` bound by `communication.list_page_size_max` (POLICY).
 *  `scopeOrgId` = the User's active org (own-org) or `null` (Staff all) — the app-layer scope gate. */
export type ListTickets = (
  input: ListTicketsInput,
  scopeOrgId: string | null,
  db?: DbExecutor,
  deps?: ListTicketsDeps,
) => Promise<ListTicketsOutcome>;
export const listTickets: ListTickets = (input, scopeOrgId, db, deps) =>
  listTicketsQuery(input, scopeOrgId, db, deps);

// The M6 WIRE FACES (outcome → Doc-5A envelope + §6.2 status) — the One-Owner placement (M6 owns how its
// writes/reads become HTTP); the app-layer composition edge consumes them via `@/modules/communication/
// contracts` (contracts-only).
export {
  mapAddTicketMessage,
  mapCloseTicket,
  mapCreateTicket,
  mapGetTicket,
  mapListTickets,
  mapUpdateTicket,
} from "../api/support-ticket.handler";

// ─────────────────────────────────────────────────────────────────────────────
// §B.6 — the M6 command-dedup / Idempotency-Key replay store (Doc-6A §10.3 vehicle). M6 owns the store
// (`communication.command_dedup`); the app-layer wire compositions consume these primitives around each
// mutation via `@/modules/communication/contracts` (the store holds no logic on the composition side).
// ─────────────────────────────────────────────────────────────────────────────

export type { CommandDedupScope, StoredCommandResponse };

/** §B.6 replay lookup — the stored response for (contract, actor, org, key) within the POLICY window, or
 *  `null` (execute fresh). */
export type FindCommandDedupRecord = (
  scope: CommandDedupScope,
  windowPolicyKey: string,
  deps: FindCommandDedupDeps,
  db?: DbExecutor,
) => Promise<StoredCommandResponse | null>;
export const findCommandDedupRecord: FindCommandDedupRecord = (scope, windowPolicyKey, deps, db) =>
  findCommandDedupRecordImpl(scope, windowPolicyKey, deps, db);

/** §B.6 pre-execution CLAIM (Doc-4A §14.3 in-flight protection). `"claimed"` = execute; `"lost"` = a
 *  concurrent/committed within-window execution owns the key — re-read and return the stored winner. */
export type ClaimCommandDedupRecord = (
  scope: CommandDedupScope,
  windowPolicyKey: string,
  deps: FindCommandDedupDeps,
  db?: DbExecutor,
) => Promise<"claimed" | "lost">;
export const claimCommandDedupRecord: ClaimCommandDedupRecord = (
  scope,
  windowPolicyKey,
  deps,
  db,
) => claimCommandDedupRecordImpl(scope, windowPolicyKey, deps, db);

/** §B.6 replay persist — store a SUCCESSFUL execution's wire response (upsert on the scope key). */
export type PersistCommandDedupRecord = (
  scope: CommandDedupScope,
  stored: StoredCommandResponse,
  db?: DbExecutor,
) => Promise<void>;
export const persistCommandDedupRecord: PersistCommandDedupRecord = (scope, stored, db) =>
  persistCommandDedupRecordImpl(scope, stored, db);

/** §B.6 claim release (error OUTCOME only — keeps errors uncached and the key un-wedged). */
export type ReleaseCommandDedupRecord = (
  scope: CommandDedupScope,
  db?: DbExecutor,
) => Promise<void>;
export const releaseCommandDedupRecord: ReleaseCommandDedupRecord = (scope, db) =>
  releaseCommandDedupRecordImpl(scope, db);

// ─────────────────────────────────────────────────────────────────────────────
// BC-COMM-3 — `comm.dispatch_invitation_delivery.v1` (the fifth BC-COMM-3 contract, added
// additively — Doc-4H_GrowthDelivery_Patch_v1.0.1 §HB-3.6) + the §2 invitation retry guard
// (W3-COMM-GRW-1). Both are 21.5 SYSTEM effects — never user-initiated; the callers are the
// registered Inngest consumer (`outbox/InvitationIssued`) and the invitation retry job.
// Cross-module reads ride contracts ONLY: M1 via `identity.resolve_invitation_delivery_payload.v1`
// (DH-1 — the SOLE M1 data path; GI-3) and M0 via `readOutboxEvent` (the §2 persisted-envelope
// recovery) — never a foreign table. Defaults below bind the CONCRETE cross-module contract
// callables + the infra no-op transport; tests/composition may override by the same TYPES.
// ─────────────────────────────────────────────────────────────────────────────

import { appendAuditRecord, readOutboxEvent } from "@/modules/core/contracts";
import { resolveInvitationDeliveryPayload } from "@/modules/identity/contracts";
import {
  dispatchInvitationDeliveryCommand,
  type DispatchInvitationDeliveryDeps,
} from "../application/commands/dispatch-invitation-delivery.command";
import {
  retryInvitationDeliveryWorkflow,
  type RetryInvitationDeliveryDeps,
} from "../application/workflows/retry-invitation-delivery.workflow";
import { noopDeliveryProviderTransport } from "../infrastructure/delivery/delivery-provider";
import { listFailedInvitationOriginRows } from "../infrastructure/data/outbound-log.repository";
import type {
  DispatchInvitationDeliveryInput,
  DispatchInvitationDeliveryOutcome,
  RetryInvitationDeliveryInput,
  RetryInvitationDeliveryOutcome,
} from "./types";

// The deps shapes + the infra transport seam types, re-exported so the Inngest composition and
// tests bind them via `@/modules/communication/contracts` (contracts-only).
export type { DispatchInvitationDeliveryDeps, RetryInvitationDeliveryDeps };
export type {
  DeliveryDispatchRequest,
  DeliveryProviderTransport,
} from "../infrastructure/delivery/delivery-provider";
export { noopDeliveryProviderTransport } from "../infrastructure/delivery/delivery-provider";

// The BC-COMM-3 delivery error-code register slice (dev-doc realization; module-owned single
// source — the SupportTicketErrorCode precedent). M1-side delivery codes pass through verbatim.
export { DeliveryDispatchErrorCode } from "../domain/error-codes";
export type { DeliveryDispatchErrorCodeValue } from "../domain/error-codes";

/** The default dep set: concrete M0 audit + M1 resolve + the infra no-op transport (B2-4 — the
 *  real provider adapter replaces the transport behind the same seam; config infra-owned). */
function defaultDispatchDeps(): DispatchInvitationDeliveryDeps {
  return {
    appendAuditRecord,
    resolveDeliveryPayload: resolveInvitationDeliveryPayload,
    transport: noopDeliveryProviderTransport,
  };
}

/** `comm.dispatch_invitation_delivery.v1` (Doc-4H GrowthDelivery §HB-3.6 — 21.5 System
 *  consumed-event effect on `outbox/InvitationIssued`; flow Doc-4L L9-1). Idempotent on
 *  `event_id`; definitive not-resolvable → terminal no-dispatch (no row, never retried);
 *  transient → `DEPENDENCY` retryable. Audited `[ESC-COMM-AUDIT]` in-transaction (System;
 *  no recipient, no URL — GI-3). */
export type DispatchInvitationDelivery = (
  input: DispatchInvitationDeliveryInput,
  deps?: Partial<DispatchInvitationDeliveryDeps>,
) => Promise<DispatchInvitationDeliveryOutcome>;
export const dispatchInvitationDelivery: DispatchInvitationDelivery = (input, deps) =>
  dispatchInvitationDeliveryCommand(input, { ...defaultDispatchDeps(), ...deps });

/** The §2 invitation retry orchestration (guard-first, then the minimal frozen §HB-3.3
 *  `failed → queued` slice with a FRESH signed URL). Not-live → permanent failure: the record
 *  stays `failed`, never re-queued (packet §B4). */
export type RetryInvitationDelivery = (
  input: RetryInvitationDeliveryInput,
  deps?: Partial<RetryInvitationDeliveryDeps>,
) => Promise<RetryInvitationDeliveryOutcome>;
export const retryInvitationDelivery: RetryInvitationDelivery = (input, deps) =>
  retryInvitationDeliveryWorkflow(input, {
    appendAuditRecord,
    readOutboxEvent,
    resolveDeliveryPayload: resolveInvitationDeliveryPayload,
    transport: noopDeliveryProviderTransport,
    ...deps,
  });

/** List the `failed` invitation-origin rows for one channel (the retry-job scan surface —
 *  bounded, oldest-first; invitation-origin = non-null `source_event_id`, patch §2). */
export type ListFailedInvitationDeliveries = (
  channel: "email" | "sms" | "whatsapp",
  limit: number,
) => Promise<Array<{ deliveryLogId: string }>>;
export const listFailedInvitationDeliveries: ListFailedInvitationDeliveries = async (
  channel,
  limit,
) => {
  const rows = await listFailedInvitationOriginRows(channel, limit);
  return rows.map((r) => ({ deliveryLogId: r.id }));
};
