// Thin Next.js App Router entry for `POST /marketplace/vendor_profiles` —
// `marketplace.create_vendor_profile.v1` (Doc-5D_Content_v1.0_Pass1.md row 1 → `201` + `Location`).
// REPOSITORY_STRUCTURE §8: `app/` does ROUTING + COMPOSITION ONLY — no business logic. Binds the
// LIVE defaults (cookie-bound Supabase session resolver + the concrete provisioning hook) and
// delegates to the app-layer handler core in `src/server/marketplace`, then serializes the
// transport-agnostic `WireResponse` to a `NextResponse`.
//
// Wire casing (Doc-5A v1.0.1): the REQUEST body is snake_case (mapped here to the typed camelCase
// command input); the `result` payload is camelCase; enums/envelope stay snake_case.
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` + module `contracts/` types + shared only.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCreateVendorProfile } from "@/server/marketplace";
import type { CreateVendorProfileInput } from "@/modules/marketplace/contracts";

/** Shape of the JSON request body (Doc-4D §D4 request contract — snake_case wire field names). */
interface CreateVendorProfileBody {
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
}

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

/** Map the snake_case wire body → the typed (camelCase) command input. Malformed values pass through
 *  loosely typed; the command's SYNTAX validation is the authoritative gate (Doc-4D §B.4). */
function toCreateInput(body: CreateVendorProfileBody): CreateVendorProfileInput {
  return {
    name: body.name as string,
    capabilityFlags: {
      canSupply: body.capability_flags?.can_supply as boolean,
      canService: body.capability_flags?.can_service as boolean,
      canFabricate: body.capability_flags?.can_fabricate as boolean,
      canConsult: body.capability_flags?.can_consult as boolean,
    },
    geography: {
      country: str(body.geography?.country),
      division: str(body.geography?.division),
      district: str(body.geography?.district),
      industrialZone: str(body.geography?.industrial_zone),
    },
    ...(body.vendor_type_preset !== undefined
      ? { vendorTypePreset: body.vendor_type_preset as string | null }
      : {}),
  };
}

/**
 * `POST /marketplace/vendor_profiles` — create the active org's vendor profile (audited; emits
 * `VendorClaimed` via the M0 outbox). Unauthenticated → `401`; created → `201` + `Location`;
 * validation/forbidden/conflict → `400`/`403`/`409`; no active-org context → `404`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: CreateVendorProfileBody;
  try {
    body = (await request.json()) as CreateVendorProfileBody;
  } catch {
    body = {};
  }

  const { status, body: responseBody } = await handleCreateVendorProfile(toCreateInput(body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  // `201` carries the created resource's canonical location (Doc-5A §5.5 — a STANDARD HTTP
  // infrastructure header, §4.0 class).
  const headers: Record<string, string> = {};
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  if (status === 201 && "result" in responseBody) {
    headers["Location"] = `/api/marketplace/vendor_profiles/${responseBody.result.vendorProfileId}`;
  }
  return NextResponse.json(responseBody, { status, headers });
}
