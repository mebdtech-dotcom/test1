// Public DTOs / IDs for module "core" (cross-module surface). DTOs/IDs only — domain
// value-objects stay private. Realizes the M0 contract surface of Doc-4B (FROZEN).
//
// Reference-never-restate: field names/semantics are owned by Doc-2 §9 (audit field set) and
// Doc-2 §0.1 (human_ref format); bound by pointer, never re-authored here.

/**
 * Actor type recorded on an audit row (Doc-2 §9; realized as the `core.ActorType` enum).
 * Logical value set: User | Admin | System | AI Agent (Doc-6B §3.1).
 */
export type CoreActorType = "user" | "admin" | "system" | "ai_agent";

/**
 * Input to `core.allocate_human_reference.v1` (Doc-4B §A7).
 * Allocates the next year-scoped human reference for an entity type from `core.id_sequences`.
 */
export interface AllocateHumanReferenceInput {
  /**
   * Entity-type prefix whose sequence is drawn — e.g. `ORG`, `RFQ`, `QTN`, `INV`, `DOC`.
   * Prefixes are owned by Doc-2 §0.1 / the Appendix B human_ref prefix registry (by pointer);
   * never invented here (Doc-4B §A7).
   */
  entityType: string;
  /** Year scope of the sequence (server-clock UTC year — Doc-2 §0.1). */
  year: number;
}

/**
 * Output of `core.allocate_human_reference.v1` (Doc-4B §A7).
 * Formatted reference per Doc-2 §0.1 (e.g. `ORG-2026-000001`).
 */
export interface AllocateHumanReferenceResult {
  /** Formatted `TYPE-YEAR-XXXXX` reference (Doc-2 §0.1; Doc-6B §3.3). */
  humanRef: string;
}

/**
 * Input to `core.append_audit_record.v1` (Doc-4B §A10).
 * Writes the Doc-2 §9 audit field set as exactly one immutable row in `core.audit_records`.
 * Field names/semantics are owned by Doc-2 §9 (bound by pointer).
 */
export interface AppendAuditRecordInput {
  /** Acting user; nullable for System/automated actions (Doc-6B §3.1). */
  actorId?: string | null;
  /** Actor type (Doc-2 §9). */
  actorType: CoreActorType;
  /** Recorded audit-context organization reference; nullable for platform actions (Doc-2 §9 / CR2). */
  organizationId?: string | null;
  /** Audited entity type (Doc-2 §9). */
  entityType: string;
  /** Audited entity id (Doc-2 §9). */
  entityId: string;
  /** Audit action name (Doc-2 §9 action catalog — by pointer; never coined here). */
  action: string;
  /** Prior field values / diff (Doc-2 §9); IDs + values only, no blobs (Doc-6A §12). */
  oldValue?: unknown;
  /** New field values / diff (Doc-2 §9); IDs + values only, no blobs (Doc-6A §12). */
  newValue?: unknown;
  /** Logical Doc-2 §9 `timestamp` (ISO-8601 UTC); defaults to server time when omitted. */
  timestamp?: Date;
  /** Caller IP (Doc-2 §9); redaction-aware. */
  ipAddress?: string | null;
  /** Caller user-agent (Doc-2 §9); redaction-aware. */
  userAgent?: string | null;
}

/**
 * Output of `core.append_audit_record.v1`.
 * Returns the platform-assigned identity of the appended immutable audit row.
 */
export interface AppendAuditRecordResult {
  /** The `audit_id` (UUIDv7, time-ordered) of the appended row (Doc-6B §3.1). */
  auditId: string;
}

// ── W3-BILL-4 — `core.write_outbox_event.v1` (Doc-4B §16), the transactional-outbox WRITE primitive ──

// ── W2-CORE-1 — config (POLICY) + feature-flag read services (Doc-4B §B8/§B9) ────────────────

/**
 * Error codes of the M0 config/flag read services — transcribed VERBATIM from Doc-4B
 * (§B8 `core.config_value_query.v1` · §B9 `core.feature_flag_evaluate.v1`); never coined here.
 * NOTE: an unknown `flag_key` is NOT an error — it resolves disabled, fail-safe (Doc-4B §B9 V8).
 */
export type CoreServiceErrorCode =
  /** Doc-4B §B8 — REFERENCE: key not registered / not present in the POLICY store. */
  | "core_config_key_not_found"
  /** Doc-4B §B8 — VALIDATION: key absent or not well-formed per Doc-4A §18.2. */
  | "core_config_invalid_key"
  /** Doc-4B §B9 — VALIDATION: flag_key absent, or scope not well-formed per scope_jsonb shape. */
  | "core_flag_invalid_input"
  /**
   * Doc-4B §B10 — SYSTEM: the `core.outbox_events` INSERT failed inside `core.write_outbox_event.v1`.
   * The throw rolls the CALLER's transaction back — the business write cannot commit without its outbox
   * row (§16.2 atomicity). Bound by pointer to the Doc-4B §B10 error; never coined here.
   */
  | "core_outbox_write_failed";

/**
 * Typed contract error carrying a Doc-4B error code. Part of the cross-module surface so
 * callers can discriminate on `code` (codes bound by pointer; message is diagnostic only).
 *
 * CONVENTION NOTE (RV-0143 NIT, raised by Team-4): typed contract errors live in `contracts/` —
 * a typed error envelope (stable code + diagnostic message, ZERO domain logic) is public contract
 * surface, not a domain value-object (REPOSITORY_STRUCTURE §3; Doc-4A error-code discipline).
 * Convention-setting for later modules: copy this shape deliberately rather than re-deciding.
 */
export class CoreServiceError extends Error {
  readonly code: CoreServiceErrorCode;

  constructor(code: CoreServiceErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options); // ES2022 ErrorOptions — preserves the underlying DB fault as `cause`.
    this.name = "CoreServiceError";
    this.code = code;
  }
}

/**
 * Input to `core.config_value_query.v1` (Doc-4B §B8).
 * Runtime POLICY read by key — owning engines read tunable values via M0, never literals
 * (Doc-4A §18.2: "A contract MUST NOT hardcode a numeric value for any limit").
 */
export interface ConfigValueQueryInput {
  /**
   * POLICY key in the full reference form `core.system_configuration.<domain>.<key_name>`
   * (Doc-4A §18.2; Doc-4B §B8 V1). The key MUST be registered in Doc-3 §12.2 (by pointer) —
   * an unknown key is a contract gap (escalate), never a runtime invention (Doc-4B §B8 V8).
   */
  key: string;
}

/**
 * Output of `core.config_value_query.v1` (Doc-4B §B8).
 */
export interface ConfigValueQueryResult {
  /** `value_jsonb` (Doc-2 §10.1), interpreted per `valueType`. */
  value: unknown;
  /** `value_type` per Doc-2 §10.1 (e.g. integer | duration | enum — Doc-3 v1.0). */
  valueType: string;
}

/**
 * Input to `core.feature_flag_evaluate.v1` (Doc-4B §B9).
 * Runtime flag evaluation by any module to gate controlled rollout.
 */
export interface FeatureFlagEvaluateInput {
  /** The flag identifier (Doc-2 §10.1 `flag_key`). */
  flagKey: string;
  /**
   * Evaluation scope per Doc-2 §10.1 `scope_jsonb` (e.g. organization_id, environment);
   * absent → default/global evaluation (Doc-4B §B9).
   */
  scope?: Record<string, unknown>;
}

/**
 * Output of `core.feature_flag_evaluate.v1` (Doc-4B §B9). EXACTLY the Doc-4B output surface —
 * `enabled` only; the stored `scope_jsonb` / row internals are never disclosed (Doc-6B §3.5
 * firewall posture: no broader exposure than the resolved boolean).
 */
export interface FeatureFlagEvaluateResult {
  /** The resolved flag state for the supplied scope (Doc-2 §10.1 `enabled` + `scope_jsonb`). */
  enabled: boolean;
}

/**
 * Options for the M0 transactional-outbox drainer (Doc-8B §7.2; Doc-6B §3.2). Mechanical only —
 * no domain semantics. The drainer is EMITTER-AGNOSTIC (R-a / ESC-W1-OUTBOX): it drains whatever
 * `pending` rows exist and coins no event.
 */
export interface DrainOutboxInput {
  /** Cap on rows processed per leg in one pass (a poll batch). Defaults to a bounded batch. */
  batchSize?: number;
  /**
   * Run the distinct archival leg (`dispatched → archived`) this pass (Doc-8B §7.2 — a separate
   * POLICY-bounded step from dispatch). Default off; the minimal obligation is the dispatch leg.
   */
  archive?: boolean;
}

/**
 * Result of one M0 outbox drain pass (mechanical counters only — Doc-8B §7.2). No domain meaning.
 */
export interface DrainOutboxResult {
  /** Rows advanced `pending → dispatched` this pass. */
  dispatched: number;
  /** Rows advanced `dispatched → archived` this pass (the distinct archival leg). */
  archived: number;
  /** `pending` rows skipped because `attempts >= core.outbox_dispatch_max_attempts` (left for DLQ). */
  skippedMaxAttempts: number;
}

// ── W2-CORE-2 — the two Doc-4B §B6 outbox Phase-2 worker contracts ────────────────────────────
// `core.phase2_dispatch_outbox_events.v1` (dispatch + retry/backoff + dead-letter park +
// reconciliation) and `core.phase2_archive_dispatched_events.v1` (retention-bounded archival).
// Mechanical counters only — no domain meaning; M0 TRANSPORTS envelopes and authors no event
// (§B6 Events-Produced: none). POLICY bounds come from `core.config_value_query.v1` (never literals).

/** Input to `core.phase2_dispatch_outbox_events.v1` (Doc-4B §B6). */
export interface OutboxDispatchInput {
  /** Cap on `pending` rows scanned for advancement this pass (a poll batch). Bounded default. */
  batchSize?: number;
}

/**
 * Result of one `core.phase2_dispatch_outbox_events.v1` pass (Doc-4B §B6 — mechanical counters).
 * The dead-letter / reconciliation counts are the ops-telemetry alert surface (§B6: "never silently
 * drop"); parked rows are RETAINED in `pending` (attempts at max), never deleted.
 */
export interface OutboxDispatchResult {
  /** Rows advanced `pending → dispatched` this pass (the status-transition dedup guard). */
  dispatched: number;
  /**
   * `pending` rows at `attempts >= core.outbox_dispatch_max_attempts` — parked (dead-lettered) per
   * `core.outbox_dlq_policy`, retained not dropped (Doc-4B §B6 dead-letter rule). The alert count.
   */
  deadLettered: number;
  /** `pending` rows not yet re-attempt-eligible this pass under `core.outbox_dispatch_backoff`. */
  skippedBackoff: number;
  /**
   * `pending` rows stuck beyond the expected dispatch latency (attempts in `[1, max)`) that the
   * reconciliation sweep flagged (Doc-4B §B6 reconciliation — re-enqueued by the next tick / alerted).
   */
  reconciledStuck: number;
  /** The governing `core.outbox_dlq_policy` value this run applied (by pointer; e.g. `park_and_alert`). */
  dlqPolicy: string;
}

/** Input to `core.phase2_archive_dispatched_events.v1` (Doc-4B §B6). */
export interface OutboxArchiveInput {
  /** Cap on `dispatched` rows scanned for archival this pass (a poll batch). Bounded default. */
  batchSize?: number;
}

/** Result of one `core.phase2_archive_dispatched_events.v1` pass (Doc-4B §B6 — mechanical counter). */
export interface OutboxArchiveResult {
  /**
   * Rows advanced `dispatched → archived` this pass — only those with `dispatched_at` older than
   * `core.outbox_archive_retention` (the retention-bounded distinct archival leg).
   */
  archived: number;
}

// ── W3-TRUST-3 (Part A) — the producer-emit primitive `core.write_outbox_event.v1` (Doc-4B §B10) ─────
// The transactional-outbox-WRITE mechanism every emitting module's §16.2 Events-Produced resolves to —
// the twin of `core.append_audit_record.v1`. It INSERTs exactly one `core.outbox_events` row inside the
// CALLER's transaction (atomic with the business write — §16.2). It COINS NO event name: the owning
// (emitting) module supplies a name that MUST exist in Doc-2 §8 (by pointer); this primitive persists the
// row structurally and does NOT validate the catalog (Doc-4B §B10 Ownership/validation).

/**
 * Input to `core.write_outbox_event.v1` (Doc-4B §B10). Field names/semantics owned by Doc-2 §10.1
 * (`event_name`, `event_version`, `aggregate_id`, `payload_jsonb`); bound by pointer, never re-authored.
 */
export interface WriteOutboxEventInput {
  /**
   * `event_name` — MUST exist in Doc-2 §8 (by pointer); never coined (§16.4). The caller (the owning
   * module per §16.6) is the only legal emitter of its events; this primitive does not validate the catalog.
   */
  eventName: string;
  /** `event_version` — integer ≥ 1 (§16.4). */
  eventVersion: number;
  /** `aggregate_id` — the aggregate-root id the event concerns (Doc-2 §10.1 `aggregate_id`; §16.5). */
  aggregateId: string;
  /**
   * `payload` — the THIN event payload per §16.5 (IDs + minimal metadata; no blobs). Privacy-Review is
   * the caller's assertion — no protected facts (§16.3 / §7.5). Persisted to `payload_jsonb` (Doc-2 §10.1).
   */
  payload: Record<string, unknown>;
}

// `core.write_outbox_event.v1` declares NO Response (Doc-4B §Write-Outbox-Event, `Response: none` —
// Doc-4A §21.5 carve-out). The primitive returns void; callers derive no correlation handle from the emit
// (the dispatcher observes delivery downstream — §B6). [ESC-CORE-OUTBOX-MECH] Option A, owner-ruled 2026-07-12.
