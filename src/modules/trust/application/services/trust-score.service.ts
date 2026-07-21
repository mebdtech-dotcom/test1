// M5 application (PRIVATE) — the BC-TRUST-2 Trust-Score compute SERVICE (Doc-4G §G5.1; Doc-6G §3.2). The
// System contract exercised DIRECTLY by tests (the live Inngest production triggers + M2/M3 event-consumption
// wiring, the §G5.3 reads, and §G5.2 freeze/reactivate are DEFERRED — the WP3/WP4a precedent). ORCHESTRATION
// ONLY (owns no state): read firewall-scoped inputs → formula plug → SD-function write → EMIT via M0 outbox →
// append audit — ALL on the SAME caller-supplied tx executor.
//
// THE WRITE-PLUS-EMIT-PLUS-AUDIT ATOMICITY (Doc-8F; the WP3/WP4a pattern): the SD head upsert + history snapshot
// (owner-role RLS bypass, participates in the caller's tx), the `TrustScoreUpdated` emit (M0
// `core.write_outbox_event.v1`), and the ONE audit (M0 `core.append_audit_record.v1`) ALL run on the ONE tx
// `db`. Emit-failure OR audit-failure rolls the WHOLE tx back — no head/history row, no event, no audit. An
// unchanged recompute writes NOTHING (no head write, no snapshot, no event, no audit) — publish-on-change
// idempotency (Doc-4G §H.8: idempotent on inputs + `trust_formula_version`).
//
// FROZEN INVARIANTS ENFORCED (built for real — the formula math is the ONLY interim, in `trust-score.formula.ts`):
//   • ⛔ FIREWALL (Invariant #6 / Doc-4G §H.9b/c) — the Trust Score CONSUMES Verification + Performance + Fraud
//     ONLY; it is INVARIANT to Financial Tier (`verified_financial_tiers` is NEVER read) and to Buyer-Vendor
//     Status. This module imports NOTHING from M1/M2 (core contract TYPES only — the WP2 precedent).
//   • ABSENCE ≠ 0 (Doc-3 §12.1 FIXED) — a no-input vendor gets a NON-ZERO baseline, never 0; the score is
//     ALWAYS 0–100 (Doc-6G §3.2.1 `NOT NULL` — no Not-Rated NULL state). The baseline lives in the domain plug.
//   • Publish-on-change — `TrustScoreUpdated` only on a score/band/formula change (SD `changed` flag).
//   • Frozen suppression — while `freeze_state='frozen'` the recompute + snapshot still occur, the event is
//     SUPPRESSED (Doc-4G §H.5/§G5.1 §6). freeze/reactivate itself is DEFERRED (a later WP).
//
// BOUNDARY: M0 `appendAuditRecord` + `writeOutboxEvent` are INJECTED as contract TYPES. Attribution: System
// throughout (Doc-4G §H.6 — no tenant/staff). The caller's tx MUST carry the platform-staff GUC
// (`app.is_platform_staff = true`) — natural for the System actor — so the input reads (verification_records +
// performance_scores) are RLS-admitted and the outbox INSERT + audit append are admitted.
//
// [ESC-TRUST-POLICY] — the formula weights/band-thresholds/baseline (the plug). [ESC-TRUST-CODE] — the interim
// `trust_trust_score_*` error register. [ESC-TRUST-SDWRITE] — the SD writer. NO `[ESC-TRUST-AUDIT]` — both
// compute audit actions (recalculation / formula version change) ARE separately enumerated (Doc-4G §H.6).

import { prisma, type DbExecutor } from "@/shared/db";
import { UUID_PATTERN, uuidv7 } from "@/shared/ids";
import {
  getApprovedVerificationSummary,
  getPerformanceSummaryForTrust,
  readFraudSignalState,
  upsertTrustScore,
} from "@/modules/trust/infrastructure/data/trust-score.repository";
import { computeTrustScore as computeScorePlug } from "@/modules/trust/domain/trust-score.formula";
import {
  isTrustComputeTrigger,
  TRUST_FORMULA_VERSION,
  TRUST_SCORE_INVALID_INPUT_CODE,
} from "@/modules/trust/domain/trust-score.constants";
import {
  TRUST_SCORE_ENTITY_TYPE,
  TrustScoreAuditAction,
} from "@/modules/trust/domain/audit-actions";
import {
  TRUST_EVENT_VERSION,
  TRUST_SCORE_UPDATED_EVENT,
  type TrustScoreUpdatedPayload,
} from "@/modules/trust/contracts/events";
import type {
  ComputeTrustScoreInput,
  ComputeTrustScoreOutcome,
  TrustScoreDeps,
} from "@/modules/trust/contracts/types";

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_PATTERN.test(v);
}

/**
 * `trust.compute_trust_score.v1` (Doc-4G §G5.1) — System; publisher of record for `TrustScoreUpdated`.
 * Reads the vendor's firewall-scoped inputs — Verification (`verification_records`) + Performance
 * (`performance_scores` head) + the Fraud read-seam (neutral-absent) — → calls the formula plug (absence ≠ 0;
 * a NON-ZERO baseline for a no-input vendor; the score is ALWAYS 0–100) → upserts the head + appends a history
 * snapshot IFF changed → emits `TrustScoreUpdated` (publish-on-change; band-only, SUPPRESSED while frozen) →
 * appends ONE audit — ALL atomic on `db`. Idempotent on inputs + `trust_formula_version` (unchanged → no event,
 * no snapshot, no audit). The Trust Score is INVARIANT to Financial Tier (never read here) — Invariant #6.
 */
export async function computeTrustScore(
  input: ComputeTrustScoreInput,
  deps: TrustScoreDeps,
  db: DbExecutor = prisma,
): Promise<ComputeTrustScoreOutcome> {
  // (1) SYNTAX (Doc-4G §G5.1 stage 1–2).
  if (!isUuid(input.vendorProfileId)) {
    return fail("VALIDATION", TRUST_SCORE_INVALID_INPUT_CODE, "vendor_profile_id must be a uuid.");
  }
  if (!isTrustComputeTrigger(input.trigger)) {
    return fail("VALIDATION", TRUST_SCORE_INVALID_INPUT_CODE, "trigger must be in the frozen set.");
  }

  // (2) READ the firewall-scoped inputs (Verification + Performance + Fraud ONLY — Doc-4G §H.9b). Absence is
  //     TOLERATED (no REFERENCE): a missing verification / performance row / fraud signal is a valid neutral
  //     input. NEVER reads verified_financial_tiers or Buyer-Vendor Status (Invariant #6).
  const verification = await getApprovedVerificationSummary(input.vendorProfileId, db);
  const performance = await getPerformanceSummaryForTrust(input.vendorProfileId, db);
  const fraud = readFraudSignalState();

  // (3) formula plug (absence ≠ 0 non-zero baseline; deterministic; firewall-safe). ALWAYS a 0–100 score + band.
  const computation = computeScorePlug({ verification, performance, fraud }, TRUST_FORMULA_VERSION);

  // (4) SD upsert head + history-iff-changed (change-detection under the advisory lock — publish-on-change).
  const write = await upsertTrustScore(
    {
      id: uuidv7(),
      historyId: uuidv7(),
      vendorProfileId: input.vendorProfileId,
      score: computation.score,
      band: computation.band,
      formulaVersion: TRUST_FORMULA_VERSION,
      actorId: null, // System attribution
    },
    db,
  );

  const frozen = write.freezeState === "frozen";
  let published = false;

  if (write.changed) {
    // (5) EMIT `TrustScoreUpdated` via M0 — SAME tx — publish-on-change, SUPPRESSED while frozen (Doc-4G §H.5).
    //     THIN payload: {vendorProfileId, band} — band is PUBLIC (Doc-2 §3.6); NO numeric score in the event.
    if (!frozen) {
      const payload: Record<string, unknown> = {
        vendor_profile_id: input.vendorProfileId,
        band: computation.band,
      } satisfies TrustScoreUpdatedPayload;
      await deps.writeOutboxEvent(
        {
          eventName: TRUST_SCORE_UPDATED_EVENT,
          eventVersion: TRUST_EVENT_VERSION,
          aggregateId: input.vendorProfileId,
          payload,
        },
        db,
      );
      published = true;
    }

    // (6) APPEND ONE audit via M0 — SAME tx. ENUMERATED §9 action: "formula version change" when the formula
    //     changed on an existing head, else "recalculation" (both no-ESC — Doc-4G §G5.1 §7 / §H.6). The audit
    //     newValue carries the PUBLIC band + firewall-safe input trace (no numeric score; no firewalled signal).
    const action = write.formulaChanged
      ? TrustScoreAuditAction.FORMULA_VERSION_CHANGED
      : TrustScoreAuditAction.RECALCULATED;
    await deps.appendAuditRecord(
      {
        actorId: null,
        actorType: "system",
        organizationId: null,
        entityType: TRUST_SCORE_ENTITY_TYPE,
        entityId: write.id,
        action,
        oldValue: null,
        newValue: {
          band: computation.band,
          trust_formula_version: TRUST_FORMULA_VERSION,
          trigger: input.trigger,
          publication_suppressed: frozen,
          components: computation.componentsMeta,
        },
      },
      db,
    );
  }

  return {
    ok: true,
    result: {
      trustScoreId: write.id,
      vendorProfileId: input.vendorProfileId,
      score: computation.score,
      band: computation.band,
      freezeState: write.freezeState,
      changed: write.changed,
      published,
      updatedAt: write.updatedAt.toISOString(),
    },
  };
}

// ── failure builder (per-contract error union; classes per Doc-4A §12) ──────────────────────────────────

function fail(
  errorClass: "VALIDATION" | "REFERENCE",
  errorCode: string,
  message: string,
): ComputeTrustScoreOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
