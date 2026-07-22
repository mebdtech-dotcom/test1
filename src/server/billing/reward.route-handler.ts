// App-layer COMPOSITION for the BC-BILL-6 reward/referral reads (Doc-5I §9 — `GET /billing/reward-account`
// · 200, `GET /billing/referrals` · 200). ORG-SELF reads (Own-Org, User-only — Doc-5I §3.6): resolve session
// → provision → run inside `withActiveOrg` (RLS-scoped tenant tx), authorize `can_view_billing` via
// `hasPermission` (M1 `check_permission`) ON the tenant tx. Org = server-validated active org — NO caller
// `org_id` (Doc-5I §9 / Invariant #5). The reward/referral writes land in the next slice.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { hasPermission } from "@/server/authz";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  advanceReferral,
  creditReward,
  getRewardBalance,
  listReferrals,
  mapAdvanceReferral,
  mapCreditReward,
  mapGetRewardBalance,
  mapListReferrals,
  mapTrackReferral,
  rewardViewForbidden,
  rewardWriteForbidden,
  rewardWriteInvalidInput,
  trackReferral,
  validateAdvanceReferralInput,
  validateCreditRewardInput,
  validateTrackReferralInput,
  type AdvanceReferralInput,
  type AdvanceReferralResult,
  type CreditRewardResult,
  type ListReferralsRequest,
  type ListReferralsResult,
  type RewardBalanceView,
  type TrackReferralInput,
  type TrackReferralResult,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the reward compositions. All injectable (defaults bind production wiring). */
export interface RewardHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** The Doc-2 §7 slugs — reads authorize `can_view_billing`; the org-scoped writes `can_manage_billing`. */
const CAN_VIEW_BILLING = "can_view_billing";
const CAN_MANAGE_BILLING = "can_manage_billing";

/**
 * `GET /billing/reward-account` — `billing.get_reward_balance.v1`. `200` (§5.6; balance 0 when no account) ·
 * `401` · `403` (no active org / `can_view_billing` denied).
 */
export async function handleGetRewardBalance(
  deps: RewardHandlerDeps,
): Promise<WireResponse<RewardBalanceView>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canView = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_VIEW_BILLING,
      },
      undefined,
      tx,
    );
    if (!canView) return { denied: true as const };
    return { denied: false as const, view: await getRewardBalance(context.activeOrgId, tx) };
  });

  if (!ran.resolved || ran.value.denied) {
    return rewardViewForbidden();
  }
  return mapGetRewardBalance(ran.value.view);
}

/**
 * `GET /billing/referrals` — `billing.list_referrals.v1`. `200` (§5.6 list) · `401` · `400` (SYNTAX: cursor /
 * page_size) · `403` (no active org / `can_view_billing` denied).
 */
export async function handleListReferrals(
  request: ListReferralsRequest,
  deps: RewardHandlerDeps,
): Promise<WireResponse<ListReferralsResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canView = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_VIEW_BILLING,
      },
      undefined,
      tx,
    );
    if (!canView) return { denied: true as const };
    return {
      denied: false as const,
      outcome: await listReferrals(request, context.activeOrgId, tx),
    };
  });

  if (!ran.resolved || ran.value.denied) {
    return rewardViewForbidden();
  }
  return mapListReferrals(ran.value.outcome);
}

/**
 * `POST /billing/reward-account/credit-reward` — `billing.credit_reward.v1` (the WIRED User REDEMPTION leg).
 * The wire body is `{ points }`; `direction=redeem` / `reason=redemption` are server-set (Doc-5I §9.2). `200` ·
 * `401` · `400` (SYNTAX) · `403` (no active org / `can_manage_billing` denied) · `422` BUSINESS (insufficient).
 */
export async function handleCreditReward(
  points: number,
  deps: RewardHandlerDeps,
): Promise<WireResponse<CreditRewardResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // The User wire leg is redemption only (direction/reason server-set; the token name is not an action gate).
  const input = { direction: "redeem" as const, points, reason: "redemption" as const };
  const syntaxFailure = validateCreditRewardInput(input);
  if (syntaxFailure !== null) {
    return rewardWriteInvalidInput(syntaxFailure);
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canManageBilling = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_MANAGE_BILLING,
      },
      undefined,
      tx,
    );
    return creditReward(
      input,
      {
        actorType: "user",
        userId: context.userId,
        organizationId: context.activeOrgId,
        canManageBilling,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
  });

  if (!ran.resolved) {
    return rewardWriteForbidden();
  }
  return mapCreditReward(ran.value);
}

/**
 * `POST /billing/referrals` — `billing.track_referral.v1` (User leg). `201` (§5.6 + Location) · `401` · `400`
 * (SYNTAX) · `403` (no active org / `can_manage_billing`) · `422` REFERENCE/BUSINESS (duplicate pair). The
 * referrer org is the actor's active org (no caller org_id — Invariant #5).
 */
export async function handleTrackReferral(
  input: TrackReferralInput,
  deps: RewardHandlerDeps,
): Promise<WireResponse<TrackReferralResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  const syntaxFailure = validateTrackReferralInput(input);
  if (syntaxFailure !== null) {
    return rewardWriteInvalidInput(syntaxFailure);
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canManageBilling = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_MANAGE_BILLING,
      },
      undefined,
      tx,
    );
    return trackReferral(
      input,
      {
        userId: context.userId,
        organizationId: context.activeOrgId,
        canManageBilling,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
  });

  if (!ran.resolved) {
    return rewardWriteForbidden();
  }
  return mapTrackReferral(ran.value);
}

/**
 * `POST /billing/referrals/{referral_id}/advance-referral` — `billing.advance_referral.v1` (the WIRED User
 * leg). `200` · `401` · `400` (SYNTAX) · `403` (no active org / `can_manage_billing`) · `404` (absent/cross-org)
 * · `409` STATE/CONFLICT.
 */
export async function handleAdvanceReferral(
  input: AdvanceReferralInput,
  deps: RewardHandlerDeps,
): Promise<WireResponse<AdvanceReferralResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  const syntaxFailure = validateAdvanceReferralInput(input);
  if (syntaxFailure !== null) {
    return rewardWriteInvalidInput(syntaxFailure);
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canManageBilling = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_MANAGE_BILLING,
      },
      undefined,
      tx,
    );
    return advanceReferral(
      input,
      {
        actorType: "user",
        userId: context.userId,
        organizationId: context.activeOrgId,
        canManageBilling,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
  });

  if (!ran.resolved) {
    return rewardWriteForbidden();
  }
  return mapAdvanceReferral(ran.value);
}
