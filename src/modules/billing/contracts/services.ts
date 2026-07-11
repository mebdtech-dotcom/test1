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
export {
  mapPurchaseSubscription,
  mapGetSubscription,
  SUBSCRIPTION_INVALID_INPUT,
  SUBSCRIPTION_FORBIDDEN,
} from "../api/subscription.handler";
