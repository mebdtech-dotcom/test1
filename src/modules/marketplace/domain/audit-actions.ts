// M2 domain — canonical audit-action constants for the vendor-profile write commands (the realized
// serialization tokens). Imported as NAMED CONSTANTS — never hardcoded string literals (Board ruling
// 2026-06-30; the M1 `BuyerProfileAuditAction` / M0 `OutboxAuditAction` precedent; D7 rule 6).
//
// FROZEN GROUNDING: Doc-2 §9 (Audit Mapping, "Vendor profile" family) SEPARATELY ENUMERATES the
// business actions these tokens realize — "create, seed, claim, verify, suspend, ban/lift, tier change
// (declared + verified), category change, capability/override change, ownership transfer (full
// workflow), slug migration (admin-mediated), delegation grant issue/suspend/revoke". Each token below
// binds BY POINTER to one ENUMERATED §9 action (Doc-4D PassB §D4 Audit rows name the same actions:
// create → Vendor-profile "create"; update → Vendor-profile "capability/override change"). The token
// STRING itself is the realization-layer serialization — no M2 serialization-token patch exists yet
// (`[ESC-MKT-AUDIT]`, Doc-5D §4.5 — disclosed in `docs/backend/wp/W3-MKT-GAP-ANALYSIS.md` §5); a
// future token rename touches a Doc-4D/Doc-6D-class patch + this constant, NEVER Doc-2. This is the
// same bind-by-pointer discipline the M5 `trust` and M7 `billing` Wave-3 modules realized.
//
// The audit is appended to `core.audit_records` via the M0 `core.append_audit_record.v1` facade,
// atomically with the business write (the D7 canonical audited-write pattern —
// `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`).

/**
 * The audit `entity_type` for a `marketplace.vendor_profiles` mutation. Singular per the identity
 * `buyer_profile` precedent — a realization choice, not a frozen constant.
 */
export const VENDOR_PROFILE_ENTITY_TYPE = "vendor_profile" as const;

/**
 * Canonical vendor-profile audit actions — each bound BY POINTER to an ENUMERATED Doc-2 §9
 * Vendor-profile business action (no action invented):
 *   CREATED → §9 "create" (Doc-4D §D4 `create_vendor_profile` Audit row: Vendor-profile "create");
 *             the direct-registration `→ claimed` entry (Doc-2 §5.3; Doc-5D Pass-2 BR-M-02).
 *   UPDATED → §9 "capability/override change" (Doc-4D §D4 `update_vendor_profile` Audit row:
 *             Vendor-profile "capability/override change"); an attribute edit, not a §5.3 transition.
 */
export const VendorProfileAuditAction = {
  /** §9 Vendor-profile "create" (enumerated) — the `create_vendor_profile` leg (User). */
  CREATED: "vendor_profile_created",
  /** §9 Vendor-profile "capability/override change" (enumerated) — the `update_vendor_profile` leg (User). */
  UPDATED: "vendor_profile_updated",
} as const;

export type VendorProfileAuditActionToken =
  (typeof VendorProfileAuditAction)[keyof typeof VendorProfileAuditAction];
