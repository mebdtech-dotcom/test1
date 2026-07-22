// Thin Next.js App Router entry for `POST /communication/tickets/{id}/close_ticket` —
// `comm.close_ticket.v1` (Doc-5H §7.1 → `200`). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
// The named terminal command (User/Admin; only a `resolved` ticket closable — `resolved → closed`). The
// `Idempotency-Key` header is MANDATORY (Doc-5H §7.5).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCloseTicket } from "@/server/communication";
import type { CloseTicketInput } from "@/modules/communication/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/**
 * `POST /communication/tickets/{id}/close_ticket`. `200` · `401` · `400` (missing Idempotency-Key) ·
 * `403` · `404` (out-of-scope collapse) · `409` (STATE not-resolved | CONFLICT lost race).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const input: CloseTicketInput = { ticketId: id };

  const { status, body: responseBody } = await handleCloseTicket(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers = status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined;
  return NextResponse.json(responseBody, { status, headers });
}
