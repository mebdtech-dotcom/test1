// Buyer sidebar IA (BX-04) — "Saved Vendors" (Marketplace group). RESERVED ROUTE, no contract yet:
// this is DISTINCT from `P-BUY-05` Favorites (frozen `marketplace.catalog_favorites`, product/category
// ONLY per the FE-BUY-10 owner ruling — vendor-level favoriting is explicitly out of that contract's
// scope) and DISTINCT from Vendor CRM (`/crm`, buyer-private relationship/approval tracking, Inv#11 —
// a different concept, not a "saved" list). No vendor-saving read exists anywhere in the frozen
// corpus today. `ImplementationPendingView` reserves the destination without repurposing either
// existing surface under a mismatched label.
import { Star } from "lucide-react";
import { ImplementationPendingView } from "../_components/implementation-pending-view";

export const metadata = {
  title: "Saved Vendors",
};

export default function SavedVendorsPage() {
  return (
    <ImplementationPendingView
      breadcrumb={[{ label: "Marketplace" }, { label: "Saved Vendors" }]}
      title="Saved Vendors"
      description="Vendors you've saved for quick access. This is separate from Favorites (product/category) and Vendor CRM (private relationship tracking)."
      icon={<Star aria-hidden />}
    />
  );
}
