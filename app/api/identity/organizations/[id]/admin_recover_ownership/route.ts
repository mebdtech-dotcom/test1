// Thin Next.js App Router entry for `POST /identity/organizations/{id}/admin_recover_ownership` —
// `identity.admin_recover_ownership.v1` (Doc-5C §4.1 row 11 → `200`; Admin 21.6, NO active-org
// context; W2-IDN-6.2). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// The §5.5 orphaned-ownership recovery — the RV-0150 serialization (FOR-UPDATE lock) lives in the
// command/resolver, never here. The platform-staff basis is SERVER-DERIVED (DC-3 fail-closed
// production resolver); every non-staff caller receives the uniform frozen 403 deny-by-construction
// leg. `updated_at` is the frozen REQUIRED request-body field (no If-Match).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleAdminRecoverOwnership } from "@/server/identity";
import type { AdminRecoverOwnershipInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C5 — snake_case wire field names; the target
 *  `organization_id` is the path `{id}`, never a body field). */
interface AdminRecoverOwnershipBody {
  new_owner_user_id?: unknown;
  reason_code?: unknown;
  updated_at?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input. */
function toInput(id: string, body: AdminRecoverOwnershipBody): AdminRecoverOwnershipInput {
  return {
    targetOrganizationId: id,
    newOwnerUserId: body.new_owner_user_id as string,
    reasonCode: body.reason_code as string,
    updatedAt:
      typeof body.updated_at === "string" ? new Date(body.updated_at) : new Date(Number.NaN),
  };
}

/**
 * `POST /identity/organizations/{id}/admin_recover_ownership` — Admin ownership-succession
 * recovery (§5.5, orphaned-ownership only). Unauthenticated → `401`; non-staff → `403`; recovered
 * → `200`; validation/stale token → `400`; absent target → `404`; nominee unresolvable → `422`;
 * recovery not applicable → `422`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: AdminRecoverOwnershipBody;
  try {
    body = (await request.json()) as AdminRecoverOwnershipBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleAdminRecoverOwnership(toInput(id, body), {
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
