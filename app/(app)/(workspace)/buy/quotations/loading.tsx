// Received Quotes route-level loading (SK-LIST preset, Doc-7F §II.6 / GI-05). Next.js renders this while
// the server page streams the list read. Presentation-only; composed from kit Skeleton + Card.
//
// The skeleton mirrors the populated layout (tile band → filter bar → rows) so the page does not reflow
// when the data lands.

import { Card, CardContent } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function ReceivedQuotesLoading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-2 border-b border-border pb-4">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-3 p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-52" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="hidden h-5 w-40 sm:block" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="hidden h-5 w-20 sm:block" />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
