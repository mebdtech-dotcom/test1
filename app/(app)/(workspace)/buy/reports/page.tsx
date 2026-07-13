// Buyer sidebar IA (BX-04) — "Reports & Analytics" (Analytics group). RESERVED ROUTE, no contract
// yet: the only analytics-tagged buyer surface today is the per-RFQ Comparison statement
// (`get_comparison_statement`, P-BUY-15, `T-ANALYTICS`) — there is no organization-wide reporting read
// in the frozen corpus. `ImplementationPendingView` reserves the destination without fabricating
// figures (R7 — every figure must be a contract read, never client-computed).
import { BarChart3 } from "lucide-react";
import { ImplementationPendingView } from "../_components/implementation-pending-view";

export const metadata = {
  title: "Reports & Analytics",
};

export default function ReportsPage() {
  return (
    <ImplementationPendingView
      breadcrumb={[{ label: "Reports & Analytics" }]}
      title="Reports & Analytics"
      description="Organization-wide procurement reporting. Every figure here will be a contract read, never a client-computed estimate (R7)."
      icon={<BarChart3 aria-hidden />}
    />
  );
}
