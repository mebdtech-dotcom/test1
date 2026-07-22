// App-layer COMPOSITION for the BC-BILL-1 Admin plan-catalog writes (W3-BILL-2; Doc-5I §4 —
// `POST /billing/plans` · 201, and `POST /billing/plans/{plan_id}/{activate|update|retire}-plan` · 200).
// REPOSITORY_STRUCTURE §5/§8. The set-user-account-status (Doc-5C §4.1 row 4) precedent — platform-staff,
// NO org context:
//
//   1. Resolve the Supabase session (injectable). Unauthenticated → the DC-4 auth-boundary `401`.
//   2. SYNTAX FIRST (Doc-4A §11.2 fixed order — the exported validator): a syntactically invalid request
//      is `400` for EVERY caller, staff or not (before the staff gate).
//   3. `ensureProvisioned(session)` — lazy first-login identity materialization.
//   4. AFFIRMATIVE leg: the server-derived platform-staff basis via `resolveStaffContext` (Doc-5C §3.2).
//      PRODUCTION default = the DC-3 FAIL-CLOSED resolver (no staff roster in Wave 2 — no principal ever
//      resolves); tests inject a staff context to exercise the allow leg. Staff → run the command (which
//      owns its staff-GUC transaction + Admin-attributed audit) → map the outcome.
//   5. NEGATIVE leg: every non-staff caller → an UNCONDITIONAL `403` deny-by-construction ([ESC-BILL-SLUG]
//      — there is NO billing-catalog slug to check; the staff basis IS the authority, never an org role).
//
// BOUNDARY: imports `src/server/auth` + `src/server/context` + `@/modules/core/contracts`
// (`appendAuditRecord`) + `@/modules/billing/contracts` + `@/shared/http` only.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveStaffContext, type ResolveStaffContext } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  activatePlan,
  createPlan,
  mapActivatePlan,
  mapCreatePlan,
  mapRetirePlan,
  mapUpdatePlan,
  planWriteForbidden,
  planWriteInvalidInput,
  retirePlan,
  updatePlan,
  validateActivatePlanInput,
  validateCreatePlanInput,
  validateRetirePlanInput,
  validateUpdatePlanInput,
  type ActivatePlanInput,
  type AdminCatalogContext,
  type CreatePlanInput,
  type CreatePlanResult,
  type PlanLifecycleResult,
  type RetirePlanInput,
  type UpdatePlanInput,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the catalog-write compositions. All injectable (defaults bind production wiring). */
export interface CatalogWriteHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The server-side staff-principal resolution port (default: the DC-3 FAIL-CLOSED resolver). */
  resolveStaffContext?: ResolveStaffContext;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** The shared staff-gate skeleton: session→401 · SYNTAX→400 · provision · staff→run | non-staff→403. */
async function runStaffGated<TResult>(
  deps: CatalogWriteHandlerDeps,
  validate: () => string | null,
  run: (ctx: AdminCatalogContext) => Promise<WireResponse<TResult>>,
): Promise<WireResponse<TResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  const syntaxFailure = validate();
  if (syntaxFailure !== null) {
    return planWriteInvalidInput(syntaxFailure);
  }

  await deps.ensureProvisioned(session);

  const staff = await (deps.resolveStaffContext ?? resolveStaffContext)(session);
  if (staff === null) {
    // Unconditional deny-by-construction for every non-staff caller ([ESC-BILL-SLUG] — no slug to check).
    return planWriteForbidden();
  }

  return run({
    adminUserId: staff.userId,
    isPlatformStaff: staff.isPlatformStaff,
    ipAddress: deps.ipAddress ?? null,
    userAgent: deps.userAgent ?? null,
  });
}

/** `POST /billing/plans` — `billing.create_plan.v1`. */
export function handleCreatePlan(
  input: CreatePlanInput,
  deps: CatalogWriteHandlerDeps,
): Promise<WireResponse<CreatePlanResult>> {
  return runStaffGated(
    deps,
    () => validateCreatePlanInput(input),
    async (ctx) => mapCreatePlan(await createPlan(input, ctx, { appendAuditRecord })),
  );
}

/** `POST /billing/plans/{plan_id}/activate-plan` — `billing.activate_plan.v1`. */
export function handleActivatePlan(
  input: ActivatePlanInput,
  deps: CatalogWriteHandlerDeps,
): Promise<WireResponse<PlanLifecycleResult>> {
  return runStaffGated(
    deps,
    () => validateActivatePlanInput(input),
    async (ctx) => mapActivatePlan(await activatePlan(input, ctx, { appendAuditRecord })),
  );
}

/** `POST /billing/plans/{plan_id}/update-plan` — `billing.update_plan.v1`. */
export function handleUpdatePlan(
  input: UpdatePlanInput,
  deps: CatalogWriteHandlerDeps,
): Promise<WireResponse<PlanLifecycleResult>> {
  return runStaffGated(
    deps,
    () => validateUpdatePlanInput(input),
    async (ctx) => mapUpdatePlan(await updatePlan(input, ctx, { appendAuditRecord })),
  );
}

/** `POST /billing/plans/{plan_id}/retire-plan` — `billing.retire_plan.v1`. */
export function handleRetirePlan(
  input: RetirePlanInput,
  deps: CatalogWriteHandlerDeps,
): Promise<WireResponse<PlanLifecycleResult>> {
  return runStaffGated(
    deps,
    () => validateRetirePlanInput(input),
    async (ctx) => mapRetirePlan(await retirePlan(input, ctx, { appendAuditRecord })),
  );
}
