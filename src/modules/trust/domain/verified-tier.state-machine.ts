// M5 domain (PRIVATE) — the `verified_tier_status` transition matrix for the Verified Financial Tier
// aggregate. SINGLE authority for which verified-tier lifecycle edges are legal; the write-service
// (`application/services/verified-tier.service.ts`) MUST consult this and NEVER hand-roll a transition.
// Pure functions (no DB) — reused by the service; no state is owned here.
//
// The legal edges are transcribed from the frozen Doc-4G §G4.6/§G4.7 (bound by pointer; Doc-2 §3.6/§10.6):
//   set:       absence-of-row ─────────────▶ verified        (§G4.6 — via pending_verification → verified)
//   confirm:   verified ────────────────────▶ verified        (§G4.6 — renew next_review_at; tier unchanged)
//   downgrade: verified ────────────────────▶ verified        (§G4.6 — a STRICTLY lower tier band only)
//   suspend:   verified ────────────────────▶ suspended        (§G4.7 — reason required)
//   expire:    verified ────────────────────▶ expired          (§G4.7 — System; on 24-month review lapse)
//
// Forbidden (Doc-4G §G4.6/§G4.7 State Machine Enforcement): operating on a `suspended`/`expired` (or
// `pending_verification`) SOURCE = illegal → STATE — EXCEPT `expire` on a non-`verified` source, which is a
// NO-OP SKIP (idempotent; "re-run on expired = no-op"), never a STATE error. `Declared`-only = the ABSENCE
// of a row (there is NO `declared` status value).
//
// TIER-BAND ORDERING (realization): Financial Tier A–E, `A` strongest … `E` weakest (the standard
// credit/financial-tier convention; the frozen corpus fixes the A–E set, not a numeric order). "downgrade:
// lower tier only" (§G4.6) therefore means a STRICTLY weaker band (a later letter). Documented as a
// realization choice; it is NOT a coined frozen value.

/** The `trust.financial_tier` value set (Doc-2 §10.6 / Doc-6G §3.1.3; fixed A–E — do not extend). */
export type FinancialTier = "A" | "B" | "C" | "D" | "E";

/** The `trust.verified_tier_status` value set (Doc-2 §10.6 / Doc-6G §3.1.3). */
export type VerifiedTierStatus = "pending_verification" | "verified" | "suspended" | "expired";

/** The five verified-tier operations (Doc-4G §G4.6/§G4.7). `set` establishes from absence-of-row. */
export type VerifiedTierOperation = "set" | "confirm" | "downgrade" | "suspend" | "expire";

/** Band ordering — `A` strongest (rank 1) … `E` weakest (rank 5). A realization convention (see header). */
const TIER_RANK: Readonly<Record<FinancialTier, number>> = { A: 1, B: 2, C: 3, D: 4, E: 5 };

/** The target status each operation drives to (Doc-4G §G4.6/§G4.7). */
export function verifiedTierTargetStatus(operation: VerifiedTierOperation): VerifiedTierStatus {
  switch (operation) {
    case "set":
    case "confirm":
    case "downgrade":
      return "verified";
    case "suspend":
      return "suspended";
    case "expire":
      return "expired";
  }
}

/**
 * Is `newTier` a STRICTLY lower (weaker) band than `currentTier`? (§G4.6 downgrade guard — a downgrade may
 * only lower the tier; equal or higher is rejected as a BUSINESS invalid-downgrade.)
 */
export function isStrictDowngrade(currentTier: FinancialTier, newTier: FinancialTier): boolean {
  return TIER_RANK[newTier] > TIER_RANK[currentTier];
}

/**
 * Is an `expire` on `currentStatus` a NO-OP SKIP? True iff the source is not `verified` (§G4.7 — "expire on
 * non-verified = no-op skip"; idempotent re-run). For every OTHER operation, a non-`verified` source is
 * illegal (STATE) — see `isVerifiedTierSourceLegal`.
 */
export function isExpireNoop(currentStatus: VerifiedTierStatus): boolean {
  return currentStatus !== "verified";
}

/**
 * Is `operation` legal from `currentStatus`? For the transition operations (confirm/downgrade/suspend/
 * expire) the only legal source is `verified` (Doc-4G §G4.6/§G4.7). `set` is NOT covered here — it
 * establishes from absence-of-row and is guarded by the UNIQUE(vendor_profile_id) constraint in the
 * `establish_verified_tier` SD function, not by a read-then-check source status.
 *
 * NOTE: `expire` on a non-`verified` source is handled as a no-op skip by the caller (`isExpireNoop`) BEFORE
 * this legality check — so this returns `false` for that case (the caller must short-circuit the no-op first).
 */
export function isVerifiedTierSourceLegal(
  operation: Exclude<VerifiedTierOperation, "set">,
  currentStatus: VerifiedTierStatus,
): boolean {
  return currentStatus === "verified";
}

/** Thrown when the write-service attempts an edge the machine forbids — mapped to the `STATE` error class
 *  (Doc-4G §G4.6/§G4.7). Carries the rejected operation + source for diagnostics. */
export class IllegalVerifiedTierTransitionError extends Error {
  readonly operation: VerifiedTierOperation;
  readonly from: VerifiedTierStatus;

  constructor(operation: VerifiedTierOperation, from: VerifiedTierStatus) {
    super(`Illegal verified-tier transition: ${operation} from ${from} (Doc-4G §G4.6/§G4.7).`);
    this.name = "IllegalVerifiedTierTransitionError";
    this.operation = operation;
    this.from = from;
  }
}

/**
 * Assert `operation` is legal from `currentStatus` (fail-closed defense-in-depth); throw
 * `IllegalVerifiedTierTransitionError` otherwise. The write-service calls this BEFORE the SD-function write —
 * an illegal edge never reaches the DB. (`expire` no-op is short-circuited by the caller via `isExpireNoop`.)
 */
export function assertVerifiedTierTransition(
  operation: Exclude<VerifiedTierOperation, "set">,
  currentStatus: VerifiedTierStatus,
): void {
  if (!isVerifiedTierSourceLegal(operation, currentStatus)) {
    throw new IllegalVerifiedTierTransitionError(operation, currentStatus);
  }
}
