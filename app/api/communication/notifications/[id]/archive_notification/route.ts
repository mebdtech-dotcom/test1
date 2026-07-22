// Thin Next.js App Router entry for `POST /communication/notifications/{id}/archive_notification` —
// `comm.archive_notification.v1` (Doc-5H §5.1 named state command · `200`). ROUTING + COMPOSITION
// ONLY (REPOSITORY_STRUCTURE §8): the composition core (`src/server/communication`) owns the session/
// recipient gate, the §B.6 idempotency wrap, and ALL validation; this entry only carries the path
// `{id}` + the mandatory `Idempotency-Key` header (Doc-5H §5.5). The command takes NO body fields.
// Archive advances inbox state (`read → archived`) and does NOT delete the notification (R12).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleArchiveNotification } from "@/server/communication";
import { parseIdempotencyKey } from "@/shared/http";

/**
 * `POST /communication/notifications/{id}/archive_notification` — `read → archived` ONLY (Doc-4H
 * Part-2 Patch Outcome A; recipient). `200` · `401` · `400` (missing Idempotency-Key) · `404`
 * (absent | non-recipient collapse) · `409` (STATE — unread; CONFLICT — lost race).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const { status, body } = await handleArchiveNotification(id, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers: Record<string, string> = {};
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
