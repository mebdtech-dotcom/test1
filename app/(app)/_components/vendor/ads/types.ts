// Vendor Ads (P-VND-12/13/14; Doc-4D PassB Part D §D7.4). ZERO CONTRACT INVENTION: every field
// binds a REAL frozen `advertisements` attribute (Doc-2 §5.8/§10.746-749, Doc-4D PassB Part D
// `create_advertisement.v1`/`submit_advertisement.v1`/`set_advertisement_state.v1`/
// `get_advertisement.v1`/`list_advertisements.v1`). All optional → genuine-empty in the
// presentation phase.
//
// FIREWALL (Doc-4D §B.11 / §18.3, binding): ads are visibility/placement ONLY — they never gate
// trust, eligibility, routing, or matching. No governance signal (trust/tier/performance/score)
// appears anywhere on this surface, mirroring the already-shipped admin ad-review pages
// (P-ADM-10/11).

/** Advertisement lifecycle — FROZEN Doc-2 §5.8 (quoted verbatim, Doc-4D PassB Part D:11):
 *  `draft → pending_review → scheduled → active`; `pending_review → rejected`; `active ⇄ paused`;
 *  `active → completed`. `scheduled → active` and `active → completed` are SYSTEM-driven
 *  (`set_advertisement_state.v1` System leg, date/budget-based) — never a vendor action. */
export type AdStatus =
  "draft" | "pending_review" | "scheduled" | "active" | "paused" | "rejected" | "completed";

/** Frozen `placement` enum (`create_advertisement.v1` request). */
export type AdPlacement = "landing" | "bottom" | "search" | "vendor_profile";

/** Frozen `schedule{start,end}` — server-formatted labels, no client clock. */
export interface AdScheduleView {
  start?: string;
  end?: string;
}

/** One row of the vendor's own ad list (P-VND-12) — owning-org read via `list_advertisements.v1`
 *  (all own states; the public read variant, active-only, does not apply on this authenticated
 *  surface). Cursor list, no totals (GI-03). */
export interface AdListItemView {
  id: string;
  creative_ref?: string;
  placement?: AdPlacement;
  schedule?: AdScheduleView;
  status?: AdStatus;
}

/** Full ad record (P-VND-13 create form + P-VND-14 submission/status) — binds the frozen
 *  `create_advertisement.v1` request fields plus status/outcome context. */
export interface AdView {
  id: string;
  creative_ref?: string;
  placement?: AdPlacement;
  schedule?: AdScheduleView;
  /** The advertised profile — `vendor_profile_id` is OPTIONAL on `create_advertisement.v1`;
   *  resolved display name only (own-org, no cross-tenant read). */
  vendor_profile_label?: string;
  /** `platform_invoice_id` — the Billing purchase ref (DD-5), a BARE UUID. The purchase itself is
   *  Billing's (no billing contract authored here) — shown as an opaque reference, never a coined
   *  invoice number. */
  platform_invoice_id?: string;
  status?: AdStatus;
  /** Reason captured with a `reject` decision (`review_advertisement.v1`, admin-authored) —
   *  read-only here, mirrors the admin detail (P-ADM-11). */
  review_reason?: string;
}
