import type { Metadata } from "next";
import { Heart, MapPin, Plus, Star } from "lucide-react";

import { IvButton } from "@/components/iv/iv-button";
import { IvChip } from "@/components/iv/iv-chip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { BuyerShell } from "../components/buyer-shell";
import { mockBuyerDashboardAdapter } from "../mock-adapter";

export const metadata: Metadata = {
  title: "Saved Suppliers — iVendorz",
  description: "Vendors you’ve saved, plus suppliers you add manually.",
};

// TODO(api): replace with caller-supplied data bound to the governed saved
// suppliers contract (cursor-paginated). Labels are illustrative placeholders.
const sampleSuppliers: Array<{
  id: string;
  name: string;
  location: string;
  ratingLabel: string;
  categories: string;
  verified: boolean;
}> = [
  {
    id: "s1",
    name: "ABC Engineering Ltd.",
    location: "Dhaka, Bangladesh",
    ratingLabel: "4.8 (128)",
    categories: "Pipes, Valves, Fittings",
    verified: true,
  },
  {
    id: "s2",
    name: "Reliable Traders",
    location: "Chattogram, Bangladesh",
    ratingLabel: "4.5 (92)",
    categories: "Instruments, Gauges",
    verified: true,
  },
  {
    id: "s3",
    name: "Techno Supplies",
    location: "Gazipur, Bangladesh",
    ratingLabel: "4.3 (54)",
    categories: "Motors, Pumps",
    verified: false,
  },
];

export default async function SavedSuppliersPage() {
  const shell = await mockBuyerDashboardAdapter.getShellContext();

  return (
    <BuyerShell
      title="Saved Suppliers"
      description="Vendors you’ve saved automatically, plus any you add manually."
      breadcrumbs={[{ label: "Buyer", href: "/buyer" }, { label: "Saved Suppliers" }]}
      activeNavId="saved-suppliers"
      user={shell.user}
      navBadges={shell.navBadges}
      notificationsLabel={shell.notificationsLabel}
      actions={
        <IvButton size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Add Supplier
        </IvButton>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Your suppliers</CardTitle>
          <CardDescription>
            Liked vendors are saved here automatically. You can also add your own.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {sampleSuppliers.map((supplier) => (
              <li
                key={supplier.id}
                className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-muted text-sm font-medium text-foreground"
                    aria-hidden="true"
                  >
                    {supplier.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {supplier.name}
                      </p>
                      {supplier.verified ? <IvChip tone="info">Verified</IvChip> : null}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {supplier.location}
                    </p>
                  </div>
                  <IvButton
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove ${supplier.name} from saved suppliers`}
                  >
                    <Heart className="size-4 fill-current text-primary" />
                  </IvButton>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3.5 text-iv-amber" aria-hidden="true" />
                    <span className="sr-only">Rating:</span>
                    {supplier.ratingLabel}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {supplier.categories}
                  </span>
                </div>
                <IvButton variant="secondary" size="sm">
                  View Profile
                </IvButton>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </BuyerShell>
  );
}
