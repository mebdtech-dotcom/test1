// M6 domain (PRIVATE) — the POLICY duration interpreter. A POLICY `duration` value
// (`core.system_configuration.value_type = 'duration'`, e.g. `"24h"` / `"14d"`) is a platform-wide
// serialization (Doc-3 §12; Architecture §17.3 "configuration holds the numbers"); this parses it to
// milliseconds so a POLICY-bounded engine reads the live value, NEVER a literal (Doc-4A §18.2). PURE:
// no state, no DB. Coins nothing — it interprets the frozen `duration` format only.

const DURATION_PATTERN = /^(\d+)(ms|s|m|h|d)$/;
const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Interpret a POLICY `duration` value (`"<n><unit>"`, unit ∈ ms|s|m|h|d) as milliseconds. Throws when
 * the value is malformed — a POLICY store integrity failure surfaces loudly, never silently defaults
 * (the M1 `policyDurationToMs` posture). `context` labels the throw for the failing call site.
 */
export function policyDurationToMs(value: unknown, context: string): number {
  if (typeof value !== "string") {
    throw new Error(`${context}: expected a duration string, got ${typeof value}.`);
  }
  const match = DURATION_PATTERN.exec(value.trim());
  if (match === null) {
    throw new Error(`${context}: malformed duration "${value}" (expected "<n><ms|s|m|h|d>").`);
  }
  return Number(match[1]) * UNIT_MS[match[2]]!;
}

/**
 * Interpret a POLICY `integer` value (`value_jsonb` is a JSON number, e.g. `100`) as a JS integer.
 * Throws when the value is not a finite integer (loud POLICY-integrity failure). Used for the
 * `communication.list_page_size_max` page-size bound (Doc-3 v1.5; Doc-5A §8.5).
 */
export function policyIntegerValue(value: unknown, context: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${context}: expected an integer POLICY value, got ${String(value)}.`);
  }
  return value;
}
