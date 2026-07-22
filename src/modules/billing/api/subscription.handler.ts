// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for BC-BILL-2 `purchase_subscription` /
// `get_subscription` (Doc-4I §HB-2.1/§HB-2.5 / Doc-5I §5). Reuses `mapWriteError` (shared) for the
// purchase failure legs. Pure (no I/O). BOUNDARY: `@/shared/http` + the M7 contract TYPES only.
//
//   - purchase → `201` + `Location: /billing/subscriptions/{id}` + §5.6 envelope (status `pending_payment`).
//   - get      → `200` (§5.6) or `404` (org has no subscription).
//   - errors   → §6.2 status by class (VALIDATION 400 · AUTHORIZATION 403 · STATE 409 · REFERENCE 422).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  CancelSubscriptionOutcome,
  CancelSubscriptionResult,
  GetSubscriptionResult,
  ListSubscriptionEventsOutcome,
  ListSubscriptionEventsResult,
  PurchaseSubscriptionOutcome,
  PurchaseSubscriptionResult,
  SubscriptionView,
} from "@/modules/billing/contracts";
import { mapWriteError } from "./plan-catalog-write.handler";

// Composition-edge codes (Doc-4A §H.4 form) — SYNTAX-before-context (400) + no-active-org (403).
export const SUBSCRIPTION_INVALID_INPUT = "billing_subscription_invalid_input";
export const SUBSCRIPTION_FORBIDDEN = "billing_subscription_forbidden";
export const SUBSCRIPTION_VIEW_FORBIDDEN = "billing_subscription_view_forbidden";
const SUBSCRIPTION_NOT_FOUND = "billing_subscription_not_found";
const SUBSCRIPTION_EVENTS_INVALID_INPUT = "billing_subscription_events_invalid_input";

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

/** `billing.cancel_subscription.v1` outcome → `200` (§5.6, status stays `active`) or the §6.2 error
 *  (AUTHORIZATION 403 · NOT_FOUND 404 · STATE 409 · CONFLICT 409 · VALIDATION 400). */
export function mapCancelSubscription(
  outcome: CancelSubscriptionOutcome,
): WireResponse<CancelSubscriptionResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return errorResponse({
    error_class: outcome.error.errorClass,
    error_code: outcome.error.errorCode,
    message: outcome.error.message,
    retryable: outcome.error.errorClass === "DEPENDENCY" || outcome.error.errorClass === "SYSTEM",
  });
}

/** Composition-edge `403` for the ORG-SCOPED subscription surfaces — parameterized so the message is
 *  accurate per slug (`can_manage_billing` for the commands, `can_view_billing` for the reads). Unlike the
 *  catalog writes' `catalogWriteForbidden`, this is an org/permission gate, never "platform-staff required". */
export function subscriptionForbidden(errorCode: string, message: string): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: errorCode,
    message,
    retryable: false,
  });
}

/** `billing.list_subscription_events.v1` outcome → `200` (§5.6 list envelope) · `400` VALIDATION ·
 *  `404` NOT_FOUND (absent/cross-org parent subscription). */
export function mapListSubscriptionEvents(
  outcome: ListSubscriptionEventsOutcome,
): WireResponse<ListSubscriptionEventsResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  if (outcome.errorClass === "VALIDATION") {
    return errorResponse({
      error_class: "VALIDATION",
      error_code: SUBSCRIPTION_EVENTS_INVALID_INPUT,
      message: "Invalid subscription_id, cursor, or page_size.",
      retryable: false,
    });
  }
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: SUBSCRIPTION_NOT_FOUND,
    message: "No such subscription for this organization.",
    retryable: false,
  });
}
