// Event names + versioned payload types emitted by module "trust" (Doc-2 §8 / Doc-4J catalog).
//
// W3-TRUST-3 realizes the FIRST §8 emitter for M5: `VendorTierChanged` (Doc-2 §8 — the
// `trust.verified_financial_tiers` status/tier-change event; Doc-4G §G4.6/§G4.7 §8). The event NAME is
// bound BY POINTER to the Doc-2 §8 catalog (`VendorTierChanged`); it is NEVER coined here. The payload is
// THIN (Doc-4A §16.5 — IDs + minimal metadata). The verified-tier write-service emits this via the M0
// `core.write_outbox_event.v1` primitive (Doc-4B §B10) IN THE SAME transaction as the tier write.
//
// CONSUMER note (deferred): Marketplace consumes `VendorTierChanged[verified]` and writes
// `marketplace.financial_tier_history` + its read-model band — Trust NEVER writes that table (Doc-4G
// §G4.6/§G4.7 §8). No consumer is built in this WP.
//
// WIRE CASING (Doc-5A_Patch v1.0.1 §3): the camelCase realization is scoped to API `result` payloads ONLY.
// An event payload is cross-module integration data persisted VERBATIM into `core.outbox_events.payload_jsonb`
// (the M0 writer applies no transform) — it is NOT an API `result`, so its property names stay snake_case per
// the Doc-2 §8 / Doc-4A §3.2·§16.5 abstract field-name grammar (matching the billing §8 emitter). A deferred
// M2 consumer reads `payload_jsonb->>'tier_type'`/`old_tier`/`new_tier`. Enum VALUES are the frozen sets.

import type { FinancialTier } from "./types";

/**
 * `VendorTierChanged` — the Doc-2 §8 event name (bound by pointer; the `trust.verified_financial_tiers`
 * status/tier-change event). Emitted on set / confirm / downgrade / suspend / expire. Never coined here.
 */
export const VENDOR_TIER_CHANGED_EVENT = "VendorTierChanged" as const;

/**
 * The emitted `event_version` for `VendorTierChanged`. The corpus mandates `event_version ≥ 1` (Doc-4A
 * §16.4) but pins NO value — `1` is the first-version REALIZATION DEFAULT (documented; NOT a coined frozen
 * value). A payload-shape change would bump this via an additive Doc-2/Doc-4G patch.
 */
export const VENDOR_TIER_CHANGED_EVENT_VERSION = 1 as const;

/**
 * The THIN payload of `VendorTierChanged` (Doc-4G §G4.6/§G4.7 §8: `tier_type='verified'` + old/new tier).
 * `aggregate_id` on the outbox row is the `vendor_profile_id` (the aggregate the event concerns). Property
 * NAMES are snake_case (event payload — see the WIRE CASING note above); enum VALUES are the frozen sets.
 */
export interface VendorTierChangedPayload {
  /** The tier dimension this event concerns — always `verified` here (M5 owns the verified tier). */
  tier_type: "verified";
  /** The vendor profile the verified tier belongs to (bare UUID → M2). = the outbox `aggregate_id`. */
  vendor_profile_id: string;
  /** The tier BEFORE the change — `null` only on `set` (absence-of-row → verified). */
  old_tier: FinancialTier | null;
  /** The tier AFTER the change (A–E). Unchanged on confirm/suspend/expire (status-only change). */
  new_tier: FinancialTier;
}

// ── W3-TRUST-4a — BC-TRUST-3 Performance Scoring events (Doc-2 §8; Doc-4G §G6.2/§G6.4 §8) ───────────────
// The Performance Score aggregate owns `PerformanceScoreUpdated` (publisher of record =
// `compute_performance_score.v1`, publish-on-change, SUPPRESSED while frozen) + `PerformanceReviewTriggered`
// (publisher of record = `trigger_performance_review.v1`). Both event NAMES are bound BY POINTER to the Doc-2
// §8 catalog — NEVER coined here. Payloads are THIN (Doc-4A §16.5 — IDs + minimal metadata; NO numeric score:
// the score is staff-only, never public/in-event — Doc-4G §G6.5 / §16.3). Emitted via M0
// `core.write_outbox_event.v1` IN THE SAME transaction as the score/audit writes. `PerformanceFrozen`
// (§G6.3) is DEFERRED with freeze/reactivate. Consumers (M2 badge / M3 matching / M6 fan-out) are OTHER
// modules — NOT built here.

/** `PerformanceScoreUpdated` — Doc-2 §8 event name (bound by pointer). Emitted publish-on-change by compute. */
export const PERFORMANCE_SCORE_UPDATED_EVENT = "PerformanceScoreUpdated" as const;

/** `PerformanceReviewTriggered` — Doc-2 §8 event name (bound by pointer). Emitted by trigger_performance_review. */
export const PERFORMANCE_REVIEW_TRIGGERED_EVENT = "PerformanceReviewTriggered" as const;

/**
 * The emitted `event_version` for both Performance-Score events. The corpus mandates `event_version ≥ 1`
 * (Doc-4A §16.4) but pins NO value — `1` is the first-version REALIZATION DEFAULT (the `VendorTierChanged`
 * precedent; documented, NOT a coined frozen value). A payload-shape change bumps this via an additive patch.
 */
export const PERFORMANCE_EVENT_VERSION = 1 as const;

/**
 * THIN payload of `PerformanceScoreUpdated` (Doc-4G §G6.2 §8). `aggregate_id` = `vendor_profile_id`. Carries
 * NO numeric score (staff-only; never public — Doc-4G §G6.5 / §16.3): only `rated` (false = Not Rated). Property
 * NAMES are snake_case (event payload — see the WIRE CASING note above); the numeric score never leaves the module.
 */
export interface PerformanceScoreUpdatedPayload {
  /** The vendor profile the score concerns (bare UUID → M2). = the outbox `aggregate_id`. */
  vendor_profile_id: string;
  /** `false` = Not Rated (below the min-threshold gate); the badge surfaces Not Rated, never 0. */
  rated: boolean;
}

/**
 * THIN payload of `PerformanceReviewTriggered` (Doc-4G §G6.4 §8). `aggregate_id` = `vendor_profile_id`. Carries
 * the trigger reason for staff attention; NO score value. Property NAMES snake_case (event payload — WIRE CASING above).
 */
export interface PerformanceReviewTriggeredPayload {
  /** The vendor profile the review concerns (bare UUID → M2). = the outbox `aggregate_id`. */
  vendor_profile_id: string;
  /** The frozen review-trigger reason (Doc-4G §G6.4). */
  trigger_reason: "threshold_crossing" | "periodic_cadence" | "dispute_pattern";
}

// ── W3-TRUST-4b — BC-TRUST-2 Trust Scoring event (Doc-2 §8; Doc-4G §G5.1 §8) ────────────────────────────
// The Trust Score aggregate OWNS `TrustScoreUpdated` (publisher of record = `compute_trust_score.v1`,
// publish-on-change, SUPPRESSED while frozen — Doc-4G §H.7). The event NAME is bound BY POINTER to the Doc-2
// §8 catalog (line 668: `trust | trust_scores | TrustScoreUpdated`) — NEVER coined here. The payload is THIN
// (Doc-4A §16.5 — IDs + minimal metadata) and carries the PUBLIC `band` (Doc-2 §3.6 / line 344 "band published
// unless frozen") so M2's directory read-model can rebuild — but NO numeric score (staff-only; never public/
// in-event — Doc-4G §G5.3 / §16.3). Emitted via M0 `core.write_outbox_event.v1` IN THE SAME transaction as the
// score/audit writes. `freeze_trust_score`/`reactivate_trust_score` (§G5.2) are DEFERRED with the freeze
// lifecycle. Consumers (M2 directory band / M3 matching refresh) are OTHER modules — NOT built here.

/** `TrustScoreUpdated` — Doc-2 §8 event name (bound by pointer; line 668). Emitted publish-on-change by compute. */
export const TRUST_SCORE_UPDATED_EVENT = "TrustScoreUpdated" as const;

/**
 * The emitted `event_version` for `TrustScoreUpdated`. The corpus mandates `event_version ≥ 1` (Doc-4A §16.4)
 * but pins NO value — `1` is the first-version REALIZATION DEFAULT (the `VendorTierChanged` / `PerformanceScore
 * Updated` precedent; documented, NOT a coined frozen value). A payload-shape change bumps this via a patch.
 */
export const TRUST_EVENT_VERSION = 1 as const;

/**
 * THIN payload of `TrustScoreUpdated` (Doc-4G §G5.1 §8). `aggregate_id` = `vendor_profile_id`. Carries the PUBLIC
 * `band` (Doc-2 §3.6 "band published unless frozen") — safe metadata for M2's read-model rebuild — and carries
 * NO numeric score (staff-only; never public — Doc-4G §G5.3 / §16.3). Property NAMES are snake_case (event
 * payload — see the WIRE CASING note above); the numeric score never leaves the module in an event.
 */
export interface TrustScoreUpdatedPayload {
  /** The vendor profile the score concerns (bare UUID → M2). = the outbox `aggregate_id`. */
  vendor_profile_id: string;
  /** The PUBLIC trust band (Doc-2 §3.6). Text (Doc-6G §3.2.1 declares no band enum). NO numeric score is carried. */
  band: string;
}
