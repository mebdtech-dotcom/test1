// Thin Next.js App Router entries for `/marketplace/vendor_profiles/{id}` (Doc-5D rows 3 and 6):
//   GET   — `marketplace.get_vendor_profile.v1` (CONTROLLING-ORG leg → `200`; collapse → `404`)
//   PATCH — `marketplace.update_vendor_profile.v1` (partial attribute edit → `200`)
// REPOSITORY_STRUCTURE §8: `app/` does ROUTING + COMPOSITION ONLY. The PUBLIC projection lives at
// the separate row-64 route (`public_vendor_profiles/[id]`) — the two are never merged (R5).
//
// Wire casing (Doc-5A v1.0.1): requests snake_case; `result` camelCase. The optimistic-concurrency
// token rides the REQUEST BODY `updated_at` (the Doc-4D §D4 request-contract field); `If-Match`
// carriage is honored when supplied (Doc-5A §9.5 — either source resolves to the same token).
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` + module contracts types + shared only.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetOwnVendorProfile, handleUpdateVendorProfile } from "@/server/marketplace";
import type { UpdateVendorProfileInput } from "@/modules/marketplace/contracts";
import { UUID_PATTERN } from "@/shared/ids";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  // UUID-vs-human_ref disambiguation by FORMAT on the single `{id}` segment — the row-64 route's
  // established [§2.5]-style path realization (the query re-validates the chosen leg's SYNTAX).
  const key = UUID_PATTERN.test(id) ? { vendorProfileId: id } : { humanRef: id };

  const { status, body } = await handleGetOwnVendorProfile(key, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}

/** Shape of the JSON PATCH body (Doc-4D §D4 — snake_case wire field names; all optional but the token). */
interface UpdateVendorProfileBody {
  name?: unknown;
  capability_flags?: {
    can_supply?: unknown;
    can_service?: unknown;
    can_fabricate?: unknown;
    can_consult?: unknown;
  };
  geography?: {
    country?: unknown;
    division?: unknown;
    district?: unknown;
    industrial_zone?: unknown;
  };
  vendor_type_preset?: unknown;
  /** Optimistic-concurrency token (ISO-8601 `updated_at`). */
  updated_at?: unknown;
}

function toUpdateInput(id: string, body: UpdateVendorProfileBody): UpdateVendorProfileInput {
  const flags = body.capability_flags;
  const geo = body.geography;
  return {
    vendorProfileId: id,
    ...(body.name !== undefined ? { name: body.name as string } : {}),
    ...(flags !== undefined
      ? {
          capabilityFlags: {
            ...(flags.can_supply !== undefined ? { canSupply: flags.can_supply as boolean } : {}),
            ...(flags.can_service !== undefined
              ? { canService: flags.can_service as boolean }
              : {}),
            ...(flags.can_fabricate !== undefined
              ? { canFabricate: flags.can_fabricate as boolean }
              : {}),
            ...(flags.can_consult !== undefined
              ? { canConsult: flags.can_consult as boolean }
              : {}),
          },
        }
      : {}),
    ...(geo !== undefined
      ? {
          geography: {
            ...(geo.country !== undefined ? { country: geo.country as string | null } : {}),
            ...(geo.division !== undefined ? { division: geo.division as string | null } : {}),
            ...(geo.district !== undefined ? { district: geo.district as string | null } : {}),
            ...(geo.industrial_zone !== undefined
              ? { industrialZone: geo.industrial_zone as string | null }
              : {}),
          },
        }
      : {}),
    ...(body.vendor_type_preset !== undefined
      ? { vendorTypePreset: body.vendor_type_preset as string | null }
      : {}),
    expectedUpdatedAt:
      typeof body.updated_at === "string"
        ? new Date(body.updated_at)
        : (undefined as unknown as Date),
  };
}

/**
 * `PATCH /marketplace/vendor_profiles/{id}` — partial update (audited, optimistic concurrency).
 * Unauthenticated → `401`; updated → `200`; `400`/`403`/`404`/`409` per §6.2.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: UpdateVendorProfileBody;
  try {
    body = (await request.json()) as UpdateVendorProfileBody;
  } catch {
    body = {};
  }

  const { status, body: responseBody } = await handleUpdateVendorProfile(toUpdateInput(id, body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = {};
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
