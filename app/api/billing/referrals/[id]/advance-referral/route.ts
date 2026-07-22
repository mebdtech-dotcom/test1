// Thin Next.js App Router entry for `POST /billing/referrals/{referral_id}/advance-referral` —
// `billing.advance_referral.v1` (Doc-5I §9 → `200`; the WIRED User leg). REPOSITORY_STRUCTURE §8: ROUTING +
// COMPOSITION ONLY. Org-scoped write; the composition core owns session→401, the active-org +
// `can_manage_billing` gate, SYNTAX, and the audit. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleAdvanceReferral } from "@/server/billing";
import type { AdvanceReferralInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `advance_referral` (Doc-4I §HB-6.2). */
interface AdvanceReferralBody {
  target_state?: unknown;
  expected_state?: unknown;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: AdvanceReferralBody;
  try {
    body = (await request.json()) as AdvanceReferralBody;
  } catch {
    body = {};
  }

  const input: AdvanceReferralInput = {
    referralId: id,
    targetState: body.target_state as AdvanceReferralInput["targetState"],
    expectedState: body.expected_state as AdvanceReferralInput["expectedState"],
  };

  const { status, body: responseBody } = await handleAdvanceReferral(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
