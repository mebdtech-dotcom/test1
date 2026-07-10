// P-BUY-15 route-level loading (SK-DASHBOARD/analytics preset, Doc-7F §II.6 / GI-05). Presentation-only; kit Skeleton.

import { Card, CardContent } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerComparisonLoading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-56" />
      <div className="mb-6 border-b border-border pb-4">
        <Skeleton className="h-7 w-56" />
      </div>
      <Card className="mb-4">
        <CardContent className="p-4">
          <Skeleton className="h-5 w-72" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
