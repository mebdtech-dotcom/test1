// M5 application (PRIVATE) — the Fraud & Risk Signal write-lifecycle SERVICE (Doc-4G §G7.1/§G7.2; Doc-6G
// §3.4). The four mutations the DEFERRED Admin commands + System detectors will call — exercised DIRECTLY by
// tests. This is an IN-BAND AUDITED-WRITE aggregate (the D7/WP1 pattern) — ORCHESTRATION ONLY (owns no
// state): validate → in-band `fraud_signals` write → append ONE `[ESC-TRUST-AUDIT]` audit — ALL on the ONE
// caller-supplied staff tx executor.
//
// THREE FROZEN POSTURES (the crux — build EXACTLY):
//   • NO EVENT (Doc-4G §H.7): Doc-2 §8 has NO Trust fraud event → BC-TRUST-4 emits NONE. The injected dep is
//     `appendAuditRecord` ONLY (no `writeOutboxEvent`). This service NEVER calls `core.write_outbox_event.v1`.
//   • NO SD (Doc-6G §3.4 "NO SD"): `fraud_signals` RLS is `fraud_signals_admin FOR ALL` — writes go IN-BAND
//     under the staff GUC (`app.is_platform_staff = true`, natural for Admin AND System). The repository does
//     plain in-band SQL + a `pg_advisory_xact_lock` dedup — NO SECURITY-DEFINER function.
//   • FIREWALL (Doc-4G §H.9b/c; Invariant #6): a fraud signal records an INDICATOR and mutates NO Trust
//     Score / Performance Score / Verification / Financial Tier; it NEVER issues a ban (that is Admin's,
//     DG-5). This service writes `fraud_signals` (+ audit) and NOTHING else.
//
// THE TWO INVARIANTS (guaranteed by sharing ONE tx `db`, staff-GUC-scoped by the caller):
//   • No business write without an audit row — a create/triage that writes the row appends its audit in the
//     SAME tx; if the append fails, the tx rolls back and the in-band write is undone.
//   • No audit row without a real write — the create-dedup path (`created === false`) writes NO audit; a
//     failed triage (STATE/CONFLICT/NOT_FOUND) writes NO row and NO audit.
//
// AUDIT (Doc-4G §H.6): EVERY fraud action (create/review/action/dismiss) carries `[ESC-TRUST-AUDIT]` — Doc-2
// §9 enumerates no fraud action; the token binds the nearest §9 Trust action by pointer (`domain/audit-
// actions.ts`; no §9 action invented). Attribution: System (system-detected create) / Admin (staff create +
// all triage). `detectionRef`/`triageNote` (NO DB column, Doc-4G §H.10) ride the audit `newValue`.

import { prisma, type DbExecutor } from "@/shared/db";
import { UUID_PATTERN, uuidv7 } from "@/shared/ids";
import {
  getFraudSignalById,
  openFraudSignalDeduped,
  transitionFraudSignal,
} from "@/modules/trust/infrastructure/data/fraud-signal.repository";
import {
  FRAUD_SIGNAL_ENTITY_TYPE,
  FraudSignalAuditAction,
  type FraudSignalAuditActionToken,
} from "@/modules/trust/domain/audit-actions";
import {
  fraudSignalTargetState,
  isFraudSignalSourceLegal,
  type FraudSignalTriageOperation,
} from "@/modules/trust/domain/fraud-signal.state";
import {
  FRAUD_SIGNAL_ILLEGAL_STATE_CODE,
  FRAUD_SIGNAL_INVALID_INPUT_CODE,
  FRAUD_SIGNAL_NOT_FOUND_CODE,
  FRAUD_SIGNAL_REVISION_CONFLICT_CODE,
} from "@/modules/trust/domain/fraud-signal.constants";
import type { CoreActorType } from "@/modules/core/contracts";
import type {
  CreateFraudSignalInput,
  CreateFraudSignalOutcome,
  FraudSignalActorContext,
  FraudSignalDeps,
  FraudSignalError,
  FraudSignalTriageInput,
  FraudSignalTriageOutcome,
} from "@/modules/trust/contracts/types";

function createFail(
  errorClass: FraudSignalError["errorClass"],
  errorCode: string,
  message: string,
): CreateFraudSignalOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}

function triageFail(
  errorClass: FraudSignalError["errorClass"],
  errorCode: string,
  message: string,
): FraudSignalTriageOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** A non-empty trimmed string? (`subject_type`/`signal_type`/`severity` are TEXT — Doc-2 §10.6 declares no
 *  value set → validate NON-EMPTY only; membership `[ESC]`-deferred, no fixed enum coined.) */
function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * `create_fraud_signal` (Doc-4G §G7.1) — open a fraud signal at `open`, IN-BAND, appending ONE
 * `[ESC-TRUST-AUDIT]` audit atomically. System-detected (`ctx.actorType='system'`, `actorId=null`) or
 * staff-reported (`ctx.actorType='admin'`, `actorId`=staff). IDEMPOTENT on the detection key
 * `(subject_id, subject_type, signal_type)` while a non-terminal signal exists — a duplicate indicator
 * returns the existing signal with NO 2nd row / NO 2nd audit (Doc-4G §H.8 / §G7.1 §10). NO event (Doc-4G §H.7).
 */
export async function createFraudSignal(
  input: CreateFraudSignalInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db: DbExecutor = prisma,
): Promise<CreateFraudSignalOutcome> {
  // (1) SYNTAX (Doc-4G §G7.1 stage 1/2) — subject_id uuid; subject_type/signal_type/severity NON-EMPTY text.
  if (typeof input.subjectId !== "string" || !UUID_PATTERN.test(input.subjectId)) {
    return createFail("VALIDATION", FRAUD_SIGNAL_INVALID_INPUT_CODE, "subject_id must be a uuid.");
  }
  if (!isNonEmptyString(input.subjectType)) {
    return createFail(
      "VALIDATION",
      FRAUD_SIGNAL_INVALID_INPUT_CODE,
      "subject_type is required (non-empty).",
    );
  }
  if (!isNonEmptyString(input.signalType)) {
    return createFail(
      "VALIDATION",
      FRAUD_SIGNAL_INVALID_INPUT_CODE,
      "signal_type is required (non-empty).",
    );
  }
  if (!isNonEmptyString(input.severity)) {
    return createFail(
      "VALIDATION",
      FRAUD_SIGNAL_INVALID_INPUT_CODE,
      "severity is required (non-empty).",
    );
  }

  // (2) WRITE — the IN-BAND dedup check-then-insert (advisory lock + probe + conditional insert; NO SD). The
  //     repository owns the SQL; no audit knowledge. `reported_by`/`created_by`/`updated_by` = the actor.
  const write = await openFraudSignalDeduped(
    {
      id: uuidv7(),
      subjectId: input.subjectId,
      subjectType: input.subjectType.trim(),
      signalType: input.signalType.trim(),
      severity: input.severity.trim(),
      reportedBy: ctx.actorId,
    },
    db,
  );

  // (3) DEDUP (Doc-4G §H.8) — a live signal already existed → return it, NO row, NO audit (Invariant 2).
  if (!write.created) {
    return {
      ok: true,
      result: {
        fraudSignalId: write.id,
        state: write.state,
        created: false,
        updatedAt: write.updatedAt.toISOString(),
      },
    };
  }

  // (4) AUDIT — atomic with the in-band insert (SAME tx `db`), via the M0 facade ONLY. `[ESC-TRUST-AUDIT]`
  //     `fraud_signal_created`, System/Admin attribution. `detectionRef` (no DB column) rides `newValue`. If
  //     this throws, the whole tx (incl. the insert) rolls back (Invariant 1). NO event (Doc-4G §H.7).
  const actorType: CoreActorType = ctx.actorType; // 'system' | 'admin'
  await deps.appendAuditRecord(
    {
      actorId: ctx.actorId,
      actorType,
      organizationId: null, // platform action (no active org; Doc-4B §5.6)
      entityType: FRAUD_SIGNAL_ENTITY_TYPE,
      entityId: write.id,
      action: FraudSignalAuditAction.CREATED,
      oldValue: null,
      newValue: {
        subject_id: input.subjectId,
        subject_type: input.subjectType.trim(),
        signal_type: input.signalType.trim(),
        severity: input.severity.trim(),
        state: "open",
        detection_ref: input.detectionRef ?? null, // audit-only (Doc-4G §H.10 — no column)
      },
    },
    db,
  );

  return {
    ok: true,
    result: {
      fraudSignalId: write.id,
      state: write.state,
      created: true,
      updatedAt: write.updatedAt.toISOString(),
    },
  };
}

/**
 * Shared triage transition (review/action/dismiss) — read → state-machine guard → in-band optimistic
 * transition → append ONE `[ESC-TRUST-AUDIT]` audit, atomically. NO event, NO score/verification/tier write
 * (firewall). `triageNote` (no DB column) rides the audit `newValue`. Attribution: Admin.
 */
async function triage(
  operation: FraudSignalTriageOperation,
  auditAction: FraudSignalAuditActionToken,
  input: FraudSignalTriageInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db: DbExecutor,
): Promise<FraudSignalTriageOutcome> {
  // (1) SYNTAX.
  if (typeof input.fraudSignalId !== "string" || !UUID_PATTERN.test(input.fraudSignalId)) {
    return triageFail(
      "VALIDATION",
      FRAUD_SIGNAL_INVALID_INPUT_CODE,
      "fraud_signal_id must be a uuid.",
    );
  }

  // (2) REFERENCE — read the signal (RLS admits staff). Absent → NOT_FOUND (also the non-staff protected-fact
  //     collapse under RLS, Doc-4G §H.9f).
  const current = await getFraudSignalById(input.fraudSignalId, db);
  if (current === null) {
    return triageFail("NOT_FOUND", FRAUD_SIGNAL_NOT_FOUND_CODE, "Not found.");
  }

  // (3) STATE — the domain machine gates the source (review←open; action/dismiss←reviewed; terminal → STATE).
  if (!isFraudSignalSourceLegal(operation, current.state)) {
    return triageFail(
      "STATE",
      FRAUD_SIGNAL_ILLEGAL_STATE_CODE,
      `${operation} requires source state ${
        operation === "review" ? "open" : "reviewed"
      } (Doc-4G §G7.2).`,
    );
  }

  const targetState = fraudSignalTargetState(operation);
  const expected = input.expectedUpdatedAt ?? current.updatedAt;

  // (4) WRITE — IN-BAND optimistic transition (guarded by `updated_at = expected AND state = source`; NO SD).
  const write = await transitionFraudSignal(
    {
      id: current.id,
      expectedUpdatedAt: expected,
      sourceState: current.state,
      targetState,
      actorId: ctx.actorId,
    },
    db,
  );
  if (write.matched === 0 || write.newUpdatedAt === null) {
    return triageFail(
      "CONFLICT",
      FRAUD_SIGNAL_REVISION_CONFLICT_CODE,
      "The fraud signal changed since it was read; re-read then retry.",
    );
  }

  // (5) AUDIT — atomic with the transition (SAME tx `db`), via the M0 facade ONLY. `[ESC-TRUST-AUDIT]`,
  //     Admin attribution. `triageNote` (no DB column) rides `newValue`. If this throws, the tx (incl. the
  //     transition) rolls back. NO event (Doc-4G §H.7).
  await deps.appendAuditRecord(
    {
      actorId: ctx.actorId,
      actorType: "admin",
      organizationId: null,
      entityType: FRAUD_SIGNAL_ENTITY_TYPE,
      entityId: current.id,
      action: auditAction,
      oldValue: { state: current.state },
      newValue: { state: targetState, triage_note: input.triageNote ?? null },
    },
    db,
  );

  return {
    ok: true,
    result: {
      fraudSignalId: current.id,
      state: targetState,
      updatedAt: write.newUpdatedAt.toISOString(),
    },
  };
}

/** `review_fraud_signal` (Doc-4G §G7.2) — open → reviewed (Admin). */
export async function reviewFraudSignal(
  input: FraudSignalTriageInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db: DbExecutor = prisma,
): Promise<FraudSignalTriageOutcome> {
  return triage("review", FraudSignalAuditAction.REVIEWED, input, ctx, deps, db);
}

/** `action_fraud_signal` (Doc-4G §G7.2) — reviewed → actioned, terminal (Admin). NEVER issues a ban (DG-5). */
export async function actionFraudSignal(
  input: FraudSignalTriageInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db: DbExecutor = prisma,
): Promise<FraudSignalTriageOutcome> {
  return triage("action", FraudSignalAuditAction.ACTIONED, input, ctx, deps, db);
}

/** `dismiss_fraud_signal` (Doc-4G §G7.2) — reviewed → dismissed, terminal (Admin). */
export async function dismissFraudSignal(
  input: FraudSignalTriageInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db: DbExecutor = prisma,
): Promise<FraudSignalTriageOutcome> {
  return triage("dismiss", FraudSignalAuditAction.DISMISSED, input, ctx, deps, db);
}
