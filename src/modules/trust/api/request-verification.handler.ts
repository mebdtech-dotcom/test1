// M5 api (PRIVATE) — the HTTP wire mapping for `trust.request_verification.v1`
// (Doc-4G §G4.1 → `POST /trust/verifications` → `201` + `Location`; Doc-5G §4). Maps the in-process
// `RequestVerificationOutcome` to the Doc-5A envelope (§5.6 success / §6.1 error), choosing the §6.2
// status. Owns NO orchestration, touches NO session/transaction — pure (no I/O). One-Owner placement:
// M5 owns how its write becomes HTTP. This file also owns the two error-builders the composition edge
// consumes (via `contracts/`) so those wire faces come from ONE constant, never a re-declared literal
// (the identity `delegationInvalidInput` / `forbiddenOrgAdmin` precedent).
//
// Reference-never-restate (Doc-4G §G4.1 register + Doc-5A §6.2):
//   - ok            → `201` + `Location: /trust/verifications/{id}` + §5.6 envelope
//                     (`result` = `{ verificationRecordId, state }`; top-level `reference_id`).
//   - VALIDATION / AUTHORIZATION / NOT_FOUND / BUSINESS → §6.1 envelope; §6.2 maps class → 400/403/404/422.
//   - no active-org context (`null`, fail-closed) → `404` NOT_FOUND (Doc-5A §6.6 non-disclosure safe
//     default; the same collapse §7.5 / Doc-4G §G4.1 §12 demands for a cross-org subject).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import {
  VERIFICATION_FORBIDDEN_CODE,
  VERIFICATION_INVALID_INPUT_CODE,
  VERIFICATION_NOT_FOUND_CODE,
} from "@/modules/trust/domain/request-verification.constants";
import type {
  RequestVerificationOutcome,
  RequestVerificationResult,
} from "@/modules/trust/contracts/types";

/** The §G4.1 SYNTAX / mandatory-Idempotency-Key failure (`trust_verification_invalid_input` → §6.2 `400`).
 *  Consumed by the composition edge for the mandatory-header leg (never a re-declared literal). */
export function requestVerificationInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: VERIFICATION_INVALID_INPUT_CODE,
    message,
    retryable: false,
  });
}

/** The AUTHZ-denial outcome (`can_submit_verification` deny → AUTHORIZATION `403`). Built at the
 *  composition edge (authz runs there — Doc-4A §11.2 stage 3) and mapped through {@link mapRequestVerification}. */
export function requestVerificationForbidden(): RequestVerificationOutcome {
  return {
    ok: false,
    error: {
      errorClass: "AUTHORIZATION",
      errorCode: VERIFICATION_FORBIDDEN_CODE,
      message: "Not permitted to submit a verification request for this organization.",
    },
  };
}

/**
 * Map a resolved `trust.request_verification.v1` outcome to its Doc-5A wire response. `null` ⇒ no
 * active-org context resolved (fail-closed) — the §6.6 non-disclosure `404` collapse.
 */
export function mapRequestVerification(
  outcome: RequestVerificationOutcome | null,
): WireResponse<RequestVerificationResult> {
  // No active-org context (fail-closed) → `404` non-disclosure safe default (Doc-5A §6.6 / §7.5).
  if (outcome === null) {
    return errorResponse({
      error_class: "NOT_FOUND",
      error_code: VERIFICATION_NOT_FOUND_CODE,
      message: "Not found.",
      retryable: false,
    });
  }

  if (outcome.ok) {
    // Doc-5A §5.6 single-entity success: `{ result, reference_id }`; `201` + the §5.5 `Location` header
    // (a standard HTTP infrastructure header — Doc-5A §4.0 class) pointing at the created case.
    const created = successResponse(outcome.result, 201);
    return {
      ...created,
      headers: { Location: `/trust/verifications/${outcome.result.verificationRecordId}` },
    };
  }

  // Doc-4G §G4.1 contract error → Doc-5A §6.1 envelope; §6.2 fixes the status from the class.
  return errorResponse({
    error_class: outcome.error.errorClass,
    error_code: outcome.error.errorCode,
    message: outcome.error.message,
    retryable: false,
  });
}
