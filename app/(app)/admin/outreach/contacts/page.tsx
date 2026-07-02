// P-ADM-18 Outreach contacts (Doc-7H · Listing · `add/update_outreach_contact` · J-ADM-05). PRESENTATION ONLY:
// the outreach-contacts management surface. READ BINDING (RV-0051): there is NO frozen cross-campaign contacts
// read — `outreach_contacts` are exposed ONLY through the campaign DETAIL read (`get_outreach_campaign` =
// campaign + contacts, Doc-4J:326); `list_outreach_contacts` does not exist. So this page is CAMPAIGN-SCOPED:
// pick a campaign (URL `?campaign=<id>`, deep-linkable) and read that campaign's contacts via the frozen detail
// read — no invented global list. Adding/updating a contact is `add/update_outreach_contact`, owned by BC-ADM-6
// (R5); the "Add contact" affordance is RENDERED BUT DISABLED. Targets are Marketplace-owned vendor references;
// invite stage is an illustrative string (frozen field is unstructured `jsonb`, Doc-4J:322). MOAT: outreach is
// informational acquisition only; no score (firewall). No fabricated total (GI-03).
import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
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
  OUTREACH_CAMPAIGNS,
  OUTREACH_STATUS_META,
  getOutreachCampaignDetail,
  type OutreachContactVM,
} from "../../../_components/admin/outreach/outreach-seed";

export const metadata: Metadata = { title: "Outreach contacts · Admin" };

const BASE = "/admin/outreach/contacts";

const COLUMNS: AdminQueueColumn<OutreachContactVM>[] = [
  {
    key: "vendor",
    header: "Target vendor",
    cell: (c) => (
      <>
        <div className="font-medium text-foreground">{c.targetName}</div>
        <div className="font-mono text-2xs text-muted-foreground">{c.targetRef}</div>
      </>
    ),
  },
  {
    key: "stage",
    header: "Invite stage",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (c) => c.inviteStage,
  },
];

export default async function OutreachContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { campaign } = await searchParams;
  const selected = campaign ? getOutreachCampaignDetail(campaign) : undefined;
  const contacts = selected?.contacts ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outreach contacts"
        description="Contacts are scoped to a campaign — pick one to view its outreach contacts. Outreach is informational acquisition only; it never affects matching, routing, ranking, or supplier selection."
        actions={
          // Disabled — `add_outreach_contact` is owned by BC-ADM-6 (R5). Admin decides; the module applies it.
          <Button size="sm" disabled>
            Add contact
          </Button>
        }
      />

      {/* Campaign picker — each option deep-links the campaign-scoped detail read. */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Select a campaign">
        {OUTREACH_CAMPAIGNS.map((c) => {
          const isActive = c.id === campaign;
          const m = OUTREACH_STATUS_META[c.status];
          return (
            <Button
              key={c.id}
              asChild
              size="sm"
              variant={isActive ? "secondary" : "ghost"}
              className="gap-2 font-mono text-xs"
            >
              <Link href={`${BASE}?campaign=${c.id}`} aria-current={isActive ? "page" : undefined}>
                {c.id.slice(0, 8)}…
                <StatusChip label={m.label} tone={m.tone} />
              </Link>
            </Button>
          );
        })}
      </div>

      {!selected ? (
        <EmptyState
          icon={<Users aria-hidden="true" />}
          title="Select a campaign"
          description="Choose a campaign above to view its outreach contacts."
        />
      ) : contacts.length > 0 ? (
        <>
          <AdminQueueTable
            columns={COLUMNS}
            rows={contacts}
            rowKey={(c) => c.id}
            caption="Outreach contacts for the selected campaign"
            minWidthClassName="min-w-[36rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${contacts.length} contact${contacts.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Users aria-hidden="true" />}
          title="No contacts in this campaign"
          description="This campaign has no outreach contacts yet."
        />
      )}
    </div>
  );
}
