// M1 domain (PRIVATE) — the `delegation_grant_status` transition matrix (DR-6-STATE, service-layer).
// This is the SINGLE authority for which delegation-grant lifecycle EDGES are legal; the application
// commands and the System expiry worker consult it for edge legality and never re-derive the edge
// SET. (Scope note — RV-0153 NIT-2 fold: "the single authority" governs the STATUS-EDGE matrix
// only. Edge-adjacent BUSINESS boundaries are the owning command's to enforce over their frozen
// sources — e.g. the reinstate command MUST additionally pin the `Doc-2_Patch_v1.0.7` rule-3
// window-open guard, which this matrix deliberately does not encode. Consulting the matrix does not
// discharge those command-level guards.) A paraphrased machine is the repository's cardinal sin —
// so the legal edge set below is transcribed VERBATIM from Doc-2 §5.10 AS PATCHED by
// `Doc-2_Patch_v1.0.7` (PATCH-D2-06 — on §5.10 boundary questions the patch governs; bound by
// pointer, not redefined):
//
//   draft ──grant [granted_by must hold authority in controlling org]──▶ active
//   active ──suspend──▶ suspended ──reinstate [only while valid_to has NOT passed]──▶ active
//   active|suspended ──revoke──▶ **revoked**
//   active|suspended ──valid_to passes──▶ **expired**
//
// Every legal edge is enumerated in `LEGAL_TRANSITIONS`; anything not enumerated is ILLEGAL and MUST be
// rejected (fail-closed). The former `[ESC-IDN-DELEG-EXPIRY]` carries are RESOLVED (owner ruling
// 2026-07-09, `BOARD-DECISION-IDN-DELEG-EXPIRY_v1.0`; realized W2-IDN-6.5):
//   • `suspended → expired` — NOW LEGAL (patch rule 1): a grant expires when its validity window
//     lapses REGARDLESS of whether it is `active` or `suspended`; the System sweep covers BOTH states.
//   • `suspended → active` (reinstate) — legal ONLY while the validity window is open at reinstate
//     time (patch rule 3). The WINDOW guard is a business boundary enforced by the reinstate COMMAND
//     (`reinstate-delegation-grant.command.ts`) — the matrix stays purely a status-edge authority.
//
// `revoked` and `expired` are TERMINAL (§13 / patch rule 2) — no outgoing edge; a terminal grant never
// reopens; any future delegation requires a NEW grant (new UUID, fresh audit trail — patch rule 4).

/** The five `delegation_grant_status` values (Doc-2 §5.10 v1.0.7 / the `DelegationGrantStatus` enum, Doc-6C §3.9). */
export type DelegationGrantStatus = "draft" | "active" | "suspended" | "revoked" | "expired";

/** The terminal states (§13) — no legal outgoing transition. */
export const TERMINAL_DELEGATION_STATUSES: ReadonlySet<DelegationGrantStatus> = new Set([
  "revoked",
  "expired",
]);

/** A directed lifecycle edge `from → to`. */
export interface DelegationGrantTransition {
  from: DelegationGrantStatus;
  to: DelegationGrantStatus;
}

// Encode each legal edge as a `"from>to"` key for O(1) matrix membership. VERBATIM from Doc-2 §5.10
// as patched by `Doc-2_Patch_v1.0.7` — exactly seven edges; nothing more.
const edgeKey = (from: DelegationGrantStatus, to: DelegationGrantStatus): string => `${from}>${to}`;

const LEGAL_TRANSITIONS: ReadonlySet<string> = new Set([
  edgeKey("draft", "active"), //      issue: draft ──grant──▶ active
  edgeKey("active", "suspended"), //  suspend: active ──suspend──▶ suspended
  edgeKey("suspended", "active"), //  reinstate: suspended ──reinstate──▶ active (window-open guard = command)
  edgeKey("active", "revoked"), //    revoke: active ──revoke──▶ revoked (terminal)
  edgeKey("suspended", "revoked"), // revoke: suspended ──revoke──▶ revoked (terminal)
  edgeKey("active", "expired"), //    expire: active ──valid_to passes──▶ expired (terminal; System only)
  edgeKey("suspended", "expired"), // expire: suspended ──valid_to passes──▶ expired (Patch v1.0.7 rule 1; System only)
]);

/** True iff `from → to` is a legal Doc-2 §5.10 (v1.0.7) edge. Self-loops and every unlisted pair are false. */
export function canTransition(from: DelegationGrantStatus, to: DelegationGrantStatus): boolean {
  return LEGAL_TRANSITIONS.has(edgeKey(from, to));
}

/** Thrown when a caller attempts an edge the machine forbids — the service maps it to the Doc-4C §C9
 *  `identity_delegation_state_invalid` (STATE) error. Carries the rejected edge for diagnostics. */
export class IllegalDelegationTransitionError extends Error {
  readonly from: DelegationGrantStatus;
  readonly to: DelegationGrantStatus;

  constructor(from: DelegationGrantStatus, to: DelegationGrantStatus) {
    super(`Illegal delegation-grant transition: ${from} → ${to} (Doc-2 §5.10).`);
    this.name = "IllegalDelegationTransitionError";
    this.from = from;
    this.to = to;
  }
}

/** Assert `from → to` is legal (Doc-2 §5.10); throw `IllegalDelegationTransitionError` otherwise. The
 *  application commands call this BEFORE writing the new status — an illegal edge never reaches the DB. */
export function assertTransition(from: DelegationGrantStatus, to: DelegationGrantStatus): void {
  if (!canTransition(from, to)) {
    throw new IllegalDelegationTransitionError(from, to);
  }
}
