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
  "VALIDATION" | "AUTHORIZATION" | "STATE" | "CONFLICT" | "REFERENCE" | "DEPENDENCY" | "SYSTEM";

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
  { ok: true; result: CreatePlanResult } | { ok: false; error: PlanWriteError };

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
  { ok: true; result: PlanLifecycleResult } | { ok: false; error: PlanWriteError };

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
  { ok: true; result: PlanLifecycleResult } | { ok: false; error: PlanWriteError };

/** `retire_plan` input (Doc-4I §HB-1.1 — `active|draft → retired`; `expected_status` ∈ {`draft`,`active`}). */
export interface RetirePlanInput {
  planId: string;
  expectedStatus: "draft" | "active";
}

export type RetirePlanOutcome =
  { ok: true; result: PlanLifecycleResult } | { ok: false; error: PlanWriteError };
