// Public DTOs / IDs for module "trust" (cross-module surface). DTOs/IDs only — domain value-objects
// stay private. Realized per the module's frozen Doc-4G / Doc-5G / Doc-6G contracts, bound by pointer.
//
// W3-TRUST-2 realizes the `trust.request_verification.v1` write DTOs (Doc-4G §G4.1; wire Doc-5G §4).
// This WP is RESTRICTED to `subject_type = organization`; the other frozen subject types are enumerated
// here (the fixed Doc-2 §10.6 set) but application-DEFERRED (see the command). Field names/semantics are
// owned by Doc-4G §G4.1 + Doc-2 §10.6; bound by pointer, never re-authored.

import type { DbExecutor } from "@/shared/db";
import type { AppendAuditRecord, WriteOutboxEvent } from "@/modules/core/contracts";

/** The `trust.verification_subject_type` value set (Doc-2 §10.6 / Doc-6G §3.1.1; fixed — do not extend). */
export type VerificationSubjectTypeValue =
  | "vendor_profile"
  | "organization"
  | "capacity"
  | "declared_tier";

/** The `trust.verification_type` value set (Doc-2 §10.6 / Doc-6G §3.1.1; fixed — do not extend). */
export type VerificationTypeValue =
  | "contact"
  | "business"
  | "factory"
  | "organization"
  | "tier"
  | "capacity";

/** The `trust.verification_state` value set (Doc-2 §5.6 / Doc-6G §3.1.1). The open-case entry state is
 *  `requested` (Doc-4G §G4.1 metadata "Lifecycle entry Doc-2 §5.6 `requested`"). */
export type VerificationStateValue =
  | "requested"
  | "in_review"
  | "approved"
  | "rejected"
  | "expired"
  | "revoked";

/**
 * Input to `trust.request_verification.v1` (Doc-4G §G4.1 request schema). The submitting org is the
 * SERVER-RESOLVED active org (Invariant #5 — never client input) and is NOT part of this input.
 *
 * W3-TRUST-2 scope: `subjectType` MUST be `organization`; any other (frozen-valid) subject type is a
 * WP-scope VALIDATION reject (deferred — needs M2/M1 ownership resolution the platform lacks today).
 */
export interface RequestVerificationInput {
  /** `subject_id : uuid : required` (Doc-4G §G4.1) — the org being verified; a bare cross-module UUID
   *  (no FK). This WP: MUST equal the submitting active org (SCOPE — the org owns itself). */
  subjectId: string;
  /** `subject_type : enum : required` (Doc-4G §G4.1; Doc-2 §10.6 fixed set). This WP: `organization`. */
  subjectType: VerificationSubjectTypeValue;
  /** `verification_type : enum : required` (Doc-4G §G4.1; Doc-2 §10.6 fixed set). */
  verificationType: VerificationTypeValue;
  /** `evidence_document_refs : uuid[] : optional : 0..n` (Doc-4G §G4.1) — Platform Core storage refs;
   *  bare UUIDs (no FK). Omit ⇒ empty set. */
  evidenceDocumentRefs?: string[];
}

/** The server-resolved request context for the write (from the active-org context guard — never
 *  client input; Invariant #5). */
export interface RequestVerificationContext {
  /** The acting `identity.users` id (= `app.user_id`; the `requested_by` attribution). */
  userId: string;
  /** The server-resolved active org (= `app.active_org`; the submitting org — Invariant #5). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (no module re-implements audit). */
export interface RequestVerificationDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE (`@/modules/core/contracts`). */
  appendAuditRecord: AppendAuditRecord;
}

/** Result of a successful `request_verification` (Doc-4G §G4.1 response; `reference_id` rides the
 *  Doc-5A §5.6 envelope top-level, not `result`). Property names camelCase (Doc-5A Option B). */
export interface RequestVerificationResult {
  /** The opened `verification_records.id` (UUIDv7). */
  verificationRecordId: string;
  /** Always `requested` on a fresh open (Doc-4G §G4.1 — lifecycle entry `requested`). */
  state: VerificationStateValue;
}

/** Error outcome of `request_verification` (Doc-4G §G4.1 error register; classes per Doc-5A §6.2). The
 *  `errorCode` strings are the interim `trust_verification_*` register ([ESC-TRUST-CODE]). */
export interface RequestVerificationError {
  /** Doc-5A §6.2 class → HTTP status (VALIDATION→400 · AUTHORIZATION→403 · NOT_FOUND→404 · BUSINESS→422). */
  errorClass: "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "BUSINESS";
  /** The interim `trust_verification_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/** Outcome of `trust.request_verification.v1`. `ok:true` ⇒ `201` (a fresh open case). */
export type RequestVerificationOutcome =
  | { ok: true; result: RequestVerificationResult }
  | { ok: false; error: RequestVerificationError };

// ── W3-TRUST-3 — Verified Financial Tier write-service DTOs (Doc-4G §G4.6/§G4.7; Doc-6G §3.1.3) ────────
// The write-service functions (establish/confirm/downgrade/suspend/expire) are exercised DIRECTLY by tests.
// The admin HTTP commands (+ `staff_can_verify` authz + routes) and the System expire timer are DEFERRED.
// The `set` basis `verification_record_id` (§G4.6 line 322, REQUIRED) IS enforced in-band (stage-8 BUSINESS,
// line 339): `establishVerifiedTier` reads trust's OWN WP1 `verification_records` table and requires an
// APPROVED tier verification for this vendor — no verified tier / `VendorTierChanged` is minted without it.
// DEFERRED (genuinely cross-module — the legitimate WP2-style edge deferral): the stage-7 REFERENCE
// resolution of `vendor_profile_id` itself against M2/Marketplace (DG-2) — see the service header `[ESC]`
// note; no M2 resolver is built here. Field names/semantics owned by Doc-4G §G4.6/§G4.7 + Doc-2 §10.6.

/** The `trust.financial_tier` value set (Doc-2 §10.6 / Doc-6G §3.1.3; fixed A–E — do not extend). */
export type FinancialTier = "A" | "B" | "C" | "D" | "E";

/** The `trust.verified_tier_status` value set (Doc-2 §10.6 / Doc-6G §3.1.3). */
export type VerifiedTierStatus = "pending_verification" | "verified" | "suspended" | "expired";

/** The acting-staff context for the Admin verified-tier transitions (set/confirm/downgrade/suspend). The
 *  `staff_can_verify` AUTHZ is performed at the DEFERRED composition edge BEFORE the service runs (WP2
 *  precedent); this carries only the Doc-2 §9 attribution (`actorId` = the acting staff user). */
export interface VerifiedTierAdminContext {
  /** The acting `identity.users` staff id — the Doc-2 §9 audit attribution (Admin actor). */
  actorId: string;
}

/**
 * Injected Module 0 contract services — the ONLY audit-write + outbox-emit surfaces (no module
 * re-implements audit/outbox). Both are M0 TYPES from `@/modules/core/contracts` (the trust module imports
 * NOTHING from M1/M2; core contract TYPES are allowed — the WP2 precedent).
 */
export interface VerifiedTierDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** `core.write_outbox_event.v1` (Doc-4B §B10), injected by the contract TYPE — the FIRST §8 emitter. */
  writeOutboxEvent: WriteOutboxEvent;
}

/** `set` (establish) input (Doc-4G §G4.6) — absence-of-row → verified. */
export interface EstablishVerifiedTierInput {
  /** `vendor_profile_id : uuid : required` — a bare cross-module UUID → M2 (no FK); UNIQUE per vendor. */
  vendorProfileId: string;
  /** `verification_record_id : uuid : required` (§G4.6 line 322) — the APPROVED tier-verification basis.
   *  Enforced in-band (stage-8 BUSINESS): must be an `approved`, `verification_type='tier'` record whose
   *  subject IS this vendor (`subject_type='vendor_profile' AND subject_id=vendor_profile_id`; §G4.1). */
  verificationRecordId: string;
  /** `tier : enum<A|B|C|D|E> : required` (Doc-2 §10.6 fixed band). */
  tier: FinancialTier;
  /** `basis_jsonb : jsonb : optional` (Doc-2 §10.6) — OPAQUE (dev-doc shape); persisted as-is, not schema-validated. */
  basisJsonb?: Record<string, unknown> | null;
}

/** `confirm` input (Doc-4G §G4.6) — verified → verified; renews `next_review_at` (+24mo); tier unchanged. */
export interface ConfirmVerifiedTierInput {
  vendorProfileId: string;
  /** `expected_revision` (Doc-4G §G4.6) realized against `updated_at`. Omit ⇒ use the current row's token. */
  expectedUpdatedAt?: Date | null;
}

/** `downgrade` input (Doc-4G §G4.6) — verified → verified at a STRICTLY lower tier band. */
export interface DowngradeVerifiedTierInput {
  vendorProfileId: string;
  /** `tier : enum<A|B|C|D|E>` — the new (lower) band; must be strictly weaker than the current tier. */
  newTier: FinancialTier;
  /** `expected_revision` realized against `updated_at`. Omit ⇒ use the current row's token. */
  expectedUpdatedAt?: Date | null;
}

/** `suspend` input (Doc-4G §G4.7) — verified → suspended; `reason` mandatory. */
export interface SuspendVerifiedTierInput {
  vendorProfileId: string;
  /** `reason : text : required` (Doc-4G §G4.7) — the mandatory suspension reason. */
  reason: string;
  /** `expected_revision` realized against `updated_at`. Omit ⇒ use the current row's token. */
  expectedUpdatedAt?: Date | null;
}

/** `expire` input (Doc-4G §G4.7) — verified → expired; System; on the 24-month review lapse. Idempotent. */
export interface ExpireVerifiedTierInput {
  vendorProfileId: string;
  /** The "now" the review-due check compares `next_review_at` against (server clock; injectable for tests). */
  now?: Date;
}

/** Result of an applied (or no-op) verified-tier transition (Doc-4G §G4.6/§G4.7 response). Property names
 *  camelCase (Doc-5A Option B); `reference_id` (deferred admin command) rides the envelope, not `result`. */
export interface VerifiedTierResult {
  /** The `verified_financial_tiers.id` (UUIDv7). */
  verifiedFinancialTierId: string;
  /** The vendor the tier belongs to (bare UUID → M2). */
  vendorProfileId: string;
  /** The tier after the transition (A–E). */
  tier: FinancialTier;
  /** The status after the transition. */
  status: VerifiedTierStatus;
  /** `next_review_at` (ISO-8601 UTC) or `null`. */
  nextReviewAt: string | null;
  /** The NEW `updated_at` (ISO-8601 UTC) — the caller's next `expected_revision` optimistic token. */
  updatedAt: string;
  /** `false` ONLY for an `expire` no-op skip (non-verified source) — NO event/audit written on a no-op. */
  applied: boolean;
}

/** Error outcome of a verified-tier transition (Doc-4G §G4.6/§G4.7 error register; classes per Doc-5A §6.2).
 *  The `errorCode` strings are the interim `trust_verified_tier_*` register ([ESC-TRUST-CODE]). */
export interface VerifiedTierError {
  /** Doc-5A §6.2 class → HTTP status (VALIDATION→400 · NOT_FOUND→404 · STATE/CONFLICT→409 · BUSINESS→422). */
  errorClass: "VALIDATION" | "NOT_FOUND" | "STATE" | "CONFLICT" | "BUSINESS";
  /** The interim `trust_verified_tier_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/** Outcome of a verified-tier transition. `ok:true` ⇒ applied (or an idempotent expire no-op). */
export type VerifiedTierOutcome =
  | { ok: true; result: VerifiedTierResult }
  | { ok: false; error: VerifiedTierError };

// ── W3-TRUST-4a — BC-TRUST-3 Performance Scoring DTOs (Doc-4G §G6.1/§G6.2/§G6.4; Doc-6G §3.3) ──────────
// The three System write-services (ingest / compute / trigger_review) are exercised DIRECTLY by tests. The
// live Inngest production triggers + M4/M3 event-consumption wiring + the reads (§G6.5) + freeze/reactivate
// (§G6.3, Admin 21.6) are DEFERRED to later WPs. Field names/semantics owned by Doc-4G §G6 + Doc-2 §10.6;
// bound by pointer, never re-authored. All three are System-actor (no slug; Doc-4G §H.3) — no tenant body.

/** The `trust.performance_input_type` value set (Doc-2 §10.6 / Doc-6G §3.3.3; fixed — do not extend). */
export type PerformanceInputTypeValue =
  | "response"
  | "decline"
  | "non_response"
  | "delivery"
  | "feedback"
  | "dispute"
  | "completion";

/** The `trust.performance_source_type` value set (Doc-2 §10.6 / Doc-6G §3.3.3; fixed — do not extend). */
export type PerformanceSourceTypeValue = "invitation" | "quotation" | "engagement" | "wcc";

/** The `trust.score_freeze_state` value set (Doc-2 §10.6 / Doc-6G §3.3.1; fixed). */
export type ScoreFreezeStateValue = "none" | "frozen";

/** `compute_performance_score` trigger (Doc-4G §G6.2 request schema; fixed — do not extend). */
export type PerformanceComputeTrigger =
  | "input_change"
  | "scheduled_recalc"
  | "formula_version_change";

/** `trigger_performance_review` reason (Doc-4G §G6.4 request schema; fixed — do not extend). */
export type PerformanceReviewReason = "threshold_crossing" | "periodic_cadence" | "dispute_pattern";

// ── ingest_performance_input.v1 (Doc-4G §G6.1) — sole writer of performance_inputs; emits NO event ──────

/** Input to `trust.ingest_performance_input.v1` (Doc-4G §G6.1 request schema; System/internal-service). */
export interface IngestPerformanceInputInput {
  /** `vendor_profile_id : uuid : required` — bare cross-module UUID → M2 (no FK). */
  vendorProfileId: string;
  /** `source_type : enum : required` (Doc-2 §10.6 fixed set). */
  sourceType: PerformanceSourceTypeValue;
  /** `source_entity_id : uuid : required` — the invitation/quotation/engagement/wcc ref (bare UUID → M3/M4). */
  sourceEntityId: string;
  /** `input_type : enum : required` (Doc-2 §10.6 fixed set). */
  inputType: PerformanceInputTypeValue;
  /** `occurred_at : timestamptz : required` — when the operational fact occurred. */
  occurredAt: Date;
  /** `value_jsonb : jsonb : optional` (Doc-2 §10.6) — OPAQUE (dev-doc shape); persisted as-is. */
  valueJsonb?: Record<string, unknown> | null;
  /** `source_event_id : uuid : optional` — the Doc-2 §8 event id, for event-sourced dedup provenance. The
   *  DB-enforced dedup is the `(source_type, source_entity_id, input_type)` UNIQUE (Doc-4G §G6.1 §10). */
  sourceEventId?: string | null;
}

/** Injected M0 audit-write surface for ingestion (NO outbox — ingestion emits no event; Doc-4G §G6.1 §8). */
export interface IngestPerformanceInputDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

/** Result of `ingest_performance_input` (Doc-4G §G6.1 §3 — no wire response; internal effect). */
export interface IngestPerformanceInputResult {
  /** The `performance_inputs.id` — the appended row, or (on a dedup replay) the pre-existing row. */
  performanceInputId: string;
  /** `false` on an idempotent dedup replay (NO new row, NO audit); `true` on a fresh append. */
  created: boolean;
}

/** Error outcome of `ingest_performance_input` (Doc-4G §G6.1 error register; classes per Doc-4A §12). */
export interface IngestPerformanceInputError {
  /** VALIDATION→400 · BUSINESS→422 (Doc-4A §12). */
  errorClass: "VALIDATION" | "BUSINESS";
  /** The interim `trust_performance_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  message: string;
}

export type IngestPerformanceInputOutcome =
  | { ok: true; result: IngestPerformanceInputResult }
  | { ok: false; error: IngestPerformanceInputError };

// ── compute_performance_score.v1 (Doc-4G §G6.2) — System; publisher of record for PerformanceScoreUpdated ─

/** Input to `trust.compute_performance_score.v1` (Doc-4G §G6.2 request schema; System trigger). The score is
 *  COMPUTED, never supplied (Doc-4G §H.9a). */
export interface ComputePerformanceScoreInput {
  vendorProfileId: string;
  /** `trigger : enum<input_change|scheduled_recalc|formula_version_change> : required`. */
  trigger: PerformanceComputeTrigger;
}

/** Injected M0 surfaces for compute (audit + outbox — the publish-on-change emit + one audit; Doc-4G §G6.2). */
export interface PerformanceScoreDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** `core.write_outbox_event.v1` (Doc-4B §B10), injected by contract TYPE. */
  writeOutboxEvent: WriteOutboxEvent;
}

/** Result of `compute_performance_score` (Doc-4G §G6.2 §3 internal effect; NOT the public badge — this
 *  internal result carries the numeric score for the System caller; the public numeric `score` stays staff-only). */
export interface ComputePerformanceScoreResult {
  /** The `performance_scores.id` (created on first compute, else the existing head). */
  performanceScoreId: string;
  vendorProfileId: string;
  /** 0–100, or NULL = Not Rated (below the min-threshold gate — never 0). */
  score: number | null;
  /** Interim `level` text (NULL while Not Rated). */
  level: string | null;
  /** The FROZEN min-threshold gate outcome (Doc-6G §3.3.1). `rated = !!score && minThresholdMet`. */
  minThresholdMet: boolean;
  /** `false` = Not Rated (score NULL; never surfaced as 0). */
  rated: boolean;
  /** The current freeze state (compute never mutates it; publication is suppressed while `frozen`). */
  freezeState: ScoreFreezeStateValue;
  /** `true` iff this compute changed (score/level/formula) → a snapshot was appended + one audit written. */
  changed: boolean;
  /** `true` iff a `PerformanceScoreUpdated` event was published (changed AND not frozen). */
  published: boolean;
  /** The `performance_score_updated_at` / optimistic token (ISO-8601 UTC). */
  updatedAt: string;
}

export interface ComputePerformanceScoreError {
  errorClass: "VALIDATION" | "REFERENCE";
  errorCode: string;
  message: string;
}

export type ComputePerformanceScoreOutcome =
  | { ok: true; result: ComputePerformanceScoreResult }
  | { ok: false; error: ComputePerformanceScoreError };

// ── trigger_performance_review.v1 (Doc-4G §G6.4) — System; publisher of record for PerformanceReviewTriggered ─

/** Input to `trust.trigger_performance_review.v1` (Doc-4G §G6.4 request schema; System trigger). No score write. */
export interface TriggerPerformanceReviewInput {
  vendorProfileId: string;
  /** `trigger_reason : enum<threshold_crossing|periodic_cadence|dispute_pattern> : required`. */
  triggerReason: PerformanceReviewReason;
}

/** Result of `trigger_performance_review` (Doc-4G §G6.4 §3 internal effect; a published event for staff attention). */
export interface TriggerPerformanceReviewResult {
  vendorProfileId: string;
  triggerReason: PerformanceReviewReason;
  /** Always `true` on success — the review event was published. NO score value written. */
  triggered: boolean;
}

export interface TriggerPerformanceReviewError {
  errorClass: "VALIDATION" | "REFERENCE";
  errorCode: string;
  message: string;
}

export type TriggerPerformanceReviewOutcome =
  | { ok: true; result: TriggerPerformanceReviewResult }
  | { ok: false; error: TriggerPerformanceReviewError };

// ── W3-TRUST-4b — BC-TRUST-2 Trust Scoring DTOs (Doc-4G §G5.1; Doc-6G §3.2) ────────────────────────────
// The System compute-service (`compute_trust_score`) is exercised DIRECTLY by tests. The live Inngest
// production triggers + event-consumption wiring, the reads (§G5.3 get band via M2 / list history staff), and
// freeze/reactivate (§G5.2, Admin) are DEFERRED to later WPs. Field names/semantics owned by Doc-4G §G5 +
// Doc-2 §3.6/§10.6; bound by pointer, never re-authored. Compute is System-actor (no slug; Doc-4G §H.3) — no
// tenant body. FIREWALL (Invariant #6): the Trust Score CONSUMES Verification + Performance + Fraud only — it
// is INVARIANT to Financial Tier (`verified_financial_tiers` is NEVER read) and to Buyer-Vendor Status.

/** `compute_trust_score` trigger (Doc-4G §G5.1 §2 request schema; fixed — do not extend). NOTE: the Trust-Score
 *  label is `input_signal_change` (NOT `input_change`, which is the Performance §G6.2 trigger). */
export type TrustComputeTrigger =
  | "input_signal_change"
  | "scheduled_recalc"
  | "formula_version_change";

/** Input to `trust.compute_trust_score.v1` (Doc-4G §G5.1 §2 request schema; System trigger). The score is
 *  COMPUTED, never supplied (Doc-4G §H.9a) — no caller score field. */
export interface ComputeTrustScoreInput {
  /** `vendor_profile_id : uuid : required` — bare cross-module UUID → M2 (no FK). */
  vendorProfileId: string;
  /** `trigger : enum<input_signal_change|scheduled_recalc|formula_version_change> : required`. */
  trigger: TrustComputeTrigger;
}

/** Injected M0 surfaces for compute (audit + outbox — the publish-on-change emit + one audit; Doc-4G §G5.1).
 *  Both are M0 TYPES from `@/modules/core/contracts` (the trust module imports NOTHING from M1/M2). */
export interface TrustScoreDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** `core.write_outbox_event.v1` (Doc-4B §B10), injected by contract TYPE. */
  writeOutboxEvent: WriteOutboxEvent;
}

/** Result of `compute_trust_score` (Doc-4G §G5.1 §3 internal effect). The numeric `score` is carried to the
 *  System caller only (staff-only; NEVER public / in the `TrustScoreUpdated` event). */
export interface ComputeTrustScoreResult {
  /** The `trust_scores.id` (created on first compute, else the existing head). */
  trustScoreId: string;
  vendorProfileId: string;
  /** 0–100 — ALWAYS a real score (Doc-6G §3.2.1 `score smallint NOT NULL`; NO Not-Rated; absence ≠ 0). */
  score: number;
  /** The PUBLIC band (Doc-2 §3.6). Text (Doc-6G §3.2.1 declares no band enum); always non-empty. */
  band: string;
  /** The current freeze state (compute never mutates it; publication is suppressed while `frozen`). */
  freezeState: ScoreFreezeStateValue;
  /** `true` iff this compute changed (score/band/formula) → a snapshot was appended + one audit written. */
  changed: boolean;
  /** `true` iff a `TrustScoreUpdated` event was published (changed AND not frozen). */
  published: boolean;
  /** The `trust_score_updated_at` / optimistic token (ISO-8601 UTC). */
  updatedAt: string;
}

/** Error outcome of `compute_trust_score` (Doc-4G §G5.1 §9 error register; classes per Doc-4A §12). REFERENCE is
 *  reserved (Doc-4A closed class set) — with the frozen absence-tolerance postures the pipeline emits only
 *  VALIDATION in practice (absent inputs are TOLERATED, not a REFERENCE error). */
export interface ComputeTrustScoreError {
  errorClass: "VALIDATION" | "REFERENCE";
  /** The interim `trust_trust_score_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  message: string;
}

export type ComputeTrustScoreOutcome =
  | { ok: true; result: ComputeTrustScoreResult }
  | { ok: false; error: ComputeTrustScoreError };

// ── W3-TRUST-4c — BC-TRUST-4 Fraud & Risk Signal DTOs (Doc-4G §G7.1/§G7.2; Doc-6G §3.4) ─────────────────
// The write-lifecycle services (create System/Admin, review, action, dismiss) are exercised DIRECTLY by
// tests. DEFERRED: the §G7.3 staff reads (NOT_FOUND-collapse is RLS-backed already), the Admin HTTP wiring +
// the `staff_can_ban` composition-edge authz (WP2 precedent — authz lives at `src/server`, not in the
// module), the fraud→`verification_records` revocation effect, and the detection rules. Field names/semantics
// owned by Doc-4G §G7 + Doc-2 §10.6; bound by pointer, never re-authored.
//
// FIREWALL (Invariant #6; Doc-4G §H.9b/c): a fraud signal records an INDICATOR and mutates NO Trust Score /
// Performance Score / Verification / Financial Tier; it NEVER issues a ban (that is Admin's, DG-5). The
// service writes `fraud_signals` (+ audit) and NOTHING else. NO EVENT (Doc-4G §H.7 — Doc-2 §8 has no Trust
// fraud event): the injected dep is `appendAuditRecord` ONLY (no `writeOutboxEvent`).
//
// COIN NOTHING: `subjectType`/`signalType`/`severity` are TEXT (Doc-2 §10.6 declares no value set) —
// validated NON-EMPTY, no fixed enum minted. `detectionRef`/`triageNote` are request fields with NO DB column
// (Doc-4G §H.10) — they ride the audit `newValue`, never persisted as a fraud_signals column.

/** The `trust.fraud_signal_state` value set (Doc-2 §10.6 / Doc-6G §3.4; entry `open`; `actioned`/`dismissed`
 *  terminal — Doc-4G §H.5). Do not extend. */
export type FraudSignalStateValue = "open" | "reviewed" | "actioned" | "dismissed";

/** The acting-actor context for a fraud-signal mutation. System-detected create ⇒ `actorType='system'`,
 *  `actorId=null` (no slug; Doc-4A §5.2). Staff-reported create + ALL triage ⇒ `actorType='admin'`,
 *  `actorId`=the acting staff user id (the `reported_by`/`updated_by` + Doc-2 §9 attribution). The
 *  `staff_can_ban` AUTHZ is performed at the DEFERRED composition edge BEFORE the service runs (WP2 precedent);
 *  this context carries only the actor attribution. */
export interface FraudSignalActorContext {
  /** `system` = system-detected (no slug); `admin` = staff-reported / staff triage (`staff_can_ban`, deferred). */
  actorType: "system" | "admin";
  /** The acting `identity.users` staff id, or `null` for the System detector. */
  actorId: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface. NO `writeOutboxEvent`: BC-TRUST-4 emits
 *  NO event (Doc-4G §H.7 — Doc-2 §8 has no Trust fraud event). Every mutation is state + ONE audit only. */
export interface FraudSignalDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by the contract TYPE (`@/modules/core/contracts`). */
  appendAuditRecord: AppendAuditRecord;
}

/** Input to `trust.create_fraud_signal.v1` (Doc-4G §G7.1 request schema). `reported_by`/`created_by` are set
 *  from the ACTOR context — NOT caller-supplied. Entry state `open`. */
export interface CreateFraudSignalInput {
  /** `subject_id : uuid : required` (Doc-4G §G7.1) — the suspected entity; a bare cross-module UUID (no FK). */
  subjectId: string;
  /** `subject_type : text : required` (Doc-2 §10.6) — polymorphic discriminator; TEXT (validated NON-EMPTY;
   *  no fixed enum coined — membership `[ESC]`-deferred). */
  subjectType: string;
  /** `signal_type : text : required` (Doc-2 §10.6) — TEXT (validated NON-EMPTY; no fixed enum coined). */
  signalType: string;
  /** `severity : text : required` (Doc-2 §10.6) — TEXT (validated NON-EMPTY; no fixed enum coined). */
  severity: string;
  /** `detection_ref : jsonb : optional` (Doc-4G §G7.1) — the detection input/evidence ref (OPAQUE, dev-doc
   *  shape). NO DB column (Doc-4G §H.10) — carried in the audit `newValue`, never persisted on the row. */
  detectionRef?: Record<string, unknown> | null;
}

/** Result of `create_fraud_signal` (Doc-4G §G7.1 §3 internal effect; `reference_id` rides the deferred HTTP
 *  envelope, not `result`). Property names camelCase (Doc-5A Option B). */
export interface CreateFraudSignalResult {
  /** The `fraud_signals.id` — the created row, or (on an idempotent dedup) the pre-existing live signal. */
  fraudSignalId: string;
  /** The signal state (`open` on a fresh create; the existing state on a dedup). */
  state: FraudSignalStateValue;
  /** `false` on an idempotent dedup replay (a live signal already existed → NO new row, NO audit). */
  created: boolean;
  /** The row's `updated_at` (ISO-8601 UTC) — the caller's optimistic token for a later triage. */
  updatedAt: string;
}

/** Input to `trust.review_fraud_signal.v1` / `action_fraud_signal.v1` / `dismiss_fraud_signal.v1` (Doc-4G
 *  §G7.2 request schema). */
export interface FraudSignalTriageInput {
  /** `fraud_signal_id : uuid : required` — the target signal. */
  fraudSignalId: string;
  /** `expected_revision` (Doc-4G §G7.2) realized against `updated_at` (the WP3 optimistic-token precedent).
   *  Omit ⇒ use the current row's token. */
  expectedUpdatedAt?: Date | null;
  /** `triage_note : text : optional` (Doc-4G §G7.2) — reviewer note. NO DB column (Doc-4G §H.10) — carried in
   *  the audit `newValue`, never persisted on the row. */
  triageNote?: string | null;
}

/** Result of an applied triage transition (Doc-4G §G7.2 §3 internal effect). Property names camelCase. */
export interface FraudSignalTriageResult {
  fraudSignalId: string;
  /** The state after the transition (`reviewed` | `actioned` | `dismissed`). */
  state: FraudSignalStateValue;
  /** The NEW `updated_at` (ISO-8601 UTC) — the caller's next `expected_revision` optimistic token. */
  updatedAt: string;
}

/** Error outcome of a fraud-signal mutation (Doc-4G §G7.1/§G7.2 error register; classes per Doc-5A §6.2). The
 *  `errorCode` strings are the interim `trust_fraud_signal_*` register ([ESC-TRUST-CODE]). Create emits only
 *  VALIDATION in-scope (the stage-7 subject REFERENCE resolution is DEFERRED, the WP3 precedent); triage adds
 *  NOT_FOUND / STATE / CONFLICT. */
export interface FraudSignalError {
  /** Doc-5A §6.2 class → HTTP status (VALIDATION→400 · NOT_FOUND→404 · STATE/CONFLICT→409). */
  errorClass: "VALIDATION" | "NOT_FOUND" | "STATE" | "CONFLICT";
  /** The interim `trust_fraud_signal_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/** Outcome of `trust.create_fraud_signal.v1`. `ok:true` ⇒ a fresh `open` signal OR an idempotent dedup. */
export type CreateFraudSignalOutcome =
  | { ok: true; result: CreateFraudSignalResult }
  | { ok: false; error: FraudSignalError };

/** Outcome of a fraud-signal triage transition (review/action/dismiss). */
export type FraudSignalTriageOutcome =
  | { ok: true; result: FraudSignalTriageResult }
  | { ok: false; error: FraudSignalError };

// ── W3-TRUST-5a — BC-TRUST-5 (Part A) Public Review DTOs (Doc-4G §G8.1/§G8.2/§G8.3/§G8.5; Doc-6G §3.5.2) ──
// The Public Review aggregate: submit (buyer/User + active-org), moderate/publish/remove (staff), and the
// public review reads (get/list — published only). SCOPE IS THE PUBLIC REVIEW AGGREGATE ONLY — the Admin
// Rating aggregate (`set_admin_rating` / `list_admin_ratings`, §G8.4/§G8.5) is a SEPARATE WP (WP5b). Field
// names/semantics owned by Doc-4G §G8 + Doc-2 §10.6; bound by pointer, never re-authored.
//
// FIREWALL (Invariant #6; Doc-4G §H.9): a review mutates NO score/verification/fraud/tier row and issues NO
// ban. Its ONLY downstream write — on PUBLISH — is a `performance_inputs` row appended VIA the BC-TRUST-3
// ingestion service (F4G-M2 single-writer; §H.9c), never a direct write. NO EVENT (Doc-4G §H.7 — Doc-2 §8
// has no Trust review event): submit's dep is `appendAuditRecord` only; publish adds the in-module
// `ingestPerformanceInput` (Path B). `author_organization_id` is SERVER-derived from the active-org context
// (Invariant #5) — NEVER a caller-supplied field.

/** The `trust.public_review_status` value set (Doc-2 §10.6 / Doc-6G §3.5.2; entry `submitted`;
 *  `published`/`rejected`/`removed` terminal-or-hidden — Doc-4G §H.5). Do not extend. */
export type PublicReviewStatusValue =
  | "submitted"
  | "approved"
  | "published"
  | "rejected"
  | "removed";

/** The `decision` enum for `moderate_review` (Doc-4G §G8.2) — maps to `approved` / `rejected`. */
export type ReviewModerationDecisionValue = "approve" | "reject";

/** The acting-staff context for the Admin review lifecycle (moderate/publish/remove). The
 *  `staff_can_verify`/`staff_super_admin` AUTHZ is performed at the DEFERRED composition edge BEFORE the
 *  service runs (WP2 precedent); this carries only the Doc-2 §9 attribution (`actorId` = the acting staff). */
export interface ReviewStaffContext {
  /** The acting `identity.users` staff id — the Doc-2 §9 audit attribution (Admin actor). */
  staffUserId: string;
}

// ── submit_review.v1 (Doc-4G §G8.1) — buyer-authored (User + active-org); emits NO event ────────────────

/** Input to `trust.submit_review.v1` (Doc-4G §G8.1 request schema). `author_organization_id` is SERVER-derived
 *  from the active org (Invariant #5 — never client input) and is NOT part of this input. */
export interface SubmitReviewInput {
  /** `vendor_profile_id : uuid : required` — the subject; a bare cross-module UUID → M2 (no FK). */
  vendorProfileId: string;
  /** `engagement_id : uuid : required` — the post-award gate; a bare cross-module UUID → M4 (service-validated). */
  engagementId: string;
  /** `rating : numeric : required` — 1–5 (range is a BUSINESS rule; Doc-2 §10.6). */
  rating: number;
  /** `body : text : optional` (Doc-2 §10.6). */
  body?: string | null;
}

/** The server-resolved request context for the submit write (from the active-org context guard — never client
 *  input; Invariant #5). */
export interface SubmitReviewContext {
  /** The acting `identity.users` id (= `app.user_id`; the User attribution / `created_by`). */
  userId: string;
  /** The server-resolved active org (= `app.active_org`; the `author_organization_id` — Invariant #5). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface. NO `writeOutboxEvent`: BC-TRUST-5 emits
 *  NO event (Doc-4G §H.7). */
export interface SubmitReviewDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by the contract TYPE (`@/modules/core/contracts`). */
  appendAuditRecord: AppendAuditRecord;
}

/** Result of a successful `submit_review` (Doc-4G §G8.1 response). Property names camelCase (Doc-5A Option B);
 *  `reference_id` (deferred HTTP) rides the envelope, not `result`. */
export interface SubmitReviewResult {
  /** The opened `public_reviews.id` (UUIDv7). */
  publicReviewId: string;
  /** Always `submitted` on a fresh open (Doc-4G §G8.1 — lifecycle entry `submitted`). */
  status: PublicReviewStatusValue;
}

/** Error outcome of `submit_review` (Doc-4G §G8.1 error register; classes per Doc-5A §6.2). The DG-4 engagement
 *  gate + DG-2 vendor resolution (REFERENCE/NOT_FOUND/DEPENDENCY) are DEFERRED to the composition edge (the
 *  WP2 precedent) — in-scope classes are VALIDATION (SYNTAX) + BUSINESS (rating range; duplicate). */
export interface SubmitReviewError {
  /** VALIDATION→400 · BUSINESS→422 (Doc-5A §6.2). */
  errorClass: "VALIDATION" | "BUSINESS";
  /** The interim `trust_review_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/** Outcome of `trust.submit_review.v1`. `ok:true` ⇒ a fresh `submitted` review. */
export type SubmitReviewOutcome =
  | { ok: true; result: SubmitReviewResult }
  | { ok: false; error: SubmitReviewError };

// ── moderate/publish/remove_review (Doc-4G §G8.2/§G8.3) — staff lifecycle; emits NO event ────────────────

/** Error outcome of a staff review lifecycle op (moderate/publish/remove) (Doc-4G §G8.2/§G8.3 error register;
 *  classes per Doc-5A §6.2). The union covers all three ops: moderate adds BUSINESS (note-required); publish
 *  adds DEPENDENCY (Step-1 audit unavailable — patch F4G-PB5-MA2). */
export interface ReviewStaffError {
  /** VALIDATION→400 · NOT_FOUND→404 · STATE/CONFLICT→409 · BUSINESS→422 · DEPENDENCY→503 (Doc-5A §6.2). */
  errorClass: "VALIDATION" | "NOT_FOUND" | "STATE" | "CONFLICT" | "BUSINESS" | "DEPENDENCY";
  /** The interim `trust_review_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/** Result of an applied moderate/remove transition (Doc-4G §G8.2/§G8.3 response). Property names camelCase. */
export interface ReviewStaffResult {
  publicReviewId: string;
  /** The status after the transition (`approved` | `rejected` | `removed`). */
  status: PublicReviewStatusValue;
  /** The NEW `updated_at` (ISO-8601 UTC) — the caller's next `expected_revision` optimistic token. */
  updatedAt: string;
}

/** Input to `trust.moderate_review.v1` (Doc-4G §G8.2 request schema). */
export interface ModerateReviewInput {
  /** `public_review_id : uuid : required` — the target review. */
  publicReviewId: string;
  /** `expected_revision : required` — optimistic-concurrency token, realized against `updated_at` (the WP3/
   *  fraud precedent — a `Date` at the TS boundary). */
  expectedRevision: Date;
  /** `decision : enum<approve|reject> : required` — the moderation outcome (maps to `approved`/`rejected`). */
  decision: ReviewModerationDecisionValue;
  /** `moderation_note : text : conditional` — REQUIRED on `reject` (BUSINESS). NO DB column (Doc-4G §H.10) —
   *  rides the audit `newValue` (the fraud `triage_note` precedent). */
  moderationNote?: string | null;
}

/** Outcome of `trust.moderate_review.v1`. `ok:true` ⇒ `approved` | `rejected`. */
export type ModerateReviewOutcome =
  | { ok: true; result: ReviewStaffResult }
  | { ok: false; error: ReviewStaffError };

/** The in-module BC-TRUST-3 ingestion service TYPE (F4G-M2 single-writer), injected into `publish_review`
 *  for the Path-B Buyer-Feedback contribution (Doc-4G §G8.3 §8). Defaults to the in-module
 *  `ingestPerformanceInput`; injectable so a test can supply a failing one. */
export type PublishReviewIngestPerformanceInput = (
  input: IngestPerformanceInputInput,
  deps: IngestPerformanceInputDeps,
  db?: DbExecutor,
) => Promise<IngestPerformanceInputOutcome>;

/** Injected Module 0 + in-module surfaces for `publish_review` (Doc-4G §G8.3; patch F4G-PB5-MA2 two-step
 *  model). NO `writeOutboxEvent`: BC-TRUST-5 emits NO event (Doc-4G §H.7). */
export interface PublishReviewDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by the contract TYPE — the Step-1 audit. */
  appendAuditRecord: AppendAuditRecord;
  /** The in-module BC-TRUST-3 `trust.ingest_performance_input.v1` (Path B, Step 2; F4G-M2 single-writer).
   *  OPTIONAL — DEFAULTS to the in-module `ingestPerformanceInput`; injectable so a test can supply a failing
   *  one (patch F4G-PB5-MA2). */
  ingestPerformanceInput?: PublishReviewIngestPerformanceInput;
}

/** Input to `trust.publish_review.v1` (Doc-4G §G8.3 request schema). */
export interface PublishReviewInput {
  /** `public_review_id : uuid : required` — the target `approved` review. */
  publicReviewId: string;
  /** `expected_revision : required` — optimistic-concurrency token (realized against `updated_at`). */
  expectedRevision: Date;
}

/** Result of a successful `publish_review` (Doc-4G §G8.3 response; patch F4G-PB5-MA2). Property names camelCase. */
export interface PublishReviewResult {
  publicReviewId: string;
  /** Always `published` on success (Step 1 committed). */
  status: PublicReviewStatusValue;
  /** `true` iff the Path-B ingestion (Step 2) applied; `false` when Step 2 failed/deferred (the review is
   *  STILL `published` — the lifecycle outcome is independent of ingestion availability, patch F4G-PB5-MA2). */
  ingestionApplied: boolean;
}

/** Outcome of `trust.publish_review.v1`. `ok:true` ⇒ `published` (with `ingestionApplied` flagging Step 2). */
export type PublishReviewOutcome =
  | { ok: true; result: PublishReviewResult }
  | { ok: false; error: ReviewStaffError };

/** Input to `trust.remove_review.v1` (Doc-4G §G8.3 request schema). Removal is a hidden soft-delete (SD=YES). */
export interface RemoveReviewInput {
  /** `public_review_id : uuid : required` — the target review (removable from submitted/approved/published). */
  publicReviewId: string;
  /** `expected_revision : required` — optimistic-concurrency token (realized against `updated_at`). */
  expectedRevision: Date;
  /** `removal_reason : text : optional` (Doc-4G §G8.3) — persisted as the SD `delete_reason` column. */
  removalReason?: string | null;
}

/** Outcome of `trust.remove_review.v1`. `ok:true` ⇒ `removed` (hidden). */
export type RemoveReviewOutcome =
  | { ok: true; result: ReviewStaffResult }
  | { ok: false; error: ReviewStaffError };

// ── get_review / list_reviews (Doc-4G §G8.5 — public projection; published only; not audited; CQRS) ──────

/** The public review projection (Doc-4G §G8.5 §3 — only `published` reviews are public). */
export interface PublicReviewView {
  publicReviewId: string;
  vendorProfileId: string;
  rating: number;
  body: string | null;
  /** Always `published` on the public projection. */
  status: PublicReviewStatusValue;
  /** The review authored time (ISO-8601 UTC; the buyer's submission `created_at`). */
  createdAt: string;
  /** The published/moderation timestamp (ISO-8601 UTC; realized against `updated_at`). */
  publishedAt: string;
}

/** Error outcome of a public review read (Doc-4G §G8.5 error register; classes per Doc-5A §6.2). */
export interface ReviewReadError {
  /** VALIDATION→400 · NOT_FOUND→404 · DEPENDENCY→503 (Doc-5A §6.2). */
  errorClass: "VALIDATION" | "NOT_FOUND" | "DEPENDENCY";
  /** The interim `trust_review_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  message: string;
}

/** Input to `trust.get_review.v1` (Doc-4G §G8.5). */
export interface GetReviewInput {
  publicReviewId: string;
}

/** Outcome of `trust.get_review.v1`. `ok:true` ⇒ a `published` review; a non-published id ⇒ NOT_FOUND. */
export type GetReviewOutcome =
  | { ok: true; result: PublicReviewView }
  | { ok: false; error: ReviewReadError };

/** Input to `trust.list_reviews.v1` (Doc-4G §G8.5; allowlisted params only — Doc-4A §9.6). */
export interface ListReviewsInput {
  vendorProfileId: string;
  /** Page size (allowlisted; clamped to the [ESC-TRUST-POLICY] window). */
  limit?: number;
  /** Opaque keyset cursor from a prior page's `nextCursor` (allowlisted). Invalid → VALIDATION. */
  cursor?: string | null;
}

/** Result of `trust.list_reviews.v1` (Doc-4G §G8.5 — only `published` reviews for the vendor). */
export interface ListReviewsResult {
  reviews: PublicReviewView[];
  /** The opaque cursor for the next page, or `null` when exhausted. */
  nextCursor: string | null;
}

/** Outcome of `trust.list_reviews.v1`. */
export type ListReviewsOutcome =
  | { ok: true; result: ListReviewsResult }
  | { ok: false; error: ReviewReadError };

// ── W3-TRUST-5b — BC-TRUST-5 (Part B) Admin Rating DTOs (Doc-4G §G8.4/§G8.5; Doc-6G §3.5.1) ──────────────
// The Admin Rating aggregate: `set_admin_rating` (staff create-or-update the vendor's singleton) + the
// staff-only read `list_admin_ratings`. This is a SEPARATE authority from the Public Review (Doc-4G §H.9a —
// "never merged"). Field names/semantics owned by Doc-4G §G8.4/§G8.5 + Doc-2 §10.6; bound by pointer.
//
// NON-DISCLOSURE (F4G-PB5-M3 / §H.9f / Doc-4A §7.5): admin ratings are STAFF-INTERNAL — never public, never
// tenant-visible, never exposed externally. The table has ONLY the `admin_ratings_staff FOR ALL` RLS policy;
// a non-staff caller sees ZERO rows and the DEFERRED comp-edge collapses to NOT_FOUND (never AUTHORIZATION).
// FIREWALL (Invariant #6; §H.9b): an admin rating is an INTERNAL SIGNAL only — it mutates NO score/
// verification/fraud/tier row and issues no ban. NO EVENT (Doc-4G §H.7): the injected dep is
// `appendAuditRecord` ONLY (no `writeOutboxEvent`). `rated_by` is server-derived from the staff context.
//
// COLUMN MAPPING (Doc-6G §3.5.1): the contract `ratingValue`/`ratingNote` map to the frozen DB columns
// `score`/`comment`. `score` is `numeric` with NO range CHECK (do NOT apply the `public_reviews` 1–5 rule).

/** The create-or-update operation an admin-rating set resolved to (rides the audit `newValue`). */
export type AdminRatingOperation = "create" | "update";

/** The acting-staff context for the Admin Rating writes. The `staff_can_verify`/`staff_super_admin` AUTHZ is
 *  performed at the DEFERRED composition edge BEFORE the service runs (WP2 precedent); this carries only the
 *  Doc-2 §9 attribution (`actorId` = the acting staff = `rated_by`). */
export interface AdminRatingStaffContext {
  /** The acting `identity.users` staff id — the Doc-2 §9 audit attribution (Admin actor; also `rated_by`). */
  staffUserId: string;
}

/** Injected Module 0 contract service — the ONLY audit-write surface. NO `writeOutboxEvent`: BC-TRUST-5 emits
 *  NO event (Doc-4G §H.7). */
export interface SetAdminRatingDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by the contract TYPE (`@/modules/core/contracts`). */
  appendAuditRecord: AppendAuditRecord;
}

/** Input to `trust.set_admin_rating.v1` (Doc-4G §G8.4 request schema). `rated_by` is server-derived from the
 *  staff context (never a caller field). The presence of `expectedRevision` signals UPDATE intent. */
export interface SetAdminRatingInput {
  /** `vendor_profile_id : uuid : required` — the subject; a bare cross-module UUID → M2 (no FK). */
  vendorProfileId: string;
  /** `expected_revision : conditional` — optimistic-concurrency token (realized against `updated_at`).
   *  PRESENT ⇒ update the vendor's live rating; ABSENT ⇒ create (a live row already existing ⇒ CONFLICT). */
  expectedRevision?: Date | null;
  /** `rating_value : numeric : required` → the DB column `score` (Doc-6G §3.5.1). A finite number; NO 1–5 range. */
  ratingValue: number;
  /** `rating_note : text : optional` → the DB column `comment` (Doc-6G §3.5.1). Internal note (staff-only). */
  ratingNote?: string | null;
}

/** Result of a successful `set_admin_rating` (Doc-4G §G8.4 §3 — `admin_rating_id`; `reference_id` rides the
 *  deferred HTTP envelope, not `result`). Property names camelCase (Doc-5A Option B). */
export interface SetAdminRatingResult {
  /** The created-or-updated `admin_ratings.id` (UUIDv7). */
  adminRatingId: string;
  /** Which operation was applied (also recorded in the audit `newValue`). */
  operation: AdminRatingOperation;
}

/** Error outcome of `set_admin_rating` (Doc-4G §G8.4 error register; classes per Doc-5A §6.2). The DG-2 vendor
 *  resolution (REFERENCE/DEPENDENCY) is DEFERRED to the comp-edge (the WP2/WP5a precedent) — in-scope classes
 *  are VALIDATION (SYNTAX) · NOT_FOUND (update with no live row; the non-staff collapse) · CONFLICT (stale
 *  `expected_revision`; create over an existing live rating). */
export interface SetAdminRatingError {
  /** VALIDATION→400 · NOT_FOUND→404 · CONFLICT→409 (Doc-5A §6.2). */
  errorClass: "VALIDATION" | "NOT_FOUND" | "CONFLICT";
  /** The interim `trust_admin_rating_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/** Outcome of `trust.set_admin_rating.v1`. `ok:true` ⇒ the vendor's singleton rating was created or updated. */
export type SetAdminRatingOutcome =
  | { ok: true; result: SetAdminRatingResult }
  | { ok: false; error: SetAdminRatingError };

/** The staff Admin Rating projection (Doc-4G §G8.5 §3 — staff-only; never tenant-visible). `score` is the DB
 *  `numeric` mapped to `number`; `comment` is the internal note. */
export interface AdminRatingView {
  adminRatingId: string;
  vendorProfileId: string;
  /** The staff rating (DB column `score`; `numeric` → `number`), or `null`. */
  score: number | null;
  /** The staff rater (DB column `rated_by`; bare UUID → M1), or `null`. */
  ratedBy: string | null;
  /** The internal note (DB column `comment`), or `null`. */
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Input to `trust.list_admin_ratings.v1` (Doc-4G §G8.5; staff-only; allowlisted params only — Doc-4A §9.6). */
export interface ListAdminRatingsInput {
  vendorProfileId: string;
  /** Page size (allowlisted; clamped to the [ESC-TRUST-POLICY] window). */
  limit?: number;
  /** Opaque keyset cursor from a prior page's `nextCursor` (allowlisted). Invalid → VALIDATION. */
  cursor?: string | null;
}

/** Result of `trust.list_admin_ratings.v1` (Doc-4G §G8.5 — the vendor's live staff ratings; a non-staff/no-GUC
 *  caller sees an EMPTY list under RLS — the non-disclosure posture). */
export interface ListAdminRatingsResult {
  adminRatings: AdminRatingView[];
  /** The opaque cursor for the next page, or `null` when exhausted. */
  nextCursor: string | null;
}

/** Error outcome of `list_admin_ratings` (Doc-4G §G8.5 error register; classes per Doc-5A §6.2). The service
 *  emits VALIDATION in-scope; the non-staff AUTHORIZATION/NOT_FOUND collapse is at the DEFERRED comp-edge. */
export interface AdminRatingReadError {
  /** VALIDATION→400 · NOT_FOUND→404 · DEPENDENCY→503 (Doc-5A §6.2). */
  errorClass: "VALIDATION" | "NOT_FOUND" | "DEPENDENCY";
  /** The interim `trust_admin_rating_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  message: string;
}

/** Outcome of `trust.list_admin_ratings.v1`. */
export type ListAdminRatingsOutcome =
  | { ok: true; result: ListAdminRatingsResult }
  | { ok: false; error: AdminRatingReadError };
