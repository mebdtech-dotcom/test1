// M7 domain (PRIVATE) — the `billing.subscriptions` head read model for `get_subscription`/`purchase`
// (Doc-4I §HB-2.5/§HB-2.1 / Doc-6I §3.2). A read projection of the authoritative row — NOT a source of truth.

/** Subscription lifecycle status (Doc-2 §5.7 — the `subscriptions.state` column, stored not derived). */
export type SubscriptionStatus = "pending_payment" | "active" | "expired";

/** One `subscriptions` head row as read for the org-self surface (Doc-4I §HB-2.5 output field set). */
export interface SubscriptionHeadReadModel {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  /** ISO-8601 period bounds (nullable until set). */
  periodStart: Date | null;
  periodEnd: Date | null;
  autoRenew: boolean;
}
