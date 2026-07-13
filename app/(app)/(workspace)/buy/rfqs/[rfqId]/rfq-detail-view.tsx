// P-BUY-08 Buyer RFQ detail (overview host) — PRESENTATION (`T-DETAILS`, Doc-7F §3.1/§4.2/§10 Section 2).
// Pure function of its view-model (a Server Component; no hooks, no fetch, no mutation — Content ≠
// Presentation, Inv #9). The server page resolves the data via the wired `get_rfq` (GI-02) and passes it.
//
// REUSE: the canonical platform-shell `Breadcrumbs` + `PageHeader` (the detail "hero": title · ref-mono ·
// status chip · actions) and the shared `ActivityTimeline` (lifecycle). Only the tab chrome hydrates.
//
// State plan (§II.6): `null` → **not-found ≡ genuine absence** (byte-identical to a real 404 — no copy/
// layout/timing tell; Inv #11 / GI-12). Terminal/expired states render read-only via a Doc-4M status chip.
//
// GOVERNANCE (load-bearing):
//  • GI-10 — only Doc-4M-permitted buyer actions are offered; the SERVER derives `permittedActions`, the
//    UI renders them and decides nothing. These RFQ-lifecycle writes are audit-backed and PARKED behind
//    `ESC-W2-AUDIT-RLS` + the write-wiring milestone — this milestone renders the affordance only.
//  • The buyer NEVER dispatches an invitation and there is NO engine-bypass dispatch control (R6 / §0.3).
//  • Deferral/exclusion is invisible; no excluded/deferred vendor is ever shown (Doc-3 §4.2 / Inv #11).
//  • Quotations (P-BUY-09) and Activity (P-BUY-10) tabs are now realized (presentation-only; wired later).

import Link from "next/link";
import { FileText, Info } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../../_components/shell";
import { RfqDetailTabs } from "./rfq-detail-tabs";
import { QuotationsTab } from "./quotations-tab";
import { ActivityTimeline } from "../../_components/activity-timeline";
import { DescriptionList, type DescriptionItem } from "../../_components/description-list";
import { formatDate, Money, Ref } from "../../_components/format";
import { rfqStateDisplay } from "../../_components/state-display";
import { ROUTING_MODE_LABEL } from "../../_components/routing-view-models";
import { WORK_NATURE_LABEL } from "../../_components/rfq-create/rfq-options";
import type { RfqDetailData, RfqLifecycleAction } from "../../_components/rfq-view-models";
import type { WorkNature } from "../../_components/rfq-create/rfq-form-models";

/** The requested work-nature set rendered as neutral capability chips (Inv #1: the matrix, not a label). */
function WorkNatureChips({ items }: { items: WorkNature[] }) {
  if (items.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((w) => (
        <StatusChip key={w} label={WORK_NATURE_LABEL[w]} tone="neutral" />
      ))}
    </div>
  );
}

/** Map a lifecycle action's presentation emphasis to a kit Button variant. */
function actionVariant(a: RfqLifecycleAction): "primary" | "outline" | "secondary" {
  if (a.emphasis === "primary") return "primary";
  if (a.emphasis === "danger") return "outline";
  return "secondary";
}

/**
 * Doc-4M-permitted lifecycle actions (GI-10). Presentation affordances only — the underlying writes
 * (`submit_rfq`/`cancel_rfq`/`reissue_rfq`) are audit-backed and wired at a later milestone (parked
 * behind `ESC-W2-AUDIT-RLS`). Rendered only in the populated view; never in the not-found state.
 */
function LifecycleActions({ actions }: { actions: RfqLifecycleAction[] }) {
  if (actions.length === 0) return null;
  return (
    <>
      {actions.map((a) => (
        <Button key={a.key} variant={actionVariant(a)} size="sm">
          {a.label}
        </Button>
      ))}
    </>
  );
}

/** Overview tab — RFQ meta (left) + read-only lifecycle timeline (right). This IS P-BUY-08. */
function OverviewTab({ data }: { data: RfqDetailData }) {
  // Facts are all frozen `get_rfq` content, surfaced by intent; each row is included only when the read
  // supplies it (no fabricated value). `work_nature`/`routing_mode`/`current_version_no` add procurement
  // context (BX-02) — capability matrix (Inv #1), routing breadth (observe-only, R6), and the versioned
  // revision (Inv #8, cross-linking P-BUY-11).
  const items: DescriptionItem[] = [
    ...(data.workNature && data.workNature.length > 0
      ? [{ label: "Request type", value: <WorkNatureChips items={data.workNature} /> }]
      : []),
    { label: "Category", value: data.category ?? "—" },
    ...(data.routingMode
      ? [{ label: "Routing", value: ROUTING_MODE_LABEL[data.routingMode] }]
      : []),
    { label: "Budget", value: <Money value={data.value} /> },
    { label: "Delivery location", value: data.deliveryLocation ?? "—" },
    { label: "Needed by", value: data.neededBy ? formatDate(data.neededBy) : "—" },
    ...(typeof data.currentVersionNo === "number"
      ? [
          {
            label: "Version",
            value: (
              <span className="flex flex-wrap items-center gap-2">
                <span>v{data.currentVersionNo}</span>
                <Link
                  href={`/buy/rfqs/${data.id}/versions`}
                  className="rounded-sm text-xs text-iv-brand-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Version history
                </Link>
              </span>
            ),
          },
        ]
      : []),
    { label: "Created", value: formatDate(data.createdAt) },
    { label: "Last updated", value: formatDate(data.updatedAt) },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-semibold">Request details</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {/* Summary as a lead paragraph (better hierarchy than a definition row for longer scope text). */}
          {data.summary ? <p className="mb-3 text-sm text-foreground">{data.summary}</p> : null}
          <DescriptionList items={items} />
        </CardContent>
      </Card>
      <ActivityTimeline entries={data.lifecycle} />
    </div>
  );
}

/**
 * Activity tab (P-BUY-10 · `T-DETAILS`, page_inventory "routing / audit reads"). The RFQ's lifecycle +
 * routing history as a read-only timeline, sourced from the immutable M0 audit (Inv #8). DEFERRAL/EXCLUSION
 * IS INVISIBLE (Inv #11 / Doc-3 §4.2 / GI-12): a not-invited or deferred vendor is NEVER shown — the tab
 * renders only the disclosed activity entries the read supplies (ActivityTimeline computes/infers nothing).
 */
function ActivityTab({ data }: { data: RfqDetailData }) {
  return (
    <div className="flex flex-col gap-4">
      <ActivityTimeline entries={data.lifecycle} title="Activity" emptyLabel="No activity yet" />
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        The RFQ&rsquo;s lifecycle and routing history. Vendors who were not invited — or whose
        invitation was deferred — are never shown here.
      </p>
    </div>
  );
}

function NotFoundState() {
  // Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). The breadcrumb shows only the parent
  // list (never a leaf ref that would imply the RFQ exists).
  return (
    <>
      <Breadcrumbs items={[{ label: "RFQs", href: "/buy/rfqs" }]} className="mb-4" />
      {/* FZ-02: the in-view genuine-absence branch still needs a page heading; kept sr-only so the
          visual stays the minimal EmptyState card (its title renders as a <p>, not a heading). */}
      <h1 className="sr-only">RFQ not found</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="RFQ not found"
        description="This RFQ doesn't exist or isn't available."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/buy/rfqs">Back to RFQs</Link>
          </Button>
        }
        className="py-16"
      />
    </>
  );
}

export function RfqDetailView({
  data,
  journey,
}: {
  data: RfqDetailData | null;
  /** Optional journey-orientation slot (navigation-not-state), rendered between the header and the
   *  tabs — NEVER in the not-found branch (byte-identical genuine absence, Inv #11 / GI-12). */
  journey?: React.ReactNode;
}) {
  if (data === null) {
    return <NotFoundState />;
  }

  const status = rfqStateDisplay(data.state);

  return (
    <>
      <Breadcrumbs
        items={[{ label: "RFQs", href: "/buy/rfqs" }, { label: data.humanRef }]}
        className="mb-4"
      />
      <PageHeader
        title={data.title}
        meta={
          <>
            <Ref>{data.humanRef}</Ref>
            <StatusChip label={status.label} tone={status.tone} />
          </>
        }
        actions={<LifecycleActions actions={data.permittedActions} />}
      />
      {journey ? <div className="mb-4">{journey}</div> : null}
      {/* The (server-rendered) tab contents are handed to the thin client tab chrome (only it hydrates). */}
      <RfqDetailTabs
        overview={<OverviewTab data={data} />}
        quotations={<QuotationsTab data={data.quotations ?? null} rfqId={data.id} />}
        activity={<ActivityTab data={data} />}
      />
    </>
  );
}
