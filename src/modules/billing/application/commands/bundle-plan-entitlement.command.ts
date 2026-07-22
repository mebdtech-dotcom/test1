// M7 application (PRIVATE) — `billing.bundle_plan_entitlement.v1` (Doc-4I §HB-1.2 / Doc-5I §4
// `POST /billing/plans/{plan_id}/bundle-plan-entitlement` · 200). W3-BILL-3. Admin audited write.
//
// Maps a plan → an entitlement with a per-plan `value_jsonb`. IDEMPOTENT UPSERT on the composite PK
// (`plan_id`+`entitlement_id`) — re-bundling refreshes `value_jsonb`, never a new row (Doc-5I §4). REFERENCE
// 422 if either id does not resolve (any state — NO retired-plan STATE guard, Doc-5I §4). No CONFLICT/STATE.
// Audit `entity_type=plan_entitlements`, `entity_id=plan_id` (the Plan aggregate root; both ids in newValue).

import { prisma } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import { loadPlanWriteRow } from "../../infrastructure/data/plan-catalog-write.repository";
import {
  entitlementExists,
  upsertPlanEntitlement,
} from "../../infrastructure/data/entitlement-catalog-write.repository";
import {
  PLAN_ENTITLEMENT_ENTITY_TYPE,
  PlanEntitlementAuditAction,
} from "../../domain/audit-actions";
import {
  buildCatalogAuditInput,
  catalogErr,
  pinStaffContext,
  requireStaff,
  BUNDLE_WRITE_INVALID_INPUT,
  BUNDLE_WRITE_REFERENCE,
  type AdminCatalogContext,
  type AdminCatalogDeps,
} from "./_catalog-write";
import type {
  BundlePlanEntitlementInput,
  BundlePlanEntitlementOutcome,
} from "../../contracts/types";

/** SYNTAX validation — `plan_id`/`entitlement_id` uuid; `value_jsonb` present. */
export function validateBundlePlanEntitlementInput(
  input: BundlePlanEntitlementInput,
): string | null {
  if (typeof input.planId !== "string" || !UUID_PATTERN.test(input.planId)) {
    return "plan_id must be a valid UUID.";
  }
  if (typeof input.entitlementId !== "string" || !UUID_PATTERN.test(input.entitlementId)) {
    return "entitlement_id must be a valid UUID.";
  }
  if (input.valueJsonb === undefined) return "value_jsonb is required.";
  return null;
}

/** Upsert a plan↔entitlement bundle (Doc-4I §HB-1.2). Upsert + Admin audit share ONE staff-GUC tx (D7). */
export async function bundlePlanEntitlementCommand(
  input: BundlePlanEntitlementInput,
  ctx: AdminCatalogContext,
  deps: AdminCatalogDeps,
  db: typeof prisma = prisma,
): Promise<BundlePlanEntitlementOutcome> {
  const invalid = validateBundlePlanEntitlementInput(input);
  if (invalid !== null) return catalogErr("VALIDATION", BUNDLE_WRITE_INVALID_INPUT, invalid);

  const denied = requireStaff(ctx);
  if (denied !== null) return denied;

  return db.$transaction(async (tx) => {
    await pinStaffContext(tx, ctx.adminUserId);

    // REFERENCE — both ids resolve in the catalog (any state; the bundle has no retired-plan STATE guard).
    const plan = await loadPlanWriteRow(input.planId, tx);
    if (plan === null) return catalogErr("REFERENCE", BUNDLE_WRITE_REFERENCE, "Plan not found.");
    if (!(await entitlementExists(input.entitlementId, tx))) {
      return catalogErr("REFERENCE", BUNDLE_WRITE_REFERENCE, "Entitlement not found.");
    }

    await upsertPlanEntitlement(
      {
        planId: input.planId,
        entitlementId: input.entitlementId,
        valueJsonb: input.valueJsonb,
        actorUserId: ctx.adminUserId,
      },
      tx,
    );

    await deps.appendAuditRecord(
      buildCatalogAuditInput(ctx, {
        entityType: PLAN_ENTITLEMENT_ENTITY_TYPE,
        entityId: input.planId,
        action: PlanEntitlementAuditAction.BUNDLED,
        oldValue: null,
        newValue: { plan_id: input.planId, entitlement_id: input.entitlementId },
      }),
      tx,
    );

    return {
      ok: true as const,
      result: { planId: input.planId, entitlementId: input.entitlementId },
    };
  });
}
