// The ONE composed seam the FE `/vendors/[slug]` route calls (build step 8 — an application-
// composition CONVENIENCE, NOT a public API contract: no wire shape, no `app/api/` route, not part
// of the Doc-4D/Doc-5D VendorSlugResolve patch pair). Chains `marketplace.resolve_vendor_slug.v1` →
// `marketplace.get_public_vendor_profile.v1` server-side and collapses BOTH contracts' non-visible
// legs into ONE discriminated outcome, so the FE never depends on the internal two-contract
// structure (if the slug→id resolution path changes shape later — e.g. custom-domain/microsite
// routing folds in — only this function's internals change).
//
// `marketplace.resolve_vendor_slug.v1` and `marketplace.get_public_vendor_profile.v1` remain the
// only actual contracts (Doc-4D_VendorSlugResolve_Patch_v1.0.4 / Doc-4D_Content_v1.0_PassB_Discovery.md).

import { getPublicVendorProfile, resolveVendorSlug } from "@/modules/marketplace/contracts";
import type { PublicVendorProfileView } from "@/modules/marketplace/contracts";

export type ResolvePublicVendorOutcome =
  | { kind: "render"; profile: PublicVendorProfileView }
  | { kind: "redirect"; to: string }
  | { kind: "not_found" };

/**
 * Resolve a public vendor microsite URL `slug` server-side: `current` → render; `migrated` (target
 * still visible) → redirect to the CURRENT live slug; everything else (malformed slug, absent,
 * not-visible, OR a race where the profile becomes not-visible between the two reads) → the uniform
 * not-found collapse (Invariant #11 — never a distinguishable reason).
 */
export async function resolvePublicVendor(slug: string): Promise<ResolvePublicVendorOutcome> {
  const resolution = await resolveVendorSlug({ slug });

  if (resolution.status === "invalid_input" || resolution.status === "not_found") {
    return { kind: "not_found" };
  }

  if (resolution.status === "migrated") {
    return { kind: "redirect", to: resolution.currentSlug };
  }

  // resolution.status === "current"
  const profileOutcome = await getPublicVendorProfile({
    vendorProfileId: resolution.vendorProfileId,
  });
  if (!profileOutcome.found) {
    // Defensive race-safety only (e.g. banned between the two reads) — never a distinct wire code.
    return { kind: "not_found" };
  }

  return { kind: "render", profile: profileOutcome.profile };
}
