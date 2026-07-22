// App-layer composition for the ANONYMOUS `GET /marketplace/vendor_slug_resolutions/{slug}` route
// (Doc-5D_VendorSlugResolve_Patch_v1.0.2 / PATCH-5D-VSR-01 row 66). Unlike M1's compositions, this
// read is PUBLIC (Doc-5D R2 anonymous carriage — no `Authorization`, no `Iv-Active-Organization`):
// there is no session to resolve and no active-org context to compose (`withActiveOrg` is
// intentionally NOT used here).
//
// Rate limiting: this endpoint ADOPTS the already-registered `marketplace.public_read_rate_limit`
// POLICY key (Doc-3_Policy_Key_Registration_Patch_v1.11_PublicReadRateLimit) — name only; no
// numeric value or enforcement mechanism is realized here (a future instrument, per the key's own
// anti-invention rule — Doc-3 v1.11).

import { mapResolveVendorSlug, resolveVendorSlug } from "@/modules/marketplace/contracts";
import type { ResolveVendorSlugResult } from "@/modules/marketplace/contracts";
import type { WireResponse } from "@/shared/http";

/**
 * `GET /marketplace/vendor_slug_resolutions/{slug}` — resolve a public microsite URL slug to a live
 * vendor, a migrated-slug redirect target, or the uniform not-found collapse
 * (Doc-4D_VendorSlugResolve_Patch_v1.0.4).
 */
export async function handleResolveVendorSlug(
  slug: string,
): Promise<WireResponse<ResolveVendorSlugResult>> {
  const outcome = await resolveVendorSlug({ slug });
  return mapResolveVendorSlug(outcome);
}
