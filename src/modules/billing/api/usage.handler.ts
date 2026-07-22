// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `billing.get_usage.v1` (Doc-4I §HB-3.3 /
// Doc-5I §6.2 → `GET /billing/usage` → `200`). Maps the in-process `GetUsageOutcome` to the Doc-5A wire
// envelope. `enforce_quota` (§HB-3.2) is OUT-OF-WIRE — no mapper. Pure (no I/O). BOUNDARY: `@/shared/http`
// + the M7 contract TYPES only.
//
//   - success       → `200` + Doc-5A §5.6 envelope (`result` = `{ items, totals, pageInfo }`, camelCase).
//   - VALIDATION    → `400` (undeclared filter, malformed period/cursor, out-of-bound page_size).
//   - BUSINESS      → `422` (a FUTURE `period` — Doc-5I §6.2).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type { GetUsageOutcome, GetUsageResult } from "@/modules/billing/contracts";

const INVALID_INPUT_CODE = "billing_usage_invalid_input";
const FUTURE_PERIOD_CODE = "billing_usage_future_period";
export const USAGE_VIEW_FORBIDDEN = "billing_usage_view_forbidden";

/** Composition-edge `403` for `get_usage` — no valid active-org context (Doc-4I §HB-3.3 Stage-2 CONTEXT →
 *  AUTHORIZATION) OR `can_view_billing` denied. Org-self read; no caller `org_id`, so no NOT_FOUND leg. */
export function usageViewForbidden(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: USAGE_VIEW_FORBIDDEN,
    message: "An active organization context and can_view_billing are required.",
    retryable: false,
  });
}

/** Map a resolved `billing.get_usage.v1` outcome to its Doc-5A wire response. */
export function mapGetUsage(outcome: GetUsageOutcome): WireResponse<GetUsageResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  if (outcome.errorClass === "VALIDATION") {
    return errorResponse({
      error_class: "VALIDATION",
      error_code: INVALID_INPUT_CODE,
      message: "Invalid filter, period, cursor, or page_size.",
      retryable: false,
    });
  }
  return errorResponse({
    error_class: "BUSINESS",
    error_code: FUTURE_PERIOD_CODE,
    message: "A future period cannot be queried.",
    retryable: false,
  });
}
