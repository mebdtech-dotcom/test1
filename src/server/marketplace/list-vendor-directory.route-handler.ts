// App-layer composition for the ANONYMOUS `GET /marketplace/vendor_directory` route
// (Doc-5D_VendorDirectoryProjection_Patch_v1.0.3 row 63). PUBLIC read (Doc-5D R2 anonymous carriage) —
// no session, no active-org context to compose (`withActiveOrg` is intentionally NOT used here), same
// posture as the two W3-MKT-1 reads (`resolve-vendor-slug.route-handler.ts` /
// `get-public-vendor-profile.route-handler.ts`).
//
// SYNTAX ownership (Doc-4A §11.2 category 1 / Doc-5A §8.3 filter allowlist): this composition rejects
// any `filter[<field>]` key outside the Doc-5D §2 allowlist BEFORE the typed request ever reaches the
// M2 query (mirrors `src/server/identity/list-delegation-grants.route-handler.ts`'s SYNTAX-first
// posture) — the query independently re-validates each accepted field's format/range regardless.
//
// Rate limiting: this endpoint ADOPTS the already-registered `marketplace.public_read_rate_limit`
// POLICY key (Doc-3 v1.11) — name only, no value/mechanism realized here (same adoption as the sibling
// W3-MKT-1 reads).

import {
  listVendorDirectory,
  mapListVendorDirectory,
  type CapabilityFilterFlag,
  type ListVendorDirectoryFilters,
  type ListVendorDirectoryOutcome,
  type ListVendorDirectoryRequest,
  type ListVendorDirectoryResult,
} from "@/modules/marketplace/contracts";
import type { WireResponse } from "@/shared/http";

/** The RAW wire query dimensions (route-extracted, unvalidated — this composition owns SYNTAX). */
export interface ListVendorDirectoryWireInput {
  /** `filter[<field>]` query params, bracket-key already stripped by the `app/` route entry. */
  filters: Record<string, string>;
  cursor?: string;
  pageSize?: string;
}

// Doc-5D PATCH-5D-VLD-01 §2 filter allowlist (mirrors `search_catalog`'s sibling typing).
const ALLOWED_FILTER_KEYS = new Set([
  "category_id",
  "country",
  "division",
  "district",
  "industrial_zone",
  "capability",
]);
const CAPABILITY_FLAGS = new Set<string>([
  "can_supply",
  "can_service",
  "can_fabricate",
  "can_consult",
]);

function invalidInput(): WireResponse<ListVendorDirectoryResult> {
  const outcome: ListVendorDirectoryOutcome = { invalidInput: true };
  return mapListVendorDirectory(outcome);
}

/**
 * `GET /marketplace/vendor_directory` — the paginated public vendor-directory read
 * (Doc-5D_VendorDirectoryProjection_Patch_v1.0.3 / PATCH-5D-VLD-01).
 */
export async function handleListVendorDirectory(
  input: ListVendorDirectoryWireInput,
): Promise<WireResponse<ListVendorDirectoryResult>> {
  // SYNTAX — undeclared filter field (Doc-5A §8.3) → 400, before any typed request is built.
  for (const key of Object.keys(input.filters)) {
    if (!ALLOWED_FILTER_KEYS.has(key)) {
      return invalidInput();
    }
  }
  if (input.filters.capability !== undefined && !CAPABILITY_FLAGS.has(input.filters.capability)) {
    return invalidInput();
  }

  let pageSize: number | undefined;
  if (input.pageSize !== undefined) {
    const parsed = Number(input.pageSize);
    if (!Number.isFinite(parsed)) {
      return invalidInput();
    }
    pageSize = parsed;
  }

  const filters: ListVendorDirectoryFilters = {
    ...(input.filters.category_id !== undefined ? { categoryId: input.filters.category_id } : {}),
    ...(input.filters.country !== undefined ? { country: input.filters.country } : {}),
    ...(input.filters.division !== undefined ? { division: input.filters.division } : {}),
    ...(input.filters.district !== undefined ? { district: input.filters.district } : {}),
    ...(input.filters.industrial_zone !== undefined
      ? { industrialZone: input.filters.industrial_zone }
      : {}),
    ...(input.filters.capability !== undefined
      ? { capability: input.filters.capability as CapabilityFilterFlag }
      : {}),
  };

  const request: ListVendorDirectoryRequest = {
    ...(Object.keys(filters).length > 0 ? { filters } : {}),
    ...(input.cursor !== undefined ? { cursor: input.cursor } : {}),
    ...(pageSize !== undefined ? { pageSize } : {}),
  };

  const outcome = await listVendorDirectory(request);
  return mapListVendorDirectory(outcome);
}
