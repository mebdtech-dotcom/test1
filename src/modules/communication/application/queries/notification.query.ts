// M6 application (PRIVATE) — the BC-COMM-2 Notification read queries (Doc-4H §HB-2.2; Doc-5H §5.3).
// Orchestration only; owns NO state. Reads are UNAUDITED (Doc-4A §17.1), side-effect-free, emit no
// event. Recipient scope (H.5) is applied in the repository predicates (app-layer primary; RLS
// backstop) — a non-recipient get resolves `found: false` ⇒ the wire NOT_FOUND collapse (H.9, byte-
// identical to genuine absence); the list never enumerates another recipient's rows.

import { prisma, type DbExecutor } from "@/shared/db";
import { configValueQuery, type ConfigValueQuery } from "@/modules/core/contracts";
import {
  listNotificationsPage,
  loadNotification,
} from "../../infrastructure/data/notification.repository";
import { policyIntegerValue } from "../../domain/value-objects/policy-duration";
import type {
  GetNotificationResult,
  ListNotificationsInput,
  ListNotificationsOutcome,
  NotificationRecipientContext,
} from "../../contracts/types";

// The full Doc-4A §18.2 reference form for the page-size bound (Doc-3 v1.5; read via M0, never a literal).
const LIST_PAGE_SIZE_MAX_KEY =
  "core.system_configuration.communication.list_page_size_max" as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOTIFICATION_STATUSES: ReadonlySet<string> = new Set(["unread", "read", "archived"]);

/** The recipient scope both reads run under (server-resolved — never client input). */
export type NotificationReadScope = Pick<NotificationRecipientContext, "userId" | "activeOrgId">;

/** `comm.get_notification.v1` (Doc-4H §HB-2.2) — the single-notification recipient read. Absent /
 *  non-recipient ⇒ `found: false` (the wire `404` collapse — H.9). Archived rows remain readable by
 *  their recipient (archive is an inbox state, not a hidden row — R12) [rc]. */
export async function getNotification(
  notificationId: string,
  scope: NotificationReadScope,
  db: DbExecutor = prisma,
): Promise<GetNotificationResult> {
  // SYNTAX-invalid id can never resolve to a row ⇒ the same non-disclosure `found: false`.
  if (typeof notificationId !== "string" || !UUID_PATTERN.test(notificationId)) {
    return { found: false };
  }
  const notification = await loadNotification(
    notificationId,
    { organizationId: scope.activeOrgId, userId: scope.userId },
    db,
  );
  if (notification === null) return { found: false };
  return { found: true, notification };
}

interface CursorPayload {
  id: string;
}

/** Opaque keyset cursor [realization convention]: base64url of `{ id }` — the exact `id` keyset
 *  position (UUIDv7 total order). A client MUST NOT construct/decode one (Doc-5A §8.2). */
function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const record = parsed as Record<string, unknown>;
  if (typeof record.id !== "string" || !UUID_PATTERN.test(record.id)) return null;
  return record.id;
}

/** Injectable POLICY reader (the M0 config service) — defaults to the concrete; injectable for tests. */
export interface ListNotificationsDeps {
  configValueQuery: ConfigValueQuery;
}

/**
 * `comm.list_notifications.v1` (Doc-4H §HB-2.2) — the recipient-scoped keyset-paginated inbox read.
 * `status` is the allowlisted filter (§9.6; enum unread|read|archived); `page_size` is bounded by
 * `communication.list_page_size_max` (read via M0, never a literal; over-max ⇒ SYNTAX 400, never
 * clamped). Keyset "fetch N+1, trim" so `has_more` is computed from the SAME scoped set as `items`.
 */
export async function listNotifications(
  input: ListNotificationsInput,
  scope: NotificationReadScope,
  db: DbExecutor = prisma,
  deps: ListNotificationsDeps = { configValueQuery },
): Promise<ListNotificationsOutcome> {
  // SYNTAX — `status` allowlist (Doc-4A §9.6).
  if (input.status !== undefined && !NOTIFICATION_STATUSES.has(input.status)) {
    return { invalidInput: true };
  }

  // page_size bound — the `communication.list_page_size_max` POLICY value (read via M0).
  const cfg = await deps.configValueQuery({ key: LIST_PAGE_SIZE_MAX_KEY }, db);
  const pageSizeMax = policyIntegerValue(cfg.value, "communication.list_page_size_max POLICY");

  const pageSize = input.pageSize ?? pageSizeMax;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > pageSizeMax) {
    return { invalidInput: true }; // over-max is a SYNTAX 400, never clamped (Doc-5A §8.5).
  }

  // cursor — opaque keyset token (Doc-5A §8.1/§8.2); malformed ⇒ SYNTAX 400 (never guessed/repaired).
  let afterId: string | null = null;
  if (input.cursor !== undefined) {
    afterId = decodeCursor(input.cursor);
    if (afterId === null) {
      return { invalidInput: true };
    }
  }

  const rows = await listNotificationsPage(
    {
      ...(input.status !== undefined ? { status: input.status } : {}),
      afterId,
      scope: { organizationId: scope.activeOrgId, userId: scope.userId },
    },
    pageSize + 1,
    db,
  );

  const hasMore = rows.length > pageSize;
  const items = hasMore ? rows.slice(0, pageSize) : rows;
  const last = items[items.length - 1];
  const pageInfo =
    hasMore && last !== undefined
      ? { hasMore: true, nextCursor: encodeCursor({ id: last.notificationId }) }
      : { hasMore: false };

  return { items, pageInfo };
}
