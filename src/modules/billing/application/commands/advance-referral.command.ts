// M7 application (PRIVATE) — `billing.advance_referral.v1` (Doc-4I §HB-6.2 / Doc-5I §9
// `POST /billing/referrals/{referral_id}/advance-referral` · 200). W3-BILL-12. ORG-SCOPED audited write,
// ACTOR-BRANCHED: the USER leg (referrer advances its own; `can_manage_billing`; WIRED — R11) and the SYSTEM
// leg (qualification/reward milestone; no slug; in-process). Transitions `referrals.state` under optimistic
// concurrency (`expected_state`) in the ONE tenant tx the composition supplies.
//
// STATE machine (Doc-2 §10.8): `pending → qualified → rewarded`; terminal `rewarded` → STATE; `expected_state`
// mismatch → CONFLICT. On `rewarded`, the reward credit is a SEPARATE `credit_reward` movement (§HB-6.1) —
// NOT bundled here. Audit = [ESC-BILL-AUDIT] (referral movement, nearest §9).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import { advanceReferralCas, loadReferralHead } from "../../infrastructure/data/reward.repository";
import { REFERRAL_ENTITY_TYPE, ReferralAuditAction } from "../../domain/audit-actions";
import type {
  AdvanceReferralInput,
  AdvanceReferralOutcome,
  RewardWriteError,
} from "../../contracts/types";

const INVALID_INPUT = "billing_referral_invalid_input";
const FORBIDDEN = "billing_referral_forbidden";
const NOT_FOUND = "billing_referral_not_found";
const NOT_ADVANCEABLE = "billing_referral_illegal_transition"; // STATE
const LOST_RACE = "billing_referral_conflict"; // CONFLICT
const REFERENCE = "billing_referral_reference";

const TARGETS = new Set(["qualified", "rewarded"]);
const EXPECTEDS = new Set(["pending", "qualified"]);
/** Legal `expected_state → target_state` edges (Doc-2 §10.8): pending→qualified; qualified→rewarded. */
const LEGAL_EDGES = new Set(["pending|qualified", "qualified|rewarded"]);

/** The server-resolved request context (from the composition — never client input). */
export interface AdvanceReferralContext {
  actorType: "user" | "system";
  userId: string | null;
  /** The active org (User branch — the referrer-org scope). System leg: n/a. */
  organizationId?: string;
  canManageBilling: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AdvanceReferralDeps {
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
export function validateAdvanceReferralInput(input: AdvanceReferralInput): string | null {
  if (typeof input.referralId !== "string" || !UUID_PATTERN.test(input.referralId)) {
    return "referral_id must be a valid UUID.";
  }
  if (!TARGETS.has(input.targetState)) return "target_state must be qualified or rewarded.";
  if (!EXPECTEDS.has(input.expectedState)) return "expected_state must be pending or qualified.";
  return null;
}

/**
 * Advance a referral's state (Doc-4I §HB-6.2). Loads the head, checks the state machine, then a CAS on
 * `expected_state`; STATE (illegal/terminal) vs CONFLICT (lost race) distinguished; audits.
 */
export async function advanceReferralCommand(
  input: AdvanceReferralInput,
  ctx: AdvanceReferralContext,
  deps: AdvanceReferralDeps,
  db: DbExecutor = prisma,
): Promise<AdvanceReferralOutcome> {
  const invalid = validateAdvanceReferralInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // AUTHZ — the User leg requires `can_manage_billing`; the System leg carries no slug.
  if (ctx.actorType === "user" && ctx.canManageBilling !== true) {
    return err("AUTHORIZATION", FORBIDDEN, "can_manage_billing is required to advance a referral.");
  }

  // SCOPE / REFERENCE — load the head. User branch: absent/cross-org → NOT_FOUND (protected-fact collapse);
  // System branch: absent → REFERENCE (platform-scope definitive negative).
  const head = await loadReferralHead(input.referralId, db);
  if (head === null) {
    return ctx.actorType === "user"
      ? err("NOT_FOUND", NOT_FOUND, "No such referral for this organization.")
      : err("REFERENCE", REFERENCE, "referral_id does not resolve.");
  }
  if (ctx.actorType === "user" && head.referrerOrganizationId !== ctx.organizationId) {
    return err("NOT_FOUND", NOT_FOUND, "No such referral for this organization.");
  }

  // STATE — a terminal (rewarded) referral cannot advance; the requested edge must be legal.
  if (head.state === "rewarded") {
    return err("STATE", NOT_ADVANCEABLE, "The referral is already rewarded.");
  }
  if (!LEGAL_EDGES.has(`${input.expectedState}|${input.targetState}`)) {
    return err("STATE", NOT_ADVANCEABLE, "Illegal referral state transition.");
  }

  // CAS — advance only while STILL at `expected_state` (+ referrer-org on the User branch). count===0 ⇒ a
  // lost race (the row left `expected_state`) → CONFLICT.
  const affected = await advanceReferralCas(
    {
      referralId: input.referralId,
      expectedState: input.expectedState,
      targetState: input.targetState,
      ...(ctx.actorType === "user" ? { referrerOrganizationId: ctx.organizationId } : {}),
      actorUserId: ctx.userId,
    },
    db,
  );
  if (affected === 0) {
    return err("CONFLICT", LOST_RACE, "The referral changed concurrently; re-read and retry.");
  }

  // AUDIT — [ESC-BILL-AUDIT] referral advanced; actor User/System; org = the referrer org.
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: ctx.actorType,
      organizationId: head.referrerOrganizationId,
      entityType: REFERRAL_ENTITY_TYPE,
      entityId: input.referralId,
      action: ReferralAuditAction.ADVANCED,
      oldValue: { state: input.expectedState },
      newValue: { state: input.targetState },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { referralId: input.referralId, state: input.targetState } };
}
