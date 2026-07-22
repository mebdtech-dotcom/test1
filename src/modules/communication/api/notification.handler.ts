// M6 api (PRIVATE) — the HTTP-handler WIRE MAPPING for the BC-COMM-2 Notification caller-facing
// contracts (Doc-4H §HB-2.2…2.4 → Doc-5H §5.1 wire face). Maps the in-process outcomes to the Doc-5A
// wire envelope (§5.6 success / §6.1 error), choosing the §6.2 status. Owns NO orchestration and
// touches NO session/transaction — the app-layer composition edge (`src/server/communication`)
// resolves the recipient, runs the command/query inside the RLS-scoped tx, then hands the resolved
// outcome here. Pure (no I/O).
//
// `comm.create_notification.v1` is OUT-OF-WIRE (Doc-5H §8 — no HTTP face in any protocol): it has NO
// mapper here by design; adding one would be an architecture change (flag-and-halt).
//
// Wire realization (Doc-5H §5.1, verbatim):
//   mark_notification_read → 200 (named state command `unread → read`).
//   archive_notification   → 200 (named state command `read → archived`; does not delete — R12).
//   get_notification       → 200 (found) / 404 (absent | non-recipient — H.9 collapse).
//   list_notifications     → 200 (recipient page) / 400 (SYNTAX — filter/cursor/page_size).
// Error class → status per Doc-5A §6.2 (`comm_` codes): VALIDATION→400 · NOT_FOUND→404 · STATE→409 ·
// CONFLICT→409. `retryable` is CLASS-driven: only CONFLICT (the OCC lost race) is retryable.

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import {
  NotificationErrorCode,
  type ArchiveNotificationOutcome,
  type ArchiveNotificationResult,
  type GetNotificationResult,
  type ListNotificationsOutcome,
  type ListNotificationsResult,
  type MarkNotificationReadOutcome,
  type MarkNotificationReadResult,
  type NotificationError,
  type NotificationView,
} from "@/modules/communication/contracts";

/** Map a resolved contract error → the Doc-5A §6.1 envelope (§6.2 status from the class). */
function errorFrom(error: NotificationError): WireResponse<never> {
  return errorResponse({
    error_class: error.errorClass,
    error_code: error.errorCode,
    message: error.message,
    retryable: error.errorClass === "CONFLICT",
  });
}

/** The no-context (fail-closed) `404` non-disclosure collapse (Doc-5A §6.6) — never leaks existence. */
function notFoundCollapse(): WireResponse<never> {
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: NotificationErrorCode.NOT_FOUND,
    message: "Not found.",
    retryable: false,
  });
}

/** `comm.mark_notification_read.v1` → `200` (Doc-5H §5.1). `null` = no active-org context → `404`. */
export function mapMarkNotificationRead(
  outcome: MarkNotificationReadOutcome | null,
): WireResponse<MarkNotificationReadResult> {
  if (outcome === null) return notFoundCollapse();
  if (!outcome.ok) return errorFrom(outcome.error);
  return successResponse(outcome.result, 200);
}

/** `comm.archive_notification.v1` → `200` (Doc-5H §5.1). `null` = no active-org context → `404`. */
export function mapArchiveNotification(
  outcome: ArchiveNotificationOutcome | null,
): WireResponse<ArchiveNotificationResult> {
  if (outcome === null) return notFoundCollapse();
  if (!outcome.ok) return errorFrom(outcome.error);
  return successResponse(outcome.result, 200);
}

/** `comm.get_notification.v1` → `200` (found) / `404` (absent | non-recipient — H.9 collapse, byte-
 *  identical to genuine absence). `null` = no context → the SAME `404` collapse. */
export function mapGetNotification(
  result: GetNotificationResult | null,
): WireResponse<NotificationView> {
  if (result === null || !result.found) return notFoundCollapse();
  return successResponse(result.notification, 200);
}

/** `comm.list_notifications.v1` → `200` (recipient page) / `400` (SYNTAX). `null` = no context → an
 *  EMPTY recipient page (a list never leaks context via a `404`; it scopes its result set). */
export function mapListNotifications(
  outcome: ListNotificationsOutcome | null,
): WireResponse<ListNotificationsResult> {
  if (outcome === null) {
    return successResponse({ items: [], pageInfo: { hasMore: false } }, 200);
  }
  if ("invalidInput" in outcome) {
    return errorResponse({
      error_class: "VALIDATION",
      error_code: NotificationErrorCode.INVALID_INPUT,
      message: "Invalid status filter, cursor, or page_size.",
      retryable: false,
    });
  }
  return successResponse(outcome, 200);
}
