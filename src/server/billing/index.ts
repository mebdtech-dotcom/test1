// App-layer composition for M7 caller-facing HTTP surfaces (REPOSITORY_STRUCTURE §5/§8). The thin
// Next.js route entries (`app/api/billing/**`) delegate here. Both reads are AUTHENTICATED
// Platform-Public catalog reads (Doc-5I §3.6) — session→401 gate, no org/tenant context.

export { handleGetPlan, type GetPlanHandlerDeps } from "./get-plan.route-handler";
export {
  handleListPlans,
  type ListPlansWireInput,
  type ListPlansHandlerDeps,
} from "./list-plans.route-handler";

// BC-BILL-1 Admin plan-catalog writes (W3-BILL-2) — staff-gated audited POST compositions.
export {
  handleCreatePlan,
  handleActivatePlan,
  handleUpdatePlan,
  handleRetirePlan,
  type CatalogWriteHandlerDeps,
} from "./plan-catalog-write.route-handler";

// BC-BILL-1 Admin entitlement-catalog + bundle writes (W3-BILL-3).
export {
  handleCreateEntitlement,
  handleUpdateEntitlement,
  handleBundlePlanEntitlement,
} from "./entitlement-catalog-write.route-handler";

// BC-BILL-2 subscriptions (W3-BILL-4 purchase/get + W3-BILL-5 cancel/list_events) — org-scoped.
export {
  handlePurchaseSubscription,
  handleCancelSubscription,
  handleGetSubscription,
  handleListSubscriptionEvents,
  type SubscriptionHandlerDeps,
} from "./subscription.route-handler";

// BC-BILL-3 usage & quota (W3-BILL-6) — org-self usage read (enforce_quota/record_usage are out-of-wire).
export { handleGetUsage, type UsageHandlerDeps } from "./usage.route-handler";

// BC-BILL-4 lead credits (W3-BILL-7 reads + W3-BILL-13 credit/debit writes) — org-self.
export {
  handleGetLeadBalance,
  handleListLeadTransactions,
  handleCreditLeadAccount,
  handleDebitLeadAccount,
  type LeadCreditHandlerDeps,
} from "./lead-credit.route-handler";

// BC-BILL-5 platform invoicing (W3-BILL-8 reads + W3-BILL-9 issue/update writes) — org-self debtor.
export {
  handleGetPlatformInvoice,
  handleListPlatformInvoices,
  handleIssuePlatformInvoice,
  handleUpdateInvoiceStatus,
  type PlatformInvoiceHandlerDeps,
} from "./platform-invoice.route-handler";

// BC-BILL-6 rewards & referrals (W3-BILL-11 reads + W3-BILL-12 credit/track/advance writes) — org-self.
export {
  handleGetRewardBalance,
  handleListReferrals,
  handleCreditReward,
  handleTrackReferral,
  handleAdvanceReferral,
  type RewardHandlerDeps,
} from "./reward.route-handler";
