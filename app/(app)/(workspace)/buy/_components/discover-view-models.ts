// P-BUY-02 Buyer Discover vendors — view-model. PRESENTATION-ONLY.
//
// Marketplace discovery (M2, public projection). The list reads are `marketplace.list_vendor_directory.v1`
// (+ `marketplace.search_catalog.v1`) — Doc-4D §B (BC-MKT-6). The directory item PUBLIC projection is
// `{ name, human_ref, capability_flags, geography, categories, TrustIndicators }` (Doc-4D §B.3). This
// view-model renders those via the shared kit `VendorCard` VM and coins nothing (Content ≠ Presentation).
//
// GOVERNANCE (load-bearing):
//   • TRUST DISPLAYED, NEVER COMPUTED — and per the ratified kit `VendorCard` decision the ONLY trust
//     signal shown on a card is the BINARY "Verified" badge (M5 public projection); NO numeric/band score
//     is rendered (`[ESC-7G-SCORE-DISPLAY]`). Absence = no badge (never a "pending" state).
//   • CAPABILITY = the four-flag MATRIX (Inv #1) via the shared `CapabilityMatrix` (compact on the card) —
//     never a label; absent flags render OFF.
//   • NON-DISCLOSURE (Inv #11 / §7.5): public discovery has NO concept of buyer-private status — a vendor
//     the buyer has blacklisted still appears here, byte-identical to any other (the VM carries no
//     buyer-private field). Only published/non-excluded (non-soft-deleted/retired/banned) rows appear.
//   • DISCOVERY ≠ MATCHING (DD-2): results are the catalog set in the contract's order — never re-ranked,
//     scored, or recommended client-side (that is RFQ/M3, not here).
//   • Cursor pagination only (Doc-4D §B.6; page_size POLICY-bound). Opaque vendor id/slug (Inv #5).

import type { VendorCardVM } from "@/frontend/components/vendor-card";

export interface DiscoverData {
  /** Vendor directory rows, mapped to the shared `VendorCard` VM. In contract order (never re-ranked). */
  items: VendorCardVM[];
  /** Opaque forward cursor from `page_info` (Doc-4D §B.6). Undefined ⇒ no further page. */
  nextCursor?: string;
  /** The current `search_catalog.query` echoed back for the search field (presentation only). */
  query?: string;
}
