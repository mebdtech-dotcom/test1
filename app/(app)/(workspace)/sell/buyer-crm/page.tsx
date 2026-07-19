// Vendor Workspace — Buyer Relationships route (VX-03; UI rename per Team-1 build order C4 · closure
// record D4). Thin composition-only page. Two-register terminology: the USER-FACING label is "Buyer
// Relationships"; the INTERNAL domain term stays "Buyer CRM" — so the route path (`/sell/buyer-crm`),
// the component name (`BuyerCrmView`), and the directory are deliberately UNCHANGED (C5; no
// `BuyerRelationship` concept minted). The governance disclosure lives in the view component.
import type { Metadata } from "next";
import { BuyerCrmView } from "../../../_components/vendor/buyer-crm/buyer-crm-view";

export const metadata: Metadata = { title: "Buyer Relationships" };

export default function BuyerCrmPage() {
  return <BuyerCrmView />;
}
