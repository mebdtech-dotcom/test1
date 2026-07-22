// Thin Next.js App Router entry for `GET /marketplace/public_vendor_profiles/{id}` —
// `marketplace.get_public_vendor_profile.v1` (Doc-5D_Content_v1.0_Pass1.md row 64 → `200`;
// non-disclosure → `404`). REPOSITORY_STRUCTURE §8: `app/` does ROUTING + COMPOSITION ONLY.
// Anonymous PUBLIC read: no session, no active-org context.
//
// UUID-vs-human_ref disambiguation on the single frozen `{id}` path segment: the request contract is
// `vendor_profile_id XOR human_ref` (Doc-4D_Content_v1.0_PassB_Discovery.md §BC-MKT-6), but the wire
// realization names the path segment `{id}`, not `{vendor_profile_id}` (Doc-5D row 64). This route
// infers which leg by FORMAT — a UUID-shaped segment → `vendor_profile_id`; otherwise →
// `human_ref` — a [§2.5]-style path realization choice, not a new identifier or a contract change;
// the query itself independently re-validates the chosen leg's SYNTAX (Doc-4D Validation Matrix).
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` only — never a module internal.

import { NextResponse } from "next/server";
import { handleGetPublicVendorProfile } from "@/server/marketplace";
import { UUID_PATTERN } from "@/shared/ids";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const key = UUID_PATTERN.test(id) ? { vendorProfileId: id } : { humanRef: id };
  const { status, body } = await handleGetPublicVendorProfile(key);
  // A stale cached response of a since-banned/since-migrated vendor would violate the non-disclosure
  // guarantee (Invariant #11) — explicit `no-store` on every response, success or error.
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
