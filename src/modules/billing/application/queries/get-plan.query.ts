// M7 application (PRIVATE) — `billing.get_plan.v1` read query (Doc-4I §HB-1.4 / Doc-5I §4
// `GET /billing/plans/{plan_id}`). Orchestration only; owns NO state. Single read: NO explicit
// transaction (Doc-5A §17.1 — reads are not audited). Marketplace precedent:
// `get-public-vendor-profile.query.ts`.
//
// Validation (Doc-4I §HB-1.4): SYNTAX (`plan_id` uuid) → [auth is the composition's job, Doc-5I §3.6]
// → REFERENCE (`plan_id` resolves to a NON-retired plan else NOT_FOUND). Non-disclosure does NOT apply
// (platform-owned catalog) — a `404` simply means "no such plan_id" on this surface.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import { findPlanById } from "../../infrastructure/data/plan.repository";
import { derivePlanStatus } from "../../domain/policies/plan-status.policy";
import { entitlementTypeToWire } from "../../domain/read-models/plan.read-model";
import type {
  GetPlanKey,
  GetPlanOutcome,
  PlanEntitlementValue,
  PlanView,
} from "../../contracts/types";

/**
 * `billing.get_plan.v1` — read one non-retired plan (+ its bundled entitlements) by id. Malformed
 * `plan_id` → SYNTAX (`invalidInput`); absent/retired → `{ found: false }` (→ `404`).
 */
export async function getPlan(key: GetPlanKey, db: DbExecutor = prisma): Promise<GetPlanOutcome> {
  // SYNTAX — a malformed `plan_id` never reaches repository resolution (Doc-4I §HB-1.4 Stage 1).
  if (!UUID_PATTERN.test(key.planId)) {
    return { found: false, invalidInput: true };
  }

  const row = await findPlanById(key.planId, db);
  if (row === null) {
    return { found: false };
  }

  const plan: PlanView = {
    planId: row.id,
    name: row.name,
    billingCycle: row.billingCycle,
    price: row.price,
    currency: row.currency,
    status: derivePlanStatus(row),
    isActive: row.isActive,
    entitlements: row.entitlements.map((e) => ({
      entitlementId: e.entitlementId,
      slug: e.slug,
      type: entitlementTypeToWire(e.type),
      // `value_jsonb` is a plan-bundled entitlement value (boolean | integer | string — Doc-4I §HB-1.4).
      value: e.value as PlanEntitlementValue,
    })),
  };

  return { found: true, plan };
}
