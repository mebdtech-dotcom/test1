// Thin Next.js App Router entry for `GET /billing/plans/{plan_id}` — `billing.get_plan.v1`
// (Doc-5I §4 → `200`; `401` unauthenticated; `400` malformed id; `404` absent/retired).
// REPOSITORY_STRUCTURE §8: `app/` does ROUTING + COMPOSITION ONLY — no business logic. Authenticated
// Platform-Public read (Doc-5I §3.6): the composition core owns the session→401 gate; no org context.
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` only — never a module internal.

import { NextResponse } from "next/server";
import { resolveSupabaseSession } from "@/server/auth";
import { handleGetPlan } from "@/server/billing";

/**
 * `GET /billing/plans/{plan_id}` — the authenticated plan-catalog single read.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const { status, body } = await handleGetPlan(
    { planId: id },
    { resolveSession: resolveSupabaseSession },
  );

  // A stale cached response of a since-retired/since-changed plan would escape the non-retired visibility
  // scope — `no-store` on every response, success or error. `401` also carries the HTTP auth challenge.
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
