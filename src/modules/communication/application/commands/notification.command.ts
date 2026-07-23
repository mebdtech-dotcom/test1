// M6 application (PRIVATE) — the BC-COMM-2 Notification write commands (Doc-4H §HB-2.1/§HB-2.3/
// §HB-2.4 + `Doc-4H_PassB_Part2_Patch_v1.0`; Doc-5H §5).
//
// ORCHESTRATION ONLY (owns no state): validate → (state adjudication) → write (repository) → append
// audit, all on the SAME caller-supplied transaction executor. THE M6 AUDITED-WRITE VARIANT (per the
// W3-COMM-1 house pattern): `business write + audit append` in ONE transaction, **NO outbox/event leg**
// — BC-COMM-2 emits NO Doc-2 §8 event (H.7/R11). Two invariants hold by sharing ONE tx: no business
// write without an audit row; no audit row without a successful write.
//
// AUDIT ACTIONS: the INTERIM `[ESC-COMM-AUDIT]` tokens (`domain/audit-actions.ts` — Doc-2_Patch_v1.0.9
// keeps BC-COMM-2 on the interim binding; see the disclosure block there). Never a hardcoded literal.
//
// ACTORS (Doc-4H H.2): `create_notification` = SYSTEM (consumed-event effect; no active org context —
// audit actor_type='system', actor_id NULL, org = the recipient org). Mark-read / archive = the USER
// recipient (no Admin surface in BC-COMM-2). Recipient scope is applied at load (H.5; the H.9 collapse).
//
// TRUST FIREWALL / MOAT (H.10): notifications TRANSPORT, never decide — no score computed, no
// routing/matching/award decision, consumed event payloads rendered as text only.

import { prisma, type DbExecutor } from "@/shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  archiveNotificationWrite,
  findNotificationBySourceEvent,
  insertNotification,
  loadNotification,
  markNotificationReadWrite,
} from "../../infrastructure/data/notification.repository";
import {
  adjudicateArchive,
  adjudicateMarkRead,
} from "../../domain/state-machines/notification.state-machine";
import { NOTIFICATION_ENTITY_TYPE, NotificationAuditAction } from "../../domain/audit-actions";
import { NotificationErrorCode } from "../../domain/error-codes";
import type {
  ArchiveNotificationInput,
  ArchiveNotificationOutcome,
  CreateNotificationInput,
  CreateNotificationOutcome,
  MarkNotificationReadInput,
  MarkNotificationReadOutcome,
  NotificationError,
  NotificationRecipientContext,
} from "../../contracts/types";

/** Injected Module 0 contract service — the ONLY audit-write surface (house rule; D7 rule 4). */
export interface NotificationCommandDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validationError(message: string): NotificationError {
  return { errorClass: "VALIDATION", errorCode: NotificationErrorCode.INVALID_INPUT, message };
}
function notFoundError(): NotificationError {
  // H.9/R10 non-disclosure: uniform, existence never confirmed (byte-identical to genuine absence).
  return {
    errorClass: "NOT_FOUND",
    errorCode: NotificationErrorCode.NOT_FOUND,
    message: "Not found.",
  };
}
function stateError(message: string): NotificationError {
  return { errorClass: "STATE", errorCode: NotificationErrorCode.INVALID_STATE, message };
}
function conflictError(): NotificationError {
  return {
    errorClass: "CONFLICT",
    errorCode: NotificationErrorCode.CONFLICT,
    message: "The notification was modified concurrently; reload and retry.",
  };
}

/** Prisma P2002 (unique-constraint violation) discrimination — the `notifications_source_event_key`
 *  dedup-index race backstop (the identity `provision-identity` precedent). */
function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" && e !== null && "code" in e && (e as { code?: unknown }).code === "P2002"
  );
}

/** Run `fn` in ONE transaction: if `db` is the base client, open an interactive tx; if it is already a
 *  tx executor (a caller-supplied tx), run inline (already atomic). Guarantees the create write + audit
 *  share a transaction however the out-of-wire consumer invokes the command (the M6 audited-write
 *  invariant: no business write without its audit row). */
async function withTx<T>(db: DbExecutor, fn: (tx: DbExecutor) => Promise<T>): Promise<T> {
  if ("$transaction" in db) {
    return db.$transaction((tx) => fn(tx));
  }
  return fn(db);
}

// ─────────────────────────────────────────────────────────────────────────────
// §HB-2.1 — comm.create_notification.v1 (SYSTEM consumed-event effect; OUT-OF-WIRE — Doc-5H §8).
// Event-consumer idempotent on `source_event_id` per recipient (H.8): re-delivery of the same §8 event
// yields the SAME row — no duplicate row, no duplicate audit (exactly-once over at-least-once).
// ─────────────────────────────────────────────────────────────────────────────

export async function createNotificationCommand(
  input: CreateNotificationInput,
  deps: NotificationCommandDeps,
  db: DbExecutor = prisma,
): Promise<CreateNotificationOutcome> {
  // (1) SYNTAX (Doc-4H §HB-2.1 Stage 1): ids uuid; channel fixed in_app (the only value — no wire
  //     field); title/body non-empty.
  if (typeof input.sourceEventId !== "string" || !UUID_PATTERN.test(input.sourceEventId)) {
    return { ok: false, error: validationError("source_event_id must be a UUID.") };
  }
  if (
    typeof input.recipientOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.recipientOrganizationId)
  ) {
    return { ok: false, error: validationError("recipient_organization_id must be a UUID.") };
  }
  if (input.recipientUserId !== null && !UUID_PATTERN.test(input.recipientUserId)) {
    return { ok: false, error: validationError("recipient_user_id must be a UUID or null.") };
  }
  if (typeof input.title !== "string" || input.title.trim().length === 0) {
    return { ok: false, error: validationError("title is required (non-empty).") };
  }
  if (typeof input.body !== "string" || input.body.trim().length === 0) {
    return { ok: false, error: validationError("body is required (non-empty).") };
  }

  // (2) H.8 IDEMPOTENCY — the (source_event_id, recipient) fan-out unit resolves to the SAME row on
  //     re-delivery: no duplicate row, NO duplicate audit.
  const existing = await findNotificationBySourceEvent(
    input.sourceEventId,
    input.recipientOrganizationId,
    input.recipientUserId,
    db,
  );
  if (existing !== null) {
    return { ok: true, result: existing, replayed: true };
  }

  // (3+4) WRITE + AUDIT — atomic in ONE transaction (no business write without its audit row — the M6
  //       audited-write invariant), and RACE-SAFE on the UNIQUE `notifications_source_event_key` dedup
  //       index: two concurrent re-deliveries can both pass the (2) probe, but only one insert wins; the
  //       loser trips P2002 → re-read the winner and return the H.8 replay (exactly-once over at-least-once).
  try {
    const created = await withTx(db, async (tx) => {
      // (3) WRITE — enters `unread` (the entry transition only — Doc-4H §HB-2.1 item 6).
      const row = await insertNotification(
        {
          sourceEventId: input.sourceEventId,
          recipientUserId: input.recipientUserId,
          recipientOrganizationId: input.recipientOrganizationId,
          title: input.title,
          body: input.body,
          payload: input.payload ?? null,
        },
        tx,
      );

      // (4) AUDIT — SAME tx; SYSTEM attribution (actor_id NULL — Doc-6B §3.1), org = the recipient org;
      //     interim `[ESC-COMM-AUDIT]` token. The `body` text is NEVER serialized (ids + meta only).
      await deps.appendAuditRecord(
        {
          actorId: null,
          actorType: "system",
          organizationId: input.recipientOrganizationId,
          entityType: NOTIFICATION_ENTITY_TYPE,
          entityId: row.notificationId,
          action: NotificationAuditAction.CREATED,
          oldValue: null,
          newValue: {
            status: "unread",
            source_event_id: input.sourceEventId,
            recipient_user_id: input.recipientUserId,
          },
        },
        tx,
      );

      return row;
    });

    return { ok: true, result: created, replayed: false };
  } catch (e) {
    // A concurrent re-delivery won the (source_event_id, recipient) race — the UNIQUE dedup index
    // rejected this insert. Re-read the winner on the BASE client (the tx above is rolled back) and
    // return the idempotent replay; anything else propagates.
    if (isUniqueViolation(e)) {
      const winner = await findNotificationBySourceEvent(
        input.sourceEventId,
        input.recipientOrganizationId,
        input.recipientUserId,
        prisma,
      );
      if (winner !== null) {
        return { ok: true, result: winner, replayed: true };
      }
    }
    throw e;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// §HB-2.3 — comm.mark_notification_read.v1 (recipient; `unread → read`).
// ─────────────────────────────────────────────────────────────────────────────

export async function markNotificationReadCommand(
  input: MarkNotificationReadInput,
  ctx: NotificationRecipientContext,
  deps: NotificationCommandDeps,
  db: DbExecutor = prisma,
): Promise<MarkNotificationReadOutcome> {
  // (1) SYNTAX.
  if (typeof input.notificationId !== "string" || !UUID_PATTERN.test(input.notificationId)) {
    return { ok: false, error: validationError("id must be a UUID.") };
  }

  // (2) SCOPE (H.9 collapse) — recipient-scoped load; absent/non-recipient ⇒ NOT_FOUND (never
  //     AUTHORIZATION — existence never confirmed).
  const notification = await loadNotification(
    input.notificationId,
    { organizationId: ctx.activeOrgId, userId: ctx.userId },
    db,
  );
  if (notification === null) {
    return { ok: false, error: notFoundError() };
  }

  // (3) STATE — the machine adjudicates (`unread → read`; `read → read` idempotent no-op — no write,
  //     no audit; `archived` illegal ⇒ STATE, distinct from CONFLICT).
  const decision = adjudicateMarkRead(notification.status);
  if (decision.kind === "illegal_state") {
    return { ok: false, error: stateError(decision.message) };
  }
  if (decision.kind === "noop") {
    return {
      ok: true,
      result: {
        notificationId: notification.notificationId,
        status: "read",
        readAt: notification.readAt as Date,
      },
    };
  }

  // (4) WRITE — CAS on `read_at IS NULL`; lost race ⇒ CONFLICT (distinct from STATE).
  const write = await markNotificationReadWrite(notification.notificationId, ctx.userId, db);
  if (write.outcome === "conflict") {
    return { ok: false, error: conflictError() };
  }

  // (5) AUDIT — atomic; interim `notification_marked_read` (`[ESC-COMM-AUDIT]`).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: NOTIFICATION_ENTITY_TYPE,
      entityId: notification.notificationId,
      action: NotificationAuditAction.MARKED_READ,
      oldValue: { status: "unread" },
      newValue: { status: "read" },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: { notificationId: notification.notificationId, status: "read", readAt: write.at },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §HB-2.4 (PATCHED — Outcome A) — comm.archive_notification.v1 (recipient; `read → archived` ONLY).
// ─────────────────────────────────────────────────────────────────────────────

export async function archiveNotificationCommand(
  input: ArchiveNotificationInput,
  ctx: NotificationRecipientContext,
  deps: NotificationCommandDeps,
  db: DbExecutor = prisma,
): Promise<ArchiveNotificationOutcome> {
  // (1) SYNTAX.
  if (typeof input.notificationId !== "string" || !UUID_PATTERN.test(input.notificationId)) {
    return { ok: false, error: validationError("id must be a UUID.") };
  }

  // (2) SCOPE (H.9 collapse).
  const notification = await loadNotification(
    input.notificationId,
    { organizationId: ctx.activeOrgId, userId: ctx.userId },
    db,
  );
  if (notification === null) {
    return { ok: false, error: notFoundError() };
  }

  // (3) STATE — archive ONLY from `read` (Patch Outcome A): `unread → archived` illegal ⇒ STATE;
  //     `archived → archived` idempotent no-op (terminal — no write, no audit).
  const decision = adjudicateArchive(notification.status);
  if (decision.kind === "illegal_state") {
    return { ok: false, error: stateError(decision.message) };
  }
  if (decision.kind === "noop") {
    return {
      ok: true,
      result: { notificationId: notification.notificationId, status: "archived" },
    };
  }

  // (4) WRITE — CAS `read → archived` (SD tuple; R12 — never a hard delete); lost race ⇒ CONFLICT.
  const write = await archiveNotificationWrite(notification.notificationId, ctx.userId, db);
  if (write.outcome === "conflict") {
    return { ok: false, error: conflictError() };
  }

  // (5) AUDIT — atomic; interim `notification_archived` (`[ESC-COMM-AUDIT]`).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: NOTIFICATION_ENTITY_TYPE,
      entityId: notification.notificationId,
      action: NotificationAuditAction.ARCHIVED,
      oldValue: { status: "read" },
      newValue: { status: "archived" },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { notificationId: notification.notificationId, status: "archived" } };
}
