// M2 infrastructure (PRIVATE) — thin Prisma repository over `marketplace.vendor_profiles` +
// `marketplace.category_assignments` + `marketplace.categories` for
// `marketplace.list_vendor_directory.v1` (Doc-5D_VendorDirectoryProjection_Patch_v1.0.3 /
// PATCH-5D-VLD-01). M2 reading its OWN schema (allowed); no module outside `marketplace` imports
// this file.
//
// VISIBILITY: unlike the single-profile repository (which returns raw rows and defers the
// visibility decision entirely to the caller), a LIST's keyset "fetch N+1, trim" pagination math
// (has_more / next_cursor) is only correct if the SAME exclusion set that produces `items` also
// produces the count used for `has_more` (Doc-5A §8.7 exclusion-consistency). The published +
// active + non-soft-deleted + non-banned predicate is therefore pushed into the SQL `WHERE` clause
// here — this is NOT a second visibility predicate, it is the SQL-literal translation of the exact
// same three facts (`status`, `visibility`, `deleted_at`) `vendor-visibility.policy.ts`'s
// `isVendorProfilePubliclyVisible` checks; the caller (`list-vendor-directory.query.ts`) still runs
// every returned row back through that SAME shared function as the authoritative, defensive gate
// before computing `has_more`/trimming, so the policy function remains the single place the
// boolean logic is expressed in TypeScript and no drift is possible.
//
// One query for the page (+1 row over the caller's requested size, the standard keyset "fetch N+1,
// trim" trick — no separate COUNT query that could drift from the visibility-filtered rows), no N+1
// across the category-assignment join (fetched via a nested relation `select`, same discipline as
// `vendor-profile.repository.ts`).

import { Prisma, prisma, type DbExecutor } from "../../../../shared/db";
import type { VendorDirectoryRowReadModel } from "../../domain/read-models/vendor-directory.read-model";
import {
  VENDOR_PROFILE_BASE_SELECT,
  toVendorProfileBaseReadModel,
  type VendorProfileBaseRow,
} from "./vendor-profile-projection";

/** The Prisma-side capability column name a `capability` filter targets (Doc-5D §2 — ONE flag per call). */
export type CapabilityFilterField = "canSupply" | "canService" | "canFabricate" | "canConsult";

/** Allowlisted filter dimensions (Doc-5D PATCH-5D-VLD-01 §2 — mirrors `search_catalog`'s sibling typing). */
export interface ListVendorDirectoryFilterParams {
  categoryId?: string;
  country?: string;
  division?: string;
  district?: string;
  industrialZone?: string;
  capability?: CapabilityFilterField;
}

/** The keyset cursor's decoded position: the last row's sort key (`name` asc, `id` tiebreak — Doc-5D §3). */
export interface DirectoryCursorKey {
  name: string;
  id: string;
}

// The SHARED base projection (`vendor-profile-projection.ts` — the six pinned public fields + the
// visibility-policy inputs + the active category-assignment block) plus the ONE list-only `slug` field
// (see the read model's file-top comment). No duplication: the base select/mapper are reused verbatim
// from the single-profile repository; only `slug` is layered on here.
const VENDOR_DIRECTORY_SELECT = { ...VENDOR_PROFILE_BASE_SELECT, slug: true };

interface VendorDirectoryRow extends VendorProfileBaseRow {
  slug: string;
}

function toReadModel(row: VendorDirectoryRow): VendorDirectoryRowReadModel {
  return { ...toVendorProfileBaseReadModel(row), slug: row.slug };
}

function capabilityWhere(field: CapabilityFilterField | undefined): Prisma.VendorProfileWhereInput {
  switch (field) {
    case "canSupply":
      return { canSupply: true };
    case "canService":
      return { canService: true };
    case "canFabricate":
      return { canFabricate: true };
    case "canConsult":
      return { canConsult: true };
    default:
      return {};
  }
}

/**
 * Fetch one keyset-paginated page of the public vendor directory (up to `limit` rows, `name` asc /
 * `id` asc total order — Doc-5D §3). `after` is the decoded cursor position (exclusive — strictly
 * greater than `(name, id)`); `null` fetches the first page. The published + active + non-soft-
 * deleted + non-banned predicate is applied in SQL (see file-top comment); the caller re-verifies via
 * `isVendorProfilePubliclyVisible` before computing `has_more`.
 */
export async function findVendorDirectoryPage(
  filters: ListVendorDirectoryFilterParams,
  after: DirectoryCursorKey | null,
  limit: number,
  db: DbExecutor = prisma,
): Promise<VendorDirectoryRowReadModel[]> {
  const where: Prisma.VendorProfileWhereInput = {
    status: "active",
    visibility: "public",
    deletedAt: null,
    ...capabilityWhere(filters.capability),
    ...(filters.categoryId !== undefined
      ? {
          categoryAssignments: {
            some: { categoryId: filters.categoryId, status: "active", deletedAt: null },
          },
        }
      : {}),
    ...(filters.country !== undefined ? { country: filters.country } : {}),
    ...(filters.division !== undefined ? { division: filters.division } : {}),
    ...(filters.district !== undefined ? { district: filters.district } : {}),
    ...(filters.industrialZone !== undefined ? { industrialZone: filters.industrialZone } : {}),
    ...(after !== null
      ? {
          OR: [
            { name: { gt: after.name } },
            { AND: [{ name: after.name }, { id: { gt: after.id } }] },
          ],
        }
      : {}),
  };

  const rows = await db.vendorProfile.findMany({
    where,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    take: limit,
    select: VENDOR_DIRECTORY_SELECT,
  });

  return rows.map(toReadModel);
}
