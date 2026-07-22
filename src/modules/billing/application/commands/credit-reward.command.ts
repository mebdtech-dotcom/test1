// M7 application (PRIVATE) — `billing.credit_reward.v1` (Doc-4I §HB-6.1 / Doc-5I §9
// `POST /billing/reward-account/credit-reward` · 200). W3-BILL-12. ORG-SCOPED audited write, ACTOR-BRANCHED:
// the USER leg = redemption (`direction=redeem`; the WIRED leg — R11) and the SYSTEM leg = milestone credit
// (`direction=credit`; profile_completion/review/completion; in-process). Appends a `reward_transactions`
// row and updates the `reward_accounts` balance head atomically, in the ONE tenant tx the composition supplies.
//
// FIREWALL: reward points are a PROMOTIONAL balance — never procurement standing (moat). Audit =
// [ESC-BILL-AUDIT] (reward movement not §9-enumerated; nearest by pointer). Authority (redeem leg) =
// `[ESC-BILL-SLUG]` interim → `can_manage_billing` (nearest enumerated Doc-2 §7 slug; no slug coined).

import { prisma, type DbExecutor } from "../../../../shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  createRewardAccount,
  creditRewardBalance,
  findLiveRewardAccount,
  insertRewardTransaction,
  redeemRewardBalance,
} from "../../infrastructure/data/reward.repository";
import { REWARD_TRANSACTION_ENTITY_TYPE, RewardAuditAction } from "../../domain/audit-actions";
import type {
  CreditRewardInput,
  CreditRewardOutcome,
  RewardDirection,
  RewardReason,
  RewardWriteError,
} from "../../contracts/types";

const INVALID_INPUT = "billing_reward_invalid_input";
const FORBIDDEN = "billing_reward_forbidden";
const INSUFFICIENT = "billing_reward_insufficient"; // BUSINESS

const DIRECTIONS = new Set<RewardDirection>(["credit", "redeem"]);
const REASONS = new Set<RewardReason>(["profile_completion", "review", "completion", "redemption"]);

/** The server-resolved request context (from the composition — never client input). */
export interface CreditRewardContext {
  /** `user` = the org redemption wired leg; `system` = the milestone-credit in-process leg. */
  actorType: "user" | "system";
  userId: string | null;
  organizationId: string;
  /** Resolved by the composition via `hasPermission(can_manage_billing)` (User redeem leg). System: n/a. */
  canManageBilling: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface CreditRewardDeps {
  appendAuditRecord: AppendAuditRecord;
}

function err(
  errorClass: RewardWriteError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: RewardWriteError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** SYNTAX validation (Doc-4A §11.2 category 1). */
export function validateCreditRewardInput(input: CreditRewardInput): string | null {
  if (!DIRECTIONS.has(input.direction)) return "direction must be credit or redeem.";
  if (!REASONS.has(input.reason)) return "reason must be a valid reward reason.";
  if (typeof input.points !== "number" || !Number.isFinite(input.points) || input.points <= 0) {
    return "points must be greater than 0.";
  }
  return null;
}

/**
 * Credit or redeem reward points (Doc-4I §HB-6.1). Finds/creates the account head, applies the movement
 * (credit increments; redeem conditionally decrements — insufficient → BUSINESS), appends the transaction,
 * and audits — all in the ONE tenant transaction the composition supplies (`db`).
 */
export async function creditRewardCommand(
  input: CreditRewardInput,
  ctx: CreditRewardContext,
  deps: CreditRewardDeps,
  db: DbExecutor = prisma,
): Promise<CreditRewardOutcome> {
  const invalid = validateCreditRewardInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // AUTHZ — the User (redeem) leg requires `can_manage_billing` ([ESC-BILL-SLUG] interim); System: no slug.
  if (ctx.actorType === "user" && ctx.canManageBilling !== true) {
    return err(
      "AUTHORIZATION",
      FORBIDDEN,
      "can_manage_billing is required to redeem reward points.",
    );
  }

  // Find or create the org's reward account head (created on first movement — Doc-4I §HB-6.1).
  const existing = await findLiveRewardAccount(ctx.organizationId, db);
  const accountId = existing?.id ?? (await createRewardAccount(ctx.organizationId, ctx.userId, db));

  // Apply the balance movement atomically. redeem within available balance (insufficient → BUSINESS).
  let balance: number;
  if (input.direction === "credit") {
    balance = await creditRewardBalance(accountId, input.points, ctx.userId, db);
  } else {
    const newBalance = await redeemRewardBalance(accountId, input.points, ctx.userId, db);
    if (newBalance === null) {
      return err("BUSINESS", INSUFFICIENT, "Insufficient reward points to redeem.");
    }
    balance = newBalance;
  }

  // Append the ledger transaction (credit direction → credit txn; redeem → debit txn).
  const transactionId = await insertRewardTransaction(
    {
      accountId,
      txnType: input.direction === "credit" ? "credit" : "debit",
      points: input.points,
      reason: input.reason,
      actorUserId: ctx.userId,
    },
    db,
  );

  // AUDIT — [ESC-BILL-AUDIT] reward movement; actor User/System; org-scoped.
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: ctx.actorType,
      organizationId: ctx.organizationId,
      entityType: REWARD_TRANSACTION_ENTITY_TYPE,
      entityId: transactionId,
      action: RewardAuditAction.MOVED,
      oldValue: null,
      newValue: { direction: input.direction, points: input.points, reason: input.reason, balance },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: {
      transactionId,
      organizationId: ctx.organizationId,
      direction: input.direction,
      points: input.points,
      balance,
    },
  };
}
