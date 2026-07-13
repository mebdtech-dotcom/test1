// P-VND-28 Trust & Performance (companion §3, T-DASHBOARD). Read-only governance-signal dashboard —
// no action exists anywhere on this page (Admin decides, Trust owns; §4 firewall). Presentation-only;
// renders the genuine "Signals pending verification" empty state until the Doc-5G reads are wired.
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { TrustPerformanceDashboard } from "../../../_components/vendor/trust";

export const metadata: Metadata = { title: "Trust & Performance" };

export default function TrustPage() {
  return (
    <div>
      <PageHeader
        title="Trust & Performance"
        description="Your trust, performance and verified-tier standing — read-only."
      />
      <TrustPerformanceDashboard />
    </div>
  );
}
