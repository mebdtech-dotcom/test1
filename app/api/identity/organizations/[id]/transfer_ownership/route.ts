// Thin Next.js App Router entry for `POST /identity/organizations/{id}/transfer_ownership` —
// `identity.transfer_ownership.v1` (Doc-5C §4.1 row 7 → `200`; User (Owner); W2-IDN-6.2).
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). The §5.5-guarded succession command —
// serialization (RV-0150) lives in the command/resolver, never here. `updated_at` is the frozen
// REQUIRED request-body field (§C5 declares NO `Concurrency: optimistic` — no If-Match on this
// contract; the RV-0153 call-1 discipline).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleTransferOwnership } from "@/server/identity";
import type { TransferOwnershipInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C5 — snake_case wire field names; the target org is the
 *  path `{id}`, never a body field). */
interface TransferOwnershipBody {
  new_owner_user_id?: unknown;
  reason_code?: unknown;
  approver_membership_id?: unknown;
  updated_at?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input. */
function toInput(id: string, body: TransferOwnershipBody): TransferOwnershipInput {
  const input: TransferOwnershipInput = {
    targetOrganizationId: id,
    newOwnerUserId: body.new_owner_user_id as string,
    reasonCode: body.reason_code as string,
    updatedAt:
      typeof body.updated_at === "string" ? new Date(body.updated_at) : new Date(Number.NaN),
  };
  if (body.approver_membership_id !== undefined) {
    input.approverMembershipId = body.approver_membership_id as string;
  }
  return input;
}

/**
 * `POST /identity/organizations/{id}/transfer_ownership` — ownership transfer/succession (§5.5).
 * Unauthenticated → `401`; transferred → `200`; validation → `400`; forbidden → `403`; foreign/no
 * context → `404`; losing/stale token → `409` + `ETag`; nominee not a member / succession blocked
 * → `422`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: TransferOwnershipBody;
  try {
    body = (await request.json()) as TransferOwnershipBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleTransferOwnership(toInput(id, body), {
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
