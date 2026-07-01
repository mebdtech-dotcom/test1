// P-BUY-19 Buyer Engagements list — view-model. PRESENTATION-ONLY.
//
// Grounds STRICTLY in the FROZEN read `ops.list_engagements.v1` (Doc-4F §F5.8). The list response
// projects EXACTLY three fields per row — `items: list<{ engagement_id, human_ref, status }>` — plus a
// `next_page_token` cursor. It deliberately projects NO counterparty name, NO award value, NO `rfq_id`,
// and NO dates; those live on `ops.get_engagement.v1` (the detail read, P-BUY-20). Rendering any of them
// here would coin data the list contract does not return (Content ≠ Presentation, Inv #9), so this row
// models the three projected fields ONLY.
//
// GOVERNANCE: party-scoped — `list` returns ONLY the caller org's own engagements (Doc-4F §F5.8 V4 /
// H.9); the empty result is genuine, never "hidden by exclusion" (Inv #11 / GI-12). Cursor pagination
// only, no grand total (GI-03). `engagement_id` is an OPAQUE id (Inv #5); `human_ref` is display-only.

import type { EngagementState } from "./view-models";

/** One row of `ops.list_engagements.v1` — the three projected fields, nothing more. */
export interface EngagementListItem {
  /** `engagement_id` — opaque routing id (Inv #5). */
  id: string;
  /** `human_ref` — year-scoped display ref (e.g. `ENG-2026-000118`). Display-only. */
  humanRef: string;
  /** `status` — frozen contract-authority enum (open | in_delivery | completed | closed). */
  state: EngagementState;
}

export interface EngagementListData {
  items: EngagementListItem[];
  /** `next_page_token` — opaque forward cursor (GI-03). Undefined ⇒ no further page. */
  nextCursor?: string;
  /**
   * The active `filter.status` (frozen allowlisted filter field, Doc-4F §F5.8). Undefined ⇒ "All".
   * Presentation-only: the real filtered query binds at the data layer (PARKED).
   */
  activeStatus?: EngagementState;
}
