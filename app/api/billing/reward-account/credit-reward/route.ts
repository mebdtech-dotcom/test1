// Thin Next.js App Router entry for `POST /billing/reward-account/credit-reward` — `billing.credit_reward.v1`
// (Doc-5I §9 → `200`; the WIRED User REDEMPTION leg). REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION ONLY.
// The wire body is `{ points }`; `direction=redeem` / `reason=redemption` are server-set by the composition.
// BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCreditReward } from "@/server/billing";

/** Snake_case wire body for `credit_reward` (User redemption leg — Doc-4I §HB-6.1 / Doc-5I §9.2). */
interface CreditRewardBody {
  points?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: CreditRewardBody;
  try {
    body = (await request.json()) as CreditRewardBody;
  } catch {
    body = {};
  }

  // `points` accepted as a number (NaN when absent/non-numeric → the composition rejects it as SYNTAX 400).
  const points = typeof body.points === "number" ? body.points : Number(body.points);

  const { status, body: responseBody } = await handleCreditReward(points, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
