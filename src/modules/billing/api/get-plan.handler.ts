// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `billing.get_plan.v1` (Doc-4I §HB-1.4 /
// Doc-5I §4 → `GET /billing/plans/{plan_id}` → `200`; SYNTAX → `400`; absent/retired → `404`).
//
// The module's OWN wire face: maps the in-process `GetPlanOutcome` to the Doc-5A wire envelope
// (§5.6 success / §6.1 error), choosing the §6.2 status. Owns NO orchestration; touches NO session/
// transaction (auth is the composition's job — Doc-5I §3.6). Marketplace precedent:
// `get-public-vendor-profile.handler.ts`. BOUNDARY: imports `@/shared/http` + the M7 contract TYPES
// only (type-only — no runtime cycle with the contracts re-export). Pure (no I/O).
//
// Error codes bound to the frozen `billing_<domain>_<code>` FORM (Doc-4A §12 / §H.4) — the code STRING
// is the realization slot, not a coined contract (Doc-5I §3.8 fixes the class→status map + envelope; the
// per-contract token is filled here, as M2 fills `marketplace_vendor_not_found`).
//   - found        → `200` + Doc-5A §5.6 envelope (`result` = the plan projection).
//   - invalid input (malformed `plan_id`) → `400` VALIDATION (`billing_plan_invalid_input`).
//   - not found / retired (platform-owned catalog — non-disclosure N/A) → `404` (`billing_plan_not_found`).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type { GetPlanOutcome, PlanView } from "@/modules/billing/contracts";

const INVALID_INPUT_CODE = "billing_plan_invalid_input";
const NOT_FOUND_CODE = "billing_plan_not_found";

/**
 * Map a resolved `billing.get_plan.v1` outcome to its Doc-5A wire response.
 */
export function mapGetPlan(outcome: GetPlanOutcome): WireResponse<PlanView> {
  if (outcome.found) {
    // Doc-5A §5.6 single-entity success: `{ result, reference_id }`, status 200 (Doc-5I §4).
    return successResponse(outcome.plan, 200);
  }

  if ("invalidInput" in outcome) {
    return errorResponse({
      error_class: "VALIDATION",
      error_code: INVALID_INPUT_CODE,
      message: "plan_id must be a valid UUID.",
      retryable: false,
    });
  }

  // Absent OR retired (soft-deleted) — the platform-owned catalog has no non-disclosure concern; both
  // resolve to the same `404` (Doc-5I §4 "NOT_FOUND only if plan_id does not exist" on the visible surface).
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: NOT_FOUND_CODE,
    message: "Not found.",
    retryable: false,
  });
}
