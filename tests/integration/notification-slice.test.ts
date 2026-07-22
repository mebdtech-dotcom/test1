import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { ensureProvisioned, type AuthSession } from "../../src/server/auth";
import {
  handleArchiveNotification,
  handleGetNotification,
  handleListNotifications,
  handleMarkNotificationRead,
} from "../../src/server/communication";
import { createNotification } from "../../src/modules/communication/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";
import { uuidv7 } from "../../src/shared/ids";

// W3-COMM-2 — BC-COMM-2 Notifications conformance slice (Doc-4H §HB-2.1…2.4 + Part-2 Patch v1.0;
// Doc-5H §5/§8). Proves, against a REAL PostgreSQL: the out-of-wire System create (H.8 event-consumer
// idempotency on source_event_id per recipient), the recipient wire faces (mark-read / archive / get /
// list), the STRICT-LINEAR lifecycle (`unread → read → archived`; `unread → archived` illegal — Patch
// Outcome A), the H.9/R10 non-disclosure collapse, §B.6 idempotency replay, and the M6 audited-write
// variant (write + audit in ONE tx, NO §8 event; INTERIM `[ESC-COMM-AUDIT]` tokens). Audit rows are
// read via the RLS-bypassing superuser `prisma` connection — the assertion is existence + content.

const USER_AUTH = "01920000-0000-7000-8000-00000000e001";
const USER_EMAIL = "comm-notif-user@example.com";
const OTHER_AUTH = "01920000-0000-7000-8000-00000000e002";
const OTHER_EMAIL = "comm-notif-other@example.com";

/** Test-scoped seeded session resolver — stands in for the live Supabase round-trip (auth boundary). */
function seededSession(session: AuthSession): () => Promise<AuthSession | null> {
  return async () => session;
}

/** Audit rows for a notification (read via the superuser connection — audit SELECT is staff-only). */
async function auditRowsFor(entityId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType: "notifications", entityId },
    orderBy: { eventTime: "asc" },
  });
}

async function cleanupProvisioned(authUserId: string): Promise<void> {
  const user = await prisma.user.findFirst({ where: { authUserId } });
  if (user === null) return;
  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  const orgIds = [...new Set(memberships.map((m) => m.organizationId))];
  if (orgIds.length > 0) {
    await prisma.notification.deleteMany({
      where: { recipientOrganizationId: { in: orgIds } },
    });
  }
  await prisma.communicationCommandDedup.deleteMany({ where: { actorUserId: user.id } });
  await prisma.membership.deleteMany({ where: { userId: user.id } });
  if (orgIds.length > 0) await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
  await prisma.user.deleteMany({ where: { id: user.id } });
}

async function cleanupAll(): Promise<void> {
  await cleanupProvisioned(USER_AUTH);
  await cleanupProvisioned(OTHER_AUTH);
}

/** Provision the user and System-create one org-wide `unread` notification for its org. */
async function provisionWithNotification(
  session: AuthSession,
  sourceEventId: string = uuidv7(),
): Promise<{ notificationId: string; orgId: string; userId: string; sourceEventId: string }> {
  const provisioned = await ensureProvisioned(session);
  const created = await createNotification(
    {
      sourceEventId,
      recipientUserId: null, // org-wide recipient
      recipientOrganizationId: provisioned.organizationId!,
      title: "RFQ update",
      body: "A quotation was received on your RFQ.",
      payload: { rfq_id: uuidv7() },
    },
    { appendAuditRecord },
  );
  if (!created.ok) throw new Error("unreachable: expected a create success");
  return {
    notificationId: created.result.notificationId,
    orgId: provisioned.organizationId!,
    userId: provisioned.userId,
    sourceEventId,
  };
}

describe("W3-COMM-2 — comm notifications vertical (audit-on-write, real PostgreSQL)", () => {
  beforeEach(cleanupAll);
  afterAll(async () => {
    await cleanupAll();
    await prisma.$disconnect();
  });

  // ── 8C — the out-of-wire System create (Doc-5H §8; Doc-4H §HB-2.1) ─────────

  it("CREATE (System) → unread row + ONE notification_created audit (system actor, actor_id NULL)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { notificationId, orgId, sourceEventId } = await provisionWithNotification(session);

    const row = await prisma.notification.findFirst({ where: { id: notificationId } });
    expect(row).not.toBeNull();
    expect(row!.recipientOrganizationId).toBe(orgId);
    expect(row!.sourceEventId).toBe(sourceEventId);
    expect(row!.channel).toBe("in_app");
    expect(row!.readAt).toBeNull(); // derived `unread` entry state
    expect(row!.deletedAt).toBeNull();

    const audit = await auditRowsFor(notificationId);
    expect(audit).toHaveLength(1);
    expect(audit[0]!.action).toBe("notification_created");
    expect(audit[0]!.actorType).toBe("system");
    expect(audit[0]!.actorId).toBeNull();
    expect(audit[0]!.organizationId).toBe(orgId);
    // The notification body text is NEVER serialized into the ledger (ids + meta only).
    expect(JSON.stringify(audit[0]!.newValue)).not.toContain("quotation was received");
  });

  it("CREATE replay (H.8): same source_event_id + recipient → SAME row, no duplicate row/audit", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { notificationId, orgId, sourceEventId } = await provisionWithNotification(session);

    const replay = await createNotification(
      {
        sourceEventId,
        recipientUserId: null,
        recipientOrganizationId: orgId,
        title: "RFQ update",
        body: "A quotation was received on your RFQ.",
      },
      { appendAuditRecord },
    );
    if (!replay.ok) throw new Error("unreachable: expected an idempotent success");
    expect(replay.replayed).toBe(true);
    expect(replay.result.notificationId).toBe(notificationId);

    const rows = await prisma.notification.count({
      where: { sourceEventId, recipientOrganizationId: orgId },
    });
    expect(rows).toBe(1);
    expect(await auditRowsFor(notificationId)).toHaveLength(1); // no duplicate audit
  });

  it("CREATE validation: malformed source_event_id / empty title → VALIDATION", async () => {
    const bad = await createNotification(
      {
        sourceEventId: "not-a-uuid",
        recipientUserId: null,
        recipientOrganizationId: uuidv7(),
        title: "t",
        body: "b",
      },
      { appendAuditRecord },
    );
    expect(bad.ok).toBe(false);
    if (bad.ok) throw new Error("unreachable");
    expect(bad.error.errorClass).toBe("VALIDATION");
  });

  // ── 8C — the recipient wire faces (Doc-5H §5.1) ────────────────────────────

  it("MARK READ → 200 (unread → read) + audit; replay same key → same body, no dup audit; re-mark = no-op", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { notificationId } = await provisionWithNotification(session);
    const deps = {
      resolveSession: seededSession(session),
      ensureProvisioned,
      idempotencyKey: "k-read-1",
    };

    const first = await handleMarkNotificationRead(notificationId, deps);
    expect(first.status).toBe(200);
    if (!("result" in first.body)) throw new Error("unreachable: expected a success envelope");
    expect(first.body.result.status).toBe("read"); // camelCase result (Doc-5A Option B)
    expect(first.body.result.readAt).toBeTruthy();

    // §B.6 replay: same key → the STORED response (same original reference_id), no second audit.
    const replay = await handleMarkNotificationRead(notificationId, deps);
    if (!("result" in replay.body)) throw new Error("unreachable: expected a replay envelope");
    expect(replay.body.reference_id).toBe(first.body.reference_id);

    // Re-mark with a NEW key: `read → read` idempotent no-op — 200, still ONE audit row.
    const again = await handleMarkNotificationRead(notificationId, {
      ...deps,
      idempotencyKey: "k-read-2",
    });
    expect(again.status).toBe(200);

    const audit = await auditRowsFor(notificationId);
    const marked = audit.filter((a) => a.action === "notification_marked_read");
    expect(marked).toHaveLength(1);
    expect(marked[0]!.actorType).toBe("user");
    expect(marked[0]!.oldValue).toMatchObject({ status: "unread" });
    expect(marked[0]!.newValue).toMatchObject({ status: "read" });
  });

  it("ARCHIVE from unread → 409 STATE (Patch Outcome A: archive only from read)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { notificationId } = await provisionWithNotification(session);

    const res = await handleArchiveNotification(notificationId, {
      resolveSession: seededSession(session),
      ensureProvisioned,
      idempotencyKey: "k-arch-illegal",
    });
    expect(res.status).toBe(409);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("STATE");
  });

  it("ARCHIVE from read → 200 (SD tuple set; row NEVER deleted — R12) + audit; archived → read = 409 STATE", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { notificationId } = await provisionWithNotification(session);
    const base = { resolveSession: seededSession(session), ensureProvisioned };

    await handleMarkNotificationRead(notificationId, { ...base, idempotencyKey: "k-r" });
    const archived = await handleArchiveNotification(notificationId, {
      ...base,
      idempotencyKey: "k-a",
    });
    expect(archived.status).toBe(200);
    if (!("result" in archived.body)) throw new Error("unreachable: expected a success envelope");
    expect(archived.body.result.status).toBe("archived");

    // R12: archive advances inbox state — the row persists with the SD tuple, never hard-deleted.
    const row = await prisma.notification.findFirst({ where: { id: notificationId } });
    expect(row).not.toBeNull();
    expect(row!.deletedAt).not.toBeNull();
    expect(row!.deleteReason).toBe("archived");

    const audit = await auditRowsFor(notificationId);
    expect(audit.filter((a) => a.action === "notification_archived")).toHaveLength(1);

    // Terminal: an archived notification cannot be marked read (STATE, distinct from CONFLICT).
    const illegal = await handleMarkNotificationRead(notificationId, {
      ...base,
      idempotencyKey: "k-r2",
    });
    expect(illegal.status).toBe(409);
    if (!("error" in illegal.body)) throw new Error("unreachable: expected an error envelope");
    expect(illegal.body.error.error_class).toBe("STATE");

    // Re-archive with a new key: `archived → archived` idempotent no-op — 200, still ONE audit.
    const rearchive = await handleArchiveNotification(notificationId, {
      ...base,
      idempotencyKey: "k-a2",
    });
    expect(rearchive.status).toBe(200);
    expect(
      (await auditRowsFor(notificationId)).filter((a) => a.action === "notification_archived"),
    ).toHaveLength(1);
  });

  it("GET → 200 for the recipient (archived still readable by id); NON-recipient → 404 collapse (H.9)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { notificationId, orgId } = await provisionWithNotification(session);
    const base = { resolveSession: seededSession(session), ensureProvisioned };

    const got = await handleGetNotification(notificationId, base);
    expect(got.status).toBe(200);
    if (!("result" in got.body)) throw new Error("unreachable: expected a success envelope");
    expect(got.body.result.status).toBe("unread");
    expect(got.body.result.recipientOrganizationId).toBe(orgId);

    // A different org's user: the SAME uniform 404 as a genuine absence (existence never confirmed).
    const other: AuthSession = { authUserId: OTHER_AUTH, email: OTHER_EMAIL };
    await ensureProvisioned(other);
    const denied = await handleGetNotification(notificationId, {
      resolveSession: seededSession(other),
      ensureProvisioned,
    });
    expect(denied.status).toBe(404);
    const absent = await handleGetNotification(uuidv7(), {
      resolveSession: seededSession(other),
      ensureProvisioned,
    });
    expect(absent.status).toBe(404);
    if (!("error" in denied.body) || !("error" in absent.body)) {
      throw new Error("unreachable: expected error envelopes");
    }
    // Byte-identical error object (existence never confirmed) — only reference_id differs per request.
    expect(JSON.stringify(denied.body.error)).toBe(JSON.stringify(absent.body.error));

    // Archived stays recipient-readable by id (archive is an inbox state — R12) [rc].
    await handleMarkNotificationRead(notificationId, { ...base, idempotencyKey: "k-g-r" });
    await handleArchiveNotification(notificationId, { ...base, idempotencyKey: "k-g-a" });
    const gotArchived = await handleGetNotification(notificationId, base);
    expect(gotArchived.status).toBe(200);
    if (!("result" in gotArchived.body)) throw new Error("unreachable");
    expect(gotArchived.body.result.status).toBe("archived");
  });

  it("LIST → recipient-scoped; unfiltered excludes archived; filter[status] partitions; keyset paginates", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;
    const base = { resolveSession: seededSession(session), ensureProvisioned };

    // Three org-wide notifications: one left unread, one read, one archived.
    const ids: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const created = await createNotification(
        {
          sourceEventId: uuidv7(),
          recipientUserId: null,
          recipientOrganizationId: orgId,
          title: `n-${i}`,
          body: `body-${i}`,
        },
        { appendAuditRecord },
      );
      if (!created.ok) throw new Error("unreachable");
      ids.push(created.result.notificationId);
    }
    await handleMarkNotificationRead(ids[1]!, { ...base, idempotencyKey: "k-l-r1" });
    await handleMarkNotificationRead(ids[2]!, { ...base, idempotencyKey: "k-l-r2" });
    await handleArchiveNotification(ids[2]!, { ...base, idempotencyKey: "k-l-a2" });

    // Another org's notification must NEVER be enumerated (scoped assertion).
    const other: AuthSession = { authUserId: OTHER_AUTH, email: OTHER_EMAIL };
    const otherProvisioned = await ensureProvisioned(other);
    const foreign = await createNotification(
      {
        sourceEventId: uuidv7(),
        recipientUserId: null,
        recipientOrganizationId: otherProvisioned.organizationId!,
        title: "foreign",
        body: "foreign body",
      },
      { appendAuditRecord },
    );
    if (!foreign.ok) throw new Error("unreachable");

    // Unfiltered = the live inbox (unread + read; archived excluded) — recipient-scoped.
    const all = await handleListNotifications({}, base);
    expect(all.status).toBe(200);
    if (!("result" in all.body)) throw new Error("unreachable: expected a success envelope");
    const listedIds = all.body.result.items.map((i) => i.notificationId);
    expect(listedIds).toContain(ids[0]!);
    expect(listedIds).toContain(ids[1]!);
    expect(listedIds).not.toContain(ids[2]!); // archived excluded from the unfiltered inbox
    expect(listedIds).not.toContain(foreign.result.notificationId); // never another recipient's row

    // filter[status]=archived reaches the archived partition (the frozen §HB-2.2 filter enum).
    const archivedPage = await handleListNotifications({ status: "archived" }, base);
    if (!("result" in archivedPage.body)) throw new Error("unreachable");
    expect(archivedPage.body.result.items.map((i) => i.notificationId)).toEqual([ids[2]!]);

    // Keyset pagination: page_size=1 → hasMore + cursor walks the live inbox in id order.
    const page1 = await handleListNotifications({ pageSize: 1 }, base);
    if (!("result" in page1.body)) throw new Error("unreachable");
    expect(page1.body.result.items).toHaveLength(1);
    expect(page1.body.result.pageInfo.hasMore).toBe(true);
    const page2 = await handleListNotifications(
      { pageSize: 1, cursor: page1.body.result.pageInfo.nextCursor! },
      base,
    );
    if (!("result" in page2.body)) throw new Error("unreachable");
    expect(page2.body.result.items[0]!.notificationId).not.toBe(
      page1.body.result.items[0]!.notificationId,
    );

    // SYNTAX 400: bad status filter / malformed cursor / over-max page_size — never clamped.
    const badFilter = await handleListNotifications(
      { status: "deleted" as unknown as "read" },
      base,
    );
    expect(badFilter.status).toBe(400);
    const badCursor = await handleListNotifications({ cursor: "!!!not-a-cursor" }, base);
    expect(badCursor.status).toBe(400);
    const overMax = await handleListNotifications({ pageSize: 1000000 }, base);
    expect(overMax.status).toBe(400);
  });

  it("USER-TARGETED row: invisible to a different user even in scope-adjacent reads (H.5 pair scope)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const provisioned = await ensureProvisioned(session);
    // Targeted at a DIFFERENT user id within the same org — the acting user is NOT the recipient.
    const created = await createNotification(
      {
        sourceEventId: uuidv7(),
        recipientUserId: uuidv7(),
        recipientOrganizationId: provisioned.organizationId!,
        title: "targeted",
        body: "targeted body",
      },
      { appendAuditRecord },
    );
    if (!created.ok) throw new Error("unreachable");

    const base = { resolveSession: seededSession(session), ensureProvisioned };
    const got = await handleGetNotification(created.result.notificationId, base);
    expect(got.status).toBe(404); // H.9 collapse — not this user's notification
    const list = await handleListNotifications({}, base);
    if (!("result" in list.body)) throw new Error("unreachable");
    expect(list.body.result.items.map((i) => i.notificationId)).not.toContain(
      created.result.notificationId,
    );
  });

  // ── 8C — wire preconditions ────────────────────────────────────────────────

  it("MUTATIONS require the Idempotency-Key header (400) and an authenticated session (401)", async () => {
    const session: AuthSession = { authUserId: USER_AUTH, email: USER_EMAIL };
    const { notificationId } = await provisionWithNotification(session);

    const noKey = await handleMarkNotificationRead(notificationId, {
      resolveSession: seededSession(session),
      ensureProvisioned,
      idempotencyKey: null,
    });
    expect(noKey.status).toBe(400);

    const anon = await handleMarkNotificationRead(notificationId, {
      resolveSession: async () => null,
      ensureProvisioned,
      idempotencyKey: "k-anon",
    });
    expect(anon.status).toBe(401);

    const anonRead = await handleGetNotification(notificationId, {
      resolveSession: async () => null,
      ensureProvisioned,
    });
    expect(anonRead.status).toBe(401);
  });
});
