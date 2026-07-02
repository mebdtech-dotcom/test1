// P-ADM-25 Identity ops — orgs (Doc-7H · Management · `set_organization_status` / `admin_recover_ownership` ·
// J-ADM-06). PRESENTATION ONLY: the admin organization worklist. URL-driven status filter (server-rendered,
// deep-linkable) over the frozen `organizations` machine (Doc-2 §5.1 active ⇄ suspended → soft_deleted).
// CROSS-MODULE BOUNDARY: organizations are owned by M1/Identity — Admin (M8) DECIDES a governance action but
// IDENTITY OWNS THE EFFECT (R5); Admin never bypasses the Identity domain. Suspend / Reinstate
// (`set_organization_status`) and Recover ownership (`admin_recover_ownership`) are RENDERED BUT DISABLED
// (21.6 Admin, no active-org §5.6, authz `staff_super_admin` interim). FIREWALL: no governance score here. No
// fabricated total (GI-03). Reuses the shell PageHeader + shared AdminQueueTable + kit.
import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../../_components/shell";
import {
  AdminQueueTable,
  type AdminQueueColumn,
} from "../../../_components/admin/admin-queue-table";
import {
  ORG_OPS,
  ORG_STATUS_META,
  type OrgOpsVM,
} from "../../../_components/admin/identity/org-ops-seed";

export const metadata: Metadata = { title: "Organizations · Admin" };

const BASE = "/admin/identity/orgs";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
  { key: "soft_deleted", label: "Soft-deleted" },
] as const;

const COLUMNS: AdminQueueColumn<OrgOpsVM>[] = [
  {
    key: "org",
    header: "Organization",
    cell: (o) => (
      <>
        <div className="font-medium text-foreground">{o.name}</div>
        <div className="font-mono text-2xs text-muted-foreground">{o.ref}</div>
      </>
    ),
  },
  {
    key: "participation",
    header: "Participation",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (o) => o.participation,
  },
  {
    key: "status",
    header: "Status",
    cell: (o) => {
      const m = ORG_STATUS_META[o.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (o) =>
      o.status === "soft_deleted" ? (
        <span className="text-xs text-muted-foreground">—</span>
      ) : (
        // Disabled — `set_organization_status` / `admin_recover_ownership` are owned by M1/Identity (R5).
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" disabled>
            {o.status === "active" ? "Suspend" : "Reinstate"}
          </Button>
          <Button size="sm" variant="outline" disabled>
            Recover ownership
          </Button>
        </div>
      ),
  },
];

export default async function OrgOpsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows = active === "all" ? ORG_OPS : ORG_OPS.filter((o) => o.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Platform identity operations on organizations. Admin decides; Identity applies the effect — Admin never bypasses the Identity domain."
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
            rowKey={(o) => o.id}
            caption="Organizations for identity operations"
            minWidthClassName="min-w-[56rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} organization${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Building2 aria-hidden="true" />}
          title="No organizations in this view"
          description="There are no organizations with this status right now."
        />
      )}
    </div>
  );
}
