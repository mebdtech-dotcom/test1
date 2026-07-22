// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for the BC-BILL-4 lead-credit reads
// `get_lead_balance` / `list_lead_transactions` (Doc-4I §HB-4.2 / Doc-5I §7). Pure (no I/O).
// BOUNDARY: `@/shared/http` + the M7 contract TYPES only.
//
//   - get_lead_balance → `200` (§5.6; org-self, balance 0 when no account).
//   - list_lead_transactions → `200` (§5.6 list envelope) or `400` VALIDATION (cursor / page_size).
//   - 403 (no active org / `can_view_billing` denied) → the composition edge (org-self read, no NOT_FOUND).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  LeadBalanceView,
  LeadCreditMovementOutcome,
  LeadCreditMovementResult,
  LeadCreditWriteError,
  ListLeadTransactionsOutcome,
  ListLeadTransactionsResult,
} from "@/modules/billing/contracts";

const INVALID_INPUT_CODE = "billing_lead_invalid_input";
export const LEAD_VIEW_FORBIDDEN = "billing_lead_view_forbidden";
export const LEAD_WRITE_INVALID_INPUT = "billing_lead_write_invalid_input";
export const LEAD_WRITE_FORBIDDEN = "billing_lead_write_forbidden";

/** Map a BC-BILL-4 write failure to the Doc-5A §6.1 envelope + §6.2 status (class-mapped — NOT_FOUND 404 ·
 *  REFERENCE/BUSINESS 422 · VALIDATION 400 · AUTHORIZATION 403). Only DEPENDENCY/SYSTEM retry. */
export function mapLeadCreditWriteError(error: LeadCreditWriteError): WireResponse<never> {
  return errorResponse({
    error_class: error.errorClass,
    error_code: error.errorCode,
    message: error.message,
    retryable: error.errorClass === "DEPENDENCY" || error.errorClass === "SYSTEM",
  });
}

/** `billing.credit_lead_account.v1` / `billing.debit_lead_account.v1` outcome → `200` (§5.6) or the §6.1 error. */
export function mapLeadCreditMovement(
  outcome: LeadCreditMovementOutcome,
): WireResponse<LeadCreditMovementResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return mapLeadCreditWriteError(outcome.error);
}

/** Composition-edge `400 VALIDATION` (SYNTAX before the org/permission gate) — the lead-write leg. */
export function leadWriteInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: LEAD_WRITE_INVALID_INPUT,
    message,
    retryable: false,
  });
}

/** Composition-edge `403` for a no-active-org lead write (fail-closed — active org + slug required). */
export function leadWriteForbidden(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: LEAD_WRITE_FORBIDDEN,
    message: "An active organization context and can_manage_billing are required.",
    retryable: false,
  });
}

/** `billing.get_lead_balance.v1` view → `200` (§5.6). Org-self; always resolves (balance 0 when none). */
export function mapGetLeadBalance(view: LeadBalanceView): WireResponse<LeadBalanceView> {
  return successResponse(view, 200);
}

/** `billing.list_lead_transactions.v1` outcome → `200` (§5.6 list envelope) or `400` VALIDATION. */
export function mapListLeadTransactions(
  outcome: ListLeadTransactionsOutcome,
): WireResponse<ListLeadTransactionsResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return errorResponse({
    error_class: "VALIDATION",
    error_code: INVALID_INPUT_CODE,
    message: "Invalid cursor or page_size.",
    retryable: false,
  });
}

/** Composition-edge `403` for the lead-credit reads — no valid active-org context (Doc-4I §HB-4.2 Stage-2
 *  CONTEXT → AUTHORIZATION) OR `can_view_billing` denied. Org-self read; no caller `org_id`, no NOT_FOUND leg. */
export function leadViewForbidden(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: LEAD_VIEW_FORBIDDEN,
    message: "An active organization context and can_view_billing are required.",
    retryable: false,
  });
}
