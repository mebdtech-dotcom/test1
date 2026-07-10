// Thin Next.js App Router entries for the `/identity/organizations/{id}` item (W2-IDN-6.2):
//   `PATCH`  — `identity.update_organization_profile.v1` (Doc-5C §4.1 row 6 → `200`)
//   `DELETE` — `identity.soft_delete_organization.v1`    (Doc-5C §4.1 row 8 → `200`; the ADR-012
//              soft-delete → DELETE-on-item method rule, Doc-5C §4.6(a) — never a hard delete)
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// `updated_at` carriage is PER-CONTRACT (the RV-0153 call-1 discipline — each frozen declaration
// checked, never a blanket): the PATCH is the ONE §C5 contract declaring `Concurrency: optimistic`
// (PassB:262) → the token rides `If-Match` (Doc-5C §4.3); the DELETE carries `updated_at` as the
// frozen REQUIRED request-body field. Bodies carry ONLY declared §C5 fields (Doc-4A §9.7 —
// prohibited inputs never mapped; unknown keys dropped at this seam).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleSoftDeleteOrganization, handleUpdateOrganizationProfile } from "@/server/identity";
import type {
  SoftDeleteOrganizationInput,
  UpdateOrganizationProfileInput,
} from "@/modules/identity/contracts";
import { parseIdempotencyKey, parseIfMatchTimestamp } from "@/shared/http";

/** PATCH body (Doc-4C §C5 — snake_case wire field names). `address`/`contact_info`/
 *  `brand_assets_ref` are the FAIL-CLOSED deferred fields (presence forwarded; command rejects). */
interface UpdateOrganizationProfileBody {
  name?: unknown;
  address?: unknown;
  contact_info?: unknown;
  brand_assets_ref?: unknown;
}

/** DELETE body (Doc-4C §C5). */
interface SoftDeleteOrganizationBody {
  confirmation?: unknown;
  reason?: unknown;
  updated_at?: unknown;
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

/** Parse a REQUIRED §C5 body `updated_at` (ISO-8601 string). Invalid/absent yields an invalid Date
 *  — the command's SYNTAX validation rejects it as the single required-field failure path. */
function parseBodyTimestamp(value: unknown): Date {
  return typeof value === "string" ? new Date(value) : new Date(Number.NaN);
}

/**
 * `PATCH /identity/organizations/{id}` — update the org profile (Owner/Director interim authority).
 * Unauthenticated → `401`; updated → `200`; validation → `400`; forbidden → `403`; foreign/no
 * context → `404` (collapse); stale If-Match → `409` + `ETag`.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const body = await readJson<UpdateOrganizationProfileBody>(request);

  const input: UpdateOrganizationProfileInput = {
    targetOrganizationId: id,
    updatedAt: parseIfMatchTimestamp(request),
  };
  if (body.name !== undefined) input.name = body.name as string;

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleUpdateOrganizationProfile(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    deferredFields: {
      addressSupplied: body.address !== undefined,
      contactInfoSupplied: body.contact_info !== undefined,
      brandAssetsRefSupplied: body.brand_assets_ref !== undefined,
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

/**
 * `DELETE /identity/organizations/{id}` — ADR-012 soft-delete (Owner; in-module cascade only,
 * cross-module legs [DC-1]-blocked). Unauthenticated → `401`; soft-deleted → `200`; validation →
 * `400`; forbidden → `403`; foreign/no context → `404`; illegal edge / stale token → `409`.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const body = await readJson<SoftDeleteOrganizationBody>(request);

  const input: SoftDeleteOrganizationInput = {
    targetOrganizationId: id,
    confirmation: body.confirmation as boolean,
    reason: body.reason as string,
    updatedAt: parseBodyTimestamp(body.updated_at),
  };

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleSoftDeleteOrganization(input, {
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
