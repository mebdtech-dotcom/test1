// Thin Next.js App Router entry for `POST /billing/plans/{plan_id}/retire-plan` — `billing.retire_plan.v1`
// (Doc-5I §4 → `200`). REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION ONLY. Admin audited write; the
// composition core owns session→401, SYNTAX, the staff gate, and the audit. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleRetirePlan } from "@/server/billing";
import type { RetirePlanInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `retire_plan` (Doc-4I §HB-1.1). */
interface RetirePlanBody {
  expected_status?: unknown;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: RetirePlanBody;
  try {
    body = (await request.json()) as RetirePlanBody;
  } catch {
    body = {};
  }

  const input: RetirePlanInput = {
    planId: id,
    expectedStatus: body.expected_status as RetirePlanInput["expectedStatus"],
  };

  const { status, body: responseBody } = await handleRetirePlan(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
