// P-BUY-01 Buyer Dashboard — PRESENTATION (`T-DASHBOARD`, Doc-7F §9.1). Pure function of its view-model
// (a Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// (`page.tsx`) resolves the data via the Doc-7C wired data layer (GI-02) and passes it here; this file
// renders presentation only.
//
// Anatomy (§9.1), redesigned pass: greeting hero (branded welcome + primary CTAs) → priority-approval
// action banner (only when the buyer has items awaiting their decision) → KPI stat-card band → sourcing +
// engagement pipeline widgets → content grid (three work queues + recent activity + quick actions rail).
// First-run (`data === null`) renders the hero + the single "Create RFQ" CTA (§9.1).
//
// GOVERNANCE realized here:
//  • R6 / Inv #12 — there is NO "recommended winner", ranked-to-winner, or auto-select widget anywhere.
//  • Inv #11 / GI-12 — KPI counts carry NO excluded/blacklist figure; CRM status is never shown (it lives
//    only in P-BUY-26/27). `total` renders only if the contract provides it. The priority banner surfaces
//    only the buyer's OWN awaiting-approval count (P-BUY-12), never a party-exclusion figure.
//  • R7 firewall — every figure is a contract read, never client-computed.
//  • Engagement states use the pinned contract-authority set (§0.1 carried Flag-and-Halt).
//  • The hero / quick-actions rail carry only plain NAVIGATION links to existing routes — no second live
//    org-switcher/notification/search widget is instantiated (the shell topbar owns those on every page).

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Building2,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Plus,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { KpiStatCard } from "../_components/kpi-stat-card";
import { WorkQueueCard, type QueueColumn } from "../_components/work-queue-card";
import { SourcingPipelineCard } from "../_components/sourcing-pipeline-card";
import { EngagementPipelineCard } from "../_components/engagement-pipeline-card";
import { ActivityTimeline } from "../_components/activity-timeline";
import { formatDate, Money, Ref } from "../_components/format";
import {
  rfqStateDisplay,
  quotationStateDisplay,
  engagementStateDisplay,
} from "../_components/state-display";
import type {
  BuyerDashboardViewModel,
  RfqQueueRow,
  QuotationQueueRow,
  EngagementQueueRow,
} from "../_components/view-models";

const RFQ_COLUMNS: QueueColumn<RfqQueueRow>[] = [
  {
    key: "rfq",
    header: "RFQ",
    render: (r) => (
      <span className="flex flex-col">
        <span className="truncate">{r.title}</span>
        <Ref>{r.humanRef}</Ref>
      </span>
    ),
  },
  {
    key: "state",
    header: "Status",
    render: (r) => {
      const s = rfqStateDisplay(r.state);
      return <StatusChip label={s.label} tone={s.tone} />;
    },
  },
  { key: "value", header: "Value", numeric: true, render: (r) => <Money value={r.value} /> },
  {
    key: "updated",
    header: "Updated",
    numeric: true,
    hideOnMobile: true,
    render: (r) => <span className="text-muted-foreground">{formatDate(r.updatedAt)}</span>,
  },
];

const QUOTATION_COLUMNS: QueueColumn<QuotationQueueRow>[] = [
  {
    key: "vendor",
    header: "Vendor",
    render: (q) => <span className="truncate">{q.vendorName}</span>,
  },
  {
    key: "state",
    header: "Status",
    render: (q) => {
      const s = quotationStateDisplay(q.state);
      return <StatusChip label={s.label} tone={s.tone} />;
    },
  },
  { key: "amount", header: "Amount", numeric: true, render: (q) => <Money value={q.amount} /> },
  {
    key: "valid",
    header: "Valid until",
    numeric: true,
    hideOnMobile: true,
    render: (q) => (
      <span className="text-muted-foreground">{q.validUntil ? formatDate(q.validUntil) : "—"}</span>
    ),
  },
];

const ENGAGEMENT_COLUMNS: QueueColumn<EngagementQueueRow>[] = [
  {
    key: "engagement",
    header: "Engagement",
    render: (e) => (
      <span className="flex flex-col">
        <span className="truncate">{e.vendorName}</span>
        <Ref>{e.humanRef}</Ref>
      </span>
    ),
  },
  {
    key: "state",
    header: "Status",
    render: (e) => {
      const s = engagementStateDisplay(e.state);
      return <StatusChip label={s.label} tone={s.tone} />;
    },
  },
  { key: "value", header: "Value", numeric: true, render: (e) => <Money value={e.value} /> },
  {
    key: "updated",
    header: "Updated",
    numeric: true,
    hideOnMobile: true,
    render: (e) => <span className="text-muted-foreground">{formatDate(e.updatedAt)}</span>,
  },
];

/** Small uppercase section eyebrow used to group the dashboard's bands (presentation only). */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

/**
 * Greeting hero (redesign pass) — a single branded welcome band that consolidates the page heading + the
 * former utility "dashboard header card". Navy-dominant per the frozen palette (`iv-navy-*`). It carries
 * ONLY plain navigation links + the primary "New RFQ" CTA — NOT a second live org-switcher / notification
 * / search-shortcut instance (the shell topbar owns those interactive widgets on every `(app)` page, so we
 * never double the focus/dropdown state). Echoes the same neutral identity placeholder the topbar renders
 * (`identity-seed.ts`) — never an independently-fabricated name.
 */
function GreetingHero({ userName, orgName }: { userName?: string; orgName?: string }) {
  return (
    <section className="overflow-hidden rounded-xl border border-iv-navy-800/40 bg-gradient-to-br from-iv-navy-800 via-iv-navy-700 to-iv-navy-800 p-6 text-white shadow-iv-md sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-white/60">
            Procurement workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            Welcome back
          </h1>
          {orgName ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
              <Building2 aria-hidden className="size-4 shrink-0" />
              <span className="truncate">
                {orgName}
                {userName ? ` · ${userName}` : ""}
              </span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            className="gap-1.5 border-transparent bg-white text-iv-navy-800 hover:bg-iv-navy-50"
          >
            <Link href="/rfqs/new">
              <Plus aria-hidden />
              New RFQ
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="gap-1.5 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/discover">
              <Search aria-hidden />
              Find vendors
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/**
 * Priority action banner — surfaces the single most time-sensitive buyer action: items awaiting THIS
 * buyer's approval (P-BUY-12). Rendered only when the wired count is > 0; the figure is the buyer's own
 * approval count (a contract read), never a party-exclusion/blacklist figure (Inv #11). It is a plain
 * navigation link into the approvals queue — no decision is made or recommended here (R6).
 */
function ApprovalPriorityBanner({ count }: { count: number }) {
  return (
    <Link
      href="/approvals"
      className="group flex items-center gap-3 rounded-lg border border-iv-amber-200 bg-iv-amber-50 p-4 transition-colors hover:bg-iv-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-iv-amber-100 text-iv-amber-700 [&_svg]:size-5 group-hover:bg-iv-amber-200"
      >
        <ClipboardCheck />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          {count} {count === 1 ? "item" : "items"} awaiting your approval
        </p>
        <p className="text-xs text-muted-foreground">
          Review and decide on pending requests to keep sourcing moving.
        </p>
      </div>
      <ArrowRight
        aria-hidden
        className="ml-auto size-5 shrink-0 text-iv-amber-700 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/** Quick-actions rail — plain navigation shortcuts to existing buyer routes (presentation only, no state). */
const QUICK_ACTIONS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/rfqs/new", label: "New RFQ", icon: <Plus aria-hidden /> },
  { href: "/discover", label: "Find vendors", icon: <Users aria-hidden /> },
  { href: "/documents", label: "Documents", icon: <FolderOpen aria-hidden /> },
  { href: "/approvals", label: "Approvals", icon: <ClipboardCheck aria-hidden /> },
  { href: "/saved-vendors", label: "Saved vendors", icon: <Bookmark aria-hidden /> },
  { href: "/reports", label: "Reports", icon: <BarChart3 aria-hidden /> },
];

function QuickActionsCard() {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col gap-2 rounded-md border border-border p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-iv-navy-50 text-iv-navy-700 [&_svg]:size-4 dark:bg-iv-navy-900/50 dark:text-iv-navy-200">
                {a.icon}
              </span>
              <span className="text-sm font-medium text-foreground">{a.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** First-run empty state (§9.1) — a single "Create RFQ" call-to-action, no fabricated metrics. */
function FirstRunEmpty() {
  return (
    <EmptyState
      icon={<FileText aria-hidden />}
      title="No procurement activity yet"
      description="Create your first RFQ to start sourcing from verified industrial vendors."
      action={
        <Button asChild className="gap-1.5">
          <Link href="/rfqs/new">
            <Plus aria-hidden />
            Create RFQ
          </Link>
        </Button>
      }
      className="py-16"
    />
  );
}

export function BuyerDashboardView({
  data,
  identity,
}: {
  data: BuyerDashboardViewModel | null;
  /** Same neutral identity placeholder the shell renders (Doc-7C SR3 — PARKED); optional so existing
   *  callers/tests need not supply it. */
  identity?: { userName: string; orgName: string };
}) {
  if (data === null) {
    return (
      <section className="flex flex-col gap-6">
        <GreetingHero userName={identity?.userName} orgName={identity?.orgName} />
        <FirstRunEmpty />
      </section>
    );
  }

  const {
    kpis,
    rfqPipeline,
    engagementPipeline,
    rfqQueue,
    quotationQueue,
    engagementQueue,
    recentActivity,
  } = data;
  const winRatePct =
    typeof kpis.winRate === "number" ? `${Math.round(kpis.winRate * 100)}%` : undefined;
  const hasPipelines =
    (rfqPipeline && rfqPipeline.length > 0) ||
    (engagementPipeline && engagementPipeline.length > 0);
  const awaitingApproval =
    typeof kpis.awaitingMyApprovalCount === "number" ? kpis.awaitingMyApprovalCount : 0;

  return (
    <section className="flex flex-col gap-6">
      <GreetingHero userName={identity?.userName} orgName={identity?.orgName} />

      {awaitingApproval > 0 ? <ApprovalPriorityBanner count={awaitingApproval} /> : null}

      {/* KPI stat-card band — every VALUE is a contract read; counts non-disclosure-safe (Inv #11).
          Mobile-first single column, 2-up at sm, full 4-up at xl. `trend` on each card is UI-layer
          illustrative decoration, gated on the real value being present — never shown next to a "—"
          placeholder — same disclosure posture as the rest of this page's presentation-fixture SEED
          (page.tsx's own header comment), not a contract-traced figure (no frozen trend/delta read exists). */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Spend"
          value={kpis.spend ? <Money value={kpis.spend} /> : undefined}
          trend={kpis.spend ? { label: "+6.4% vs last month", direction: "up" } : undefined}
          icon={<Wallet aria-hidden />}
          tone="brand"
        />
        <KpiStatCard
          label="Active RFQs"
          value={typeof kpis.activeRfqCount === "number" ? kpis.activeRfqCount : undefined}
          trend={
            typeof kpis.activeRfqCount === "number"
              ? { label: "+3 this week", direction: "up" }
              : undefined
          }
          icon={<FileText aria-hidden />}
          tone="info"
        />
        <KpiStatCard
          label="Awaiting my approval"
          value={
            typeof kpis.awaitingMyApprovalCount === "number"
              ? kpis.awaitingMyApprovalCount
              : undefined
          }
          icon={<ClipboardCheck aria-hidden />}
          tone="warning"
          caption={
            <Link
              href="/approvals"
              className="text-iv-brand-600 underline-offset-2 hover:underline"
            >
              Review queue
            </Link>
          }
        />
        <KpiStatCard
          label="Win rate"
          value={winRatePct}
          trend={winRatePct ? { label: "+2 pts vs last quarter", direction: "up" } : undefined}
          icon={<TrendingUp aria-hidden />}
          tone="success"
        />
      </div>

      {/* Sourcing + engagement pipelines — pre- and post-award lifecycle funnels (aggregate contract
          reads; observe-only, R6). Each renders only when its own wired read supplies stages; otherwise
          omitted (no fabricated funnel) — the two are independent, not a single combined widget. */}
      {hasPipelines ? (
        <div className="flex flex-col gap-3">
          <SectionLabel>Pipelines</SectionLabel>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {rfqPipeline && rfqPipeline.length > 0 ? (
              <SourcingPipelineCard stages={rfqPipeline} viewAllHref="/rfqs" />
            ) : null}
            {engagementPipeline && engagementPipeline.length > 0 ? (
              <EngagementPipelineCard stages={engagementPipeline} viewAllHref="/engagements" />
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Content grid — three "needs your action" queues (left) + recent activity & quick actions (right,
          per-widget streaming, §9.1). */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Needs your attention</SectionLabel>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="flex flex-col gap-4 xl:col-span-2">
            <WorkQueueCard
              title="RFQs by state"
              columns={RFQ_COLUMNS}
              rows={rfqQueue}
              getRowKey={(r) => r.id}
              getRowHref={(r) => `/rfqs/${r.id}`}
              emptyMessage="No RFQs yet"
              viewAllHref="/rfqs"
            />
            <WorkQueueCard
              title="Quotations awaiting review"
              columns={QUOTATION_COLUMNS}
              rows={quotationQueue}
              getRowKey={(q) => q.id}
              getRowHref={(q) => `/rfqs/${q.rfqId}`}
              emptyMessage="No quotations awaiting review"
            />
            <WorkQueueCard
              title="Engagements needing action"
              columns={ENGAGEMENT_COLUMNS}
              rows={engagementQueue}
              getRowKey={(e) => e.id}
              getRowHref={(e) => `/engagements/${e.id}`}
              emptyMessage="No engagements need action"
              viewAllHref="/engagements"
            />
          </div>
          <div className="flex flex-col gap-4">
            <ActivityTimeline entries={recentActivity} />
            <QuickActionsCard />
          </div>
        </div>
      </div>
    </section>
  );
}
