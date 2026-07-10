// Thin Next.js App Router entry for `POST /identity/memberships/{id}/remove_member` —
// `identity.remove_member.v1` (Doc-5C §5.1 row 15 → `200`; User, active-org; W2-IDN-6.3).
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). `updated_at` is the frozen REQUIRED
// request-body field (no `Concurrency: optimistic` on §C6 — no If-Match; RV-0153 call-1). The
// §5.5 Last-Owner guard + RV-0150 serialization live in the command/resolver, never here.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleRemoveMember } from "@/server/identity";
import type { RemoveMemberInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C6 PassB:405 — snake_case wire field names). */
interface RemoveMemberBody {
  reason?: unknown;
  updated_at?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input. */
function toInput(id: string, body: RemoveMemberBody): RemoveMemberInput {
  const input: RemoveMemberInput = {
    targetMembershipId: id,
    updatedAt:
      typeof body.updated_at === "string" ? new Date(body.updated_at) : new Date(Number.NaN),
  };
  if (body.reason !== undefined) {
    input.reason = body.reason as string;
  }
  return input;
}

/**
 * `POST /identity/memberships/{id}/remove_member` — remove a member (`active|suspended → removed`,
 * terminal; audit retained; re-invite creates a NEW membership). Unauthenticated → `401`;
 * removed → `200`; validation/stale view → `400`; forbidden → `403`; foreign/no context → `404`;
 * wrong-state / losing write → `409` (losing write carries `ETag`); sole-active-Owner removal →
 * `422` (Last Owner Protection — run succession first).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: RemoveMemberBody;
  try {
    body = (await request.json()) as RemoveMemberBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleRemoveMember(toInput(id, body), {
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
