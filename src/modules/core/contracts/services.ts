// Public service interfaces for module "core" — the only cross-module call surface
// (REPOSITORY_STRUCTURE section 3). Realizes the M0 contract surface of Doc-4B (FROZEN):
//   - core.allocate_human_reference.v1 (Doc-4B §A7)
//   - core.append_audit_record.v1      (Doc-4B §A10)
//
// Both are internal infrastructure services invoked WITHIN the caller's transaction
// (Doc-4B §A7 / §A10 — atomic with the caller's create/mutate). Callers therefore pass an
// optional transaction executor so allocation/audit-append join the caller's single
// transaction; absent one, the service runs on the shared client.

import { allocateHumanReference as allocateHumanReferenceImpl } from "../infrastructure";
import type {
  AllocateHumanReferenceInput,
  AllocateHumanReferenceResult,
  AppendAuditRecordInput,
  AppendAuditRecordResult,
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

/** The M0 callable service surface exposed to other modules (contracts-only). */
export interface CoreServices {
  allocateHumanReference: AllocateHumanReference;
  appendAuditRecord: AppendAuditRecord;
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
