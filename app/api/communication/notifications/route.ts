// Thin Next.js App Router entry for `GET /communication/notifications` — `comm.list_notifications.v1`
// (Doc-5H §5.1 → `200` recipient page / `400` SYNTAX). ROUTING + COMPOSITION ONLY
// (REPOSITORY_STRUCTURE §8): the composition core (`src/server/communication`) owns the session/
// recipient gate + ALL validation; this entry only extracts the wire grammar (Doc-5A §8:
// `filter[status]`, `cursor`, `page_size`) and carries the response. Reads are unaudited.
//
// NOTE: BC-COMM-2 has NO caller-facing create — `comm.create_notification.v1` is OUT-OF-WIRE
// (Doc-5H §8); no POST exists on this collection by design.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleListNotifications } from "@/server/communication";
import type {
  ListNotificationsInput,
  NotificationStatusValue,
} from "@/modules/communication/contracts";

/**
 * `GET /communication/notifications` — the recipient-scoped inbox list. `200` · `401` · `400`
 * (SYNTAX — filter/cursor/page_size).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("filter[status]");
  const cursor = url.searchParams.get("cursor");
  const pageSize = url.searchParams.get("page_size");

  const input: ListNotificationsInput = {
    ...(statusFilter !== null ? { status: statusFilter as NotificationStatusValue } : {}),
    ...(cursor !== null ? { cursor } : {}),
    ...(pageSize !== null ? { pageSize: Number(pageSize) } : {}),
  };

  const { status, body } = await handleListNotifications(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (status === 401) headers["WWW-Authenticate"] = "Bearer";
  return NextResponse.json(body, { status, headers });
}
