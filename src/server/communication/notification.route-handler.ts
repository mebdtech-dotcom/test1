// App-layer COMPOSITION for the BC-COMM-2 Notification caller-facing surface (W3-COMM-2;
// REPOSITORY_STRUCTURE §5/§8 — `src/server` wires Supabase Auth ↔ active-org context ↔ M6 contracts).
// This is where the M0 `appendAuditRecord` concrete is INJECTED into the M6 commands (boundary-legal —
// M6 depends only on the M0 contract TYPE) and where the RECIPIENT actor is resolved:
//
//   • USER (recipient) leg ONLY — Doc-4H H.2: "No Admin surface in BC-COMM-2." `withActiveOrg` sets
//     the RLS GUCs; recipient scope = the server-resolved (userId, activeOrgId) pair applied in the
//     repository predicates (app-layer primary; the `notifications_recipient` RLS is the backstop).
//   • NO slug gate — Doc-2 §7 enumerates NO distinct notification read/state slug (`[ESC-COMM-SLUG]`,
//     Doc-4H H.5); no slug is invented and none is borrowed. The gate is: authenticated User +
//     server-resolved active org + the recipient row predicate (H.9 collapse otherwise).
//   • `comm.create_notification.v1` is OUT-OF-WIRE (Doc-5H §8) — it has NO composition here by design;
//     future §8-event consumers invoke the contract service directly (System leg).
//
// Both mutations are `Idempotency: required` (Doc-5H §5.5 — the M6 §B.6 dedup wrap). Reads are
// unaudited, side-effect-free, and recipient-scoped.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  archiveNotification,
  getNotification,
  listNotifications,
  mapArchiveNotification,
  mapGetNotification,
  mapListNotifications,
  mapMarkNotificationRead,
  markNotificationRead,
  NotificationErrorCode,
  type ArchiveNotificationResult,
  type ListNotificationsInput,
  type ListNotificationsResult,
  type MarkNotificationReadResult,
  type NotificationRecipientContext,
  type NotificationView,
} from "@/modules/communication/contracts";
import { authChallengeResponse, errorResponse, type WireResponse } from "@/shared/http";
import type { DbExecutor } from "@/shared/db";
import {
  claimStoredReplay,
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  releaseStoredClaim,
  type WireIdempotencyKey,
} from "./command-dedup";
import type { ResolveSession } from "./support-ticket.route-handler";

/** Dependencies for a BC-COMM-2 MUTATION composition. All injectable (defaults = production wiring). */
export interface NotificationMutationDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`; routes pass string|null). */
  idempotencyKey: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Dependencies for a BC-COMM-2 READ composition (no idempotency — reads are side-effect-free). */
export interface NotificationReadDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/** SYNTAX 400 for a missing/over-bound `Idempotency-Key` (Doc-5H §5.5 mandatory header). */
function missingKey(): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: NotificationErrorCode.INVALID_INPUT,
    message: "Idempotency-Key header is required.",
    retryable: false,
  });
}

/**
 * The §B.6 idempotent-execution core on the composition's tx (the W3-COMM-1 house shape): replay
 * lookup → claim → run → persist-on-success / release-on-error. The state commands ALSO carry their
 * repository CAS — the claim is a uniform second guard, never a weaker one.
 */
async function runIdempotent<TOutcome, TResult>(
  scope: ReturnType<typeof dedupScope>,
  tx: DbExecutor,
  run: () => Promise<TOutcome>,
  mapper: (outcome: TOutcome | null) => WireResponse<TResult>,
  isOk: (outcome: TOutcome) => boolean,
): Promise<WireResponse<TResult>> {
  const replay = await findStoredReplay<TResult>(scope, tx);
  if (replay !== null) return replay;

  const claim = await claimStoredReplay(scope, tx);
  if (claim === "lost") {
    const winner = await findStoredReplay<TResult>(scope, tx);
    if (winner !== null) return winner;
    // Unreachable by construction (pending rows never commit); fail CLOSED per Doc-4A §14.3.
    throw new Error(
      "command-dedup: claim lost but no stored record resolved (failing closed per Doc-4A §14.3).",
    );
  }

  const outcome = await run();
  const wire = mapper(outcome);
  if (isOk(outcome)) {
    await persistWireReplay(scope, wire, tx);
  } else {
    await releaseStoredClaim(scope, tx);
  }
  return wire;
}

/**
 * The recipient mutation composition (mark-read / archive): `withActiveOrg` resolves the acting
 * (userId, activeOrgId) recipient pair server-side (Invariant #5); the §B.6 wrap makes the command
 * replay-safe. No slug gate (`[ESC-COMM-SLUG]` — see the header block).
 */
async function handleRecipientMutation<TOutcome, TResult>(
  contractId: string,
  runCommand: (ctx: NotificationRecipientContext, tx: DbExecutor) => Promise<TOutcome>,
  mapper: (outcome: TOutcome | null) => WireResponse<TResult>,
  isOk: (outcome: TOutcome) => boolean,
  deps: NotificationMutationDeps,
): Promise<WireResponse<TResult>> {
  const session = await deps.resolveSession();
  if (session === null) return authChallengeResponse();

  if (deps.idempotencyKey === null) return missingKey();
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) =>
    runIdempotent(
      dedupScope(contractId, context.userId, context.activeOrgId, key ?? ""),
      tx,
      () =>
        runCommand(
          {
            userId: context.userId,
            activeOrgId: context.activeOrgId,
            ipAddress: deps.ipAddress ?? null,
            userAgent: deps.userAgent ?? null,
          },
          tx,
        ),
      mapper,
      isOk,
    ),
  );

  if (!ran.resolved) return mapper(null); // §6.6 collapse (no user / no active membership) → 404.
  return ran.value;
}

// ─────────────────────────────────────────────────────────────────────────────
// The four caller-facing HTTP faces (Doc-5H §5.1).
// ─────────────────────────────────────────────────────────────────────────────

/** `POST /communication/notifications/{id}/mark_notification_read` — `comm.mark_notification_read.v1`
 *  (recipient; 200). */
export async function handleMarkNotificationRead(
  notificationId: string,
  deps: NotificationMutationDeps,
): Promise<WireResponse<MarkNotificationReadResult>> {
  return handleRecipientMutation(
    "comm.mark_notification_read.v1",
    (ctx, tx) => markNotificationRead({ notificationId }, ctx, { appendAuditRecord }, tx),
    mapMarkNotificationRead,
    (o) => o.ok,
    deps,
  );
}

/** `POST /communication/notifications/{id}/archive_notification` — `comm.archive_notification.v1`
 *  (recipient; 200; archive only from `read` — Patch Outcome A). */
export async function handleArchiveNotification(
  notificationId: string,
  deps: NotificationMutationDeps,
): Promise<WireResponse<ArchiveNotificationResult>> {
  return handleRecipientMutation(
    "comm.archive_notification.v1",
    (ctx, tx) => archiveNotification({ notificationId }, ctx, { appendAuditRecord }, tx),
    mapArchiveNotification,
    (o) => o.ok,
    deps,
  );
}

/** `GET /communication/notifications/{id}` — `comm.get_notification.v1` (recipient; 200/404). */
export async function handleGetNotification(
  notificationId: string,
  deps: NotificationReadDeps,
): Promise<WireResponse<NotificationView>> {
  const session = await deps.resolveSession();
  if (session === null) return authChallengeResponse();

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) =>
    mapGetNotification(
      await getNotification(
        notificationId,
        { userId: context.userId, activeOrgId: context.activeOrgId },
        tx,
      ),
    ),
  );

  if (!ran.resolved) return mapGetNotification(null); // §6.6 collapse → 404.
  return ran.value;
}

/** `GET /communication/notifications` — `comm.list_notifications.v1` (recipient; 200/400). */
export async function handleListNotifications(
  input: ListNotificationsInput,
  deps: NotificationReadDeps,
): Promise<WireResponse<ListNotificationsResult>> {
  const session = await deps.resolveSession();
  if (session === null) return authChallengeResponse();

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) =>
    mapListNotifications(
      await listNotifications(
        input,
        { userId: context.userId, activeOrgId: context.activeOrgId },
        tx,
      ),
    ),
  );

  if (!ran.resolved) return mapListNotifications(null); // §6.6 collapse → empty recipient page.
  return ran.value;
}
