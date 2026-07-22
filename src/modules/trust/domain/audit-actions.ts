// M5 domain — canonical audit-action constants for trust verification entities (the realized
// serialization token). Realizes the ENUMERATED Doc-2 §9 Trust action "verification request":
//   - Doc-4G §G4.1 §7 (Audit Binding): "Action Doc-2 §9 Trust 'verification request' (separately
//     enumerated) · Attribution User (`requested_by`) · new `verification_records` row · same
//     transaction · Source Doc-2 §9 + Doc-4B `core.append_audit_record.v1`."
//   - Doc-2 §9 (Trust domain row): "verification request/decision/revoke/expiry, …" — "verification
//     request" is SEPARATELY ENUMERATED (Doc-4G Part1 §H.6 confirms), so — UNLIKE the assignment /
//     verified-tier transitions that carry `[ESC-TRUST-AUDIT]` — this token binds BY POINTER to an
//     ENUMERATED §9 action (NO `[ESC-TRUST-AUDIT]`; that marker is reserved for the non-enumerated
//     Trust actions per Doc-4G §H.6). The token STRING is the Doc-4G-class serialization; a future
//     rename touches Doc-4G/Doc-6G + this constant, never Doc-2.
//
// Imported as a NAMED CONSTANT — never a hardcoded string literal (the identity delegation/role-token
// precedent, Board ruling 2026-06-30). The audit is appended to `core.audit_records` via the M0
// `core.append_audit_record.v1` facade, atomically with the verification-case write.

/** The audit `entity_type` for `trust.verification_records` rows (Doc-4G §G4.1 · Doc-6G §3.1.1). */
export const VERIFICATION_RECORD_ENTITY_TYPE = "verification_record" as const;

/**
 * Canonical verification-record audit actions.
 *   REQUESTED → the `trust.request_verification.v1` open-case leg — bound BY POINTER to the ENUMERATED
 *               Doc-2 §9 Trust action "verification request" (Doc-4G §G4.1 §7). Attribution: User
 *               (`requested_by`). One §9 business action, one serialization token (the open-case leg).
 */
export const VerificationAuditAction = {
  /** §9 Trust "verification request" (enumerated); the `request_verification` open-case leg (User). */
  REQUESTED: "verification_requested",
} as const;

export type VerificationAuditActionToken =
  (typeof VerificationAuditAction)[keyof typeof VerificationAuditAction];

// ── W3-TRUST-3 — Verified Financial Tier audit tokens (Doc-4G §G4.6/§G4.7 §7; Doc-6G §3.1.3) ──────────
//
// Each verified-tier transition binds BY POINTER to the ENUMERATED Doc-2 §9 Trust action "admin tier
// override" (Doc-4G §G4.6/§G4.7 §7 — "separately enumerated, covers tier set/confirm/downgrade by staff",
// and suspend under the same binding; expire = System attribution under the same binding). The
// per-transition SPECIFIC serialization token below is carried `[ESC-TRUST-AUDIT]` (Doc-4G §H.6 / §G4.Z:502
// — status-transition specifics BEYOND the enumerated "admin tier override" are §9-additive; no §9 action is
// invented here). DISTINCT tokens per transition so the immutable ledger records exactly WHAT happened (the
// identity distinct-token precedent) — a future rename touches Doc-4G/Doc-6G + this constant, never Doc-2.
//
// Attribution (Doc-4G §G4.6/§G4.7 §7): Admin for set/confirm/downgrade/suspend; System for expire.

/**
 * The audit `entity_type` for `trust.verified_financial_tiers` rows (object-scope; Doc-4G §G4.6/§G4.7 §7 —
 * "Object scope `verified_financial_tiers` row"). Singular per the identity buyer_profile/membership
 * precedent — a realization choice, NOT a frozen constant. `[ESC-TRUST-AUDIT]`-adjacent (object scope).
 */
export const VERIFIED_FINANCIAL_TIER_ENTITY_TYPE = "verified_financial_tier" as const;

/**
 * Canonical verified-tier audit actions — the specific serialization tokens per transition, each carried
 * `[ESC-TRUST-AUDIT]` (all bind BY POINTER to §9 Trust "admin tier override"; Doc-4G §G4.6/§G4.7 §7).
 *   SET        → `set_verified_tier`      (absence-of-row → verified; Admin)
 *   CONFIRMED  → `confirm_verified_tier`  (verified → verified renew; Admin)
 *   DOWNGRADED → `downgrade_verified_tier`(verified → verified lower band; Admin)
 *   SUSPENDED  → `suspend_verified_tier`  (verified → suspended; Admin)
 *   EXPIRED    → `expire_verified_tier`   (verified → expired; System)
 */
export const VerifiedTierAuditAction = {
  /** §9 Trust "admin tier override" (enumerated) — the `set_verified_tier` establishment (Admin). [ESC-TRUST-AUDIT] */
  SET: "verified_tier_set",
  /** §9 Trust "admin tier override" — the `confirm_verified_tier` renewal (Admin). [ESC-TRUST-AUDIT] */
  CONFIRMED: "verified_tier_confirmed",
  /** §9 Trust "admin tier override" — the `downgrade_verified_tier` lowering (Admin). [ESC-TRUST-AUDIT] */
  DOWNGRADED: "verified_tier_downgraded",
  /** §9 Trust "admin tier override" — the `suspend_verified_tier` suspension (Admin). [ESC-TRUST-AUDIT] */
  SUSPENDED: "verified_tier_suspended",
  /** §9 Trust "admin tier override" — the `expire_verified_tier` review-lapse expiry (System). [ESC-TRUST-AUDIT] */
  EXPIRED: "verified_tier_expired",
} as const;

export type VerifiedTierAuditActionToken =
  (typeof VerifiedTierAuditAction)[keyof typeof VerifiedTierAuditAction];

// ── W3-TRUST-4a — Performance Scoring audit tokens (Doc-4G §G6.1/§G6.2/§G6.4 §7; Doc-6G §3.3) ──────────
//
// The compute path binds BY POINTER to the SEPARATELY-ENUMERATED Doc-2 §9 Trust actions "recalculation" and
// "formula version change" (Doc-4G §G6.2 §7 — both enumerated). Because those two ARE enumerated, their
// tokens carry NO `[ESC-TRUST-AUDIT]` (that marker is reserved for the Trust actions NOT separately enumerated
// in §9, per Doc-4G §H.6). The ingestion + review-trigger actions are NOT separately enumerated → they carry
// `[ESC-TRUST-AUDIT]` (interim: nearest §9 Trust action — "recalculation" — by pointer; channel Doc-2 §9
// additive; NO action invented — Doc-4G §G6.1 §7 / §G6.4 §7 / §H.6). Attribution: System throughout.
//
// The token STRING is the Doc-4G-class serialization; a future rename touches Doc-4G/Doc-6G + this constant,
// never Doc-2. Object-scope entity types are SINGULAR (the identity buyer_profile / verified-tier precedent) —
// a realization choice, NOT a frozen constant.

/** Audit `entity_type` for `trust.performance_scores` rows (object-scope; Doc-4G §G6.2 §7 / §G6.4 §7). */
export const PERFORMANCE_SCORE_ENTITY_TYPE = "performance_score" as const;

/** Audit `entity_type` for `trust.performance_inputs` rows (object-scope; Doc-4G §G6.1 §7). */
export const PERFORMANCE_INPUT_ENTITY_TYPE = "performance_input" as const;

/**
 * Performance Score audit actions.
 *   RECALCULATED             → Doc-2 §9 Trust "recalculation" (ENUMERATED — no ESC); every changed compute.
 *   FORMULA_VERSION_CHANGED  → Doc-2 §9 Trust "formula version change" (ENUMERATED — no ESC); a compute in which
 *                              `performance_formula_version` changed on an existing head.
 *   INPUT_INGESTED           → `[ESC-TRUST-AUDIT]` (nearest §9 "recalculation" by pointer); a fresh
 *                              `performance_inputs` append (never on an idempotent dedup no-op).
 *   REVIEW_TRIGGERED         → `[ESC-TRUST-AUDIT]` (nearest §9 "recalculation" by pointer); a review-trigger.
 */
export const PerformanceScoreAuditAction = {
  /** §9 Trust "recalculation" (ENUMERATED — no ESC); the compute publish-on-change (System). */
  RECALCULATED: "performance_score_recalculated",
  /** §9 Trust "formula version change" (ENUMERATED — no ESC); a formula-version-change compute (System). */
  FORMULA_VERSION_CHANGED: "performance_formula_version_changed",
  /** [ESC-TRUST-AUDIT] (nearest §9 "recalculation"); the `ingest_performance_input` append (System). */
  INPUT_INGESTED: "performance_input_ingested",
  /** [ESC-TRUST-AUDIT] (nearest §9 "recalculation"); the `trigger_performance_review` signal (System). */
  REVIEW_TRIGGERED: "performance_review_triggered",
} as const;

export type PerformanceScoreAuditActionToken =
  (typeof PerformanceScoreAuditAction)[keyof typeof PerformanceScoreAuditAction];

// ── W3-TRUST-4b — BC-TRUST-2 Trust Scoring audit tokens (Doc-4G §G5.1 §7 / §H.6; Doc-6G §3.2) ──────────
//
// The compute path binds BY POINTER to the SEPARATELY-ENUMERATED Doc-2 §9 Trust actions "recalculation" and
// "formula version change" (Doc-4G §G5.1 §7 — both enumerated; Doc-2 §9 line 688). Because BOTH ARE
// enumerated, their tokens carry NO `[ESC-TRUST-AUDIT]` — Doc-4G §H.6 is explicit: "No `[ESC-TRUST-AUDIT]` is
// required for the BC-TRUST-2 mutations (all three audit actions are separately enumerated in §9)". (Trust
// Score has only compute here; freeze/reactivate — the third enumerated action — is a DEFERRED WP.)
// Audit-on-CHANGE only (Doc-4G §G5.1 §7 object scope = "trust_scores + appended trust_score_history row"; the
// performance-score no-op precedent — no audit on an unchanged recompute). Attribution: System throughout
// (Doc-4G §H.6 — computation is System-actor). Distinct token per aggregate (the performance-score precedent).
//
// The token STRING is the Doc-4G-class serialization; a future rename touches Doc-4G/Doc-6G + this constant,
// never Doc-2. The object-scope entity type is SINGULAR (the identity/verified-tier/performance precedent) —
// a realization choice, NOT a frozen constant.

/** Audit `entity_type` for `trust.trust_scores` rows (object-scope; Doc-4G §G5.1 §7). */
export const TRUST_SCORE_ENTITY_TYPE = "trust_score" as const;

/**
 * Trust Score audit actions — BOTH bind BY POINTER to a SEPARATELY-ENUMERATED Doc-2 §9 Trust action; NO
 * `[ESC-TRUST-AUDIT]` (Doc-4G §H.6 explicit).
 *   RECALCULATED            → Doc-2 §9 Trust "recalculation" (ENUMERATED — no ESC); every changed compute.
 *   FORMULA_VERSION_CHANGED → Doc-2 §9 Trust "formula version change" (ENUMERATED — no ESC); a compute in which
 *                             `trust_formula_version` changed on an existing head.
 */
export const TrustScoreAuditAction = {
  /** §9 Trust "recalculation" (ENUMERATED — no ESC); the compute publish-on-change (System). */
  RECALCULATED: "trust_score_recalculated",
  /** §9 Trust "formula version change" (ENUMERATED — no ESC); a formula-version-change compute (System). */
  FORMULA_VERSION_CHANGED: "trust_formula_version_changed",
} as const;

export type TrustScoreAuditActionToken =
  (typeof TrustScoreAuditAction)[keyof typeof TrustScoreAuditAction];

// ── W3-TRUST-4c — BC-TRUST-4 Fraud & Risk Signal audit tokens (Doc-4G §G7.1/§G7.2 §7; Doc-6G §3.4) ─────
//
// The Doc-2 §9 Trust domain enumerates NO fraud-signal action (line 688 — "verification request/decision/
// revoke/expiry, trust/performance freeze + reactivation, recalculation, formula version change, admin tier
// override"; no fraud action). Therefore EVERY BC-TRUST-4 mutation (create/review/action/dismiss) carries
// `[ESC-TRUST-AUDIT]` — the interim binds the nearest §9 Trust action BY POINTER (channel Doc-2 §9 additive;
// NO §9 action invented — Doc-4G §H.6 / §G7.1 §7 / §G7.2 §7). The per-transition SPECIFIC serialization token
// below is the Doc-4G-class serialization (a future rename touches Doc-4G/Doc-6G + this constant, never
// Doc-2). DISTINCT tokens per transition so the immutable ledger records exactly WHAT happened (the identity/
// verified-tier distinct-token precedent). Attribution (Doc-4G §H.6 / §G7): System for a system-detected
// create; Admin for a staff-reported create and ALL triage (review/action/dismiss).
//
// There is NO event (Doc-2 §8 has no Trust fraud event — Doc-4G §H.7); each mutation is state + THIS audit
// only. The request fields `detection_ref` (create) / `triage_note` (triage) have NO DB column (Doc-4G §H.10)
// — they are carried in the audit `newValue`, never persisted as a fraud_signals column.

/**
 * The audit `entity_type` for `trust.fraud_signals` rows (object-scope; Doc-4G §G7.1 §7 / §G7.2 §7 — "Object
 * scope `fraud_signals` row"). Singular per the identity buyer_profile / verified-tier / score precedent — a
 * realization choice, NOT a frozen constant.
 */
export const FRAUD_SIGNAL_ENTITY_TYPE = "fraud_signal" as const;

/**
 * Canonical fraud-signal audit actions — the specific serialization tokens per mutation, each carried
 * `[ESC-TRUST-AUDIT]` (Doc-2 §9 enumerates no fraud action → nearest §9 Trust action by pointer; Doc-4G
 * §H.6 / §G7.1 §7 / §G7.2 §7).
 *   CREATED   → `fraud_signal_created`   (absence → open; System or Admin)
 *   REVIEWED  → `fraud_signal_reviewed`  (open → reviewed; Admin)
 *   ACTIONED  → `fraud_signal_actioned`  (reviewed → actioned, terminal; Admin)
 *   DISMISSED → `fraud_signal_dismissed` (reviewed → dismissed, terminal; Admin)
 */
export const FraudSignalAuditAction = {
  /** [ESC-TRUST-AUDIT] (nearest §9 Trust by pointer) — the create leg (System or Admin). */
  CREATED: "fraud_signal_created",
  /** [ESC-TRUST-AUDIT] — the `review` triage (open → reviewed; Admin). */
  REVIEWED: "fraud_signal_reviewed",
  /** [ESC-TRUST-AUDIT] — the `action` triage (reviewed → actioned; Admin). */
  ACTIONED: "fraud_signal_actioned",
  /** [ESC-TRUST-AUDIT] — the `dismiss` triage (reviewed → dismissed; Admin). */
  DISMISSED: "fraud_signal_dismissed",
} as const;

export type FraudSignalAuditActionToken =
  (typeof FraudSignalAuditAction)[keyof typeof FraudSignalAuditAction];

// ── W3-TRUST-5a — BC-TRUST-5 Public Review audit tokens (Doc-4G §G8.1/§G8.2/§G8.3 §7; Doc-6G §3.5.2) ─────
//
// Doc-2 §9 line 693 (Reviews domain row): "| Reviews | review submit, moderation decision, publish, remove |"
// — ALL FOUR review mutations are SEPARATELY ENUMERATED. Therefore, UNLIKE the fraud actions (which carry
// `[ESC-TRUST-AUDIT]` because §9 enumerates NO fraud action), these four tokens bind BY POINTER to an
// ENUMERATED §9 action and carry NO `[ESC-TRUST-AUDIT]` — exactly like the performance "recalculation" /
// "formula version change" tokens (Doc-4G §H.6 reserves `[ESC-TRUST-AUDIT]` for the NON-enumerated actions).
// Attribution (Doc-4G §H.6 / §G8): User for `submit` (`author_organization_id`); Admin for moderation
// decision / publish / remove.
//
// There is NO event (Doc-2 §8 has no Trust review event — Doc-4G §H.7); each mutation is state + THIS audit
// only. The request field `moderation_note` (reject) has NO DB column (Doc-4G §H.10 — Pass-B introduces no
// column) — it rides the immutable audit `newValue` (the fraud `triage_note` precedent); `removal_reason`
// persists as the SD `delete_reason` column. The token STRING is the Doc-4G-class serialization; a future
// rename touches Doc-4G/Doc-6G + this constant, never Doc-2.

/** The audit `entity_type` for `trust.public_reviews` rows (object-scope; Doc-4G §G8.1-§G8.3 §7). Singular
 *  per the identity buyer_profile / verified-tier / score / fraud precedent — a realization choice, NOT a
 *  frozen constant. */
export const PUBLIC_REVIEW_ENTITY_TYPE = "public_review" as const;

/**
 * Canonical Public Review audit actions — each binds BY POINTER to a SEPARATELY-ENUMERATED Doc-2 §9 Reviews
 * action (line 693); NO `[ESC-TRUST-AUDIT]`.
 *   SUBMITTED → §9 Reviews "review submit" (enumerated); the `submit_review` open leg (User).
 *   MODERATED → §9 Reviews "moderation decision" (enumerated); the `moderate_review` approve|reject (Admin).
 *   PUBLISHED → §9 Reviews "publish" (enumerated); the `publish_review` Step-1 transition (Admin).
 *   REMOVED   → §9 Reviews "remove" (enumerated); the `remove_review` hidden soft-delete (Admin).
 */
export const ReviewAuditAction = {
  /** §9 Reviews "review submit" (enumerated — no ESC); the `submit_review` open leg (User). */
  SUBMITTED: "review_submitted",
  /** §9 Reviews "moderation decision" (enumerated — no ESC); the `moderate_review` approve|reject (Admin). */
  MODERATED: "review_moderation_decision",
  /** §9 Reviews "publish" (enumerated — no ESC); the `publish_review` Step-1 transition (Admin). */
  PUBLISHED: "review_published",
  /** §9 Reviews "remove" (enumerated — no ESC); the `remove_review` hidden soft-delete (Admin). */
  REMOVED: "review_removed",
} as const;

export type ReviewAuditActionToken = (typeof ReviewAuditAction)[keyof typeof ReviewAuditAction];

// ── W3-TRUST-5b — BC-TRUST-5 Admin Rating audit token (Doc-4G §G8.4 §7; Doc-6G §3.5.1) ─────────────────
//
// PROOF that admin-rating set is NOT §9-enumerated (so it carries `[ESC-TRUST-AUDIT]`, UNLIKE the Public
// Review actions which ARE enumerated on line 693):
//   Doc-2 §9 line 693 (Reviews): "| Reviews | review submit, moderation decision, publish, remove |"
//   Doc-2 §9 line 694 (Admin):   "| Admin | ban issue/lift, category approve/delete, suggestion decisions,
//                                  import job execution, moderation decisions, link confirm/dismiss |"
// NEITHER enumerates an admin-RATING action. Therefore — exactly the fraud precedent — this token carries
// `[ESC-TRUST-AUDIT]` and binds the nearest §9 Trust action BY POINTER (channel Doc-2 §9 additive; NO §9
// action invented — Doc-4G §G8.4 §7 / §H.6). Attribution: Admin (`rated_by`). NO event (Doc-2 §8 has none —
// Doc-4G §H.7); each mutation is state + THIS audit only. The create-vs-update `operation` rides the audit
// `newValue` (no dedicated column). The token STRING is the Doc-4G-class serialization; a future rename
// touches Doc-4G/Doc-6G + this constant, never Doc-2.

/** The audit `entity_type` for `trust.admin_ratings` rows (object-scope; Doc-4G §G8.4 §7). Singular per the
 *  identity buyer_profile / verified-tier / score / fraud / public-review precedent — a realization choice,
 *  NOT a frozen constant. */
export const ADMIN_RATING_ENTITY_TYPE = "admin_rating" as const;

/**
 * Canonical Admin Rating audit action — `[ESC-TRUST-AUDIT]` (Doc-2 §9 693/694 enumerate no admin-rating
 * action → nearest §9 Trust action by pointer; Doc-4G §G8.4 §7 / §H.6).
 *   SET → `admin_rating_set` (create-or-update; Admin). The `operation` (create|update) rides `newValue`.
 */
export const AdminRatingAuditAction = {
  /** [ESC-TRUST-AUDIT] (nearest §9 Trust by pointer) — the `set_admin_rating` create-or-update (Admin). */
  SET: "admin_rating_set",
} as const;

export type AdminRatingAuditActionToken =
  (typeof AdminRatingAuditAction)[keyof typeof AdminRatingAuditAction];
