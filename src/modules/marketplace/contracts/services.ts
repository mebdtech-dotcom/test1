// Public service interfaces + callables for module "marketplace" — the ONLY cross-module call
// surface (REPOSITORY_STRUCTURE §3). Cross-module consumers (e.g. `src/server`) import from here,
// never the private application/domain/infrastructure layers (the boundary linter enforces this).
//
// W3-MKT-1 pilot slice: the two anonymous Public Discovery reads
// `marketplace.resolve_vendor_slug.v1` (Doc-4D_VendorSlugResolve_Patch_v1.0.4 /
// Doc-5D_VendorSlugResolve_Patch_v1.0.2) and `marketplace.get_public_vendor_profile.v1`
// (Doc-4D_Content_v1.0_PassB_Discovery.md §BC-MKT-6 / Doc-5D_Content_v1.0_Pass1.md row 64). Both are
// PUBLIC (anonymous) reads — no active-org context, no auth; the `db` executor is optional (default
// = the shared Prisma client) purely for test injection, never for RLS/org-context wiring (there is
// none on a public read).

import type { DbExecutor } from "@/shared/db";
import { resolveVendorSlug as resolveVendorSlugQuery } from "../application/queries/resolve-vendor-slug.query";
import { getPublicVendorProfile as getPublicVendorProfileQuery } from "../application/queries/get-public-vendor-profile.query";
import { listVendorDirectory as listVendorDirectoryQuery } from "../application/queries/list-vendor-directory.query";
import type {
  GetPublicVendorProfileKey,
  GetPublicVendorProfileOutcome,
  ListVendorDirectoryOutcome,
  ListVendorDirectoryRequest,
  ResolveVendorSlugKey,
  ResolveVendorSlugOutcome,
} from "./types";

/**
 * `marketplace.resolve_vendor_slug.v1` (Doc-4D_VendorSlugResolve_Patch_v1.0.4) — the PUBLIC,
 * contracts-only face over the private M2 resolver query. Anonymous (public actor) — no active-org
 * context. `slug` is accepted ONLY by this contract (the scope guard) — never add it elsewhere.
 */
export type ResolveVendorSlug = (
  key: ResolveVendorSlugKey,
  db?: DbExecutor,
) => Promise<ResolveVendorSlugOutcome>;

/** Concrete `marketplace.resolve_vendor_slug.v1` facade (M2 contracts → M2 application query). */
export const resolveVendorSlug: ResolveVendorSlug = (key, db) => resolveVendorSlugQuery(key, db);

/**
 * `marketplace.get_public_vendor_profile.v1` (Doc-4D_Content_v1.0_PassB_Discovery.md §BC-MKT-6) —
 * the PUBLIC, contracts-only face over the private M2 profile read. Anonymous (public actor) — no
 * active-org context. Lookup is EXACTLY ONE of `vendorProfileId` XOR `humanRef`.
 */
export type GetPublicVendorProfile = (
  key: GetPublicVendorProfileKey,
  db?: DbExecutor,
) => Promise<GetPublicVendorProfileOutcome>;

/** Concrete `marketplace.get_public_vendor_profile.v1` facade (M2 contracts → M2 application query). */
export const getPublicVendorProfile: GetPublicVendorProfile = (key, db) =>
  getPublicVendorProfileQuery(key, db);

/**
 * `marketplace.list_vendor_directory.v1` (Doc-4D_Content_v1.0_PassB_Discovery.md §D6 line 21 /
 * Doc-5D_VendorDirectoryProjection_Patch_v1.0.3) — the PUBLIC, contracts-only face over the private M2
 * paginated directory read. Anonymous (public actor) — no active-org context.
 */
export type ListVendorDirectory = (
  request: ListVendorDirectoryRequest,
  db?: DbExecutor,
) => Promise<ListVendorDirectoryOutcome>;

/** Concrete `marketplace.list_vendor_directory.v1` facade (M2 contracts → M2 application query). */
export const listVendorDirectory: ListVendorDirectory = (request, db) =>
  listVendorDirectoryQuery(request, db);

// The M2 WIRE FACES for all three reads (outcome → Doc-5A envelope + §6.2 status) — the One-Owner
// placement (M2 owns how its reads become HTTP); the app-layer composition edge (`src/server/marketplace`)
// consumes them via `@/modules/marketplace/contracts` (contracts-only).
export { mapResolveVendorSlug } from "../api/resolve-vendor-slug.handler";
export { mapGetPublicVendorProfile } from "../api/get-public-vendor-profile.handler";
export { mapListVendorDirectory } from "../api/list-vendor-directory.handler";
