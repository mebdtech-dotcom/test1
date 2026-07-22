// Thin Next.js App Router entry for `GET /billing/subscriptions/{subscription_id}/events` —
// `billing.list_subscription_events.v1` (Doc-5I §5 → `200`). REPOSITORY_STRUCTURE §8: ROUTING +
// COMPOSITION ONLY. Org-self read; the composition core (`src/server/billing`) owns session→401, the
// active-org + `can_view_billing` gate, and ALL SYNTAX (uuid, cursor, page_size bound). This route only
// extracts the Doc-5A §8 wire grammar (`cursor`, `page_size`). BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleListSubscriptionEvents } from "@/server/billing";
import type { ListSubscriptionEventsRequest } from "@/modules/billing/contracts";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const pageSize = url.searchParams.get("page_size");

  const listRequest: ListSubscriptionEventsRequest = {
    subscriptionId: id,
    ...(cursor !== null ? { cursor } : {}),
    // Parse to a number here; the composition rejects a non-integer / out-of-bound value as SYNTAX 400
    // (`Number("abc")` → NaN → rejected; never clamped — Doc-5A §8.5).
    ...(pageSize !== null ? { pageSize: Number(pageSize) } : {}),
  };

  const { status, body } = await handleListSubscriptionEvents(listRequest, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
