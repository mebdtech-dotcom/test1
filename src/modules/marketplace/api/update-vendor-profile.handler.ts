// M2 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `marketplace.update_vendor_profile.v1`
// (Doc-5D Pass-1 row 3 → `PATCH /marketplace/vendor_profiles/{id}` → `200`; Doc-5A §6.2 errors).
// Pure mapper — orchestration lives at the `src/server/marketplace` composition edge.
//
// Statuses: updated → `200`; VALIDATION → `400`; AUTHORIZATION → `403`; NOT_FOUND (absent /
// cross-tenant collapse — §3.6/R9) → `404`; stale concurrency token → `409` CONFLICT; no active-org
// context → `404` non-disclosure collapse (Doc-5A §6.6).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  UpdateVendorProfileOutcome,
  UpdateVendorProfileResult,
} from "@/modules/marketplace/contracts";

const VENDOR_NOT_FOUND_CODE = "marketplace_vendor_not_found";

/**
 * Map a resolved `update_vendor_profile` outcome to its Doc-5A wire response. `null` = the active
 * org was unresolved (fail-closed) → the `404` non-disclosure collapse.
 */
export function mapUpdateVendorProfile(
  outcome: UpdateVendorProfileOutcome | null,
): WireResponse<UpdateVendorProfileResult> {
  if (outcome === null) {
    return errorResponse({
      error_class: "NOT_FOUND",
      error_code: VENDOR_NOT_FOUND_CODE,
      message: "Not found.",
      retryable: false,
    });
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return errorResponse({
    error_class: outcome.error.errorClass,
    error_code: outcome.error.errorCode,
    message: outcome.error.message,
    retryable: false,
  });
}
