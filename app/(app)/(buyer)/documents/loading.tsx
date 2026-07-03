// P-DOC-01 route-level loading (SK-LIST preset, GI-05). Next.js renders this while the server page
// streams. Presentation-only; composed from kit Skeleton + Card (the P-BUY-19 loading pattern).

import { Card, CardContent } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerDocumentsHubLoading() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <div className="mb-4 border-b border-border pb-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      {/* Lifecycle strip */}
      <Skeleton className="mb-4 h-12 w-full" />
      {/* Toolbar + view chips */}
      <div className="mb-4 flex flex-col gap-3">
        <Skeleton className="h-11 w-full max-w-md" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </div>
      {/* Section cards */}
      {Array.from({ length: 2 }).map((_, s) => (
        <Card key={s} className="mb-4">
          <CardContent className="flex flex-col gap-3 p-4">
            <Skeleton className="h-5 w-56" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
