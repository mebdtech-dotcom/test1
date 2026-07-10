// Thin Next.js App Router entry for `POST /identity/organizations/{id}/set_organization_status` —
// `identity.set_organization_status.v1` (Doc-5C §4.1 row 10 → `200`; Admin 21.6, NO active-org
// context; W2-IDN-6.2). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// The platform-staff basis is SERVER-DERIVED (Doc-5C §3.2) via the DC-3 fail-closed production
// resolver bound in the handler core — no header/body field can assert staffness (Doc-4A §9.7).
// Every non-staff caller receives the uniform frozen §C5 `identity_org_forbidden` (403) — the
// deny-by-construction leg (see `organization-admin.route-handler.ts`). `updated_at` is the frozen
// REQUIRED request-body field (no If-Match — no `Concurrency: optimistic` declaration; the
// RV-0153 call-1 discipline).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleSetOrganizationStatus } from "@/server/identity";
import type { SetOrganizationStatusInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C5 — snake_case wire field names; the target
 *  `organization_id` is the path `{id}`, never a body field). */
interface SetOrganizationStatusBody {
  target_status?: unknown;
  reason?: unknown;
  updated_at?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input. */
function toInput(id: string, body: SetOrganizationStatusBody): SetOrganizationStatusInput {
  return {
    targetOrganizationId: id,
    targetStatus: body.target_status as SetOrganizationStatusInput["targetStatus"],
    reason: body.reason as string,
    updatedAt:
      typeof body.updated_at === "string" ? new Date(body.updated_at) : new Date(Number.NaN),
  };
}

/**
 * `POST /identity/organizations/{id}/set_organization_status` — Admin suspend/reinstate (Doc-2
 * §5.1 `active ⇄ suspended`, platform governance). Unauthenticated → `401`; non-staff → `403`;
 * transitioned → `200`; validation → `400`; absent target → `404`; illegal edge / stale token →
 * `409` (losing writes carry `ETag`).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: SetOrganizationStatusBody;
  try {
    body = (await request.json()) as SetOrganizationStatusBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleSetOrganizationStatus(toInput(id, body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers = {
    ...(wireHeaders ?? {}),
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}
