// Vendor Dashboard — VX-01 redesign (2026-07-03, owner-directed, verbatim mockup). Replaces the
// prior read-only command center with the owner's reference: a header card (org chip / search /
// notification / message / profile icon links), a 4-tile KPI stat band, a Recent Activity feed, and
// a Global Trust Score panel.
//
// PRESENTATION-FIXTURE SEED (this milestone): the KPI figures and activity rows below are an
// explicitly-labelled presentation fixture — no read is wired yet for RFQ/quote/PO/message counts
// or an activity-event stream. This mirrors the buyer dashboard's own disclosed SEED posture
// ((buyer)/dashboard/page.tsx) exactly: a static, disclosed fixture object, never a client-computed
// count over partial data (which would violate R7 — client-computed counts are non-disclosure-safe).
// The "Live" chip on each KPI tile is presentation-only labelling that the TILE itself is fully
// built/interactive — it is NOT a claim that the figure streams from a live backend read.
//
// GOVERNANCE — three conflicts flagged and adjudicated by the owner before this build (full record
// in the WP card / review-log VX-01 entry):
//  1. "Mushok Challan" nav entry — instruments the still-open `ESC-OPS-DOC-MUSHOK` gap; its own page
//     discloses this plainly (`workspace/documents/mushok-challan/page.tsx`), no VAT document kind
//     is fabricated anywhere.
//  2. Global Trust Score panel — reuses the REAL trust score (permitted per the Board's 2026-07-03
//     display ruling); the Gold/Platinum tier is a NEW, dashboard-only label distinct from the real
//     `FinancialTier`/Trust-Center band vocabulary; no scoring formula/point-delta is exposed;
//     "Increase Score" navigates to the real Company Profile page and does NOT mutate the score
//     itself — see `global-trust-score-card.tsx`'s own header comment for the full disclosure.
//  3. Sidebar re-grouping — every already-shipped page from the prior IA is folded into the new
//     grouping, not dropped (see `vendor-shell-vm.ts`'s own header comment).
import type { Metadata } from "next";
import { Inbox, MessageSquare, ShoppingCart, FileCheck } from "lucide-react";
import { DashboardHeaderCard } from "../../../_components/vendor/dashboard/dashboard-header-card";
import { VendorKpiStatCard } from "../../../_components/vendor/dashboard/vendor-kpi-stat-card";
import {
  RecentActivityFeed,
  type RecentActivityItem,
} from "../../../_components/vendor/dashboard/recent-activity-feed";
import { GlobalTrustScoreCard } from "../../../_components/vendor/dashboard/global-trust-score-card";
import { VENDOR_IDENTITY_SEED } from "../../../_components/vendor/identity-seed";

export const metadata: Metadata = { title: "Dashboard" };

// Presentation-fixture SEED (see header comment) — field-aligned to a plausible, internally
// consistent snapshot; not sourced from any wired read.
const KPI_SEED = {
  totalRfqs: 156,
  activeQuotes: 42,
  newPurchaseOrders: 12,
  messages: 8,
};

const ACTIVITY_SEED: RecentActivityItem[] = [
  {
    id: "act-1",
    title: "New RFQ matching your profile",
    description: 'A buyer is looking for "Industrial Valves" in your region.',
    timeLabel: "1h ago",
  },
  {
    id: "act-2",
    title: "New RFQ matching your profile",
    description: 'A buyer is looking for "Industrial Valves" in your region.',
    timeLabel: "1h ago",
  },
  {
    id: "act-3",
    title: "New RFQ matching your profile",
    description: 'A buyer is looking for "Industrial Valves" in your region.',
    timeLabel: "1h ago",
  },
  {
    id: "act-4",
    title: "New RFQ matching your profile",
    description: 'A buyer is looking for "Industrial Valves" in your region.',
    timeLabel: "1h ago",
  },
];

const TRUST_SEED = {
  score: 88,
  tier: "gold" as const,
  progressToNextTier: 0.72,
};

export default function VendorDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your digital showcase and business portal overview.
        </p>
      </header>

      <DashboardHeaderCard
        userName={VENDOR_IDENTITY_SEED.userName}
        orgName={VENDOR_IDENTITY_SEED.orgName}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VendorKpiStatCard
          label="Total RFQs"
          value={KPI_SEED.totalRfqs}
          live
          icon={<Inbox aria-hidden />}
          tone="brand"
        />
        <VendorKpiStatCard
          label="Active Quotes"
          value={KPI_SEED.activeQuotes}
          live
          icon={<FileCheck aria-hidden />}
          tone="info"
        />
        <VendorKpiStatCard
          label="New POs"
          value={KPI_SEED.newPurchaseOrders}
          live
          icon={<ShoppingCart aria-hidden />}
          tone="success"
        />
        <VendorKpiStatCard
          label="Messages"
          value={KPI_SEED.messages}
          live
          icon={<MessageSquare aria-hidden />}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivityFeed items={ACTIVITY_SEED} />
        </div>
        <GlobalTrustScoreCard
          score={TRUST_SEED.score}
          tier={TRUST_SEED.tier}
          progressToNextTier={TRUST_SEED.progressToNextTier}
        />
      </div>
    </div>
  );
}
