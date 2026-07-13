// Buyer sidebar IA (BX-04) — "Received Quotes" (Quotations group). RESERVED ROUTE, no contract yet:
// the frozen corpus has no cross-RFQ quotation list read — quotations only exist scoped to a single
// RFQ (`list_quotations_for_rfq`, P-BUY-09) or a single quotation (`get_quotation`, P-BUY-14). A
// buyer-wide "all my received quotes" aggregate would need its own additive read (ESC-class); not
// coined here. `ImplementationPendingView` reserves the nav destination without fabricating one.
import { FileText } from "lucide-react";
import { ImplementationPendingView } from "../_components/implementation-pending-view";

export const metadata = {
  title: "Received Quotes",
};

export default function QuotationsPage() {
  return (
    <ImplementationPendingView
      breadcrumb={[{ label: "Quotations" }, { label: "Received Quotes" }]}
      title="Received Quotes"
      description="A cross-RFQ view of quotations vendors have submitted to your organization."
      icon={<FileText aria-hidden />}
    />
  );
}
