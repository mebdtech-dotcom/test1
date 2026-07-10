// M1 api (PRIVATE) — the HTTP wire mapping for `identity.get_active_context.v1`
// (Doc-4C §C8 → `GET /identity/active_context` → `200`; Doc-5C §6.1 row 30). Pure (no I/O).
//
// Non-disclosure: a resolved-but-absent context and the fail-closed `null` (no active MEMBERSHIP context —
// Doc-5C §3.3 membership-only; NOT an org_status check, so a suspended org can still resolve — the `switch`
// gates org-not-suspended) map to ONE `404` (`identity_context_not_found`, §C8 PassB:549). The projection
// is the caller's OWN context only (PassB:550 "never another user's").

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type { ActiveContextView, GetActiveContextResult } from "@/modules/identity/contracts";

/**
 * Map a resolved `identity.get_active_context.v1` outcome to its Doc-5A wire response: `200` with the
 * FROZEN §C8 projection (`result` = the active-context view, exactly the frozen field set) or the `404`
 * no-active-context collapse (frozen §C8 register `identity_context_not_found`).
 */
export function mapGetActiveContext(
  outcome: GetActiveContextResult | null,
): WireResponse<ActiveContextView> {
  if (outcome !== null && outcome.found) {
    return successResponse(outcome.context, 200);
  }
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: "identity_context_not_found",
    message: "Not found.",
    retryable: false,
  });
}
