// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for BC-BILL-2 `purchase_subscription` /
// `get_subscription` (Doc-4I §HB-2.1/§HB-2.5 / Doc-5I §5). Reuses `mapWriteError` (shared) for the
// purchase failure legs. Pure (no I/O). BOUNDARY: `@/shared/http` + the M7 contract TYPES only.
//
//   - purchase → `201` + `Location: /billing/subscriptions/{id}` + §5.6 envelope (status `pending_payment`).
//   - get      → `200` (§5.6) or `404` (org has no subscription).
//   - errors   → §6.2 status by class (VALIDATION 400 · AUTHORIZATION 403 · STATE 409 · REFERENCE 422).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  GetSubscriptionResult,
  PurchaseSubscriptionOutcome,
  PurchaseSubscriptionResult,
  SubscriptionView,
} from "@/modules/billing/contracts";
import { mapWriteError } from "./plan-catalog-write.handler";

// Composition-edge codes (Doc-4A §H.4 form) — SYNTAX-before-context (400) + no-active-org (403).
export const SUBSCRIPTION_INVALID_INPUT = "billing_subscription_invalid_input";
export const SUBSCRIPTION_FORBIDDEN = "billing_subscription_forbidden";
const SUBSCRIPTION_NOT_FOUND = "billing_subscription_not_found";

/** `billing.purchase_subscription.v1` outcome → `201` + `Location` or the §6.1 error. */
export function mapPurchaseSubscription(
  outcome: PurchaseSubscriptionOutcome,
): WireResponse<PurchaseSubscriptionResult> {
  if (outcome.ok) {
    const res = successResponse(outcome.result, 201);
    return {
      ...res,
      headers: { Location: `/billing/subscriptions/${outcome.result.subscriptionId}` },
    };
  }
  return mapWriteError(outcome.error);
}

/** `billing.get_subscription.v1` result → `200` (§5.6) or `404` (no subscription for the org). */
export function mapGetSubscription(result: GetSubscriptionResult): WireResponse<SubscriptionView> {
  if (result.found) return successResponse(result.subscription, 200);
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: SUBSCRIPTION_NOT_FOUND,
    message: "No subscription found for this organization.",
    retryable: false,
  });
}
