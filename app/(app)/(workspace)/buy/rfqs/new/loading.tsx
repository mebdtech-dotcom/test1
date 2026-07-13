// P-BUY-RFQ route-level loading (SK-WIZARD/detail preset, Doc-7F §II.6 / GI-05). Presentation-only; kit Skeleton.

import { Card, CardContent, CardHeader } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerRfqCreateLoading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="mb-2 h-8 w-80" />
      <Skeleton className="mb-6 h-4 w-96" />
      <Skeleton className="mb-6 h-14 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 p-4 pt-0 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-14 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader className="p-4">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 pt-0">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
