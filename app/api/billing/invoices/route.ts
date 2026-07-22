// Thin Next.js App Router entry for `GET /billing/invoices` — `billing.list_platform_invoices.v1`
// (Doc-5I §8 → `200`) — and `POST /billing/invoices` — `billing.issue_platform_invoice.v1` (§8 → `201`).
// REPOSITORY_STRUCTURE §8: ROUTING + COMPOSITION ONLY. Org-self (debtor); the composition core owns
// session→401, the active-org + slug gate, and ALL SYNTAX. BOUNDARY (§9): `src/server/*`.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleIssuePlatformInvoice, handleListPlatformInvoices } from "@/server/billing";
import type {
  IssuePlatformInvoiceInput,
  ListPlatformInvoicesRequest,
} from "@/modules/billing/contracts";

const FILTER_PARAM = /^filter\[(.+)\]$/;

/** Snake_case wire body for `issue_platform_invoice` (Doc-4I §HB-5.1). Debtor org = server-resolved. */
interface IssueInvoiceBody {
  purpose?: unknown;
  amount?: unknown;
  currency?: unknown;
  subscription_id?: unknown;
}

function toIssueInput(body: IssueInvoiceBody): IssuePlatformInvoiceInput {
  return {
    purpose: body.purpose as IssuePlatformInvoiceInput["purpose"],
    // `amount` accepted as a string OR number (coerced to a decimal string; money-safe).
    amount: typeof body.amount === "number" ? String(body.amount) : (body.amount as string),
    currency: body.currency as string,
    ...(body.subscription_id !== undefined
      ? { subscriptionId: body.subscription_id as string }
      : {}),
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: IssueInvoiceBody;
  try {
    body = (await request.json()) as IssueInvoiceBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleIssuePlatformInvoice(toIssueInput(body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store", ...(wireHeaders ?? {}) };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(responseBody, { status, headers });
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const filters: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    const match = FILTER_PARAM.exec(key);
    if (match) {
      filters[match[1]] = value;
    }
  }

  const cursor = url.searchParams.get("cursor");
  const pageSize = url.searchParams.get("page_size");

  const listRequest: ListPlatformInvoicesRequest = {
    filters,
    ...(cursor !== null ? { cursor } : {}),
    // Parse to a number here; the composition rejects a non-integer / out-of-bound value as SYNTAX 400.
    ...(pageSize !== null ? { pageSize: Number(pageSize) } : {}),
  };

  const { status, body } = await handleListPlatformInvoices(listRequest, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
