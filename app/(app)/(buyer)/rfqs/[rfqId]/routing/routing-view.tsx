// P-BUY-13 Buyer "Routing log / invitations" (Doc-7F · `T-LISTING`; IA sub-route of the RFQ detail, host
// P-BUY-08). PRESENTATION (Content ≠ Presentation, Inv #9): a pure function of its view-model — a Server
// Component, no hooks/fetch/mutation. The server page resolves the data via the wired §E6.7 reads
// (`get_routing_log` + `list_invitations`, GI-02) and passes it.
//
// GOVERNANCE (load-bearing — this is a NON-DISCLOSURE surface):
//  • The routing ENGINE owns invitations (R6 / §0.3): there is NO buyer dispatch/select/exclude affordance.
//  • **Deferral / exclusion is invisible** (Doc-3 §4.2 / Inv #11 / §7.5): a not-invited, deferred, or
//    gate-excluded vendor is NEVER shown and is indistinguishable from non-match. The routing log is
//    AGGREGATE (no vendor identity, no per-step counts); the invitation projection carries NO vendor field.
//  • The empty states must NEVER imply exclusion (GI-12): "No invitations yet" is a neutral absence.
//  • Rows render in the contract's governed order and are NEVER re-ranked (GI-04). Reads are not audited.
//  • State plan (§II.6): `null` → not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12); the
//    breadcrumb never names a leaf that would imply the RFQ exists.

import Link from "next/link";
import { FileText, Info } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../../_components/shell";
import { ActivityTimeline } from "../../../_components/activity-timeline";
import { DataListTable, type DataColumn } from "../../../_components/data-list-table";
import { formatDate, Ref } from "../../../_components/format";
import { rfqStateDisplay, invitationStateDisplay } from "../../../_components/state-display";
import {
  ROUTING_MODE_LABEL,
  type RoutingInvitationsData,
  type InvitationRow,
} from "../../../_components/routing-view-models";
import type { ActivityEntry } from "../../../_components/view-models";

/** Render index carrier — the §E6.7 invitation projection has no id, so rows are keyed by position. */
type KeyedInvitation = InvitationRow & { __k: string };

const INVITATION_COLUMNS: DataColumn<KeyedInvitation>[] = [
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const s = invitationStateDisplay(row.state);
      return <StatusChip label={s.label} tone={s.tone} />;
    },
  },
  {
    key: "delivered",
    header: "Delivered",
    render: (row) =>
      row.deliveredAt ? (
        formatDate(row.deliveredAt)
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "responded",
    header: "Responded",
    render: (row) =>
      row.respondedAt ? (
        formatDate(row.respondedAt)
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];

function NotFoundState() {
  // Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). The breadcrumb shows only the parent
  // list (never a leaf ref that would imply the RFQ exists).
  return (
    <>
      <Breadcrumbs items={[{ label: "RFQs", href: "/rfqs" }]} className="mb-4" />
      {/* FZ-02: the in-view genuine-absence branch still needs a page heading; kept sr-only so the
          visual stays the minimal EmptyState card (its title renders as a <p>, not a heading). */}
      <h1 className="sr-only">RFQ not found</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="RFQ not found"
        description="This RFQ doesn't exist or isn't available."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/rfqs">Back to RFQs</Link>
          </Button>
        }
        className="py-16"
      />
    </>
  );
}

export function RoutingInvitationsView({ data }: { data: RoutingInvitationsData | null }) {
  if (data === null) {
    return <NotFoundState />;
  }

  const status = rfqStateDisplay(data.state);

  // Routing waves → the shared read-only timeline. Aggregate only: each entry is the wave's mode + instant;
  // no vendor identity, no per-step counts (see routing-view-models header). Keyed by index (no contract id).
  const routingEntries: ActivityEntry[] = data.routingLog.map((wave, index) => ({
    id: String(index),
    label: `Routing wave · ${ROUTING_MODE_LABEL[wave.routingMode]}`,
    at: wave.executedAt,
  }));

  // Invitations, keyed by render position (§E6.7 projection carries no id). Contract order preserved (GI-04).
  const invitationRows: KeyedInvitation[] = data.invitations.map((row, index) => ({
    ...row,
    __k: String(index),
  }));

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "RFQs", href: "/rfqs" },
          { label: data.humanRef, href: `/rfqs/${data.id}` },
          { label: "Routing & invitations" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Routing & invitations"
        description="How this RFQ was routed and the invitations it produced."
        meta={
          <>
            <Ref>{data.humanRef}</Ref>
            <StatusChip label={status.label} tone={status.tone} />
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ActivityTimeline
          entries={routingEntries}
          title="Routing activity"
          emptyLabel="No routing activity yet"
        />
        <Card className="lg:col-span-2">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">Invitations</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {/* Cursor pagination (GI-03) binds at wiring; the reads are cursor-paginated server-side. */}
            <DataListTable<KeyedInvitation>
              columns={INVITATION_COLUMNS}
              rows={invitationRows}
              getRowKey={(row) => row.__k}
              caption="Invitations issued for this RFQ"
              // Pins the first column + makes the horizontal-scroll region keyboard-focusable on narrow
              // viewports (WCAG 2.1.1 / 1.4.10) — same scroll-region a11y treatment as P-BUY-22.
              stickyFirstColumn
              emptyState={
                <EmptyState
                  title="No invitations yet"
                  description="This RFQ hasn't produced any invitations yet."
                  className="py-8"
                />
              }
            />
            <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              Invitations are issued by the routing engine — not chosen here. Vendor identities
              aren&rsquo;t listed, and vendors who were not invited (or whose invitation was
              deferred) are never shown.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
