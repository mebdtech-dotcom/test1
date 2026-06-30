// Buyer Workspace — SK-DASHBOARD loading presets (P-BUY-01, Doc-7F §9.1 / GI-05). Presentation-only
// visual stand-ins composed from the existing kit `Skeleton` + `Card` primitives while the Server
// Components stream (Doc-7C SR7). Per §9.1 each dashboard widget streams behind its OWN skeleton; these
// presets back those per-widget Suspense boundaries (and the route-level `loading.tsx`). They render no
// data and infer nothing.

import { Card, CardContent, CardHeader } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

/** KPI band skeleton — four stat cards. */
export function KpiBandSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-iv-xs">
          <CardContent className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** A single work-queue card skeleton (header + a few rows). */
export function WorkQueueSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 border-t border-border p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Recent-activity timeline skeleton. */
export function TimelineSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4 pt-0">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="mt-1.5 size-1.5 rounded-full" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Full P-BUY-01 dashboard skeleton — KPI band + content grid + timeline. */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <KpiBandSkeleton />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <WorkQueueSkeleton />
          <WorkQueueSkeleton />
        </div>
        <TimelineSkeleton />
      </div>
    </div>
  );
}
