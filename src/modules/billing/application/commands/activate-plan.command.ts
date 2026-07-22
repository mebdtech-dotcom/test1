// M7 application (PRIVATE) — `billing.activate_plan.v1` (Doc-4I §HB-1.1a ActivatePlan patch / Doc-5I §4
// `POST /billing/plans/{plan_id}/activate-plan` · 200). W3-BILL-2. Admin audited write; NO org; NO §8 event.
//
// MODEL B: `draft → active` = SET is_active=true (Doc-6I §3.1.1). expected_status must be `draft` (SYNTAX).
// STATE vs CONFLICT (Doc-4A §12.4): the LOADED row decides STATE (source not draft — a stable illegal
// edge); the CAS `count === 0` on a confirmed-draft row decides CONFLICT (a concurrent writer won).

import { prisma } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import {
  activatePlanCas,
  loadPlanWriteRow,
} from "../../infrastructure/data/plan-catalog-write.repository";
import { derivePlanStatus } from "../../domain/policies/plan-status.policy";
import { PLAN_ENTITY_TYPE, PlanCatalogAuditAction } from "../../domain/audit-actions";
import {
  buildPlanAuditInput,
  catalogErr,
  pinStaffContext,
  requireStaff,
  PLAN_WRITE_CONFLICT,
  PLAN_WRITE_ILLEGAL_STATE,
  PLAN_WRITE_INVALID_INPUT,
  PLAN_WRITE_REFERENCE,
  type AdminCatalogContext,
  type AdminCatalogDeps,
} from "./_catalog-write";
import type { ActivatePlanInput, ActivatePlanOutcome } from "../../contracts/types";

/** SYNTAX validation (Doc-4A §11.2 category 1). `expected_status` must be `draft` (§HB-1.1a). */
export function validateActivatePlanInput(input: ActivatePlanInput): string | null {
  if (typeof input.planId !== "string" || !UUID_PATTERN.test(input.planId)) {
    return "plan_id must be a valid UUID.";
  }
  if (input.expectedStatus !== "draft") return "expected_status must be draft.";
  return null;
}

/** Publish a plan `draft → active` (Doc-4I §HB-1.1a). Write + Admin audit share ONE staff-GUC tx (D7). */
export async function activatePlanCommand(
  input: ActivatePlanInput,
  ctx: AdminCatalogContext,
  deps: AdminCatalogDeps,
  db: typeof prisma = prisma,
): Promise<ActivatePlanOutcome> {
  const invalid = validateActivatePlanInput(input);
  if (invalid !== null) return catalogErr("VALIDATION", PLAN_WRITE_INVALID_INPUT, invalid);

  const denied = requireStaff(ctx);
  if (denied !== null) return denied;

  return db.$transaction(async (tx) => {
    await pinStaffContext(tx, ctx.adminUserId);

    const row = await loadPlanWriteRow(input.planId, tx);
    if (row === null) return catalogErr("REFERENCE", PLAN_WRITE_REFERENCE, "Plan not found.");

    // STATE — activate is legal only from `draft` (a stable illegal edge from active/retired).
    const current = derivePlanStatus(row);
    if (current !== "draft") {
      return catalogErr(
        "STATE",
        PLAN_WRITE_ILLEGAL_STATE,
        `Cannot activate a ${current} plan (only a draft plan can be activated).`,
      );
    }

    // CAS — `draft → active`; a `count === 0` here means a concurrent writer flipped it (lost race).
    const count = await activatePlanCas(input.planId, ctx.adminUserId, tx);
    if (count === 0) {
      return catalogErr(
        "CONFLICT",
        PLAN_WRITE_CONFLICT,
        "The plan was modified concurrently; reload and retry.",
      );
    }

    await deps.appendAuditRecord(
      buildPlanAuditInput(ctx, {
        entityType: PLAN_ENTITY_TYPE,
        entityId: input.planId,
        action: PlanCatalogAuditAction.ACTIVATED,
        oldValue: { status: "draft" },
        newValue: { status: "active" },
      }),
      tx,
    );

    return { ok: true as const, result: { planId: input.planId, status: "active" as const } };
  });
}
