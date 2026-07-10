// Thin Next.js App Router entry for `POST /identity/memberships/{id}/set_membership_status` —
// `identity.set_membership_status.v1` (Doc-5C §5.1 row 14 → `200`; User, active-org; W2-IDN-6.3).
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). `updated_at` is the frozen REQUIRED
// request-body field (§C6 declares NO `Concurrency: optimistic` — no If-Match on this contract;
// the RV-0153 call-1 discipline). The §5.5 Last-Owner guard + RV-0150 serialization live in the
// command/resolver, never here.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleSetMembershipStatus } from "@/server/identity";
import type { SetMembershipStatusInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C6 PassB:391 — snake_case wire field names). */
interface SetMembershipStatusBody {
  target_status?: unknown;
  reason?: unknown;
  updated_at?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input. */
function toInput(id: string, body: SetMembershipStatusBody): SetMembershipStatusInput {
  const input: SetMembershipStatusInput = {
    targetMembershipId: id,
    targetStatus: body.target_status as SetMembershipStatusInput["targetStatus"],
    updatedAt:
      typeof body.updated_at === "string" ? new Date(body.updated_at) : new Date(Number.NaN),
  };
  if (body.reason !== undefined) {
    input.reason = body.reason as string;
  }
  return input;
}

/**
 * `POST /identity/memberships/{id}/set_membership_status` — suspend/reinstate a membership
 * (`active ⇄ suspended`). Unauthenticated → `401`; transitioned → `200`; validation/stale view →
 * `400`; forbidden → `403`; foreign/no context → `404`; illegal edge / losing write → `409`
 * (losing write carries `ETag`); sole-active-Owner suspend → `422` (Last Owner Protection).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: SetMembershipStatusBody;
  try {
    body = (await request.json()) as SetMembershipStatusBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleSetMembershipStatus(toInput(id, body), {
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
