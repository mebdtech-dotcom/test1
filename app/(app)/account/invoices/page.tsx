// Platform invoices route (`/account/invoices`) — P-ACC-20 (Doc-7E · T-LISTING; page_inventory §13). A
// SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the
// canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: lists PLATFORM-FEE invoices (iVendorz billing the org) via the frozen read
// `list_platform_invoices` (BC-BILL-5, Doc-4I) — a read; no mutation. These are NOT trade invoices
// between buyer and vendor (`billing.platform_invoices ≠ operations.trade_invoices`, Doc-4I FIXED;
// R8/DF-6) — no escrow, wallet, or settlement. The shell owns the `<main>` container + the page `<h1>`.
import { PageHeader } from "../../_components/shell/page-header";
import { BillingSubNav } from "../billing/billing-sub-nav";
import { PlatformInvoicesView } from "./platform-invoices-view";

export const metadata = {
  title: "Platform invoices — iVendorz",
};

export default function PlatformInvoicesPage() {
  return (
    <>
      <PageHeader
        title="Platform invoices"
        description="Invoices for your iVendorz plan, lead packages, and ads."
      />
      <BillingSubNav active="invoices" />
      <PlatformInvoicesView />
    </>
  );
}
