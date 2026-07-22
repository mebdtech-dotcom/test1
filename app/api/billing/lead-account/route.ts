// Thin Next.js App Router entry for `GET /billing/lead-account` — `billing.get_lead_balance.v1`
// (Doc-5I §7 → `200`). REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION ONLY. Org-self read; the composition
// core (`src/server/billing`) owns session→401 + the active-org + `can_view_billing` gate. BOUNDARY (§9):
// `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetLeadBalance } from "@/server/billing";

export async function GET(): Promise<NextResponse> {
  const { status, body } = await handleGetLeadBalance({
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
