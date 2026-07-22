// Thin Next.js App Router entry for `GET /billing/invoices/{invoice_id}` —
// `billing.get_platform_invoice.v1` (Doc-5I §8 → `200`). REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION
// ONLY. Org-self (debtor) read; the composition core owns session→401 + the active-org + `can_view_billing`
// gate. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetPlatformInvoice } from "@/server/billing";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const { status, body } = await handleGetPlatformInvoice(id, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
