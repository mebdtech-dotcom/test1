// M0 domain — canonical audit-action constants for the transactional-outbox Phase-2 workers (the
// realized serialization tokens). Realizes:
//   - Doc-2 §9 (Platform) — the ENUMERATED business-action family "service-role sensitive operations"
//     (line 695). UNLIKE the M1 buyer-profile tokens, NO Doc-2 §9 patch is authored: the family is
//     already enumerated, so these tokens bind BY POINTER to it (the delegation/membership/role
//     "enumerated action → serialize only" precedent).
//   - Doc-4B_OutboxAuditToken_Patch_v1.0 (PROPOSED) — the WIRE realization: the run-level `action`
//     token strings + `entity_type` for the two §B6 workers. Companion to
//     BOARD-DECISION-D5-OUTBOX-AUDIT_v1.1 (owner ruling: realize Legs 3+5; per-run/batch granularity).
//
// These are the serialization constants the two Doc-4B §B6 workers append to `core.audit_records` via
// `core.append_audit_record.v1`. Imported as NAMED CONSTANTS — never hardcoded string literals (Board
// ruling 2026-06-30). The BUSINESS meaning is owned by rank-0 Doc-2 §9; the SERIALIZATION (these tokens
// + entity_type) is owned by Doc-4B_OutboxAuditToken_Patch_v1.0 — so a future token rename changes that
// patch + this constant, NEVER reopens Doc-2 or the frozen §B6 contract text.
//
// GRANULARITY — per-dispatch-run / batch ([D-5] ruling): ONE audit record per worker pass that
// advanced ≥ 1 row, summarizing the run — NOT one record per delivered event. The audited unit is the
// service-role RUN, not an `outbox_events` row (the §9 "import job execution" job/run-level-audit
// precedent); `entity_id` is a fresh per-run UUIDv7 correlation id (M0 has no aggregate table for a
// "run", by rule). Attribution is System (`actor_type: "system"`, `actor_id: null`).
//
// [D-5] LEGS 1 (created) + 4 (dead-letter park) are NOT realized here — each needs a future additive
// frozen patch + human approval (carried `[D-5-LEG1-CREATED]` / `[D-5-LEG4-PARK]`). Leg 2 (attempt) is
// folded into Leg 3 (the CAS-winning advance IS the audited dispatch).

/** The audit `entity_type` for a dispatch RUN of `core.phase2_dispatch_outbox_events.v1`
 *  (Doc-4B_OutboxAuditToken_Patch_v1.0). The audited unit is the run, not an `outbox_events` row. */
export const OUTBOX_DISPATCH_RUN_ENTITY_TYPE = "outbox_dispatch_run" as const;

/** The audit `entity_type` for an archival RUN of `core.phase2_archive_dispatched_events.v1`
 *  (Doc-4B_OutboxAuditToken_Patch_v1.0). The audited unit is the run, not an `outbox_events` row. */
export const OUTBOX_ARCHIVE_RUN_ENTITY_TYPE = "outbox_archive_run" as const;

/**
 * Canonical outbox worker audit actions — each bound BY POINTER to the ENUMERATED Doc-2 §9 Platform
 * family "service-role sensitive operations" (no `[ESC-*]` channel; the family is enumerated). TWO
 * distinct tokens (one per worker) so the immutable ledger distinguishes a dispatch run from an archive
 * run. Run-level (§B6 Mutation-Scope status transition), never per delivered event ([D-5] run/batch).
 */
export const OutboxAuditAction = {
  /** §9 Platform "service-role sensitive operations"; the dispatch run that advanced ≥ 1
   *  `pending → dispatched` (Doc-4B §B6 Mutation-Scope). Leg 2 (attempt) is folded in. */
  DISPATCHED: "outbox_events_dispatched",
  /** §9 Platform "service-role sensitive operations"; the archival run that advanced ≥ 1
   *  `dispatched → archived` (Doc-4B §B6 Mutation-Scope). */
  ARCHIVED: "outbox_events_archived",
} as const;

export type OutboxAuditActionToken = (typeof OutboxAuditAction)[keyof typeof OutboxAuditAction];
