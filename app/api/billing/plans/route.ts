// Thin Next.js App Router entry for `GET /billing/plans` — `billing.list_plans.v1` (Doc-5I §4 → `200`).
// REPOSITORY_STRUCTURE §8: `app/` does ROUTING + COMPOSITION ONLY. Authenticated Platform-Public read
// (Doc-5I §3.6): the composition core (`src/server/billing`) owns the session→401 gate + ALL SYNTAX
// validation (filter allowlist, cursor, page_size); this route only extracts the wire grammar.
//
// Wire grammar (Doc-5A §8): `filter[<field>]=<value>` (§8.3), `cursor` (§8.2), `page_size` (§8.5).
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` only.

import { NextResponse } from "next/server";
import { resolveSupabaseSession } from "@/server/auth";
import { handleListPlans } from "@/server/billing";

const FILTER_PARAM = /^filter\[(.+)\]$/;

/**
 * `GET /billing/plans` — the authenticated paginated plan-catalog read.
 */
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

  const { status, body } = await handleListPlans(
    {
      filters,
      ...(cursor !== null ? { cursor } : {}),
      ...(pageSize !== null ? { pageSize } : {}),
    },
    { resolveSession: resolveSupabaseSession },
  );

  // `no-store` (non-retired visibility scope must not be served stale) + the `401` auth challenge.
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
