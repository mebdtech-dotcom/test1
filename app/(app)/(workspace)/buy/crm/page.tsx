// P-BUY-26 Buyer Vendor CRM list route (Doc-7F · `T-LISTING`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// PRESENTATION-ONLY (this milestone): binds the M4 read `ops.list_private_vendors.v1` (Doc-4F §F4.9), which
// is NOT wired today (PARKED — Wave 4). A realistic mock stands in for the wired projection — exactly the
// four projected fields {private_vendor_record_id, name, link_status, state}. The browser never calls a
// Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).
//
// GOVERNANCE (buyer-private / Inv #11): OWN-ORG only (slug `can_manage_private_vendors`), cursor-paginated
// (GI-03), genuine-empty (never implies exclusion). The buyer's CRM APPROVAL status (approved | conditional
// | blacklisted) is NOT part of the list projection and is NOT fabricated here — a blacklist stays
// undetectable (§7.5); only the private↔public `link_status` is carried.

import { CrmListView } from "./crm-list-view";
import type { PrivateVendorListItem, CrmListData } from "../_components/crm-list-view-models";
import type { PrivateVendorLinkStatus } from "../_components/view-models";

export const metadata = {
  title: "Vendor CRM",
};

// Realistic industrial-procurement MOCK — exactly the fields `list_private_vendors` projects (id / name /
// link_status / state). NO approval status (approved/conditional/blacklisted) is present — the list read
// does not project it, and it must never be surfaced here (Inv #11). In System-persisted order (GI-04).
const MOCK_PRIVATE_VENDORS: PrivateVendorListItem[] = [
  { id: "pv_01", name: "Meghna Industrial Supplies Ltd.", linkStatus: "linked", state: "active" },
  { id: "pv_02", name: "Bengal Steel & Fabrication", linkStatus: "suggested", state: "active" },
  { id: "pv_03", name: "Padma Engineering Works", linkStatus: "none", state: "active" },
  { id: "pv_04", name: "Delta Traders & Import", linkStatus: "linked", state: "active" },
  { id: "pv_05", name: "Rupsha Fabricators (old)", linkStatus: "none", state: "archived" },
];

const VALID_LINK: PrivateVendorLinkStatus[] = ["none", "suggested", "linked"];

export default async function BuyerCrmPage({
  searchParams,
}: {
  searchParams: Promise<{ link?: string }>;
}) {
  const sp = await searchParams;
  // Accept only a frozen link_status value (§F4.9 allowlist); anything else ⇒ "All".
  const activeLinkStatus = VALID_LINK.includes(sp.link as PrivateVendorLinkStatus)
    ? (sp.link as PrivateVendorLinkStatus)
    : undefined;
  // Presentation filter over the mock; the real filtered, cursor-paginated query binds server-side (PARKED).
  const items = activeLinkStatus
    ? MOCK_PRIVATE_VENDORS.filter((v) => v.linkStatus === activeLinkStatus)
    : MOCK_PRIVATE_VENDORS;

  const data: CrmListData = { items, activeLinkStatus };
  return <CrmListView data={data} />;
}
