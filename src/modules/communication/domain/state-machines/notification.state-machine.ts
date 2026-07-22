// M6 domain (PRIVATE) — the Notification lifecycle machine (Doc-2 §3.7/§10.7; Doc-4H Pass-B Part-2 +
// `Doc-4H_PassB_Part2_Patch_v1.0`; Doc-5H §5.2). PURE: owns no state, reads no DB, touches no
// governance signal. The SINGLE lifecycle authority for BC-COMM-2; consumed by the notification
// commands, never re-derived at a call site.
//
// Lifecycle (frozen, STRICT-LINEAR — no state invented): `unread → read → archived` (`archived`
// terminal / SD). The Part-2 Patch (F4H-PB2-NOT-M1, Outcome A) is BINDING: **archive is allowed only
// from `read`** — `unread → archived` is illegal (STATE; mark read first).
//
// Persistence realization (Doc-6H §3.2): the state is COLUMN-DERIVED — no status column exists:
//   unread   ⇔ read_at IS NULL  AND deleted_at IS NULL
//   read     ⇔ read_at NOT NULL AND deleted_at IS NULL
//   archived ⇔ deleted_at NOT NULL            (SD = archive; R12 — the row is never deleted)
//
// STATE (illegal-from-current-state) is distinct from CONFLICT (the optimistic-concurrency lost race)
// — never merged (Doc-4H H.4). Terminal/no-op re-entry (`read → read`, `archived → archived`) is an
// idempotent no-op (Doc-4A §14.6), not an error.

/** The derived notification lifecycle value set (Doc-2 §3.7; verbatim). */
export type NotificationStatusValue = "unread" | "read" | "archived";

/** Derive the frozen lifecycle state from the Doc-6H §3.2 column pair (SD = archive). */
export function deriveNotificationStatus(row: {
  readAt: Date | null;
  deletedAt: Date | null;
}): NotificationStatusValue {
  if (row.deletedAt !== null) return "archived";
  if (row.readAt !== null) return "read";
  return "unread";
}

/** The adjudication of a requested notification state command (Doc-4H §HB-2.3/§HB-2.4 Stage 6). */
export type NotificationTransitionDecision =
  /** The legal forward edge — proceed with the CAS write. */
  | { kind: "ok" }
  /** Already in (or past) the target state — idempotent no-op, no write, no audit (Doc-4A §14.6). */
  | { kind: "noop" }
  /** Illegal from the current state → STATE (distinct from CONFLICT — never merged). */
  | { kind: "illegal_state"; message: string };

/**
 * Adjudicate `comm.mark_notification_read.v1` (Doc-4H §HB-2.3 Stage 6): `unread → read` is the single
 * legal edge; `read → read` is an idempotent no-op; `archived` is terminal and cannot be marked read
 * (STATE).
 */
export function adjudicateMarkRead(
  current: NotificationStatusValue,
): NotificationTransitionDecision {
  if (current === "unread") return { kind: "ok" };
  if (current === "read") return { kind: "noop" };
  return {
    kind: "illegal_state",
    message: "An archived notification cannot be marked read.",
  };
}

/**
 * Adjudicate `comm.archive_notification.v1` (Doc-4H §HB-2.4 Stage 6, as PATCHED — Outcome A):
 * `read → archived` is the ONLY legal archive edge; `unread → archived` is illegal (mark read first);
 * `archived → archived` is an idempotent no-op (terminal).
 */
export function adjudicateArchive(
  current: NotificationStatusValue,
): NotificationTransitionDecision {
  if (current === "read") return { kind: "ok" };
  if (current === "archived") return { kind: "noop" };
  return {
    kind: "illegal_state",
    message: "An unread notification cannot be archived; mark it read first.",
  };
}
