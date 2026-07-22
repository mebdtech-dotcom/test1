// M5 domain — the Fraud-Signal INTERIM binding constants: the dedup-window policy ([ESC-TRUST-POLICY]), the
// error-code register ([ESC-TRUST-CODE]), and the AUTHZ slug (Doc-2 §7 — by pointer). Single source for
// every layer (service · repository · the DEFERRED admin composition edge); the composition edge reaches
// them only through re-exports on `contracts/` (never a cross-module domain import).
//
// ── [ESC-TRUST-POLICY] — the fraud detection/triage dedup window ────────────────────────────────────────
// Doc-4G §H.8 / §G7.1 §10: System-detected create is idempotent on the detection key
// `(subject_id, subject_type, signal_type, detection_window)`; the WINDOW key is ABSENT from Doc-3 §12.2 →
// carried under `[ESC-TRUST-POLICY]` ("reference the platform default by name; no key invented"). There is
// NO registered Doc-3 §12.2 key, so `core.config_value_query.v1` would REFERENCE-fail on it. INTERIM
// realization (documented, NOT coined-as-frozen; the WP2 business-dedup precedent): dedup while a NON-TERMINAL
// (`open`/`reviewed`) signal exists for `(subject_id, subject_type, signal_type)` — an advisory-lock
// check-then-insert; a duplicate indicator returns the existing signal (NO 2nd row / NO 2nd audit); a fresh
// detection AFTER the prior signal is terminal (`actioned`/`dismissed`) MAY open a new signal. There is NO DB
// unique index (the frozen Doc-6G §3.4 DDL has none — the partial `fraud_signals_open_idx` is a work-queue
// index, NOT unique). The non-terminal liveness set lives in `fraud-signal.state.ts`.
//
// ── [ESC-TRUST-CODE] — the interim error-code register ─────────────────────────────────────────────────
// Doc-4G §G7.1/§G7.2 error CLASSES are frozen (VALIDATION/NOT_FOUND/STATE/CONFLICT per Doc-4A §12 / Doc-5A
// §6.2) but the `error_code` STRINGS are ABSENT from the frozen corpus — only the `trust_` namespace is fixed
// (Doc-4A Appendix B.2). Realized as NAMED CONSTANTS in the `trust_` namespace, carried `[ESC-TRUST-CODE]`
// (the exact `request_verification` / verified-tier interim precedent).
//
// ── AUTHZ slug (Doc-2 §7 — bound by pointer, not coined) ───────────────────────────────────────────────
// `staff_can_ban` is the ENUMERATED Doc-2 §7 platform-staff slug the DEFERRED composition edge enforces for
// staff-reported creation + all triage (Doc-4G §H.3 / §G7.1 §5 / §G7.2 §5). System-detected creation carries
// NO slug (System actor; Doc-4A §5.2). Bound as a named constant so the deferred comp-edge references ONE
// source. The `staff_can_ban` authz itself is DEFERRED to the composition edge (`src/server`, the WP2
// precedent) — never enforced inside the trust module.

// ── [ESC-TRUST-CODE] error codes (classes per Doc-4G §G7.1/§G7.2 · Doc-5A §6.2) ────────────────────────

/** VALIDATION (400) — SYNTAX failure (missing/typed field; non-uuid id; empty subject_type/signal_type/severity). */
export const FRAUD_SIGNAL_INVALID_INPUT_CODE = "trust_fraud_signal_invalid_input";

/** NOT_FOUND (404) — no fraud-signal row for the id (a triage target that does not resolve). Also the
 *  non-staff protected-fact collapse target (Doc-4G §H.9f) — enforced at the DEFERRED comp-edge / RLS. */
export const FRAUD_SIGNAL_NOT_FOUND_CODE = "trust_fraud_signal_not_found";

/** STATE (409) — wrong / terminal source state for the triage transition (Doc-4G §G7.2 State Machine). */
export const FRAUD_SIGNAL_ILLEGAL_STATE_CODE = "trust_fraud_signal_illegal_state";

/** CONFLICT (409, retryable) — stale optimistic token (`expected_revision`/`updated_at` mismatch) or a
 *  concurrent state change (Doc-4G §G7.2 — STATE≠CONFLICT). */
export const FRAUD_SIGNAL_REVISION_CONFLICT_CODE = "trust_fraud_signal_revision_conflict";

/** Doc-2 §7 platform-staff slug the DEFERRED composition edge enforces for staff-reported create + all triage
 *  (bound by pointer; never coined). System-detected create carries NO slug (System actor). */
export const STAFF_CAN_BAN_SLUG = "staff_can_ban" as const;
