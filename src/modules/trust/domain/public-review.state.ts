// M5 domain (PRIVATE) — the `public_review_status` transition matrix for the Public Review aggregate. SINGLE
// authority for which review lifecycle edges are legal; the write-service
// (`application/services/public-review.service.ts`) + the submit command MUST consult this and NEVER
// hand-roll a transition. Pure functions (no DB) — reused by the service; no state is owned here.
//
// The legal edges are transcribed from the frozen Doc-4G §H.5 / §G8.1-§G8.3 (bound by pointer; Doc-2
// §3.6/§10.6):
//   submit:    (absence) ─────────────▶ submitted   (§G8.1 — entry `submitted`; not a transition, guarded elsewhere)
//   moderate:  submitted ──approve────▶ approved     (§G8.2)
//              submitted ──reject─────▶ rejected     (§G8.2 — TERMINAL)
//   publish:   approved ──────────────▶ published    (§G8.3 — public via Marketplace service projection; feeds Path B)
//   remove:    submitted|approved|published ─▶ removed (§G8.3 — hidden soft-delete, Doc-2 §10.6 SD=YES)
//
// Forbidden (Doc-4G §G8.2/§G8.3 State Machine Enforcement): any transition from a wrong source is illegal →
// STATE. `published`/`rejected`/`removed` are terminal-or-hidden per Doc-2; `rejected`/`removed` are NOT
// removable. No edge added or modified; no state invented.

/** The `trust.public_review_status` value set (Doc-2 §10.6 / Doc-6G §3.5.2). Entry `submitted`;
 *  `published`/`rejected`/`removed` terminal-or-hidden (Doc-4G §H.5). Do not extend. */
export type PublicReviewStatus = "submitted" | "approved" | "published" | "rejected" | "removed";

/** The moderation decision (Doc-4G §G8.2) — maps to `approved` / `rejected`. */
export type ReviewModerationDecision = "approve" | "reject";

/** The removable source states (Doc-4G §H.5 / §G8.3): a review may be removed from `submitted`, `approved`,
 *  or `published` (→ `removed`, hidden). `rejected`/`removed` are terminal — NOT removable. */
export const REVIEW_REMOVABLE_SOURCES: ReadonlySet<PublicReviewStatus> = new Set([
  "submitted",
  "approved",
  "published",
]);

/** Is a moderation transition legal from `source`? (Doc-4G §G8.2.) Moderation acts ONLY on a `submitted`
 *  review; any other source is illegal → STATE. */
export function isReviewModerationLegal(source: PublicReviewStatus): boolean {
  return source === "submitted";
}

/** Is a publish transition legal from `source`? (Doc-4G §G8.3.) Publish acts ONLY on an `approved` review;
 *  a re-publish of a `published` review (source ≠ `approved`) → STATE (not a silent no-op; Doc-4G §H.5/§10). */
export function isReviewPublishLegal(source: PublicReviewStatus): boolean {
  return source === "approved";
}

/** Is a remove transition legal from `source`? (Doc-4G §G8.3.) Removable from `submitted`/`approved`/
 *  `published`; a `rejected`/`removed` (terminal) source is illegal → STATE. */
export function isReviewRemoveLegal(source: PublicReviewStatus): boolean {
  return REVIEW_REMOVABLE_SOURCES.has(source);
}

/** The target state a moderation decision drives to (Doc-4G §G8.2): approve → `approved`; reject → `rejected`. */
export function reviewModerationTarget(decision: ReviewModerationDecision): PublicReviewStatus {
  return decision === "approve" ? "approved" : "rejected";
}
