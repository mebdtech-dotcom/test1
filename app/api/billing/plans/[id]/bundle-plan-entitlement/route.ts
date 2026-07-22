// Thin Next.js App Router entry for `POST /billing/plans/{plan_id}/bundle-plan-entitlement` —
// `billing.bundle_plan_entitlement.v1` (Doc-5I §4 → `200`). ROUTING + COMPOSITION ONLY (§8). Admin audited
// write; the composition core owns session→401, SYNTAX, the staff gate, and audit.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleBundlePlanEntitlement } from "@/server/billing";
import type { BundlePlanEntitlementInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `bundle_plan_entitlement` (Doc-4I §HB-1.2 — `plan_id` from path). */
interface BundlePlanEntitlementBody {
  entitlement_id?: unknown;
  value_jsonb?: unknown;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: BundlePlanEntitlementBody;
  try {
    body = (await request.json()) as BundlePlanEntitlementBody;
  } catch {
    body = {};
  }

  const input: BundlePlanEntitlementInput = {
    planId: id,
    entitlementId: body.entitlement_id as string,
    valueJsonb: body.value_jsonb,
  };

  const { status, body: responseBody } = await handleBundlePlanEntitlement(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
