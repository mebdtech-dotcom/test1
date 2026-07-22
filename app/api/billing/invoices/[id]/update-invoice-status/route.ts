// Thin Next.js App Router entry for `POST /billing/invoices/{invoice_id}/update-invoice-status` —
// `billing.update_invoice_status.v1` (Doc-5I §8 → `200`; the WIRED User `void` leg). REPOSITORY_STRUCTURE
// §8: ROUTING + COMPOSITION ONLY. Org-self (debtor) write; the composition core owns session→401, the
// active-org + `can_manage_billing` gate, SYNTAX, and the audit. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleUpdateInvoiceStatus } from "@/server/billing";
import type { UpdateInvoiceStatusInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `update_invoice_status` (Doc-4I §HB-5.2). */
interface UpdateInvoiceStatusBody {
  target_status?: unknown;
  expected_status?: unknown;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: UpdateInvoiceStatusBody;
  try {
    body = (await request.json()) as UpdateInvoiceStatusBody;
  } catch {
    body = {};
  }

  const input: UpdateInvoiceStatusInput = {
    invoiceId: id,
    targetStatus: body.target_status as UpdateInvoiceStatusInput["targetStatus"],
    expectedStatus: body.expected_status as UpdateInvoiceStatusInput["expectedStatus"],
  };

  const { status, body: responseBody } = await handleUpdateInvoiceStatus(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
