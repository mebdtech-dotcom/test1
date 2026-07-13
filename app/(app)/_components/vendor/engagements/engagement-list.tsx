// E1 Engagement index (companion §13.3 → (app)/engagements). Read = `ops.list_engagements.v1` (cursor,
// NO offset/total). Own-party only; role is pinned to vendor server-side (the user-facing role filter is
// dropped, MINOR-C4). FROZEN MINIMAL PROJECTION: rows render `human_ref` + status chip ONLY (MINOR-C3) —
// award value + buyer live on E2. Engagements are created out-of-wire on award; there is NO create
// affordance. Byte-equivalence (Inv 11): one canonical empty copy, no counts/totals. Presentation-only;
// RSC-friendly.
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { EngagementStatusChip } from "./engagement-status-chip";
import type { EngagementListItemView } from "./types";

export interface EngagementListProps {
  engagements?: EngagementListItemView[];
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function EngagementList({ engagements, basePath = "/sell" }: EngagementListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled>
          All statuses
        </Button>
        <div className="relative ml-auto w-full sm:w-64">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Find by reference"
            aria-label="Find engagements by reference"
            className="pl-8"
            disabled
          />
        </div>
      </div>

      {engagements && engagements.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {engagements.map((engagement) => (
                <li key={engagement.id}>
                  <Link
                    href={`${basePath}/engagements/${engagement.id}`}
                    className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className="truncate font-mono text-sm font-medium text-foreground">
                      {engagement.human_ref ?? "Engagement"}
                    </span>
                    <EngagementStatusChip status={engagement.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No engagements yet"
          description="Engagements appear here after a buyer awards one of your quotations."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={`${basePath}/rfqs`}>View open RFQs →</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
