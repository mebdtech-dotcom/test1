// M7 application (PRIVATE, OUT-OF-WIRE) — `billing.record_usage.v1` (Doc-4I §HB-3.1 / Doc-5I §10/R1). System
// METERING — appends one `usage_ledger` row on a consumed metered-action signal, attributed ALWAYS to the
// Controlling Org. No active org context; no slug. Consumed in-process by the metering-signal handlers
// (RFQ `QuotationSubmitted` / Operations lead-access / Marketplace ad-launch — DF-BILL-2/3/4); exposed via
// contracts for those consumers + tests. NO route/composition. W3-BILL-14 — the FINAL M7 contract.
//
// `entitlement_id` is CALLER-SUPPLIED ([ESC-BILL-USAGE-ENTID] → owner ruling Option B; the metering caller
// knows the metered entitlement) and maps to the NOT-NULL `usage_ledger.entitlement_id` FK — no record-time
// entitlement lookup (Stage-7). Usage recording is observability/metering ONLY — never a
// procurement/eligibility/routing decision (moat, R5). Audit = [ESC-BILL-AUDIT] (System-attributed).
//
// IDEMPOTENCY: §HB-3.1 is idempotent on `source_event_id` (+ source + period) via the Doc-4A §16 framework
// (H.8). There is NO `source_event_id` COLUMN (Doc-2 §10.8 / Doc-6I §3.3 define none — it is a framework key,
// not persisted), so the replay-safety dedup lands with the §B.6 idempotency replay store (DEFERRED — the
// program-wide Idempotency-Key deferral; the M1 §B.6 retro-fit precedent). Disclosed; not a coined gap.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import { entitlementExists, insertUsage } from "../../infrastructure/data/usage.repository";
import { isValidPeriod } from "../../domain/policies/usage-period";
import { USAGE_LEDGER_ENTITY_TYPE, UsageAuditAction } from "../../domain/audit-actions";
import type {
  RecordUsageInput,
  RecordUsageOutcome,
  UsageSource,
  UsageWriteError,
} from "../../contracts/types";

const INVALID_INPUT = "billing_usage_write_invalid_input";
const REFERENCE = "billing_usage_reference";

const SOURCES = new Set<UsageSource>(["rfq_response", "lead_access", "ad_launch"]);

/** Injected M0 services (D7 rule 4) — the audit-write surface (no §8 event). */
export interface RecordUsageDeps {
  appendAuditRecord: AppendAuditRecord;
}

function err(
  errorClass: UsageWriteError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: UsageWriteError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** SYNTAX validation (Doc-4A §11.2 category 1). `period` = YYYY-MM (the module-wide window — coherent with
 *  enforce_quota / get_usage). */
export function validateRecordUsageInput(input: RecordUsageInput): string | null {
  if (typeof input.organizationId !== "string" || !UUID_PATTERN.test(input.organizationId)) {
    return "organization_id must be a valid UUID.";
  }
  if (typeof input.entitlementId !== "string" || !UUID_PATTERN.test(input.entitlementId)) {
    return "entitlement_id must be a valid UUID.";
  }
  if (typeof input.quotaKey !== "string" || input.quotaKey.length === 0)
    return "quota_key is required.";
  if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount <= 0) {
    return "amount must be greater than 0.";
  }
  if (typeof input.period !== "string" || !isValidPeriod(input.period)) {
    return "period must be a YYYY-MM string.";
  }
  if (!SOURCES.has(input.source)) return "source must be rfq_response, lead_access, or ad_launch.";
  if (typeof input.sourceEventId !== "string" || !UUID_PATTERN.test(input.sourceEventId)) {
    return "source_event_id must be a valid UUID.";
  }
  if (input.actingUserId !== undefined && !UUID_PATTERN.test(input.actingUserId)) {
    return "acting_user_id must be a valid UUID.";
  }
  if (input.consumingEntityId !== undefined && !UUID_PATTERN.test(input.consumingEntityId)) {
    return "consuming_entity_id must be a valid UUID.";
  }
  return null;
}

/**
 * Record a metered usage row (Doc-4I §HB-3.1). Validates, verifies the caller-supplied `entitlement_id`
 * resolves (REFERENCE), appends the `usage_ledger` row attributed to the Controlling Org, and audits — all
 * in the ONE transaction the caller supplies (`db`). Records the fact; takes NO enforcement action.
 */
export async function recordUsageCommand(
  input: RecordUsageInput,
  deps: RecordUsageDeps,
  db: DbExecutor = prisma,
): Promise<RecordUsageOutcome> {
  const invalid = validateRecordUsageInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // REFERENCE — the caller-supplied entitlement_id must resolve (§HB-3.1 stage-7; the NOT-NULL FK's row).
  // (The Controlling Org is a trusted bare UUID — M1-resolved, deferred to the Identity seam like everywhere.)
  if (!(await entitlementExists(input.entitlementId, db))) {
    return err("REFERENCE", REFERENCE, "entitlement_id does not resolve.");
  }

  const usageId = await insertUsage(
    {
      entitlementId: input.entitlementId,
      organizationId: input.organizationId,
      ...(input.actingUserId !== undefined ? { actingUserId: input.actingUserId } : {}),
      ...(input.consumingEntityId !== undefined
        ? { consumingEntityId: input.consumingEntityId }
        : {}),
      quotaKey: input.quotaKey,
      amount: input.amount,
      period: input.period,
      source: input.source,
    },
    db,
  );

  // AUDIT — [ESC-BILL-AUDIT] usage recording; System-attributed; org = the Controlling Org.
  await deps.appendAuditRecord(
    {
      actorId: null,
      actorType: "system",
      organizationId: input.organizationId,
      entityType: USAGE_LEDGER_ENTITY_TYPE,
      entityId: usageId,
      action: UsageAuditAction.RECORDED,
      oldValue: null,
      newValue: {
        quota_key: input.quotaKey,
        amount: input.amount,
        period: input.period,
        source: input.source,
      },
      ipAddress: null,
      userAgent: null,
    },
    db,
  );

  return { ok: true };
}
