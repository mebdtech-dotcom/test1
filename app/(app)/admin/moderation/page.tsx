// P-ADM-02 Moderation queue (Doc-7H · Management · J-ADM-01 moderation case reads). PRESENTATION ONLY: a
// platform-scope worklist of reported RFQs / vendors / products / ads / reviews. URL-driven status filter
// (server-rendered — deep-linkable, no client state); each row opens the case detail (P-ADM-03) where a wired
// command acts — the queue DECIDES NOTHING (R5: page invokes a wired Admin command; the owning module owns the
// effect). No governance signal (Trust/Performance/Tier — firewall); no fabricated totals (GI-03) — the seed
// stands in for the unwired read. Composes the shared shell PageHeader + kit (StatusChip / PaginationControl /
// EmptyState); no new primitive, no duplication, no backend, no invented contract.
import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { PageHeader } from "../../_components/shell";
import { ModerationQueueTable } from "../../_components/admin/moderation/moderation-queue-table";
import { MODERATION_CASES } from "../../_components/admin/moderation/moderation-seed";

export const metadata: Metadata = { title: "Moderation queue · Admin" };

const BASE = "/admin/moderation";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_review", label: "In review" },
  { key: "escalated", label: "Escalated" },
  { key: "resolved", label: "Resolved" },
  { key: "dismissed", label: "Dismissed" },
] as const;

export default async function ModerationQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const cases =
    active === "all" ? MODERATION_CASES : MODERATION_CASES.filter((c) => c.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderation queue"
        description="Reported RFQs, vendors, products, ads, and reviews awaiting review. Open a case to act — the owning module owns the effect."
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

      {cases.length > 0 ? (
        <>
          <ModerationQueueTable cases={cases} />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${cases.length} case${cases.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Inbox aria-hidden="true" />}
          title="No cases in this view"
          description="There are no moderation cases with this status right now."
        />
      )}
    </div>
  );
}
