// Vendor Dashboard — 7-row layout rebuild (owner-directed 2026-07-18, against the claude.ai/design
// "Vendor Dashboard" canvas). Supersedes the VX-02 4-KPI body with the canvas's full structure:
// a 6-up KPI band, then five two/three-column rows (pipeline · priorities · leads · inquiries ·
// documents · engagement · finance · activity · trust · subscription · quick-actions).
//
// DATA POSTURE — VX-03 (owner directive 2026-07-17): NO DEMO DATA on the vendor console. No vendor read
// is wired yet, so EVERY figure renders its honest empty/"—" path (the KPI tiles' neutral "—", the kit
// EmptyState for unbuilt-read panels, the absent-score Trust ring). When the M3/M4/M5 reads land, their
// values replace these placeholders unchanged. This is the "honest placeholders" option the owner chose
// over shipping the canvas's sample data onto the governed live page.
//
// WHAT THE CANVAS SHOWS vs WHAT IS HERE (all owner-ruled substitutions, disclosed):
//  • "Good morning, Musa 👋" greeting → a time-neutral, NAMELESS "Welcome back" (a time-of-day claim
//    needs a client clock — forbidden repo-wide; no fabricated person until SR3 identity is wired).
//  • 6 KPI tiles with "+N this week" delta chips → tiles with a QUALITATIVE caption and no delta (a
//    week-over-week delta is a time-bucket no vendor read provides). "Follow-ups due" renders "—" with
//    NO count (ND-8 forbids a lead aggregate; see `next-actions-card.tsx`).
//  • Populated pipeline / RFQ-leads / buyer-inquiries / buyer-engagement lists + the monthly bar chart
//    → kit EmptyState panels (reads unbuilt; NO charting library exists in this repo — the chart is an
//    empty state, not an invented chart). See `dashboard-placeholder-panels.tsx` for the per-panel flags.
//  • Sidebar/topbar chrome → NOT re-rendered here: the shared workspace shell owns it (this page is the
//    `<main>` only). The design's light chrome is already the app's shell (light nav tokens, navy brand).
import type { Metadata } from "next";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "../../../_components/shell";
import { Button } from "@/frontend/primitives/button";
import { VendorKpiStatCard } from "../../../_components/vendor/dashboard/vendor-kpi-stat-card";
import { RecentDocumentsCard } from "../../../_components/vendor/dashboard/recent-documents-card";
import { NextActionsCard } from "../../../_components/vendor/dashboard/next-actions-card";
import { GlobalTrustScoreCard } from "../../../_components/vendor/dashboard/global-trust-score-card";
import {
  FinancialSnapshotPanel,
  PlaceholderPanel,
  QuickActionsPanel,
  SubscriptionPanel,
} from "../../../_components/vendor/dashboard/dashboard-placeholder-panels";

export const metadata: Metadata = { title: "Dashboard" };

// Six KPI tiles (the canvas's KPI band). Captions are QUALITATIVE descriptors of what each figure will
// count — never a figure themselves; every tile renders "—" until its read is wired.
const KPI_TILES = [
  { label: "Open RFQs", caption: "Invitations awaiting your quote" },
  { label: "Active quotations", caption: "Submitted, awaiting buyer response" },
  { label: "New purchase orders", caption: "Awaiting your acknowledgement" },
  { label: "Bills receivable", caption: "Outstanding across invoices" },
  { label: "Follow-ups due", caption: "Leads needing your next action" },
  { label: "Unread messages", caption: "Buyer inquiries in your inbox" },
];

export default function VendorDashboardPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Welcome back"
        description="Your quotations, documents and buyer follow-ups at a glance."
        meta={
          <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
            Selling · Overview
          </span>
        }
        actions={
          <>
            {/* Export is presentation-only until a report read is wired (disabled, not faked). */}
            <Button variant="outline" disabled>
              <Download aria-hidden className="size-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/sell/documents">
                <Plus aria-hidden className="size-4" />
                New Document
              </Link>
            </Button>
          </>
        }
      />

      {/* Row 1 — KPI band. 3-up on normal screens (full labels, aligned values); 6-up only when the
          viewport is wide enough to show all six without truncating. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-6">
        {KPI_TILES.map((kpi) => (
          <VendorKpiStatCard key={kpi.label} label={kpi.label} caption={kpi.caption} />
        ))}
      </div>

      {/* Row 2 — Sales pipeline + Today's priorities */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <PlaceholderPanel
          title="Sales pipeline"
          actionLabel="View pipeline"
          // Cluster #1 merge (Team-1 F1): the pipeline board now lives on the merged RFQ workspace.
          actionHref="/sell/rfqs?view=board"
          emptyTitle="No pipeline activity yet"
          emptyDescription="Your RFQ pipeline appears here as leads move through quoting, negotiation and award."
        />
        <NextActionsCard leads={[]} />
      </div>

      {/* Row 3 — Latest RFQ invitations + Buyer inquiries */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <PlaceholderPanel
          // "RFQ Leads" retired (Team-1 F4 · closure record §3-D4): the received-invitation register
          // reads "RFQ invitations" — the retired nav-label collision is gone. Opens the inbox lens.
          title="Latest RFQ invitations"
          actionLabel="View all"
          actionHref="/sell/rfqs"
          emptyTitle="No RFQ invitations yet"
          emptyDescription="Matched RFQ invitations from buyers will appear here."
        />
        <PlaceholderPanel
          title="Buyer inquiries"
          actionLabel="View inbox"
          actionHref="/sell/inquiries"
          emptyTitle="No buyer inquiries yet"
          emptyDescription="Direct inquiries from buyers about your products and services will appear here."
        />
      </div>

      {/* Row 4 — Recent business documents + Buyer engagement */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <RecentDocumentsCard rows={[]} />
        <PlaceholderPanel
          title="Buyer engagement"
          emptyTitle="Engagement insights coming soon"
          emptyDescription="Profile views, catalog downloads and microsite visits will appear here once analytics are connected."
        />
      </div>

      {/* Row 5 — Financial snapshot + Monthly activity */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <FinancialSnapshotPanel />
        <PlaceholderPanel
          title="Monthly activity"
          emptyTitle="Activity trends coming soon"
          emptyDescription="Your monthly RFQ, quotation and billing trends will chart here once reporting is available."
        />
      </div>

      {/* Row 6 — Trust score + Subscription + Quick actions */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <GlobalTrustScoreCard />
        <SubscriptionPanel />
        <QuickActionsPanel />
      </div>
    </div>
  );
}
