// P-BUY-26 Buyer Vendor CRM list — PRESENTATION (`T-LISTING`, Doc-7F). Pure function of its view-model (a
// Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// resolves the data via the wired `ops.list_private_vendors.v1` (Doc-4F §F4.9, GI-02) and passes it here.
//
// REUSE: canonical platform-shell `PageHeader`; shared `DataListTable`; kit `PaginationControl`/`Button`/
// `StatusChip`/`EmptyState`/`Card`; buyer `privateVendorLinkStatusDisplay`.
//
// GOVERNANCE (load-bearing — buyer-private / Inv #11 / GI-12):
//  • The list projects EXACTLY {id, name, link_status, state} (§F4.9) — NOTHING else is shown. The buyer's
//    CRM approval status (approved | conditional | blacklisted) is NOT projected here and is NEVER surfaced
//    on the list; a blacklist stays UNDETECTABLE (§7.5). Only the private↔public `link_status` is shown.
//  • OWN-ORG ONLY: the list returns only the caller org's private records; the empty state is a genuine
//    absence and never implies exclusion. No cross-tenant data, no grand total.
//  • Cursor pagination only (GI-03). Rows render in contract order, never re-ranked (GI-04). `id` is OPAQUE
//    (Inv #5); the row links to the CRM detail (P-BUY-27). `name` is buyer-entered display text.
//  • NO free-text search box: `list_private_vendors` allowlists only link_status/source/is_favorite filters
//    — so the toolbar is a link-status filter (frozen enum), never a search box implying an unprojected read.

import Link from "next/link";
import { Contact } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { PageHeader } from "../../_components/shell";
import { DataListTable, type DataColumn } from "../_components/data-list-table";
import { privateVendorLinkStatusDisplay } from "../_components/state-display";
import type { PrivateVendorLinkStatus } from "../_components/view-models";
import type { CrmListData, PrivateVendorListItem } from "../_components/crm-list-view-models";

const CRM_COLUMNS: DataColumn<PrivateVendorListItem>[] = [
  {
    key: "vendor",
    header: "Vendor",
    render: (v) => (
      <span className="flex flex-col">
        <span className="truncate font-medium text-foreground">{v.name}</span>
        {v.state === "archived" ? (
          <span className="text-2xs text-muted-foreground">Archived</span>
        ) : null}
      </span>
    ),
  },
  {
    key: "link",
    header: "Link",
    render: (v) => {
      const s = privateVendorLinkStatusDisplay(v.linkStatus);
      return <StatusChip label={s.label} tone={s.tone} />;
    },
  },
];

// The frozen `filter.link_status` allowlist (§F4.9) — the link-status enum, plus an "All" reset. Labels come
// from the single state-display mapping (never re-coined). NOTE: this is the link state, NOT approval status.
const LINK_FILTERS: (PrivateVendorLinkStatus | "all")[] = ["all", "none", "suggested", "linked"];

/** Presentation-only link-status filter (native GET links → `?link=`); the query binds server-side (PARKED). */
function LinkFilter({ active }: { active?: PrivateVendorLinkStatus }) {
  return (
    <nav aria-label="Filter vendors by link status" className="flex flex-wrap items-center gap-2">
      {LINK_FILTERS.map((f) => {
        const isAll = f === "all";
        const isActive = isAll ? !active : active === f;
        const label = isAll ? "All" : privateVendorLinkStatusDisplay(f).label;
        return (
          <Button
            key={f}
            asChild
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            aria-current={isActive ? "page" : undefined}
          >
            <Link href={isAll ? "/crm" : `/crm?link=${f}`}>{label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}

export function CrmListView({ data }: { data: CrmListData | null }) {
  const items = data?.items ?? [];
  const isEmpty = items.length === 0;
  const active = data?.activeLinkStatus;

  return (
    <>
      <PageHeader
        title="Vendor CRM"
        description="Your organization's private vendor list — visible only to your team."
      />

      <div className="mt-4 flex flex-col gap-4">
        <LinkFilter active={active} />

        {isEmpty ? (
          <EmptyState
            icon={<Contact aria-hidden />}
            title={active ? "No vendors with this link status" : "No vendors in your CRM yet"}
            description={
              active
                ? "No vendors match this filter right now."
                : "Vendors you add to your private CRM will appear here — visible only to your organization."
            }
            action={
              active ? (
                <Button asChild variant="secondary" size="sm">
                  <Link href="/crm">Show all vendors</Link>
                </Button>
              ) : undefined
            }
            className="py-16"
          />
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <DataListTable
                  caption="Private vendor CRM"
                  columns={CRM_COLUMNS}
                  rows={items}
                  getRowKey={(v) => v.id}
                  getRowHref={(v) => `/crm/${v.id}`}
                  emptyState={
                    <div className="p-4">
                      <EmptyState title="No vendors match" className="py-8" />
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
