// Thin Next.js App Router entry for `GET /communication/notifications/{id}` —
// `comm.get_notification.v1` (Doc-5H §5.1 → `200` found / `404` absent | non-recipient). ROUTING +
// COMPOSITION ONLY (REPOSITORY_STRUCTURE §8): the composition core (`src/server/communication`) owns
// the session/recipient gate; this entry only carries the path `{id}` and serializes the response.
// Reads are unaudited.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetNotification } from "@/server/communication";

/**
 * `GET /communication/notifications/{id}` — the recipient-scoped single-notification read. `200`
 * (found) · `401` · `404` (absent | non-recipient — H.9/R10 non-disclosure collapse).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const { status, body } = await handleGetNotification(id, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
