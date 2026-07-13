// Comparative Statement route-level loading (document preset — GI-05). Presentation-only; kit
// Skeleton. Mirrors the A4 sheet silhouette so the swap-in is calm.

import { Card, CardContent } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerComparativeStatementLoading() {
  return (
    <div className="mx-auto max-w-[1180px] p-4 sm:p-6">
      <Skeleton className="mb-4 h-4 w-64" />
      <div className="mb-6 border-b border-border pb-4">
        <Skeleton className="h-7 w-72" />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <Skeleton className="h-8 w-96" />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
