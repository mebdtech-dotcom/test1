// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for the BC-BILL-6 reward/referral reads
// `get_reward_balance` / `list_referrals` (Doc-4I §HB-6.3 / Doc-5I §9). Pure (no I/O). BOUNDARY:
// `@/shared/http` + the M7 contract TYPES only.
//
//   - get_reward_balance → `200` (§5.6; org-self, balance 0 when no account).
//   - list_referrals → `200` (§5.6 list envelope) or `400` VALIDATION (cursor / page_size).
//   - 403 (no active org / `can_view_billing` denied) → the composition edge (org-self read, no NOT_FOUND).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  AdvanceReferralOutcome,
  AdvanceReferralResult,
  CreditRewardOutcome,
  CreditRewardResult,
  ListReferralsOutcome,
  ListReferralsResult,
  RewardBalanceView,
  RewardWriteError,
  TrackReferralOutcome,
  TrackReferralResult,
} from "@/modules/billing/contracts";

const INVALID_INPUT_CODE = "billing_reward_invalid_input";
export const REWARD_VIEW_FORBIDDEN = "billing_reward_view_forbidden";
export const REWARD_WRITE_INVALID_INPUT = "billing_reward_write_invalid_input";
export const REWARD_WRITE_FORBIDDEN = "billing_reward_write_forbidden";

/** Map a BC-BILL-6 write failure to the Doc-5A §6.1 envelope + §6.2 status (class-mapped — NOT_FOUND 404 ·
 *  STATE/CONFLICT 409 · REFERENCE/BUSINESS 422 · VALIDATION 400 · AUTHORIZATION 403). DEPENDENCY/SYSTEM retry. */
export function mapRewardWriteError(error: RewardWriteError): WireResponse<never> {
  return errorResponse({
    error_class: error.errorClass,
    error_code: error.errorCode,
    message: error.message,
    retryable: error.errorClass === "DEPENDENCY" || error.errorClass === "SYSTEM",
  });
}

/** `billing.credit_reward.v1` outcome → `200` (§5.6) or the §6.1 error. */
export function mapCreditReward(outcome: CreditRewardOutcome): WireResponse<CreditRewardResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return mapRewardWriteError(outcome.error);
}

/** `billing.track_referral.v1` outcome → `201` + `Location` (Doc-5I §9) or the §6.1 error. */
export function mapTrackReferral(outcome: TrackReferralOutcome): WireResponse<TrackReferralResult> {
  if (outcome.ok) {
    const res = successResponse(outcome.result, 201);
    return { ...res, headers: { Location: `/billing/referrals/${outcome.result.referralId}` } };
  }
  return mapRewardWriteError(outcome.error);
}

/** `billing.advance_referral.v1` outcome → `200` or the §6.1 error. */
export function mapAdvanceReferral(
  outcome: AdvanceReferralOutcome,
): WireResponse<AdvanceReferralResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return mapRewardWriteError(outcome.error);
}

/** Composition-edge `400 VALIDATION` (SYNTAX before the org/permission gate) — the reward-write leg. */
export function rewardWriteInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: REWARD_WRITE_INVALID_INPUT,
    message,
    retryable: false,
  });
}

/** Composition-edge `403` for a no-active-org reward write (fail-closed — active org + slug required). */
export function rewardWriteForbidden(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: REWARD_WRITE_FORBIDDEN,
    message: "An active organization context and can_manage_billing are required.",
    retryable: false,
  });
}

/** `billing.get_reward_balance.v1` view → `200` (§5.6). Org-self; always resolves (balance 0 when none). */
export function mapGetRewardBalance(view: RewardBalanceView): WireResponse<RewardBalanceView> {
  return successResponse(view, 200);
}

/** `billing.list_referrals.v1` outcome → `200` (§5.6 list envelope) or `400` VALIDATION. */
export function mapListReferrals(outcome: ListReferralsOutcome): WireResponse<ListReferralsResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return errorResponse({
    error_class: "VALIDATION",
    error_code: INVALID_INPUT_CODE,
    message: "Invalid cursor or page_size.",
    retryable: false,
  });
}

/** Composition-edge `403` for the reward reads — no valid active-org context (Doc-4I §HB-6.3 Stage-2
 *  CONTEXT → AUTHORIZATION) OR `can_view_billing` denied. Org-self read; no caller `org_id`, no NOT_FOUND leg. */
export function rewardViewForbidden(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: REWARD_VIEW_FORBIDDEN,
    message: "An active organization context and can_view_billing are required.",
    retryable: false,
  });
}
