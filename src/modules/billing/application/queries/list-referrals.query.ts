// M7 application (PRIVATE) — `billing.list_referrals.v1` (Doc-4I §HB-6.3 / Doc-5I §9 `GET /billing/referrals`
// · 200). W3-BILL-11. ORG-SELF read (Own-Org referrer, User-only — Doc-5I §3.6; `can_view_billing` at the
// composition edge). Runs INSIDE the composition's `withActiveOrg` tenant transaction; `referrals_tenant`
// RLS scopes it to the referrer `app.active_org`. DESC by `created_at` / `id` tiebreak (newest first);
// keyset "fetch N+1, trim". `organizationId` is the server-validated active org (the referrer Controlling Org).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import { findReferralsPage } from "../../infrastructure/data/reward.repository";
import type {
  ListReferralsOutcome,
  ListReferralsRequest,
  ReferralItem,
} from "../../contracts/types";

// The SAME registered maximum the sibling billing lists bind (`billing.list_page_size_max` — Doc-3 v1.6;
// over-max → 400, never clamped — Doc-5A §8.5).
const LIST_PAGE_SIZE_MAX = 100;

interface ReferralCursorPayload {
  createdAt: string; // ISO-8601
  id: string;
}

/** Opaque keyset cursor [realization convention, disclosed]: base64url of `{ createdAt, id }` — the exact
 *  `(created_at, id)` DESC keyset position. A client MUST NOT construct/decode one (Doc-5A §8.2). */
function encodeCursor(payload: ReferralCursorPayload): string {
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
  id: string;
  referredOrganizationId: string | null;
  state: "pending" | "qualified" | "rewarded";
}): ReferralItem {
  return {
    referralId: row.id,
    referredOrganizationId: row.referredOrganizationId,
    state: row.state,
  };
}

/**
 * `billing.list_referrals.v1` — the referrer org's referrals, newest first. `organizationId` is the
 * server-validated active org (the referrer Controlling Org; from the composition).
 */
export async function listReferrals(
  request: ListReferralsRequest,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<ListReferralsOutcome> {
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

  // Fetch pageSize + 1 (the standard keyset "fetch N+1, trim" trick).
  const rows = await findReferralsPage(organizationId, after, pageSize + 1, db);
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

  return { ok: true, result: { items, pageInfo } };
}
