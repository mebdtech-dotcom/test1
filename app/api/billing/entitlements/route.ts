// Thin Next.js App Router entry for `POST /billing/entitlements` — `billing.create_entitlement.v1`
// (Doc-5I §4 → `201` + `Location`). REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION ONLY. Admin audited
// write; the composition core (`src/server/billing`) owns session→401, SYNTAX, the staff gate, and audit.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCreateEntitlement } from "@/server/billing";
import type { CreateEntitlementInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `create_entitlement` (Doc-4I §HB-1.3). */
interface CreateEntitlementBody {
  slug?: unknown;
  type?: unknown;
  default_value?: unknown;
}

function toCreateEntitlementInput(body: CreateEntitlementBody): CreateEntitlementInput {
  return {
    slug: body.slug as string,
    type: body.type as CreateEntitlementInput["type"],
    ...(body.default_value !== undefined ? { defaultValue: body.default_value } : {}),
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: CreateEntitlementBody;
  try {
    body = (await request.json()) as CreateEntitlementBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleCreateEntitlement(toCreateEntitlementInput(body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store", ...(wireHeaders ?? {}) };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
