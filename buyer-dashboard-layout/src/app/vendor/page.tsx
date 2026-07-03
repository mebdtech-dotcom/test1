import { LayoutDashboard } from "lucide-react";

import { IvEmptyState } from "@/components/iv/iv-empty-state";

import { VendorShell } from "./components/vendor-shell";
// TODO(api): swap mockVendorDashboardAdapter for the real adapter bound to the
// governed vendor contracts. The shell depends only on the adapter interface.
import { mockVendorDashboardAdapter } from "./mock-adapter";

export default async function VendorDashboardPage() {
  const shell = await mockVendorDashboardAdapter.getShellContext();

  return (
    <VendorShell
      title="Dashboard"
      description="Your digital showcase and business portal overview."
      breadcrumbs={[{ label: "Vendor", href: "#" }, { label: "Dashboard" }]}
      activeNavId="dashboard"
      user={shell.user}
      navBadges={shell.navBadges}
      notificationsLabel={shell.notificationsLabel}
    >
      {/* Dashboard widgets are added incrementally. This empty content region
          establishes the shell; sections (company profile completion, product
          and project portfolios, RFQ leads, buyer inquiries, profile
          performance) are wired up in later steps. */}
      <IvEmptyState
        icon={<LayoutDashboard />}
        title="Your dashboard is ready"
        description="Showcase and performance sections will appear here as they are added."
      />
    </VendorShell>
  );
}
