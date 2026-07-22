// App-layer composition for the ANONYMOUS `GET /marketplace/public_vendor_profiles/{id}` route
// (Doc-5D_Content_v1.0_Pass1.md row 64). PUBLIC read (Doc-5D R2 anonymous carriage) — no session, no
// active-org context to compose (`withActiveOrg` is intentionally NOT used here).
//
// Rate limiting: this endpoint ADOPTS the already-registered `marketplace.public_read_rate_limit`
// POLICY key (Doc-3 v1.11) — name only, no value/mechanism realized here.

import { getPublicVendorProfile, mapGetPublicVendorProfile } from "@/modules/marketplace/contracts";
import type {
  GetPublicVendorProfileKey,
  PublicVendorProfileView,
} from "@/modules/marketplace/contracts";
import type { WireResponse } from "@/shared/http";

/**
 * `GET /marketplace/public_vendor_profiles/{id}` — resolve the public vendor-profile projection by
 * EXACTLY ONE of `vendorProfileId`/`humanRef` (Doc-4D_Content_v1.0_PassB_Discovery.md §BC-MKT-6).
 */
export async function handleGetPublicVendorProfile(
  key: GetPublicVendorProfileKey,
): Promise<WireResponse<PublicVendorProfileView>> {
  const outcome = await getPublicVendorProfile(key);
  return mapGetPublicVendorProfile(outcome);
}
