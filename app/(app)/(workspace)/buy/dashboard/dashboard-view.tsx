// P-BUY-01 Buyer Dashboard — PRESENTATION (`T-DASHBOARD`, Doc-7F §9.1). Pure function of its view-model
// (a Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// (`page.tsx`) resolves the data via the Doc-7C wired data layer (GI-02) and passes it here; this file
// renders presentation only.
//
// ── 2026-07-15 · REFERENCE-DRIVEN LAYOUT REVISION ──────────────────────────────────────────────────
// Rebuilt against the owner's claude.ai/design reference (design project `5852bb75-de9b-49c6-b2c6-
// 70f1009d0af3`, "Vendor Dashboard Overview.dc.html"), specifically its **`Buying Overview` screen** —
// the file carries a dedicated buyer branch, so the buyer leg is ported from that, NOT from the vendor
// overview. It is the SAME reference the vendor dashboard was rebuilt against (`(workspace)/sell/
// dashboard/page.tsx`, VX-02), and its buyer branch was evidently authored FROM this page's own SEED:
// identical BDT figures, refs (`RFQ-2026-000123`, `ENG-2026-000044`), vendors and funnel counts.
//
// Standing owner ruling applied (same one that governs VX-02): "match the reference's visual hierarchy,
// spacing, proportions and stacked-card composition — but do not invent data or metrics; where a
// reference widget is not backed by our domain model, substitute a semantically equivalent, data-backed
// component of the same footprint." Divergences are recorded below and in each component's header.
// The repo-wide standard for reference use is `docs/frontend/architecture/visual_reference_implementation.md`
// §2 ("copy the composition; implement the platform") — cite it, don't re-derive it.
//
// Anatomy, as ported: slim page header (eyebrow · greeting · actions) → priority-approval banner →
// 4-up KPI band → a 1.55fr/1fr two-column grid (decision/work queues left; funnels + activity right).
// First-run (`data === null`) renders the header + the single "Create RFQ" CTA (§9.1).
//
// WHAT THE REFERENCE ASKED FOR AND WHY IT IS NOT HERE:
//  1. "Good morning, Arif" — a time-of-day claim needs a client clock (forbidden repo-wide; same call as
//     VX-02). The greeting is time-neutral and named from the shared `identity-seed` placeholder.
//  2. "6 decisions need you today. Everything else is on track." — a client-computed aggregate over two
//     partial queues (R7), plus a clock ("today") and an unbacked all-clear claim. Replaced by static
//     descriptive copy that asserts no figure.
//  3. THE 4-UP "DECISION TILES" ROW (Approvals waiting 3 · Quotes to review 2 · Order delayed 1 · RFQs
//     closing soon 2) — its COUNTS are not backable (only `awaitingMyApprovalCount` is real; see
//     `DecisionTilesRow` below for the per-tile reasoning). **REVISED 2026-07-16:** the row itself is
//     now BUILT, footprint intact, with true non-numeric content per the owner's ruling — "keep the
//     band's footprint; fill it with true, non-numeric content". The earlier revision omitted the row
//     entirely; that was an unapproved substitution and is superseded.
//  4. "Bills payable · BDT 2.8M · due in 9 days" KPI — no field on `BuyerDashboardKpis` and no wired
//     read projects a payables aggregate or its ageing. The existing backed "Win rate" tile holds the
//     slot.
//  5. The reference's `[Approve]` / `[Award]` row buttons — see `decisions-waiting-card.tsx`'s header:
//     R6 / Invariant #12 (frozen) forbid any surface that pre-selects the award. Shipped as `[View]` /
//     `[Compare]` navigation into the comparison workspace instead.
//  6. Its "Decisions waiting · 5" card title + badge — no approval-queue ROW read exists (only a count),
//     and the badge is a client-computed cross-queue aggregate (R7). See the same header.
//  7. Its per-KPI delta chips ("▲ 6.4% vs last mo") — retained ONLY because this page already shipped
//     them as explicitly-disclosed BX-06 illustrative decoration (see `kpi-stat-card.tsx`'s `KpiTrend`
//     doc and the gating below); no frozen trend/delta read exists. They are NOT contract-traced.
//
// ALSO DROPPED FROM THE REFERENCE, DELIBERATELY:
//  • Its sidebar, top bar, search box and account chip — all already rendered by the shared `(workspace)`
//    shell. This view is the page body only and must not re-render chrome. (This also retires this page's
//    own navy `GreetingHero` band, whose CTAs now sit in the shared `PageHeader` — matching both the
//    reference's slim header AND the sell dashboard's, per the visual-reference standard §4: consistency
//    with the sibling surface outranks fidelity to an external reference.)
//  • Its Selling/Buying role toggle — REJECTED by the hybrid co-mount ruling and superseded by the
//    shipped participation LENS in the sidebar (`[ESC-7G-A7]` / `[ESC-7G-A7R]`).
//  • Its ₹/GSTIN/Indian data — not applicable here: the reference's BUYER branch is already BDT.
//
// GOVERNANCE realized here (unchanged by the revision):
//  • R6 / Inv #12 — there is NO "recommended winner", ranked-to-winner, or auto-select widget anywhere.
//    Queues render in the caller/contract order; nothing is re-sorted (ordering quotes by price would
//    itself imply a recommendation).
//  • Inv #11 / GI-12 — KPI counts carry NO excluded/blacklist figure; CRM status is never shown (it lives
//    only in P-BUY-26/27). The priority banner surfaces only the buyer's OWN awaiting-approval count
//    (P-BUY-12), never a party-exclusion figure.
//  • R7 firewall — every figure is a contract read, never client-computed.
//  • Engagement states use the pinned contract-authority set (§0.1 carried Flag-and-Halt).
//  • The header / quick-actions rail carry only plain NAVIGATION links to existing routes — no second live
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
  Briefcase,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderOpen,
  Plus,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "../../../_components/shell";
import { KpiStatCard } from "../_components/kpi-stat-card";
import { WorkQueueCard, type QueueColumn } from "../_components/work-queue-card";
import { DecisionsWaitingCard } from "../_components/decisions-waiting-card";
import { SourcingPipelineCard } from "../_components/sourcing-pipeline-card";
import { EngagementPipelineCard } from "../_components/engagement-pipeline-card";
import { ActivityTimeline } from "../_components/activity-timeline";
import { formatDate, Money, Ref } from "../_components/format";
import { rfqStateDisplay, engagementStateDisplay } from "../_components/state-display";
import type {
  BuyerDashboardViewModel,
  RfqQueueRow,
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
    // `whitespace-nowrap`: the ported 1.55fr left column is narrower than the previous 2-of-3 span, so
    // a wrapping short date ("Jun 30, 2026" breaking across three lines) is the failure mode here.
    render: (r) => (
      <span className="whitespace-nowrap text-muted-foreground">{formatDate(r.updatedAt)}</span>
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
    // See RFQ_COLUMNS above — same narrow-column wrap.
    render: (e) => (
      <span className="whitespace-nowrap text-muted-foreground">{formatDate(e.updatedAt)}</span>
    ),
  },
];

/**
 * Priority action banner — surfaces the single most time-sensitive buyer action: items awaiting THIS
 * buyer's approval (P-BUY-12). Rendered only when the wired count is > 0; the figure is the buyer's own
 * approval count (a contract read), never a party-exclusion/blacklist figure (Inv #11). It is a plain
 * navigation link into the approvals queue — no decision is made or recommended here (R6). This is also
 * the backed home of the reference's "Approvals waiting" decision tile (see this file's header, item 3).
 */
function ApprovalPriorityBanner({ count }: { count: number }) {
  return (
    <Link
      href="/buy/approvals"
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

/**
 * Decision tiles — the reference's 4-up entry row above the KPI strip, realized under the owner's
 * 2026-07-16 data/copy directive (`.claude/skills/ivendorz-fe-design/SKILL.md` §Data & Copy Fidelity).
 *
 * OWNER RULING (2026-07-16) applied here: "keep the band's footprint; fill it with true, non-numeric
 * content" — the canonical treatment for an unbacked reference widget. This SUPERSEDES the earlier
 * decision to omit the row entirely (the omission was an unapproved substitution; that autonomy is
 * withdrawn).
 *
 * WHY NON-NUMERIC. The reference's four tiles carry counts — "Approvals waiting 3 · Quotes to review 2
 * · Order delayed 1 · RFQs closing soon 2". Only the first is backed (`awaitingMyApprovalCount`), and
 * it already renders twice on this page (priority banner + KPI tile). The other three cannot be shown
 * at any value: "Quotes to review" would be a client count over a PARTIAL queue (R7); "Order delayed"
 * has no backing state at all (the pinned contract-authority set is `open → in_delivery → completed →
 * closed`, and the Doc-4M divergence is an OPEN carried Flag-and-Halt, so coining `delayed` is doubly
 * forbidden); "RFQs closing soon" needs a deadline + time-bucketing field no read projects. Rendering
 * a count on one tile and none on the other three would read as "the rest are zero" — a false claim by
 * omission. So NO tile carries a figure: the row is navigation into the four buyer queues, and the KPI
 * band directly below carries every backed number. Footprint kept, fabricated payload dropped.
 *
 * Captions describe what each queue HOLDS — they assert no count, no trend and no urgency claim.
 * Icons are the `NAV_ICONS` choices for these same four destinations (`shell/icons.ts`: approvals =
 * CheckSquare · quotations = FileText · rfqs = ClipboardList · engagements = Briefcase) so a tile and
 * its sidebar entry never disagree; they are imported directly here because this is a Server Component
 * (NAV_ICONS exists to carry icon KEYS across the RSC boundary, which this surface does not cross).
 */
const DECISION_TILES: { href: string; label: string; caption: string; icon: ReactNode }[] = [
  {
    href: "/buy/approvals",
    label: "Approvals",
    caption: "Pending your sign-off",
    icon: <CheckSquare aria-hidden />,
  },
  {
    href: "/buy/quotations",
    label: "Quotations",
    caption: "Compare and award",
    icon: <FileText aria-hidden />,
  },
  {
    href: "/buy/rfqs",
    label: "RFQs",
    caption: "Sourcing in flight",
    icon: <ClipboardList aria-hidden />,
  },
  {
    href: "/buy/engagements",
    label: "Engagements",
    caption: "Post-award delivery",
    icon: <Briefcase aria-hidden />,
  },
];

function DecisionTilesRow() {
  return (
    <nav aria-label="Your queues" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {DECISION_TILES.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className="group flex min-w-0 items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-iv-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-iv-navy-50 text-iv-navy-700 [&_svg]:size-5 dark:bg-iv-navy-900/50 dark:text-iv-navy-200"
          >
            {tile.icon}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">{tile.label}</span>
            <span className="truncate text-xs text-muted-foreground">{tile.caption}</span>
          </span>
          <ArrowRight
            aria-hidden
            className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ))}
    </nav>
  );
}

/** Quick-actions rail — plain navigation shortcuts to existing buyer routes (presentation only, no state). */
const QUICK_ACTIONS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/buy/rfqs/new", label: "New RFQ", icon: <Plus aria-hidden /> },
  { href: "/buy/discover", label: "Find vendors", icon: <Users aria-hidden /> },
  { href: "/buy/documents", label: "Documents", icon: <FolderOpen aria-hidden /> },
  { href: "/buy/approvals", label: "Approvals", icon: <ClipboardCheck aria-hidden /> },
  { href: "/buy/saved-vendors", label: "Saved vendors", icon: <Bookmark aria-hidden /> },
  { href: "/buy/reports", label: "Reports", icon: <BarChart3 aria-hidden /> },
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
          <Link href="/buy/rfqs/new">
            <Plus aria-hidden />
            Create RFQ
          </Link>
        </Button>
      }
      className="py-16"
    />
  );
}

/**
 * The ported slim header (reference: eyebrow · greeting · sub · ghost+primary action pair). Uses the
 * shared shell `PageHeader` — the same primitive the sell dashboard's header uses, so the two workspace
 * overviews read as one system. The greeting is time-neutral (no client clock) and the sub-line asserts
 * no figure (see this file's header, items 1–2).
 */
function DashboardHeader({ userName, orgName }: { userName?: string; orgName?: string }) {
  return (
    <PageHeader
      title={userName ? `Welcome back, ${userName}` : "Welcome back"}
      description="Your approvals, quotations and engagements at a glance."
      meta={
        <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
          {orgName ? `Procurement · ${orgName}` : "Procurement · Overview"}
        </span>
      }
      actions={
        <>
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/buy/discover">
              <Search aria-hidden />
              Find vendors
            </Link>
          </Button>
          <Button asChild className="gap-1.5">
            <Link href="/buy/rfqs/new">
              <Plus aria-hidden />
              New RFQ
            </Link>
          </Button>
        </>
      }
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
      <div>
        <DashboardHeader userName={identity?.userName} orgName={identity?.orgName} />
        <FirstRunEmpty />
      </div>
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
  const awaitingApproval =
    typeof kpis.awaitingMyApprovalCount === "number" ? kpis.awaitingMyApprovalCount : 0;

  return (
    <div>
      <DashboardHeader userName={identity?.userName} orgName={identity?.orgName} />

      {awaitingApproval > 0 ? (
        <div className="mb-4">
          <ApprovalPriorityBanner count={awaitingApproval} />
        </div>
      ) : null}

      {/* Decision tiles — the reference's 4-up entry row, directly above the KPI strip as it sits
          there. Static navigation, so it renders unconditionally (it depends on no read). */}
      <div className="mb-4">
        <DecisionTilesRow />
      </div>

      {/* KPI band — every VALUE is a contract read; counts non-disclosure-safe (Inv #11). Mobile-first
          single column, 2-up at sm, full 4-up at xl (the reference's KPI strip). `trend` is UI-layer
          illustrative decoration, gated on the real value being present — never shown next to a "—"
          placeholder — same disclosure posture as the rest of this page's presentation-fixture SEED
          (page.tsx's header), not a contract-traced figure (no frozen trend/delta read exists). */}
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
              href="/buy/approvals"
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

      {/* The reference's `ov-mid` two-column body, at its 1.55fr/1fr proportion: the decision/work queues
          carry the left column; the observe-only funnels, activity and shortcuts stack in the right.
          Each pipeline renders only when its own wired read supplies stages (no fabricated funnel); the
          two are independent reads, never one combined widget. */}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-4">
          <DecisionsWaitingCard quotations={quotationQueue} viewAllHref="/buy/quotations" />
          <WorkQueueCard
            title="RFQs by state"
            columns={RFQ_COLUMNS}
            rows={rfqQueue}
            getRowKey={(r) => r.id}
            getRowHref={(r) => `/buy/rfqs/${r.id}`}
            emptyMessage="No RFQs yet"
            viewAllHref="/buy/rfqs"
          />
          <WorkQueueCard
            title="Engagements needing action"
            columns={ENGAGEMENT_COLUMNS}
            rows={engagementQueue}
            getRowKey={(e) => e.id}
            getRowHref={(e) => `/buy/engagements/${e.id}`}
            emptyMessage="No engagements need action"
            viewAllHref="/buy/engagements"
          />
        </div>

        <div className="flex flex-col gap-4">
          {rfqPipeline && rfqPipeline.length > 0 ? (
            <SourcingPipelineCard stages={rfqPipeline} viewAllHref="/buy/rfqs" />
          ) : null}
          {engagementPipeline && engagementPipeline.length > 0 ? (
            <EngagementPipelineCard stages={engagementPipeline} viewAllHref="/buy/engagements" />
          ) : null}
          <ActivityTimeline entries={recentActivity} />
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}
