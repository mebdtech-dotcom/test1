// M0 infrastructure (PRIVATE) — the outbox-worker POLICY reader + backoff/retention interpreters
// for the Doc-4B §B6 dispatch/archive workers (`core.outbox_events`).
//
// POLICY-VALUES-NEVER-LITERAL (Doc-4A §18.2): every tunable the workers use — max attempts, retry
// backoff, dead-letter policy, archive retention — is READ from `core.system_configuration` through
// the W2-CORE-1 service `core.config_value_query.v1` (Doc-4B §B8). This file never hardcodes a bound
// value; it only NAMES the registered keys (by pointer to Doc-3 v1.0 / Doc-6B §5.2) and INTERPRETS
// the stored spec strings (e.g. the backoff descriptor) into the milliseconds the mechanics need.
// The key NAMES here are the four §B6 dispatch/archive bounds; the two `*_dedup_window` keys are the
// consumer-idempotency windows §B6 guards via the exact status transition (not read by the worker).
//
// Same-module import: `events/` → `data/system-configuration.service` is M0-internal (the canonical
// module-private wiring; no cross-module surface is touched — One Module, One Owner).

import { configValueQuery } from "../data/system-configuration.service";
import type { CoreServiceExecutor } from "../../contracts/services";

/**
 * The fixed Doc-4A §18.2 reference-form prefix + the four registered §B6 outbox bound keys, in the
 * full reference form `core.system_configuration.<domain>.<key_name>` the config service resolves
 * (Doc-4B §B8 V1). NAMES only — bound by pointer to Doc-3 v1.0 §3 / Doc-6B §5.2; no value restated.
 */
const REF = "core.system_configuration." as const;
export const OUTBOX_DISPATCH_MAX_ATTEMPTS_KEY = `${REF}core.outbox_dispatch_max_attempts` as const;
export const OUTBOX_DISPATCH_BACKOFF_KEY = `${REF}core.outbox_dispatch_backoff` as const;
export const OUTBOX_DLQ_POLICY_KEY = `${REF}core.outbox_dlq_policy` as const;
export const OUTBOX_ARCHIVE_RETENTION_KEY = `${REF}core.outbox_archive_retention` as const;

/** A parsed retry-backoff spec (from the stored `core.outbox_dispatch_backoff` descriptor). */
export interface BackoffSpec {
  /** Retry strategy token (e.g. `exponential`) — the leading word of the stored descriptor. */
  strategy: string;
  /** Base delay in ms (parsed from `base <duration>`), the delay after the first attempt. */
  baseMs: number;
  /** Cap delay in ms (parsed from `cap <duration>`), the ceiling any single backoff delay hits. */
  capMs: number;
}

/** The resolved §B6 dispatch bounds for one worker pass — all values sourced from POLICY. */
export interface OutboxDispatchPolicy {
  /** `core.outbox_dispatch_max_attempts` (integer): the dead-letter / retry ceiling. */
  maxAttempts: number;
  /** `core.outbox_dispatch_backoff`: interpreted into base/cap ms for re-attempt spacing. */
  backoff: BackoffSpec;
  /** `core.outbox_dlq_policy` (enum, e.g. `park_and_alert`): the dead-letter posture (never drop). */
  dlqPolicy: string;
}

const DURATION_RE = /^(\d+)\s*(s|m|h|d)$/;
const DURATION_UNIT_MS: Readonly<Record<string, number>> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Interpret a stored duration token (`60s` · `5m` · `24h` · `30d`) into milliseconds. The NUMBER and
 * UNIT come from the POLICY store (never a literal here) — this only converts the stored form the
 * mechanics require. Throws on an uninterpretable token (fail-loud; the seed guarantees the shape).
 */
export function parseDurationMs(token: string): number {
  const m = DURATION_RE.exec(token.trim());
  if (m === null) {
    throw new Error(`outbox POLICY: uninterpretable duration token: ${JSON.stringify(token)}`);
  }
  return Number(m[1]) * DURATION_UNIT_MS[m[2]];
}

const BACKOFF_BASE_RE = /base\s+(\d+\s*[smhd])/i;
const BACKOFF_CAP_RE = /cap\s+(\d+\s*[smhd])/i;

/**
 * Interpret the stored `core.outbox_dispatch_backoff` descriptor (e.g. `exponential, base 2s, cap 5m`)
 * into `{ strategy, baseMs, capMs }`. Strategy = the leading word; base/cap = the stored durations.
 * All numbers come from the POLICY store. Throws if `base`/`cap` are absent (fail-loud).
 */
export function parseBackoffSpec(spec: string): BackoffSpec {
  const strategy =
    spec
      .trim()
      .split(/[\s,]+/)[0]
      ?.toLowerCase() ?? "";
  const base = BACKOFF_BASE_RE.exec(spec);
  const cap = BACKOFF_CAP_RE.exec(spec);
  if (base === null || cap === null) {
    throw new Error(`outbox POLICY: uninterpretable backoff spec: ${JSON.stringify(spec)}`);
  }
  return { strategy, baseMs: parseDurationMs(base[1]), capMs: parseDurationMs(cap[1]) };
}

/**
 * The backoff delay (ms) that must elapse after `attempts` re-attempts before the next re-attempt.
 * `exponential` → `min(base * 2^(attempts-1), cap)`; a never-attempted row (`attempts <= 0`) has zero
 * delay (immediately eligible). An unrecognized strategy falls back to a CONSTANT `base` spacing —
 * an interpretation of the stored spec, inventing no value (base/cap remain the POLICY values).
 */
export function backoffDelayMs(backoff: BackoffSpec, attempts: number): number {
  if (attempts <= 0) return 0;
  const raw =
    backoff.strategy === "exponential" ? backoff.baseMs * 2 ** (attempts - 1) : backoff.baseMs;
  return Math.min(raw, backoff.capMs);
}

/**
 * Whether a `pending` row that has been re-attempted `attempts` times (last touched at `updatedAt`)
 * is eligible for another attempt at `now` under the backoff spec. `attempts === 0` ⇒ always eligible.
 */
export function isBackoffElapsed(
  backoff: BackoffSpec,
  attempts: number,
  updatedAt: Date,
  now: Date,
): boolean {
  // A never-attempted row has no backoff gate — always eligible (independent of `updated_at`, so app/DB
  // clock skew on a just-written row can never wrongly defer a first dispatch).
  if (attempts <= 0) return true;
  return now.getTime() - updatedAt.getTime() >= backoffDelayMs(backoff, attempts);
}

/** Does the stored dead-letter policy call for parking (retain, never drop)? §B6 mandates never-drop. */
export function dlqPolicyParks(dlqPolicy: string): boolean {
  return dlqPolicy.toLowerCase().includes("park");
}

function asPositiveInt(value: unknown, key: string): number {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  throw new Error(`outbox POLICY: ${key} is not a positive integer: ${JSON.stringify(value)}`);
}

function asString(value: unknown, key: string): string {
  if (typeof value === "string" && value.length > 0) return value;
  throw new Error(`outbox POLICY: ${key} is not a non-empty string: ${JSON.stringify(value)}`);
}

/**
 * Resolve the §B6 dispatch bounds (max attempts, backoff, dead-letter policy) via
 * `core.config_value_query.v1` (Doc-4B §B8), on the supplied executor so the read joins the worker's
 * own platform-staff transaction (the store carries the platform-staff RLS backstop, Doc-6B §2.2).
 * Values come only from `core.system_configuration` — never a literal (Doc-4A §18.2).
 */
export async function readOutboxDispatchPolicy(
  executor: CoreServiceExecutor,
): Promise<OutboxDispatchPolicy> {
  const [maxAttemptsRow, backoffRow, dlqRow] = await Promise.all([
    configValueQuery({ key: OUTBOX_DISPATCH_MAX_ATTEMPTS_KEY }, executor),
    configValueQuery({ key: OUTBOX_DISPATCH_BACKOFF_KEY }, executor),
    configValueQuery({ key: OUTBOX_DLQ_POLICY_KEY }, executor),
  ]);
  return {
    maxAttempts: asPositiveInt(maxAttemptsRow.value, OUTBOX_DISPATCH_MAX_ATTEMPTS_KEY),
    backoff: parseBackoffSpec(asString(backoffRow.value, OUTBOX_DISPATCH_BACKOFF_KEY)),
    dlqPolicy: asString(dlqRow.value, OUTBOX_DLQ_POLICY_KEY),
  };
}

/**
 * Resolve `core.outbox_archive_retention` (ms) via `core.config_value_query.v1` (Doc-4B §B8), on the
 * supplied executor (joins the worker's platform-staff transaction). Value from POLICY, never literal.
 */
export async function readOutboxArchiveRetentionMs(executor: CoreServiceExecutor): Promise<number> {
  const row = await configValueQuery({ key: OUTBOX_ARCHIVE_RETENTION_KEY }, executor);
  return parseDurationMs(asString(row.value, OUTBOX_ARCHIVE_RETENTION_KEY));
}
