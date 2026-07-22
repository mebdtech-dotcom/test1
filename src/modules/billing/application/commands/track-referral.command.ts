// M7 application (PRIVATE) — `billing.track_referral.v1` (Doc-4I §HB-6.2 / Doc-5I §9 `POST /billing/referrals`
// · 201). W3-BILL-12. ORG-SCOPED audited write — User leg only (org self-initiates; `can_manage_billing`;
// System n/a for create — R11). Inserts a `referrals` row at `pending` (referrer = the actor's active org),
// in the ONE tenant tx the composition supplies. Audit = [ESC-BILL-AUDIT] (referral movement, nearest §9).
//
// REFERENCE note: Doc-4I §HB-6.2 mandates a `referred_organization_id` "resolves" check → REFERENCE. Billing
// cannot verify an M1 organization's existence directly (no cross-module table access). SYNTAX validates the
// uuid; the definitive Identity-resolve (DF-BILL-1) is DEFERRED to the Identity-service seam (disclosed) —
// `referred_organization_id` is a trusted bare UUID here, as every M1 org reference is. The BUSINESS
// duplicate-pair check IS enforced (intra-module query).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import { insertReferral, referralPairExists } from "../../infrastructure/data/reward.repository";
import { REFERRAL_ENTITY_TYPE, ReferralAuditAction } from "../../domain/audit-actions";
import type {
  RewardWriteError,
  TrackReferralInput,
  TrackReferralOutcome,
} from "../../contracts/types";

const INVALID_INPUT = "billing_referral_invalid_input";
const FORBIDDEN = "billing_referral_forbidden";
const DUPLICATE = "billing_referral_duplicate"; // BUSINESS

/** The server-resolved request context (from the composition — never client input). */
export interface TrackReferralContext {
  userId: string;
  /** The referrer org (= the actor's active org). */
  organizationId: string;
  canManageBilling: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface TrackReferralDeps {
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
export function validateTrackReferralInput(input: TrackReferralInput): string | null {
  if (
    typeof input.referredOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.referredOrganizationId)
  ) {
    return "referred_organization_id must be a valid UUID.";
  }
  return null;
}

/**
 * Create a referral at `pending` (Doc-4I §HB-6.2 track). Duplicate `(referrer, referred)` pair → BUSINESS.
 * `organizationId` (the referrer) is the server-validated active org (from the composition — never input).
 */
export async function trackReferralCommand(
  input: TrackReferralInput,
  ctx: TrackReferralContext,
  deps: TrackReferralDeps,
  db: DbExecutor = prisma,
): Promise<TrackReferralOutcome> {
  const invalid = validateTrackReferralInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // AUTHZ — the referrer org self-initiates (Owner `can_manage_billing`).
  if (ctx.canManageBilling !== true) {
    return err("AUTHORIZATION", FORBIDDEN, "can_manage_billing is required to track a referral.");
  }

  // BUSINESS — a referral already exists for this (referrer, referred) pair (Doc-4I §HB-6.2 stage-8).
  if (await referralPairExists(ctx.organizationId, input.referredOrganizationId, db)) {
    return err("BUSINESS", DUPLICATE, "A referral for this organization pair already exists.");
  }

  const referralId = await insertReferral(
    {
      referrerOrganizationId: ctx.organizationId,
      referredOrganizationId: input.referredOrganizationId,
      actorUserId: ctx.userId,
    },
    db,
  );

  // AUDIT — [ESC-BILL-AUDIT] referral created; User-attributed; org-scoped (the referrer org).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.organizationId,
      entityType: REFERRAL_ENTITY_TYPE,
      entityId: referralId,
      action: ReferralAuditAction.TRACKED,
      oldValue: null,
      newValue: { referred_organization_id: input.referredOrganizationId, state: "pending" },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { referralId, state: "pending" } };
}
