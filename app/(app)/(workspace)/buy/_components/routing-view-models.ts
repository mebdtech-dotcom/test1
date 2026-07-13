// Buyer Workspace — RFQ routing log / invitations (P-BUY-13) PRESENTATION VIEW-MODELS.
//
// The typed props the P-BUY-13 view renders from. NOT the frozen Doc-4E DTOs — the presentation shape the
// server layer (Doc-7C SR5, GI-02) will MAP the wired §E6.7 reads onto at wiring (Wave 4; PARKED today).
// It coins nothing and, on this NON-DISCLOSURE surface, deliberately projects LESS than the planning doc:
//
//   • `rfq.get_routing_log.v1` (§E6.7) → `routing_log_row` = {routing_mode, pipeline_counts, executed_at}.
//     AGGREGATE ONLY — the row carries NO vendor identity (Doc-2 §10.4 buyer+compliance visibility; the log
//     "never stores vendor-visible blacklist traces"). `pipeline_counts` is a per-step in/out **jsonb whose
//     sub-shape the contract does not enumerate**, so it is NOT broken out here (would coin sub-fields, and
//     surfacing per-step counts risks implying exclusion) — only `routing_mode` + `executed_at` render.
//
//   • `rfq.list_invitations.v1` (§E6.7) → `invitation_projection` = {state, delivered_at, responded_at}.
//     The frozen projection carries **NO vendor field** — so this surface shows invitation STATES + timing
//     only, never WHO was invited/excluded. (The screen-spec "vendor" column is looser than the frozen
//     contract; the frozen corpus governs — §7 — and omitting vendor is the non-disclosure-correct direction.)
//     The buyer read discloses only delivered-onward rows; **deferral is invisible** (Doc-3 §4.2; Inv #11).
//
// Neither projection carries a per-row id (§E6.7 enumerates none); the view keys rows by render index.
//
// SCOPE: presentation only — no fetch, no mutation, no business logic (Content ≠ Presentation, Inv #9).
// The engine OWNS invitations (R6): there is no buyer dispatch/select/exclude affordance anywhere here.

import type { RfqState, RoutingMode, InvitationState } from "./view-models";

/** Presentation labels for the frozen `routing_mode` enum (Doc-2 §10.4). Neutral; never a governance signal. */
export const ROUTING_MODE_LABEL: Record<RoutingMode, string> = {
  approved_only: "Approved vendors only",
  approved_conditional: "Approved + conditional",
  approved_open: "Approved + open",
  open_market: "Open market",
};

/**
 * One routing-wave row from `get_routing_log` (§E6.7). AGGREGATE — no vendor identity, no per-step counts
 * (see file header). Rendered chronologically as the "routing waves" timeline.
 */
export interface RoutingLogRow {
  routingMode: RoutingMode;
  /** ISO-8601 wave execution instant, formatted at the render site. */
  executedAt: string;
}

/**
 * One invitation row from `list_invitations` (§E6.7). Projection = {state, delivered_at, responded_at} —
 * NO vendor field (frozen). `deliveredAt`/`respondedAt` are optional (a delivered-but-unanswered invitation
 * has no response instant). The buyer never learns which vendor a row belongs to (Inv #11 / §7.5).
 */
export interface InvitationRow {
  state: InvitationState;
  /** ISO-8601 delivery instant (the row is buyer-visible only from `delivered` onward). */
  deliveredAt?: string;
  /** ISO-8601 vendor-response instant, if the vendor has responded. */
  respondedAt?: string;
}

/**
 * The P-BUY-13 view-model. `null` drives the not-found ≡ genuine-absence state (GI-12; byte-identical to a
 * real 404). Both lists arrive in the contract's governed order and are NEVER re-ranked (GI-04). Cursor
 * pagination only (GI-03); the opaque forward cursors are absent/null on the last page.
 */
export interface RoutingInvitationsData {
  /** Opaque machine id (UUIDv7) — the route identifier; never a human ref (Inv #5). */
  id: string;
  /** Year-scoped human reference (e.g. `RFQ-2026-000123`) — DISPLAY ONLY. */
  humanRef: string;
  /** Current RFQ lifecycle state (frozen Doc-4M) — shown as context on the header. */
  state: RfqState;
  /** Routing-wave rows (aggregate) in contract order. */
  routingLog: RoutingLogRow[];
  /** Opaque forward cursor for the routing log (GI-03); absent/null ⇒ last page. */
  routingNextCursor?: string | null;
  /** Invitation rows (no vendor identity) in contract order. */
  invitations: InvitationRow[];
  /** Opaque forward cursor for invitations (GI-03); absent/null ⇒ last page. */
  invitationsNextCursor?: string | null;
}
