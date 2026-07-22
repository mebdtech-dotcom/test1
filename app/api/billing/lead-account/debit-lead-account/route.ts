// Thin Next.js App Router entry for `POST /billing/lead-account/debit-lead-account` —
// `billing.debit_lead_account.v1` (Doc-5I §7 → `200`; the WIRED User debit leg). REPOSITORY_STRUCTURE §8:
// ROUTING + COMPOSITION ONLY. `direction=debit` is fixed by the route; the composition owns session→401, the
// active-org + `can_manage_billing` gate, SYNTAX, and the audit. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleDebitLeadAccount } from "@/server/billing";
import type { LeadCreditMovementInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `debit_lead_account` (Doc-4I §HB-4.1). Org/direction server-set. */
interface DebitLeadBody {
  amount?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: DebitLeadBody;
  try {
    body = (await request.json()) as DebitLeadBody;
  } catch {
    body = {};
  }

  const input: LeadCreditMovementInput = {
    amount: typeof body.amount === "number" ? body.amount : Number(body.amount),
  };

  const { status, body: responseBody } = await handleDebitLeadAccount(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
