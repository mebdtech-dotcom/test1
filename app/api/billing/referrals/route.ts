// Thin Next.js App Router entry for `GET /billing/referrals` — `billing.list_referrals.v1` (Doc-5I §9 →
// `200`) — and `POST /billing/referrals` — `billing.track_referral.v1` (§9 → `201`). REPOSITORY_STRUCTURE
// §8: ROUTING + COMPOSITION ONLY. Org-self (referrer); the composition core owns session→401, the active-org
// + slug gate, and ALL SYNTAX. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleListReferrals, handleTrackReferral } from "@/server/billing";
import type { ListReferralsRequest, TrackReferralInput } from "@/modules/billing/contracts";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const pageSize = url.searchParams.get("page_size");

  const listRequest: ListReferralsRequest = {
    ...(cursor !== null ? { cursor } : {}),
    // Parse to a number here; the composition rejects a non-integer / out-of-bound value as SYNTAX 400.
    ...(pageSize !== null ? { pageSize: Number(pageSize) } : {}),
  };

  const { status, body } = await handleListReferrals(listRequest, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}

/** Snake_case wire body for `track_referral` (Doc-4I §HB-6.2). `referrer_organization_id` = server-derived. */
interface TrackReferralBody {
  referred_organization_id?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: TrackReferralBody;
  try {
    body = (await request.json()) as TrackReferralBody;
  } catch {
    body = {};
  }

  const input: TrackReferralInput = {
    referredOrganizationId: body.referred_organization_id as string,
  };

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleTrackReferral(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store", ...(wireHeaders ?? {}) };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
