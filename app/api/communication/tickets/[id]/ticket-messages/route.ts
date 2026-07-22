// Thin Next.js App Router entry for `POST /communication/tickets/{id}/ticket-messages` —
// `comm.add_ticket_message.v1` (Doc-5H §7.1 → `201`, NO `Location` — a ticket message has no standalone
// GET URL). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). Append-only (User/Admin; blocked on a
// `closed` ticket). The `Idempotency-Key` header is MANDATORY (Doc-5H §7.5).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleAddTicketMessage } from "@/server/communication";
import type { AddTicketMessageInput } from "@/modules/communication/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON body (Doc-4H §HB-4.3 — snake_case wire field names). */
interface AddTicketMessageBody {
  body?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input (the command validates). */
function toInput(id: string, body: AddTicketMessageBody): AddTicketMessageInput {
  return {
    ticketId: id,
    body: typeof body.body === "string" ? body.body : "",
  };
}

/**
 * `POST /communication/tickets/{id}/ticket-messages`. `201` (no Location) · `401` · `400` (syntax /
 * missing Idempotency-Key) · `403` · `404` (out-of-scope collapse) · `409` (STATE — closed ticket).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: AddTicketMessageBody;
  try {
    body = (await request.json()) as AddTicketMessageBody;
  } catch {
    body = {};
  }

  const { status, body: responseBody } = await handleAddTicketMessage(toInput(id, body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers = status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined;
  return NextResponse.json(responseBody, { status, headers });
}
