// Lead credits route (`/account/lead-credits`) — P-ACC-19 (Doc-7E · T-LISTING; page_inventory §13). A
// SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the
// canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: shows the lead-credit balance + transactions via the frozen reads
// `get_lead_balance` + `list_lead_transactions` (BC-BILL-4, Doc-4I); `credit_lead_account` is a gated
// (admin/permitted) command — this build performs NO mutation. The shell owns the `<main>` container +
// the page `<h1>` (PageHeader).
import { PageHeader } from "../../_components/shell/page-header";
import { BillingSubNav } from "../billing/billing-sub-nav";
import { LeadCreditsView } from "./lead-credits-view";

export const metadata = {
  title: "Lead credits — iVendorz",
};

export default function LeadCreditsPage() {
  return (
    <>
      <PageHeader
        title="Lead credits"
        description="Your lead-credit balance and transaction history."
      />
      <BillingSubNav active="lead-credits" />
      <LeadCreditsView />
    </>
  );
}
