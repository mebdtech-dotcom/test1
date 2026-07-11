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
