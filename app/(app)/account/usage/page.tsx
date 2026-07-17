// Usage & quota route (`/account/usage`) — P-ACC-18 (Doc-7E · T-DASHBOARD; page_inventory §13). A SERVER
// COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the canonical
// Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: shows entitlement usage vs quota via the frozen read `get_usage` (BC-BILL-3,
// Doc-4I) — a read; no mutation. The shell owns the `<main>` container + the page `<h1>` (PageHeader).
import { PageHeader } from "../../_components/shell/page-header";
import { BillingSubNav } from "../billing/billing-sub-nav";
import { UsageDashboard } from "./usage-dashboard";

export const metadata = {
  title: "Usage & quota — iVendorz",
};

export default function UsagePage() {
  return (
    <>
      <PageHeader
        title="Usage & quota"
        description="How much of your plan's entitlements you've used this period."
      />
      <BillingSubNav active="usage" />
      <UsageDashboard />
    </>
  );
}
