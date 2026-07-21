// Thin Next.js App Router entry for `/identity/growth_invitations`:
//   - `POST` → `identity.create_invitation.v1` (Doc-5C v1.0.1 row 36 → `201`; User, active-org =
//     the referrer; `can_manage_growth_invites`; Idempotency-Key MANDATORY — Doc-5C §4.3).
//     P1 Growth Hub M1 core slice. ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` + module `contracts/` + `src/shared/*`
// only — never a module internal. The body carries ONLY the declared §C13 fields (Doc-4A §9.7
// prohibited inputs — actor/org/attribution/lifecycle-state — are never mapped; unknown keys are
// dropped at this seam so they cannot influence the write).
//
// `Cache-Control: no-store` on EVERY response (conformance G-3 — the 201 carries the raw token;
// Doc-5C v1.0.1 §2 extends the stamped §B6 `no-store` to the token-bearing create leg, Review-A
// OBS-1 protective hardening). The token is never logged at this seam (G-6).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCreateInvitation } from "@/server/identity";
import type { CreateInvitationInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C v1.0.3 §C13 — snake_case wire field names). */
interface CreateInvitationBody {
  campaign_key?: unknown;
  recipient_type?: unknown;
  recipient_identifier?: unknown;
}

/** Map the snake_case wire body → the typed command input. Type mismatches pass through for the
 *  command's SYNTAX validation to reject uniformly (the create-organization seam precedent). */
function toInput(body: CreateInvitationBody): CreateInvitationInput {
  const input: CreateInvitationInput = {
    campaignKey: body.campaign_key as string,
    recipientType: body.recipient_type as CreateInvitationInput["recipientType"],
  };
  if (body.recipient_identifier !== undefined) {
    input.recipientIdentifier = body.recipient_identifier as string;
  }
  return input;
}

/**
 * `POST /identity/growth_invitations` — create a growth invitation. Unauthenticated → `401`;
 * created → `201` (result carries the raw `token` ONCE — GI-2); validation → `400`; forbidden →
 * `403`; unknown campaign → `422`; quota → `403`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: CreateInvitationBody;
  try {
    body = (await request.json()) as CreateInvitationBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleCreateInvitation(toInput(body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers = {
    ...(wireHeaders ?? {}),
    "Cache-Control": "no-store", // G-3 — token-bearing response; never enters any cache tier.
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}
