// M2 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `marketplace.resolve_vendor_slug.v1`
// (Doc-4D_VendorSlugResolve_Patch_v1.0.4 / PATCH-4D-VSR-01 → Doc-5D_VendorSlugResolve_Patch_v1.0.2 /
// PATCH-5D-VSR-01 → `GET /marketplace/vendor_slug_resolutions/{slug}` → `200`; non-disclosure → `404`).
//
// This is the module's OWN wire face: maps the in-process `ResolveVendorSlugOutcome` to the Doc-5A
// wire envelope (§5.6 success / §6.1 error). Anonymous public read — no session, no active-org
// context to compose. One-Owner placement: M2 owns how its read becomes HTTP.
//
// BOUNDARY: imports `@/shared/http` + the M2 contracts TYPES only (type-only). Pure (no I/O).
//
// Reference-never-restate (Doc-4D PATCH-4D-VSR-01 Error Register):
//   - current | migrated   → `200` + Doc-5A §5.6 envelope. The wire `result` carries ONLY the frozen
//     fields (no vendor metadata, no `human_ref` on `current` — the Response Contract's binding
//     exclusion; `ResolveVendorSlugResult` already carries no more than that).
//   - malformed slug (SYNTAX) → `400` VALIDATION (`marketplace_vendor_slug_invalid_input`).
//   - not found (absent, live-but-invisible, OR a migrated-but-now-invisible target — the two-hop
//     non-disclosure case — ALL collapse identically) → `404` NOT_FOUND
//     (`marketplace_vendor_slug_not_found`; Invariant #11).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  ResolveVendorSlugOutcome,
  ResolveVendorSlugResult,
} from "@/modules/marketplace/contracts";

// Doc-4D PATCH-4D-VSR-01 Error Register — bound by pointer, never coined here.
const INVALID_INPUT_CODE = "marketplace_vendor_slug_invalid_input";
const NOT_FOUND_CODE = "marketplace_vendor_slug_not_found";

/**
 * Map a resolved `marketplace.resolve_vendor_slug.v1` outcome to its Doc-5A wire response.
 */
export function mapResolveVendorSlug(
  outcome: ResolveVendorSlugOutcome,
): WireResponse<ResolveVendorSlugResult> {
  if (outcome.status === "invalid_input") {
    return errorResponse({
      error_class: "VALIDATION",
      error_code: INVALID_INPUT_CODE,
      message: "Malformed slug.",
      retryable: false,
    });
  }

  if (outcome.status === "not_found") {
    return errorResponse({
      error_class: "NOT_FOUND",
      error_code: NOT_FOUND_CODE,
      message: "Not found.",
      retryable: false,
    });
  }

  // `current` | `migrated` — Doc-5A §5.6 single-entity success, status 200 (Doc-5D row 66).
  return successResponse(outcome, 200);
}
