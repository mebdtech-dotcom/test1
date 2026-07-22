// M7 application (PRIVATE) — `billing.list_platform_invoices.v1` (Doc-4I §HB-5.4 / Doc-5I §8
// `GET /billing/invoices` · 200). W3-BILL-8. ORG-SELF read (Own-Org debtor, User-only — Doc-5I §3.6;
// `can_view_billing` at the composition edge). Runs INSIDE the composition's `withActiveOrg` tenant
// transaction; `platform_invoices_tenant` RLS scopes it to the debtor `app.active_org`. DESC by
// `created_at` / `id` tiebreak (newest first); keyset "fetch N+1, trim". `filter` allowlist
// `{ status?, purpose? }` (Doc-4I §HB-5.4 / Doc-4A §9.6). `organizationId` is the server-validated active org.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import {
  findInvoicesPage,
  type InvoiceFilter,
} from "../../infrastructure/data/platform-invoice.repository";
import type {
  ListPlatformInvoicesOutcome,
  ListPlatformInvoicesRequest,
  PlatformInvoiceListItem,
} from "../../contracts/types";

const LIST_PAGE_SIZE_MAX = 100; // `billing.list_page_size_max` (Doc-3 v1.6); over-max → 400 (Doc-5A §8.5).

const ALLOWED_FILTERS = new Set(["status", "purpose"]);
const STATUSES = new Set(["issued", "paid", "overdue", "void"]);
const PURPOSES = new Set(["subscription", "lead_package", "advertising", "microsite", "service"]);

interface InvoiceCursorPayload {
  createdAt: string; // ISO-8601
  id: string;
}

function encodeCursor(payload: InvoiceCursorPayload): string {
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
  humanRef: string;
  purpose: PlatformInvoiceListItem["purpose"];
  amount: string;
  currency: string;
  status: PlatformInvoiceListItem["status"];
}): PlatformInvoiceListItem {
  return {
    invoiceId: row.id,
    humanRef: row.humanRef,
    purpose: row.purpose,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
  };
}

/**
 * `billing.list_platform_invoices.v1` — the debtor org's platform invoices, newest first, matching the
 * allowlisted `{ status?, purpose? }` filter. `organizationId` is the server-validated active org.
 */
export async function listPlatformInvoices(
  request: ListPlatformInvoicesRequest,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<ListPlatformInvoicesOutcome> {
  const filters = request.filters ?? {};

  // SYNTAX — `filter` allowlist (Doc-4A §9.6): undeclared field → 400; bad enum value → 400.
  for (const key of Object.keys(filters)) {
    if (!ALLOWED_FILTERS.has(key)) return { ok: false, errorClass: "VALIDATION" };
  }
  const status = filters.status;
  const purpose = filters.purpose;
  if (status !== undefined && !STATUSES.has(status)) return { ok: false, errorClass: "VALIDATION" };
  if (purpose !== undefined && !PURPOSES.has(purpose))
    return { ok: false, errorClass: "VALIDATION" };

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

  const filter: InvoiceFilter = {
    ...(status !== undefined ? { status: status as InvoiceFilter["status"] } : {}),
    ...(purpose !== undefined ? { purpose: purpose as InvoiceFilter["purpose"] } : {}),
  };

  // Fetch pageSize + 1 (the standard keyset "fetch N+1, trim" trick).
  const rows = await findInvoicesPage(organizationId, filter, after, pageSize + 1, db);
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
