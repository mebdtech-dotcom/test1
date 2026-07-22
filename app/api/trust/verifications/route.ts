// Thin Next.js App Router entry for `POST /trust/verifications` — `trust.request_verification.v1`
// (Doc-4G §G4.1 → `201` + `Location`; Doc-5G §4). REPOSITORY_STRUCTURE §8: `app/` does ROUTING +
// COMPOSITION ONLY — no business logic. This entry parses the body → typed input, reads the mandatory
// `Idempotency-Key` header (Doc-5G §4.6), binds the LIVE defaults (the cookie-bound Supabase session
// resolver + the concrete first-login provisioning hook), delegates to the app-layer handler core in
// `src/server/trust`, then serializes the transport-agnostic `WireResponse` to a `NextResponse`.
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): an `app/` file imports `src/server/*` + module `contracts/` +
// `src/shared/*` only — never a module internal, never cross-schema SQL.
//
// AUTH-BOUNDARY 401 (DC-4): the unauthenticated case is a transport-level auth-boundary response (no
// Doc-5A contract `error_class`); on a `401` this entry also sets the HTTP-standard `WWW-Authenticate`
// header (pure HTTP transport, Doc-5A §4.0). On `201` it carries the `Location` header from the core.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleRequestVerification } from "@/server/trust";
import { parseIdempotencyKey } from "@/shared/http";
import type { RequestVerificationInput } from "@/modules/trust/contracts";

/** Shape of the JSON request body (Doc-4G §G4.1 — snake_case wire field names). */
interface RequestVerificationBody {
  subject_id?: unknown;
  subject_type?: unknown;
  verification_type?: unknown;
  evidence_document_refs?: unknown;
}

/** Map the snake_case wire body → the typed (camelCase) command input (Doc-4G §G4.1 request contract).
 *  Types are trusted only shallowly here — the M5 command owns SYNTAX validation (Doc-4A §11.2 stage 1). */
function toRequestVerificationInput(body: RequestVerificationBody): RequestVerificationInput {
  return {
    subjectId: typeof body.subject_id === "string" ? body.subject_id : "",
    subjectType: body.subject_type as RequestVerificationInput["subjectType"],
    verificationType: body.verification_type as RequestVerificationInput["verificationType"],
    ...(Array.isArray(body.evidence_document_refs)
      ? { evidenceDocumentRefs: body.evidence_document_refs as string[] }
      : {}),
  };
}

/**
 * `POST /trust/verifications` — `trust.request_verification.v1` (Doc-4G §G4.1). Open an organization
 * verification case (state `requested`), appending the canonical audit action atomically. The handler
 * core resolves the session, provisions, authorizes (`can_submit_verification`), and runs the M5 command
 * inside the server-validated active-org context. Unauthenticated → `401`; created → `201` + `Location`;
 * missing Idempotency-Key / validation → `400`; forbidden → `403`; scope / no context → `404`; open case
 * exists → `422`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: RequestVerificationBody;
  try {
    body = (await request.json()) as RequestVerificationBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers,
  } = await handleRequestVerification(toRequestVerificationInput(body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const outHeaders: Record<string, string> = { ...(headers ?? {}) };
  if (status === 401) outHeaders["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, {
    status,
    ...(Object.keys(outHeaders).length > 0 ? { headers: outHeaders } : {}),
  });
}
