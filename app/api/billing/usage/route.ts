// Thin Next.js App Router entry for `GET /billing/usage` — `billing.get_usage.v1` (Doc-5I §6.2 → `200`).
// REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION ONLY. Org-self read; the composition core
// (`src/server/billing`) owns session→401, the active-org + `can_view_billing` gate, and ALL SYNTAX
// (filter allowlist, period, cursor, page_size). This route only extracts the Doc-5A §8 wire grammar
// (`filter[quota_key|period]`, `cursor`, `page_size`). BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetUsage } from "@/server/billing";
import type { GetUsageRequest } from "@/modules/billing/contracts";

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

  const usageRequest: GetUsageRequest = {
    filters,
    ...(cursor !== null ? { cursor } : {}),
    // Parse to a number here; the composition rejects a non-integer / out-of-bound value as SYNTAX 400.
    ...(pageSize !== null ? { pageSize: Number(pageSize) } : {}),
  };

  const { status, body } = await handleGetUsage(usageRequest, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
