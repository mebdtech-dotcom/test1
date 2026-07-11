// Thin Next.js App Router entry for `POST /billing/subscriptions` — `billing.purchase_subscription.v1`
// (Doc-5I §5 → `201` + `Location`). REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION ONLY. Org-scoped
// audited write; the composition core (`src/server/billing`) owns session→401, SYNTAX, the active-org +
// `can_manage_billing` gate, the audit, and the `SubscriptionPurchased` emission. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handlePurchaseSubscription } from "@/server/billing";
import type { PurchaseSubscriptionInput } from "@/modules/billing/contracts";

/** Snake_case wire body for `purchase_subscription` (Doc-4I §HB-2.1). Org = server-resolved (never a field). */
interface PurchaseSubscriptionBody {
  plan_id?: unknown;
  auto_renew?: unknown;
}

function toPurchaseInput(body: PurchaseSubscriptionBody): PurchaseSubscriptionInput {
  return {
    planId: body.plan_id as string,
    ...(body.auto_renew !== undefined ? { autoRenew: body.auto_renew as boolean } : {}),
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: PurchaseSubscriptionBody;
  try {
    body = (await request.json()) as PurchaseSubscriptionBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handlePurchaseSubscription(toPurchaseInput(body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store", ...(wireHeaders ?? {}) };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}
