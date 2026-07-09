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
  | "core_flag_invalid_input";

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

  constructor(code: CoreServiceErrorCode, message: string) {
    super(message);
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
