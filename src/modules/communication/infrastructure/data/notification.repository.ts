// M6 infrastructure (PRIVATE) — thin Prisma repository over `communication.notifications` (Doc-6H
// §3.2). M6 reading/writing its OWN schema (One Module, One Owner); no module outside `communication`
// imports this file (reached via the M6 contracts facade).
//
// SCOPE is enforced in the APP LAYER (authorization is app-layer; RLS is the defense-in-depth backstop
// — CLAUDE.md §2). Recipient scope (Doc-4H H.5): a notification is visible/mutable only to its
// recipient — `recipient_organization_id` = the SERVER-RESOLVED active org AND, when the row is
// user-targeted (`recipient_user_id` NOT NULL), `recipient_user_id` = the acting user. An org-wide
// notification (`recipient_user_id` NULL) is visible to any active member of the recipient org
// [realization of H.5's recipient_user_id/recipient_organization_id pair]. The org predicate is applied
// HERE too (the app DB connection may be the RLS-bypassing schema owner); RLS (Doc-6H §3.x) is the
// backstop, proven by the restricted-role RLS suite.
//
// Lifecycle is COLUMN-DERIVED (Doc-6H §3.2; `notification.state-machine.ts` is the single authority):
// archive = SOFT-DELETE (`deleted_at` set — R12: the row is NEVER hard-deleted). Archived rows remain
// recipient-readable by id and via the `archived` list filter (the frozen §HB-2.2 filter enum
// enumerates `archived` — an archived notification is an inbox state, not a hidden row) [rc]; the
// UNFILTERED list excludes archived rows (the live-inbox default, CHK-5A-073 SD exclusion) [rc].

import { prisma, type DbExecutor } from "@/shared/db";
import { uuidv7 } from "@/shared/ids";
import {
  deriveNotificationStatus,
  type NotificationStatusValue,
} from "../../domain/state-machines/notification.state-machine";
import type { NotificationView } from "../../contracts/types";

/** The recipient scope a read/write is gated on (Doc-4H H.5 — app-layer primary, RLS backstop). */
export interface RecipientScope {
  /** The SERVER-RESOLVED active org (the tenant anchor — Invariant #5). */
  organizationId: string;
  /** The acting `identity.users` id — gates user-targeted rows. */
  userId: string;
}

/** Map a `communication.notifications` row to the contracts projection (status derived). */
interface NotificationRow {
  id: string;
  recipientUserId: string | null;
  recipientOrganizationId: string;
  sourceEventId: string | null;
  channel: "in_app";
  title: string | null;
  body: string | null;
  payloadJsonb: unknown;
  readAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
}

const ROW_SELECT = {
  id: true,
  recipientUserId: true,
  recipientOrganizationId: true,
  sourceEventId: true,
  channel: true,
  title: true,
  body: true,
  payloadJsonb: true,
  readAt: true,
  createdAt: true,
  deletedAt: true,
} as const;

function toView(row: NotificationRow): NotificationView {
  return {
    notificationId: row.id,
    recipientUserId: row.recipientUserId,
    recipientOrganizationId: row.recipientOrganizationId,
    sourceEventId: row.sourceEventId,
    channel: row.channel,
    title: row.title,
    body: row.body,
    payload: row.payloadJsonb ?? null,
    status: deriveNotificationStatus(row),
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

/** The recipient predicate (H.5): own-org AND (org-wide OR targeted at the acting user). */
function recipientWhere(scope: RecipientScope) {
  return {
    recipientOrganizationId: scope.organizationId,
    OR: [{ recipientUserId: null }, { recipientUserId: scope.userId }],
  };
}

/**
 * Load one recipient-scoped notification for a state command or the get read. Archived (soft-deleted)
 * rows ARE returned (archive is an inbox state — R12; the command adjudicates the edge). Returns `null`
 * when absent OR out-of-scope — the caller collapses `null` to the H.9/R10 NOT_FOUND protected-fact.
 */
export async function loadNotification(
  notificationId: string,
  scope: RecipientScope,
  db: DbExecutor = prisma,
): Promise<NotificationView | null> {
  const row = await db.notification.findFirst({
    where: { id: notificationId, ...recipientWhere(scope) },
    select: ROW_SELECT,
  });
  return row === null ? null : toView(row);
}

/**
 * H.8 event-consumer idempotency probe (`comm.create_notification.v1` — Doc-4A §16): the same consumed
 * §8 event + the same recipient resolves to the SAME `notifications` row (exactly-once effect over
 * at-least-once delivery). The fan-out unit key is (source_event_id, recipient org, recipient user).
 */
export async function findNotificationBySourceEvent(
  sourceEventId: string,
  recipientOrganizationId: string,
  recipientUserId: string | null,
  db: DbExecutor = prisma,
): Promise<NotificationView | null> {
  const row = await db.notification.findFirst({
    where: { sourceEventId, recipientOrganizationId, recipientUserId },
    select: ROW_SELECT,
  });
  return row === null ? null : toView(row);
}

/** The create-notification write input (Doc-4H §HB-2.1 request schema; recipients pre-resolved). */
export interface CreateNotificationWriteInput {
  sourceEventId: string;
  recipientUserId: string | null;
  recipientOrganizationId: string;
  title: string;
  body: string;
  payload: unknown;
}

/**
 * Insert one `notifications` row at the derived `unread` entry state (Doc-4H §HB-2.1 item 6 — create
 * is the entry transition only; `read_at`/`deleted_at` NULL). System-authored (`created_by` NULL —
 * Doc-6B §3.1 System attribution is on the AUDIT row, not a user column). ID is an app-minted UUIDv7.
 */
export async function insertNotification(
  input: CreateNotificationWriteInput,
  db: DbExecutor = prisma,
): Promise<NotificationView> {
  const row = await db.notification.create({
    data: {
      id: uuidv7(),
      recipientUserId: input.recipientUserId,
      recipientOrganizationId: input.recipientOrganizationId,
      sourceEventId: input.sourceEventId,
      channel: "in_app",
      title: input.title,
      body: input.body,
      ...(input.payload !== null && input.payload !== undefined
        ? { payloadJsonb: input.payload as object }
        : {}),
    },
    select: ROW_SELECT,
  });
  return toView(row);
}

/** Outcome of a notification CAS state write — `conflict` = a concurrent write advanced the state
 *  between the command's read and this write (CONFLICT, distinct from STATE). */
export type NotificationStateWrite = { outcome: "updated"; at: Date } | { outcome: "conflict" };

/**
 * CAS `unread → read` (Doc-4H §HB-2.3): a conditional UPDATE `WHERE id = ? AND read_at IS NULL AND
 * deleted_at IS NULL` setting `read_at`. Zero rows ⇒ a concurrent transition won ⇒ `conflict`. The
 * state machine adjudicated the edge upstream (the command); recipient scope was applied at load.
 */
export async function markNotificationReadWrite(
  notificationId: string,
  actorUserId: string,
  db: DbExecutor = prisma,
): Promise<NotificationStateWrite> {
  const at = new Date();
  const result = await db.notification.updateMany({
    where: { id: notificationId, readAt: null, deletedAt: null },
    data: { readAt: at, updatedAt: at, updatedBy: actorUserId },
  });
  return result.count === 1 ? { outcome: "updated", at } : { outcome: "conflict" };
}

/**
 * CAS `read → archived` (Doc-4H §HB-2.4, PATCHED — archive only from `read`): a conditional UPDATE
 * `WHERE id = ? AND read_at IS NOT NULL AND deleted_at IS NULL` setting the SD tuple (SD = archive;
 * R12 — never a hard delete). Zero rows ⇒ `conflict`.
 */
export async function archiveNotificationWrite(
  notificationId: string,
  actorUserId: string,
  db: DbExecutor = prisma,
): Promise<NotificationStateWrite> {
  const at = new Date();
  const result = await db.notification.updateMany({
    where: { id: notificationId, readAt: { not: null }, deletedAt: null },
    data: {
      deletedAt: at,
      deletedBy: actorUserId,
      deleteReason: "archived", // [rc] SD = archive (Doc-2 §10.7); the reason token names the frozen semantics.
      updatedAt: at,
      updatedBy: actorUserId,
    },
  });
  return result.count === 1 ? { outcome: "updated", at } : { outcome: "conflict" };
}

/**
 * Fetch one keyset-paginated page of recipient-scoped notifications, ordered by `id` asc (UUIDv7 ⇒
 * stable chronological order). `status` is the allowlisted filter (Doc-4A §9.6; enum
 * unread|read|archived). UNFILTERED ⇒ live rows only (`deleted_at IS NULL` — the inbox default);
 * `archived` ⇒ soft-deleted rows (the frozen filter enum makes archived rows reachable) [rc].
 */
export async function listNotificationsPage(
  filter: { status?: NotificationStatusValue; afterId: string | null; scope: RecipientScope },
  limit: number,
  db: DbExecutor = prisma,
): Promise<NotificationView[]> {
  const statusWhere =
    filter.status === "unread"
      ? { readAt: null, deletedAt: null }
      : filter.status === "read"
        ? { readAt: { not: null }, deletedAt: null }
        : filter.status === "archived"
          ? { deletedAt: { not: null } }
          : { deletedAt: null }; // unfiltered inbox default — live rows only.

  const rows = await db.notification.findMany({
    where: {
      ...recipientWhere(filter.scope),
      ...statusWhere,
      ...(filter.afterId !== null ? { id: { gt: filter.afterId } } : {}),
    },
    orderBy: { id: "asc" },
    take: limit,
    select: ROW_SELECT,
  });
  return rows.map(toView);
}
