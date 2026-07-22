// Thin Next.js App Router entry for `GET /billing/subscriptions/current` — `billing.get_subscription.v1`
// (Doc-5I §5 → `200`; the `subscription_id`-optional path realized as `/current` — Doc-5I RR-m4).
// ROUTING + COMPOSITION ONLY (§8). Org-self read; the composition owns session→401 + active-org scoping.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetSubscription } from "@/server/billing";

export async function GET(): Promise<NextResponse> {
  const { status, body } = await handleGetSubscription({
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
