// P-BUY-27 route-level loading (SK-DETAIL preset, Doc-7F §II.6 / GI-05). Next.js renders this while the
// server page streams. Presentation-only; composed from kit Skeleton + Card.

import { Card, CardContent, CardHeader } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerCrmDetailLoading() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Skeleton className="mb-4 h-4 w-48" />
      <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-4">
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4 pt-0">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
