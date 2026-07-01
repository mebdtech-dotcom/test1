// P-BUY-19 route-level loading (SK-LIST preset, Doc-7F §II.6 / GI-05). Next.js renders this while the
// server page streams. Presentation-only; composed from kit Skeleton + Card.

import { Card, CardContent } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerEngagementsLoading() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <div className="mb-4 border-b border-border pb-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
