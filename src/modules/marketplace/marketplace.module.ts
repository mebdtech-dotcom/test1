// Composition root for module "marketplace" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE section 3). W3-MKT-1 realizes the two anonymous Public Discovery reads
// (Doc-4D §BC-MKT-6 / Doc-4D_VendorSlugResolve_Patch_v1.0.4); the second Wave-3 slice adds the
// paginated public vendor-directory read (Doc-4D §D6 / Doc-5D_VendorDirectoryProjection_Patch_v1.0.3).
// Other modules consume `marketplaceQueries`, never the application/infrastructure layers directly.

import {
  getPublicVendorProfile,
  listVendorDirectory,
  resolveVendorSlug,
} from "./contracts/services";

/** The M2 public read surface realized so far (all anonymous public reads). */
export const marketplaceQueries = {
  resolveVendorSlug,
  getPublicVendorProfile,
  listVendorDirectory,
};
