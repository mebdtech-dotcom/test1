// Thin Next.js App Router entry for `POST /identity/memberships/{id}/accept_invitation` —
// `identity.accept_invitation.v1` (Doc-5C §5.1 row 13 → `200`; User (invitee), PRE-membership —
// no active-org context; W2-IDN-6.3). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
// The frozen identity-match leg: the path `{id}` + the authenticated caller — a wrong/foreign
// invitation collapses to the byte-identical `404` (§7.5).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleAcceptInvitation } from "@/server/identity";
import type { AcceptInvitationInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C6 PassB:363 — `updated_at` is OPTIONAL here). */
interface AcceptInvitationBody {
  updated_at?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input. */
function toInput(id: string, body: AcceptInvitationBody): AcceptInvitationInput {
  const input: AcceptInvitationInput = { targetMembershipId: id };
  if (body.updated_at !== undefined) {
    input.updatedAt =
      typeof body.updated_at === "string" ? new Date(body.updated_at) : new Date(Number.NaN);
  }
  return input;
}

/**
 * `POST /identity/memberships/{id}/accept_invitation` — the invitee accepts (`invited → pending`;
 * still no business access — activation is the separate System step). Unauthenticated → `401`;
 * accepted → `200`; validation → `400`; absent/foreign invitation → `404` (byte-identical);
 * already accepted / revoked / expired → `409`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: AcceptInvitationBody;
  try {
    body = (await request.json()) as AcceptInvitationBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleAcceptInvitation(toInput(id, body), {
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
