// Thin Next.js App Router entry for `GET /marketplace/vendor_slug_resolutions/{slug}` —
// `marketplace.resolve_vendor_slug.v1` (Doc-5D_VendorSlugResolve_Patch_v1.0.2 row 66 → `200`;
// non-disclosure → `404`). REPOSITORY_STRUCTURE §8: `app/` does ROUTING + COMPOSITION ONLY — no
// business logic. Anonymous PUBLIC read: no session resolution, no active-org context — this route
// delegates straight to the app-layer handler core in `src/server/marketplace`.
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): an `app/` file imports `src/server/*` + module `contracts/` +
// `src/shared/*` only — never a module internal, never cross-schema SQL.

import { NextResponse } from "next/server";
import { handleResolveVendorSlug } from "@/server/marketplace";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const { status, body } = await handleResolveVendorSlug(slug);
  // A stale cached response of a since-banned/since-migrated vendor's slug would violate the
  // non-disclosure guarantee (Invariant #11) — explicit `no-store` on every response, success or
  // error, not left to a framework default.
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
