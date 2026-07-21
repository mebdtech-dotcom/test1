// M2 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `marketplace.create_vendor_profile.v1`
// (Doc-5D Pass-1 row 1 → `POST /marketplace/vendor_profiles` → `201`; Doc-5A §6.2 errors). Maps the
// in-process command outcome to the Doc-5A envelope; owns NO orchestration, session, or transaction
// (the `src/server/marketplace` composition edge does — One-Owner placement: M2 owns how its write
// becomes HTTP). Pure (no I/O); imports `@/shared/http` + M2 contract TYPES only.
//
// Statuses: created → `201` (Doc-5A §5.5 — the route adds the `Location` header); VALIDATION →
// `400`; AUTHORIZATION → `403`; CONFLICT → `409`; no active-org context → `404` non-disclosure
// collapse (Doc-5A §6.6 — never leak whether an org/vendor exists).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  CreateVendorProfileOutcome,
  CreateVendorProfileResult,
} from "@/modules/marketplace/contracts";

// Doc-4D §D4 register — the no-context collapse reuses the frozen NOT_FOUND code (never coined).
const VENDOR_NOT_FOUND_CODE = "marketplace_vendor_not_found";

/**
 * Map a resolved `create_vendor_profile` outcome to its Doc-5A wire response. `null` = the active
 * org was unresolved (fail-closed) → the `404` non-disclosure collapse.
 */
export function mapCreateVendorProfile(
  outcome: CreateVendorProfileOutcome | null,
): WireResponse<CreateVendorProfileResult> {
  if (outcome === null) {
    return errorResponse({
      error_class: "NOT_FOUND",
      error_code: VENDOR_NOT_FOUND_CODE,
      message: "Not found.",
      retryable: false,
    });
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 201);
  }
  return errorResponse({
    error_class: outcome.error.errorClass,
    error_code: outcome.error.errorCode,
    message: outcome.error.message,
    retryable: false,
  });
}
