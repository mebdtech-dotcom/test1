// M5 domain — the BC-TRUST-5 Admin Rating INTERIM binding constants: the contract→DB column mapping, the
// interim error-code register ([ESC-TRUST-CODE]), the dedup/list page-size window ([ESC-TRUST-POLICY]), and
// the Doc-2 §7 staff AUTHZ slug pointers (the DEFERRED comp-edge). Single source for every layer (service ·
// repository · the DEFERRED comp-edge); pure (no DB).
//
// SEPARATE AGGREGATE (Doc-4G §H.9a — "Reviews and Admin Ratings are SEPARATE authorities … never merged"):
// this file is INDEPENDENT of `public-review.constants` — the two staff slug pointers below are RE-DECLARED
// here (not imported) so the Admin Rating aggregate carries its own binding surface.
//
// ── Column-name mapping (the crux — document prominently) ────────────────────────────────────────────────
// The §G8.4 §2 REQUEST names `rating_value` / `rating_note` map to the FROZEN Doc-6G §3.5.1 DB columns
// `score` / `comment` (which realize Doc-2 §10.6). The service DTO stays contract-faithful (`ratingValue` /
// `ratingNote`, camelCase — Doc-5A Option B); the repository writes the DB columns `score` / `comment`. NO
// value transformation — a straight rename. `score` is `numeric` with NO range CHECK (the 1–5 CHECK is
// `public_reviews`, a DIFFERENT table — do NOT apply it here); the service validates only "finite number".
//
// ── [ESC-TRUST-POLICY] — the admin-rating dedup / list window ────────────────────────────────────────────
// Doc-4G §G8.4 §10 / §H.8: the dedup window is a runtime tunable ABSENT from Doc-3 §12.2 → carried under
// `[ESC-TRUST-POLICY]` (reference the platform default by name; no key invented; no `core.config_value_query.v1`
// wired). The list page-size (Doc-6G §6 — "page-size via trust.* POLICY") is likewise not a wired Doc-3 §12.2
// key here → an interim documented default (NOT coined-as-frozen; the WP5a precedent).
//
// ── [ESC-TRUST-CODE] — the interim error-code register ──────────────────────────────────────────────────
// Doc-4G §G8.4/§G8.5 error CLASSES are frozen (VALIDATION/NOT_FOUND/CONFLICT/REFERENCE/DEPENDENCY per Doc-4A
// §12 / Doc-5A §6.2) but the `error_code` STRINGS are ABSENT from the frozen corpus — only the `trust_`
// namespace is fixed (Doc-4A Appendix B.2). Realized as NAMED CONSTANTS, carried `[ESC-TRUST-CODE]`.
//
// ── AUTHZ slugs (Doc-2 §7 — bound BY POINTER; the DEFERRED comp-edge) ────────────────────────────────────
// `staff_can_verify` / `staff_super_admin` (both confirmed Doc-2 §7 platform-staff entries — Doc-4G §H.3 /
// patch F4G-PB5-MA1·d "current authority TODAY") gate `set_admin_rating` + `list_admin_ratings`. The authz
// itself is DEFERRED to the comp-edge (`src/server`, the WP2 precedent), which also collapses a non-staff
// caller to NOT_FOUND (F4G-PB5-M3 non-disclosure). [ESC-TRUST-SLUG] — a future DEDICATED admin-rating slug (if
// ever required) is governed EXCLUSIVELY by the additive channel (Doc-2 §7 additive; patch F4G-PB5-MA1
// "future additive authority"); none is needed today.

// ── [ESC-TRUST-CODE] error codes (classes per Doc-4G §G8.4/§G8.5 · Doc-4A §12 / Doc-5A §6.2) ──────────────

/** VALIDATION (400) — SYNTAX/SHAPE failure (missing/typed field; non-uuid id; non-finite rating_value; bad
 *  revision token; malformed cursor). */
export const ADMIN_RATING_INVALID_INPUT_CODE = "trust_admin_rating_invalid_input";

/** NOT_FOUND (404) — no live rating on an update; also the non-staff protected-fact collapse (F4G-PB5-M3 /
 *  §H.9f — enforced at the DEFERRED comp-edge / RLS). */
export const ADMIN_RATING_NOT_FOUND_CODE = "trust_admin_rating_not_found";

/** CONFLICT (409, retryable) — a stale `expected_revision` on update, OR a create over an existing live
 *  rating (the app-enforced per-vendor singleton; §G8.4 gives no explicit class — the documented OBS). */
export const ADMIN_RATING_CONFLICT_CODE = "trust_admin_rating_conflict";

// ── [ESC-TRUST-POLICY] — list page-size window (no wired Doc-3 §12.2 key; interim default) ───────────────

/** Default page size for the staff admin-rating list ([ESC-TRUST-POLICY] interim — not a wired key). */
export const ADMIN_RATING_LIST_DEFAULT_LIMIT = 20;

/** Maximum page size for the staff admin-rating list ([ESC-TRUST-POLICY] interim — not a wired key). */
export const ADMIN_RATING_LIST_MAX_LIMIT = 100;

// ── AUTHZ slugs (Doc-2 §7 — bound by pointer; the DEFERRED comp-edge references ONE source) ──────────────

/** Doc-2 §7 platform-staff slug (confirmed; Doc-4G §H.3 patch F4G-PB5-MA1·d) for set/list admin rating. */
export const STAFF_CAN_VERIFY_SLUG = "staff_can_verify" as const;

/** Doc-2 §7 platform-staff slug (confirmed; Doc-4G §H.3 patch F4G-PB5-MA1·d) for set/list admin rating. */
export const STAFF_SUPER_ADMIN_SLUG = "staff_super_admin" as const;
