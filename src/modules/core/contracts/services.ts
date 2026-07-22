// Public service interfaces for module "core" — the only cross-module call surface
// (REPOSITORY_STRUCTURE section 3). Realizes the M0 contract surface of Doc-4B (FROZEN):
//   - core.allocate_human_reference.v1 (Doc-4B §A7)
//   - core.append_audit_record.v1      (Doc-4B §A10)
//
// Both are internal infrastructure services invoked WITHIN the caller's transaction
// (Doc-4B §A7 / §A10 — atomic with the caller's create/mutate). Callers therefore pass an
// optional transaction executor so allocation/audit-append join the caller's single
// transaction; absent one, the service runs on the shared client.

import {
  allocateHumanReference as allocateHumanReferenceImpl,
  appendAuditRecord as appendAuditRecordImpl,
  archiveDispatchedEvents as archiveDispatchedEventsImpl,
  configValueQuery as configValueQueryImpl,
  dispatchOutboxEvents as dispatchOutboxEventsImpl,
  drainOutbox as drainOutboxImpl,
  featureFlagEvaluate as featureFlagEvaluateImpl,
  writeOutboxEvent as writeOutboxEventImpl,
} from "../infrastructure";
import type {
  AllocateHumanReferenceInput,
  AllocateHumanReferenceResult,
  AppendAuditRecordInput,
  AppendAuditRecordResult,
  ConfigValueQueryInput,
  ConfigValueQueryResult,
  DrainOutboxInput,
  DrainOutboxResult,
  FeatureFlagEvaluateInput,
  FeatureFlagEvaluateResult,
  OutboxArchiveInput,
  OutboxArchiveResult,
  OutboxDispatchInput,
  OutboxDispatchResult,
  WriteOutboxEventInput,
} from "./types";

/**
 * A transaction-capable executor surface (structural). Satisfied by both the shared Prisma
 * client and a Prisma interactive-transaction client; lets the caller bind these M0 primitives
 * into its own transaction (Doc-4B §A7/§A10 atomicity) without coupling `contracts/` to a
 * concrete client. The concrete type lives in `src/shared/db`; infrastructure narrows to it.
 */
export interface CoreServiceExecutor {
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
}

/**
 * `core.allocate_human_reference.v1` (Doc-4B §A7).
 * Allocates the next year-scoped `human_ref` for `entityType` from `core.id_sequences`
 * (row-locked, gap-tolerant, never-reused — Doc-2 §10.11). Participates in the caller's
 * transaction when an executor is supplied.
 */
export type AllocateHumanReference = (
  input: AllocateHumanReferenceInput,
  executor?: CoreServiceExecutor,
) => Promise<AllocateHumanReferenceResult>;

/**
 * `core.append_audit_record.v1` (Doc-4B §A10).
 * Appends exactly one immutable row to `core.audit_records` (Doc-2 §9 field set). Bound to the
 * caller's transaction when an executor is supplied (audit is atomic with the business write —
 * Doc-4B §17.1).
 */
export type AppendAuditRecord = (
  input: AppendAuditRecordInput,
  executor?: CoreServiceExecutor,
) => Promise<AppendAuditRecordResult>;

/**
 * `core.write_outbox_event.v1` (Doc-4B §B10).
 * Inserts exactly one `core.outbox_events` row with `status='pending'` (Doc-2 §10.1). Bound to the
 * caller's transaction when an executor is supplied — the emit is ATOMIC with the caller's business
 * write (§16.2: the business write cannot commit without its outbox row). COINS NO event name: the
 * owning (emitting) module supplies a Doc-2 §8 name (by pointer); this primitive persists the row
 * structurally and does not validate the catalog. Error → `core_outbox_write_failed` (SYSTEM; rolls
 * the caller's tx back). NOT separately audited (the business action is audited by the caller — §17).
 * Returns void — the frozen contract declares `Response: none` (Doc-4A §21.5 carve-out);
 * [ESC-CORE-OUTBOX-MECH] Option A, owner-ruled 2026-07-12.
 */
export type WriteOutboxEvent = (
  input: WriteOutboxEventInput,
  executor?: CoreServiceExecutor,
) => Promise<void>;

/**
 * `core` transactional-outbox drainer (Doc-8B §7.2; Doc-6B §3.2). Drains `core.outbox_events`
 * `pending → dispatched` (and, when asked, the distinct `dispatched → archived` archival leg) as the
 * System/platform-staff actor, in its own transaction. EMITTER-AGNOSTIC (R-a / ESC-W1-OUTBOX): it
 * advances whatever rows exist and coins NO domain event. Idempotent; forward-only (DB-trigger-enforced).
 * This is the dispatch entry point invoked by the Inngest outbox job (`inngest/functions`).
 */
export type DrainOutbox = (input?: DrainOutboxInput) => Promise<DrainOutboxResult>;

/**
 * `core.phase2_dispatch_outbox_events.v1` (Doc-4B §B6 — System/Phase-2 worker). Advances re-attempt-
 * eligible `core.outbox_events` `pending → dispatched`, with retry+backoff and dead-letter park (both
 * POLICY-bounded via `core.config_value_query.v1`), plus the reconciliation sweep. TRANSPORT ONLY:
 * coins NO domain event (§B6 Events-Produced: none). Appends ONE System-attributed audit record per
 * run that advanced ≥ 1 row (the realized [D-5] run/batch audit leg — Doc-4B_OutboxAuditToken_Patch_v1.0,
 * Board-approved 2026-07-10). Invoked by the Inngest outbox job (`inngest/functions`).
 */
export type DispatchOutboxEvents = (input?: OutboxDispatchInput) => Promise<OutboxDispatchResult>;

/**
 * `core.phase2_archive_dispatched_events.v1` (Doc-4B §B6 — System/Phase-2 worker). Advances
 * `core.outbox_events` `dispatched → archived` for rows past `core.outbox_archive_retention` (POLICY,
 * via `core.config_value_query.v1`) — the distinct, retention-bounded archival leg. Coins no event.
 */
export type ArchiveDispatchedEvents = (input?: OutboxArchiveInput) => Promise<OutboxArchiveResult>;

/**
 * `core.config_value_query.v1` (Doc-4B §B8 — internal-service, 21.3 Query).
 * Resolves a POLICY value by key at runtime (Doc-4A §18: owning engines read POLICY values via
 * M0, never literals). Key format `core.system_configuration.<domain>.<key_name>` (§18.2); the
 * key MUST be registered in Doc-3 §12.2 (by pointer). Read-only: no audit, no event. Participates
 * in the caller's transaction when an executor is supplied.
 */
export type ConfigValueQuery = (
  input: ConfigValueQueryInput,
  executor?: CoreServiceExecutor,
) => Promise<ConfigValueQueryResult>;

/**
 * `core.feature_flag_evaluate.v1` (Doc-4B §B9 — internal-service, 21.3 Query).
 * Resolves a flag state for a scope at runtime. FIREWALLED (Doc-6B §3.5 / Doc-4B §B9): flag
 * evaluation MAY gate feature visibility / rollout ONLY — it MUST NOT gate trust, verification,
 * eligibility, routing fairness, or matching confidence. Unknown `flag_key` resolves disabled
 * (fail-safe — Doc-4B §B9 V8); output is the resolved boolean only. Read-only: no audit, no event.
 */
export type FeatureFlagEvaluate = (
  input: FeatureFlagEvaluateInput,
  executor?: CoreServiceExecutor,
) => Promise<FeatureFlagEvaluateResult>;

/** The M0 callable service surface exposed to other modules (contracts-only). */
export interface CoreServices {
  allocateHumanReference: AllocateHumanReference;
  appendAuditRecord: AppendAuditRecord;
  writeOutboxEvent: WriteOutboxEvent;
  drainOutbox: DrainOutbox;
  dispatchOutboxEvents: DispatchOutboxEvents;
  archiveDispatchedEvents: ArchiveDispatchedEvents;
  configValueQuery: ConfigValueQuery;
  featureFlagEvaluate: FeatureFlagEvaluate;
}

// ── Concrete contract facades (WP-1.4 — closes the WP-1.3 deferred MINOR) ─────────────────────
// The cross-module surface above is the TYPE; the concrete callable was previously reachable only
// via `core.module.ts` (a `module-root`, NOT importable by `src/server`). These concrete facades let
// the app-layer composition edge consume the M0 service through `@/modules/core/contracts` — strictly
// contracts/-only cross-module access. The binding is same-module-legal: `core/contracts` →
// `core/infrastructure` (the canonical DDD contracts-facade pattern; `${from.module}` constrains it to
// THIS module — no cross-module internal access is opened). The infrastructure adapter IS the M0
// `core.allocate_human_reference.v1` realization (Doc-4B §A7 / Doc-6B §3.3); this only re-exposes it on
// the public surface, coining nothing.

/**
 * Concrete `core.allocate_human_reference.v1` (Doc-4B §A7) — the year-scoped `human_ref` allocator,
 * bound to the M0 infrastructure adapter. Participates in the caller's transaction when an executor is
 * supplied (Doc-4B §A7 atomicity). Consumed cross-module via `@/modules/core/contracts`.
 */
export const allocateHumanReference: AllocateHumanReference = allocateHumanReferenceImpl;

/**
 * Concrete `core.append_audit_record.v1` (Doc-4B §A10), bound to the M0 infrastructure adapter. Appends
 * exactly one immutable row to `core.audit_records`; participates in the caller's transaction when an
 * executor is supplied (audit atomic with the business write — Doc-4B §17.1). Consumed cross-module via
 * `@/modules/core/contracts` (strictly contracts/-only; the contracts→infrastructure binding is
 * same-module-legal — the canonical DDD facade pattern). The append is admitted under the context-bound
 * `audit_records_context_append` RLS policy (ESC-W2-AUDIT-RLS §7 = R-b / ADR-021) and is NON-`RETURNING`
 * (the `audit_id` is app-minted); coins nothing.
 */
export const appendAuditRecord: AppendAuditRecord = appendAuditRecordImpl;

/**
 * Concrete `core.write_outbox_event.v1` (Doc-4B §B10), bound to the M0 infrastructure adapter. Inserts
 * exactly one `pending` `core.outbox_events` row; participates in the caller's transaction when an
 * executor is supplied (the emit is atomic with the caller's business write — Doc-4B §16.2). Consumed
 * cross-module via `@/modules/core/contracts` (strictly contracts/-only; the contracts→infrastructure
 * binding is same-module-legal — the canonical DDD facade pattern). The producer-emit twin of
 * `appendAuditRecord`; NON-`RETURNING` (mirrors the audit twin); coins no event name (caller supplies a
 * Doc-2 §8 name by pointer). This is the codebase's FIRST §8-emitter primitive — shared Wave-3 infra.
 */
export const writeOutboxEvent: WriteOutboxEvent = writeOutboxEventImpl;

/**
 * Concrete `core` outbox drainer (Doc-8B §7.2 / Doc-6B §3.2), bound to the M0 infrastructure adapter.
 * The Inngest outbox job consumes this via `@/modules/core/contracts` (strictly contracts/-only
 * cross-module access; the contracts→infrastructure binding is same-module-legal — the canonical DDD
 * facade pattern). Emitter-agnostic + idempotent + forward-only; coins no event (R-a / ESC-W1-OUTBOX).
 */
export const drainOutbox: DrainOutbox = (input) => drainOutboxImpl(input);

/**
 * Concrete `core.phase2_dispatch_outbox_events.v1` (Doc-4B §B6), bound to the M0 infrastructure adapter
 * (W2-CORE-2). The Inngest outbox job consumes this via `@/modules/core/contracts` (contracts-only
 * cross-module access; the contracts→infrastructure binding is same-module-legal — the canonical DDD
 * facade pattern). Emitter-agnostic + idempotent + forward-only; POLICY-bounded; coins no event. The
 * [D-5] run/batch audit leg is realized (one System audit record per advancing run —
 * Doc-4B_OutboxAuditToken_Patch_v1.0, Board-approved 2026-07-10).
 */
export const dispatchOutboxEvents: DispatchOutboxEvents = (input) =>
  dispatchOutboxEventsImpl(input);

/**
 * Concrete `core.phase2_archive_dispatched_events.v1` (Doc-4B §B6), bound to the M0 infrastructure
 * adapter (W2-CORE-2). The distinct retention-bounded archival worker; consumed by the Inngest outbox
 * job via `@/modules/core/contracts` (same-module facade pattern). Idempotent; forward-only; no event.
 */
export const archiveDispatchedEvents: ArchiveDispatchedEvents = (input) =>
  archiveDispatchedEventsImpl(input);

/**
 * Concrete `core.config_value_query.v1` (Doc-4B §B8), bound to the M0 infrastructure adapter
 * (W2-CORE-1). The runtime POLICY read every module uses instead of literals or its own `core`
 * schema access (Doc-4A §18.2; One Module, One Owner). Consumed cross-module via
 * `@/modules/core/contracts` (the contracts→infrastructure binding is same-module-legal — the
 * canonical DDD facade pattern). Coins nothing: keys are Doc-3 §12.2-registered, values live only
 * in `core.system_configuration` (Doc-6B §3.4).
 */
export const configValueQuery: ConfigValueQuery = configValueQueryImpl;

/**
 * Concrete `core.feature_flag_evaluate.v1` (Doc-4B §B9), bound to the M0 infrastructure adapter
 * (W2-CORE-1). FIREWALLED (Doc-6B §3.5): gates feature visibility / rollout ONLY — never trust,
 * verification, eligibility, routing fairness, or matching confidence; unknown flags resolve
 * disabled (fail-safe). Discloses exactly the resolved boolean — nothing broader. Consumed
 * cross-module via `@/modules/core/contracts` (contracts-only surface). Coins nothing.
 */
export const featureFlagEvaluate: FeatureFlagEvaluate = featureFlagEvaluateImpl;
