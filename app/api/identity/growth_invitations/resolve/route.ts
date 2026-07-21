// Thin Next.js App Router entry for `/identity/growth_invitations/resolve`:
//   - `GET` → `identity.resolve_invitation_token.v1` (Doc-5C v1.0.1 row 37 → `200`; **PUBLIC** —
//     M1's FIRST public identity route: NO `Authorization`, NO `Iv-Active-Organization`, no
//     session resolution, no provisioning — anonymous, identical response for every caller class;
//     the Doc-5D `get_public_product_detail` public-carriage precedent). P1 Growth Hub M1 core
//     slice. ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// The `resolve` path token is the Board-STAMPED §B6 literal (Doc-5C v1.0.1 §1 stamped-token
// deviation note — not a precedent for any other row). The raw token rides the query string AS
// MANDATED; `Cache-Control: no-store` on every response (unlike Doc-5D it is NOT
// anonymous-cacheable — packet §B6 / conformance G-3), and the token parameter is never logged at
// this seam (the §3 hygiene obligation, G-6). Rate limiting binds
// `identity.growth_invite_resolve_rate_limit` inside the composition (v1.11 no-value model —
// dormant until the operational value is configured).

import { NextResponse } from "next/server";
import { handleResolveInvitationToken } from "@/server/identity";

/**
 * `GET /identity/growth_invitations/resolve?token=…` — public token resolve. Well-formed →
 * `200 { valid, campaignKey? }` uniformly (the house camelCase result convention — Lane-2 NIT-1;
 * anti-oracle — unknown/expired/revoked are all `valid:false`, never a 404/error); absent token →
 * `400` (SYNTAX only); over budget → `429`.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleResolveInvitationToken(
    url.searchParams.get("token"),
    request.headers.get("x-forwarded-for"),
  );

  const headers = {
    ...(wireHeaders ?? {}),
    "Cache-Control": "no-store", // G-3 — a token-resolution response never enters any cache tier.
  };
  return NextResponse.json(responseBody, { status, headers });
}
