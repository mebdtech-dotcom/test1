// M6 api (PRIVATE) — the HTTP-handler WIRE MAPPING for the BC-COMM-4 Support-Ticket contracts
// (Doc-4H §HB-4.1…4.5 → Doc-5H §7.1 wire face). Maps the in-process outcomes to the Doc-5A wire
// envelope (§5.6 success / §6.1 error), choosing the §6.2 status. Owns NO orchestration and touches
// NO session/transaction — the app-layer composition edge (`src/server/communication`) resolves the
// actor, runs the command/query inside the RLS-scoped tx, then hands the resolved outcome here.
// One-Owner placement: M6 owns how its writes/reads become HTTP.
//
// BOUNDARY: imports `@/shared/http` (framework wire envelope) + the M6 contract TYPES only (type-only —
// no runtime cycle with the contracts re-export). Pure (no I/O).
//
// Wire realization (Doc-5H §7.1, verbatim):
//   create_ticket      → 201 + `Location: /communication/tickets/{ticket_id}`.
//   update_ticket      → 200 (named state command).
//   add_ticket_message → 201, NO `Location` (a ticket message has no standalone GET URL).
//   close_ticket       → 200 (named terminal command).
//   get_ticket         → 200 (found) / 404 (absent | out-of-scope — R10 collapse).
//   list_tickets       → 200 (scoped page) / 400 (SYNTAX — filter/cursor/page_size).
// Error class → status per Doc-5A §6.2 (`comm_` codes): VALIDATION→400 · AUTHORIZATION→403 (else 404
// collapse — R10) · NOT_FOUND→404 · STATE→409 · CONFLICT→409. List uses camelCase `result` (Doc-5A
// v1.0.1 Option B — the §5.6 single-entity envelope wraps the §8.6 list shape as `result`).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import {
  SupportTicketErrorCode,
  type AddTicketMessageOutcome,
  type AddTicketMessageResult,
  type CloseTicketOutcome,
  type CloseTicketResult,
  type CreateTicketOutcome,
  type CreateTicketResult,
  type GetTicketResult,
  type ListTicketsOutcome,
  type ListTicketsResult,
  type SupportTicketError,
  type TicketView,
  type UpdateTicketOutcome,
  type UpdateTicketResult,
} from "@/modules/communication/contracts";

/**
 * Map a resolved contract error → the Doc-5A §6.1 envelope; §6.2 fixes the status from the class. The
 * `retryable` flag is CLASS-driven (Doc-4A §12/§14.7): a `CONFLICT` (the OCC lost race on an
 * `Idempotency: required` mutation) is **retryable** — a re-read + retry with the same key can succeed
 * (Doc-5A §9.6). Every other reachable class (VALIDATION/AUTHORIZATION/NOT_FOUND/STATE) is NOT retryable
 * (an illegal edge never becomes legal on retry; a scope/auth denial is definitive).
 */
function errorFrom(error: SupportTicketError): WireResponse<never> {
  return errorResponse({
    error_class: error.errorClass,
    error_code: error.errorCode,
    message: error.message,
    retryable: error.errorClass === "CONFLICT",
  });
}

/** The no-context (fail-closed) `404` non-disclosure collapse (Doc-5A §6.6) — never leaks target existence. */
function notFoundCollapse(): WireResponse<never> {
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: SupportTicketErrorCode.NOT_FOUND,
    message: "Not found.",
    retryable: false,
  });
}

/**
 * `comm.create_ticket.v1` → `201` + `Location: /communication/tickets/{ticket_id}` (Doc-5H §7.1). `null`
 * = no active-org context (fail-closed) → the `404` non-disclosure collapse.
 */
export function mapCreateTicket(
  outcome: CreateTicketOutcome | null,
): WireResponse<CreateTicketResult> {
  if (outcome === null) return notFoundCollapse();
  if (!outcome.ok) return errorFrom(outcome.error);
  const created = successResponse(outcome.result, 201);
  return {
    ...created,
    headers: { Location: `/communication/tickets/${outcome.result.ticketId}` },
  };
}

/** `comm.update_ticket.v1` → `200` (Doc-5H §7.1). `null` = no active-org context → `404` collapse. */
export function mapUpdateTicket(
  outcome: UpdateTicketOutcome | null,
): WireResponse<UpdateTicketResult> {
  if (outcome === null) return notFoundCollapse();
  if (!outcome.ok) return errorFrom(outcome.error);
  return successResponse(outcome.result, 200);
}

/**
 * `comm.add_ticket_message.v1` → `201`, NO `Location` (a ticket message has no standalone GET — Doc-5H
 * §7.1). `null` = no active-org context → `404` collapse.
 */
export function mapAddTicketMessage(
  outcome: AddTicketMessageOutcome | null,
): WireResponse<AddTicketMessageResult> {
  if (outcome === null) return notFoundCollapse();
  if (!outcome.ok) return errorFrom(outcome.error);
  return successResponse(outcome.result, 201);
}

/** `comm.close_ticket.v1` → `200` (Doc-5H §7.1). `null` = no active-org context → `404` collapse. */
export function mapCloseTicket(
  outcome: CloseTicketOutcome | null,
): WireResponse<CloseTicketResult> {
  if (outcome === null) return notFoundCollapse();
  if (!outcome.ok) return errorFrom(outcome.error);
  return successResponse(outcome.result, 200);
}

/**
 * `comm.get_ticket.v1` → `200` (found) / `404` (absent | out-of-scope — R10 collapse, byte-identical to
 * a genuine absence). `null` = no context → the SAME `404` collapse.
 */
export function mapGetTicket(result: GetTicketResult | null): WireResponse<TicketView> {
  if (result === null || !result.found) return notFoundCollapse();
  return successResponse(result.ticket, 200);
}

/**
 * `comm.list_tickets.v1` → `200` (scoped page) / `400` (SYNTAX — filter/cursor/page_size). `null` = no
 * context → an EMPTY scoped page (a list never leaks context via a `404`; it scopes its result set).
 */
export function mapListTickets(
  outcome: ListTicketsOutcome | null,
): WireResponse<ListTicketsResult> {
  if (outcome === null) {
    return successResponse({ items: [], pageInfo: { hasMore: false } }, 200);
  }
  if ("invalidInput" in outcome) {
    return errorResponse({
      error_class: "VALIDATION",
      error_code: SupportTicketErrorCode.INVALID_INPUT,
      message: "Invalid status filter, cursor, or page_size.",
      retryable: false,
    });
  }
  return successResponse(outcome, 200);
}
