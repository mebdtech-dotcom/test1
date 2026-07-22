// M2 application (PRIVATE) — `marketplace.resolve_vendor_slug.v1` read query
// (Doc-4D_VendorSlugResolve_Patch_v1.0.4 / PATCH-4D-VSR-01). Orchestration only; owns NO state.
// Single reads: NO explicit transaction (not applicable — reads are not audited, Doc-4A §17.1).
//
// Validation Matrix (PATCH-4D-VSR-01): SYNTAX (`slug` format law) → CONTEXT (public) → AUTHZ (public;
// none required) → SCOPE (published/non-excluded only; uniform not-found collapse).

import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  findLiveVendorBySlug,
  findVendorSlugHistoryTarget,
} from "../../infrastructure/data/vendor-slug.repository";
import { isVendorProfilePubliclyVisible } from "../../domain/policies/vendor-visibility.policy";
import type { ResolveVendorSlugKey, ResolveVendorSlugOutcome } from "../../contracts/types";

// Doc-6D_VendorSlugSubdomain_Patch_v1.0.1 6D-VSS-01.1 slug format law (Doc-2 v1.0.5 D2-04.2) —
// reused verbatim, not re-defined. Matching against the stored column is exact-string,
// case-sensitive: the format law permits lowercase only, so every validly-stored slug is already
// lowercase by construction — no case-normalization is introduced (PATCH-4D-VSR-01 Request Contract).
const SLUG_FORMAT = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 40;

function isValidSlugSyntax(slug: string): boolean {
  return (
    slug.length >= SLUG_MIN_LENGTH &&
    slug.length <= SLUG_MAX_LENGTH &&
    SLUG_FORMAT.test(slug) &&
    !slug.startsWith("xn--")
  );
}

/**
 * `marketplace.resolve_vendor_slug.v1` — resolve the public vendor microsite route's `[slug]`
 * segment to a live vendor (`current`), a redirect target (`migrated` — ONLY when the migration
 * target is currently visible), or the uniform not-found collapse (absent, live-but-invisible, OR a
 * history match whose target is no longer visible — Invariant #11, the two-hop non-disclosure case).
 */
export async function resolveVendorSlug(
  key: ResolveVendorSlugKey,
  db: DbExecutor = prisma,
): Promise<ResolveVendorSlugOutcome> {
  if (!isValidSlugSyntax(key.slug)) {
    return { status: "invalid_input" };
  }

  // Live slug first (Doc-6D `vendor_profiles.slug`, live-unique).
  const live = await findLiveVendorBySlug(key.slug, db);
  if (live !== null) {
    // A live match that is NOT publicly visible (unpublished/banned/suspended) collapses to
    // not_found — NEVER surfaced as `current` (the uniform-collapse V-1 case).
    return isVendorProfilePubliclyVisible(live)
      ? { status: "current", vendorProfileId: live.vendorProfileId }
      : { status: "not_found" };
  }

  // Fall back to `vendor_slug_history.old_slug` — gate `migrated` on the TARGET's CURRENT
  // visibility (Invariant #11: a slug migrated and later banned/unpublished must still collapse to
  // not_found, never redirect to a now-hidden vendor — PATCH-4D-VSR-01 Non-Disclosure).
  const history = await findVendorSlugHistoryTarget(key.slug, db);
  if (history !== null && isVendorProfilePubliclyVisible(history)) {
    return { status: "migrated", currentSlug: history.currentSlug };
  }

  return { status: "not_found" };
}
