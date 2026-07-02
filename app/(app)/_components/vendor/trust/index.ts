// Vendor Trust & Performance presentation components (Team 3, P-VND-28). Presentation-only, reads
// `trust.get_trust_score.v1` / `trust.get_performance_score.v1` / `trust.get_verified_tier.v1`
// (Doc-4G PassB Parts 1–3). Zero contract invention; reuses the frozen kit `embedded/trust-badge`
// and the vendor Company `TierChip` rather than duplicating either.
export {
  TrustPerformanceDashboard,
  type TrustPerformanceDashboardProps,
} from "./trust-performance-dashboard";
export { TrustScoreCard, type TrustScoreCardProps } from "./trust-score-card";
export { TrustScoreRing, type TrustScoreRingProps } from "./trust-score-ring";
export { PerformanceScoreCard, type PerformanceScoreCardProps } from "./performance-score-card";
export { VerifiedTierCard, type VerifiedTierCardProps } from "./verified-tier-card";

export type {
  FreezeState,
  TrustScoreView,
  PerformanceScoreView,
  VerifiedTierStatus,
  VerifiedTierView,
} from "./types";
