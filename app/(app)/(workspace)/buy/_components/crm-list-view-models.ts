// P-BUY-26 Buyer Vendor CRM — list view-model. PRESENTATION-ONLY.
//
// The buyer's PRIVATE vendor CRM (`private_vendor_records`; BC-OPS-1, Doc-4F §F4 / Doc-2 §10.5). The list
// read is `ops.list_private_vendors.v1` (§F4.9), which projects EXACTLY:
//   items : list<{ private_vendor_record_id, name, link_status, state }>  (+ next_page_token)
// This view-model carries ONLY those four fields — it invents nothing (Content ≠ Presentation, Inv #9).
//
// GOVERNANCE (load-bearing — buyer-private / Inv #11 / GI-12):
//   • BUYER-PRIVATE, OWN-ORG ONLY (slug `can_manage_private_vendors`, §F4.9 scope): the list returns only
//     the caller org's own records; never cross-tenant. The empty result is genuine, never "hidden by
//     exclusion".
//   • The buyer's CRM APPROVAL status (`approved | conditional | blacklisted`) is DELIBERATELY NOT PROJECTED
//     by the list read — it is not modeled or shown here. A blacklist stays UNDETECTABLE (Inv #11 / §7.5);
//     the only status shown is the private↔public `link_status`, which is not an approval signal.
//   • Cursor pagination only (`next_page_token`, GI-03); no grand total. `private_vendor_record_id` is
//     OPAQUE (Inv #5); `name` is buyer-entered display text.

import type { PrivateVendorLinkStatus, PrivateVendorState } from "./view-models";

/** One row of `ops.list_private_vendors.v1` — the four projected fields, nothing more. */
export interface PrivateVendorListItem {
  /** `private_vendor_record_id` — opaque routing id (Inv #5). */
  id: string;
  /** `name` — buyer-entered vendor name (display). */
  name: string;
  /** `link_status` — private↔public link state (none | suggested | linked). NOT an approval status. */
  linkStatus: PrivateVendorLinkStatus;
  /** `state` — record lifecycle (active | archived). */
  state: PrivateVendorState;
}

export interface CrmListData {
  /** The buyer org's own private vendor records, in contract order (never re-ranked, GI-04). */
  items: PrivateVendorListItem[];
  /** `next_page_token` — opaque forward cursor (GI-03). Undefined ⇒ no further page. */
  nextCursor?: string;
  /**
   * The active `filter.link_status` (a frozen allowlisted filter field, §F4.9). Undefined ⇒ "All".
   * Presentation-only: the real filtered query binds at the data layer (PARKED).
   */
  activeLinkStatus?: PrivateVendorLinkStatus;
}
