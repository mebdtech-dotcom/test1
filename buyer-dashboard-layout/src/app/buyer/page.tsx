import {
  CheckCircle2,
  CircleUser,
  ClipboardList,
  FileText,
  LogOut,
  PiggyBank,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

import { IvMoney } from "@/components/iv/iv-money";
import { BuyerShell } from "./components/buyer-shell";
import { DashboardHeader } from "./components/dashboard-header";
import { KpiCards, type KpiCardItem } from "./components/kpi-cards";
// TODO(api): swap mockBuyerDashboardAdapter for the real adapter bound to the
// governed buyer contracts. The shell depends only on the adapter interface.
import { mockBuyerDashboardAdapter } from "./mock-adapter";

// TODO(api): replace these placeholder KPIs with caller-supplied data bound to
// the governed buyer metrics contract. Values/trends are illustrative only.
const kpiItems: KpiCardItem[] = [
  {
    id: "active-rfqs",
    label: "Active RFQs",
    value: "18",
    description: "Open requests awaiting supplier quotes",
    icon: <FileText />,
    trend: { label: "+3 this week", direction: "up" },
  },
  {
    id: "pending-quotations",
    label: "Pending Quotations",
    value: "42",
    description: "Quotes submitted for your review",
    icon: <ClipboardList />,
    trend: { label: "+12%", direction: "up" },
  },
  {
    id: "approved-suppliers",
    label: "Approved Suppliers",
    value: "126",
    description: "Verified vendors in your network",
    icon: <Users />,
    trend: { label: "+5 this month", direction: "up" },
  },
  {
    id: "purchase-orders",
    label: "Purchase Orders",
    value: "37",
    description: "POs issued this quarter",
    icon: <ShoppingCart />,
    trend: { label: "-4%", direction: "down" },
  },
  {
    id: "completed-procurements",
    label: "Completed Procurements",
    value: "214",
    description: "Closed sourcing cycles year to date",
    icon: <CheckCircle2 />,
    trend: { label: "+15%", direction: "up" },
  },
  {
    id: "monthly-savings",
    label: "Monthly Savings",
    value: <IvMoney amount="12,40,000" currency="BDT" />,
    description: "Cost reduction vs. baseline spend",
    icon: <PiggyBank />,
    trend: { label: "+6.4%", direction: "up" },
  },
];

export default async function BuyerDashboardPage() {
  const shell = await mockBuyerDashboardAdapter.getShellContext();

  return (
    <BuyerShell
      title="Dashboard"
      description="Overview of your sourcing activity and pending decisions."
      breadcrumbs={[{ label: "Buyer", href: "#" }, { label: "Dashboard" }]}
      activeNavId="dashboard"
      user={shell.user}
      navBadges={shell.navBadges}
      notificationsLabel={shell.notificationsLabel}
    >
      {/* TODO(api): replace these literal values with caller-supplied data
          bound to the governed session/company contracts. */}
      <DashboardHeader
        greeting="Good Morning"
        userName="Musa"
        companyName="ME BD TECH LTD"
        role="Procurement Manager"
        initials="MB"
        profileItems={[
          { id: "profile", label: "Profile", icon: <CircleUser /> },
          { id: "settings", label: "Settings", icon: <Settings /> },
          { id: "sign-out", label: "Sign out", icon: <LogOut />, variant: "destructive" },
        ]}
      />

      <KpiCards items={kpiItems} />
    </BuyerShell>
  );
}
