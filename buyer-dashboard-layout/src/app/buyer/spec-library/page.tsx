import type { Metadata } from "next";
import { BookMarked, Plus, Upload } from "lucide-react";

import { IvButton } from "@/components/iv/iv-button";
import { IvEmptyState } from "@/components/iv/iv-empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { BuyerShell } from "../components/buyer-shell";
import { mockBuyerDashboardAdapter } from "../mock-adapter";

export const metadata: Metadata = {
  title: "Spec Library — iVendorz",
  description: "Save product specifications and documents for reuse.",
};

export default async function SpecLibraryPage() {
  const shell = await mockBuyerDashboardAdapter.getShellContext();

  // TODO(api): bind to the governed spec/document library contract
  // (cursor-paginated). Until then the library renders its empty state.
  const specs: never[] = [];

  return (
    <BuyerShell
      title="Spec Library"
      description="Save product specifications and documents to reuse across future RFQs."
      breadcrumbs={[{ label: "Buyer", href: "/buyer" }, { label: "Spec Library" }]}
      activeNavId="spec-library"
      user={shell.user}
      navBadges={shell.navBadges}
      notificationsLabel={shell.notificationsLabel}
      actions={
        <IvButton size="sm" className="gap-1.5">
          <Upload className="size-4" />
          Upload Spec
        </IvButton>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Saved specifications</CardTitle>
          <CardDescription>Reusable product specs and documents you’ve saved.</CardDescription>
        </CardHeader>
        <CardContent>
          {specs.length === 0 ? (
            <IvEmptyState
              icon={<BookMarked />}
              title="No saved specifications yet"
              description="Upload a specification or document to reuse it when creating RFQs."
              action={
                <IvButton size="sm" variant="secondary" className="gap-1.5">
                  <Plus className="size-4" />
                  Add your first spec
                </IvButton>
              }
            />
          ) : null}
        </CardContent>
      </Card>
    </BuyerShell>
  );
}
