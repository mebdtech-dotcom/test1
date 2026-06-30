// P-BUY-06 route-level loading (SK-LIST preset, Doc-7F §II.6 / GI-05). Next.js renders this while the
// server page streams. Presentation-only; composed from kit Skeleton + Card.

import { Card, CardContent } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerRfqListLoading() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="hidden h-5 w-20 sm:block" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
