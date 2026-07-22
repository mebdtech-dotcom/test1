// The composed seam FE Server Components call for the public vendor directory (build step 8 — an
// application-composition CONVENIENCE, NOT a public API contract: no wire shape of its own, no
// `app/api/` route; mirrors `resolve-public-vendor.ts`'s posture). Currently a thin pass-through to
// `marketplace.list_vendor_directory.v1` (Doc-5D_VendorDirectoryProjection_Patch_v1.0.3) — kept as its
// own seam (rather than FE pages calling the contract directly) so this is the ONE place a future
// request-scoped cache/memoization wrapper, or a richer FE-facing composition, attaches without
// touching every call site.

import { listVendorDirectory } from "@/modules/marketplace/contracts";
import type {
  ListVendorDirectoryOutcome,
  ListVendorDirectoryRequest,
} from "@/modules/marketplace/contracts";

/** `marketplace.list_vendor_directory.v1` — the paginated public vendor-directory read. */
export async function listPublicVendorDirectory(
  request: ListVendorDirectoryRequest,
): Promise<ListVendorDirectoryOutcome> {
  return listVendorDirectory(request);
}
