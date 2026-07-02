// P-ADM-14 Import jobs (Doc-7H · Listing · `list_import_jobs` · J-ADM-05). PRESENTATION ONLY: a read-only list
// of data-import jobs. URL-driven status filter (server-rendered, deep-linkable) over the frozen `import_jobs`
// machine (Doc-4J `queued → processing → completed / failed`). Read surface — creating a job is
// `submit_import_job`, a separate wizard (P-ADM-15), owned by BC-ADM-4 Admin (R5); the header "New import job"
// affordance is RENDERED BUT DISABLED. Import LOADS data and owns no seeded entity (Marketplace owns those);
// no score, no procurement decision (firewall + moat). No fabricated row/stat totals (GI-03). Reuses the shell
// PageHeader + shared AdminQueueTable + kit; no new primitive.
import type { Metadata } from "next";
import Link from "next/link";
import { Upload } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  IMPORT_JOBS,
  IMPORT_STATUS_META,
  IMPORT_TYPE_LABEL,
  type ImportJobVM,
} from "../../_components/admin/imports/imports-seed";

export const metadata: Metadata = { title: "Import jobs · Admin" };

const BASE = "/admin/imports";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "queued", label: "Queued" },
  { key: "processing", label: "Processing" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
] as const;

const COLUMNS: AdminQueueColumn<ImportJobVM>[] = [
  {
    key: "job",
    header: "Job",
    cell: (j) => (
      <>
        <div className="font-medium text-foreground">{IMPORT_TYPE_LABEL[j.jobType]}</div>
        <div className="font-mono text-2xs text-muted-foreground">{j.id}</div>
      </>
    ),
  },
  {
    key: "initiatedBy",
    header: "Initiated by",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (j) => j.initiatedBy,
  },
  {
    key: "created",
    header: "Created",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (j) => j.created,
  },
  {
    key: "status",
    header: "Status",
    cell: (j) => {
      const m = IMPORT_STATUS_META[j.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
];

export default async function ImportJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows = active === "all" ? IMPORT_JOBS : IMPORT_JOBS.filter((j) => j.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import jobs"
        description="Bulk category and vendor-seed imports. Each job loads data into the platform; the seeded records are owned by Marketplace, not by import."
        actions={
          // Disabled — `submit_import_job` is the separate wizard (P-ADM-15), owned by BC-ADM-4 (R5).
          <Button size="sm" disabled>
            New import job
          </Button>
        }
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
            rowKey={(j) => j.id}
            caption="Data-import jobs"
            minWidthClassName="min-w-[52rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} job${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Upload aria-hidden="true" />}
          title="No import jobs in this view"
          description="There are no import jobs with this status right now."
        />
      )}
    </div>
  );
}
