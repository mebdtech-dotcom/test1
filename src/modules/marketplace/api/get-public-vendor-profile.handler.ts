// M2 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `marketplace.get_public_vendor_profile.v1`
// (Doc-4D_Content_v1.0_PassB_Discovery.md §BC-MKT-6 → Doc-5D_Content_v1.0_Pass1.md row 64 →
// `GET /marketplace/public_vendor_profiles/{id}` → `200`; non-disclosure → `404`).
//
// This is the module's OWN wire face: it maps the in-process `GetPublicVendorProfileOutcome` to the
// Doc-5A wire envelope (§5.6 success / §6.1 error), choosing the §6.2 status. It owns NO
// orchestration and touches NO session/transaction — this is an ANONYMOUS public read (no active-org
// context to compose; unlike M1, there is no session to resolve either). Keeping the wire mapping in
// M2's `api/` (not in `app`/`server`) is the One-Owner placement: M2 owns how its read becomes HTTP.
//
// BOUNDARY: imports `@/shared/http` (the platform wire envelope) + the M2 contracts TYPES only
// (type-only — no runtime cycle with the contracts re-export). Pure (no I/O) — fully unit-testable.
//
// Reference-never-restate (Doc-4D PassB Discovery Error Register):
//   - found                → `200` + Doc-5A §5.6 envelope (`result` = the public projection).
//   - invalid input (SYNTAX both-or-neither / malformed identifier) → `400` VALIDATION
//     (`marketplace_discovery_invalid_input`).
//   - not found / not visible (absent, soft-deleted, banned, unpublished — ALL collapse identically)
//     → `404` NOT_FOUND (`marketplace_vendor_not_found`; Doc-6D R9 / Invariant #11).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  GetPublicVendorProfileOutcome,
  PublicVendorProfileView,
} from "@/modules/marketplace/contracts";

// Doc-4D PassB Discovery Error Register — bound by pointer, never coined here.
const INVALID_INPUT_CODE = "marketplace_discovery_invalid_input";
const NOT_FOUND_CODE = "marketplace_vendor_not_found";

/**
 * Map a resolved `marketplace.get_public_vendor_profile.v1` outcome to its Doc-5A wire response.
 */
export function mapGetPublicVendorProfile(
  outcome: GetPublicVendorProfileOutcome,
): WireResponse<PublicVendorProfileView> {
  if (outcome.found) {
    // Doc-5A §5.6 single-entity success: `{ result, reference_id }`, status 200 (Doc-5D row 64).
    return successResponse(outcome.profile, 200);
  }

  if ("invalidInput" in outcome) {
    return errorResponse({
      error_class: "VALIDATION",
      error_code: INVALID_INPUT_CODE,
      message: "Exactly one of vendor_profile_id or human_ref is required.",
      retryable: false,
    });
  }

  // Absent / soft-deleted / banned / unpublished — byte-identical NOT_FOUND (Doc-6D R9).
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: NOT_FOUND_CODE,
    message: "Not found.",
    retryable: false,
  });
}
