// M2 application (PRIVATE) — `marketplace.list_vendor_directory.v1` read query
// (Doc-4D_Content_v1.0_PassB_Discovery.md §D6 line 21; field-level realization
// Doc-5D_VendorDirectoryProjection_Patch_v1.0.3 / PATCH-5D-VLD-01). Orchestration only; owns NO state.
// Single reads: NO explicit transaction (Doc-4A §17.1 — reads are not audited).
//
// Validation Matrix (Doc-4D §D6): SYNTAX (allowlisted filters; cursor decodability; page_size bound —
// Doc-5A §8.3/§8.4/§8.5) → CONTEXT (public caller) → AUTHZ (public; none required) → SCOPE
// (published/non-excluded rows only — Doc-5A §8.7 exclusion-consistency, gated by the shared
// `isVendorProfilePubliclyVisible` policy, never a second predicate).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import {
  findVendorDirectoryPage,
  type CapabilityFilterField,
  type DirectoryCursorKey,
  type ListVendorDirectoryFilterParams,
} from "../../infrastructure/data/vendor-directory.repository";
import { isVendorProfilePubliclyVisible } from "../../domain/policies/vendor-visibility.policy";
import type { VendorDirectoryRowReadModel } from "../../domain/read-models/vendor-directory.read-model";
import type {
  CapabilityFilterFlag,
  ListVendorDirectoryFilters,
  ListVendorDirectoryOutcome,
  ListVendorDirectoryRequest,
  VendorDirectoryListItem,
} from "../../contracts/types";

// Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace.md §3 — `marketplace.list_page_size_max`
// (POLICY, start: 100; covers `list_vendor_directory` by name). Doc-5A §8.5 requires the min/max/
// DEFAULT to be POLICY-keyed, never a literal; only a MAXIMUM is registered for this key (no separate
// default/min key exists in the Doc-3 v1.2 Marketplace patch) — the omitted-`page_size` default is
// therefore realized as this SAME registered value, never an unregistered literal.
const LIST_PAGE_SIZE_MAX = 100;

const CAPABILITY_FIELD: Record<CapabilityFilterFlag, CapabilityFilterField> = {
  can_supply: "canSupply",
  can_service: "canService",
  can_fabricate: "canFabricate",
  can_consult: "canConsult",
};

function isCapabilityFilterFlag(value: string): value is CapabilityFilterFlag {
  return value in CAPABILITY_FIELD;
}

interface DirectoryCursorPayload {
  name: string;
  id: string;
}

/** Opaque keyset cursor encoding [realization convention, disclosed]: base64url of `{ name, id }` —
 *  the exact `(sort_key, id)` keyset pagination position (Doc-5D §3: `name` asc, `id` tiebreak). A
 *  client MUST NOT construct/decode one (Doc-5A §8.2); this module is the only encoder/decoder. */
function encodeCursor(payload: DirectoryCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): DirectoryCursorKey | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const record = parsed as Record<string, unknown>;
  if (typeof record.name !== "string" || typeof record.id !== "string") return null;
  if (!UUID_PATTERN.test(record.id)) return null;
  return { name: record.name, id: record.id };
}

function toListItem(row: VendorDirectoryRowReadModel): VendorDirectoryListItem {
  return {
    vendorProfileId: row.id,
    humanRef: row.humanRef,
    name: row.name,
    slug: row.slug,
    capabilityFlags: {
      canSupply: row.canSupply,
      canService: row.canService,
      canFabricate: row.canFabricate,
      canConsult: row.canConsult,
    },
    geography: {
      country: row.country,
      division: row.division,
      district: row.district,
      industrialZone: row.industrialZone,
    },
    categories: row.categories.map((c) => ({
      categoryId: c.categoryId,
      name: c.name,
      parentCategoryId: c.parentCategoryId,
    })),
  };
}

function validateFilters(
  filters: ListVendorDirectoryFilters,
): ListVendorDirectoryFilterParams | null {
  if (filters.categoryId !== undefined && !UUID_PATTERN.test(filters.categoryId)) {
    return null;
  }
  if (filters.capability !== undefined && !isCapabilityFilterFlag(filters.capability)) {
    return null;
  }
  return {
    ...(filters.categoryId !== undefined ? { categoryId: filters.categoryId } : {}),
    ...(filters.country !== undefined ? { country: filters.country } : {}),
    ...(filters.division !== undefined ? { division: filters.division } : {}),
    ...(filters.industrialZone !== undefined ? { industrialZone: filters.industrialZone } : {}),
    ...(filters.district !== undefined ? { district: filters.district } : {}),
    ...(filters.capability !== undefined
      ? { capability: CAPABILITY_FIELD[filters.capability] }
      : {}),
  };
}

/**
 * `marketplace.list_vendor_directory.v1` — the paginated public vendor-directory read (Doc-5D
 * PATCH-5D-VLD-01). `name` asc / `vendor_profile_id` tiebreak total order (Doc-5D §3); keyset
 * "fetch N+1, trim" pagination so `has_more` is computed from the SAME visibility-gated set that
 * produces `items` (Doc-5A §8.7).
 */
export async function listVendorDirectory(
  request: ListVendorDirectoryRequest,
  db: DbExecutor = prisma,
): Promise<ListVendorDirectoryOutcome> {
  const filterParams = validateFilters(request.filters ?? {});
  if (filterParams === null) {
    return { invalidInput: true };
  }

  // page_size — bounded by `marketplace.list_page_size_max` (POLICY, start 100); over-max is a SYNTAX
  // 400, never silently clamped (Doc-5A §8.5).
  const pageSize = request.pageSize ?? LIST_PAGE_SIZE_MAX;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > LIST_PAGE_SIZE_MAX) {
    return { invalidInput: true };
  }

  // cursor — opaque keyset token (Doc-5A §8.1/§8.2); malformed ⇒ SYNTAX 400 (never guessed/repaired).
  let after: DirectoryCursorKey | null = null;
  if (request.cursor !== undefined) {
    after = decodeCursor(request.cursor);
    if (after === null) {
      return { invalidInput: true };
    }
  }

  // Fetch pageSize + 1 (the standard keyset "fetch N+1, trim" trick).
  const rows = await findVendorDirectoryPage(filterParams, after, pageSize + 1, db);

  // Defensive re-gate through the SAME shared visibility predicate the repository's SQL WHERE clause
  // already encodes (never a second predicate — see the repository's file-top comment); applied
  // BEFORE the has_more/trim math so items/has_more/cursor-continuation never diverge (Doc-5A §8.7).
  const visibleRows = rows.filter(isVendorProfilePubliclyVisible);

  const hasMore = visibleRows.length > pageSize;
  const page = hasMore ? visibleRows.slice(0, pageSize) : visibleRows;
  const items = page.map(toListItem);

  const last = page[page.length - 1];
  const pageInfo =
    hasMore && last !== undefined
      ? { hasMore: true, nextCursor: encodeCursor({ name: last.name, id: last.id }) }
      : { hasMore: false };

  return { items, pageInfo };
}
