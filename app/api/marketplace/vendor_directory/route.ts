// Thin Next.js App Router entry for `GET /marketplace/vendor_directory` —
// `marketplace.list_vendor_directory.v1` (Doc-5D_VendorDirectoryProjection_Patch_v1.0.3 row 63 →
// `200`). REPOSITORY_STRUCTURE §8: `app/` does ROUTING + COMPOSITION ONLY — no business logic.
// Anonymous PUBLIC read: no session, no active-org context.
//
// Wire grammar (Doc-5A §8): `filter[<field>]=<value>` query params (§8.3), `cursor` (§8.2),
// `page_size` (§8.5) — this route only extracts them; ALL SYNTAX validation (allowlist, format,
// bounds) happens in `handleListVendorDirectory` (`src/server/marketplace`).
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` only — never a module internal.

import { NextResponse } from "next/server";
import { handleListVendorDirectory } from "@/server/marketplace";

const FILTER_PARAM = /^filter\[(.+)\]$/;

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const filters: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    const match = FILTER_PARAM.exec(key);
    if (match) {
      filters[match[1]] = value;
    }
  }

  const cursor = url.searchParams.get("cursor");
  const pageSize = url.searchParams.get("page_size");

  const { status, body } = await handleListVendorDirectory({
    filters,
    ...(cursor !== null ? { cursor } : {}),
    ...(pageSize !== null ? { pageSize } : {}),
  });
  // A stale cached response of a since-banned/since-migrated vendor would violate the non-disclosure
  // guarantee (Invariant #11) — explicit `no-store` on every response, success or error.
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
