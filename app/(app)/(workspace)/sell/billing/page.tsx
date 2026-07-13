// P-VND-27-equivalent Billing (FE-VEN-10, companion "vendor-context view reusing P-ACC-16..21").
// Board-ruled Option B (2026-07-03, `FE-VEN-14` report §9): a vendor-mounted page composing the
// EXISTING, UNMODIFIED Account components inside vendor-shell chrome — composition only, never a
// fork. Each tab renders the real `/account/*` component unchanged; only the outer shell/chrome is
// vendor-scoped.
//
// Known, disclosed trade-off (not a defect): `PlansCatalog`'s "Select plan" link and
// `PlatformInvoicesView`'s per-row "Open" link are hard-coded, internal to those unmodified
// components, to `/account/subscription` and `/account/invoices/[id]` respectively. Reusing them
// without forking means those two specific actions leave the vendor workspace's chrome for that one
// destination (both land on the same real, already-reviewed data) rather than staying inside
// `/sell/*` — an accepted consequence of composition-only reuse per the ruling.
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { BillingTabs } from "../../../_components/vendor/billing";
import { PlansCatalog } from "../../../account/billing/plans-catalog";
import { SubscriptionView } from "../../../account/subscription/subscription-view";
import { UsageDashboard } from "../../../account/usage/usage-dashboard";
import { LeadCreditsView } from "../../../account/lead-credits/lead-credits-view";
import { PlatformInvoicesView } from "../../../account/invoices/platform-invoices-view";

export const metadata: Metadata = { title: "Billing & Plan" };

export default function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Billing & Plan"
        description="Your plan, subscription, usage, lead credits, and platform invoices."
      />
      <BillingTabs
        plans={<PlansCatalog />}
        subscription={<SubscriptionView empty={false} />}
        usage={<UsageDashboard />}
        leadCredits={<LeadCreditsView />}
        invoices={<PlatformInvoicesView />}
      />
    </div>
  );
}
