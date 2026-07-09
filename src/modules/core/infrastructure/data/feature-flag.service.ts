// M0 infrastructure — realizes `core.feature_flag_evaluate.v1` (Doc-4B §B9): the internal runtime
// flag evaluation over `core.feature_flags` (Doc-6B §3.5). This is M0 reading its OWN schema
// (allowed); other modules consume this via the contract surface, never raw `core` SQL.
//
// FIREWALL (Doc-6B §3.5 / Doc-4B §B9 — binding): flag evaluation gates feature visibility /
// rollout ONLY; it MUST NOT gate trust, verification, eligibility, routing fairness, or matching
// confidence (Doc-4A §18.3, §4B). Evaluation is code (this M0 flag service); the table is the
// keyed store only. The service discloses EXACTLY the Doc-4B output — the resolved `enabled`
// boolean; the stored row (`scope_jsonb`, timestamps) is never exposed.
//
// FAIL-SAFE (Doc-4B §B9 V8): an unknown `flag_key` resolves to disabled — not an error. The same
// fail-safe governs scope resolution: a scoped flag resolves enabled ONLY where the supplied
// evaluation scope satisfies every constraint in the row's `scope_jsonb`; anything unmatched or
// uninterpretable resolves disabled — evaluation is never broader than the stored grant.
//
// Read-only: no audit (Doc-4B §B9 — Audit-Required: no), no event (Events-Produced: none).
// RLS on the table is the platform-staff backstop (Doc-6B §2.2 / CHK-6-023); this app-layer
// service is the authorized read path.

import { prisma, type DbExecutor } from "../../../../shared/db";
import type { CoreServiceExecutor, FeatureFlagEvaluate } from "../../contracts/services";
import { CoreServiceError } from "../../contracts/types";

/** A plain JSON object (the `scope_jsonb` shape — Doc-2 §10.1); rejects null/arrays/scalars. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Structural JSON equality (order-insensitive on object keys) for scope-constraint values. */
function jsonEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => jsonEquals(item, b[i]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return aKeys.length === bKeys.length && aKeys.every((k) => k in b && jsonEquals(a[k], b[k]));
  }
  return false;
}

/**
 * Fail-safe scope resolution: the row's `scope_jsonb` constrains where the flag is enabled.
 * - stored scope NULL/absent → global: enabled everywhere.
 * - stored scope a plain object → every constrained key must be present AND equal in the
 *   supplied evaluation scope (containment match); otherwise disabled.
 * - stored scope uninterpretable as a constraint object → disabled (fail-safe — never resolve
 *   a grant broader than what the store legibly declares).
 */
function scopeSatisfied(
  storedScope: unknown,
  suppliedScope: Record<string, unknown> | undefined,
): boolean {
  if (storedScope === null || storedScope === undefined) return true; // global scope
  if (!isPlainObject(storedScope)) return false; // uninterpretable → fail-safe disabled
  const supplied = suppliedScope ?? {};
  return Object.entries(storedScope).every(
    ([k, constraint]) => k in supplied && jsonEquals(constraint, supplied[k]),
  );
}

/**
 * Evaluate a feature flag for a scope (Doc-4B §B9 / Doc-6B §3.5). Runs on the supplied
 * transaction executor when present; otherwise on the shared client.
 *
 * Errors (verbatim Doc-4B §B9): `core_flag_invalid_input` (VALIDATION — `flag_key` absent or
 * `scope` not well-formed per the `scope_jsonb` shape). Unknown `flag_key` is NOT an error —
 * it resolves disabled (fail-safe, Doc-4B §B9 V8).
 */
export const featureFlagEvaluate: FeatureFlagEvaluate = async (
  input,
  executor?: CoreServiceExecutor,
) => {
  if (typeof input.flagKey !== "string" || input.flagKey.trim() === "") {
    throw new CoreServiceError(
      "core_flag_invalid_input",
      "core.feature_flag_evaluate.v1: flag_key is required",
    );
  }
  if (input.scope !== undefined && !isPlainObject(input.scope)) {
    throw new CoreServiceError(
      "core_flag_invalid_input",
      "core.feature_flag_evaluate.v1: scope must be a plain object per the scope_jsonb shape (Doc-2 §10.1)",
    );
  }

  const db = (executor as DbExecutor | undefined) ?? prisma;
  const row = await db.featureFlag.findUnique({
    where: { flagKey: input.flagKey },
    select: { enabled: true, scopeJsonb: true },
  });

  // Unknown flag → disabled, fail-safe (Doc-4B §B9 V8). Output is EXACTLY { enabled } —
  // never the stored row (Doc-6B §3.5 firewall posture).
  if (row === null) return { enabled: false };
  if (!row.enabled) return { enabled: false };
  return { enabled: scopeSatisfied(row.scopeJsonb, input.scope) };
};
