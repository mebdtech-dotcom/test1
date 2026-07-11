// M2 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `marketplace.list_vendor_directory.v1`
// (Doc-4D_Content_v1.0_PassB_Discovery.md §D6 line 21 → Doc-5D_VendorDirectoryProjection_Patch_v1.0.3
// row 63 → `GET /marketplace/vendor_directory` → `200`).
//
// This is the module's OWN wire face: maps the in-process `ListVendorDirectoryOutcome` to the Doc-5A
// wire envelope (§5.6 success / §6.1 error). Anonymous public read — no session, no active-org
// context to compose. One-Owner placement: M2 owns how its read becomes HTTP.
//
// List realization (established program convention — see `src/modules/identity/api/list-*.handler.ts`,
// e.g. `list-delegation-grants.handler.ts`): `successResponse({ items, pageInfo }, 200)` — the Doc-5A
// §5.6 single-entity envelope wraps the §8.6 list shape as `result`, camelCase (Doc-5A v1.0.1 Option B).
//
// BOUNDARY: imports `@/shared/http` + the M2 contracts TYPES only (type-only). Pure (no I/O).
//
// Reference-never-restate (Doc-4D §D6 Error Register):
//   - success        → `200` + Doc-5A §5.6 envelope (`result` = `{ items, pageInfo }`).
//   - invalid input (undeclared filter field, malformed category_id/capability/cursor, out-of-bound
//     page_size) → `400` VALIDATION (`marketplace_discovery_invalid_input`).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  ListVendorDirectoryOutcome,
  ListVendorDirectoryResult,
} from "@/modules/marketplace/contracts";

// Doc-4D §D6 Error Register — bound by pointer, never coined here (reused verbatim from the sibling
// `get_public_vendor_profile.v1` / `resolve_vendor_slug.v1` operations on the same Doc-4D line).
const INVALID_INPUT_CODE = "marketplace_discovery_invalid_input";

/**
 * Map a resolved `marketplace.list_vendor_directory.v1` outcome to its Doc-5A wire response.
 */
export function mapListVendorDirectory(
  outcome: ListVendorDirectoryOutcome,
): WireResponse<ListVendorDirectoryResult> {
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
