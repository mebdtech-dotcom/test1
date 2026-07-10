// Thin Next.js App Router entry for `POST /identity/memberships` — `identity.invite_member.v1`
// (Doc-5C §5.1 row 12 → `201` + `Location`; User, active-org; W2-IDN-6.3).
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` + module `contracts/` + `src/shared/*`
// only — never a module internal. The body carries ONLY the declared §C6 fields (Doc-4A §9.7
// prohibited inputs — actor/org/attribution/lifecycle-state — are never mapped; unknown keys are
// dropped at this seam so they cannot influence the write). The inviting org is the SERVER-RESOLVED
// active org (Invariant #5) — never a body field.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleInviteMember } from "@/server/identity";
import type { InviteMemberInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C6 PassB:348 — snake_case wire field names). */
interface InviteMemberBody {
  email?: unknown;
  role_id?: unknown;
  department?: unknown;
}

/** Map the snake_case wire body → the typed command input. Type mismatches pass through for the
 *  command's SYNTAX validation to reject uniformly. */
function toInput(body: InviteMemberBody): InviteMemberInput {
  const input: InviteMemberInput = {
    email: body.email as string,
    roleId: body.role_id as string,
  };
  if (body.department !== undefined) {
    input.department = body.department as string;
  }
  return input;
}

/**
 * `POST /identity/memberships` — invite a member (`→ invited`; grants no access).
 * Unauthenticated → `401`; invited → `201` + `Location`; validation → `400`; forbidden → `403`;
 * no context → `404`; already a member → `409`; unknown/foreign role → `422`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: InviteMemberBody;
  try {
    body = (await request.json()) as InviteMemberBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleInviteMember(toInput(body), {
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
