// M5 domain (PRIVATE) — the Performance-Score FORMULA PLUG + the FROZEN Not-Rated gate (Doc-4G §G6.2 / §H.9;
// Doc-6G §3.3.1; Doc-2 §10.6). Pure (no DB, no state); the SINGLE place the score is derived; the compute
// service calls this and NEVER hand-rolls a score. Reused by the write-service.
//
// ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║  THE FORMULA IS AN [ESC-TRUST-POLICY] PLUG — THE INTERIM BODY BELOW IS NOT THE RATIFIED ALGORITHM.       ║
// ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════╝
// Doc-4G §G6.2 line 145 (authoritative): "Formula tunables carry `[ESC-TRUST-POLICY]`; bump
// `performance_formula_version`; never invent a key." Doc-4G §G6.2 §9 (POLICY): "component weights / threshold
// / renormalization absent from Doc-3 §12.2 → `[ESC-TRUST-POLICY]`". Accordingly:
//   • The SIX `components_jsonb` components (Doc-2 §10.6) — their NAMES, WEIGHTS, derivation, and renormalization
//     are Board-deferred (a Doc-3 §12.2 additive patch). This module coins NONE of them.
//   • `computePerformanceScore` is a PURE, VERSIONED, PLUGGABLE function. Its interim body is a DOCUMENTED
//     PLACEHOLDER whose only job is to exercise the FROZEN PIPELINE (the Not-Rated gate, publish-on-change,
//     atomicity). `PERFORMANCE_FORMULA_VERSION = "esc-interim-0"` STAMPS this interim so a later ratified
//     formula bumps the version (additive Doc-2/Doc-4G/Doc-3 patch) and every downstream re-derives.
//   • NO TEST asserts a specific score value (there is no frozen expected value) — tests assert PIPELINE behavior.
//     The interim score is a deterministic bounded placeholder derived ONLY from performance inputs (firewall).
//
// WHAT IS FROZEN HERE (built for real — Doc-4G §H.9f / Doc-6G §3.3.1 line 74 / Doc-2 §10.6 / Doc-3 §12.1 FIXED):
//   • The Not-Rated MIN-THRESHOLD gate: `min_threshold_met = (responses ≥ 5) OR (projects ≥ 2)`, where a
//     "response" = quote OR formal decline (Doc-2 §10.6 A-10) and a "project" = a completed project (Doc-3 §5).
//     Below it the score is NULL — **Not Rated, NEVER 0** (absence-of-inputs is never scored as zero).
//   • The FIREWALL: `components_jsonb` carries performance inputs ONLY — never Financial Tier, Trust Score, or
//     Buyer-Vendor Status (Doc-6G §3.3.1 line 84; Invariant #6). This module has NO access to those signals.
//
// FROZEN gate-leg definitions (NOT [ESC] — both are corpus-defined; only the formula WEIGHTS below are [ESC]):
//   • "response" = quote OR formal decline (Doc-2 §10.6 A-10, line 884: "Performance framework defines
//     response = quote OR formal decline") → `input_type IN ('response','decline')`. `non_response` is the
//     ABSENCE of a response and does NOT count (A-10; undelivered invitations excluded, Doc-2 §10.6 line 759).
//   • "project" = a completed project (Doc-3 §5 line 250: "5 responses or 2 completed projects") →
//     `input_type='completion'`. The GATE STRUCTURE (5 responses OR 2 projects) is frozen and built exactly.

/**
 * `PERFORMANCE_FORMULA_VERSION` — stamps the INTERIM plug (Doc-4G §G6.2). NOT a coined frozen value: a ratified
 * formula bumps this via an additive Doc-2/Doc-4G/Doc-3 patch. The value is opaque `text` in `performance_scores`.
 */
export const PERFORMANCE_FORMULA_VERSION = "esc-interim-0" as const;

/** FROZEN min-threshold gate (Doc-6G §3.3.1 line 74; Doc-2 §10.6): 5 responses OR 2 projects. */
export const PERFORMANCE_MIN_RESPONSES = 5 as const;
export const PERFORMANCE_MIN_PROJECTS = 2 as const;

/**
 * The per-`input_type` tally the compute service reads from `performance_inputs` for one vendor. Counts ONLY —
 * the interim plug needs no more; a ratified formula will read richer aggregates. Firewall-safe: derived
 * exclusively from `trust.performance_inputs` (never Tier/Trust/Buyer-Status).
 */
export interface PerformanceInputTally {
  responseCount: number; // input_type='response' (a submitted quote — a "response" per Doc-2 §10.6 A-10)
  declineCount: number; // input_type='decline' (a FORMAL DECLINE — ALSO a "response" per Doc-2 §10.6 A-10)
  nonResponseCount: number; // input_type='non_response' (an ABSENCE — never a "response"; excluded from the gate)
  deliveryCount: number; // input_type='delivery'
  feedbackCount: number; // input_type='feedback'
  disputeCount: number; // input_type='dispute'
  completionCount: number; // input_type='completion' (a "completed project" — Doc-3 §5 line 250 gate leg)
}

/** The result of the plug (Doc-4G §G6.2 §3 internal effect). `score`/`level` NULL while Not Rated. */
export interface PerformanceComputation {
  /** 0–100, or NULL = Not Rated (below the min-threshold gate — never 0). */
  score: number | null;
  /** Interim `level` text (NULL while Not Rated). [ESC-TRUST-POLICY] — not a ratified band label. */
  level: string | null;
  /** The 6-component interim structure (Doc-2 §10.6). [ESC-TRUST-POLICY] weights/names; FIREWALL-safe. */
  componentsJson: Record<string, unknown>;
  /** The FROZEN gate outcome (Doc-6G §3.3.1). */
  minThresholdMet: boolean;
}

/**
 * FROZEN gate (Doc-2 §10.6 line 800 `min_threshold_met(5 responses OR 2 projects)`; Doc-6G §3.3.1 line 74):
 * `(responses ≥ 5) OR (projects ≥ 2)`, where — per Doc-2 §10.6 A-10 (line 884) — a "response" is a quote OR a
 * formal decline (`response` + `decline`; `non_response` is an absence and never counts), and a "project" is a
 * completed project (`completion`; Doc-3 §5 line 250 "2 completed projects").
 */
export function isMinThresholdMet(tally: PerformanceInputTally): boolean {
  return (
    tally.responseCount + tally.declineCount >= PERFORMANCE_MIN_RESPONSES ||
    tally.completionCount >= PERFORMANCE_MIN_PROJECTS
  );
}

/**
 * [ESC-TRUST-POLICY] INTERIM PLACEHOLDER — NOT the ratified scoring algorithm. Deterministic bounded 0–100
 * derived ONLY from performance-input counts (firewall). Its VALUE is not asserted by any test; determinism is
 * what publish-on-change relies on (same tally → same score). A ratified formula replaces this whole body and
 * bumps `PERFORMANCE_FORMULA_VERSION`.
 *
 * DEFERRED with the ratified formula ([ESC-TRUST-POLICY]): Buyer-Feedback Path A/B de-duplication (Doc-4G §H.10 —
 * feedback rows are "never naively summed; de-dup at computation"). This interim naively counts `feedbackCount`;
 * feedback is non-gate-bearing and Path B (BC-TRUST-5 published reviews) is unbuilt, so it is harmless until the
 * ratified formula lands and must honor H.10 renormalization.
 */
function interimScorePlaceholder(tally: PerformanceInputTally): number {
  const positive =
    tally.responseCount + tally.deliveryCount + tally.completionCount + tally.feedbackCount;
  const negative = tally.declineCount + tally.nonResponseCount + tally.disputeCount;
  const raw = positive * 10 - negative * 5;
  return Math.max(0, Math.min(100, raw));
}

/**
 * [ESC-TRUST-POLICY] INTERIM PLACEHOLDER `level` — coarse buckets; NOT ratified `level` values (Doc-2 §10.6
 * enumerates none → `level` is opaque `text`). Deterministic function of the interim score; not asserted by tests.
 */
function interimLevelPlaceholder(score: number): string {
  if (score >= 80) return "esc-interim-high";
  if (score >= 50) return "esc-interim-mid";
  return "esc-interim-low";
}

/**
 * [ESC-TRUST-POLICY] INTERIM PLACEHOLDER `components_jsonb` — six positional placeholder components (Doc-2 §10.6
 * "6 weighted components"). NAMES + WEIGHTS + renormalization are Board-deferred (Doc-3 §12.2); each carries a
 * null weight to make the interim status explicit. FIREWALL (Doc-6G §3.3.1 line 84): every entry is a
 * performance-input tally ONLY — NEVER Financial Tier / Trust Score / Buyer-Vendor Status.
 */
function buildInterimComponents(
  tally: PerformanceInputTally,
  formulaVersion: string,
): Record<string, unknown> {
  return {
    formulaVersion,
    note: "[ESC-TRUST-POLICY] INTERIM — placeholder component structure; names/weights/renormalization are Board-deferred (Doc-3 §12.2); NOT the ratified algorithm.",
    // Six positional placeholder components (Doc-2 §10.6 "6 weighted components"); weight null = deferred.
    components: [
      { key: "component_1", weight: null, inputs: { responseCount: tally.responseCount } },
      { key: "component_2", weight: null, inputs: { declineCount: tally.declineCount } },
      { key: "component_3", weight: null, inputs: { nonResponseCount: tally.nonResponseCount } },
      { key: "component_4", weight: null, inputs: { deliveryCount: tally.deliveryCount } },
      { key: "component_5", weight: null, inputs: { feedbackCount: tally.feedbackCount } },
      {
        key: "component_6",
        weight: null,
        inputs: { disputeCount: tally.disputeCount, completionCount: tally.completionCount },
      },
    ],
  };
}

/**
 * Compute a Performance Score from a vendor's input tally (Doc-4G §G6.2). PURE + VERSIONED + PLUGGABLE.
 *
 * FROZEN (built exactly): Not-Rated gate — while `min_threshold_met` is false the score is NULL (Not Rated,
 * NEVER 0; absence-of-inputs ≠ 0 — Doc-3 §12.1 FIXED). FIREWALL — `componentsJson` is performance inputs only.
 * INTERIM ([ESC-TRUST-POLICY]): the score/level/component derivation below is a documented placeholder — NOT
 * the ratified algorithm; `formulaVersion` stamps it. Callers pass `PERFORMANCE_FORMULA_VERSION`.
 */
export function computePerformanceScore(
  tally: PerformanceInputTally,
  formulaVersion: string,
): PerformanceComputation {
  const minThresholdMet = isMinThresholdMet(tally);
  const componentsJson = buildInterimComponents(tally, formulaVersion);

  // FROZEN Not-Rated gate: below the threshold → NULL (Not Rated), never 0. (Doc-4G §H.9f; Doc-3 §12.1 FIXED.)
  if (!minThresholdMet) {
    return { score: null, level: null, componentsJson, minThresholdMet: false };
  }

  const score = interimScorePlaceholder(tally); // [ESC-TRUST-POLICY] interim
  const level = interimLevelPlaceholder(score); // [ESC-TRUST-POLICY] interim
  return { score, level, componentsJson, minThresholdMet: true };
}
