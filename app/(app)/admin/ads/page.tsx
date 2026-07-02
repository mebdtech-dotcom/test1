// P-ADM-10 Ad review queue (Doc-7H · Management · ad reads · J-ADM-03). PRESENTATION ONLY: the advertisement
// review worklist. URL-driven status filter (server-rendered, deep-linkable) over the frozen §5.8 machine.
// The per-row Review affordance is RENDERED BUT DISABLED — the Approve/Reject decision is
// `marketplace.review_advertisement.v1`, actioned on the DETAIL page (P-ADM-11) and owned by Marketplace admin
// (R5: Admin decides; the owning module owns the effect). FIREWALL (Doc-4D §B.11): ads are visibility/placement
// only — they never gate trust / eligibility / routing / matching, so no governance signal appears here. No
// fabricated total (GI-03). Reuses the shell PageHeader + shared AdminQueueTable + kit; no new primitive.
import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  AD_REVIEWS,
  AD_STATUS_META,
  AD_PLACEMENT_LABEL,
  type AdReviewVM,
} from "../../_components/admin/ad-review/ad-review-seed";

export const metadata: Metadata = { title: "Ad review · Admin" };

const BASE = "/admin/ads";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending_review", label: "Pending review" },
  { key: "scheduled", label: "Scheduled" },
  { key: "rejected", label: "Rejected" },
] as const;

const COLUMNS: AdminQueueColumn<AdReviewVM>[] = [
  {
    key: "creative",
    header: "Creative",
    className: "whitespace-nowrap font-mono text-xs text-muted-foreground",
    cell: (a) => a.creativeRef,
  },
  {
    key: "advertiser",
    header: "Advertiser",
    cell: (a) => <span className="font-medium text-foreground">{a.advertiser}</span>,
  },
  {
    key: "placement",
    header: "Placement",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (a) => AD_PLACEMENT_LABEL[a.placement],
  },
  {
    key: "schedule",
    header: "Schedule",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (a) => a.schedule,
  },
  {
    key: "submitted",
    header: "Submitted",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (a) => a.submitted,
  },
  {
    key: "status",
    header: "Status",
    cell: (a) => {
      const m = AD_STATUS_META[a.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (a) =>
      a.status === "pending_review" ? (
        // Disabled — the Approve/Reject decision is `review_advertisement`, actioned on the detail (P-ADM-11),
        // owned by Marketplace admin (R5). The queue itself invokes nothing.
        <Button size="sm" variant="outline" disabled>
          Review
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
];

export default async function AdReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows = active === "all" ? AD_REVIEWS : AD_REVIEWS.filter((a) => a.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ad review"
        description="Advertisements submitted for review. Approve schedules the placement; reject returns it with a reason — the decision is applied from the ad detail."
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => {
          const isActive = f.key === active;
          const href = f.key === "all" ? BASE : `${BASE}?status=${f.key}`;
          return (
            <Button key={f.key} asChild size="sm" variant={isActive ? "secondary" : "ghost"}>
              <Link href={href} aria-current={isActive ? "page" : undefined}>
                {f.label}
              </Link>
            </Button>
          );
        })}
      </div>

      {rows.length > 0 ? (
        <>
          <AdminQueueTable
            columns={COLUMNS}
            rows={rows}
            rowKey={(a) => a.id}
            caption="Advertisements awaiting review"
            minWidthClassName="min-w-[64rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} ad${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Megaphone aria-hidden="true" />}
          title="No ads in this view"
          description="There are no advertisements with this status right now."
        />
      )}
    </div>
  );
}
