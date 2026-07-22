// M6 domain (PRIVATE) — the Support Ticket state machine (Doc-2 §3.7/§10.7; Doc-4H §H13 / Doc-5H §7.2).
// PURE: owns no state, reads no DB, touches no governance signal. The SINGLE lifecycle authority for
// BC-COMM-4; consumed by the support-ticket commands, never re-derived at a call site.
//
// Lifecycle (frozen, no state invented): open → in_progress → resolved → closed (`closed` terminal).
// Two orthogonal facts a transition request is checked against (Doc-4H §HB-4.2 / Doc-5H §7.3):
//   1. SEQUENCE legality — is (from → to) one of the three forward edges?  (illegal ⇒ STATE)
//   2. ACTOR authority   — may THIS actor drive that edge?                 (unauthorized ⇒ AUTHORIZATION)
// A User may drive ONLY `resolved → closed` (own ticket); Support Staff drives all three. A User
// requesting a staff-only transition is AUTHORIZATION (actor-denied) — NOT a relabeled STATE (Doc-4H
// §HB-4.2 AI-Agent Notes; Doc-5H §7.5). An out-of-sequence transition is STATE (distinct from CONFLICT,
// the optimistic-concurrency lost race — never merged).

/** The `communication.support_ticket_status` value set (Doc-2 §10.7; verbatim). */
export type SupportTicketStatusValue = "open" | "in_progress" | "resolved" | "closed";

/** The `update_ticket` target-status set (Doc-4H §HB-4.2 request schema — never `open`). */
export type SupportTicketTargetStatus = "in_progress" | "resolved" | "closed";

/** Discriminates who is driving a transition (Doc-5H §7.3 two-sided actor). */
export type TicketActorType = "user" | "admin";

/** The three FORWARD sequence edges (Doc-2 §3.7). `closed` is terminal (no outgoing edge). */
const LEGAL_EDGES: ReadonlyArray<readonly [SupportTicketStatusValue, SupportTicketStatusValue]> = [
  ["open", "in_progress"],
  ["in_progress", "resolved"],
  ["resolved", "closed"],
];

/** The staff-only edges (Doc-5H §7.3): a User performs neither `open→in_progress` nor `in_progress→resolved`. */
const STAFF_ONLY_EDGES: ReadonlyArray<
  readonly [SupportTicketStatusValue, SupportTicketStatusValue]
> = [
  ["open", "in_progress"],
  ["in_progress", "resolved"],
];

/** Is `(from → to)` one of the three forward sequence edges? */
export function isLegalTransition(
  from: SupportTicketStatusValue,
  to: SupportTicketStatusValue,
): boolean {
  return LEGAL_EDGES.some(([f, t]) => f === from && t === to);
}

/** Is `(from → to)` a staff-only edge (a User requesting it is AUTHORIZATION, not STATE)? */
export function isStaffOnlyTransition(
  from: SupportTicketStatusValue,
  to: SupportTicketStatusValue,
): boolean {
  return STAFF_ONLY_EDGES.some(([f, t]) => f === from && t === to);
}

/** The adjudication of a requested `update_ticket` transition (Doc-4H §HB-4.2 Stage 6). */
export type TransitionDecision =
  /** Legal sequence edge the actor is authorized to drive — proceed. */
  | { kind: "ok" }
  /** Out-of-sequence transition (incl. from `closed`, or `from == to`) → STATE. */
  | { kind: "illegal_sequence" }
  /** A legal edge, but this actor may not drive it (User requesting a staff-only edge) → AUTHORIZATION. */
  | { kind: "actor_unauthorized" };

/**
 * Adjudicate an `update_ticket` transition request against BOTH sequence legality and actor authority
 * (Doc-4H §HB-4.2 / Doc-5H §7.3). SEQUENCE is checked FIRST: an out-of-sequence edge is STATE regardless
 * of actor (an illegal edge is never re-labeled AUTHORIZATION). A legal-but-staff-only edge requested by
 * a User is `actor_unauthorized` (AUTHORIZATION). Support Staff may drive every legal edge.
 */
export function adjudicateTransition(
  actor: TicketActorType,
  from: SupportTicketStatusValue,
  to: SupportTicketStatusValue,
): TransitionDecision {
  if (!isLegalTransition(from, to)) {
    return { kind: "illegal_sequence" };
  }
  if (actor === "user" && isStaffOnlyTransition(from, to)) {
    return { kind: "actor_unauthorized" };
  }
  return { kind: "ok" };
}
