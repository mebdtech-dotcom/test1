// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for the BC-BILL-5 invoice reads
// `get_platform_invoice` / `list_platform_invoices` (Doc-4I §HB-5.4 / Doc-5I §8). Pure (no I/O).
// BOUNDARY: `@/shared/http` + the M7 contract TYPES only.
//
//   - get_platform_invoice → `200` (§5.6) · `400` VALIDATION (bad invoice_id) · `404` NOT_FOUND (absent/cross-org).
//   - list_platform_invoices → `200` (§5.6 list envelope) · `400` VALIDATION (filter/cursor/page_size).
//   - 403 (no active org / `can_view_billing` denied) → the composition edge.

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  GetPlatformInvoiceOutcome,
  InvoiceWriteError,
  IssuePlatformInvoiceOutcome,
  IssuePlatformInvoiceResult,
  ListPlatformInvoicesOutcome,
  ListPlatformInvoicesResult,
  PlatformInvoiceView,
  UpdateInvoiceStatusOutcome,
  UpdateInvoiceStatusResult,
} from "@/modules/billing/contracts";

const INVALID_INPUT_CODE = "billing_invoice_invalid_input";
const NOT_FOUND_CODE = "billing_invoice_not_found";
export const INVOICE_VIEW_FORBIDDEN = "billing_invoice_view_forbidden";
export const INVOICE_WRITE_INVALID_INPUT = "billing_invoice_invalid_input";
export const INVOICE_WRITE_FORBIDDEN = "billing_invoice_forbidden";

/** Map a BC-BILL-5 invoice-write failure to the Doc-5A §6.1 envelope + §6.2 status (class-mapped —
 *  NOT_FOUND 404 · STATE/CONFLICT 409 · REFERENCE/BUSINESS 422 · VALIDATION 400 · AUTHORIZATION 403).
 *  Only DEPENDENCY/SYSTEM retry. */
export function mapInvoiceWriteError(error: InvoiceWriteError): WireResponse<never> {
  return errorResponse({
    error_class: error.errorClass,
    error_code: error.errorCode,
    message: error.message,
    retryable: error.errorClass === "DEPENDENCY" || error.errorClass === "SYSTEM",
  });
}

/** `billing.issue_platform_invoice.v1` outcome → `201` + `Location` (Doc-5I §8) or the §6.1 error. */
export function mapIssuePlatformInvoice(
  outcome: IssuePlatformInvoiceOutcome,
): WireResponse<IssuePlatformInvoiceResult> {
  if (outcome.ok) {
    const res = successResponse(outcome.result, 201);
    return { ...res, headers: { Location: `/billing/invoices/${outcome.result.invoiceId}` } };
  }
  return mapInvoiceWriteError(outcome.error);
}

/** `billing.update_invoice_status.v1` outcome → `200` or the §6.1 error. */
export function mapUpdateInvoiceStatus(
  outcome: UpdateInvoiceStatusOutcome,
): WireResponse<UpdateInvoiceStatusResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return mapInvoiceWriteError(outcome.error);
}

/** Composition-edge `400 VALIDATION` (SYNTAX before the org/permission gate) — the invoice-write leg. */
export function invoiceWriteInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: INVOICE_WRITE_INVALID_INPUT,
    message,
    retryable: false,
  });
}

/** Composition-edge `403` for a no-active-org invoice write (fail-closed — active org + slug required). */
export function invoiceWriteForbidden(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: INVOICE_WRITE_FORBIDDEN,
    message: "An active organization context and can_manage_billing are required.",
    retryable: false,
  });
}

/** `billing.get_platform_invoice.v1` outcome → `200` (§5.6) · `400` VALIDATION · `404` NOT_FOUND. */
export function mapGetPlatformInvoice(
  outcome: GetPlatformInvoiceOutcome,
): WireResponse<PlatformInvoiceView> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  if (outcome.errorClass === "VALIDATION") {
    return errorResponse({
      error_class: "VALIDATION",
      error_code: INVALID_INPUT_CODE,
      message: "Invalid invoice_id.",
      retryable: false,
    });
  }
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: NOT_FOUND_CODE,
    message: "No such invoice for this organization.",
    retryable: false,
  });
}

/** `billing.list_platform_invoices.v1` outcome → `200` (§5.6 list envelope) or `400` VALIDATION. */
export function mapListPlatformInvoices(
  outcome: ListPlatformInvoicesOutcome,
): WireResponse<ListPlatformInvoicesResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return errorResponse({
    error_class: "VALIDATION",
    error_code: INVALID_INPUT_CODE,
    message: "Invalid filter, cursor, or page_size.",
    retryable: false,
  });
}

/** Composition-edge `403` for the invoice reads — no valid active-org context (Doc-4I §HB-5.4 Stage-2
 *  CONTEXT → AUTHORIZATION) OR `can_view_billing` denied. */
export function invoiceViewForbidden(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: INVOICE_VIEW_FORBIDDEN,
    message: "An active organization context and can_view_billing are required.",
    retryable: false,
  });
}
