// Thin Next.js App Router entry for `POST /billing/lead-account/credit-lead-account` —
// `billing.credit_lead_account.v1` (Doc-5I §7 → `200`; the WIRED User purchase leg). REPOSITORY_STRUCTURE
// §8: ROUTING + COMPOSITION ONLY. `direction=credit` is fixed by the route; the composition owns session→401,
// the active-org + `can_manage_billing` gate, SYNTAX, and the audit. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCreditLeadAccount } from "@/server/billing";
import type { LeadCreditMovementInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `credit_lead_account` (Doc-4I §HB-4.1). Org/direction server-set. */
interface CreditLeadBody {
  amount?: unknown;
  source_invoice_id?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: CreditLeadBody;
  try {
    body = (await request.json()) as CreditLeadBody;
  } catch {
    body = {};
  }

  const input: LeadCreditMovementInput = {
    amount: typeof body.amount === "number" ? body.amount : Number(body.amount),
    ...(body.source_invoice_id !== undefined
      ? { sourceInvoiceId: body.source_invoice_id as string }
      : {}),
  };

  const { status, body: responseBody } = await handleCreditLeadAccount(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
