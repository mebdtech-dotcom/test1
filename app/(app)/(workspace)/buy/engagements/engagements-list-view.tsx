// P-BUY-19 Buyer Engagements list — PRESENTATION (`T-LISTING`, Doc-7F). Pure function of its view-model
// (a Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// resolves the data via the wired `ops.list_engagements.v1` (Doc-4F §F5.8, GI-02) and passes it here.
//
// REUSE: canonical platform-shell `PageHeader` owns the page `<h1>`; the shared `DataListTable` renders the
// rows; the kit `PaginationControl` does cursor pagination; kit `Button`/`StatusChip`/`EmptyState`/`Card`;
// buyer `Ref` + `engagementStateDisplay`.
//
// GOVERNANCE:
//  • The list projects EXACTLY {engagement_id, human_ref, status} (Doc-4F §F5.8) — NO counterparty name,
//    value, `rfq_id`, or dates are shown (they are detail-only; showing them would coin unprojected data).
//  • Party-scoped: `list` returns only the caller org's own engagements (H.9); the empty state is a genuine
//    absence and never implies exclusion (Inv #11 / GI-12).
//  • Cursor pagination only (GI-03) — no grand total. Rows render in contract order, never re-ranked (GI-04).
//  • `id` is OPAQUE (Inv #5); the row links to the detail host (P-BUY-20). `human_ref` is a display label.
//  • NO free-text search: `list_engagements` allowlists only `status`/`role` filters — so the toolbar is a
//    status filter (frozen enum), never a search box that would imply an unprojected capability.

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { PageHeader } from "../../../_components/shell";
import { DataListTable, type DataColumn } from "../_components/data-list-table";
import { Ref } from "../_components/format";
import { engagementStateDisplay } from "../_components/state-display";
import type { EngagementState } from "../_components/view-models";
import type {
  EngagementListData,
  EngagementListItem,
} from "../_components/engagement-list-view-models";

const ENGAGEMENT_COLUMNS: DataColumn<EngagementListItem>[] = [
  {
    key: "engagement",
    header: "Engagement",
    render: (e) => <Ref>{e.humanRef}</Ref>,
  },
  {
    key: "state",
    header: "Status",
    render: (e) => {
      const s = engagementStateDisplay(e.state);
      return <StatusChip label={s.label} tone={s.tone} />;
    },
  },
];

// The frozen `filter.status` allowlist (Doc-4F §F5.8) — the contract-authority engagement states, plus an
// "All" reset. Labels come from the single state-display mapping (never re-coined).
const STATUS_FILTERS: (EngagementState | "all")[] = [
  "all",
  "open",
  "in_delivery",
  "completed",
  "closed",
];

/** A presentation-only status filter (native GET links → `?status=`); the query binds server-side (PARKED). */
function StatusFilter({ active }: { active?: EngagementState }) {
  return (
    <nav aria-label="Filter engagements by status" className="flex flex-wrap items-center gap-2">
      {STATUS_FILTERS.map((f) => {
        const isAll = f === "all";
        const isActive = isAll ? !active : active === f;
        const label = isAll ? "All" : engagementStateDisplay(f).label;
        return (
          <Button
            key={f}
            asChild
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            aria-current={isActive ? "page" : undefined}
          >
            <Link href={isAll ? "/buy/engagements" : `/buy/engagements?status=${f}`}>{label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}

export function EngagementsListView({ data }: { data: EngagementListData | null }) {
  const items = data?.items ?? [];
  const isEmpty = items.length === 0;
  const active = data?.activeStatus;

  return (
    <>
      <PageHeader
        title="Engagements"
        description="Track your organization's awarded engagements through delivery to completion."
      />

      {/* The filter always shows (it drives what the list contains); an empty result is still a valid state. */}
      <div className="mt-4 flex flex-col gap-4">
        <StatusFilter active={active} />

        {isEmpty ? (
          <EmptyState
            icon={<Briefcase aria-hidden />}
            title={active ? "No engagements with this status" : "No engagements yet"}
            description={
              active
                ? "No engagements match this status filter right now."
                : "Engagements open automatically once you award an RFQ."
            }
            action={
              active ? (
                <Button asChild variant="secondary" size="sm">
                  <Link href="/buy/engagements">Show all engagements</Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" size="sm">
                  <Link href="/buy/rfqs">Go to RFQs</Link>
                </Button>
              )
            }
            className="py-16"
          />
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <DataListTable
                  caption="Engagements"
                  columns={ENGAGEMENT_COLUMNS}
                  rows={items}
                  getRowKey={(e) => e.id}
                  getRowHref={(e) => `/buy/engagements/${e.id}`}
                  emptyState={
                    <div className="p-4">
                      <EmptyState title="No engagements match" className="py-8" />
                    </div>
                  }
                />
              </CardContent>
            </Card>
            {/* Cursor pagination (GI-03); the cursor handler attaches at the data-wiring milestone. */}
            <PaginationControl hasMore={Boolean(data?.nextCursor)} />
          </>
        )}
      </div>
    </>
  );
}
