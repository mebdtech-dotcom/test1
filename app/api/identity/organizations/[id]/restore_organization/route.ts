// Thin Next.js App Router entry for `POST /identity/organizations/{id}/restore_organization` —
// `identity.restore_organization.v1` (Doc-5C §4.1 row 9 → `200`; User (Owner) / Admin; W2-IDN-6.2).
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). The frozen `organization_id : uuid :
// required` request field is realized as the path `{id}` (Doc-5C §4.1 input placement — the 6.1
// `user_id` precedent). `updated_at` is the frozen REQUIRED request-body field (no If-Match — no
// `Concurrency: optimistic` declaration on this contract).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleRestoreOrganization } from "@/server/identity";
import type { RestoreOrganizationInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C5 — snake_case wire field names). */
interface RestoreOrganizationBody {
  reason?: unknown;
  updated_at?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input. */
function toInput(id: string, body: RestoreOrganizationBody): RestoreOrganizationInput {
  const input: RestoreOrganizationInput = {
    targetOrganizationId: id,
    updatedAt:
      typeof body.updated_at === "string" ? new Date(body.updated_at) : new Date(Number.NaN),
  };
  if (body.reason !== undefined) input.reason = body.reason as string;
  return input;
}

/**
 * `POST /identity/organizations/{id}/restore_organization` — restore a soft-deleted org (Doc-2
 * §5.1 `soft_deleted → active`; slug restore-conflict rule). Unauthenticated → `401`; restored →
 * `200`; validation/stale token → `400`; forbidden → `403`; non-member/absent → `404` (collapse);
 * not soft-deleted / losing restore → `409`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: RestoreOrganizationBody;
  try {
    body = (await request.json()) as RestoreOrganizationBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleRestoreOrganization(toInput(id, body), {
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
