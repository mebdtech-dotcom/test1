// Thin Next.js App Router entry for `POST /billing/entitlements/{entitlement_id}/update-entitlement` —
// `billing.update_entitlement.v1` (Doc-5I §4 → `200`). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleUpdateEntitlement } from "@/server/billing";
import type { UpdateEntitlementInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `update_entitlement` (Doc-4I §HB-1.3 — all optional; omitted = unchanged). */
interface UpdateEntitlementBody {
  type?: unknown;
  default_value?: unknown;
}

function toUpdateEntitlementInput(id: string, body: UpdateEntitlementBody): UpdateEntitlementInput {
  return {
    entitlementId: id,
    ...(body.type !== undefined ? { type: body.type as UpdateEntitlementInput["type"] } : {}),
    ...(body.default_value !== undefined ? { defaultValue: body.default_value } : {}),
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: UpdateEntitlementBody;
  try {
    body = (await request.json()) as UpdateEntitlementBody;
  } catch {
    body = {};
  }

  const { status, body: responseBody } = await handleUpdateEntitlement(
    toUpdateEntitlementInput(id, body),
    {
      resolveSession: resolveSupabaseSession,
      ensureProvisioned,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    },
  );

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
