// Public DTOs / IDs for module "billing" (cross-module surface). DTOs/IDs only — domain value-objects
// stay private. Realized per Doc-4I §HB-1.4 (the two Plan/Entitlement reads) + Doc-5I §4 (wire) +
// Doc-2 §10.8 (column set) + Doc-6I §3.1 (schema) — bound by pointer, never re-authored.
//
// SCOPE (W3-BILL-1, M7 pilot slice): the two authenticated Platform-Public catalog reads
// `billing.get_plan.v1` (`GET /billing/plans/{plan_id}`) and `billing.list_plans.v1`
// (`GET /billing/plans`). Both are authenticated (Doc-5I §3.6 "authentication only" — no billing slug,
// no org/tenant scope) reads of the platform-owned plan catalog. NO audit (reads — Doc-5A §17.1), NO
// events, NO state mutation.
//
// RESULT CASING (Doc-5A v1.0.1 Option B, program-binding): the wire `result` payload property NAMES
// are camelCase (`planId`, `billingCycle`, `pageInfo`, …); the envelope/identifiers/enum-values stay
// as their frozen strings. Same convention the shipped M2 reads use (see
// `src/modules/marketplace/contracts/types.ts`).
//
// RETIRED-PLAN VISIBILITY — `[ESC-BILL-RETIRE-VIS]` RESOLVED (owner ruling 2026-07-11; Doc-5I §4
// corrected to match Doc-6I — `Doc-5I_RetiredVisibility_Patch_v1.0`): retired plans are visible to
// **staff/admin only**; active + draft → authenticated users. These reads return the non-retired
// catalog (`deleted_at IS NULL`, the `plans_public_read` set) to a non-staff caller — retired is hidden
// (a normal user never reads a retired plan). So `status` on this non-staff surface is only ever
// `draft` | `active`. The staff-facing retired-read WIRE path lands with DC-3 staff resolution (carried,
// not a gap — the non-staff security fence is enforced here).

/**
 * Plan lifecycle status (Doc-2 §3.8 `draft → active → retired`). DERIVED, never stored (Doc-2 §10.8:
 * `plans` carries no `status` column) — `retired` ⟺ soft-deleted, `active` ⟺ `is_active`, else `draft`.
 */
export type PlanStatus = "draft" | "active" | "retired";

/** Plan billing cadence (Doc-2 §10.8 `billing_cycle` enum). */
export type BillingCycle = "monthly" | "annual";

/** Entitlement value type (Doc-2 §10.8 `entitlement_type` enum). */
export type EntitlementType = "boolean" | "numeric" | "enum";

/** A bundled entitlement's resolved value (Doc-4I §HB-1.4 `value : boolean | integer | string`). */
export type PlanEntitlementValue = boolean | number | string;

/**
 * One entitlement bundled on a plan (Doc-4I §HB-1.4 `get_plan` output `entitlements[]`). `value` is the
 * per-plan `plan_entitlements.value_jsonb` (BL-CR4 — the gate is the entitlement VALUE, never the plan name).
 */
export interface PlanEntitlementView {
  entitlementId: string;
  slug: string;
  type: EntitlementType;
  value: PlanEntitlementValue;
}

/**
 * The full plan projection (Doc-4I §HB-1.4 / Doc-5I §4 `get_plan` output — EXACT field set: no
 * `human_ref`/`description`/timestamp, which are not in the Doc-4I output — adding one would be
 * `[ESC-BILL-FIELD]`). `price` is Doc-2 §10.8 `numeric` rendered as a precision-preserving decimal
 * STRING (JSON has no exact decimal type — the money-safe realization convention, disclosed).
 */
export interface PlanView {
  planId: string;
  name: string;
  billingCycle: BillingCycle;
  price: string;
  currency: string;
  status: PlanStatus;
  isActive: boolean;
  entitlements: PlanEntitlementView[];
}

/** Lookup key for `get_plan` — the path `{plan_id}` (Doc-5I §4). Public input; no org/tenant context. */
export interface GetPlanKey {
  planId: string;
}

/**
 * `get_plan` wire result: found (200) or not-found (404). Non-disclosure does NOT apply — the catalog
 * is platform-owned, not org-owned (Doc-5I §3.6), so `404` here means simply "no such plan_id"
 * (including a retired/soft-deleted plan on the non-staff surface — see the RETIRED-PLAN note above).
 */
export type GetPlanResult = { found: true; plan: PlanView } | { found: false };

/**
 * The application-level `get_plan` outcome: the frozen found/not-found result PLUS the pre-lookup
 * SYNTAX validation leg (a malformed `plan_id` — Doc-4I §HB-1.4 Stage 1). The wire mapper
 * (`api/get-plan.handler.ts`) turns `invalidInput` into a `400 VALIDATION`; found/not-found map to
 * `200`/`404`. The `GetPlanResult` success shape is byte-identical to the frozen contract.
 */
export type GetPlanOutcome = GetPlanResult | { found: false; invalidInput: true };

// ─────────────────────────────────────────────────────────────────────────────
// `billing.list_plans.v1` (Doc-4I §HB-1.4 / Doc-5I §4 `GET /billing/plans`). Paginated catalog read —
// cursor-based (Doc-5A §8): `?cursor=&page_size=`; declared `filter` allowlist `{ billing_cycle?,
// is_active?, status? }` (Doc-4I §HB-1.4). Sort is server-fixed to `name` asc / `plan_id` tiebreak for
// a total order (the M2 directory precedent) — no client `sort` parameter is exposed.
// ─────────────────────────────────────────────────────────────────────────────

/** `list_plans` filter allowlist (Doc-4I §HB-1.4). Each field independently optional; undeclared → VALIDATION. */
export interface ListPlansFilters {
  billingCycle?: BillingCycle;
  isActive?: boolean;
  status?: PlanStatus;
}

/** Request shape for `list_plans` (Doc-4I §HB-1.4; Doc-5A §8 cursor/page_size grammar). */
export interface ListPlansRequest {
  filters?: ListPlansFilters;
  cursor?: string;
  pageSize?: number;
}

/** One `list_plans` item (Doc-4I §HB-1.4 list output — no `entitlements`; use `get_plan` for the bundle). */
export interface PlanListItem {
  planId: string;
  name: string;
  billingCycle: BillingCycle;
  price: string;
  currency: string;
  status: PlanStatus;
}

/** Doc-5A §8.6 page_info (camelCase result realization — Option B; `total_count` omitted, optional per §8.6). */
export interface ListPlansPageInfo {
  nextCursor?: string;
  hasMore: boolean;
}

/** Result of `list_plans` — the Doc-5A §8.6 list shape (items + page_info), carried under the §5.6 `result`. */
export interface ListPlansResult {
  items: PlanListItem[];
  pageInfo: ListPlansPageInfo;
}

/**
 * The application-level `list_plans` outcome: the frozen list result PLUS the pre-scope SYNTAX leg (an
 * undeclared filter field, malformed `billing_cycle`/`is_active`/`status`/`cursor`, or out-of-bound
 * `page_size` — Doc-5A §8.3/§8.4/§8.5). The wire mapper turns `invalidInput` into `400 VALIDATION`; the
 * success leg is byte-identical to `ListPlansResult`.
 */
export type ListPlansOutcome = ListPlansResult | { invalidInput: true };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-1 Admin PLAN-CATALOG WRITES (W3-BILL-2) — `create_plan` / `activate_plan` / `update_plan` /
// `retire_plan` (Doc-4I §HB-1.1 + §HB-1.1a ActivatePlan patch / Doc-5I §4). Platform-staff (Admin, §5.6)
// audited writes — no org/tenant scope, no §8 event. Authority = `[ESC-BILL-SLUG]` (platform-staff basis;
// no slug coined). Audit = `[ESC-BILL-AUDIT]` (Admin-attributed; §9 Platform "service-role sensitive
// operations" by pointer). Concurrency = `expected_status` (Doc-4A §14 — the derived-status assertion,
// Model B), NOT an `updated_at` ETag.
// ─────────────────────────────────────────────────────────────────────────────

/** The Doc-4A §12 error classes a BC-BILL-1 catalog write can raise (module-outcome shape). */
export type PlanWriteErrorClass =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "STATE"
  | "CONFLICT"
  | "REFERENCE"
  | "BUSINESS"
  | "DEPENDENCY"
  | "SYSTEM";

/** A BC-BILL-1 catalog-write failure (the in-process outcome; the handler maps it to the §6.2 status). */
export interface PlanWriteError {
  errorClass: PlanWriteErrorClass;
  errorCode: string;
  message: string;
}

/** `create_plan` input (Doc-4I §HB-1.1 create — verbatim; `is_active` is NOT accepted: create always
 *  mints a `draft`, i.e. `is_active=false`, under Model B). */
export interface CreatePlanInput {
  name: string;
  billingCycle: BillingCycle;
  /** Doc-2 §10.8 `numeric` money — accepted as a decimal string (precision-safe). */
  price: string;
  currency: string;
}

/** `create_plan` success (Doc-4I §HB-1.1 minimal output; `status` is always `draft`). */
export interface CreatePlanResult {
  planId: string;
  status: PlanStatus;
}

export type CreatePlanOutcome =
  | { ok: true; result: CreatePlanResult }
  | { ok: false; error: PlanWriteError };

/** The shared minimal lifecycle output (Doc-5I §4 — `{ plan_id, status }`). */
export interface PlanLifecycleResult {
  planId: string;
  status: PlanStatus;
}

/** `activate_plan` input (Doc-4I §HB-1.1a — `expected_status` must be `draft`). */
export interface ActivatePlanInput {
  planId: string;
  expectedStatus: "draft";
}

export type ActivatePlanOutcome =
  | { ok: true; result: PlanLifecycleResult }
  | { ok: false; error: PlanWriteError };

/** `update_plan` input (Doc-4I §HB-1.1 — marketing-config mutation; NOT `is_active`, NOT a status edge).
 *  `expected_status` ∈ {`draft`,`active`} (a `retired` plan is terminal — rejected `STATE`). */
export interface UpdatePlanInput {
  planId: string;
  expectedStatus: "draft" | "active";
  name?: string;
  billingCycle?: BillingCycle;
  price?: string;
  currency?: string;
}

export type UpdatePlanOutcome =
  | { ok: true; result: PlanLifecycleResult }
  | { ok: false; error: PlanWriteError };

/** `retire_plan` input (Doc-4I §HB-1.1 — `active|draft → retired`; `expected_status` ∈ {`draft`,`active`}). */
export interface RetirePlanInput {
  planId: string;
  expectedStatus: "draft" | "active";
}

export type RetirePlanOutcome =
  | { ok: true; result: PlanLifecycleResult }
  | { ok: false; error: PlanWriteError };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-1 ENTITLEMENT-CATALOG + BUNDLE WRITES (W3-BILL-3) — `create_entitlement` / `update_entitlement`
// (Doc-4I §HB-1.3) + `bundle_plan_entitlement` (Doc-4I §HB-1.2), per Doc-5I §4. Platform-staff (Admin)
// audited writes; no org scope, no §8 event; `[ESC-BILL-SLUG]` authority; `[ESC-BILL-AUDIT]` audit. The
// error/failure shape is the shared `PlanWriteError` (BUSINESS = the duplicate-slug leg).
// ─────────────────────────────────────────────────────────────────────────────

/** `create_entitlement` input (Doc-4I §HB-1.3 — `slug` UNIQUE; `type`; optional `default_value`). */
export interface CreateEntitlementInput {
  slug: string;
  type: EntitlementType;
  /** Default per type (presence/shape only — Doc-4I §HB-1.3). Any JSON value; omitted = null. */
  defaultValue?: unknown;
}

/** The shared entitlement write output (Doc-5I §4 — `{ entitlement_id, slug, type }`). */
export interface EntitlementView {
  entitlementId: string;
  slug: string;
  type: EntitlementType;
}

export type CreateEntitlementOutcome =
  | { ok: true; result: EntitlementView }
  | { ok: false; error: PlanWriteError };

/** `update_entitlement` input (Doc-4I §HB-1.3 — mutate `type`/`default_value`; `slug` is immutable identity).
 *  Both fields optional (omitted = unchanged). No concurrency token in the frozen wire (Doc-5I §4). */
export interface UpdateEntitlementInput {
  entitlementId: string;
  type?: EntitlementType;
  defaultValue?: unknown;
}

export type UpdateEntitlementOutcome =
  | { ok: true; result: EntitlementView }
  | { ok: false; error: PlanWriteError };

/** `bundle_plan_entitlement` input (Doc-4I §HB-1.2 — PK `plan_id`+`entitlement_id`; `value_jsonb` required). */
export interface BundlePlanEntitlementInput {
  planId: string;
  entitlementId: string;
  /** The per-plan bundle value (presence required; any JSON value — Doc-4I §HB-1.2). */
  valueJsonb: unknown;
}

/** `bundle_plan_entitlement` output (Doc-5I §4 — `{ plan_id, entitlement_id }`). */
export interface BundlePlanEntitlementResult {
  planId: string;
  entitlementId: string;
}

export type BundlePlanEntitlementOutcome =
  | { ok: true; result: BundlePlanEntitlementResult }
  | { ok: false; error: PlanWriteError };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-2 SUBSCRIPTIONS (W3-BILL-4) — `purchase_subscription` (Doc-4I §HB-2.1) + `get_subscription`
// (Doc-4I §HB-2.5) per Doc-5I §5. ORG-SCOPED (Users Act, Orgs Own): the actor is a User with
// `can_manage_billing` (Owner), the write runs in the server-validated active-org context (never a
// client org id — Invariant #5). `purchase` emits `SubscriptionPurchased` (Doc-2 §8, at creation) via
// the M0 outbox. The failure shape reuses `PlanWriteError` (STATE = one-active-per-org; REFERENCE = plan
// not active).
// ─────────────────────────────────────────────────────────────────────────────

/** Subscription lifecycle status (Doc-2 §5.7 — the stored `subscriptions.state`). */
export type SubscriptionStatus = "pending_payment" | "active" | "expired";

/** `purchase_subscription` input (Doc-4I §HB-2.1 — `plan_id`; optional `auto_renew` default true). */
export interface PurchaseSubscriptionInput {
  planId: string;
  autoRenew?: boolean;
}

/** `purchase_subscription` success (Doc-4I §HB-2.1 / Doc-5I §5 — `{ subscription_id, status, plan_id }`;
 *  `status` is `pending_payment` at creation). */
export interface PurchaseSubscriptionResult {
  subscriptionId: string;
  status: SubscriptionStatus;
  planId: string;
}

export type PurchaseSubscriptionOutcome =
  | { ok: true; result: PurchaseSubscriptionResult }
  | { ok: false; error: PlanWriteError };

/** The org's subscription head (Doc-4I §HB-2.5 output). `period_*` are ISO-8601 strings (nullable). */
export interface SubscriptionView {
  subscriptionId: string;
  planId: string;
  status: SubscriptionStatus;
  periodStart: string | null;
  periodEnd: string | null;
  autoRenew: boolean;
}

/** `get_subscription` result — the org's current subscription, or none (Doc-4I §HB-2.5). */
export type GetSubscriptionResult =
  | { found: true; subscription: SubscriptionView }
  | { found: false };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-2 COMPLETION (W3-BILL-5) — `cancel_subscription` (Doc-4I §HB-2.2) + `list_subscription_events`
// (Doc-4I §HB-2.5) per Doc-5I §5. Both are ORG-SCOPED, User-only (Doc-5I §3.6 [ESC-BILL-ADMINSCOPE]):
// cancel = `can_manage_billing` (Owner); list = `can_view_billing` (Owner, Delegate). `resolve_entitlements`
// (Doc-4I §HB-2.4) is OUT-OF-WIRE (Doc-5I §10/R1) — an intra-module internal query (no HTTP surface); its
// types live here only so the module's own BC-BILL-3 consumer + tests share one shape.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The Doc-4A §12 error classes a BC-BILL-2 subscription COMMAND can raise. Distinct from `PlanWriteError`:
 * a subscription is ORG-OWNED, so a cross-org/absent id collapses to `NOT_FOUND` (§3.5 non-disclosure) —
 * the catalog writes (platform-owned) never do. No `REFERENCE`/`BUSINESS` legs on cancel.
 */
export type SubscriptionWriteErrorClass =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "NOT_FOUND"
  | "STATE"
  | "CONFLICT"
  | "DEPENDENCY"
  | "SYSTEM";

/** A BC-BILL-2 subscription-command failure (the in-process outcome; the handler maps it to the §6.2 status). */
export interface SubscriptionWriteError {
  errorClass: SubscriptionWriteErrorClass;
  errorCode: string;
  message: string;
}

/** `cancel_subscription` input (Doc-4I §HB-2.2 — `subscription_id`; `expected_status` must be `active`,
 *  the optimistic-concurrency assertion). Sets `auto_renew=false`; status stays `active` (no state edge). */
export interface CancelSubscriptionInput {
  subscriptionId: string;
  expectedStatus: "active";
}

/** `cancel_subscription` success (Doc-4I §HB-2.2 / Doc-5I §5 — `{ subscription_id, status }`; `status`
 *  stays `active` after cancel — `auto_renew` is now false, read the detail via `get_subscription`). */
export interface CancelSubscriptionResult {
  subscriptionId: string;
  status: SubscriptionStatus;
}

export type CancelSubscriptionOutcome =
  | { ok: true; result: CancelSubscriptionResult }
  | { ok: false; error: SubscriptionWriteError };

/** One `subscription_events` history item (Doc-4I §HB-2.5 `items` — `{ event_type, occurred_at }` verbatim).
 *  `event_type` is the stored Doc-2 §10.8 domain value (`purchase|renew|expire|cancel`), rendered as-is —
 *  Doc-5I §5.3's "e.g. purchased|activated|…" is an explicitly illustrative gloss, not the binding domain. */
export interface SubscriptionEventItem {
  eventType: "purchase" | "renew" | "expire" | "cancel";
  occurredAt: string;
}

/** Doc-5A §8.6 page_info for the events list (camelCase result — Option B; `total_count` omitted). */
export interface SubscriptionEventsPageInfo {
  nextCursor?: string;
  hasMore: boolean;
}

/** `list_subscription_events` request (Doc-4I §HB-2.5; Doc-5A §8 cursor/page_size grammar). */
export interface ListSubscriptionEventsRequest {
  subscriptionId: string;
  cursor?: string;
  pageSize?: number;
}

/** `list_subscription_events` result — the Doc-5A §8.6 list shape (items DESC by `occurred_at` + page_info). */
export interface ListSubscriptionEventsResult {
  items: SubscriptionEventItem[];
  pageInfo: SubscriptionEventsPageInfo;
}

/**
 * The application-level `list_subscription_events` outcome: success, a pre-lookup SYNTAX leg
 * (`VALIDATION` — malformed `subscription_id`/`cursor`, out-of-bound `page_size`), or `NOT_FOUND` (the
 * subscription is absent or belongs to another org — protected-fact collapse §3.5). `AUTHORIZATION`
 * (`can_view_billing`) is resolved earlier at the composition edge, never in the query.
 */
export type ListSubscriptionEventsOutcome =
  | { ok: true; result: ListSubscriptionEventsResult }
  | { ok: false; errorClass: "VALIDATION" | "NOT_FOUND" };

// ── `resolve_entitlements` (Doc-4I §HB-2.4) — OUT-OF-WIRE internal-service authority (Doc-5I §10/R1/R10). ──

/** One resolved effective entitlement (Doc-4I §HB-2.4 output `entitlements[]` — `{ slug, type, value }`). */
export interface ResolvedEntitlement {
  slug: string;
  type: EntitlementType;
  /** The per-plan `plan_entitlements.value_jsonb` for the org's active-subscription plan (BL-CR4 — the gate
   *  is the entitlement VALUE, never the plan name). */
  value: PlanEntitlementValue;
}

/** `resolve_entitlements` input (Doc-4I §HB-2.4 — `organization_id`; optional single-slug narrow). */
export interface ResolveEntitlementsInput {
  organizationId: string;
  entitlementSlug?: string;
}

/**
 * `resolve_entitlements` result (Doc-4I §HB-2.4). `source` distinguishes the org's `active`-subscription
 * plan bundle from the Basic profile (A-11) returned when the org has no `active` subscription. The Basic
 * profile is a STATIC empty grant set — never a plan-name lookup (the billing firewall bars plan-name
 * gating; Doc-2 §2 M7 / Invariant #10). Concrete Basic quota values, if ever needed, are a Doc-3 POLICY
 * decision, not invented here.
 */
export interface ResolveEntitlementsResult {
  organizationId: string;
  entitlements: ResolvedEntitlement[];
  source: "active_subscription" | "basic_profile";
}

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-3 USAGE & QUOTA (W3-BILL-6) — `enforce_quota` (Doc-4I §HB-3.2, OUT-OF-WIRE) + `get_usage`
// (Doc-4I §HB-3.3 / Doc-5I §6, wired). `record_usage` (§HB-3.1, the writer) is DEFERRED on
// `[ESC-BILL-USAGE-ENTID]` (the `usage_ledger.entitlement_id` NOT-NULL FK has no population path in the
// frozen contract). `amount`/`limit`/`used`/`remaining` are QUOTA UNITS (numbers), never money (Doc-6I §3.3).
// ─────────────────────────────────────────────────────────────────────────────

/** The metered-action source (Doc-2 §10.8 `usage_source`). */
export type UsageSource = "rfq_response" | "lead_access" | "ad_launch";

/** `enforce_quota` input (Doc-4I §HB-3.2 — `organization_id`, `quota_key`; optional `requested_amount`=1). */
export interface EnforceQuotaInput {
  organizationId: string;
  quotaKey: string;
  requestedAmount?: number;
}

/** `enforce_quota` decision (Doc-4I §HB-3.2 output verbatim). `allowed=false` is a QUOTA denial ONLY —
 *  never a routing/eligibility/trust signal (moat/firewall). */
export interface QuotaDecision {
  allowed: boolean;
  quotaKey: string;
  limit: number;
  used: number;
  remaining: number;
}

/** `enforce_quota` outcome — the decision, or a SYNTAX leg. (No wire; the caller surfaces `QUOTA`.) */
export type EnforceQuotaOutcome =
  | { ok: true; result: QuotaDecision }
  | { ok: false; errorClass: "VALIDATION" };

/** One `get_usage` item (Doc-4I §HB-3.3 `items` — `{ quota_key, amount, period, source }`, camelCased). */
export interface UsageItem {
  quotaKey: string;
  amount: number;
  period: string | null;
  source: UsageSource;
}

/** `get_usage` totals facet (Doc-4I §HB-3.3 `totals` — `{ quota_key, used }`; `quotaKey` echoes the filter,
 *  `""` when unfiltered — [realization convention, disclosed]). */
export interface UsageTotals {
  quotaKey: string;
  used: number;
}

/** Doc-5A §8.6 page_info for the usage list (camelCase result — Option B; `total_count` omitted). */
export interface UsagePageInfo {
  nextCursor?: string;
  hasMore: boolean;
}

/** `get_usage` request (Doc-4I §HB-3.3 / Doc-5I §6.2). `filters` is the RAW `filter[*]` map (allowlist
 *  `{ quota_key?, period? }`, validated in the query); `period` defaults to the current `YYYY-MM`. */
export interface GetUsageRequest {
  filters?: Record<string, string>;
  cursor?: string;
  pageSize?: number;
}

/** `get_usage` result — the Doc-4I §HB-3.3 list (items + totals facet + page_info). */
export interface GetUsageResult {
  items: UsageItem[];
  totals: UsageTotals;
  pageInfo: UsagePageInfo;
}

/**
 * The application-level `get_usage` outcome: success, a SYNTAX leg (`VALIDATION` — undeclared filter,
 * malformed `period`/`cursor`, out-of-bound `page_size`), or `BUSINESS` (a FUTURE `period` — Doc-5I §6.2).
 * `AUTHORIZATION` (`can_view_billing`) resolves earlier at the composition edge; org = server-validated
 * active org (never a caller `org_id` — Doc-5I §6.2).
 */
export type GetUsageOutcome =
  | { ok: true; result: GetUsageResult }
  | { ok: false; errorClass: "VALIDATION" | "BUSINESS" };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-4 LEAD CREDITS (W3-BILL-7 reads pilot) — `get_lead_balance` + `list_lead_transactions`
// (Doc-4I §HB-4.2 / Doc-5I §7, wired). The credit/debit WRITES (§HB-4.1) land in the next slice.
// `balance`/`amount` are lead CREDITS (numbers), never money (Doc-6I §3.4 / BL-CR7).
// ─────────────────────────────────────────────────────────────────────────────

/** A lead-credit movement direction (Doc-2 §10.8 `lead_credit_txn_type`). */
export type LeadCreditDirection = "credit" | "debit";

/** `get_lead_balance` result (Doc-4I §HB-4.2 output — `{ organization_id, balance }`). Org-self, always
 *  resolves — `balance` is `0` when the org has no lead-credit account yet. */
export interface LeadBalanceView {
  organizationId: string;
  balance: number;
}

/** One `list_lead_transactions` item (Doc-4I §HB-4.2 `items` — `{ transaction_id, direction, amount,
 *  source_invoice_id, occurred_at }`, camelCased). `occurredAt` = the txn `created_at` (Doc-6I §3.4). */
export interface LeadTransactionItem {
  transactionId: string;
  direction: LeadCreditDirection;
  amount: number;
  sourceInvoiceId: string | null;
  occurredAt: string;
}

/** Doc-5A §8.6 page_info for the lead-transactions list (camelCase — Option B; `total_count` omitted). */
export interface LeadTransactionsPageInfo {
  nextCursor?: string;
  hasMore: boolean;
}

/** `list_lead_transactions` request (Doc-4I §HB-4.2; Doc-5A §8 cursor/page_size grammar). */
export interface ListLeadTransactionsRequest {
  cursor?: string;
  pageSize?: number;
}

/** `list_lead_transactions` result — the Doc-5A §8.6 list shape (items DESC by `occurred_at` + page_info). */
export interface ListLeadTransactionsResult {
  items: LeadTransactionItem[];
  pageInfo: LeadTransactionsPageInfo;
}

/**
 * The application-level `list_lead_transactions` outcome: success or a SYNTAX leg (`VALIDATION` — malformed
 * `cursor`, out-of-bound `page_size`). `AUTHORIZATION` (`can_view_billing`) resolves at the composition; org
 * = server-validated active org (never a caller `org_id`).
 */
export type ListLeadTransactionsOutcome =
  | { ok: true; result: ListLeadTransactionsResult }
  | { ok: false; errorClass: "VALIDATION" };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-5 PLATFORM INVOICING (W3-BILL-8 reads pilot) — `get_platform_invoice` + `list_platform_invoices`
// (Doc-4I §HB-5.4 / Doc-5I §8, wired). The issue/update writes + record_payment land in the next slice.
// `platform_invoices` = the platform's OWN revenue (≠ operations.trade_invoices; firewall) — `amount` is
// REAL MONEY, rendered as a precision-safe decimal STRING (the `plans.price` convention).
// ─────────────────────────────────────────────────────────────────────────────

/** Platform-invoice lifecycle status (Doc-2 §10.8 `invoice_status`). */
export type PlatformInvoiceStatus = "issued" | "paid" | "overdue" | "void";

/** Platform-invoice purpose (Doc-2 §10.8 `invoice_purpose`). */
export type PlatformInvoicePurpose =
  | "subscription"
  | "lead_package"
  | "advertising"
  | "microsite"
  | "service";

/** Payment gateway (Doc-2 §10.8 `payment_gateway`). */
export type PlatformPaymentGateway = "sslcommerz" | "bkash" | "nagad" | "bank";

/** Payment lifecycle status (Doc-2 §10.8 `payment_status`). */
export type PlatformPaymentStatus = "initiated" | "succeeded" | "failed" | "refunded";

/** One payment record on an invoice (Doc-4I §HB-5.4 `payments[]` — `{ gateway, gateway_ref, status }`). */
export interface InvoicePaymentView {
  gateway: PlatformPaymentGateway;
  gatewayRef: string | null;
  status: PlatformPaymentStatus;
}

/** `get_platform_invoice` result (Doc-4I §HB-5.4 `invoice` output — verbatim field set incl. `payments`). */
export interface PlatformInvoiceView {
  invoiceId: string;
  humanRef: string;
  organizationId: string;
  purpose: PlatformInvoicePurpose;
  amount: string;
  currency: string;
  status: PlatformInvoiceStatus;
  payments: InvoicePaymentView[];
}

/**
 * The application-level `get_platform_invoice` outcome: success, a SYNTAX leg (`VALIDATION` — malformed
 * `invoice_id`), or `NOT_FOUND` (the invoice is absent or its debtor is another org — protected-fact
 * collapse §3.5). `AUTHORIZATION` (`can_view_billing`) resolves at the composition edge.
 */
export type GetPlatformInvoiceOutcome =
  | { ok: true; result: PlatformInvoiceView }
  | { ok: false; errorClass: "VALIDATION" | "NOT_FOUND" };

/** One `list_platform_invoices` item (Doc-4I §HB-5.4 `items` — no `organization_id`/`payments`). */
export interface PlatformInvoiceListItem {
  invoiceId: string;
  humanRef: string;
  purpose: PlatformInvoicePurpose;
  amount: string;
  currency: string;
  status: PlatformInvoiceStatus;
}

/** Doc-5A §8.6 page_info for the invoices list (camelCase — Option B; `total_count` omitted). */
export interface PlatformInvoicesPageInfo {
  nextCursor?: string;
  hasMore: boolean;
}

/** `list_platform_invoices` request (Doc-4I §HB-5.4; Doc-5A §8). `filters` is the RAW `filter[*]` map
 *  (allowlist `{ status?, purpose? }`, validated in the query); org = server-validated active org. */
export interface ListPlatformInvoicesRequest {
  filters?: Record<string, string>;
  cursor?: string;
  pageSize?: number;
}

/** `list_platform_invoices` result — the Doc-5A §8.6 list shape (items DESC by `created_at` + page_info). */
export interface ListPlatformInvoicesResult {
  items: PlatformInvoiceListItem[];
  pageInfo: PlatformInvoicesPageInfo;
}

/**
 * The application-level `list_platform_invoices` outcome: success or a SYNTAX leg (`VALIDATION` — undeclared
 * filter, bad `status`/`purpose` enum, malformed `cursor`, out-of-bound `page_size`). `AUTHORIZATION` at the
 * composition; org = server-validated active org (never a caller `org_id`).
 */
export type ListPlatformInvoicesOutcome =
  | { ok: true; result: ListPlatformInvoicesResult }
  | { ok: false; errorClass: "VALIDATION" };

// ── BC-BILL-5 INVOICE WRITES (W3-BILL-9) — issue_platform_invoice (§HB-5.1) + update_invoice_status
//    (§HB-5.2). Actor-branched (User wired leg + System in-process). `amount` = money string. ──

/** The Doc-4A §12 error classes a BC-BILL-5 invoice write can raise (org-owned → NOT_FOUND collapse). */
export type InvoiceWriteErrorClass =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "NOT_FOUND"
  | "STATE"
  | "CONFLICT"
  | "REFERENCE"
  | "BUSINESS"
  | "DEPENDENCY"
  | "SYSTEM";

/** A BC-BILL-5 invoice-write failure (the in-process outcome; the handler maps it to the §6.2 status). */
export interface InvoiceWriteError {
  errorClass: InvoiceWriteErrorClass;
  errorCode: string;
  message: string;
}

/** `issue_platform_invoice` input (Doc-4I §HB-5.1). `organization_id` (debtor) is server-resolved (the
 *  active org on the wired User leg), not a caller field. `amount` is a positive money string. */
export interface IssuePlatformInvoiceInput {
  purpose: PlatformInvoicePurpose;
  amount: string;
  currency: string;
  subscriptionId?: string;
}

/** `issue_platform_invoice` success (Doc-4I §HB-5.1 output — `{ invoice_id, human_ref, status, amount, currency }`). */
export interface IssuePlatformInvoiceResult {
  invoiceId: string;
  humanRef: string;
  status: PlatformInvoiceStatus;
  amount: string;
  currency: string;
}

export type IssuePlatformInvoiceOutcome =
  | { ok: true; result: IssuePlatformInvoiceResult }
  | { ok: false; error: InvoiceWriteError };

/** `update_invoice_status` input (Doc-4I §HB-5.2). `expected_status ∈ {issued, overdue}` = the CAS assertion. */
export interface UpdateInvoiceStatusInput {
  invoiceId: string;
  targetStatus: "paid" | "overdue" | "void";
  expectedStatus: "issued" | "overdue";
}

/** `update_invoice_status` success (Doc-4I §HB-5.2 output — `{ invoice_id, status }`). */
export interface UpdateInvoiceStatusResult {
  invoiceId: string;
  status: PlatformInvoiceStatus;
}

export type UpdateInvoiceStatusOutcome =
  | { ok: true; result: UpdateInvoiceStatusResult }
  | { ok: false; error: InvoiceWriteError };

// ── BC-BILL-5 `record_payment` (W3-BILL-10) — OUT-OF-WIRE gateway callback (§HB-5.3 / Doc-5I §10/R8).
//    System actor; writes/transitions `platform_payments`; on `succeeded` drives the invoice → paid.
//    NOT a §8 event. `Response: none` — the outcome carries no result payload. ──

/** `record_payment` input (Doc-4I §HB-5.3). `gateway_ref` is the provider reference (idempotency key). */
export interface RecordPaymentInput {
  invoiceId: string;
  gateway: PlatformPaymentGateway;
  gatewayRef: string;
  targetStatus: "succeeded" | "failed" | "refunded";
}

/** `record_payment` outcome — `Response: none` (21.5 System): success carries no payload; failure is the
 *  §12 envelope (VALIDATION / STATE / REFERENCE / DEPENDENCY / SYSTEM). */
export type RecordPaymentOutcome = { ok: true } | { ok: false; error: InvoiceWriteError };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-6 REWARDS & REFERRALS (W3-BILL-11 reads pilot) — `get_reward_balance` + `list_referrals`
// (Doc-4I §HB-6.3 / Doc-5I §9, wired). The credit_reward / track_referral / advance_referral WRITES land in
// the next slice. `balance`/`amount` are reward POINTS (numbers), never money (Doc-6I §3.6 / BL-CR10).
// ─────────────────────────────────────────────────────────────────────────────

/** Referral lifecycle state (Doc-2 §10.8 `referral_state`). */
export type ReferralState = "pending" | "qualified" | "rewarded";

/** `get_reward_balance` result (Doc-4I §HB-6.3 — `{ organization_id, balance }`). Org-self, always resolves
 *  — `balance` is `0` when the org has no reward account yet. */
export interface RewardBalanceView {
  organizationId: string;
  balance: number;
}

/** One `list_referrals` item (Doc-4I §HB-6.3 `items` — `{ referral_id, referred_organization_id, state }`).
 *  `referredOrganizationId` is nullable (a referral whose referred org is not yet resolved). */
export interface ReferralItem {
  referralId: string;
  referredOrganizationId: string | null;
  state: ReferralState;
}

/** Doc-5A §8.6 page_info for the referrals list (camelCase — Option B; `total_count` omitted). */
export interface ReferralsPageInfo {
  nextCursor?: string;
  hasMore: boolean;
}

/** `list_referrals` request (Doc-4I §HB-6.3; Doc-5A §8 cursor/page_size grammar). */
export interface ListReferralsRequest {
  cursor?: string;
  pageSize?: number;
}

/** `list_referrals` result — the Doc-5A §8.6 list shape (items DESC by `created_at` + page_info). */
export interface ListReferralsResult {
  items: ReferralItem[];
  pageInfo: ReferralsPageInfo;
}

/**
 * The application-level `list_referrals` outcome: success or a SYNTAX leg (`VALIDATION` — malformed
 * `cursor`, out-of-bound `page_size`). `AUTHORIZATION` (`can_view_billing`) resolves at the composition;
 * org = server-validated active org (the referrer Controlling Org; never a caller `org_id`).
 */
export type ListReferralsOutcome =
  | { ok: true; result: ListReferralsResult }
  | { ok: false; errorClass: "VALIDATION" };

// ── BC-BILL-6 WRITES (W3-BILL-12) — credit_reward (§HB-6.1) + track_referral / advance_referral (§HB-6.2).
//    Actor-branched (User leg wired, System in-process). points = reward POINTS (numbers). ──

/** The Doc-4A §12 error classes a BC-BILL-6 write can raise (org-owned → NOT_FOUND collapse). */
export type RewardWriteErrorClass =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "NOT_FOUND"
  | "STATE"
  | "CONFLICT"
  | "REFERENCE"
  | "BUSINESS"
  | "DEPENDENCY"
  | "SYSTEM";

/** A BC-BILL-6 write failure (the in-process outcome; the handler maps it to the §6.2 status). */
export interface RewardWriteError {
  errorClass: RewardWriteErrorClass;
  errorCode: string;
  message: string;
}

/** Reward movement direction (Doc-2 §10.8 — `credit` = milestone/System, `redeem` = org redemption). */
export type RewardDirection = "credit" | "redeem";

/** Reward reason (Doc-4I §HB-6.1). `redemption` is the User (redeem) leg; the rest are System milestones. */
export type RewardReason = "profile_completion" | "review" | "completion" | "redemption";

/** `credit_reward` input (Doc-4I §HB-6.1). `organization_id` (debtor) + `source_event_id` are server-set
 *  via the ctx; on the wired User leg `direction=redeem`/`reason=redemption` are server-set (body = `{points}`). */
export interface CreditRewardInput {
  direction: RewardDirection;
  points: number;
  reason: RewardReason;
}

/** `credit_reward` success (Doc-4I §HB-6.1 — `{ transaction_id, organization_id, direction, points, balance }`). */
export interface CreditRewardResult {
  transactionId: string;
  organizationId: string;
  direction: RewardDirection;
  points: number;
  balance: number;
}

export type CreditRewardOutcome =
  | { ok: true; result: CreditRewardResult }
  | { ok: false; error: RewardWriteError };

/** `track_referral` input (Doc-4I §HB-6.2). `referrer_organization_id` = the active org (server-set). */
export interface TrackReferralInput {
  referredOrganizationId: string;
}

/** `track_referral` success (Doc-4I §HB-6.2 — `{ referral_id, state }`; state is `pending`). */
export interface TrackReferralResult {
  referralId: string;
  state: ReferralState;
}

export type TrackReferralOutcome =
  | { ok: true; result: TrackReferralResult }
  | { ok: false; error: RewardWriteError };

/** `advance_referral` input (Doc-4I §HB-6.2). `expected_state ∈ {pending, qualified}` = the CAS assertion. */
export interface AdvanceReferralInput {
  referralId: string;
  targetState: "qualified" | "rewarded";
  expectedState: "pending" | "qualified";
}

/** `advance_referral` success (Doc-4I §HB-6.2 — `{ referral_id, state }`). */
export interface AdvanceReferralResult {
  referralId: string;
  state: ReferralState;
}

export type AdvanceReferralOutcome =
  | { ok: true; result: AdvanceReferralResult }
  | { ok: false; error: RewardWriteError };

// ── BC-BILL-4 LEAD-CREDIT WRITES (W3-BILL-13) — credit_lead_account / debit_lead_account (§HB-4.1).
//    Actor-branched (User leg wired, System in-process). `direction` is fixed by the contract slug.
//    amount/balance = lead CREDITS (numbers), never money (Doc-6I §3.4 / BL-CR7). ──

/** The Doc-4A §12 error classes a BC-BILL-4 write can raise (org-owned → NOT_FOUND collapse). */
export type LeadCreditWriteErrorClass =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "NOT_FOUND"
  | "REFERENCE"
  | "BUSINESS"
  | "DEPENDENCY"
  | "SYSTEM";

/** A BC-BILL-4 write failure (the in-process outcome; the handler maps it to the §6.2 status). */
export interface LeadCreditWriteError {
  errorClass: LeadCreditWriteErrorClass;
  errorCode: string;
  message: string;
}

/** `credit_lead_account` / `debit_lead_account` input (Doc-4I §HB-4.1). `direction` + `organization_id` are
 *  server-set via the ctx (the slug fixes credit vs debit). `source_invoice_id` is a credit-only link. */
export interface LeadCreditMovementInput {
  amount: number;
  /** Credit-only: links the credit to a BC-BILL-5 platform invoice (Doc-4I §HB-4.1). */
  sourceInvoiceId?: string;
}

/** Lead-credit movement success (Doc-4I §HB-4.1 — `{ transaction_id, organization_id, direction, amount, balance }`). */
export interface LeadCreditMovementResult {
  transactionId: string;
  organizationId: string;
  direction: LeadCreditDirection;
  amount: number;
  balance: number;
}

export type LeadCreditMovementOutcome =
  | { ok: true; result: LeadCreditMovementResult }
  | { ok: false; error: LeadCreditWriteError };

// ── BC-BILL-3 `record_usage` (W3-BILL-14) — OUT-OF-WIRE System metering (§HB-3.1 / Doc-5I §10/R1). Appends
//    a `usage_ledger` row attributed to the Controlling Org. `entitlement_id` is caller-supplied
//    ([ESC-BILL-USAGE-ENTID] Option B). `Response: none`. `amount` = quota UNITS (number). ──

/** The Doc-4A §12 error classes `record_usage` can raise (§HB-3.1 §11; System — no AUTHORIZATION leg). */
export type UsageWriteErrorClass = "VALIDATION" | "REFERENCE" | "DEPENDENCY" | "SYSTEM";

/** A `record_usage` failure (the in-process outcome). */
export interface UsageWriteError {
  errorClass: UsageWriteErrorClass;
  errorCode: string;
  message: string;
}

/** `record_usage` input (Doc-4I §HB-3.1 + the [ESC-BILL-USAGE-ENTID] Option-B `entitlement_id` input).
 *  `organization_id` = the Controlling Org (attribution anchor). `source_event_id` = the Doc-4A §16
 *  idempotency key (the metered-action event id). */
export interface RecordUsageInput {
  organizationId: string;
  /** The metered entitlement (caller-supplied; maps to the NOT-NULL `usage_ledger.entitlement_id` FK). */
  entitlementId: string;
  quotaKey: string;
  amount: number;
  period: string;
  source: UsageSource;
  actingUserId?: string;
  consumingEntityId?: string;
  sourceEventId: string;
}

/** `record_usage` outcome — `Response: none` (21.5 System): success carries no payload; failure is the §12
 *  envelope (VALIDATION / REFERENCE / DEPENDENCY / SYSTEM). */
export type RecordUsageOutcome = { ok: true } | { ok: false; error: UsageWriteError };
