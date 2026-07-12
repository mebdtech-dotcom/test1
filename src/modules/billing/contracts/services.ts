// Public service interfaces + callables for module "billing" — the ONLY cross-module call surface
// (REPOSITORY_STRUCTURE §3). Cross-module consumers (e.g. `src/server`) import from here, never the
// private application/domain/infrastructure layers (the boundary linter enforces this).
//
// W3-BILL-1 pilot slice: the two authenticated Platform-Public catalog reads `billing.get_plan.v1`
// (Doc-4I §HB-1.4 / Doc-5I §4) and `billing.list_plans.v1`. Both are AUTHENTICATED reads (Doc-5I §3.6 —
// authentication only, no billing slug, no org/tenant scope); the `db` executor is optional (default =
// the shared Prisma client) purely for test injection. The authentication gate lives in the app-layer
// composition (`src/server/billing`), not here — the module read itself is auth-agnostic (it reads the
// platform-owned catalog; RLS `plans_public_read` needs no GUC).

import type { DbExecutor } from "@/shared/db";
import { getPlan as getPlanQuery } from "../application/queries/get-plan.query";
import { listPlans as listPlansQuery } from "../application/queries/list-plans.query";
import type { GetPlanKey, GetPlanOutcome, ListPlansOutcome, ListPlansRequest } from "./types";

/**
 * `billing.get_plan.v1` (Doc-4I §HB-1.4 / Doc-5I §4) — the contracts-only face over the private M7
 * plan read. Reads ONE non-retired plan (+ bundled entitlements) by id.
 */
export type GetPlan = (key: GetPlanKey, db?: DbExecutor) => Promise<GetPlanOutcome>;

/** Concrete `billing.get_plan.v1` facade (M7 contracts → M7 application query). */
export const getPlan: GetPlan = (key, db) => getPlanQuery(key, db);

/**
 * `billing.list_plans.v1` (Doc-4I §HB-1.4 / Doc-5I §4) — the contracts-only face over the private M7
 * paginated catalog read (`name` asc / `plan_id` tiebreak; cursor + page_size).
 */
export type ListPlans = (request: ListPlansRequest, db?: DbExecutor) => Promise<ListPlansOutcome>;

/** Concrete `billing.list_plans.v1` facade (M7 contracts → M7 application query). */
export const listPlans: ListPlans = (request, db) => listPlansQuery(request, db);

// The M7 WIRE FACES for both reads (outcome → Doc-5A envelope + §6.2 status) — the One-Owner placement
// (M7 owns how its reads become HTTP); the app-layer composition edge (`src/server/billing`) consumes
// them via `@/modules/billing/contracts` (contracts-only).
export { mapGetPlan } from "../api/get-plan.handler";
export { mapListPlans } from "../api/list-plans.handler";

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-1 Admin PLAN-CATALOG WRITES (W3-BILL-2) — the command facades + SYNTAX validators + wire faces.
// Admin (platform-staff) audited writes; the `src/server/billing` composition supplies the server-resolved
// `AdminCatalogContext` (from `resolveStaffContext`) + the M0 `appendAuditRecord` dep, and runs SYNTAX
// (the exported validators) BEFORE the staff gate (Doc-4A §11.2 fixed order). Cross-module consumers reach
// these ONLY through `@/modules/billing/contracts`.
// ─────────────────────────────────────────────────────────────────────────────

export {
  createPlanCommand as createPlan,
  validateCreatePlanInput,
} from "../application/commands/create-plan.command";
export {
  activatePlanCommand as activatePlan,
  validateActivatePlanInput,
} from "../application/commands/activate-plan.command";
export {
  updatePlanCommand as updatePlan,
  validateUpdatePlanInput,
} from "../application/commands/update-plan.command";
export {
  retirePlanCommand as retirePlan,
  validateRetirePlanInput,
} from "../application/commands/retire-plan.command";

export type { AdminCatalogContext, AdminCatalogDeps } from "../application/commands/_catalog-write";

export {
  mapCreatePlan,
  mapActivatePlan,
  mapUpdatePlan,
  mapRetirePlan,
  planWriteInvalidInput,
  planWriteForbidden,
} from "../api/plan-catalog-write.handler";

// ── BC-BILL-1 ENTITLEMENT-CATALOG + BUNDLE WRITES (W3-BILL-3) — command facades + validators + wire faces. ──

export {
  createEntitlementCommand as createEntitlement,
  validateCreateEntitlementInput,
} from "../application/commands/create-entitlement.command";
export {
  updateEntitlementCommand as updateEntitlement,
  validateUpdateEntitlementInput,
} from "../application/commands/update-entitlement.command";
export {
  bundlePlanEntitlementCommand as bundlePlanEntitlement,
  validateBundlePlanEntitlementInput,
} from "../application/commands/bundle-plan-entitlement.command";

export {
  mapCreateEntitlement,
  mapUpdateEntitlement,
  mapBundlePlanEntitlement,
  catalogWriteInvalidInput,
  catalogWriteForbidden,
} from "../api/entitlement-catalog-write.handler";

// The wire error codes the composition edge passes to the generic catalog-write builders (§HB-1.2/1.3).
export {
  ENTITLEMENT_WRITE_INVALID_INPUT,
  ENTITLEMENT_WRITE_FORBIDDEN,
  BUNDLE_WRITE_INVALID_INPUT,
  BUNDLE_WRITE_FORBIDDEN,
} from "../application/commands/_catalog-write";

// ── BC-BILL-2 SUBSCRIPTIONS (W3-BILL-4) — purchase (org-scoped write) + get_subscription (org-self read). ──

export {
  purchaseSubscriptionCommand as purchaseSubscription,
  validatePurchaseSubscriptionInput,
} from "../application/commands/purchase-subscription.command";
export type {
  PurchaseSubscriptionContext,
  PurchaseSubscriptionDeps,
} from "../application/commands/purchase-subscription.command";
export { getSubscription } from "../application/queries/get-subscription.query";

// ── BC-BILL-2 COMPLETION (W3-BILL-5) — cancel (org-scoped write) + list_subscription_events (org-self read)
//    + resolve_entitlements. `resolve_entitlements` (`billing.resolve_entitlements.v1`) is a bona-fide
//    contract that is OUT-OF-WIRE (Doc-5I §10/R1 — no HTTP route in `app/api`); it is faced here like every
//    other M7 contract, its IMPLEMENTATION consumed intra-module by BC-BILL-3 quota enforcement (DF: same
//    module). BILLING FIREWALL (Doc-2 §2 M7 / Invariant #6): entitlement truth is for quota/feature gating
//    only — NO other module may consume it to gate trust / eligibility / routing / matching (a review
//    invariant, not a structural one). ──

export {
  cancelSubscriptionCommand as cancelSubscription,
  validateCancelSubscriptionInput,
} from "../application/commands/cancel-subscription.command";
export type {
  CancelSubscriptionContext,
  CancelSubscriptionDeps,
} from "../application/commands/cancel-subscription.command";
export { listSubscriptionEvents } from "../application/queries/list-subscription-events.query";
export { resolveEntitlements } from "../application/queries/resolve-entitlements.query";

export {
  mapPurchaseSubscription,
  mapGetSubscription,
  mapCancelSubscription,
  mapListSubscriptionEvents,
  subscriptionForbidden,
  SUBSCRIPTION_INVALID_INPUT,
  SUBSCRIPTION_FORBIDDEN,
  SUBSCRIPTION_VIEW_FORBIDDEN,
} from "../api/subscription.handler";

// ── BC-BILL-3 USAGE & QUOTA (W3-BILL-6) — `enforce_quota` (out-of-wire authority, consumed cross-module +
//    intra-module) + `get_usage` (wired read). `record_usage` (the writer) is DEFERRED on
//    `[ESC-BILL-USAGE-ENTID]`. `enforce_quota` is a QUOTA gate ONLY — the billing firewall (H.9/R5) bars any
//    consumer from feeding `allowed` into routing/eligibility/trust/matching. ──

export { enforceQuota } from "../application/queries/enforce-quota.query";
export { getUsage } from "../application/queries/get-usage.query";
export { mapGetUsage, usageViewForbidden, USAGE_VIEW_FORBIDDEN } from "../api/usage.handler";

// ── BC-BILL-4 LEAD CREDITS (W3-BILL-7 reads pilot) — get_lead_balance + list_lead_transactions (org-self
//    reads). The credit/debit writes (§HB-4.1) land in the next slice. ──

export { getLeadBalance } from "../application/queries/get-lead-balance.query";
export { listLeadTransactions } from "../application/queries/list-lead-transactions.query";
export {
  mapGetLeadBalance,
  mapListLeadTransactions,
  leadViewForbidden,
  LEAD_VIEW_FORBIDDEN,
} from "../api/lead-credit.handler";

// ── BC-BILL-4 LEAD-CREDIT WRITES (W3-BILL-13) — credit_lead_account / debit_lead_account (actor-branched;
//    the User leg wired, the System leg in-process). One command; the composition fixes `direction`. ──

export {
  leadCreditMovementCommand as leadCreditMovement,
  validateLeadCreditMovementInput,
} from "../application/commands/lead-credit-movement.command";
export type {
  LeadCreditMovementContext,
  LeadCreditMovementDeps,
} from "../application/commands/lead-credit-movement.command";
export {
  mapLeadCreditMovement,
  leadWriteInvalidInput,
  leadWriteForbidden,
  LEAD_WRITE_INVALID_INPUT,
  LEAD_WRITE_FORBIDDEN,
} from "../api/lead-credit.handler";

// ── BC-BILL-5 PLATFORM INVOICING (W3-BILL-8 reads pilot) — get_platform_invoice + list_platform_invoices
//    (org-self debtor reads). The issue/update writes + record_payment land in the next slice. ──

export { getPlatformInvoice } from "../application/queries/get-platform-invoice.query";
export { listPlatformInvoices } from "../application/queries/list-platform-invoices.query";
export {
  mapGetPlatformInvoice,
  mapListPlatformInvoices,
  invoiceViewForbidden,
  INVOICE_VIEW_FORBIDDEN,
} from "../api/platform-invoice.handler";

// ── BC-BILL-5 INVOICE WRITES (W3-BILL-9) — issue_platform_invoice + update_invoice_status (actor-branched;
//    the User leg wired, the System leg in-process). record_payment (gateway callback) lands next slice. ──

export {
  issuePlatformInvoiceCommand as issuePlatformInvoice,
  validateIssuePlatformInvoiceInput,
} from "../application/commands/issue-platform-invoice.command";
export type {
  IssuePlatformInvoiceContext,
  IssuePlatformInvoiceDeps,
} from "../application/commands/issue-platform-invoice.command";
export {
  updateInvoiceStatusCommand as updateInvoiceStatus,
  validateUpdateInvoiceStatusInput,
} from "../application/commands/update-invoice-status.command";
export type {
  UpdateInvoiceStatusContext,
  UpdateInvoiceStatusDeps,
} from "../application/commands/update-invoice-status.command";
export {
  mapIssuePlatformInvoice,
  mapUpdateInvoiceStatus,
  invoiceWriteInvalidInput,
  invoiceWriteForbidden,
  INVOICE_WRITE_INVALID_INPUT,
  INVOICE_WRITE_FORBIDDEN,
} from "../api/platform-invoice.handler";

// record_payment (§HB-5.3) — OUT-OF-WIRE gateway callback (Doc-5I §10/R8): no route/composition; consumed
// in-process by the gateway-callback handler (future infra). Faced here for that consumer + tests.
export {
  recordPaymentCommand as recordPayment,
  validateRecordPaymentInput,
} from "../application/commands/record-payment.command";
export type { RecordPaymentDeps } from "../application/commands/record-payment.command";

// ── BC-BILL-6 REWARDS & REFERRALS (W3-BILL-11 reads pilot) — get_reward_balance + list_referrals (org-self
//    reads). The credit_reward / track_referral / advance_referral writes land in the next slice. ──

export { getRewardBalance } from "../application/queries/get-reward-balance.query";
export { listReferrals } from "../application/queries/list-referrals.query";
export {
  mapGetRewardBalance,
  mapListReferrals,
  rewardViewForbidden,
  REWARD_VIEW_FORBIDDEN,
} from "../api/reward.handler";

// ── BC-BILL-6 WRITES (W3-BILL-12) — credit_reward + track_referral + advance_referral (actor-branched;
//    User leg wired, System leg in-process). ──

export {
  creditRewardCommand as creditReward,
  validateCreditRewardInput,
} from "../application/commands/credit-reward.command";
export type {
  CreditRewardContext,
  CreditRewardDeps,
} from "../application/commands/credit-reward.command";
export {
  trackReferralCommand as trackReferral,
  validateTrackReferralInput,
} from "../application/commands/track-referral.command";
export type {
  TrackReferralContext,
  TrackReferralDeps,
} from "../application/commands/track-referral.command";
export {
  advanceReferralCommand as advanceReferral,
  validateAdvanceReferralInput,
} from "../application/commands/advance-referral.command";
export type {
  AdvanceReferralContext,
  AdvanceReferralDeps,
} from "../application/commands/advance-referral.command";
export {
  mapCreditReward,
  mapTrackReferral,
  mapAdvanceReferral,
  rewardWriteInvalidInput,
  rewardWriteForbidden,
  REWARD_WRITE_INVALID_INPUT,
  REWARD_WRITE_FORBIDDEN,
} from "../api/reward.handler";
