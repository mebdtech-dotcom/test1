// Thin Next.js App Router entry for `POST /billing/subscriptions/{subscription_id}/cancel-subscription` —
// `billing.cancel_subscription.v1` (Doc-5I §5 → `200`). REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION
// ONLY. Org-scoped audited write; the composition core (`src/server/billing`) owns session→401, SYNTAX,
// the active-org + `can_manage_billing` gate, and the audit. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCancelSubscription } from "@/server/billing";
import type { CancelSubscriptionInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `cancel_subscription` (Doc-4I §HB-2.2 — `expected_status`). */
interface CancelSubscriptionBody {
  expected_status?: unknown;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: CancelSubscriptionBody;
  try {
    body = (await request.json()) as CancelSubscriptionBody;
  } catch {
    body = {};
  }

  const input: CancelSubscriptionInput = {
    subscriptionId: id,
    expectedStatus: body.expected_status as CancelSubscriptionInput["expectedStatus"],
  };

  const { status, body: responseBody } = await handleCancelSubscription(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
