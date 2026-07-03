import type { Metadata } from "next";
import { ChevronRight, FileEdit, Plus, Trash2 } from "lucide-react";

import { IvButton } from "@/components/iv/iv-button";
import { IvChip } from "@/components/iv/iv-chip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { BuyerShell } from "../components/buyer-shell";
import { mockBuyerDashboardAdapter } from "../mock-adapter";

export const metadata: Metadata = {
  title: "Draft Requests — iVendorz",
  description: "Save incomplete RFQs as drafts before publishing.",
};

// TODO(api): replace these placeholder drafts with caller-supplied data bound to
// the governed buyer draft contracts (cursor-paginated). Values are illustrative.
const sampleDrafts: Array<{
  id: string;
  reference: string;
  title: string;
  updatedLabel: string;
}> = [
  {
    id: "d1",
    reference: "DRAFT-2024-0007",
    title: "Boiler steam pipe — DN80",
    updatedLabel: "Updated 2 hours ago",
  },
  {
    id: "d2",
    reference: "DRAFT-2024-0006",
    title: "Industrial valve assortment",
    updatedLabel: "Updated yesterday",
  },
  {
    id: "d3",
    reference: "DRAFT-2024-0005",
    title: "Pressure gauges (calibration grade)",
    updatedLabel: "Updated 3 days ago",
  },
];

export default async function DraftRequestPage() {
  const shell = await mockBuyerDashboardAdapter.getShellContext();

  return (
    <BuyerShell
      title="Draft Requests"
      description="Save incomplete RFQs and resume them before publishing."
      breadcrumbs={[{ label: "Buyer", href: "/buyer" }, { label: "Draft Requests" }]}
      activeNavId="draft-request"
      user={shell.user}
      navBadges={shell.navBadges}
      notificationsLabel={shell.notificationsLabel}
      actions={
        <IvButton size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New Draft
        </IvButton>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Your drafts</CardTitle>
          <CardDescription>
            Unpublished requests are kept here until you submit them.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {sampleDrafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3"
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-muted text-muted-foreground"
                aria-hidden="true"
              >
                <FileEdit className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{draft.title}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {draft.reference} · {draft.updatedLabel}
                </p>
              </div>
              <IvChip tone="neutral">
                <FileEdit aria-hidden="true" />
                Draft
              </IvChip>
              <IvButton variant="ghost" size="sm" className="gap-1.5">
                Resume
                <ChevronRight className="size-4" />
              </IvButton>
              <IvButton variant="ghost" size="sm" aria-label={`Delete ${draft.title}`}>
                <Trash2 className="size-4" />
              </IvButton>
            </div>
          ))}
        </CardContent>
      </Card>
    </BuyerShell>
  );
}
