// M2 domain (PRIVATE) — the minimal read models for `marketplace.resolve_vendor_slug.v1`
// (Doc-4D_VendorSlugResolve_Patch_v1.0.4). Read projections of `marketplace.vendor_profiles` /
// `marketplace.vendor_slug_history` — NOT sources of truth (the tables are).

import type { VendorVisibilityStatus } from "../policies/vendor-visibility.policy";

/** A live `vendor_profiles.slug` match — carries only the visibility-policy inputs (the resolver
 *  never returns vendor metadata — Doc-4D PATCH-4D-VSR-01 "Identifier resolution only"). */
export interface VendorSlugLiveMatchReadModel {
  vendorProfileId: string;
  status: VendorVisibilityStatus;
  visibility: "public";
  deletedAt: Date | null;
}

/** A `vendor_slug_history.old_slug` match, joined to its target's CURRENT `vendor_profiles` row
 *  (`currentSlug` = the live `slug` column, NOT `vendor_slug_history.new_slug` — a vendor may have
 *  migrated more than once, and the redirect must always land on the CURRENT canonical slug, never
 *  an intermediate retired one). Carries the visibility-policy inputs for the migrated-target gate
 *  (the two-hop non-disclosure case — Invariant #11). */
export interface VendorSlugHistoryMatchReadModel {
  vendorProfileId: string;
  currentSlug: string;
  status: VendorVisibilityStatus;
  visibility: "public";
  deletedAt: Date | null;
}
