// Composition root for module "trust" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE §3). W3-TRUST-1 realized the BC-TRUST-1 Verification substrate (Doc-6G §3.1);
// W3-TRUST-2 realizes the `trust.request_verification.v1` audited write (Doc-4G §G4.1). Other modules
// consume `trustCommands` through `@/modules/trust/contracts`, never the application/infrastructure
// layers directly.

import {
  actionFraudSignal,
  computePerformanceScore,
  computeTrustScore,
  confirmVerifiedTier,
  createFraudSignal,
  dismissFraudSignal,
  downgradeVerifiedTier,
  establishVerifiedTier,
  expireVerifiedTier,
  ingestPerformanceInput,
  requestVerification,
  reviewFraudSignal,
  suspendVerifiedTier,
  triggerPerformanceReview,
} from "./contracts/services";

/** The M5 write surface. `requestVerification` = the D7 audited-write + SECURITY-DEFINER twist (Doc-4G
 *  §G4.1, restricted to `subject_type = organization`; W3-TRUST-2). The five verified-tier transitions
 *  (W3-TRUST-3; Doc-4G §G4.6/§G4.7) each write the tier via a SECURITY-DEFINER function + EMIT
 *  `VendorTierChanged` (the codebase's FIRST §8 emission) + audit — all atomically. The three Performance-Score
 *  System services (W3-TRUST-4a; Doc-4G §G6.1/§G6.2/§G6.4): `ingestPerformanceInput` (sole writer of
 *  `performance_inputs`, idempotent, no event), `computePerformanceScore` (Not-Rated gate + publish-on-change
 *  `PerformanceScoreUpdated` + audit, atomic; the formula is an [ESC-TRUST-POLICY] interim plug), and
 *  `triggerPerformanceReview` (emit `PerformanceReviewTriggered` + audit, no score write). The BC-TRUST-2
 *  Trust-Score System service (W3-TRUST-4b; Doc-4G §G5.1): `computeTrustScore` — reads Verification +
 *  Performance + a neutral Fraud read-seam ONLY (INVARIANT to Financial Tier — Invariant #6), calls the
 *  [ESC-TRUST-POLICY] interim formula plug (absence ≠ 0 → a NON-ZERO baseline; score ALWAYS 0–100), upserts the
 *  head + history-iff-changed, and publishes-on-change `TrustScoreUpdated` (band-only, suppressed while frozen)
 *  + one audit, atomically. The BC-TRUST-4 Fraud & Risk Signal write-lifecycle (W3-TRUST-4c; Doc-4G
 *  §G7.1/§G7.2): `createFraudSignal` (System-detected or staff-reported; IN-BAND dedup check-then-insert + ONE
 *  `[ESC-TRUST-AUDIT]` audit, atomic; idempotent on the detection key; NO event, NO SD) and the three triage
 *  transitions `reviewFraudSignal` (open→reviewed) / `actionFraudSignal` (reviewed→actioned) /
 *  `dismissFraudSignal` (reviewed→dismissed) — each an in-band optimistic state write + ONE audit, atomic;
 *  the firewall holds (mutates no score/verification/tier; never a ban — the ban is Admin's, DG-5). The admin
 *  HTTP commands, System timers, freeze/reactivate, the fraud reads + `staff_can_ban` comp-edge authz, and
 *  the fraud→verification revocation effect are DEFERRED; these are the functions they will call. */
export const trustCommands = {
  requestVerification,
  establishVerifiedTier,
  confirmVerifiedTier,
  downgradeVerifiedTier,
  suspendVerifiedTier,
  expireVerifiedTier,
  ingestPerformanceInput,
  computePerformanceScore,
  triggerPerformanceReview,
  computeTrustScore,
  createFraudSignal,
  reviewFraudSignal,
  actionFraudSignal,
  dismissFraudSignal,
};
