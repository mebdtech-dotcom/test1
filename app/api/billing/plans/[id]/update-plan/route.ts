// Thin Next.js App Router entry for `POST /billing/plans/{plan_id}/update-plan` — `billing.update_plan.v1`
// (Doc-5I §4 → `200`). REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION ONLY. Admin audited write; the
// composition core owns session→401, SYNTAX, the staff gate, and the audit. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleUpdatePlan } from "@/server/billing";
import type { UpdatePlanInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `update_plan` (Doc-4I §HB-1.1 marketing config). */
interface UpdatePlanBody {
  expected_status?: unknown;
  name?: unknown;
  billing_cycle?: unknown;
  price?: unknown;
  currency?: unknown;
}

/** Map the wire body → the typed input (field-level SYNTAX re-validated in the composition/command). */
function toUpdatePlanInput(id: string, body: UpdatePlanBody): UpdatePlanInput {
  return {
    planId: id,
    expectedStatus: body.expected_status as UpdatePlanInput["expectedStatus"],
    ...(body.name !== undefined ? { name: body.name as string } : {}),
    ...(body.billing_cycle !== undefined
      ? { billingCycle: body.billing_cycle as UpdatePlanInput["billingCycle"] }
      : {}),
    ...(body.price !== undefined
      ? { price: typeof body.price === "number" ? String(body.price) : (body.price as string) }
      : {}),
    ...(body.currency !== undefined ? { currency: body.currency as string } : {}),
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: UpdatePlanBody;
  try {
    body = (await request.json()) as UpdatePlanBody;
  } catch {
    body = {};
  }

  const { status, body: responseBody } = await handleUpdatePlan(toUpdatePlanInput(id, body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
