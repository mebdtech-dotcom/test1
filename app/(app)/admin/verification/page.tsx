// P-ADM-12 Verification queue (Doc-7H · Management/Workflow · `queue/assign_verification_task` · J-ADM-02).
// PRESENTATION ONLY: the verification workflow worklist. URL-driven status filter (server-rendered, deep-
// linkable) over the frozen `verification_tasks` machine (Doc-2:390 `queued → in_review → decided`). The per-row
// Assign affordance is RENDERED BUT DISABLED — `assign_verification_task` (and the `decide_verification_task`
// decision on the DETAIL, P-ADM-13) are owned by M5 Trust (R5: Admin decides; Trust stores). FIREWALL
// (Invariant #6): NO Trust Score, NO Performance Score, NO Financial-Tier band appears here — verification is a
// separate signal; scores are auto-calculated by Trust under the System actor, never surfaced or edited on an
// admin queue. No fabricated total (GI-03). Reuses the shell PageHeader + shared AdminQueueTable + kit.
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  VERIFICATION_TASKS,
  VERIFICATION_STATUS_META,
  VERIFICATION_TYPE_LABEL,
  type VerificationTaskVM,
} from "../../_components/admin/verification/verification-seed";

export const metadata: Metadata = { title: "Verification · Admin" };

const BASE = "/admin/verification";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "queued", label: "Queued" },
  { key: "in_review", label: "In review" },
  { key: "decided", label: "Decided" },
] as const;

const COLUMNS: AdminQueueColumn<VerificationTaskVM>[] = [
  {
    key: "subject",
    header: "Subject",
    cell: (t) => (
      <>
        <div className="font-medium text-foreground">{t.subject}</div>
        <div className="text-xs text-muted-foreground">{t.subjectType}</div>
      </>
    ),
  },
  {
    key: "type",
    header: "Verification",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (t) => VERIFICATION_TYPE_LABEL[t.verificationType],
  },
  {
    key: "requested",
    header: "Requested",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (t) => t.requested,
  },
  {
    key: "assignee",
    header: "Assignee",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (t) => t.assignee ?? <span className="italic">Unassigned</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (t) => {
      const m = VERIFICATION_STATUS_META[t.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (t) =>
      t.status === "decided" ? (
        <span className="text-xs text-muted-foreground">—</span>
      ) : (
        // Disabled — `assign_verification_task` is owned by M5 Trust (R5). Admin decides; Trust stores.
        <Button size="sm" variant="outline" disabled>
          Assign
        </Button>
      ),
  },
];

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows =
    active === "all" ? VERIFICATION_TASKS : VERIFICATION_TASKS.filter((t) => t.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification"
        description="Verification tasks awaiting review. Admin assigns and decides each task; Trust stores the record and owns the score — no score is shown or set here."
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
            rowKey={(t) => t.id}
            caption="Verification tasks awaiting review"
            minWidthClassName="min-w-[60rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} task${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<ShieldCheck aria-hidden="true" />}
          title="No verification tasks in this view"
          description="There are no verification tasks with this status right now."
        />
      )}
    </div>
  );
}
