// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for the BC-BILL-1 Admin plan-catalog writes
// (create/activate/update/retire — Doc-4I §HB-1.1 + §HB-1.1a / Doc-5I §4). Maps each in-process command
// outcome to the Doc-5A wire envelope (§5.6 success / §6.1 error), choosing the §6.2 status from the
// module error class. Owns NO orchestration; pure (no I/O). BOUNDARY: imports `@/shared/http` + the M7
// contract TYPES + the module's write-code constants only.
//
//   - create  → `201` + `Location: /billing/plans/{plan_id}` (Doc-5I §4) + §5.6 envelope.
//   - activate/update/retire → `200` + §5.6 envelope (`{ plan_id, status }`).
//   - errors  → §6.2 status by class (VALIDATION 400 · AUTHORIZATION 403 · STATE/CONFLICT 409 ·
//               REFERENCE 422). Codes are the frozen `billing_<domain>_<code>` form (Doc-4A §H.4).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  ActivatePlanOutcome,
  CreatePlanOutcome,
  CreatePlanResult,
  PlanLifecycleResult,
  PlanWriteError,
  RetirePlanOutcome,
  UpdatePlanOutcome,
} from "@/modules/billing/contracts";
import {
  PLAN_WRITE_FORBIDDEN,
  PLAN_WRITE_INVALID_INPUT,
} from "../application/commands/_catalog-write";

/** Map a command failure to the Doc-5A §6.1 error envelope + §6.2 status. Only DEPENDENCY/SYSTEM retry.
 *  Shared across the plan + entitlement + bundle write handlers (W3-BILL-2/3). */
export function mapWriteError(error: PlanWriteError): WireResponse<never> {
  return errorResponse({
    error_class: error.errorClass,
    error_code: error.errorCode,
    message: error.message,
    retryable: error.errorClass === "DEPENDENCY" || error.errorClass === "SYSTEM",
  });
}

/** `billing.create_plan.v1` outcome → `201` + `Location` (Doc-5I §4) or the §6.1 error. */
export function mapCreatePlan(outcome: CreatePlanOutcome): WireResponse<CreatePlanResult> {
  if (outcome.ok) {
    const res = successResponse(outcome.result, 201);
    return { ...res, headers: { Location: `/billing/plans/${outcome.result.planId}` } };
  }
  return mapWriteError(outcome.error);
}

/** `billing.activate_plan.v1` outcome → `200` or the §6.1 error. */
export function mapActivatePlan(outcome: ActivatePlanOutcome): WireResponse<PlanLifecycleResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return mapWriteError(outcome.error);
}

/** `billing.update_plan.v1` outcome → `200` or the §6.1 error. */
export function mapUpdatePlan(outcome: UpdatePlanOutcome): WireResponse<PlanLifecycleResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return mapWriteError(outcome.error);
}

/** `billing.retire_plan.v1` outcome → `200` or the §6.1 error. */
export function mapRetirePlan(outcome: RetirePlanOutcome): WireResponse<PlanLifecycleResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return mapWriteError(outcome.error);
}

/** The composition-edge `400 VALIDATION` (SYNTAX runs BEFORE the staff gate — §11.2 fixed order). */
export function planWriteInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: PLAN_WRITE_INVALID_INPUT,
    message,
    retryable: false,
  });
}

/** The composition-edge `403` for a non-staff caller (unconditional deny-by-construction — [ESC-BILL-SLUG]). */
export function planWriteForbidden(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: PLAN_WRITE_FORBIDDEN,
    message: "Platform-staff authority required.",
    retryable: false,
  });
}
