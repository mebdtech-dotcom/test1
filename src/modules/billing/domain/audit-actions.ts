// M7 domain — canonical audit-action constants for the BC-BILL-1 plan-catalog write commands (the
// realized serialization tokens). Imported as NAMED CONSTANTS — never hardcoded string literals (Board
// ruling 2026-06-30; the M1 `RoleAuditAction` / M0 `OutboxAuditAction` precedent).
//
// [ESC-BILL-AUDIT] — plan create/activate/update/retire are NOT separately enumerated in Doc-2 §9 (the
// Financial family is "invoice/payment/refund/subscription…"; the Organization family is "subscription
// change"). Per Doc-4I §H.6 / §HB-1.1 §9, the audit binds to the NEAREST enumerated §9 action BY POINTER
// — no action invented, no Doc-2 §9 patch: the Doc-2 §9 **Platform** family "service-role sensitive
// operations" (line 695) — platform-staff mutating platform-owned catalog config. This is the SAME
// enumerated family + bind-by-pointer discipline the M0 outbox workers use (`core/domain/audit-actions.ts`
// — "the family is already enumerated, so these tokens bind BY POINTER to it"). The BUSINESS meaning is
// owned by rank-0 Doc-2 §9; the SERIALIZATION (these tokens + `entity_type`) is a realization detail — a
// future token rename never reopens Doc-2. Attribution is **Admin** (`actor_type: "admin"` — platform
// governance, §5.6), NEVER System (caller-driven catalog write); `organization_id` is null (platform scope).

/** The audit `entity_type` for a `billing.plans` catalog mutation (Doc-4I §HB-1.1 §9 `entity_type=plans`). */
export const PLAN_ENTITY_TYPE = "plans" as const;

/**
 * Canonical plan-catalog audit actions — each bound BY POINTER to the ENUMERATED Doc-2 §9 Platform family
 * "service-role sensitive operations" ([ESC-BILL-AUDIT] — nearest by pointer; no action invented). Distinct
 * tokens per lifecycle transition so the immutable ledger distinguishes create/activate/update/retire.
 */
export const PlanCatalogAuditAction = {
  /** §9 Platform "service-role sensitive operations" — a plan created at `draft` (§HB-1.1). */
  CREATED: "plan_created",
  /** §9 Platform "service-role sensitive operations" — a plan published `draft → active` (§HB-1.1a). */
  ACTIVATED: "plan_activated",
  /** §9 Platform "service-role sensitive operations" — a plan's marketing config updated (§HB-1.1). */
  UPDATED: "plan_updated",
  /** §9 Platform "service-role sensitive operations" — a plan retired `active|draft → retired` (§HB-1.1). */
  RETIRED: "plan_retired",
} as const;

export type PlanCatalogAuditActionToken =
  (typeof PlanCatalogAuditAction)[keyof typeof PlanCatalogAuditAction];

// ── W3-BILL-3 — entitlement-catalog + plan→entitlement-bundle audit (same [ESC-BILL-AUDIT] bind-by-pointer
//    to Doc-2 §9 Platform "service-role sensitive operations"; Admin-attributed; no action invented). ──

/** The audit `entity_type` for a `billing.entitlements` catalog mutation (Doc-4I §HB-1.3 §9). */
export const ENTITLEMENT_ENTITY_TYPE = "entitlements" as const;
/** The audit `entity_type` for a `billing.plan_entitlements` bundle mutation (Doc-4I §HB-1.2 §9). */
export const PLAN_ENTITLEMENT_ENTITY_TYPE = "plan_entitlements" as const;

/** Entitlement-catalog audit actions (§9 Platform "service-role sensitive operations" by pointer). */
export const EntitlementCatalogAuditAction = {
  /** An entitlement defined (§HB-1.3 create). */
  CREATED: "entitlement_created",
  /** An entitlement's `type`/`default_value` updated (§HB-1.3 update). */
  UPDATED: "entitlement_updated",
} as const;

/** Plan→entitlement bundle audit actions (§9 Platform "service-role sensitive operations" by pointer). */
export const PlanEntitlementAuditAction = {
  /** A plan↔entitlement bundle upserted (§HB-1.2). */
  BUNDLED: "plan_entitlement_bundled",
} as const;

// ── W3-BILL-4 — BC-BILL-2 subscription audit (Doc-4I §HB-2.1 §9). UNLIKE the catalog writes, subscription
//    purchase IS ENUMERATED in Doc-2 §9 Financial ("subscription purchase/renewal/cancel") — so these
//    bind BY POINTER to that enumerated family, NO [ESC-BILL-AUDIT]. Attribution is USER (caller-driven,
//    §HB-2.1) — org-scoped, `organization_id` = the Controlling Org (not null, unlike the catalog writes). ──

/** The audit `entity_type` for a `billing.subscriptions` mutation (Doc-4I §HB-2.1 §9 `entity_type=subscriptions`). */
export const SUBSCRIPTION_ENTITY_TYPE = "subscriptions" as const;

/** Subscription audit actions — bound BY POINTER to the ENUMERATED Doc-2 §9 Financial "subscription
 *  purchase/renewal/cancel" (line 687). Purchase + cancel are BOTH enumerated → NO [ESC-BILL-AUDIT]
 *  (unlike the catalog writes). User-attributed, org-scoped. */
export const SubscriptionAuditAction = {
  /** §9 Financial "subscription purchase" — a subscription created at `pending_payment` (§HB-2.1). */
  PURCHASED: "subscription_purchased",
  /** §9 Financial "subscription cancel" — an active subscription's `auto_renew` set to false (§HB-2.2). */
  CANCELLED: "subscription_cancelled",
} as const;

// ── W3-BILL-9 — BC-BILL-5 platform-invoice writes (Doc-4I §HB-5.1/§HB-5.2 §9). Mixed enumeration:
//    "platform invoice created" IS enumerated in Doc-2 §9 Financial (line 687) → CREATED binds by pointer,
//    NO ESC. An invoice STATUS transition (issued→paid|overdue|void) is NOT separately enumerated →
//    [ESC-BILL-AUDIT] (nearest §9 Financial by pointer; no action invented — §HB-5.2 §9). Attribution is
//    User (org self-serve / void) OR System (subscription/ad-driven / paid/overdue); org-scoped. ──

/** The audit `entity_type` for a `billing.platform_invoices` mutation (Doc-4I §HB-5.1/2 §9). */
export const PLATFORM_INVOICE_ENTITY_TYPE = "platform_invoices" as const;

export const PlatformInvoiceAuditAction = {
  /** §9 Financial "platform invoice created" (ENUMERATED — no [ESC-BILL-AUDIT]) — an invoice issued (§HB-5.1). */
  CREATED: "platform_invoice_created",
  /** [ESC-BILL-AUDIT] — an invoice status transition issued→paid|overdue|void (§HB-5.2; nearest §9 by pointer). */
  STATUS_CHANGED: "platform_invoice_status_changed",
} as const;

// ── W3-BILL-10 — BC-BILL-5 `record_payment` (§HB-5.3 §9). Doc-2 §9 Financial enumerates BOTH "payment
//    status change" AND "refund" (line 687) → these bind by pointer, NO [ESC-BILL-AUDIT]. System-attributed
//    (gateway callback; actorId null); org-scoped to the invoice's debtor org. ──

/** The audit `entity_type` for a `billing.platform_payments` mutation (Doc-4I §HB-5.3 §9). */
export const PLATFORM_PAYMENT_ENTITY_TYPE = "platform_payments" as const;

export const PlatformPaymentAuditAction = {
  /** §9 Financial "payment status change" — a payment reached succeeded/failed (§HB-5.3). */
  STATUS_CHANGED: "payment_status_changed",
  /** §9 Financial "refund" — a payment was refunded (§HB-5.3). */
  REFUNDED: "payment_refunded",
} as const;

// ── W3-BILL-12 — BC-BILL-6 reward/referral writes (Doc-4I §HB-6.1/§HB-6.2 §9). Reward/referral movements are
//    NOT separately enumerated in Doc-2 §9 → `[ESC-BILL-AUDIT]` (nearest §9 by pointer; no action invented).
//    Attribution User (org redemption / referral self-serve) OR System (milestone); org-scoped. ──

/** The audit `entity_type` for a `billing.reward_transactions` mutation (Doc-4I §HB-6.1 §9). */
export const REWARD_TRANSACTION_ENTITY_TYPE = "reward_transactions" as const;
/** The audit `entity_type` for a `billing.referrals` mutation (Doc-4I §HB-6.2 §9). */
export const REFERRAL_ENTITY_TYPE = "referrals" as const;

/** Reward-movement audit action ([ESC-BILL-AUDIT] — nearest §9 by pointer). */
export const RewardAuditAction = {
  /** A reward-point movement (credit or redeem) — §HB-6.1. */
  MOVED: "reward_movement",
} as const;

/** Referral audit actions ([ESC-BILL-AUDIT] — nearest §9 by pointer). */
export const ReferralAuditAction = {
  /** A referral created at `pending` — §HB-6.2 track. */
  TRACKED: "referral_tracked",
  /** A referral advanced (pending→qualified→rewarded) — §HB-6.2 advance. */
  ADVANCED: "referral_advanced",
} as const;

// ── W3-BILL-13 — BC-BILL-4 lead-credit writes (Doc-4I §HB-4.1 §9). Lead-credit movement is NOT separately
//    enumerated in Doc-2 §9 → `[ESC-BILL-AUDIT]` (nearest §9 by pointer; no action invented). Attribution
//    User (org purchase/debit) OR System (shortfall/consumption); org-scoped. ──

/** The audit `entity_type` for a `billing.lead_credit_transactions` mutation (Doc-4I §HB-4.1 §9). */
export const LEAD_CREDIT_TRANSACTION_ENTITY_TYPE = "lead_credit_transactions" as const;

/** Lead-credit-movement audit action ([ESC-BILL-AUDIT] — nearest §9 by pointer). */
export const LeadCreditAuditAction = {
  /** A lead-credit movement (credit or debit) — §HB-4.1. */
  MOVED: "lead_credit_movement",
} as const;

// ── W3-BILL-14 — BC-BILL-3 `record_usage` (Doc-4I §HB-3.1 §9). Usage recording is NOT separately enumerated
//    in Doc-2 §9 → `[ESC-BILL-AUDIT]` (nearest §9 by pointer; no action invented). Attribution System
//    (metering); org-scoped to the Controlling Org. ──

/** The audit `entity_type` for a `billing.usage_ledger` mutation (Doc-4I §HB-3.1 §9). */
export const USAGE_LEDGER_ENTITY_TYPE = "usage_ledger" as const;

/** Usage-recording audit action ([ESC-BILL-AUDIT] — nearest §9 by pointer). */
export const UsageAuditAction = {
  /** A metered usage row appended — §HB-3.1. */
  RECORDED: "usage_recorded",
} as const;
