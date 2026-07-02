// P-BUY-01 Buyer Dashboard — PRESENTATION (`T-DASHBOARD`, Doc-7F §9.1). Pure function of its view-model
// (a Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// (`page.tsx`) resolves the data via the Doc-7C wired data layer (GI-02) and passes it here; this file
// renders presentation only.
//
// Anatomy (§9.1): page-header → KPI stat-card band → sourcing + engagement pipeline widgets (FE-BUY-08
// adds the second) → content grid (three work queues + recent activity) → optional right-rail. First-run
// (`data === null`) renders the single "Create RFQ" CTA (§9.1).
//
// GOVERNANCE realized here:
//  • R6 / Inv #12 — there is NO "recommended winner", ranked-to-winner, or auto-select widget anywhere.
//  • Inv #11 / GI-12 — KPI counts carry NO excluded/blacklist figure; CRM status is never shown (it lives
//    only in P-BUY-26/27). `total` renders only if the contract provides it.
//  • R7 firewall — every figure is a contract read, never client-computed.
//  • Engagement states use the pinned contract-authority set (§0.1 carried Flag-and-Halt).

import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "../../_components/shell";
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

export function BuyerDashboardView({ data }: { data: BuyerDashboardViewModel | null }) {
  if (data === null) {
    return (
      <section className="flex flex-col gap-6">
        {/* FZ-03: routed through the shell PageHeader (font-bold) instead of a hand-rolled h1
            (was font-semibold) — the same heading text shared with the populated view below. */}
        <PageHeader title="Procurement" />
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

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Procurement"
        description="Your procurement at a glance."
        actions={
          <Button asChild className="gap-1.5">
            <Link href="/rfqs/new">
              <Plus aria-hidden />
              New RFQ
            </Link>
          </Button>
        }
      />

      {/* KPI stat-card band — every figure a contract read; counts non-disclosure-safe (Inv #11). */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiStatCard label="Spend" value={kpis.spend ? <Money value={kpis.spend} /> : undefined} />
        <KpiStatCard
          label="Active RFQs"
          value={typeof kpis.activeRfqCount === "number" ? kpis.activeRfqCount : undefined}
        />
        <KpiStatCard
          label="Awaiting my approval"
          value={
            typeof kpis.awaitingMyApprovalCount === "number"
              ? kpis.awaitingMyApprovalCount
              : undefined
          }
          caption={
            <Link
              href="/approvals"
              className="text-iv-brand-600 underline-offset-2 hover:underline"
            >
              Review queue
            </Link>
          }
        />
        <KpiStatCard label="Win rate" value={winRatePct} />
      </div>

      {/* Sourcing + engagement pipelines — pre- and post-award lifecycle funnels (aggregate contract
          reads; observe-only, R6). Each renders only when its own wired read supplies stages; otherwise
          omitted (no fabricated funnel) — the two are independent, not a single combined widget. */}
      {(rfqPipeline && rfqPipeline.length > 0) ||
      (engagementPipeline && engagementPipeline.length > 0) ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {rfqPipeline && rfqPipeline.length > 0 ? (
            <SourcingPipelineCard stages={rfqPipeline} viewAllHref="/rfqs" />
          ) : null}
          {engagementPipeline && engagementPipeline.length > 0 ? (
            <EngagementPipelineCard stages={engagementPipeline} viewAllHref="/engagements" />
          ) : null}
        </div>
      ) : null}

      {/* Content grid — three "needs your action" queues + recent activity (per-widget streaming, §9.1). */}
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
        <ActivityTimeline entries={recentActivity} />
      </div>
    </section>
  );
}
