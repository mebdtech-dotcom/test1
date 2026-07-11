// M7 application (PRIVATE) — `billing.update_plan.v1` (Doc-4I §HB-1.1 / Doc-5I §4
// `POST /billing/plans/{plan_id}/update-plan` · 200). W3-BILL-2. Admin audited write; NO org; NO §8 event.
//
// MARKETING-CONFIG MUTATION ONLY — Doc-5I §4: update_plan changes name/billing_cycle/price/currency and is
// NOT a status edge; under MODEL B it therefore does NOT touch `is_active` (the status discriminator, owned
// by `activate_plan`). A retired plan is terminal (STATE). `expected_status` ∈ {draft,active} is the
// optimistic-concurrency assertion: a mismatch on the loaded row → CONFLICT; a CAS `count === 0` → CONFLICT.

import { prisma } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import {
  loadPlanWriteRow,
  updatePlanMarketingCas,
} from "../../infrastructure/data/plan-catalog-write.repository";
import { derivePlanStatus } from "../../domain/policies/plan-status.policy";
import { PLAN_ENTITY_TYPE, PlanCatalogAuditAction } from "../../domain/audit-actions";
import {
  buildPlanAuditInput,
  catalogErr,
  isValidBillingCycle,
  isValidCurrency,
  isValidPrice,
  pinStaffContext,
  requireStaff,
  validatePlanName,
  PLAN_WRITE_CONFLICT,
  PLAN_WRITE_ILLEGAL_STATE,
  PLAN_WRITE_INVALID_INPUT,
  PLAN_WRITE_REFERENCE,
  type AdminCatalogContext,
  type AdminCatalogDeps,
} from "./_catalog-write";
import type { UpdatePlanInput, UpdatePlanOutcome } from "../../contracts/types";

/** SYNTAX validation — `plan_id` uuid, `expected_status` ∈ {draft,active}, ≥1 valid marketing field. */
export function validateUpdatePlanInput(input: UpdatePlanInput): string | null {
  if (typeof input.planId !== "string" || !UUID_PATTERN.test(input.planId)) {
    return "plan_id must be a valid UUID.";
  }
  if (input.expectedStatus !== "draft" && input.expectedStatus !== "active") {
    return "expected_status must be one of: draft, active.";
  }
  const provided =
    input.name !== undefined ||
    input.billingCycle !== undefined ||
    input.price !== undefined ||
    input.currency !== undefined;
  if (!provided) {
    return "at least one marketing field (name/billing_cycle/price/currency) is required.";
  }
  if (input.name !== undefined) {
    const nameFail = validatePlanName(input.name);
    if (nameFail !== null) return nameFail;
  }
  if (input.billingCycle !== undefined && !isValidBillingCycle(input.billingCycle)) {
    return "billing_cycle must be one of: monthly, annual.";
  }
  if (input.price !== undefined && !isValidPrice(input.price)) {
    return "price must be a non-negative decimal string.";
  }
  if (input.currency !== undefined && !isValidCurrency(input.currency)) {
    return "currency must be ISO 4217 (3 uppercase letters).";
  }
  return null;
}

/** Update a plan's marketing config (Doc-4I §HB-1.1). Write + Admin audit share ONE staff-GUC tx (D7). */
export async function updatePlanCommand(
  input: UpdatePlanInput,
  ctx: AdminCatalogContext,
  deps: AdminCatalogDeps,
  db: typeof prisma = prisma,
): Promise<UpdatePlanOutcome> {
  const invalid = validateUpdatePlanInput(input);
  if (invalid !== null) return catalogErr("VALIDATION", PLAN_WRITE_INVALID_INPUT, invalid);

  const denied = requireStaff(ctx);
  if (denied !== null) return denied;

  return db.$transaction(async (tx) => {
    await pinStaffContext(tx, ctx.adminUserId);

    const row = await loadPlanWriteRow(input.planId, tx);
    if (row === null) return catalogErr("REFERENCE", PLAN_WRITE_REFERENCE, "Plan not found.");

    const current = derivePlanStatus(row);
    // STATE — a retired plan is terminal (Doc-5I §4 "editing a retired plan → 409 STATE").
    if (current === "retired") {
      return catalogErr(
        "STATE",
        PLAN_WRITE_ILLEGAL_STATE,
        "A retired plan is terminal and cannot be updated.",
      );
    }
    // CONFLICT — the optimistic assertion (`expected_status`) did not match the loaded status.
    if (current !== input.expectedStatus) {
      return catalogErr(
        "CONFLICT",
        PLAN_WRITE_CONFLICT,
        "expected_status does not match the plan's current status; reload and retry.",
      );
    }

    const expectedActive = input.expectedStatus === "active";
    const count = await updatePlanMarketingCas(
      input.planId,
      expectedActive,
      {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.billingCycle !== undefined ? { billingCycle: input.billingCycle } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
      },
      ctx.adminUserId,
      tx,
    );
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
        action: PlanCatalogAuditAction.UPDATED,
        oldValue: { status: current },
        newValue: {
          status: current, // marketing update — status unchanged (no edge)
          ...(input.name !== undefined ? { name: input.name.trim() } : {}),
          ...(input.billingCycle !== undefined ? { billing_cycle: input.billingCycle } : {}),
          ...(input.price !== undefined ? { price: input.price } : {}),
          ...(input.currency !== undefined ? { currency: input.currency } : {}),
        },
      }),
      tx,
    );

    return { ok: true as const, result: { planId: input.planId, status: current } };
  });
}
