// P-BUY-02 route-level loading (SK-LIST/grid preset, Doc-7F §II.6 / GI-05). Next.js renders this while the
// server page streams. Presentation-only; composed from kit Skeleton + Card.

import { Card } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerDiscoverLoading() {
  return (
    <>
      <div className="mb-4 border-b border-border pb-4">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-full sm:max-w-xs" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-1 h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="mt-2 h-8 w-full" />
          </Card>
        ))}
      </div>
    </>
  );
}
