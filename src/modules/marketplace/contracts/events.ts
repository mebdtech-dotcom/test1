// Public event contracts for module "marketplace" (cross-module surface). NAME CONSTANTS ONLY —
// every name binds BY POINTER to the authoritative Doc-2 §8 event catalog (the M2 rows); nothing is
// coined here (Doc-4A §16.4: a Doc-5/implementation layer never invents an event). Emission is via
// the M0 transactional outbox (`core.write_outbox_event.v1`, Doc-4B §B10) inside the emitting
// command's OWN transaction (§16.2 write-plus-emit atomicity); delivery is the M0 dispatcher → Inngest.
//
// W3-MKT-3 scope: the vendor-profile aggregate emitter names. Payloads are THIN (§16.5 — IDs +
// minimal metadata, no blobs, no protected facts §16.3/§7.5); the payload SHAPES are realized at the
// emitting command (the single legal emitter per §16.6), not typed on this surface.

/**
 * Doc-2 §8 M2 event names (verbatim catalog rows — `marketplace | vendor_profiles |
 * VendorClaimed, VendorSuspended`; `marketplace | declared_financial_tiers | VendorTierChanged
 * [tier_type='declared']`; `marketplace | vendor_ownership_history | VendorOwnershipTransferred`).
 * W3-MKT-3 emits `VendorClaimed` (direct registration enters `claimed` — Doc-2 §5.3; Doc-4D §D4
 * `create_vendor_profile` Events row). The remaining names are declared for the follow-on WPs that
 * realize their emitting commands (W3-MKT-4/5) — declared here so no later slice hardcodes a literal.
 */
export const MarketplaceEventName = {
  /** Doc-2 §8 `VendorClaimed` — emitted by `create_vendor_profile` (direct registration → `claimed`) and, once DD-7 resolves, `claim_vendor_profile` (`invited → claimed`). */
  VENDOR_CLAIMED: "VendorClaimed",
  /** Doc-2 §8 `VendorSuspended` — emitted by `set_vendor_profile_status` (W3-MKT-5). */
  VENDOR_SUSPENDED: "VendorSuspended",
  /** Doc-2 §8 `VendorTierChanged` (payload `tier_type='declared'`) — emitted by `set_declared_financial_tier` (W3-MKT-4). The `verified` leg is Trust-emitted (M5) and only CONSUMED by M2. */
  VENDOR_TIER_CHANGED: "VendorTierChanged",
  /** Doc-2 §8 `VendorOwnershipTransferred` — emitted by `transfer_vendor_ownership` (W3-MKT-5). */
  VENDOR_OWNERSHIP_TRANSFERRED: "VendorOwnershipTransferred",
} as const;

export type MarketplaceEventNameToken =
  (typeof MarketplaceEventName)[keyof typeof MarketplaceEventName];

/** Event schema version for the W3 M2 emitters (Doc-4B §B10 `event_version` — integer ≥ 1). */
export const MARKETPLACE_EVENT_VERSION = 1;
