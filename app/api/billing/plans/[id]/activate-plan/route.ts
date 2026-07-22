// Thin Next.js App Router entry for `POST /billing/plans/{plan_id}/activate-plan` —
// `billing.activate_plan.v1` (Doc-5I §4 → `200`). REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION ONLY.
// Admin (platform-staff) audited write; the composition core (`src/server/billing`) owns the session→401
// gate, SYNTAX, the staff gate, and the audit. BOUNDARY (§9): imports `src/server/*` + module contracts only.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleActivatePlan } from "@/server/billing";
import type { ActivatePlanInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `activate_plan` (Doc-4I §HB-1.1a). */
interface ActivatePlanBody {
  expected_status?: unknown;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: ActivatePlanBody;
  try {
    body = (await request.json()) as ActivatePlanBody;
  } catch {
    body = {};
  }

  const input: ActivatePlanInput = {
    planId: id,
    expectedStatus: body.expected_status as ActivatePlanInput["expectedStatus"],
  };

  const { status, body: responseBody } = await handleActivatePlan(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
