// M5 domain (PRIVATE) — the Trust-Score FORMULA PLUG + the FROZEN firewall/absence postures (Doc-4G §G5.1 /
// §H.9; Doc-6G §3.2.1; Doc-2 §3.6/§10.6; Doc-3 §12.1 FIXED). Pure (no DB, no state); the SINGLE place the
// Trust Score is derived; the compute service calls this and NEVER hand-rolls a score.
//
// ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║  THE FORMULA IS AN [ESC-TRUST-POLICY] PLUG — THE INTERIM BODY BELOW IS NOT THE RATIFIED ALGORITHM.       ║
// ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════╝
// Doc-4G §G5.1 §12 (authoritative): "Formula thresholds carry `[ESC-TRUST-POLICY]`; bump `trust_formula_version`
// on change — never invent a POLICY key." Doc-4G §G5.1 §4 (POLICY stage): "formula thresholds/weights absent
// from Doc-3 §12.2 → `[ESC-TRUST-POLICY]`". Accordingly:
//   • The formula WEIGHTS, the BAND thresholds, and the NON-ZERO baseline VALUE are Board-deferred (a Doc-3
//     §12.2 additive patch). This module coins NONE of them.
//   • `computeTrustScore` is a PURE, VERSIONED, PLUGGABLE function. Its interim body is a DOCUMENTED PLACEHOLDER
//     whose only job is to exercise the FROZEN PIPELINE (the firewall, absence≠0, publish-on-change, atomicity).
//     `TRUST_FORMULA_VERSION = "esc-interim-0"` STAMPS this interim so a later ratified formula bumps the version
//     (additive Doc-2/Doc-4G/Doc-3 patch) and every downstream re-derives.
//   • NO TEST asserts a specific score/band VALUE (there is no frozen expected value) — tests assert PIPELINE
//     behavior. The interim score is a deterministic bounded placeholder derived ONLY from Trust-Score inputs.
//
// WHAT IS FROZEN HERE (built for real — Doc-4G §H.9 / Doc-6G §3.2.1 / Doc-3 §12.1 FIXED):
//   • ⛔ FIREWALL (Invariant #6 / Doc-4G §H.9b/c / Architecture §1.5): the inputs are Verification (BC-TRUST-1)
//     + Performance (BC-TRUST-3) + Fraud-signal state (BC-TRUST-4) ONLY. The Trust Score is INVARIANT to
//     Financial Tier — it NEVER reads `verified_financial_tiers` and NEVER reads Buyer-Vendor Status. Financial
//     Tier never increases/feeds the Trust Score; no secondary signal dominates. This module has NO access to
//     those signals (the repository reads verification_records + performance_scores only; fraud is a neutral seam).
//   • ABSENCE ≠ 0 (Doc-3 §12.1 FIXED; Doc-4G §H.9f): a vendor with NO positive inputs must NOT score 0 — the plug
//     produces a documented NON-ZERO neutral baseline. `trust_scores.score` is `smallint NOT NULL` (Doc-6G
//     §3.2.1) — there is NO Not-Rated NULL state; the plug ALWAYS returns a 0–100 score + a non-empty band.
//     Absent performance (no `performance_scores` row / Not-Rated) contributes NEUTRALLY, not zero-dominant.
//     Fraud-absent contributes NEUTRALLY (no risk penalty).
//
// The fraud input is a TOLERATED neutral-absent state today (BC-TRUST-4 UNBUILT — no `fraud_signals` table). It
// is a VALID input, not a missing dependency: most vendors have no fraud signal. When BC-TRUST-4 lands, the
// read-seam returns the real state and the SAME plug consumes it as `risk` — ZERO plug redesign.

/**
 * The read-only Verification (BC-TRUST-1) summary the plug consumes — a count of APPROVED `verification_records`
 * for the subject. Firewall-safe: derived exclusively from `trust.verification_records` (never `verified_
 * financial_tiers`). Tier-verification records are NOT special-cased — an approved verification counts uniformly.
 */
export interface VerificationSummary {
  /** Count of `verification_records` in state `approved` for the subject vendor. */
  approvedCount: number;
  /** `true` iff at least one approved verification exists. */
  hasAnyApproved: boolean;
}

/**
 * The read-only Performance (BC-TRUST-3) summary the plug consumes — from the `performance_scores` HEAD. When
 * the vendor is Not-Rated (no row / below the min-threshold gate) the score contributes NEUTRALLY (never 0).
 * Firewall-safe: performance is a governance signal in its own right — the Trust Score reads it, never mutates it.
 */
export interface PerformanceSummary {
  /** `true` iff a `performance_scores` row exists for the vendor. */
  present: boolean;
  /** `true` iff the vendor is rated (min-threshold met AND a non-null score). */
  rated: boolean;
  /** 0–100 when rated; `null` while Not-Rated (contributes neutrally — never as 0). */
  score: number | null;
}

/**
 * The Fraud (BC-TRUST-4) read-seam state. BC-TRUST-4 is UNBUILT — there is NO `fraud_signals` table today, so
 * the seam returns a NEUTRAL "absent" state (`present: false`). The plug treats fraud-absent as NEUTRAL (no risk
 * penalty). This is a TOLERATED valid input, NOT a dependency/reference error (owner-directed). The `riskLevel`
 * field is reserved for the real signal (BC-TRUST-4) and is unused while absent.
 */
export interface FraudSignalState {
  /** `false` today (no `fraud_signals` table). `true` when BC-TRUST-4 lands and a signal exists. */
  present: boolean;
  /** Reserved for the real BC-TRUST-4 signal; `null` while absent (neutral). [ESC-TRUST-POLICY] weighting. */
  riskLevel: string | null;
}

/** The firewall-scoped input bundle for the plug — Verification + Performance + Fraud ONLY (Doc-4G §H.9b). */
export interface TrustScoreInputs {
  verification: VerificationSummary;
  performance: PerformanceSummary;
  fraud: FraudSignalState;
}

/** The result of the plug (Doc-4G §G5.1 §3 internal effect). `score` is ALWAYS 0–100 (never null — no Not-Rated). */
export interface TrustScoreComputation {
  /** 0–100 — ALWAYS a real score (Doc-6G §3.2.1 `score smallint NOT NULL`; Trust Score has no Not-Rated NULL). */
  score: number;
  /** The interim band bucket (text; Doc-6G §3.2.1 declares no enum values). [ESC-TRUST-POLICY] — not ratified. */
  band: string;
  /** Firewall-safe input trace (Verification/Performance/Fraud only) — audit metadata, not a persisted column. */
  componentsMeta: Record<string, unknown>;
}

/**
 * [ESC-TRUST-POLICY] INTERIM non-zero neutral baseline. Doc-3 §12.1 FIXED: absence-of-history is NEVER 0 — a
 * vendor with no positive inputs settles at this documented NON-ZERO midpoint, NOT at 0. The exact value is
 * Board-deferred (Doc-3 §12.2); `50` is a placeholder midpoint, not asserted by any test.
 */
const INTERIM_BASELINE = 50 as const;

function clamp01to100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * [ESC-TRUST-POLICY] INTERIM PLACEHOLDER — NOT the ratified scoring algorithm. Deterministic bounded 0–100
 * derived ONLY from the firewall-scoped inputs (Verification + Performance + Fraud). Its VALUE is not asserted by
 * any test; determinism is what publish-on-change relies on (same inputs → same score). A ratified formula
 * replaces this whole body and bumps `TRUST_FORMULA_VERSION`.
 *
 * FROZEN behaviour this interim honors:
 *   • Absence ≠ 0 — with zero inputs the result is the NON-ZERO baseline (never 0).
 *   • Firewall — reads Verification + Performance + Fraud ONLY; Financial Tier / Buyer status are NOT parameters.
 *   • Performance Not-Rated / fraud-absent contribute NEUTRALLY (no down-weighting to zero).
 */
function interimScorePlaceholder(inputs: TrustScoreInputs): number {
  let raw = INTERIM_BASELINE;

  // Verification (BC-TRUST-1): each approved verification nudges up, capped — an interim placeholder weighting.
  raw += Math.min(inputs.verification.approvedCount, 5) * 5;

  // Performance (BC-TRUST-3): if rated, pull toward the performance score; Not-Rated contributes NEUTRALLY
  // (the baseline is retained, NEVER zeroed — absence ≠ 0).
  if (inputs.performance.rated && inputs.performance.score !== null) {
    raw = (raw + inputs.performance.score) / 2;
  }

  // Fraud (BC-TRUST-4): absent → NO penalty (neutral). A real signal would subtract here — deferred to BC-TRUST-4.
  // (No branch on fraud today: `present` is always false; the neutral path is the only path.)

  return clamp01to100(raw);
}

/**
 * [ESC-TRUST-POLICY] INTERIM PLACEHOLDER `band` — coarse buckets; NOT ratified band labels (Doc-6G §3.2.1
 * declares no `band` enum values → `band` is opaque `text`). Deterministic function of the interim score; the
 * bucket boundaries are Board-deferred (Doc-3 §12.2). Not asserted by tests. Always non-empty (never NULL).
 */
function interimBandPlaceholder(score: number): string {
  if (score >= 80) return "esc-interim-high";
  if (score >= 50) return "esc-interim-mid";
  return "esc-interim-low";
}

/**
 * [ESC-TRUST-POLICY] INTERIM PLACEHOLDER `componentsMeta` — a firewall-safe trace of the inputs that fed the
 * score, for the audit newValue (Trust Score has NO `components_jsonb` column — this is NOT persisted to a
 * table). FIREWALL (Doc-6G §3.2.1; Invariant #6): every entry is a Verification / Performance / Fraud fact ONLY
 * — NEVER Financial Tier, a tier band, or Buyer-Vendor Status. Keys are deliberately neutral (no `financial`/
 * `tier`/`buyer` token) so the immutable ledger cannot leak a firewalled signal.
 */
function buildComponentsMeta(
  inputs: TrustScoreInputs,
  formulaVersion: string,
): Record<string, unknown> {
  return {
    formulaVersion,
    baseline: INTERIM_BASELINE,
    note: "[ESC-TRUST-POLICY] INTERIM — placeholder weighting; weights/band-thresholds/baseline are Board-deferred (Doc-3 §12.2); NOT the ratified algorithm.",
    inputs: {
      verificationApprovedCount: inputs.verification.approvedCount,
      performancePresent: inputs.performance.present,
      performanceRated: inputs.performance.rated,
      performanceContributed: inputs.performance.rated && inputs.performance.score !== null,
      fraudPresent: inputs.fraud.present, // false today (BC-TRUST-4 unbuilt) — neutral
    },
  };
}

/**
 * Compute a Trust Score from a vendor's firewall-scoped inputs (Doc-4G §G5.1). PURE + VERSIONED + PLUGGABLE.
 *
 * FROZEN (built for real): FIREWALL — inputs are Verification + Performance + Fraud only; the score is INVARIANT
 * to Financial Tier (Doc-4G §H.9b/c; Invariant #6). ABSENCE ≠ 0 — with no inputs the score is the NON-ZERO
 * baseline, never 0 (Doc-3 §12.1 FIXED); the score is ALWAYS 0–100 (Doc-6G §3.2.1 `NOT NULL` — no Not-Rated).
 * INTERIM ([ESC-TRUST-POLICY]): the score/band derivation below is a documented placeholder — NOT the ratified
 * algorithm; `formulaVersion` stamps it. Callers pass `TRUST_FORMULA_VERSION`.
 */
export function computeTrustScore(
  inputs: TrustScoreInputs,
  formulaVersion: string,
): TrustScoreComputation {
  const score = interimScorePlaceholder(inputs); // [ESC-TRUST-POLICY] interim; absence≠0; firewall-safe
  const band = interimBandPlaceholder(score); // [ESC-TRUST-POLICY] interim
  const componentsMeta = buildComponentsMeta(inputs, formulaVersion);
  return { score, band, componentsMeta };
}
