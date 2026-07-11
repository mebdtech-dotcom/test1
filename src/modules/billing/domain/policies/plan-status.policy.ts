// M7 domain (PRIVATE) — the SINGLE place the plan `status` derivation + the public-read visibility
// predicate are expressed in TypeScript (mirrors M2's `vendor-visibility.policy.ts`). Bound to Doc-2
// §10.8 (`plans` has NO `status` column) + Doc-2 §3.8 (`draft → active → retired`) + Doc-6I §3.x RLS.
//
// DERIVATION (Doc-2 §10.8 — status is derived from `is_active` + soft-delete, never stored):
//   retired ⟺ deleted_at IS NOT NULL   (Doc-6I: "SD = retire")
//   active  ⟺ is_active AND deleted_at IS NULL
//   draft   ⟺ NOT is_active AND deleted_at IS NULL
//
// VISIBILITY (`isPlanPubliclyVisible`) is the TypeScript twin of the `plans_public_read` RLS predicate
// (`deleted_at IS NULL`): a retired (soft-deleted) plan is NOT visible to a non-staff reader. The
// catalog reads scope to this SAME set so app-layer and RLS never diverge. The Doc-5I §4 "retired
// visible to all authenticated users" clause is the deferred `[ESC-BILL-RETIRE-VIS]` divergence
// (`esc_registry.md`) — NOT resolved here; this slice reads only the RLS-visible non-retired catalog.

import type { PlanStatus } from "../../contracts/types";

/** The two `plans` columns that determine both the derived status and public visibility. */
export interface PlanStatusInputs {
  isActive: boolean;
  deletedAt: Date | null;
}

/** Derive the logical Doc-2 §3.8 plan status from the stored (`is_active`, `deleted_at`) pair. */
export function derivePlanStatus({ isActive, deletedAt }: PlanStatusInputs): PlanStatus {
  if (deletedAt !== null) return "retired";
  return isActive ? "active" : "draft";
}

/**
 * Is this plan visible on the public (non-staff) catalog surface? TRUE iff not soft-deleted — the
 * TypeScript literal of `plans_public_read`'s `USING (deleted_at IS NULL)` (retired ⇒ hidden). This is
 * the ONLY place the boolean is expressed; the repository's SQL `WHERE` encodes the same fact.
 */
export function isPlanPubliclyVisible({ deletedAt }: Pick<PlanStatusInputs, "deletedAt">): boolean {
  return deletedAt === null;
}
