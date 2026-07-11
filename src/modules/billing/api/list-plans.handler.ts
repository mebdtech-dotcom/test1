// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `billing.list_plans.v1` (Doc-4I §HB-1.4 /
// Doc-5I §4 → `GET /billing/plans` → `200`).
//
// Maps the in-process `ListPlansOutcome` to the Doc-5A wire envelope. List realization (established
// program convention — Doc-5A v1.0.1 Option B; see `src/modules/marketplace/api/list-vendor-directory.handler.ts`):
// `successResponse({ items, pageInfo }, 200)` — the §5.6 single-entity envelope wraps the §8.6 list shape
// as `result`, camelCase. BOUNDARY: imports `@/shared/http` + the M7 contract TYPES only (type-only). Pure.
//
//   - success       → `200` + Doc-5A §5.6 envelope (`result` = `{ items, pageInfo }`).
//   - invalid input (undeclared/out-of-range filter, malformed cursor, out-of-bound page_size)
//                   → `400` VALIDATION (`billing_plan_invalid_input`).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type { ListPlansOutcome, ListPlansResult } from "@/modules/billing/contracts";

const INVALID_INPUT_CODE = "billing_plan_invalid_input";

/**
 * Map a resolved `billing.list_plans.v1` outcome to its Doc-5A wire response.
 */
export function mapListPlans(outcome: ListPlansOutcome): WireResponse<ListPlansResult> {
  if ("invalidInput" in outcome) {
    return errorResponse({
      error_class: "VALIDATION",
      error_code: INVALID_INPUT_CODE,
      message: "Invalid filter, cursor, or page_size.",
      retryable: false,
    });
  }

  return successResponse(outcome, 200);
}
