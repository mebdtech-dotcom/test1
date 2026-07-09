// M1 domain (PRIVATE) — the `user_status` transition matrix (the "simple lifecycle", service-layer). SINGLE
// authority for which user lifecycle edges are legal; the W2-IDN-6.x wired user commands (out of scope here:
// `set_user_account_status`, `deactivate_own_account`) MUST consult this and NEVER hand-roll a transition.
//
// AUTHORITY NOTE (Reference-never-restate). Unlike Organization (§5.1) and Membership (§5.2), the user
// lifecycle has NO named Doc-2 §5 state-machine graph — `users` carries a Doc-2 §3 STATUS ENUM only
// (Doc-2 §10.2: `status active/suspended/soft-deleted`), and Doc-4M M4 is explicit: "Do not infer a full
// lifecycle state machine from a §3 status enum." So the legal edges below are NOT inferred from the enum —
// they are transcribed VERBATIM from the AUTHORED Doc-4C State Effects of the two frozen user contracts
// (bound by pointer):
//
//   • `identity.set_user_account_status.v1` (Doc-4C §C4) — State Effects: `users` `active ⇄ suspended`.
//   • `identity.deactivate_own_account.v1`  (Doc-4C §C4) — State Effects (PassB): `active|suspended → soft-deleted`
//                                                            (+ anonymization on departure; the redaction path).
//
// so the legal edge set is exactly:
//
//   active ⇄ suspended
//   active|suspended ──close/depart──▶ soft_deleted   (terminal)
//
// The realized `identity.user_status` enum (Doc-6C §3.1 / migration) is exactly `active|suspended|soft_deleted`.
// `soft_deleted` is TERMINAL: NO frozen user contract authors a user "restore" edge (asymmetric to
// Organization §5.1, which DOES have `soft_deleted ──restore──▶ active`). Fail-closed — a user-restore edge is
// NOT coined here; if one is ever needed it lands via an additive Doc-4C contract + this machine, never by
// inference. Departure anonymization is an irreversible compliance-redaction concern (Doc-4C §C4), orthogonal
// to this edge legality.

/** The three `user_status` values (Doc-2 §10.2 status enum / the `UserStatus` enum, Doc-6C §3.1). */
export type UserStatus = "active" | "suspended" | "soft_deleted";

/** Terminal states — `soft_deleted` (no authored outgoing edge; no user-restore contract exists). */
export const TERMINAL_USER_STATUSES: ReadonlySet<UserStatus> = new Set(["soft_deleted"]);

/** A directed lifecycle edge `from → to`. */
export interface UserTransition {
  from: UserStatus;
  to: UserStatus;
}

// Encode each legal edge as a `"from>to"` key for O(1) matrix membership. From the authored Doc-4C §C4 State
// Effects — exactly four edges; nothing more (no user-restore edge is authored, so none is listed).
const edgeKey = (from: UserStatus, to: UserStatus): string => `${from}>${to}`;

const LEGAL_TRANSITIONS: ReadonlySet<string> = new Set([
  edgeKey("active", "suspended"), //       suspend:   active ──suspend──▶ suspended  (set_user_account_status)
  edgeKey("suspended", "active"), //       reinstate: suspended ──reinstate──▶ active (set_user_account_status)
  edgeKey("active", "soft_deleted"), //    depart:    active ──close/depart──▶ soft_deleted (deactivate_own_account)
  edgeKey("suspended", "soft_deleted"), // depart:    suspended ──close/depart──▶ soft_deleted (deactivate_own_account)
]);

/** True iff `from → to` is a legal user-lifecycle edge (Doc-4C §C4 State Effects). Self-loops and every
 *  unlisted pair are false (in particular `soft_deleted → *` is always false — terminal). */
export function canTransitionUser(from: UserStatus, to: UserStatus): boolean {
  return LEGAL_TRANSITIONS.has(edgeKey(from, to));
}

/** Thrown when a caller attempts an edge the machine forbids — the owning command maps it to the Doc-4C §C4
 *  `identity_user_status_conflict` (STATE/CONFLICT) error. Carries the rejected edge for diagnostics. */
export class IllegalUserTransitionError extends Error {
  readonly from: UserStatus;
  readonly to: UserStatus;

  constructor(from: UserStatus, to: UserStatus) {
    super(`Illegal user transition: ${from} → ${to} (Doc-4C §C4 State Effects).`);
    this.name = "IllegalUserTransitionError";
    this.from = from;
    this.to = to;
  }
}

/** Assert `from → to` is legal; throw `IllegalUserTransitionError` otherwise. The owning command calls this
 *  BEFORE writing the new status — an illegal edge never reaches the DB. */
export function assertUserTransition(from: UserStatus, to: UserStatus): void {
  if (!canTransitionUser(from, to)) {
    throw new IllegalUserTransitionError(from, to);
  }
}
