// M5 domain — the BC-TRUST-2 Trust-Score INTERIM binding constants: the frozen compute-trigger set +
// its SYNTAX oracle, the interim error-code register ([ESC-TRUST-CODE]), and the interim formula stamp
// ([ESC-TRUST-POLICY]). Single source for every layer (service · repository); pure (no DB).
//
// ── Frozen compute-trigger set (Doc-4G §G5.1 §2 — do not extend) ────────────────────────────────────────
// `trust.compute_trust_score.v1` takes `trigger : enum<input_signal_change|scheduled_recalc|
// formula_version_change>` (Doc-4G §G5.1 §2). This array is the SYNTAX/SHAPE oracle (Doc-4A §11.2 stage-1/2);
// any value outside the set is a VALIDATION reject. NOTE the label is `input_signal_change` (Trust Score),
// NOT `input_change` (Performance §G6.2) — the two contracts have distinct trigger vocabularies.
//
// ── [ESC-TRUST-POLICY] — the formula version stamp ──────────────────────────────────────────────────────
// `TRUST_FORMULA_VERSION` stamps the INTERIM plug (Doc-4G §G5.1 §12 "Formula thresholds carry
// `[ESC-TRUST-POLICY]`; bump `trust_formula_version` on change — never invent a POLICY key"). NOT a coined
// frozen value: a ratified formula bumps this via an additive Doc-2/Doc-4G/Doc-3 patch. `text` in `trust_scores`.
//
// ── [ESC-TRUST-CODE] — the interim error-code register ──────────────────────────────────────────────────
// Doc-4G §G5.1 error CLASSES are frozen (VALIDATION/REFERENCE/… per Doc-4A §12) but the `error_code` STRINGS
// are ABSENT from the frozen corpus — only the `trust_` namespace is fixed (Doc-4A Appendix B.2). Realized as
// NAMED CONSTANTS in the `trust_` namespace, carried `[ESC-TRUST-CODE]` (the performance-score precedent).

import type { TrustComputeTrigger } from "../contracts/types";

/**
 * `TRUST_FORMULA_VERSION` — stamps the INTERIM plug (Doc-4G §G5.1 §12). NOT a coined frozen value: a ratified
 * formula bumps this via an additive Doc-2/Doc-4G/Doc-3 patch. The value is opaque `text` in `trust_scores`.
 */
export const TRUST_FORMULA_VERSION = "esc-interim-0" as const;

/** The frozen `compute_trust_score` trigger set (Doc-4G §G5.1 §2; SYNTAX oracle). */
export const TRUST_COMPUTE_TRIGGERS: ReadonlySet<TrustComputeTrigger> = new Set([
  "input_signal_change",
  "scheduled_recalc",
  "formula_version_change",
]);

export function isTrustComputeTrigger(v: unknown): v is TrustComputeTrigger {
  return typeof v === "string" && TRUST_COMPUTE_TRIGGERS.has(v as TrustComputeTrigger);
}

// ── [ESC-TRUST-CODE] error codes (classes per Doc-4G §G5.1 · Doc-4A §12) ─────────────────────────────────

/** VALIDATION (400) — SYNTAX/SHAPE failure (bad `vendor_profile_id` uuid; `trigger` outside the frozen enum). */
export const TRUST_SCORE_INVALID_INPUT_CODE = "trust_trust_score_invalid_input";

/**
 * REFERENCE (422) — an input SUBJECT is syntactically valid but unresolved by a read-service (Doc-4G §G5.1 §9).
 * RESERVED: with the frozen firewall/absence-tolerance postures (absence-of-history ≠ 0, fraud-absent neutral),
 * absent inputs are a TOLERATED valid state — the compute pipeline does not raise REFERENCE for them. The code
 * is registered for the closed error-class set (Doc-4A §12) and a future non-tolerated-reference case.
 */
export const TRUST_SCORE_SUBJECT_UNRESOLVED_CODE = "trust_trust_score_subject_unresolved";
