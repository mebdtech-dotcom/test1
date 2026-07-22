// App-layer composition for M2 caller-facing HTTP surfaces (REPOSITORY_STRUCTURE §5/§8). The thin
// Next.js route entries (`app/api/marketplace/**`) delegate here. Both reads are ANONYMOUS PUBLIC
// reads — no session, no active-org context (unlike M1's compositions).

export { handleResolveVendorSlug } from "./resolve-vendor-slug.route-handler";
export { handleGetPublicVendorProfile } from "./get-public-vendor-profile.route-handler";
export { resolvePublicVendor, type ResolvePublicVendorOutcome } from "./resolve-public-vendor";
export {
  handleListVendorDirectory,
  type ListVendorDirectoryWireInput,
} from "./list-vendor-directory.route-handler";
export { listPublicVendorDirectory } from "./list-public-vendor-directory";
