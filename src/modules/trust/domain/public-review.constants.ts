// M5 domain — the BC-TRUST-5 Public Review INTERIM binding constants: the frozen enum value sets (SYNTAX
// oracle), the Path-B feedback binding (bound BY POINTER to the BC-TRUST-3 performance-input sets), the
// interim error-code register ([ESC-TRUST-CODE]), the list page-size window ([ESC-TRUST-POLICY]), and the
// Doc-2 §7 AUTHZ slug pointers (the DEFERRED composition edge). Single source for every layer (service ·
// command · repository · the DEFERRED comp-edge); pure (no DB).
//
// ── Frozen enum value sets (Doc-2 §10.6 / Doc-6G §3.5.2 — do not extend) ─────────────────────────────────
// `public_review_status` is FIXED by the frozen corpus; this set mirrors the migration ENUM labels VERBATIM
// (SYNTAX/SHAPE oracle). `decision` (approve|reject) is the §G8.2 moderation-outcome oracle.
//
// ── Path-B feedback binding (F4G-M2/M3 — Doc-4G §G8.3 §8, patch F4G-PB5-MA2) ─────────────────────────────
// A PUBLISHED review's Buyer-Feedback contribution is a `performance_inputs` row appended VIA the BC-TRUST-3
// ingestion service (never a direct write — F4G-M2 single-writer, §H.9c). The input is `input_type='feedback'`
// anchored on the engagement as `source_type='engagement'`, `source_entity_id = engagement_id`. Both constants
// are TYPED as the frozen BC-TRUST-3 value types — a COMPILE-TIME pointer binding: if 'feedback'/'engagement'
// were not members of the frozen Doc-2 §10.6 sets this file would not compile. `isInputSourceConsistent
// ('feedback','engagement')` returns true (the permissive leg — the invitation-response rule does not apply).
// The dedup key `(source_type, source_entity_id, input_type) = ('engagement', engagement_id, 'feedback')` is
// STABLE (occurred_at = the review's created_at) → a republish naturally dedups at BC-TRUST-3 (no duplicate row).
//
// ── [ESC-TRUST-POLICY] — the review dedup/list window ────────────────────────────────────────────────────
// Doc-4G §H.8 / §G8.1 §10: the review dedup window is a runtime tunable ABSENT from Doc-3 §12.2 → carried
// under `[ESC-TRUST-POLICY]` (reference the platform default by name; no key invented; no
// `core.config_value_query.v1` wired). The list page-size (Doc-6G §6 — "page-size via trust.* POLICY") is
// likewise not a wired Doc-3 §12.2 key here → an interim documented default (NOT coined-as-frozen).
//
// ── [ESC-TRUST-CODE] — the interim error-code register ──────────────────────────────────────────────────
// Doc-4G §G8.1/§G8.2/§G8.3/§G8.5 error CLASSES are frozen (VALIDATION/NOT_FOUND/STATE/CONFLICT/BUSINESS/
// DEPENDENCY per Doc-4A §12 / Doc-5A §6.2) but the `error_code` STRINGS are ABSENT from the frozen corpus —
// only the `trust_` namespace is fixed (Doc-4A Appendix B.2). Realized as NAMED CONSTANTS in the `trust_`
// namespace, carried `[ESC-TRUST-CODE]` (the verified-tier / performance / fraud precedent).
//
// ── AUTHZ slugs (Doc-2 §7 — bound BY POINTER, not coined; the DEFERRED composition edge) ─────────────────
// `can_submit_review` (buyer O,D,M; engagement required — Doc-2 §7) gates submission; `staff_can_verify` /
// `staff_super_admin` (both confirmed Doc-2 §7 platform-staff entries — Doc-4G §H.3 / patch F4G-PB5-MA1
// "current authority TODAY") gate moderate/publish/remove. The authz itself is DEFERRED to the composition
// edge (`src/server`, the WP2 precedent) — never enforced inside the trust module. [ESC-TRUST-SLUG] — a
// future DEDICATED review-moderation slug (if ever required) is governed EXCLUSIVELY by the additive channel
// (Doc-2 §7 additive; patch F4G-PB5-MA1 "future additive authority"); none is needed today.

import type {
  PerformanceInputTypeValue,
  PerformanceSourceTypeValue,
  PublicReviewStatusValue,
  ReviewModerationDecisionValue,
} from "../contracts/types";

/** The frozen `trust.public_review_status` set (Doc-2 §10.6 / Doc-6G §3.5.2; SYNTAX oracle). */
export const PUBLIC_REVIEW_STATUSES: ReadonlySet<PublicReviewStatusValue> = new Set([
  "submitted",
  "approved",
  "published",
  "rejected",
  "removed",
]);

/** The frozen `decision` set for `moderate_review` (Doc-4G §G8.2; SYNTAX oracle). */
export const REVIEW_MODERATION_DECISIONS: ReadonlySet<ReviewModerationDecisionValue> = new Set([
  "approve",
  "reject",
]);

/** Path-B — the published-review Buyer-Feedback `performance_inputs` `input_type` (F4G-M3). Typed as the
 *  frozen BC-TRUST-3 value type → a compile-time pointer binding to the Doc-2 §10.6 set. */
export const REVIEW_FEEDBACK_INPUT_TYPE: PerformanceInputTypeValue = "feedback";

/** Path-B — the published-review Buyer-Feedback `performance_inputs` `source_type` (F4G-M3; anchored on the
 *  engagement). Typed as the frozen BC-TRUST-3 value type → a compile-time pointer binding to Doc-2 §10.6. */
export const REVIEW_FEEDBACK_SOURCE_TYPE: PerformanceSourceTypeValue = "engagement";

// ── [ESC-TRUST-POLICY] — list page-size window (no wired Doc-3 §12.2 key; interim default) ───────────────

/** Default page size for the public review list (Doc-4A §9.6; [ESC-TRUST-POLICY] interim — not a wired key). */
export const REVIEW_LIST_DEFAULT_LIMIT = 20;

/** Maximum page size for the public review list ([ESC-TRUST-POLICY] interim — not a wired key). */
export const REVIEW_LIST_MAX_LIMIT = 100;

// ── [ESC-TRUST-CODE] error codes (classes per Doc-4G §G8 · Doc-4A §12 / Doc-5A §6.2) ─────────────────────

/** VALIDATION (400) — SYNTAX/SHAPE failure (missing/typed field; non-uuid id; bad decision; bad revision token). */
export const REVIEW_INVALID_INPUT_CODE = "trust_review_invalid_input";

/** NOT_FOUND (404) — no review row for the id (moderate/publish/remove target absent; or the public read
 *  miss / non-published-on-public-projection collapse — Doc-4G §G8.5 §9). */
export const REVIEW_NOT_FOUND_CODE = "trust_review_not_found";

/** STATE (409) — wrong / terminal source state for the transition (Doc-4G §G8.2/§G8.3 State Machine). */
export const REVIEW_ILLEGAL_STATE_CODE = "trust_review_state";

/** CONFLICT (409, retryable) — stale optimistic token (`expected_revision`/`updated_at` mismatch) or a
 *  concurrent state change (Doc-4G §G8.2/§G8.3 — STATE≠CONFLICT). */
export const REVIEW_REVISION_CONFLICT_CODE = "trust_review_conflict";

/** BUSINESS (422) — a second review for the same (engagement, author) — one review per engagement per author
 *  (Doc-4G §G8.1 §8; DB `UNIQUE(engagement_id, author_organization_id)`). */
export const REVIEW_DUPLICATE_CODE = "trust_review_duplicate";

/** BUSINESS (422) — `moderation_note` missing on a reject decision (Doc-4G §G8.2 §8). */
export const REVIEW_NOTE_REQUIRED_CODE = "trust_review_note_required";

/** BUSINESS (422) — `rating` outside the 1–5 domain (Doc-4G §G8.1 §4 SEMANTIC → BUSINESS class). */
export const REVIEW_RATING_RANGE_CODE = "trust_review_rating_range";

/** DEPENDENCY (503, retryable) — publish Step-1 audit (Doc-4B) transiently unavailable; the whole Step-1 tx
 *  rolled back cleanly (review NOT published — patch F4G-PB5-MA2). */
export const REVIEW_DEPENDENCY_CODE = "trust_review_dependency";

// ── AUTHZ slugs (Doc-2 §7 — bound by pointer; the DEFERRED composition edge references ONE source) ───────

/** Doc-2 §7 buyer slug (O,D,M; engagement required) the DEFERRED comp-edge enforces for `submit_review`. */
export const CAN_SUBMIT_REVIEW_SLUG = "can_submit_review" as const;

/** Doc-2 §7 platform-staff slug (confirmed; Doc-4G §H.3 patch F4G-PB5-MA1) for moderate/publish/remove. */
export const STAFF_CAN_VERIFY_SLUG = "staff_can_verify" as const;

/** Doc-2 §7 platform-staff slug (confirmed; Doc-4G §H.3 patch F4G-PB5-MA1) for moderate/publish/remove. */
export const STAFF_SUPER_ADMIN_SLUG = "staff_super_admin" as const;
