// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for the BC-BILL-1 Admin entitlement/bundle writes
// (create/update entitlement + bundle_plan_entitlement — Doc-4I §HB-1.2/§HB-1.3 / Doc-5I §4). Maps each
// in-process command outcome to the Doc-5A envelope; reuses `mapWriteError` (shared with the plan writes).
// Pure (no I/O). BOUNDARY: `@/shared/http` + the M7 contract TYPES + the module's write-code constants.
//
//   - create_entitlement → `201` + `Location: /billing/entitlements/{id}` (Doc-5I §4).
//   - update_entitlement / bundle → `200`.
//   - errors → §6.2 status by class (VALIDATION 400 · AUTHORIZATION 403 · REFERENCE 422 · BUSINESS 422).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  BundlePlanEntitlementOutcome,
  BundlePlanEntitlementResult,
  CreateEntitlementOutcome,
  EntitlementView,
  UpdateEntitlementOutcome,
} from "@/modules/billing/contracts";
import { mapWriteError } from "./plan-catalog-write.handler";

/** `billing.create_entitlement.v1` outcome → `201` + `Location` (Doc-5I §4) or the §6.1 error. */
export function mapCreateEntitlement(
  outcome: CreateEntitlementOutcome,
): WireResponse<EntitlementView> {
  if (outcome.ok) {
    const res = successResponse(outcome.result, 201);
    return {
      ...res,
      headers: { Location: `/billing/entitlements/${outcome.result.entitlementId}` },
    };
  }
  return mapWriteError(outcome.error);
}

/** `billing.update_entitlement.v1` outcome → `200` or the §6.1 error. */
export function mapUpdateEntitlement(
  outcome: UpdateEntitlementOutcome,
): WireResponse<EntitlementView> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return mapWriteError(outcome.error);
}

/** `billing.bundle_plan_entitlement.v1` outcome → `200` or the §6.1 error. */
export function mapBundlePlanEntitlement(
  outcome: BundlePlanEntitlementOutcome,
): WireResponse<BundlePlanEntitlementResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return mapWriteError(outcome.error);
}

/** Composition-edge `400 VALIDATION` (SYNTAX before the staff gate) — parameterized by the domain code. */
export function catalogWriteInvalidInput(errorCode: string, message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: errorCode,
    message,
    retryable: false,
  });
}

/** Composition-edge `403` for a non-staff caller ([ESC-BILL-SLUG] deny-by-construction). */
export function catalogWriteForbidden(errorCode: string): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: errorCode,
    message: "Platform-staff authority required.",
    retryable: false,
  });
}
