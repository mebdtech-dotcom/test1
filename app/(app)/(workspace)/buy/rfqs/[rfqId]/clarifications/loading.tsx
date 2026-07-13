// P-BUY-16 route-level loading (SK-DETAIL preset, Doc-7F §II.6 / GI-05). Presentation-only; kit Skeleton.

import { Card, CardContent } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerClarificationsLoading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-56" />
      <div className="mb-6 border-b border-border pb-4">
        <Skeleton className="h-7 w-48" />
      </div>
      {/* Mirrors the rendered ClarificationsThread: a single Card whose content is a centered
          icon + empty-state lines + a deferral note (no card header — the thread has no title). */}
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-4 py-10">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="mt-2 h-3 w-72" />
        </CardContent>
      </Card>
    </>
  );
}
