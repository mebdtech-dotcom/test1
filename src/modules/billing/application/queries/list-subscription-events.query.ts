// M7 application (PRIVATE) — `billing.list_subscription_events.v1` (Doc-4I §HB-2.5 / Doc-5I §5
// `GET /billing/subscriptions/{subscription_id}/events` · 200). W3-BILL-5. ORG-SELF read (Own-Org,
// User-only — Doc-5I §3.6 [ESC-BILL-ADMINSCOPE]; `can_view_billing` resolved at the composition edge).
// Runs INSIDE the composition's `withActiveOrg` tenant transaction; the `subscription_events_tenant` RLS
// scopes it to `app.active_org`, and the explicit parent-subscription org check is the belt-and-suspenders
// twin that ALSO produces the NOT_FOUND collapse (§3.5 — never confirm a cross-org subscription's events).
//
// Order is DESC by `occurred_at` / `id` tiebreak (Doc-5I §5.3 — newest first); keyset "fetch N+1, trim"
// (the list-plans precedent). Items are `{ event_type, occurred_at }` (Doc-4I §HB-2.5) — `event_type` is
// the STORED Doc-2 §10.8 domain value rendered verbatim (`purchase|renew|expire|cancel`).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import {
  findSubscriptionEventsPage,
  loadSubscriptionScoped,
} from "../../infrastructure/data/subscription.repository";
import type {
  ListSubscriptionEventsOutcome,
  ListSubscriptionEventsRequest,
  SubscriptionEventItem,
} from "../../contracts/types";

// Doc-3 Policy-Key Registration Patch v1.6 (Billing) §Registered keys — `billing.list_page_size_max`
// (integer; over-max → 400 VALIDATION). The SAME registered maximum the sibling `list_plans` read binds
// ([realization convention, disclosed] — one billing page-size bound, never an unregistered literal).
const LIST_PAGE_SIZE_MAX = 100;

interface EventCursorPayload {
  occurredAt: string; // ISO-8601
  id: string;
}

/** Opaque keyset cursor [realization convention, disclosed]: base64url of `{ occurredAt, id }` — the exact
 *  `(occurred_at, id)` DESC keyset position. A client MUST NOT construct/decode one (Doc-5A §8.2). */
function encodeCursor(payload: EventCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): { occurredAt: Date; id: string } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const record = parsed as Record<string, unknown>;
  if (typeof record.occurredAt !== "string" || typeof record.id !== "string") return null;
  if (!UUID_PATTERN.test(record.id)) return null;
  const occurredAt = new Date(record.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) return null;
  return { occurredAt, id: record.id };
}

function toItem(row: {
  eventType: "purchase" | "renew" | "expire" | "cancel";
  occurredAt: Date;
}): SubscriptionEventItem {
  return { eventType: row.eventType, occurredAt: row.occurredAt.toISOString() };
}

/**
 * `billing.list_subscription_events.v1` — the org's subscription-event history, newest first. SYNTAX
 * (uuid `subscription_id`, `page_size` bound, opaque cursor decodability) → NOT_FOUND (the parent
 * subscription is absent or cross-org) → the keyset page. `organizationId` is the server-validated active
 * org (from the composition — never input).
 */
export async function listSubscriptionEvents(
  request: ListSubscriptionEventsRequest,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<ListSubscriptionEventsOutcome> {
  // SYNTAX — subscription_id uuid.
  if (typeof request.subscriptionId !== "string" || !UUID_PATTERN.test(request.subscriptionId)) {
    return { ok: false, errorClass: "VALIDATION" };
  }

  // page_size — bounded by `billing.list_page_size_max`; over-max is a SYNTAX 400, never clamped (Doc-5A §8.5).
  const pageSize = request.pageSize ?? LIST_PAGE_SIZE_MAX;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > LIST_PAGE_SIZE_MAX) {
    return { ok: false, errorClass: "VALIDATION" };
  }

  // cursor — opaque keyset token (Doc-5A §8.1/§8.2); malformed ⇒ SYNTAX 400 (never guessed/repaired).
  let after: { occurredAt: Date; id: string } | null = null;
  if (request.cursor !== undefined) {
    after = decodeCursor(request.cursor);
    if (after === null) {
      return { ok: false, errorClass: "VALIDATION" };
    }
  }

  // SCOPE / NOT_FOUND — the parent subscription must resolve within the org (§3.5 protected-fact collapse).
  const parent = await loadSubscriptionScoped(request.subscriptionId, organizationId, db);
  if (parent === null) {
    return { ok: false, errorClass: "NOT_FOUND" };
  }

  // Fetch pageSize + 1 (the standard keyset "fetch N+1, trim" trick).
  const rows = await findSubscriptionEventsPage(request.subscriptionId, after, pageSize + 1, db);
  const hasMore = rows.length > pageSize;
  const page = hasMore ? rows.slice(0, pageSize) : rows;
  const items = page.map(toItem);

  const last = page[page.length - 1];
  const pageInfo =
    hasMore && last !== undefined
      ? {
          hasMore: true,
          nextCursor: encodeCursor({ occurredAt: last.occurredAt.toISOString(), id: last.id }),
        }
      : { hasMore: false };

  return { ok: true, result: { items, pageInfo } };
}
