// M1 api (PRIVATE) — the HTTP wire mappings for the seven §C5 organization contracts (Doc-4C §C5 →
// Doc-5C §4.1 rows 5–11). W2-IDN-6.2. Pure mappers — no orchestration, no I/O. One-Owner placement:
// M1 owns how its writes become HTTP.
//
// One shared §C5 error→wire mapping (the 6.1 `userAccountErrorResponse` / 6.5
// `delegationGrantErrorResponse` idiom): §6.1 envelope, §6.2 status, and — when the error carries
// the current concurrency token (a §9.5 stale-precondition / §9.4 losing-write leg) — the `ETag`
// response header (the RV-0152 call-13 leg discipline: machine-illegal-edge rejections carry NO
// token, hence no header). `null` outcome = the active-org-context / non-disclosure collapse
// (Doc-5A §6.6 safe default — `404`, the frozen §C5 org-domain register code).

import { concurrencyEtag, errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  AdminRecoverOwnershipOutcome,
  AdminRecoverOwnershipResult,
  CreateOrganizationOutcome,
  CreateOrganizationResult,
  OrganizationError,
  RestoreOrganizationOutcome,
  RestoreOrganizationResult,
  SetOrganizationStatusOutcome,
  SetOrganizationStatusResult,
  SoftDeleteOrganizationOutcome,
  SoftDeleteOrganizationResult,
  TransferOwnershipOutcome,
  TransferOwnershipResult,
  UpdateOrganizationProfileOutcome,
  UpdateOrganizationProfileResult,
} from "@/modules/identity/contracts";

// The frozen §C5 org-domain register codes shared by the composition edge (never re-declared
// literals at the app edge — the 6.1 `userAccountInvalidInput` precedent).
const ORG_INVALID_INPUT_CODE = "identity_org_invalid_input";
const ORG_NOT_FOUND_CODE = "identity_org_not_found";
const ORG_FORBIDDEN_CODE = "identity_org_forbidden";

/** The §C5-wide SYNTAX failure response (`identity_org_invalid_input` → §6.2 `400`) — used by the
 *  compositions for the mandatory Idempotency-Key leg and malformed-body legs. */
export function orgInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: ORG_INVALID_INPUT_CODE,
    message,
    retryable: false,
  });
}

/** The uniform §6.6 non-disclosure collapse (`identity_org_not_found` → `404`) — unresolved
 *  active-org context, foreign target, or an unresolvable subject. Byte-identical wherever raised. */
export function orgNotFoundCollapse(): WireResponse<never> {
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: ORG_NOT_FOUND_CODE,
    message: "Not found.",
    retryable: false,
  });
}

/** The uniform NON-STAFF deny for the two §C5 Admin contracts (the frozen AUTHORIZATION register
 *  row → §6.2 `403`; the 6.1 `forbiddenSetUserAccountStatus` shape — the caller learns only that it
 *  lacks platform-staff authority; nothing about the target is disclosed). */
export function forbiddenOrgAdmin(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: ORG_FORBIDDEN_CODE,
    message: "Platform-staff authority required.",
    retryable: false,
  });
}

/** The ONE §C5 error→wire mapping (all seven organization wire faces share it) — see header. */
export function organizationErrorResponse(error: OrganizationError): WireResponse<never> {
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

/** Map `identity.create_organization.v1` → `201` + the §5.5 `Location` header (the created item's
 *  frozen `/identity/organizations/{id}` address — the 6.5 create precedent). */
export function mapCreateOrganization(
  outcome: CreateOrganizationOutcome | null,
): WireResponse<CreateOrganizationResult> {
  if (outcome === null) {
    return orgNotFoundCollapse();
  }
  if (outcome.ok) {
    const created = successResponse(outcome.result, 201);
    return {
      ...created,
      headers: { Location: `/identity/organizations/${outcome.result.organizationId}` },
    };
  }
  return organizationErrorResponse(outcome.error);
}

/** Map `identity.update_organization_profile.v1` → `200` (§5.6 envelope) / the §C5 register legs. */
export function mapUpdateOrganizationProfile(
  outcome: UpdateOrganizationProfileOutcome | null,
): WireResponse<UpdateOrganizationProfileResult> {
  if (outcome === null) {
    return orgNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return organizationErrorResponse(outcome.error);
}

/** Map `identity.transfer_ownership.v1` → `200` / the §C5 register legs. */
export function mapTransferOwnership(
  outcome: TransferOwnershipOutcome | null,
): WireResponse<TransferOwnershipResult> {
  if (outcome === null) {
    return orgNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return organizationErrorResponse(outcome.error);
}

/** Map `identity.soft_delete_organization.v1` → `200` (ADR-012 DELETE returns the §5.6 envelope,
 *  Doc-5C §2.2 row 8) / the §C5 register legs. */
export function mapSoftDeleteOrganization(
  outcome: SoftDeleteOrganizationOutcome | null,
): WireResponse<SoftDeleteOrganizationResult> {
  if (outcome === null) {
    return orgNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return organizationErrorResponse(outcome.error);
}

/** Map `identity.restore_organization.v1` → `200` / the §C5 register legs. */
export function mapRestoreOrganization(
  outcome: RestoreOrganizationOutcome | null,
): WireResponse<RestoreOrganizationResult> {
  if (outcome === null) {
    return orgNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return organizationErrorResponse(outcome.error);
}

/** Map `identity.set_organization_status.v1` → `200` / the §C5 register legs. */
export function mapSetOrganizationStatus(
  outcome: SetOrganizationStatusOutcome,
): WireResponse<SetOrganizationStatusResult> {
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return organizationErrorResponse(outcome.error);
}

/** Map `identity.admin_recover_ownership.v1` → `200` / the §C5 register legs. */
export function mapAdminRecoverOwnership(
  outcome: AdminRecoverOwnershipOutcome,
): WireResponse<AdminRecoverOwnershipResult> {
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return organizationErrorResponse(outcome.error);
}
