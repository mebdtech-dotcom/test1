// Thin Next.js App Router entry for `POST /identity/memberships/{id}/revoke_invitation` —
// `identity.revoke_invitation.v1` (Doc-5C §5.1 row 16 → `200`; User, active-org; W2-IDN-6.3).
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). `updated_at` is the frozen REQUIRED
// request-body field (no `Concurrency: optimistic` on §C6 — no If-Match; RV-0153 call-1).
// NOT §5.5-guarded (the frozen §C6 revoke register authors no last-owner stage).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleRevokeInvitation } from "@/server/identity";
import type { RevokeInvitationInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C6 PassB:419 — snake_case wire field names). */
interface RevokeInvitationBody {
  updated_at?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input. */
function toInput(id: string, body: RevokeInvitationBody): RevokeInvitationInput {
  return {
    targetMembershipId: id,
    updatedAt:
      typeof body.updated_at === "string" ? new Date(body.updated_at) : new Date(Number.NaN),
  };
}

/**
 * `POST /identity/memberships/{id}/revoke_invitation` — revoke a not-yet-accepted invitation
 * (`invited → removed`, terminal; audit retained). Unauthenticated → `401`; revoked → `200`;
 * validation/stale view → `400`; forbidden → `403`; foreign/no context → `404`;
 * already accepted/removed / losing write → `409` (losing write carries `ETag`).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: RevokeInvitationBody;
  try {
    body = (await request.json()) as RevokeInvitationBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleRevokeInvitation(toInput(id, body), {
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
