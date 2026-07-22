// Shared vendor loader for the multi-page microsite (M2.7 · realizes ADR-022 / Doc-7D §10.4). Every page
// resolves its OWN data (Board ruling: data load is per-page, not centralized in the layout) — but they all
// go through this ONE helper so the published-only 404 (and the permanent-redirect target) is
// byte-equivalent on every route (Invariant #11, no divergence).
//
// WIRED (W3-MKT-1 pilot slice, 2026-07-11): `getVendorOr404` now calls the real M2 composed seam
// (`resolvePublicVendor`, `src/server/marketplace`), which chains `marketplace.resolve_vendor_slug.v1` →
// `marketplace.get_public_vendor_profile.v1` server-side. It is now ASYNC (a DB round trip) — every
// caller MUST `await` it. `kind: 'redirect'` issues Next's `permanentRedirect()` (308) to the vendor's
// CURRENT slug — the canonical realization of the frozen "a retired slug's permanent 301 is public
// behavior" characterization (Doc-6D_VendorSlugSubdomain_Patch_v1.0.1 6D-VSS-01.3 /
// Doc-4D_VendorSlugResolve_Patch_v1.0.4): Next.js App Router issues permanent redirects as 308
// (method-preserving; the modern equivalent Next.js recommends over 301), never `redirect()`'s
// temporary 307. `kind: 'not_found'` throws Next's `notFound()`, byte-identical for absent /
// unpublished / banned / migrated-but-now-hidden (Invariant #11). Only THIS file was rewired —
// `_components/discovery/seed.ts` is untouched and still backs `generateMetadata` + the
// products/showcase reads on every page (out of this pilot's scope; see the plan's Scope boundary —
// `list_vendor_directory`/product/microsite-content reads are later slices).
//
// Default `cache: 'no-store'` semantics: this is a Server Component data call with NO `fetch()` (an
// in-process contracts call, not an HTTP round-trip), so there is no Next.js fetch cache to opt out of;
// every page/layout under this segment also sets `export const dynamic = 'force-dynamic'` (no
// `generateStaticParams`/ISR on this route) — a stale render would directly risk the non-disclosure
// guarantee (a since-hidden or since-migrated vendor must stop resolving promptly).
//
// REQUEST-SCOPED MEMOIZATION: `layout.tsx` and every sibling page call `getVendorOr404` independently
// for the SAME request (Board ruling: each page resolves its own data — see the file-top comment),
// each triggering `resolvePublicVendor`'s 2 DB queries. `resolvePublicVendorCached` wraps the raw data
// call (not the `notFound()`/`permanentRedirect()` control flow) in React's `cache()` — the App-Router
// request-memoization primitive (NOT a Next.js `fetch()` cache; this is a direct in-process function
// call) — so every call site sharing the SAME `slug` within ONE request shares a single resolution.
// React resets this cache per request; it never persists across requests/users.
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { resolvePublicVendor } from "@/server/marketplace";
import type { PublicVendorProfileView } from "@/modules/marketplace/contracts";
import type { PublicVendorProfileVM } from "../../_components/discovery/seed";
import { vendorHref } from "../../_components/vendor-url";

const resolvePublicVendorCached = cache(resolvePublicVendor);

/**
 * Map the real M2 public-projection DTO to the existing microsite presentation VM. `slug` is carried
 * through from the CALLER (the resolved `current` branch's input slug IS the vendor's live slug — the
 * frozen projection itself carries no `slug` field, only `human_ref`). `verified` (Trust binary signal,
 * DD-1) and `about` (published profile-experience content) are DEFERRED — not realized by this pilot
 * slice (see the W3-MKT-1 WP card Outputs) — absence renders as absence (GI-03), never a fabricated
 * placeholder; the existing components already treat both as optional. `category` (the VM's required
 * singular primary-category label) takes the first active assignment (the M2 profile repository orders
 * `primary` before `secondary`); `categories` carries every active assignment's name.
 */
function toVendorProfileVM(slug: string, profile: PublicVendorProfileView): PublicVendorProfileVM {
  const categoryNames = profile.categories.map((c) => c.name);
  const location = [
    profile.geography.division,
    profile.geography.district,
    profile.geography.industrialZone,
  ]
    .filter((part): part is string => part !== null && part.length > 0)
    .join(" · ");

  return {
    slug,
    name: profile.name,
    category: categoryNames[0] ?? "",
    location: location.length > 0 ? location : undefined,
    capability: {
      can_supply: profile.capabilityFlags.canSupply,
      can_service: profile.capabilityFlags.canService,
      can_fabricate: profile.capabilityFlags.canFabricate,
      can_consult: profile.capabilityFlags.canConsult,
    },
    categories: categoryNames,
  };
}

/** Resolve a vendor's public profile or render the byte-equivalent 404 / issue the migrated-slug
 *  redirect. Used by the route-group layout (for chrome) and by every page (for its own content) —
 *  one gate, identical semantics everywhere. ASYNC — every caller MUST `await` it. */
export async function getVendorOr404(slug: string): Promise<PublicVendorProfileVM> {
  const outcome = await resolvePublicVendorCached(slug);

  if (outcome.kind === "redirect") {
    permanentRedirect(vendorHref(outcome.to));
  }
  if (outcome.kind === "not_found") {
    notFound();
  }

  return toVendorProfileVM(slug, outcome.profile);
}
