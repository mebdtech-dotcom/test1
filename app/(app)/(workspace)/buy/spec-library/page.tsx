// Buyer sidebar IA (BX-04) — "Specification Library" (Marketplace group). RESERVED ROUTE, no
// contract yet: a Specification Library exists today ONLY on the vendor side
// (`workspace/company/spec-library`, the vendor's own product-spec catalog) — there is no buyer-facing
// equivalent (e.g. saved/reference specs for sourcing) in the frozen corpus. `ImplementationPendingView`
// reserves the destination without repurposing the vendor's page across a workspace boundary.
import { Library } from "lucide-react";
import { ImplementationPendingView } from "../_components/implementation-pending-view";

export const metadata = {
  title: "Specification Library",
};

export default function SpecLibraryPage() {
  return (
    <ImplementationPendingView
      breadcrumb={[{ label: "Marketplace" }, { label: "Specification Library" }]}
      title="Specification Library"
      description="A reference library of product specifications for sourcing. Not to be confused with a vendor's own catalog spec library."
      icon={<Library aria-hidden />}
    />
  );
}
