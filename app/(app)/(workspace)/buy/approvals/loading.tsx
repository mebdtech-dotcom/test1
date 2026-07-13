// P-BUY-12 route-level loading (SK-LIST preset, Doc-7F §II.6 / GI-05). Next.js renders this while the
// server page streams. Presentation-only; composed from kit Skeleton + Card.

import { Card, CardContent } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerApprovalsLoading() {
  return (
    <>
      <div className="mb-4 border-b border-border pb-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="mb-4 h-14 w-full rounded-md" />
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="hidden h-5 w-20 sm:block" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
