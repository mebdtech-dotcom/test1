// Vendor Workspace — Buyer Relationships canonical index (Amendment A1: route renamed from
// `/sell/buyer-crm`, which is now a 308 redirect source only — closure record v1.1 §7). Thin
// composition-only page; the governed view (internal domain term "Buyer CRM", D4-C5) carries the
// governance header and the VX-03 pre-wiring states.
import type { Metadata } from "next";
import { BuyerCrmView } from "../../../_components/vendor/buyer-crm/buyer-crm-view";

export const metadata: Metadata = { title: "Buyer Relationships" };

export default function BuyerRelationshipsPage() {
  return <BuyerCrmView />;
}
