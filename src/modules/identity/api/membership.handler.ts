// M1 api (PRIVATE) — the HTTP wire mappings for the five §C6 membership contracts (Doc-4C §C6 →
// Doc-5C §5.1 rows 12–16). W2-IDN-6.3. Pure mappers — no orchestration, no I/O. One-Owner
// placement: M1 owns how its writes become HTTP.
//
// One shared §C6 error→wire mapping (the 6.1/6.2/6.5 idiom): §6.1 envelope, §6.2 status, and —
// when the error carries the current concurrency token (a §9.4 losing-write leg) — the `ETag`
// response header (the call-13 leg discipline: machine-illegal-edge rejections carry NO token).
// `null` outcome = the active-org-context / non-disclosure collapse (Doc-5A §6.6 safe default —
// `404`, the frozen §C6 membership-domain register code).

import { concurrencyEtag, errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  AcceptInvitationOutcome,
  AcceptInvitationResult,
  InviteMemberOutcome,
  InviteMemberResult,
  MembershipError,
  RemoveMemberOutcome,
  RemoveMemberResult,
  RevokeInvitationOutcome,
  RevokeInvitationResult,
  SetMembershipStatusOutcome,
  SetMembershipStatusResult,
} from "@/modules/identity/contracts";

// The frozen §C6 membership-domain register codes shared by the composition edge (never
// re-declared literals at the app edge — the 6.1/6.2 precedent).
const MEMBERSHIP_INVALID_INPUT_CODE = "identity_membership_invalid_input";
const MEMBERSHIP_NOT_FOUND_CODE = "identity_membership_not_found";

/** The §C6-wide SYNTAX failure response (`identity_membership_invalid_input` → §6.2 `400`) — used
 *  by the compositions for the mandatory Idempotency-Key leg and malformed-body legs. */
export function membershipInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: MEMBERSHIP_INVALID_INPUT_CODE,
    message,
    retryable: false,
  });
}

/** The uniform §6.6 non-disclosure collapse (`identity_membership_not_found` → `404`) — unresolved
 *  active-org context, foreign target, or an unresolvable subject. Byte-identical wherever raised. */
export function membershipNotFoundCollapse(): WireResponse<never> {
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: MEMBERSHIP_NOT_FOUND_CODE,
    message: "Not found.",
    retryable: false,
  });
}

/** The ONE §C6 error→wire mapping (all five membership wire faces share it) — see header. */
export function membershipErrorResponse(error: MembershipError): WireResponse<never> {
  return errorResponse(
    {
      error_class: error.errorClass,
      error_code: error.errorCode,
      message: error.message,
      retryable: false,
    },
    error.currentUpdatedAt !== undefined
      ? { ETag: concurrencyEtag(error.currentUpdatedAt) }
      : undefined,
  );
}

/** Map `identity.invite_member.v1` → `201` + the §5.5 `Location` header (the created item's
 *  frozen `/identity/memberships/{id}` collection address — the 6.2 create precedent). */
export function mapInviteMember(
  outcome: InviteMemberOutcome | null,
): WireResponse<InviteMemberResult> {
  if (outcome === null) {
    return membershipNotFoundCollapse();
  }
  if (outcome.ok) {
    const created = successResponse(outcome.result, 201);
    return {
      ...created,
      headers: { Location: `/identity/memberships/${outcome.result.membershipId}` },
    };
  }
  return membershipErrorResponse(outcome.error);
}

/** Map `identity.accept_invitation.v1` → `200` / the §C6 register legs. */
export function mapAcceptInvitation(
  outcome: AcceptInvitationOutcome | null,
): WireResponse<AcceptInvitationResult> {
  if (outcome === null) {
    return membershipNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return membershipErrorResponse(outcome.error);
}

/** Map `identity.set_membership_status.v1` → `200` / the §C6 register legs. */
export function mapSetMembershipStatus(
  outcome: SetMembershipStatusOutcome | null,
): WireResponse<SetMembershipStatusResult> {
  if (outcome === null) {
    return membershipNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return membershipErrorResponse(outcome.error);
}

/** Map `identity.remove_member.v1` → `200` / the §C6 register legs. */
export function mapRemoveMember(
  outcome: RemoveMemberOutcome | null,
): WireResponse<RemoveMemberResult> {
  if (outcome === null) {
    return membershipNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return membershipErrorResponse(outcome.error);
}

/** Map `identity.revoke_invitation.v1` → `200` / the §C6 register legs. */
export function mapRevokeInvitation(
  outcome: RevokeInvitationOutcome | null,
): WireResponse<RevokeInvitationResult> {
  if (outcome === null) {
    return membershipNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return membershipErrorResponse(outcome.error);
}
