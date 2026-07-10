// Thin Next.js App Router entry for `POST /identity/organizations` —
// `identity.create_organization.v1` (Doc-5C §4.1 row 5 → `201` + `Location`; User bootstrap, NO
// active-org context; W2-IDN-6.2). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// NOTE: `GET /identity/organizations` (`identity.list_my_organizations.v1`) is the W2-IDN-6.6
// context surface — deliberately NOT realized here (out of this WP's frozen scope).
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` + module `contracts/` + `src/shared/*`
// only — never a module internal. The body carries ONLY the declared §C5 fields (Doc-4A §9.7
// prohibited inputs — actor/org/attribution/lifecycle-state — are never mapped; unknown keys are
// dropped at this seam so they cannot influence the write).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCreateOrganization } from "@/server/identity";
import type { CreateOrganizationInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C5 — snake_case wire field names). `org_type`,
 *  `address` and `contact_info` are the FAIL-CLOSED deferred fields (no realized organizations
 *  column — the command rejects a supplied value; report-carried). */
interface CreateOrganizationBody {
  name?: unknown;
  org_type?: unknown;
  is_personal_org?: unknown;
  address?: unknown;
  contact_info?: unknown;
}

/** Map the snake_case wire body → the typed command input. Type mismatches pass through for the
 *  command's SYNTAX validation to reject uniformly. */
function toInput(body: CreateOrganizationBody): CreateOrganizationInput {
  const input: CreateOrganizationInput = { name: body.name as string };
  if (body.is_personal_org !== undefined) {
    input.isPersonalOrg = body.is_personal_org as boolean;
  }
  return input;
}

/**
 * `POST /identity/organizations` — create an organization (+ founding Owner membership).
 * Unauthenticated → `401`; created → `201` + `Location`; validation → `400`; duplicate personal
 * org → `409`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: CreateOrganizationBody;
  try {
    body = (await request.json()) as CreateOrganizationBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleCreateOrganization(toInput(body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    // FAIL-CLOSED deferred fields (the §C5 org_type/address/contact_info carry): presence is
    // forwarded so the COMMAND rejects a supplied value — never silently dropped (a dropped VO
    // would fabricate success), never persisted (no frozen column exists — report-carried).
    deferredFields: {
      orgTypeSupplied: body.org_type !== undefined,
      addressSupplied: body.address !== undefined,
      contactInfoSupplied: body.contact_info !== undefined,
    },
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers = {
    ...(wireHeaders ?? {}),
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}
