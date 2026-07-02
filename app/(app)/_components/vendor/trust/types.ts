// P-VND-28 Trust & Performance — read-only governance-signal dashboard. ZERO CONTRACT INVENTION:
// every field traces to a frozen Doc-4G PassB read: `trust.get_trust_score.v1` (Part2 §G5.3),
// `trust.get_performance_score.v1` (Part3 §G6.5), `trust.get_verified_tier.v1` (Part1 §G4.8). Board
// ruling 2026-07-03 (`ESC-7G-SCORE-DISPLAY` / `ESC-7B-TRUSTSCORE`) permits the Trust Score's numeric
// value on any public-facing surface. Performance's public read NEVER exposes a numeric score (band/
// level + `rated` only) — that is a frozen contract restriction (Doc-4G Part3 §G6.5), not a
// presentation choice, and is unaffected by the ruling.
import type { TrustTier } from "@/frontend/embedded/trust-badge";
import type { FinancialTier } from "../company";

/** `trust_scores`/`performance_scores` lifecycle flag (Doc-2 §3.6) — freeze suspends publication only. */
export type FreezeState = "none" | "frozen";

/** `trust.get_trust_score.v1` (public, no slug) — score now permitted per the Board ruling. */
export interface TrustScoreView {
  score?: number;
  /** Reuses the frozen kit's own band vocabulary (`embedded/trust-badge.tsx`) — no new band set coined. */
  band?: TrustTier;
  trust_score_updated_at?: string;
  freeze_state?: FreezeState;
}

/** `trust.get_performance_score.v1` — public BADGE only; `score` is never exposed on this read (Doc-4G
 *  Part3 §G6.5: "the numeric `score` is NOT exposed publicly"). `level`'s exact values are formula-
 *  derived and not enumerated in the frozen corpus — treated as an opaque display string, never coined. */
export interface PerformanceScoreView {
  level?: string;
  /** false = sub-threshold → "Not Rated" (never fabricated as 0). */
  rated?: boolean;
  performance_score_updated_at?: string;
  freeze_state?: FreezeState;
}

/** `verified_financial_tiers.status` (Doc-4G Part1 H.10) — fixed frozen enum, never extended. */
export type VerifiedTierStatus = "pending_verification" | "verified" | "suspended" | "expired";

/** `trust.get_verified_tier.v1` — Trust-verified Financial Tier (A–E), distinct from the vendor's own
 *  DECLARED tier (Company Profile, M2-owned, editable). This one is Trust-owned, read-only. */
export interface VerifiedTierView {
  tier?: FinancialTier;
  status?: VerifiedTierStatus;
  verified_at?: string;
  next_review_at?: string;
}
