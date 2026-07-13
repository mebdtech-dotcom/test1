// P-BUY-08 route-level loading (SK-DETAIL preset, Doc-7F §II.6 / GI-05). Presentation-only; kit Skeleton.

import { Card, CardContent, CardHeader } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerRfqDetailLoading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-40" />
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="mb-4 h-9 w-72" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 pt-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 pt-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
