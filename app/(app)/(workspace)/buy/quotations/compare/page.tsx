// Buyer sidebar IA (BX-04) — "Compare Quotes" (Quotations group). RESERVED ROUTE, no contract yet:
// the frozen comparison read (`get_comparison_statement`, P-BUY-15/R6 never-recommends) is scoped to
// ONE RFQ (`/buy/rfqs/[rfqId]/compare`, already built) — there is no cross-RFQ "pick any quotes to
// compare" flow in the corpus. `ImplementationPendingView` reserves the nav destination without
// fabricating a picker or comparison logic. The real per-RFQ comparison stays at its existing route.
import { FileText } from "lucide-react";
import { ImplementationPendingView } from "../../_components/implementation-pending-view";

export const metadata = {
  title: "Compare Quotes",
};

export default function QuotationsComparePage() {
  return (
    <ImplementationPendingView
      breadcrumb={[{ label: "Quotations", href: "/buy/quotations" }, { label: "Compare Quotes" }]}
      title="Compare Quotes"
      description="Compare quotations across your RFQs in one view. Today, comparison is available per RFQ from that RFQ's Comparison tab."
      icon={<FileText aria-hidden />}
    />
  );
}
