// App-layer COMPOSITION for `billing.list_plans.v1` (W3-BILL-1; Doc-5I §4 — `GET /billing/plans` · 200).
// REPOSITORY_STRUCTURE §5/§8. Mirrors `src/server/marketplace/list-vendor-directory.route-handler.ts`
// (the SYNTAX-owning filter-allowlist composition) PLUS the session→401 auth gate (Doc-5I §3.6).
//
// Composition:
//   1. Resolve the Supabase session (injectable). Unauthenticated → the DC-4 auth-boundary `401`.
//   2. SYNTAX (Doc-4A §11.2 cat. 1 / Doc-5A §8.3): reject any `filter[<field>]` outside the Doc-4I
//      §HB-1.4 allowlist, and any out-of-range `billing_cycle`/`status`/`is_active`, BEFORE the typed
//      request reaches the M7 query (which independently re-validates each accepted field).
//   3. Read the platform-owned catalog via the M7 contract (context-free — see get-plan.route-handler.ts).

import type { AuthSession } from "@/server/auth";
import {
  listPlans,
  mapListPlans,
  type BillingCycle,
  type ListPlansFilters,
  type ListPlansOutcome,
  type ListPlansRequest,
  type ListPlansResult,
  type PlanStatus,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** The RAW wire query dimensions (route-extracted, unvalidated — this composition owns SYNTAX). */
export interface ListPlansWireInput {
  /** `filter[<field>]` query params, bracket-key already stripped by the `app/` route entry. */
  filters: Record<string, string>;
  cursor?: string;
  pageSize?: string;
}

/** Dependencies for the list-plans composition. Injectable (default binds the live session in the route). */
export interface ListPlansHandlerDeps {
  resolveSession: ResolveSession;
}

// Doc-4I §HB-1.4 filter allowlist.
const ALLOWED_FILTER_KEYS = new Set(["billing_cycle", "is_active", "status"]);
const BILLING_CYCLES = new Set<string>(["monthly", "annual"]);
const PLAN_STATUSES = new Set<string>(["draft", "active", "retired"]);

function invalidInput(): WireResponse<ListPlansResult> {
  const outcome: ListPlansOutcome = { invalidInput: true };
  return mapListPlans(outcome);
}

/**
 * `GET /billing/plans` — the paginated authenticated plan-catalog read (Doc-4I §HB-1.4 / Doc-5I §4).
 */
export async function handleListPlans(
  input: ListPlansWireInput,
  deps: ListPlansHandlerDeps,
): Promise<WireResponse<ListPlansResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX — undeclared filter field (Doc-5A §8.3) → 400, before any typed request is built.
  for (const key of Object.keys(input.filters)) {
    if (!ALLOWED_FILTER_KEYS.has(key)) {
      return invalidInput();
    }
  }
  if (
    input.filters.billing_cycle !== undefined &&
    !BILLING_CYCLES.has(input.filters.billing_cycle)
  ) {
    return invalidInput();
  }
  if (input.filters.status !== undefined && !PLAN_STATUSES.has(input.filters.status)) {
    return invalidInput();
  }

  // `is_active` — the wire carries "true"/"false"; anything else is a SYNTAX 400.
  let isActive: boolean | undefined;
  if (input.filters.is_active !== undefined) {
    if (input.filters.is_active === "true") isActive = true;
    else if (input.filters.is_active === "false") isActive = false;
    else return invalidInput();
  }

  let pageSize: number | undefined;
  if (input.pageSize !== undefined) {
    const parsed = Number(input.pageSize);
    if (!Number.isFinite(parsed)) {
      return invalidInput();
    }
    pageSize = parsed;
  }

  const filters: ListPlansFilters = {
    ...(input.filters.billing_cycle !== undefined
      ? { billingCycle: input.filters.billing_cycle as BillingCycle }
      : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(input.filters.status !== undefined ? { status: input.filters.status as PlanStatus } : {}),
  };

  const request: ListPlansRequest = {
    ...(Object.keys(filters).length > 0 ? { filters } : {}),
    ...(input.cursor !== undefined ? { cursor: input.cursor } : {}),
    ...(pageSize !== undefined ? { pageSize } : {}),
  };

  const outcome = await listPlans(request);
  return mapListPlans(outcome);
}
