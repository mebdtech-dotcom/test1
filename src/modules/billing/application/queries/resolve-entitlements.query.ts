// M7 application (PRIVATE, INTERNAL-SERVICE AUTHORITY) — `billing.resolve_entitlements.v1` (Doc-4I §HB-2.4).
// OUT-OF-WIRE (Doc-5I §10/R1/R10): NO HTTP surface, NOT on the cross-module contracts face — it is the
// intra-module "entitlement-resolution authority" consumed by BC-BILL-3 quota enforcement (which consumes
// this truth but never resolves it). W3-BILL-5.
//
// Resolution (Doc-4I §HB-2.4 §7): the org's `active` subscription → its `plan_id` → the BC-BILL-1
// `plan_entitlements` bundle (⋈ `entitlements`). If the org has NO `active` subscription, return the Basic
// profile (A-11) — realized as a STATIC EMPTY grant set. This is deliberate: the billing firewall bars
// plan-name gating (Doc-2 §2 M7 / Invariant #10), so the Basic profile can NEVER be a "plan named Basic"
// lookup; and no concrete Basic quota values are frozen (A-11 is an under-specified assumption) — inventing
// numbers here would coin POLICY (a Doc-3 concern), so the conservative empty profile is the faithful
// realization. A retired plan's entitlements STILL resolve for an existing active subscription (retirement
// blocks new subscriptions only — Doc-5I §4), so the bundle read applies no `deleted_at` plan filter.
//
// Read-only: NO audit (Doc-4I §HB-2.4 §9 — reads not audited), NO event, resolves no other BC's state.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { entitlementTypeToWire } from "../../domain/read-models/plan.read-model";
import {
  loadActiveSubscriptionPlanId,
  loadPlanEntitlementBundle,
} from "../../infrastructure/data/subscription.repository";
import type {
  PlanEntitlementValue,
  ResolveEntitlementsInput,
  ResolveEntitlementsResult,
  ResolvedEntitlement,
} from "../../contracts/types";

/**
 * Resolve the org's effective entitlements (Doc-4I §HB-2.4). `organizationId` is a server-resolved
 * Controlling Org (the intra-module caller passes it — the User-facing authz/scope gate is the caller's).
 * When `entitlementSlug` is supplied, only that single entitlement is resolved (still `active_subscription`
 * vs `basic_profile` by source). Returns the Basic (empty) profile when the org has no active subscription.
 */
export async function resolveEntitlements(
  input: ResolveEntitlementsInput,
  db: DbExecutor = prisma,
): Promise<ResolveEntitlementsResult> {
  const planId = await loadActiveSubscriptionPlanId(input.organizationId, db);

  // A-11 — no active subscription ⇒ the Basic profile (static empty grant set; never a plan-name lookup).
  if (planId === null) {
    return { organizationId: input.organizationId, entitlements: [], source: "basic_profile" };
  }

  const bundle = await loadPlanEntitlementBundle(planId, input.entitlementSlug, db);
  const entitlements: ResolvedEntitlement[] = bundle.map((row) => ({
    slug: row.slug,
    type: entitlementTypeToWire(row.type), // `enum_` (Prisma client) → `enum` (wire) — W3-BILL-3 convention.
    value: row.value as PlanEntitlementValue, // per-plan `plan_entitlements.value_jsonb` (bool|number|string).
  }));

  return { organizationId: input.organizationId, entitlements, source: "active_subscription" };
}
