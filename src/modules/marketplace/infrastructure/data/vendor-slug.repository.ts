// M2 infrastructure (PRIVATE) — thin Prisma repository over `marketplace.vendor_profiles` (live slug
// lookup) + `marketplace.vendor_slug_history` (retired-slug fallback, joined to its target's CURRENT
// `vendor_profiles` row). This is M2 reading its OWN schema (allowed); other modules reach this only
// via the M2 composition root / contracts, never by importing infrastructure. No module outside
// `marketplace` imports this file.
//
// RLS is the row-visibility BACKSTOP (Doc-6D §3.1.9 / Doc-6D_VendorSlugSubdomain_Patch_v1.0.1
// 6D-VSS-01.3); the AUTHORIZATION MODEL is the app-layer shared visibility predicate
// (`domain/policies/vendor-visibility.policy.ts`), applied by the calling query — this repository
// returns plain data (row or null) including the raw visibility-policy inputs, taking NO position on
// visibility itself.
//
// Bounded two-step lookup (live slug first, history fallback only on a miss) — not a loop, not N+1.

import { prisma, type DbExecutor } from "../../../../shared/db";
import type {
  VendorSlugHistoryMatchReadModel,
  VendorSlugLiveMatchReadModel,
} from "../../domain/read-models/vendor-slug.read-model";

/**
 * Look up a LIVE `vendor_profiles.slug` match (exact-string, case-sensitive — every validly-stored
 * slug is already lowercase by construction, Doc-4D PATCH-4D-VSR-01 Request Contract). Returns the
 * matched profile's visibility-policy inputs (the CALLER decides `current` vs the uniform not-found
 * collapse), or `null` when no live row has this slug.
 */
export async function findLiveVendorBySlug(
  slug: string,
  db: DbExecutor = prisma,
): Promise<VendorSlugLiveMatchReadModel | null> {
  const row = await db.vendorProfile.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true, status: true, visibility: true, deletedAt: true },
  });
  if (row === null) return null;
  return {
    vendorProfileId: row.id,
    status: row.status,
    visibility: row.visibility,
    deletedAt: row.deletedAt,
  };
}

/**
 * Look up a retired `vendor_slug_history.old_slug` match, joined (ONE query, via the Prisma relation)
 * to the target's CURRENT `vendor_profiles` row — `currentSlug` is the vendor's LIVE `slug` column,
 * not `vendor_slug_history.new_slug` (a vendor may have migrated more than once; the redirect target
 * must always be the current canonical slug). Returns `null` when no history row has this `old_slug`,
 * OR when the joined `vendorProfile` relation itself comes back null (defensive hardening only — this
 * app's Prisma connection is privileged/RLS-bypassing like every other module, so a live FK'd
 * `vendorProfile` is always present in practice; a null join is treated identically to "no history
 * match" rather than assumed non-null, same non-disclosure collapse the caller already applies).
 */
export async function findVendorSlugHistoryTarget(
  oldSlug: string,
  db: DbExecutor = prisma,
): Promise<VendorSlugHistoryMatchReadModel | null> {
  const row = await db.vendorSlugHistory.findUnique({
    where: { oldSlug },
    select: {
      vendorProfileId: true,
      vendorProfile: {
        select: { slug: true, status: true, visibility: true, deletedAt: true },
      },
    },
  });
  if (row === null || row.vendorProfile === null) return null;
  return {
    vendorProfileId: row.vendorProfileId,
    currentSlug: row.vendorProfile.slug,
    status: row.vendorProfile.status,
    visibility: row.vendorProfile.visibility,
    deletedAt: row.vendorProfile.deletedAt,
  };
}
