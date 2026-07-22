// M5 domain — the `trust.request_verification.v1` INTERIM binding constants (error-code register +
// the AUTHZ slug). Single source for every layer (command · api mapper); the composition edge reaches
// them only through re-exports on `contracts/` (never a cross-module domain import).
//
// ── [ESC-TRUST-CODE] — interim error-code register ─────────────────────────────────────────────────
// Doc-4G §G4.1's error CLASSES are frozen (VALIDATION/AUTHORIZATION/NOT_FOUND/REFERENCE/BUSINESS/
// DEPENDENCY per Doc-5A §6.2) but the `error_code` STRINGS are ABSENT from the frozen corpus — only the
// `trust_` namespace is fixed (Doc-4A Appendix B.2). So these are realized as NAMED CONSTANTS in the
// `trust_` namespace, carried `[ESC-TRUST-CODE]` pending a Doc-5G development-doc code assignment — the
// exact `identity_buyer_profile_*` interim precedent (D7). Never a hardcoded literal; never a coined
// frozen code.
//
// ── AUTHZ slug (Doc-2 §7 — bound by pointer, not coined) ───────────────────────────────────────────
// `can_submit_verification` is the ENUMERATED Doc-2 §7 permission-catalog slug for "verification
// submission" (Owner-only; Doc-2 §7 line 635). Bound as a named constant so the composition edge
// (`src/server/trust`) references ONE source via `contracts/` — never a re-declared literal.

/** VALIDATION (400) — SYNTAX / mandatory-Idempotency-Key failure. */
export const VERIFICATION_INVALID_INPUT_CODE = "trust_verification_invalid_input";

/** AUTHORIZATION (403) — the `can_submit_verification` authz denial. */
export const VERIFICATION_FORBIDDEN_CODE = "trust_verification_forbidden";

/** NOT_FOUND (404) — SCOPE collapse (submitting org does not own the subject) / no active-org
 *  context. The §7.5 non-disclosure collapse (Doc-4G §G4.1 §12: cross-org subject → NOT_FOUND). */
export const VERIFICATION_NOT_FOUND_CODE = "trust_verification_not_found";

/** VALIDATION (400) — a WP-scope-deferred subject_type (vendor_profile|capacity|declared_tier);
 *  this WP realizes `organization` only (the others need M2/M1 ownership resolution). */
export const VERIFICATION_UNSUPPORTED_SUBJECT_CODE = "trust_verification_unsupported_subject";

/** BUSINESS (422) — an OPEN case (requested|in_review) already exists for (subject_id, subject_type)
 *  (Doc-4G §G4.1 stage-8 BUSINESS). */
export const VERIFICATION_OPEN_CASE_EXISTS_CODE = "trust_verification_open_case_exists";

/** Doc-2 §7 permission slug for verification submission (Owner-only; bound by pointer, never coined). */
export const CAN_SUBMIT_VERIFICATION_SLUG = "can_submit_verification" as const;
