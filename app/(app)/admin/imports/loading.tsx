// Skeleton-first loading for the Import jobs list (admin-queue `loading.tsx` convention, P-ADM-08).
// State-agnostic and identical for every admin — renders no data and infers nothing, a visual stand-in
// while the Server Component streams. Presentation-only; reuses the kit Skeleton + Card.
import { Card } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function ImportJobsLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader + action */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-[30rem] max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
