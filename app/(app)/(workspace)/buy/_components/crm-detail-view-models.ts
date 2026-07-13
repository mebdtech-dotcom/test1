// P-BUY-27 Buyer Vendor CRM detail — view-model. PRESENTATION-ONLY.
//
// The buyer's PRIVATE vendor record + relationship (BC-OPS-1, Doc-4F §F4). Two frozen reads compose the
// detail (§F4.9):
//   • `ops.get_private_vendor.v1` → record{ private_vendor_record_id, name, email, phone, details_jsonb,
//     source, link_status, linked_vendor_profile_id, state }, notes[{note_id,note}], ratings[{rating_id,
//     score,comment}].
//   • `ops.get_buyer_supplier_relationship.v1` → relationship{ buyer_supplier_relationship_id,
//     vendor_profile_id, current_status, is_favorite }  (present only when the record is LINKED to a public
//     profile; an unlinked record has no relationship, hence no CRM status).
// This view-model carries only those projected fields (Content ≠ Presentation, Inv #9). NOTE: neither read
// projects `caveat_note` (it is a write-side field on `set_buyer_vendor_status`), so it is NOT modeled;
// `details_jsonb` is dev-doc scope and is NOT rendered (no structure coined).
//
// GOVERNANCE (load-bearing — buyer-private / Inv #11 / §7.5 / firewall M4):
//   • `current_status` (approved|conditional|blacklisted|none) is BUYER-PRIVATE — shown ONLY here, to the
//     OWNING buyer. It NEVER leaves this org: never vendor-facing, never another buyer's, never a
//     platform-score input. A `blacklisted` status stays UNDETECTABLE to the vendor (its only cross-module
//     egress is the internal RFQ-routing read §F4.8, where it becomes an eligibility exclusion
//     indistinguishable from a non-match).
//   • Writes are PARKED (presentation-only, disabled): status set/clear needs `can_manage_vendor_status`;
//     notes/ratings/favorite need `can_manage_private_vendors` — DISTINCT slugs, never collapsed (Doc-2 §7).
//   • Own-org only; a non-owned/absent record collapses to NOT_FOUND, byte-identical (H.9). Opaque IDs (Inv #5).

import type {
  PrivateVendorLinkStatus,
  PrivateVendorState,
  PrivateVendorSource,
  BuyerVendorStatus,
} from "./view-models";

export interface PrivateVendorNoteItem {
  /** `note_id` — opaque (Inv #5). */
  id: string;
  /** `note` — free-text (buyer-entered). */
  note: string;
}

export interface PrivateVendorRatingItem {
  /** `rating_id` — opaque (Inv #5). */
  id: string;
  /** `score` — private numeric score (range is POLICY-bound, dev-doc; rendered as given). */
  score: number;
  /** `comment` — optional free-text. */
  comment?: string;
}

export interface VendorCrmDetailData {
  /** `private_vendor_record_id` — opaque routing id (Inv #5). */
  id: string;
  /** `name` — buyer-entered vendor name (display). */
  name: string;
  /** `email` — buyer-entered contact (optional). */
  email?: string;
  /** `phone` — buyer-entered contact (optional). */
  phone?: string;
  /** `source` — how the record was added (manual | email_list | excel). */
  source: PrivateVendorSource;
  /** `link_status` — private↔public link state (none | suggested | linked). NOT an approval status. */
  linkStatus: PrivateVendorLinkStatus;
  /** `state` — record lifecycle (active | archived). */
  state: PrivateVendorState;
  /**
   * `current_status` from `get_buyer_supplier_relationship` — the buyer's PRIVATE CRM status. Present only
   * when the record is LINKED (an unlinked record has no relationship). BUYER-PRIVATE — never vendor-facing.
   */
  currentStatus?: BuyerVendorStatus;
  /** `is_favorite` from the relationship (present only when linked). */
  isFavorite?: boolean;
  /** `notes` — the record's private notes (buyer-only). */
  notes: PrivateVendorNoteItem[];
  /** `ratings` — the record's private ratings (buyer-only). */
  ratings: PrivateVendorRatingItem[];
  /** `can_manage_vendor_status` (Doc-2 §7) — gates the status set/clear affordance (presentation-only). */
  canManageVendorStatus?: boolean;
  /** `can_manage_private_vendors` (Doc-2 §7) — gates notes/ratings/favorite affordances (presentation-only). */
  canManagePrivateVendors?: boolean;
}
