// App-layer COMPOSITION for the BC-BILL-1 Admin entitlement/bundle writes (W3-BILL-3; Doc-5I §4 —
// `POST /billing/entitlements` · 201, `POST /billing/entitlements/{id}/update-entitlement` · 200,
// `POST /billing/plans/{plan_id}/bundle-plan-entitlement` · 200). Same platform-staff pattern as the plan
// writes (session→401 · SYNTAX→400 · provision · staff→run | non-staff→403), with per-contract error codes.

import { ensureProvisioned } from "@/server/auth";
import { resolveStaffContext } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  bundlePlanEntitlement,
  catalogWriteForbidden,
  catalogWriteInvalidInput,
  createEntitlement,
  mapBundlePlanEntitlement,
  mapCreateEntitlement,
  mapUpdateEntitlement,
  updateEntitlement,
  validateBundlePlanEntitlementInput,
  validateCreateEntitlementInput,
  validateUpdateEntitlementInput,
  BUNDLE_WRITE_FORBIDDEN,
  BUNDLE_WRITE_INVALID_INPUT,
  ENTITLEMENT_WRITE_FORBIDDEN,
  ENTITLEMENT_WRITE_INVALID_INPUT,
  type AdminCatalogContext,
  type BundlePlanEntitlementInput,
  type BundlePlanEntitlementResult,
  type CreateEntitlementInput,
  type EntitlementView,
  type UpdateEntitlementInput,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";
import type { CatalogWriteHandlerDeps } from "./plan-catalog-write.route-handler";

/** The staff-gate skeleton (per-contract error codes): session→401 · SYNTAX→400 · provision · staff | 403. */
async function runStaffGated<TResult>(
  deps: CatalogWriteHandlerDeps,
  codes: { invalid: string; forbidden: string },
  validate: () => string | null,
  run: (ctx: AdminCatalogContext) => Promise<WireResponse<TResult>>,
): Promise<WireResponse<TResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  const syntaxFailure = validate();
  if (syntaxFailure !== null) {
    return catalogWriteInvalidInput(codes.invalid, syntaxFailure);
  }

  await deps.ensureProvisioned(session);

  const staff = await (deps.resolveStaffContext ?? resolveStaffContext)(session);
  if (staff === null) {
    return catalogWriteForbidden(codes.forbidden);
  }

  return run({
    adminUserId: staff.userId,
    isPlatformStaff: staff.isPlatformStaff,
    ipAddress: deps.ipAddress ?? null,
    userAgent: deps.userAgent ?? null,
  });
}

/** `POST /billing/entitlements` — `billing.create_entitlement.v1`. */
export function handleCreateEntitlement(
  input: CreateEntitlementInput,
  deps: CatalogWriteHandlerDeps,
): Promise<WireResponse<EntitlementView>> {
  return runStaffGated(
    deps,
    { invalid: ENTITLEMENT_WRITE_INVALID_INPUT, forbidden: ENTITLEMENT_WRITE_FORBIDDEN },
    () => validateCreateEntitlementInput(input),
    async (ctx) => mapCreateEntitlement(await createEntitlement(input, ctx, { appendAuditRecord })),
  );
}

/** `POST /billing/entitlements/{entitlement_id}/update-entitlement` — `billing.update_entitlement.v1`. */
export function handleUpdateEntitlement(
  input: UpdateEntitlementInput,
  deps: CatalogWriteHandlerDeps,
): Promise<WireResponse<EntitlementView>> {
  return runStaffGated(
    deps,
    { invalid: ENTITLEMENT_WRITE_INVALID_INPUT, forbidden: ENTITLEMENT_WRITE_FORBIDDEN },
    () => validateUpdateEntitlementInput(input),
    async (ctx) => mapUpdateEntitlement(await updateEntitlement(input, ctx, { appendAuditRecord })),
  );
}

/** `POST /billing/plans/{plan_id}/bundle-plan-entitlement` — `billing.bundle_plan_entitlement.v1`. */
export function handleBundlePlanEntitlement(
  input: BundlePlanEntitlementInput,
  deps: CatalogWriteHandlerDeps,
): Promise<WireResponse<BundlePlanEntitlementResult>> {
  return runStaffGated(
    deps,
    { invalid: BUNDLE_WRITE_INVALID_INPUT, forbidden: BUNDLE_WRITE_FORBIDDEN },
    () => validateBundlePlanEntitlementInput(input),
    async (ctx) =>
      mapBundlePlanEntitlement(await bundlePlanEntitlement(input, ctx, { appendAuditRecord })),
  );
}
