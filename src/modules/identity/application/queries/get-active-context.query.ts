// M1 application (PRIVATE) — `identity.get_active_context.v1` (Doc-4C §C8 · 21.3 Query · Actor: User).
// Orchestration only; owns NO state. Resolves the caller's CURRENT active context — self only (PassB:548
// "AUTHZ (self) → SCOPE (own context only)"; PassB:550 "never another user's context"). Reads unaudited
// (§17.1); no events; reads NO governance signal (firewall default).
//
// The `ctx` is the SERVER-VALIDATED active context (`src/server/context` `resolveActiveOrg` — from a
// confirmed ACTIVE membership; Doc-5C §3.3 makes the general predicate MEMBERSHIP-ONLY, so a suspended org
// CAN be the resolved context here — this is REQUIRED for §C5 `soft_delete_organization` over a §5.1
// suspended source; org-not-suspended is the `switch` BUSINESS check, not this read). The client never
// supplies the org (Invariant #5). Residual: `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` (Board completeness).

import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  getMembershipRow,
  resolveGrantedTenantSlugs,
} from "../../infrastructure/data/authz.repository";
import type { GetActiveContextResult, ActiveContextView } from "../../contracts/types";

/**
 * `identity.get_active_context.v1` (Doc-4C §C8 PassB:547). Project the caller's active context:
 * `{ organization_id, membership { state, role_id }, effective_permission_summary }`. The permission
 * summary is a PROJECTION OF `check_permission` RESOLUTION — the SAME org-anchored granted-slug read the
 * §C3 authorization root uses (`resolveGrantedTenantSlugs`), NOT an independent computation (PassB:552
 * "no shadow authz"). `found: false` ⇒ no active context (the NOT_FOUND collapse, §C8 register).
 */
export async function getActiveContext(
  ctx: { userId: string; activeOrgId: string },
  db: DbExecutor = prisma,
): Promise<GetActiveContextResult> {
  // The active context resolved from a confirmed ACTIVE membership — read its own row (state, role_id).
  const membership = await getMembershipRow(ctx.userId, ctx.activeOrgId, db);
  if (membership === null) {
    // Defensive: the context is resolved from an active membership, so this is unreachable in-wire; a
    // vanished membership fails closed to the no-context collapse (never a leaking error).
    return { found: false };
  }

  // effective_permission_summary — the resolved TENANT slugs for the active org, from the SAME read
  // `check_permission` performs (RV-0146 org-anchored granted set). Sorted for a deterministic wire list.
  const grantedSlugs = await resolveGrantedTenantSlugs(membership.roleId, ctx.activeOrgId, db);

  const view: ActiveContextView = {
    organizationId: ctx.activeOrgId,
    membership: { state: membership.state, roleId: membership.roleId },
    effectivePermissionSummary: [...grantedSlugs].sort(),
  };
  return { found: true, context: view };
}
