// M2 infrastructure (PRIVATE) — the SHARED public-projection column-select + row→read-model mapper
// for `marketplace.vendor_profiles`, consumed by BOTH the single-profile repository
// (`vendor-profile.repository.ts`, W3-MKT-1) and the directory-list repository
// (`vendor-directory.repository.ts`, W3-MKT-2). Extracted so the base projection (the frozen public
// column set of Doc-2 §10.3 + the active-category-assignment nested block) is expressed ONCE — the
// directory repository layers only its list-only `slug` field + keyset/filter logic on top. M2 reading
// its OWN schema (allowed); no module outside `marketplace` imports this file.
//
// SCOPE: base fields ONLY (the six pinned `PublicVendorProfileView` business fields + the visibility-
// policy inputs `status`/`visibility`/`deletedAt` + the active category-assignment block). `slug` is
// deliberately NOT in the base select — it is the ONE field the directory read carries beyond the
// single-profile projection (see `contracts/types.ts` `VendorDirectoryListItem` for the flagged
// rationale); the directory repository spreads this base select and adds `slug: true` itself.

import type { VendorProfileReadModel } from "../../domain/read-models/vendor-profile.read-model";
import type { VendorVisibilityStatus } from "../../domain/policies/vendor-visibility.policy";

// The base column set every public-projection lookup needs (Doc-2 §10.3, narrowed to the frozen public
// projection — `vendor_type_preset`/declared-tier/capacity columns are NOT selected, they are not in
// `get_public_vendor_profile.v1`'s response). Active (status='active', non-soft-deleted) category
// assignments only (Doc-6D MK-CR8), ordered primary-before-secondary then by creation order
// (deterministic; `CategoryAssignmentLevel` sorts 'primary' < 'secondary' lexically).
export const VENDOR_PROFILE_BASE_SELECT = {
  id: true,
  humanRef: true,
  name: true,
  canSupply: true,
  canService: true,
  canFabricate: true,
  canConsult: true,
  country: true,
  division: true,
  district: true,
  industrialZone: true,
  status: true,
  visibility: true,
  deletedAt: true,
  categoryAssignments: {
    where: { status: "active" as const, deletedAt: null },
    orderBy: [{ level: "asc" as const }, { createdAt: "asc" as const }],
    select: {
      category: { select: { id: true, name: true, parentId: true } },
    },
  },
};

/** One `vendor_profiles` row as read through `VENDOR_PROFILE_BASE_SELECT` (base fields only, no slug). */
export interface VendorProfileBaseRow {
  id: string;
  humanRef: string;
  name: string;
  canSupply: boolean;
  canService: boolean;
  canFabricate: boolean;
  canConsult: boolean;
  country: string | null;
  division: string | null;
  district: string | null;
  industrialZone: string | null;
  status: VendorVisibilityStatus;
  visibility: "public";
  deletedAt: Date | null;
  categoryAssignments: Array<{
    category: { id: string; name: string; parentId: string | null };
  }>;
}

/**
 * Map a base `vendor_profiles` row to the shared `VendorProfileReadModel` (the six common public fields
 * + the visibility-policy inputs + the flattened active category assignments). The directory repository
 * spreads this result and adds its `slug` field; the single-profile repository uses it as-is.
 */
export function toVendorProfileBaseReadModel(row: VendorProfileBaseRow): VendorProfileReadModel {
  return {
    id: row.id,
    humanRef: row.humanRef,
    name: row.name,
    canSupply: row.canSupply,
    canService: row.canService,
    canFabricate: row.canFabricate,
    canConsult: row.canConsult,
    country: row.country,
    division: row.division,
    district: row.district,
    industrialZone: row.industrialZone,
    status: row.status,
    visibility: row.visibility,
    deletedAt: row.deletedAt,
    categories: row.categoryAssignments.map((a) => ({
      categoryId: a.category.id,
      name: a.category.name,
      parentCategoryId: a.category.parentId,
    })),
  };
}
