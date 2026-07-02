// P-BUY-22 route-level loading (SK-LIST preset, Doc-7F §II.6 / GI-05). Next.js renders this while the
// server page streams. Presentation-only; composed from kit Skeleton + Card.

import { Card, CardContent } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerPaymentsLoading() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Skeleton className="mb-4 h-4 w-56" />
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="mb-4 h-14 w-full rounded-md" />
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="hidden h-5 w-40 sm:block" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
