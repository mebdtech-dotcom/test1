// Thin Next.js App Router entry for `POST /communication/tickets` (`comm.create_ticket.v1` — 201 +
// Location) and `GET /communication/tickets` (`comm.list_tickets.v1` — 200). ROUTING + COMPOSITION ONLY
// (REPOSITORY_STRUCTURE §8): the composition core (`src/server/communication`) owns the session/actor
// gate + ALL validation; these entries only extract the wire grammar and carry the response.
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): an `app/` file imports `src/server/*` + module `contracts/` +
// `src/shared/*` only. The `Idempotency-Key` header is MANDATORY on the create (Doc-5H §7.5).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCreateTicket, handleListTickets } from "@/server/communication";
import type {
  CreateTicketInput,
  ListTicketsInput,
  SupportTicketStatusValue,
} from "@/modules/communication/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON create body (Doc-4H §HB-4.1 — snake_case wire field names). */
interface CreateTicketBody {
  subject?: unknown;
  priority?: unknown;
  body?: unknown;
}

/** Map the snake_case wire body → the typed create input (declared keys only; the command validates). */
function toCreateInput(body: CreateTicketBody): CreateTicketInput {
  return {
    subject: typeof body.subject === "string" ? body.subject : "",
    priority: typeof body.priority === "string" ? body.priority : "",
    body: typeof body.body === "string" ? body.body : "",
  };
}

/**
 * `POST /communication/tickets` — `comm.create_ticket.v1` (USER-ONLY). `201` + `Location` · `401` ·
 * `400` (syntax / missing Idempotency-Key) · `403` · `404` (no active-org context collapse).
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: CreateTicketBody;
  try {
    body = (await request.json()) as CreateTicketBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleCreateTicket(toCreateInput(body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers = {
    ...(wireHeaders ?? {}), // carries the 201 `Location` header from the core.
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}

/**
 * `GET /communication/tickets` — `comm.list_tickets.v1` (User/Admin). Wire grammar (Doc-5A §8):
 * `filter[status]=<value>` (§8.3), `cursor` (§8.2), `page_size` (§8.5). `200` · `401`.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("filter[status]");
  const cursor = url.searchParams.get("cursor");
  const pageSize = url.searchParams.get("page_size");

  const input: ListTicketsInput = {
    ...(statusFilter !== null ? { status: statusFilter as SupportTicketStatusValue } : {}),
    ...(cursor !== null ? { cursor } : {}),
    ...(pageSize !== null ? { pageSize: Number(pageSize) } : {}),
  };

  const { status, body } = await handleListTickets(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
