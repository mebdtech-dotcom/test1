// M6 domain — the canonical `comm_support_ticket_*` error-code register (Doc-4H §H7 `comm_` namespace).
// The code STRINGS are development-document realization (Doc-4A error-code discipline — Pass-B fixes the
// error CLASS + trigger + retryable; the numeric/string code is dev-doc scope). ONE module-owned source,
// imported by the command (relative), the api wire mapper, and the app-layer composition (via contracts)
// so the same code never drifts across the three layers (NIT-1 — consolidated duplication).

export const SupportTicketErrorCode = {
  /** VALIDATION (Doc-4H §HB-4.x Stage 1 SYNTAX). */
  INVALID_INPUT: "comm_support_ticket_invalid_input",
  /** AUTHORIZATION (Stage 3 AUTHZ; incl. a User requesting a staff-only transition). */
  FORBIDDEN: "comm_support_ticket_forbidden",
  /** NOT_FOUND (Stage 4 SCOPE — the R10 protected-fact collapse; absent OR out-of-scope). */
  NOT_FOUND: "comm_support_ticket_not_found",
  /** STATE (Stage 6 — an illegal transition / closed-ticket append / non-resolved close). */
  INVALID_STATE: "comm_support_ticket_invalid_state",
  /** CONFLICT (the contract-internal OCC lost race — distinct from STATE; retryable). */
  CONFLICT: "comm_support_ticket_conflict",
} as const;

export type SupportTicketErrorCodeValue =
  (typeof SupportTicketErrorCode)[keyof typeof SupportTicketErrorCode];
