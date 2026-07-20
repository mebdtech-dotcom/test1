// Vendor Dashboard — placeholder panels for the 7-row layout rebuild (owner-directed, 2026-07-18,
// against the claude.ai/design "Vendor Dashboard" canvas). PRESENTATION ONLY, reusing the kit
// `DashboardSection` + `EmptyState` (never re-implementing them — Review-A duplication rule).
//
// DATA POSTURE — VX-03 (owner directive 2026-07-17): NO DEMO DATA on the vendor console. No vendor read
// is wired yet (M3/M4/M5 FE reads unbuilt), so every panel here renders its HONEST empty/"—" path, never
// a fabricated figure or row. When a read lands, its values replace these placeholders unchanged.
//
// GOVERNANCE FLAGS carried by these panels (built count-less / chart-less on purpose):
//  • `PlaceholderPanel` (Sales pipeline · Latest RFQ leads · Buyer inquiries · Buyer engagement ·
//    Monthly activity) — each backing read is unbuilt; the design's populated funnel/list/analytics/
//    bar-chart is replaced by the empty state. The Monthly-activity bar chart specifically has NO
//    charting library in this repo and no time-series field on any vendor read (the same GR#8 objection
//    VX-01/VX-02 recorded), so it is an empty state, not an invented chart. Buyer-engagement analytics
//    (profile views, catalog downloads) are M2 reads that do not exist yet.
//  • `FinancialSnapshotPanel` — four "—" tiles; the ৳ figures are M4 finance reads, unbuilt.
//  • `SubscriptionPanel` — "—" rows; RFQs-remaining / lead-balance / renewal are M7 entitlement reads,
//    unbuilt (and are UI display only — never a plan-name string check, Inv #10).
//  • `QuickActionsPanel` — the ONLY fully-shippable panel: every tile is a real navigation link to an
//    existing route (no data, no disabled items — owner refinement "only pages that exist").
import Link from "next/link";
import type { ReactNode } from "react";
import { FilePlus2, Package, Receipt, RefreshCw, Truck, UserPlus } from "lucide-react";
import { EmptyState } from "@/frontend/components/empty-state";
import { DashboardSection } from "./dashboard-section";

/** A "View all →" style header affordance, matching the other dashboard cards. */
function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="shrink-0 text-sm font-medium text-iv-brand-600 hover:underline">
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

/** A section whose backing read is not wired yet — renders the honest empty path (VX-03). */
export function PlaceholderPanel({
  title,
  actionLabel,
  actionHref,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  emptyTitle: string;
  emptyDescription?: string;
}) {
  return (
    <DashboardSection
      title={title}
      action={
        actionHref ? (
          <PanelLink href={actionHref}>{actionLabel ?? "View all"}</PanelLink>
        ) : undefined
      }
      contentClassName="flex items-center"
    >
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="w-full border-0 py-8"
      />
    </DashboardSection>
  );
}

/** Financial snapshot — four honest "—" tiles (৳ figures are unbuilt M4 finance reads). */
const FINANCE_TILES = ["Outstanding", "Paid this month", "Pending bills", "Overdue"];

export function FinancialSnapshotPanel() {
  return (
    <DashboardSection
      title="Financial snapshot"
      action={<PanelLink href="/sell/finance">View finance</PanelLink>}
    >
      <div className="grid grid-cols-2 gap-3">
        {FINANCE_TILES.map((label) => (
          <div key={label} className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              —
            </p>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}

/** Subscription — "—" rows (RFQs remaining / lead balance / renewal are unbuilt M7 entitlement reads;
 *  UI display only, never a plan-name string check). */
const SUBSCRIPTION_ROWS = ["RFQs remaining", "Lead balance", "Renewal date"];

export function SubscriptionPanel() {
  return (
    <DashboardSection
      title="Subscription"
      action={<PanelLink href="/account/subscription">Manage</PanelLink>}
    >
      <dl className="divide-y divide-border">
        {SUBSCRIPTION_ROWS.map((label) => (
          <div key={label} className="flex items-center justify-between py-2.5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="font-mono text-sm font-semibold text-foreground">—</dd>
          </div>
        ))}
      </dl>
    </DashboardSection>
  );
}

/** Quick actions — the only fully-shippable panel: real navigation links, no data, no disabled items. */
const QUICK_ACTIONS = [
  { label: "Submit new quote", href: "/sell/rfqs", icon: FilePlus2 },
  { label: "Upload product", href: "/sell/company/products", icon: Package },
  { label: "Create challan", href: "/sell/documents?stage=challan", icon: Truck },
  { label: "Create invoice", href: "/sell/documents?stage=trade_invoice", icon: Receipt },
  { label: "Add buyer", href: "/sell/buyer-relationships", icon: UserPlus },
  { label: "Update showcase", href: "/sell/company", icon: RefreshCw },
] as const;

export function QuickActionsPanel() {
  return (
    <DashboardSection title="Quick actions">
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2.5 rounded-lg border border-border p-3 text-sm font-medium text-foreground transition-colors hover:border-iv-brand-300 hover:bg-muted/50"
            >
              <Icon aria-hidden className="size-4 shrink-0 text-iv-brand-600" />
              <span className="truncate">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </DashboardSection>
  );
}
