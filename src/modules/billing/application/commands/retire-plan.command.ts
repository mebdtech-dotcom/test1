// M7 application (PRIVATE) — `billing.retire_plan.v1` (Doc-4I §HB-1.1 / Doc-5I §4
// `POST /billing/plans/{plan_id}/retire-plan` · 200). W3-BILL-2. Admin audited write; NO org; NO §8 event.
//
// MODEL B: `active|draft → retired` = soft-delete (`SD = retire`, Doc-6I §3.1.1). `retired` is terminal
// (Doc-5I §4 — no re-activation/un-retire; any repeat → STATE). `expected_status` ∈ {draft,active} is the
// optimistic-concurrency assertion (mismatch on the loaded row → CONFLICT; CAS `count === 0` → CONFLICT).
// Doc-4I §HB-1.1 declares no `reason` input, so `delete_reason` is left null (nothing coined).

import { prisma } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import {
  loadPlanWriteRow,
  retirePlanCas,
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
import type { RetirePlanInput, RetirePlanOutcome } from "../../contracts/types";

/** SYNTAX validation — `plan_id` uuid, `expected_status` ∈ {draft,active}. */
export function validateRetirePlanInput(input: RetirePlanInput): string | null {
  if (typeof input.planId !== "string" || !UUID_PATTERN.test(input.planId)) {
    return "plan_id must be a valid UUID.";
  }
  if (input.expectedStatus !== "draft" && input.expectedStatus !== "active") {
    return "expected_status must be one of: draft, active.";
  }
  return null;
}

/** Retire a plan `active|draft → retired` (Doc-4I §HB-1.1). Write + Admin audit share ONE staff-GUC tx (D7). */
export async function retirePlanCommand(
  input: RetirePlanInput,
  ctx: AdminCatalogContext,
  deps: AdminCatalogDeps,
  db: typeof prisma = prisma,
): Promise<RetirePlanOutcome> {
  const invalid = validateRetirePlanInput(input);
  if (invalid !== null) return catalogErr("VALIDATION", PLAN_WRITE_INVALID_INPUT, invalid);

  const denied = requireStaff(ctx);
  if (denied !== null) return denied;

  return db.$transaction(async (tx) => {
    await pinStaffContext(tx, ctx.adminUserId);

    const row = await loadPlanWriteRow(input.planId, tx);
    if (row === null) return catalogErr("REFERENCE", PLAN_WRITE_REFERENCE, "Plan not found.");

    const current = derivePlanStatus(row);
    // STATE — `retired` is terminal (a stable illegal edge).
    if (current === "retired") {
      return catalogErr(
        "STATE",
        PLAN_WRITE_ILLEGAL_STATE,
        "The plan is already retired (terminal).",
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
    const count = await retirePlanCas(input.planId, expectedActive, ctx.adminUserId, null, tx);
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
        action: PlanCatalogAuditAction.RETIRED,
        oldValue: { status: current },
        newValue: { status: "retired" },
      }),
      tx,
    );

    return { ok: true as const, result: { planId: input.planId, status: "retired" as const } };
  });
}
