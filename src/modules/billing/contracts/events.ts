// Event names + versioned payloads emitted by module "billing" (Doc-2 §8 / Doc-4J catalog). BC-BILL-2 is
// the single-authorship producer of the three subscription §8 events (Doc-4A §4.4). W3-BILL-4 realizes
// `SubscriptionPurchased` (emitted at pending_payment creation — Doc-5I §5.1 / R9); the renew/expire
// events land with the period-end System jobs. Event names bind BY POINTER to Doc-2 §8 (never coined).

/** The billing §8 event names (Doc-2 §8: `billing.subscriptions` → these three). */
export const BillingEventName = {
  SUBSCRIPTION_PURCHASED: "SubscriptionPurchased",
  SUBSCRIPTION_RENEWED: "SubscriptionRenewed",
  SUBSCRIPTION_EXPIRED: "SubscriptionExpired",
} as const;

export type BillingEventNameToken = (typeof BillingEventName)[keyof typeof BillingEventName];

/** The schema version of the subscription events (Doc-4B §16.4 — ≥ 1; first version). */
export const SUBSCRIPTION_EVENT_VERSION = 1 as const;

/**
 * The thin subscription-event payload (Doc-4B §16.5 — IDs + minimal metadata only; no protected facts,
 * §16.3). snake_case identifiers (integration payload, not an API `result`). Consumed by M6 Communication
 * (DF-BILL-6) for notification fan-out.
 */
export interface SubscriptionEventPayload {
  subscription_id: string;
  organization_id: string;
  plan_id: string;
}
