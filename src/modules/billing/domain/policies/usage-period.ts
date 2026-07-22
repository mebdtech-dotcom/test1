// M7 domain (PRIVATE) — the `usage_ledger.period` metering-window helpers (Doc-2 §10.8 `period`). The
// window is a CALENDAR MONTH `YYYY-MM` [realization convention, disclosed] — Doc-4I §HB-3.2/§HB-3.3 Stage-9
// carry the quota window/reset as `[ESC-BILL-POLICY]` (no `billing` window key frozen), so the calendar
// month is the interim binding, matching Doc-5I §6.2 "`period = YYYY-MM`, default current period". UTC so
// the boundary is deterministic and TZ-independent.

/** `YYYY-MM` shape guard (months `01`–`12`). */
const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** The current metering period as `YYYY-MM` (UTC). */
export function currentPeriod(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Is `value` a well-formed `YYYY-MM` period? */
export function isValidPeriod(value: string): boolean {
  return PERIOD_PATTERN.test(value);
}

/** Is `period` strictly after the current period? (`YYYY-MM` compares correctly lexicographically.) */
export function isFuturePeriod(period: string): boolean {
  return period > currentPeriod();
}
