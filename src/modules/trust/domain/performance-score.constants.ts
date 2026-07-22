// M5 domain — the BC-TRUST-3 Performance-Score INTERIM binding constants: the frozen enum value sets +
// their type-guards (SYNTAX oracle), the input↔source SEMANTIC consistency rule, the interim error-code
// register ([ESC-TRUST-CODE]), and the review-cadence policy marker ([ESC-TRUST-POLICY]). Single source
// for every layer (service · repository); pure (no DB).
//
// ── Frozen enum value sets (Doc-2 §10.6 / Doc-6G §3.3.3 — do not extend) ─────────────────────────────────
// `performance_input_type` / `performance_source_type` are FIXED by the frozen corpus; these arrays mirror
// the migration ENUM labels VERBATIM and are the SYNTAX/SHAPE oracle (Doc-4G §G6.1 stage-1/2). Any value
// outside the set is a VALIDATION reject.
//
// ── [ESC-TRUST-POLICY] — the review-cadence / dedup windows ─────────────────────────────────────────────
// Doc-4G §G6.4 §10 / §H.8: the review-cadence + dedup windows are runtime tunables ABSENT from Doc-3 §12.2 →
// carried under `[ESC-TRUST-POLICY]` (reference platform default by name; no key invented). No registered
// Doc-3 §12.2 key exists, so no `core.config_value_query.v1` read is wired here — the cadence is a DEFERRED
// tunable, NOT coined-as-frozen. (The formula weights/components carry the same marker; see the formula module.)
//
// ── [ESC-TRUST-CODE] — the interim error-code register ──────────────────────────────────────────────────
// Doc-4G §G6.1/§G6.2/§G6.4 error CLASSES are frozen (VALIDATION/BUSINESS/REFERENCE/… per Doc-4A §12) but the
// `error_code` STRINGS are ABSENT from the frozen corpus — only the `trust_` namespace is fixed (Doc-4A
// Appendix B.2). Realized as NAMED CONSTANTS in the `trust_` namespace, carried `[ESC-TRUST-CODE]` (the
// verified-tier precedent).

import type { PerformanceInputTypeValue, PerformanceSourceTypeValue } from "../contracts/types";

/** The frozen `trust.performance_input_type` set (Doc-2 §10.6 / Doc-6G §3.3.3; SYNTAX oracle). */
export const PERFORMANCE_INPUT_TYPES: ReadonlySet<PerformanceInputTypeValue> = new Set([
  "response",
  "decline",
  "non_response",
  "delivery",
  "feedback",
  "dispute",
  "completion",
]);

/** The frozen `trust.performance_source_type` set (Doc-2 §10.6 / Doc-6G §3.3.3; SYNTAX oracle). */
export const PERFORMANCE_SOURCE_TYPES: ReadonlySet<PerformanceSourceTypeValue> = new Set([
  "invitation",
  "quotation",
  "engagement",
  "wcc",
]);

export function isPerformanceInputType(v: unknown): v is PerformanceInputTypeValue {
  return typeof v === "string" && PERFORMANCE_INPUT_TYPES.has(v as PerformanceInputTypeValue);
}

export function isPerformanceSourceType(v: unknown): v is PerformanceSourceTypeValue {
  return typeof v === "string" && PERFORMANCE_SOURCE_TYPES.has(v as PerformanceSourceTypeValue);
}

/**
 * SEMANTIC consistency (Doc-4G §G6.1 stage-3; §H.11) — the ONE FROZEN-EXPLICIT rule: `response` / `decline` /
 * `non_response` are the invitation-response leg and are only consistent with `source_type = invitation`
 * ("only delivered invitations generate response/non_response inputs"). The pairings for the OTHER input
 * types (delivery/feedback/dispute/completion ↔ engagement/quotation/wcc) are NOT exhaustively frozen — they
 * are left permissive here and carried as a documented interim (`[ESC-TRUST-POLICY]`); only the frozen-explicit
 * invitation rule is ENFORCED. Returns true when the pairing is allowed.
 */
export function isInputSourceConsistent(
  inputType: PerformanceInputTypeValue,
  sourceType: PerformanceSourceTypeValue,
): boolean {
  if (inputType === "response" || inputType === "decline" || inputType === "non_response") {
    return sourceType === "invitation"; // FROZEN-EXPLICIT (Doc-4G §G6.1 stage-3 / §H.11)
  }
  return true; // [ESC-TRUST-POLICY] interim — the remaining pairings are not exhaustively frozen
}

// ── [ESC-TRUST-CODE] error codes (classes per Doc-4G §G6 · Doc-4A §12) ──────────────────────────────────

/** VALIDATION (400) — SYNTAX/SHAPE failure (missing/typed field; enum out of the Doc-2 §10.6 set; bad uuid). */
export const PERFORMANCE_INVALID_INPUT_CODE = "trust_performance_invalid_input";

/** BUSINESS (422) — `input_type`/`source_type` inconsistency (Doc-4G §G6.1 stage-3; e.g. `response` not on `invitation`). */
export const PERFORMANCE_INPUT_INCONSISTENT_CODE = "trust_performance_input_inconsistent";

/** REFERENCE (422) — `trigger_performance_review` on a vendor with NO `performance_scores` row (Doc-4G §G6.4 §4). */
export const PERFORMANCE_REVIEW_SUBJECT_UNRESOLVED_CODE =
  "trust_performance_review_subject_unresolved";
