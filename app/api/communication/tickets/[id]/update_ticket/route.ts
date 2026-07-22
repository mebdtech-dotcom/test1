// Thin Next.js App Router entry for `POST /communication/tickets/{id}/update_ticket` —
// `comm.update_ticket.v1` (Doc-5H §7.1 → `200`). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
// The named state command (User/Admin; actor→transition authority enforced in the domain). The
// `Idempotency-Key` header is MANDATORY (Doc-5H §7.5). `target_status` is the command's own declared
// transition parameter (Doc-5H §7.1 — NOT a prohibited caller-asserted lifecycle-state field).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleUpdateTicket } from "@/server/communication";
import type {
  SupportTicketTargetStatus,
  UpdateTicketInput,
} from "@/modules/communication/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON body (Doc-4H §HB-4.2 — snake_case wire field names). */
interface UpdateTicketBody {
  target_status?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input (the command validates the enum). */
function toInput(id: string, body: UpdateTicketBody): UpdateTicketInput {
  return {
    ticketId: id,
    targetStatus: body.target_status as SupportTicketTargetStatus,
  };
}

/**
 * `POST /communication/tickets/{id}/update_ticket`. `200` · `401` · `400` (syntax / missing
 * Idempotency-Key) · `403` (no capability | User requesting a staff-only transition) · `404`
 * (out-of-scope collapse) · `409` (STATE illegal transition | CONFLICT lost race).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: UpdateTicketBody;
  try {
    body = (await request.json()) as UpdateTicketBody;
  } catch {
    body = {};
  }

  const { status, body: responseBody } = await handleUpdateTicket(toInput(id, body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers = status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined;
  return NextResponse.json(responseBody, { status, headers });
}
