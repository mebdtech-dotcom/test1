// M5 application (PRIVATE) — the BC-TRUST-3 Performance-Score write-SERVICES (Doc-4G §G6.1/§G6.2/§G6.4;
// Doc-6G §3.3). The three System contracts exercised DIRECTLY by tests (the live Inngest production triggers +
// M4/M3 event-consumption wiring are DEFERRED, the WP3 precedent). ORCHESTRATION ONLY (owns no state):
// validate → SD-function write → (compute/trigger) EMIT via M0 outbox → append audit — ALL on the SAME
// caller-supplied tx executor.
//
// THE WRITE-PLUS-EMIT-PLUS-AUDIT ATOMICITY (Doc-8F; the WP3 pattern): for compute, the SD head upsert + history
// snapshot (owner-role RLS bypass, participates in the caller's tx), the `PerformanceScoreUpdated` emit (M0
// `core.write_outbox_event.v1`), and the ONE audit (M0 `core.append_audit_record.v1`) ALL run on the ONE tx
// `db`. Emit-failure OR audit-failure rolls the WHOLE tx back — no head/history row, no event, no audit. An
// unchanged recompute writes NOTHING (no head write, no snapshot, no event, no audit) — publish-on-change
// idempotency. Ingestion appends one input + ONE audit atomically (no event; Doc-4G §G6.1 §8); a dedup replay
// writes NEITHER a row NOR an audit. trigger_review emits `PerformanceReviewTriggered` + ONE audit (no score
// write).
//
// FROZEN INVARIANTS ENFORCED (built for real — the formula math is the ONLY interim, in `performance-score.formula.ts`):
//   • Not-Rated gate — below `min_threshold_met` (5 responses OR 2 projects) the score is NULL (Not Rated,
//     NEVER 0; absence ≠ 0 — Doc-3 §12.1 FIXED). The gate + firewall live in the domain plug.
//   • Publish-on-change — `PerformanceScoreUpdated` only on a score/level/formula change (SD `changed` flag).
//   • Frozen suppression — while `freeze_state='frozen'` the recompute + snapshot still occur, the event is
//     SUPPRESSED (Doc-4G §H.5). freeze/reactivate itself is DEFERRED (a later WP).
//   • Firewall — Financial Tier / Trust Score / Buyer-Vendor Status never feed the score (the plug reads only
//     `performance_inputs`); this module imports NOTHING from M1/M2 (core contract TYPES only — the WP2 precedent).
//
// BOUNDARY: M0 `appendAuditRecord` + `writeOutboxEvent` are INJECTED as contract TYPES. Attribution: System
// throughout (Doc-4G §H.6 — no tenant/staff). The caller's tx MUST carry the platform-staff GUC
// (`app.is_platform_staff = true`) — natural for the System actor — so the outbox INSERT + audit append are
// RLS-admitted and the score-class reads are visible.
//
// [ESC-TRUST-POLICY] — the formula weights/components + review cadence + dedup window (the plug + constants).
// [ESC-TRUST-AUDIT] — the ingest + review-trigger audit tokens (recalc / formula-version-change ARE enumerated).
// [ESC-TRUST-CODE] — the interim `trust_performance_*` error register. [ESC-TRUST-SDWRITE] — the SD writers.

import { prisma, type DbExecutor } from "@/shared/db";
import { UUID_PATTERN, uuidv7 } from "@/shared/ids";
import {
  appendPerformanceInput,
  getPerformanceInputTally,
  getPerformanceScoreByVendor,
  upsertPerformanceScore,
} from "@/modules/trust/infrastructure/data/performance-score.repository";
import {
  computePerformanceScore as computeScorePlug,
  PERFORMANCE_FORMULA_VERSION,
} from "@/modules/trust/domain/performance-score.formula";
import {
  isInputSourceConsistent,
  isPerformanceInputType,
  isPerformanceSourceType,
  PERFORMANCE_INPUT_INCONSISTENT_CODE,
  PERFORMANCE_INVALID_INPUT_CODE,
  PERFORMANCE_REVIEW_SUBJECT_UNRESOLVED_CODE,
} from "@/modules/trust/domain/performance-score.constants";
import {
  PERFORMANCE_INPUT_ENTITY_TYPE,
  PERFORMANCE_SCORE_ENTITY_TYPE,
  PerformanceScoreAuditAction,
} from "@/modules/trust/domain/audit-actions";
import {
  PERFORMANCE_EVENT_VERSION,
  PERFORMANCE_REVIEW_TRIGGERED_EVENT,
  PERFORMANCE_SCORE_UPDATED_EVENT,
  type PerformanceReviewTriggeredPayload,
  type PerformanceScoreUpdatedPayload,
} from "@/modules/trust/contracts/events";
import type {
  ComputePerformanceScoreInput,
  ComputePerformanceScoreOutcome,
  IngestPerformanceInputDeps,
  IngestPerformanceInputInput,
  IngestPerformanceInputOutcome,
  PerformanceComputeTrigger,
  PerformanceReviewReason,
  PerformanceScoreDeps,
  TriggerPerformanceReviewInput,
  TriggerPerformanceReviewOutcome,
} from "@/modules/trust/contracts/types";

/** The frozen compute-trigger set (SYNTAX oracle; Doc-4G §G6.2). */
const COMPUTE_TRIGGERS: ReadonlySet<PerformanceComputeTrigger> = new Set([
  "input_change",
  "scheduled_recalc",
  "formula_version_change",
]);

/** The frozen review-reason set (SYNTAX oracle; Doc-4G §G6.4). */
const REVIEW_REASONS: ReadonlySet<PerformanceReviewReason> = new Set([
  "threshold_crossing",
  "periodic_cadence",
  "dispute_pattern",
]);

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_PATTERN.test(v);
}

/**
 * `trust.ingest_performance_input.v1` (Doc-4G §G6.1) — the SOLE writer of `performance_inputs`. Appends one row
 * (idempotent on the dedup UNIQUE) + ONE `[ESC-TRUST-AUDIT]` audit, System attribution, atomically on `db`.
 * Emits NO event (computation publishes). A dedup replay writes NEITHER a row NOR an audit (idempotent no-op).
 */
export async function ingestPerformanceInput(
  input: IngestPerformanceInputInput,
  deps: IngestPerformanceInputDeps,
  db: DbExecutor = prisma,
): Promise<IngestPerformanceInputOutcome> {
  // (1) SYNTAX / SHAPE (Doc-4G §G6.1 stage 1–2).
  if (!isUuid(input.vendorProfileId) || !isUuid(input.sourceEntityId)) {
    return fail2(
      "VALIDATION",
      PERFORMANCE_INVALID_INPUT_CODE,
      "vendor_profile_id and source_entity_id must be uuids.",
    );
  }
  if (!isPerformanceSourceType(input.sourceType) || !isPerformanceInputType(input.inputType)) {
    return fail2(
      "VALIDATION",
      PERFORMANCE_INVALID_INPUT_CODE,
      "source_type / input_type must be in the Doc-2 §10.6 set.",
    );
  }
  if (!(input.occurredAt instanceof Date) || Number.isNaN(input.occurredAt.getTime())) {
    return fail2("VALIDATION", PERFORMANCE_INVALID_INPUT_CODE, "occurred_at must be a valid date.");
  }

  // (2) SEMANTIC (Doc-4G §G6.1 stage 3; §H.11) — the frozen-explicit input↔source consistency.
  if (!isInputSourceConsistent(input.inputType, input.sourceType)) {
    return fail2(
      "BUSINESS",
      PERFORMANCE_INPUT_INCONSISTENT_CODE,
      "response/decline/non_response inputs are only valid with source_type=invitation (Doc-4G §G6.1).",
    );
  }

  const rowId = uuidv7();

  // (3) WRITE — the idempotent SD append (ON CONFLICT dedup).
  const write = await appendPerformanceInput(
    {
      id: rowId,
      vendorProfileId: input.vendorProfileId,
      sourceEntityId: input.sourceEntityId,
      sourceType: input.sourceType,
      inputType: input.inputType,
      occurredAt: input.occurredAt,
      valueJsonb: input.valueJsonb ?? null,
      actorId: null, // System attribution
    },
    db,
  );

  // Idempotent dedup replay — NO new row, NO audit (the WP3 no-op precedent).
  if (!write.created) {
    return { ok: true, result: { performanceInputId: write.id, created: false } };
  }

  // (4) APPEND ONE audit via M0 — SAME tx. [ESC-TRUST-AUDIT], System attribution, entity performance_input.
  await deps.appendAuditRecord(
    {
      actorId: null,
      actorType: "system",
      organizationId: null,
      entityType: PERFORMANCE_INPUT_ENTITY_TYPE,
      entityId: rowId,
      action: PerformanceScoreAuditAction.INPUT_INGESTED,
      oldValue: null,
      newValue: {
        source_type: input.sourceType,
        source_entity_id: input.sourceEntityId,
        input_type: input.inputType,
      },
    },
    db,
  );

  return { ok: true, result: { performanceInputId: rowId, created: true } };
}

/**
 * `trust.compute_performance_score.v1` (Doc-4G §G6.2) — System; publisher of record for `PerformanceScoreUpdated`.
 * Reads the vendor's `performance_inputs` → calls the formula plug (Not-Rated gate; NULL below threshold, never
 * 0) → upserts the head + appends a history snapshot IFF changed → emits `PerformanceScoreUpdated`
 * (publish-on-change; SUPPRESSED while frozen) → appends ONE audit — ALL atomic on `db`. Idempotent on
 * inputs+formula (unchanged → no event, no snapshot, no audit).
 */
export async function computePerformanceScore(
  input: ComputePerformanceScoreInput,
  deps: PerformanceScoreDeps,
  db: DbExecutor = prisma,
): Promise<ComputePerformanceScoreOutcome> {
  // (1) SYNTAX (Doc-4G §G6.2 stage 1–2).
  if (!isUuid(input.vendorProfileId)) {
    return failC("VALIDATION", PERFORMANCE_INVALID_INPUT_CODE, "vendor_profile_id must be a uuid.");
  }
  if (typeof input.trigger !== "string" || !COMPUTE_TRIGGERS.has(input.trigger)) {
    return failC(
      "VALIDATION",
      PERFORMANCE_INVALID_INPUT_CODE,
      "trigger must be in the frozen set.",
    );
  }

  // (2) READ inputs → (3) formula plug (Not-Rated gate + firewall live inside the plug).
  const tally = await getPerformanceInputTally(input.vendorProfileId, db);
  const computation = computeScorePlug(tally, PERFORMANCE_FORMULA_VERSION);
  const rated = computation.minThresholdMet && computation.score !== null;

  // (4) SD upsert head + history-iff-changed (change-detection under the advisory lock — publish-on-change).
  const write = await upsertPerformanceScore(
    {
      id: uuidv7(),
      historyId: uuidv7(),
      vendorProfileId: input.vendorProfileId,
      score: computation.score,
      level: computation.level,
      componentsJson: computation.componentsJson,
      formulaVersion: PERFORMANCE_FORMULA_VERSION,
      minThresholdMet: computation.minThresholdMet,
      actorId: null, // System attribution
    },
    db,
  );

  const frozen = write.freezeState === "frozen";
  let published = false;

  if (write.changed) {
    // (5) EMIT `PerformanceScoreUpdated` via M0 — SAME tx — publish-on-change, SUPPRESSED while frozen (Doc-4G §H.5).
    if (!frozen) {
      const payload: Record<string, unknown> = {
        vendor_profile_id: input.vendorProfileId,
        rated,
      } satisfies PerformanceScoreUpdatedPayload;
      await deps.writeOutboxEvent(
        {
          eventName: PERFORMANCE_SCORE_UPDATED_EVENT,
          eventVersion: PERFORMANCE_EVENT_VERSION,
          aggregateId: input.vendorProfileId,
          payload,
        },
        db,
      );
      published = true;
    }

    // (6) APPEND ONE audit via M0 — SAME tx. ENUMERATED §9 action: "formula version change" when the formula
    //     changed on an existing head, else "recalculation" (both no-ESC — Doc-4G §G6.2 §7).
    const action = write.formulaChanged
      ? PerformanceScoreAuditAction.FORMULA_VERSION_CHANGED
      : PerformanceScoreAuditAction.RECALCULATED;
    await deps.appendAuditRecord(
      {
        actorId: null,
        actorType: "system",
        organizationId: null,
        entityType: PERFORMANCE_SCORE_ENTITY_TYPE,
        entityId: write.id,
        action,
        oldValue: null,
        newValue: {
          rated,
          min_threshold_met: computation.minThresholdMet,
          performance_formula_version: PERFORMANCE_FORMULA_VERSION,
          trigger: input.trigger,
          publication_suppressed: frozen,
        },
      },
      db,
    );
  }

  return {
    ok: true,
    result: {
      performanceScoreId: write.id,
      vendorProfileId: input.vendorProfileId,
      score: computation.score,
      level: computation.level,
      minThresholdMet: computation.minThresholdMet,
      rated,
      freezeState: write.freezeState,
      changed: write.changed,
      published,
      updatedAt: write.updatedAt.toISOString(),
    },
  };
}

/**
 * `trust.trigger_performance_review.v1` (Doc-4G §G6.4) — System; publisher of record for
 * `PerformanceReviewTriggered`. NO score write, no state change. Requires an existing `performance_scores` head
 * (Doc-4G §G6.4 §4 REFERENCE) → emits `PerformanceReviewTriggered` + ONE `[ESC-TRUST-AUDIT]` audit atomically on `db`.
 */
export async function triggerPerformanceReview(
  input: TriggerPerformanceReviewInput,
  deps: PerformanceScoreDeps,
  db: DbExecutor = prisma,
): Promise<TriggerPerformanceReviewOutcome> {
  // (1) SYNTAX (Doc-4G §G6.4 stage 1–2).
  if (!isUuid(input.vendorProfileId)) {
    return failT("VALIDATION", PERFORMANCE_INVALID_INPUT_CODE, "vendor_profile_id must be a uuid.");
  }
  if (typeof input.triggerReason !== "string" || !REVIEW_REASONS.has(input.triggerReason)) {
    return failT(
      "VALIDATION",
      PERFORMANCE_INVALID_INPUT_CODE,
      "trigger_reason must be in the frozen set.",
    );
  }

  // (2) REFERENCE (Doc-4G §G6.4 §4) — the review is a signal over an EXISTING score row. No head → REFERENCE.
  const head = await getPerformanceScoreByVendor(input.vendorProfileId, db);
  if (head === null) {
    return failT(
      "REFERENCE",
      PERFORMANCE_REVIEW_SUBJECT_UNRESOLVED_CODE,
      "No performance_scores row for this vendor (Doc-4G §G6.4).",
    );
  }

  // (3) EMIT `PerformanceReviewTriggered` via M0 — SAME tx (no score write; Doc-4G §G6.4 §6/§8).
  const payload: Record<string, unknown> = {
    vendor_profile_id: input.vendorProfileId,
    trigger_reason: input.triggerReason,
  } satisfies PerformanceReviewTriggeredPayload;
  await deps.writeOutboxEvent(
    {
      eventName: PERFORMANCE_REVIEW_TRIGGERED_EVENT,
      eventVersion: PERFORMANCE_EVENT_VERSION,
      aggregateId: input.vendorProfileId,
      payload,
    },
    db,
  );

  // (4) APPEND ONE audit via M0 — SAME tx. [ESC-TRUST-AUDIT], System attribution, entity performance_score.
  await deps.appendAuditRecord(
    {
      actorId: null,
      actorType: "system",
      organizationId: null,
      entityType: PERFORMANCE_SCORE_ENTITY_TYPE,
      entityId: head.id,
      action: PerformanceScoreAuditAction.REVIEW_TRIGGERED,
      oldValue: null,
      newValue: { trigger_reason: input.triggerReason },
    },
    db,
  );

  return {
    ok: true,
    result: {
      vendorProfileId: input.vendorProfileId,
      triggerReason: input.triggerReason,
      triggered: true,
    },
  };
}

// ── failure builders (per-contract error unions; classes per Doc-4A §12) ────────────────────────────────

function fail2(
  errorClass: "VALIDATION" | "BUSINESS",
  errorCode: string,
  message: string,
): IngestPerformanceInputOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}

function failC(
  errorClass: "VALIDATION" | "REFERENCE",
  errorCode: string,
  message: string,
): ComputePerformanceScoreOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}

function failT(
  errorClass: "VALIDATION" | "REFERENCE",
  errorCode: string,
  message: string,
): TriggerPerformanceReviewOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
