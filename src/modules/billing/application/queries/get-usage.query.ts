// M7 application (PRIVATE) — `billing.get_usage.v1` (Doc-4I §HB-3.3 / Doc-5I §6.2 `GET /billing/usage` ·
// 200). W3-BILL-6. ORG-SELF read (Own-Org, User-only — Doc-5I §3.6 [ESC-BILL-ADMINSCOPE];
// `can_view_billing` resolved at the composition edge). Runs INSIDE the composition's `withActiveOrg`
// tenant transaction; `usage_ledger_tenant` RLS scopes it to `app.active_org`. `organizationId` is the
// server-validated active org — NEVER a caller `org_id` (Doc-5I §6.2 / Invariant #5).
//
// This read IS a list with a `totals` facet (Doc-4A §10.3): `items` = the org's usage rows (newest first,
// keyset), `totals` = the summed balance over the SAME filtered set. `filter` allowlist `{ quota_key?,
// period? }` (Doc-4I §HB-3.3); `period` = `YYYY-MM`, DEFAULT the current period (Doc-5I §6.2) — a FUTURE
// period → `BUSINESS` (422); malformed/undeclared → `VALIDATION` (400).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import {
  findUsagePage,
  sumUsage,
  type UsageFilter,
} from "../../infrastructure/data/usage.repository";
import { currentPeriod, isFuturePeriod, isValidPeriod } from "../../domain/policies/usage-period";
import type { GetUsageOutcome, GetUsageRequest, UsageItem } from "../../contracts/types";

// The SAME registered maximum the sibling `list_plans`/`list_subscription_events` reads bind
// (`billing.list_page_size_max` — Doc-3 v1.6; over-max → 400, never clamped — Doc-5A §8.5).
const LIST_PAGE_SIZE_MAX = 100;

const ALLOWED_FILTERS = new Set(["quota_key", "period"]);

interface UsageCursorPayload {
  createdAt: string; // ISO-8601
  id: string;
}

/** Opaque keyset cursor [realization convention, disclosed]: base64url of `{ createdAt, id }` — the exact
 *  `(created_at, id)` DESC keyset position. A client MUST NOT construct/decode one (Doc-5A §8.2). */
function encodeCursor(payload: UsageCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const record = parsed as Record<string, unknown>;
  if (typeof record.createdAt !== "string" || typeof record.id !== "string") return null;
  if (!UUID_PATTERN.test(record.id)) return null;
  const createdAt = new Date(record.createdAt);
  if (Number.isNaN(createdAt.getTime())) return null;
  return { createdAt, id: record.id };
}

function toItem(row: {
  quotaKey: string;
  amount: number;
  period: string | null;
  source: "rfq_response" | "lead_access" | "ad_launch";
}): UsageItem {
  return { quotaKey: row.quotaKey, amount: row.amount, period: row.period, source: row.source };
}

/**
 * `billing.get_usage.v1` — the org's usage/quota balance (`items` + `totals`) for the filtered
 * `quota_key`/`period`. `organizationId` is the server-validated active org (from the composition).
 */
export async function getUsage(
  request: GetUsageRequest,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<GetUsageOutcome> {
  const filters = request.filters ?? {};

  // SYNTAX — `filter` allowlist (Doc-4I §HB-3.3 / Doc-4A §9.6): undeclared field → 400.
  for (const key of Object.keys(filters)) {
    if (!ALLOWED_FILTERS.has(key)) return { ok: false, errorClass: "VALIDATION" };
  }

  const quotaKey = filters.quota_key;

  // `period` — YYYY-MM; DEFAULT current (Doc-5I §6.2). Malformed → VALIDATION; FUTURE → BUSINESS (422).
  let period = filters.period;
  if (period !== undefined) {
    if (!isValidPeriod(period)) return { ok: false, errorClass: "VALIDATION" };
    if (isFuturePeriod(period)) return { ok: false, errorClass: "BUSINESS" };
  } else {
    period = currentPeriod();
  }

  // page_size — bounded by `billing.list_page_size_max`; over-max is SYNTAX 400 (never clamped).
  const pageSize = request.pageSize ?? LIST_PAGE_SIZE_MAX;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > LIST_PAGE_SIZE_MAX) {
    return { ok: false, errorClass: "VALIDATION" };
  }

  // cursor — opaque keyset token; malformed ⇒ SYNTAX 400 (never guessed/repaired).
  let after: { createdAt: Date; id: string } | null = null;
  if (request.cursor !== undefined) {
    after = decodeCursor(request.cursor);
    if (after === null) return { ok: false, errorClass: "VALIDATION" };
  }

  const filter: UsageFilter = { ...(quotaKey !== undefined ? { quotaKey } : {}), period };

  // Fetch pageSize + 1 (keyset "fetch N+1, trim"); totals = sum over the FULL filtered set (all pages).
  const rows = await findUsagePage(organizationId, filter, after, pageSize + 1, db);
  const used = await sumUsage(organizationId, filter, db);

  const hasMore = rows.length > pageSize;
  const page = hasMore ? rows.slice(0, pageSize) : rows;
  const items = page.map(toItem);

  const last = page[page.length - 1];
  const pageInfo =
    hasMore && last !== undefined
      ? {
          hasMore: true,
          nextCursor: encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id }),
        }
      : { hasMore: false };

  return {
    ok: true,
    result: { items, totals: { quotaKey: quotaKey ?? "", used }, pageInfo },
  };
}
