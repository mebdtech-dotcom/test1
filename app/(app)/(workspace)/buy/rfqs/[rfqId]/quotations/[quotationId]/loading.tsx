// P-BUY-14 route-level loading (SK-DETAIL preset, Doc-7F §II.6 / GI-05). Presentation-only; kit Skeleton.

import { Card, CardContent, CardHeader } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerQuotationDetailLoading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-56" />
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-4 pt-0">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-5 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-4 pt-0">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-5 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
