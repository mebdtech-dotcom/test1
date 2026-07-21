// M2 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `marketplace.get_vendor_profile.v1`, the
// CONTROLLING-ORG (User) leg (Doc-5D Pass-1 row 6 → `GET /marketplace/vendor_profiles/{id}` → `200`).
// Pure mapper; the Public projection is the separate row-64 endpoint (R5 — never merged).
//
// Statuses: found → `200`; malformed key → `400` VALIDATION; absent / cross-tenant / soft-deleted /
// no active-org context → the SAME `404` non-disclosure collapse (Doc-5A §6.6).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  GetOwnVendorProfileOutcome,
  OwnVendorProfileView,
} from "@/modules/marketplace/contracts";

const VENDOR_NOT_FOUND_CODE = "marketplace_vendor_not_found";
const VENDOR_INVALID_INPUT_CODE = "marketplace_vendor_invalid_input";

/**
 * Map a resolved Controlling-Org `get_vendor_profile` outcome to its Doc-5A wire response. `null` =
 * the active org was unresolved (fail-closed) → the `404` collapse (byte-identical to absent).
 */
export function mapGetOwnVendorProfile(
  outcome: GetOwnVendorProfileOutcome | null,
): WireResponse<OwnVendorProfileView> {
  if (outcome !== null && "invalidInput" in outcome && outcome.invalidInput) {
    return errorResponse({
      error_class: "VALIDATION",
      error_code: VENDOR_INVALID_INPUT_CODE,
      message: "Exactly one well-formed identifier (vendor_profile_id XOR human_ref) is required.",
      retryable: false,
    });
  }
  if (outcome !== null && outcome.found) {
    return successResponse(outcome.profile, 200);
  }
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: VENDOR_NOT_FOUND_CODE,
    message: "Not found.",
    retryable: false,
  });
}
