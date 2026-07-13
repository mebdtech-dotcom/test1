// P-VND-12 Ads (Listing) — read = `marketplace.list_advertisements.v1` (owning-org scope, all own
// states; cursor, no offset/total, GI-03). There is no browse of other vendors' ads — this list is
// this org's own purchases only. Byte-equivalence (Invariant 11): one canonical empty copy. The
// per-row `status` chip covers the FULL vendor-visible machine (draft/pending_review/scheduled/
// active/paused/rejected/completed) — none of it is a governance signal (Doc-4D §B.11/§18.3).
// Presentation-only; RSC-friendly.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { AdStatusChip, AD_PLACEMENT_LABEL } from "./ad-status-chip";
import type { AdListItemView } from "./types";

export interface AdListProps {
  ads?: AdListItemView[];
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function AdList({ ads, basePath = "/sell" }: AdListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled>
          All statuses
        </Button>
        <Button asChild size="sm" className="ml-auto">
          <Link href={`${basePath}/microsite/ads/new`}>New ad</Link>
        </Button>
      </div>

      {ads && ads.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {ads.map((ad) => (
                <li key={ad.id}>
                  <Link
                    href={`${basePath}/microsite/ads/${ad.id}`}
                    className="flex flex-col gap-2 p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-sm font-medium text-foreground">
                        {ad.creative_ref ?? "Advertisement"}
                      </p>
                      {ad.placement ? (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {AD_PLACEMENT_LABEL[ad.placement]}
                          {ad.schedule?.start && ad.schedule?.end
                            ? ` · ${ad.schedule.start} – ${ad.schedule.end}`
                            : null}
                        </p>
                      ) : null}
                    </div>
                    <AdStatusChip status={ad.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No ads yet"
          description="Create an advertisement to promote your listing on the marketplace. Ads never affect your trust, eligibility, routing, or matching."
        />
      )}
    </div>
  );
}
