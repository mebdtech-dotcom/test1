// M7 infrastructure (PRIVATE) — thin Prisma repository over `billing.plans` (+ `billing.plan_entitlements`
// ⋈ `billing.entitlements`) for `billing.get_plan.v1` / `billing.list_plans.v1` (Doc-4I §HB-1.4 /
// Doc-6I §3.1). M7 reading its OWN schema (allowed — One Module, One Owner); no module outside `billing`
// imports this file. Marketplace precedent: `vendor-directory.repository.ts` / `vendor-profile.repository.ts`.
//
// NON-RETIRED SCOPE: both reads apply `deleted_at IS NULL` in the SQL `WHERE` — the SQL-literal twin of
// `plan-status.policy.ts`'s `isPlanPubliclyVisible` (retired ⇒ hidden), matching the `plans_public_read`
// RLS. For the list, this keeps the keyset "fetch N+1, trim" `has_more` math over the SAME visibility set
// (Doc-5A §8.7). For the get, a retired/absent plan alike resolves to `null` (→ `404`, non-disclosure N/A —
// the catalog is platform-owned, Doc-5I §3.6). Retired = staff/admin only per the resolved
// `[ESC-BILL-RETIRE-VIS]` ruling (owner 2026-07-11; `Doc-5I_RetiredVisibility_Patch_v1.0`).

import { prisma, type DbExecutor } from "../../../../shared/db";
import type {
  EntitlementTypeClient,
  PlanRowReadModel,
} from "../../domain/read-models/plan.read-model";

/** The keyset cursor's decoded position: the last row's sort key (`name` asc, `id` tiebreak). */
export interface PlanCursorKey {
  name: string;
  id: string;
}

/** Repo-level filter params (already resolved from the contract `filters` + status implication). */
export interface ListPlansFilterParams {
  billingCycle?: "monthly" | "annual";
  /** The effective `is_active` predicate (from `filters.is_active` and/or the `status` implication). */
  isActive?: boolean;
}

// The shared plan projection: the catalog fields + the status/visibility inputs (`is_active`, `deleted_at`).
const PLAN_BASE_SELECT = {
  id: true,
  name: true,
  billingCycle: true,
  price: true,
  currency: true,
  isActive: true,
  deletedAt: true,
} as const;

interface PlanBaseRow {
  id: string;
  name: string;
  billingCycle: "monthly" | "annual";
  price: { toString(): string };
  currency: string;
  isActive: boolean;
  deletedAt: Date | null;
}

function toBaseReadModel(row: PlanBaseRow): Omit<PlanRowReadModel, "entitlements"> {
  return {
    id: row.id,
    name: row.name,
    billingCycle: row.billingCycle,
    price: row.price.toString(),
    currency: row.currency,
    isActive: row.isActive,
    deletedAt: row.deletedAt,
  };
}

/**
 * Fetch ONE non-retired plan by id, with its bundled entitlements (`plan_entitlements` ⋈ `entitlements`,
 * ordered by `entitlement_id` for a deterministic payload). Returns `null` for an absent OR retired
 * (soft-deleted) plan alike (`deleted_at IS NULL` scope).
 */
export async function findPlanById(
  planId: string,
  db: DbExecutor = prisma,
): Promise<PlanRowReadModel | null> {
  const row = await db.plan.findFirst({
    where: { id: planId, deletedAt: null },
    select: {
      ...PLAN_BASE_SELECT,
      planEntitlements: {
        orderBy: { entitlementId: "asc" },
        select: {
          entitlementId: true,
          valueJsonb: true,
          entitlement: { select: { slug: true, type: true } },
        },
      },
    },
  });
  if (row === null) return null;

  return {
    ...toBaseReadModel(row),
    entitlements: row.planEntitlements.map((pe) => ({
      entitlementId: pe.entitlementId,
      slug: pe.entitlement.slug,
      type: pe.entitlement.type as EntitlementTypeClient,
      value: pe.valueJsonb,
    })),
  };
}

/**
 * Fetch one keyset-paginated page of the non-retired plan catalog (up to `limit` rows, `name` asc /
 * `id` asc total order). `after` is the decoded cursor position (exclusive); `null` fetches the first
 * page. List rows carry no entitlements (use `get_plan` for the bundle).
 */
export async function findPlansPage(
  filters: ListPlansFilterParams,
  after: PlanCursorKey | null,
  limit: number,
  db: DbExecutor = prisma,
): Promise<PlanRowReadModel[]> {
  const rows = await db.plan.findMany({
    where: {
      deletedAt: null,
      ...(filters.billingCycle !== undefined ? { billingCycle: filters.billingCycle } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(after !== null
        ? {
            OR: [
              { name: { gt: after.name } },
              { AND: [{ name: after.name }, { id: { gt: after.id } }] },
            ],
          }
        : {}),
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    take: limit,
    select: PLAN_BASE_SELECT,
  });

  return rows.map((row) => ({ ...toBaseReadModel(row), entitlements: [] }));
}
