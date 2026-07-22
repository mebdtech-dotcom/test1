// M7 application (PRIVATE) — `billing.create_plan.v1` (Doc-4I §HB-1.1 / Doc-5I §4 `POST /billing/plans` ·
// 201 + Location). W3-BILL-2. Admin (platform-staff, 21.6) audited write; NO org context; NO §8 event.
//
// Validation (Doc-4I §HB-1.1): SYNTAX (name/billing_cycle/price/currency) → CONTEXT/AUTHZ (staff basis —
// composition edge + the fail-closed re-check here). MODEL B: a create always mints a `draft` (is_active=
// false) — `is_active` is NOT accepted (it is the status discriminator, changed only by `activate_plan`).
// The insert + the Admin-attributed audit share ONE staff-GUC transaction (D7).

import { prisma } from "../../../../shared/db";
import { insertPlan } from "../../infrastructure/data/plan-catalog-write.repository";
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
  PLAN_WRITE_INVALID_INPUT,
  type AdminCatalogContext,
  type AdminCatalogDeps,
} from "./_catalog-write";
import type { CreatePlanInput, CreatePlanOutcome } from "../../contracts/types";

/** SYNTAX validation (Doc-4A §11.2 category 1). Exported so the composition edge runs the SAME validator
 *  FIRST; the command re-runs it (single source, no re-derivation). Returns a message, or `null`. */
export function validateCreatePlanInput(input: CreatePlanInput): string | null {
  const nameFail = validatePlanName(input.name);
  if (nameFail !== null) return nameFail;
  if (!isValidBillingCycle(input.billingCycle))
    return "billing_cycle must be one of: monthly, annual.";
  if (!isValidPrice(input.price)) return "price is required (a non-negative decimal string).";
  if (!isValidCurrency(input.currency))
    return "currency is required (ISO 4217 — 3 uppercase letters).";
  return null;
}

/**
 * Create a plan at `draft` (Doc-4I §HB-1.1). The insert and the Admin-attributed audit row share ONE
 * staff-GUC transaction (D7). `db` opens the transaction — pass the shared client (tests inject it).
 */
export async function createPlanCommand(
  input: CreatePlanInput,
  ctx: AdminCatalogContext,
  deps: AdminCatalogDeps,
  db: typeof prisma = prisma,
): Promise<CreatePlanOutcome> {
  const invalid = validateCreatePlanInput(input);
  if (invalid !== null) return catalogErr("VALIDATION", PLAN_WRITE_INVALID_INPUT, invalid);

  const denied = requireStaff(ctx);
  if (denied !== null) return denied;

  return db.$transaction(async (tx) => {
    await pinStaffContext(tx, ctx.adminUserId);

    const { planId } = await insertPlan(
      {
        name: input.name.trim(),
        billingCycle: input.billingCycle,
        price: input.price,
        currency: input.currency,
        actorUserId: ctx.adminUserId,
      },
      tx,
    );

    await deps.appendAuditRecord(
      buildPlanAuditInput(ctx, {
        entityType: PLAN_ENTITY_TYPE,
        entityId: planId,
        action: PlanCatalogAuditAction.CREATED,
        oldValue: null,
        newValue: {
          name: input.name.trim(),
          billing_cycle: input.billingCycle,
          price: input.price,
          currency: input.currency,
          status: "draft",
        },
      }),
      tx,
    );

    return { ok: true as const, result: { planId, status: "draft" as const } };
  });
}
