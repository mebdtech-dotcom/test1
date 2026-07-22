// Thin Next.js App Router entry for `GET /billing/plans` — `billing.list_plans.v1` (Doc-5I §4 → `200`).
// REPOSITORY_STRUCTURE §8: `app/` does ROUTING + COMPOSITION ONLY. Authenticated Platform-Public read
// (Doc-5I §3.6): the composition core (`src/server/billing`) owns the session→401 gate + ALL SYNTAX
// validation (filter allowlist, cursor, page_size); this route only extracts the wire grammar.
//
// Wire grammar (Doc-5A §8): `filter[<field>]=<value>` (§8.3), `cursor` (§8.2), `page_size` (§8.5).
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` only.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCreatePlan, handleListPlans } from "@/server/billing";
import type { CreatePlanInput } from "@/modules/billing/contracts";

const FILTER_PARAM = /^filter\[(.+)\]$/;

/**
 * `GET /billing/plans` — the authenticated paginated plan-catalog read.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const filters: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    const match = FILTER_PARAM.exec(key);
    if (match) {
      filters[match[1]] = value;
    }
  }

  const cursor = url.searchParams.get("cursor");
  const pageSize = url.searchParams.get("page_size");

  const { status, body } = await handleListPlans(
    {
      filters,
      ...(cursor !== null ? { cursor } : {}),
      ...(pageSize !== null ? { pageSize } : {}),
    },
    { resolveSession: resolveSupabaseSession },
  );

  // `no-store` (non-retired visibility scope must not be served stale) + the `401` auth challenge.
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}

/** Snake_case wire body for `create_plan` (Doc-4I §HB-1.1 / Doc-5I §4). */
interface CreatePlanBody {
  name?: unknown;
  billing_cycle?: unknown;
  price?: unknown;
  currency?: unknown;
}

/** Map the wire body → the typed input. `price` is accepted as a string OR number (coerced to a decimal
 *  string); all field-level SYNTAX is (re-)validated in the composition/command (single source). */
function toCreatePlanInput(body: CreatePlanBody): CreatePlanInput {
  return {
    name: typeof body.name === "string" ? body.name : (body.name as string),
    billingCycle: body.billing_cycle as CreatePlanInput["billingCycle"],
    price: typeof body.price === "number" ? String(body.price) : (body.price as string),
    currency: body.currency as string,
  };
}

/**
 * `POST /billing/plans` — `billing.create_plan.v1` (Doc-5I §4 → `201` + `Location`). Admin (platform-staff)
 * audited write; the composition core owns the session→401 gate, SYNTAX, the staff gate, and the audit.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: CreatePlanBody;
  try {
    body = (await request.json()) as CreatePlanBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleCreatePlan(toCreatePlanInput(body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store", ...(wireHeaders ?? {}) };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
