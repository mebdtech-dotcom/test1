// M1 api (PRIVATE) — the HTTP wire mappings for the two CALLER-FACING §C13 growth-invitation
// contracts (Doc-4C v1.0.3 §C13 → Doc-5C v1.0.1 rows 36–37). P1 Growth Hub M1 core slice. Pure
// mappers — no orchestration, no I/O. One-Owner placement: M1 owns how its writes become HTTP.
// (`resolve_invitation_delivery_payload` is OUT-OF-WIRE — internal-service, M6 sole caller; it has
// NO mapper here by design — Doc-5C v1.0.1 §4 / conformance row G-5.)
//
// Doc-5C v1.0.1 realization notes bound here:
//   • Row 36 `201` carries NO `Location` header — EXPRESSLY WAIVED [realization convention,
//     flagged on the fold record]: no `GET /identity/growth_invitations/{id}` wire row exists in
//     the stamped set, so a `Location` target would dangle (Doc-5C v1.0.1 §2).
//   • Row 37 is `200` ALWAYS for a well-formed request — an unknown/expired/revoked token is
//     `valid:false`, never a 404/error (the anti-oracle rule, G-1).
//   • `Cache-Control: no-store` on BOTH rows (G-3) is applied at the composition/route seam.
//   • Result payloads are the house camelCase result convention (the §C6/§C9 mapper precedent);
//     requests/envelope/enums stay snake_case.

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  CreateInvitationOutcome,
  CreateInvitationResult,
  GrowthInvitationError,
  ResolveInvitationTokenResult,
} from "@/modules/identity/contracts";

// The frozen §C13 growth-invite register codes shared by the composition edge (never re-declared
// literals at the app edge — the membership.handler precedent).
const GROWTH_INVALID_INPUT_CODE = "identity_growth_invite_invalid_input";
const GROWTH_FORBIDDEN_CODE = "identity_growth_invite_forbidden";

/** The §C13-wide SYNTAX failure response (`identity_growth_invite_invalid_input` → §6.2 `400`) —
 *  used by the compositions for the mandatory Idempotency-Key leg, malformed bodies, and the
 *  resolve row's SYNTAX-only leg (absent `token` parameter — never token invalidity). */
export function growthInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: GROWTH_INVALID_INPUT_CODE,
    message,
    retryable: false,
  });
}

/** The unresolved-active-org-context collapse for row 36. [logged judgment call — the §C13
 *  register authors NO NOT_FOUND code, so the Doc-5A §6.6 404 face is unrealizable in-register; a
 *  caller without a resolvable active-org context fails the frozen AUTHORIZATION leg
 *  (`identity_growth_invite_forbidden` → 403 — nearest in-register, non-disclosing: no protected
 *  fact exists here, the absence is the caller's own context). Carried in the slice report.] */
export function growthContextCollapse(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: GROWTH_FORBIDDEN_CODE,
    message: "Not permitted to manage growth invitations.",
    retryable: false,
  });
}

/** The ONE §C13 error→wire mapping (the membership.handler idiom — §6.1 envelope, §6.2 status;
 *  no concurrency-token leg exists on this surface). */
export function growthInvitationErrorResponse(error: GrowthInvitationError): WireResponse<never> {
  return errorResponse({
    error_class: error.errorClass,
    error_code: error.errorCode,
    message: error.message,
    retryable: error.errorClass === "DEPENDENCY",
  });
}

/** Map `identity.create_invitation.v1` → `201` (Doc-5C v1.0.1 row 36; NO `Location` — waived, see
 *  header). The result carries the raw `token` ONCE (GI-2; its §B.6 stored replay is the same
 *  logical response). */
export function mapCreateInvitation(
  outcome: CreateInvitationOutcome | null,
): WireResponse<CreateInvitationResult> {
  if (outcome === null) {
    return growthContextCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 201);
  }
  return growthInvitationErrorResponse(outcome.error);
}

/** Map `identity.resolve_invitation_token.v1` → `200` always (Doc-5C v1.0.1 row 37 — the
 *  anti-oracle uniform face, G-1): the wire result is `{ valid, campaignKey? }` (the house
 *  camelCase result convention — Lane-2 NIT-1); `campaignKey` present iff valid. */
export function mapResolveInvitationToken(
  result: ResolveInvitationTokenResult,
): WireResponse<ResolveInvitationTokenResult> {
  return successResponse(result, 200);
}
