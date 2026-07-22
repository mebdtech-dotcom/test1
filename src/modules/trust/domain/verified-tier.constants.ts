// M5 domain — the Verified-Tier INTERIM binding constants: the review-window policy ([ESC-TRUST-POLICY]),
// the error-code register ([ESC-TRUST-CODE]), and the AUTHZ slug (Doc-2 §7 — by pointer). Single source for
// every layer (service · repository · the deferred admin command); the composition edge reaches them only
// through re-exports on `contracts/` (never a cross-module domain import).
//
// ── [ESC-TRUST-POLICY] — the 24-month verified-tier review window ──────────────────────────────────────
// Doc-4G §G4.7 §10: "The 24-month review window is a runtime tunable ABSENT from Doc-3 §12.2 → carried under
// `[ESC-TRUST-POLICY]` (reference platform default by name; no key invented)." There is NO registered Doc-3
// §12.2 key, so `core.config_value_query.v1` would REFERENCE-fail on it. Until a Doc-3 additive patch
// registers the key, the window is a clearly-marked interim CONSTANT (documented, NOT coined-as-frozen).
//
// ── [ESC-TRUST-CODE] — the interim error-code register ─────────────────────────────────────────────────
// Doc-4G §G4.6/§G4.7 error CLASSES are frozen (VALIDATION/NOT_FOUND/STATE/CONFLICT/BUSINESS/REFERENCE/
// DEPENDENCY per Doc-5A §6.2) but the `error_code` STRINGS are ABSENT from the frozen corpus — only the
// `trust_` namespace is fixed (Doc-4A Appendix B.2). Realized as NAMED CONSTANTS in the `trust_` namespace,
// carried `[ESC-TRUST-CODE]` (the exact `request_verification` / identity buyer_profile interim precedent).
//
// ── AUTHZ slug (Doc-2 §7 — bound by pointer, not coined) ───────────────────────────────────────────────
// `staff_can_verify` is the ENUMERATED Doc-2 §7 staff slug the DEFERRED admin command enforces (Doc-4G
// §G4.6/§G4.7 §5). Bound as a named constant so the deferred composition edge references ONE source.

/** [ESC-TRUST-POLICY] — verified-tier review window, in months (Doc-4G §G4.7 §10; no registered Doc-3 key). */
export const VERIFIED_TIER_REVIEW_WINDOW_MONTHS = 24 as const;

/**
 * Compute `next_review_at` = `verifiedAt` + the [ESC-TRUST-POLICY] review window (24 months). Pure. UTC —
 * `setUTCMonth` rolls the year over correctly; a shorter target month clamps to its last valid day (JS
 * `Date` normalization). The window is the interim default above, NOT a coined frozen value.
 */
export function computeNextReviewAt(verifiedAt: Date): Date {
  const next = new Date(verifiedAt.getTime());
  next.setUTCMonth(next.getUTCMonth() + VERIFIED_TIER_REVIEW_WINDOW_MONTHS);
  return next;
}

// ── [ESC-TRUST-CODE] error codes (classes per Doc-4G §G4.6/§G4.7 · Doc-5A §6.2) ────────────────────────

/** VALIDATION (400) — SYNTAX failure (missing/typed field; `tier` not A–E; bad uuid). */
export const VERIFIED_TIER_INVALID_INPUT_CODE = "trust_verified_tier_invalid_input";

/** NOT_FOUND (404) — no verified-tier row for the vendor (confirm/downgrade/suspend/expire target). */
export const VERIFIED_TIER_NOT_FOUND_CODE = "trust_verified_tier_not_found";

/** STATE (409/422) — wrong source status for the transition (Doc-4G §G4.6/§G4.7 State Machine). */
export const VERIFIED_TIER_ILLEGAL_STATE_CODE = "trust_verified_tier_illegal_state";

/** CONFLICT (409) — stale optimistic token (`expected_revision`/`updated_at` mismatch) or a concurrent change. */
export const VERIFIED_TIER_REVISION_CONFLICT_CODE = "trust_verified_tier_revision_conflict";

/** BUSINESS (422) — a verified-tier row already exists for the vendor on `set` (UNIQUE(vendor_profile_id)). */
export const VERIFIED_TIER_ALREADY_EXISTS_CODE = "trust_verified_tier_already_exists";

/**
 * BUSINESS (422) — the `set` basis `verification_record_id` is not an APPROVED tier verification for THIS
 * vendor (Doc-4G §G4.6 stage-8, line 339: `state='approved' AND verification_type='tier'`; the subject→vendor
 * linkage binds to §G4.1's "subject_id : the vendor_profile" — `subject_type='vendor_profile' AND
 * subject_id=vendor_profile_id`). Covers non-existent / non-approved / wrong-type / wrong-subject bases.
 */
export const VERIFIED_TIER_INVALID_BASIS_CODE = "trust_verified_tier_invalid_basis";

/** BUSINESS (422) — `downgrade` target tier is not a STRICTLY lower band than the current tier (§G4.6). */
export const VERIFIED_TIER_INVALID_DOWNGRADE_CODE = "trust_verified_tier_invalid_downgrade";

/** BUSINESS (422) — `expire` invoked before the 24-month review is due (§G4.7 "not due → no transition"). */
export const VERIFIED_TIER_REVIEW_NOT_DUE_CODE = "trust_verified_tier_review_not_due";

/** BUSINESS (422) — `suspend` without the mandatory `reason` (§G4.7). */
export const VERIFIED_TIER_SUSPEND_REASON_REQUIRED_CODE =
  "trust_verified_tier_suspend_reason_required";

/** Doc-2 §7 staff slug the DEFERRED admin verified-tier commands enforce (bound by pointer; never coined). */
export const STAFF_CAN_VERIFY_SLUG = "staff_can_verify" as const;
