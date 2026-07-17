// Plans / catalog route (`/account/billing`) — P-ACC-16 (Doc-7E · T-LISTING · SK-CARD; page_inventory
// §13). A SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the
// canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: browses purchasable plans via the frozen reads `identity`/M7 `list_plans` +
// `get_plan` (BC-BILL-1) — a read; no mutation. Selecting a plan continues to Subscription (P-ACC-17).
// The shell owns the `<main>` container + the page `<h1>` (PageHeader).
import { PageHeader } from "../../_components/shell/page-header";
import { BillingSubNav } from "./billing-sub-nav";
import { PlansCatalog } from "./plans-catalog";

export const metadata = {
  title: "Plans & billing — iVendorz",
};

export default function BillingPage() {
  return (
    <>
      <PageHeader title="Plans" description="Choose the plan that fits your organization." />
      <BillingSubNav active="plans" />
      <PlansCatalog />
    </>
  );
}
