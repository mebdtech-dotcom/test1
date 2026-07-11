// M2 infrastructure (PRIVATE) — thin Prisma repository over `marketplace.vendor_profiles` +
// `marketplace.category_assignments` + `marketplace.categories`. This is M2 reading its OWN schema
// (allowed); other modules reach this only via the M2 composition root / contracts, never by
// importing infrastructure (REPOSITORY_STRUCTURE). No module outside `marketplace` imports this file.
//
// RLS is the row-visibility BACKSTOP for these public-readable tables (Doc-6D §3.1.9); the
// AUTHORIZATION MODEL is the app-layer shared visibility predicate
// (`domain/policies/vendor-visibility.policy.ts`) applied by the calling query, NOT re-derived here —
// this repository returns plain data (row or null), including the raw visibility-policy inputs, and
// takes NO position on whether the row is "visible" (that is the query's job).
//
// One query per lookup mode, no N+1: the active category assignments (+ their category) are fetched
// in the SAME Prisma call via a nested relation `select`, never a per-category follow-up query.
//
// The base column-select + row→read-model mapper are the SHARED projection (`vendor-profile-
// projection.ts`), used verbatim here and (with an added `slug`) by the directory repository — the
// projection is expressed once, no duplication.

import { prisma, type DbExecutor } from "../../../../shared/db";
import type { VendorProfileReadModel } from "../../domain/read-models/vendor-profile.read-model";
import {
  VENDOR_PROFILE_BASE_SELECT,
  toVendorProfileBaseReadModel,
} from "./vendor-profile-projection";

/**
 * Look up a vendor profile by its PK (`vendor_profile_id`). Returns the row's public-projection
 * fields + its visibility-policy inputs (the CALLER applies `isVendorProfilePubliclyVisible`), or
 * `null` when no live (non-soft-deleted) row exists. One query, no N+1.
 */
export async function findPublicVendorProfileById(
  vendorProfileId: string,
  db: DbExecutor = prisma,
): Promise<VendorProfileReadModel | null> {
  const row = await db.vendorProfile.findFirst({
    where: { id: vendorProfileId, deletedAt: null },
    select: VENDOR_PROFILE_BASE_SELECT,
  });
  if (row === null) return null;
  return toVendorProfileBaseReadModel(row);
}

/**
 * Look up a vendor profile by its year-scoped `human_ref` (`VENDOR-YYYY-NNNNNN`). Same contract as
 * `findPublicVendorProfileById`. One query, no N+1.
 */
export async function findPublicVendorProfileByHumanRef(
  humanRef: string,
  db: DbExecutor = prisma,
): Promise<VendorProfileReadModel | null> {
  const row = await db.vendorProfile.findFirst({
    where: { humanRef, deletedAt: null },
    select: VENDOR_PROFILE_BASE_SELECT,
  });
  if (row === null) return null;
  return toVendorProfileBaseReadModel(row);
}
