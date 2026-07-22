// Thin Next.js App Router entry for `GET /communication/tickets/{id}` — `comm.get_ticket.v1` (Doc-5H
// §7.1 → `200` found / `404` absent | out-of-scope). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE
// §8): the composition core (`src/server/communication`) owns the session/actor gate + RLS scoping; this
// entry only carries the path `{id}` and serializes the response. Reads are unaudited.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetTicket } from "@/server/communication";

/**
 * `GET /communication/tickets/{id}` — the RLS-scoped single-ticket read (+ messages). `200` (found) ·
 * `401` · `404` (absent | out-of-scope — R10 non-disclosure collapse).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const { status, body } = await handleGetTicket(id, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
