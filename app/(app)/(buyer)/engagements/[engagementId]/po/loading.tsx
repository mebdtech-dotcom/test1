// P-BUY-21 route-level loading (SK-DETAIL preset, Doc-7F §II.6 / GI-05). Next.js renders this while the
// server page streams. Presentation-only; composed from kit Skeleton + Card.

import { Card, CardContent, CardHeader } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerPurchaseOrderLoading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-64" />
      <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="p-4">
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 pt-0">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-14 w-full rounded-md" />
      </div>
    </>
  );
}
