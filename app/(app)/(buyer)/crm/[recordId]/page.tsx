// P-BUY-27 Buyer Vendor CRM detail route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE `private_vendor_record_id` (Inv #5).
//
// PRESENTATION-ONLY (this milestone): composes the M4 reads `ops.get_private_vendor.v1` +
// `ops.get_buyer_supplier_relationship.v1` (Doc-4F §F4.9), which are NOT wired today (PARKED — Wave 4). A
// realistic mock stands in for the projected fields; `details_jsonb`/`caveat_note` are not projected and
// not fabricated. The browser never calls a Doc-5 contract and never sets `Iv-Active-Organization`.
//
// NON-DISCLOSURE (Inv #11 / §7.5 / H.9): an unknown/absent record AND a non-owned record both resolve to the
// SAME `notFound()` → byte-identical not-found.tsx. The CRM status is BUYER-PRIVATE (shown to the owning
// buyer only, never vendor-facing); a blacklist stays undetectable.

import { notFound } from "next/navigation";
import { CrmDetailView } from "./crm-detail-view";
import type { VendorCrmDetailData } from "../../_components/crm-detail-view-models";

export const metadata = {
  title: "Vendor CRM",
};

// Realistic industrial-procurement MOCK keyed on opaque record id (matches the P-BUY-26 list ids). Only the
// projected fields; CRM `current_status` present ONLY on linked records. It is buyer-private — this is the
// one surface (own buyer) where approved/conditional/blacklisted is shown; never vendor-facing (Inv #11).
const MOCK_CRM: Record<string, VendorCrmDetailData> = {
  pv_01: {
    id: "pv_01",
    name: "Meghna Industrial Supplies Ltd.",
    email: "sales@meghna-industrial.com.bd",
    phone: "+880 1711-000001",
    source: "manual",
    linkStatus: "linked",
    state: "active",
    currentStatus: "approved",
    isFavorite: true,
    notes: [
      { id: "note_1", note: "Reliable on MS plate; confirm galvanizing lead time before each PO." },
      { id: "note_2", note: "Primary supplier for structural steel since 2024." },
    ],
    ratings: [{ id: "rate_1", score: 5, comment: "On-time delivery, consistent quality." }],
    canManageVendorStatus: true,
    canManagePrivateVendors: true,
  },
  pv_02: {
    id: "pv_02",
    name: "Bengal Steel & Fabrication",
    email: "info@bengalsteel.com.bd",
    source: "email_list",
    linkStatus: "suggested",
    state: "active",
    // Not linked ⇒ no relationship ⇒ no CRM status.
    notes: [{ id: "note_3", note: "Met at Dhaka Industrial Expo; quote pending." }],
    ratings: [],
    canManageVendorStatus: true,
    canManagePrivateVendors: true,
  },
  pv_03: {
    id: "pv_03",
    name: "Padma Engineering Works",
    phone: "+880 1911-000003",
    source: "manual",
    // Unlinked ⇒ "Not linked" chip + no relationship/status (the link-first prose branch renders).
    linkStatus: "none",
    state: "active",
    notes: [],
    ratings: [],
    canManageVendorStatus: true,
    canManagePrivateVendors: true,
  },
  pv_05: {
    id: "pv_05",
    name: "Rupsha Fabricators (old)",
    source: "excel",
    linkStatus: "linked",
    state: "archived",
    // Linked but status cleared ⇒ current_status "none" ("No status" chip; no "Clear status" affordance).
    currentStatus: "none",
    isFavorite: false,
    notes: [],
    ratings: [],
    canManageVendorStatus: true,
    canManagePrivateVendors: true,
  },
  pv_04: {
    id: "pv_04",
    name: "Delta Traders & Import",
    email: "procurement@deltatraders.com.bd",
    phone: "+880 1811-000004",
    source: "excel",
    linkStatus: "linked",
    state: "active",
    // Blacklisted — shown to the OWNING buyer only; never vendor-facing, never a platform-score input.
    currentStatus: "blacklisted",
    isFavorite: false,
    notes: [{ id: "note_4", note: "Quality dispute on 2025 order; do not route until resolved." }],
    ratings: [{ id: "rate_2", score: 2, comment: "Repeated spec deviations." }],
    canManageVendorStatus: true,
    canManagePrivateVendors: true,
  },
};

export default async function BuyerCrmDetailPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const data = MOCK_CRM[recordId];
  // Unknown/absent OR non-owned ⇒ identical collapse (H.9). notFound() → byte-identical not-found.tsx.
  if (!data) {
    notFound();
  }
  return <CrmDetailView data={data} />;
}
