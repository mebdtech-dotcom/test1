// Skeleton-first loading for the Entitlements catalog (admin-queue `loading.tsx` convention, P-ADM-08).
// State-agnostic and identical for every admin — renders no data and infers nothing, a visual stand-in
// while the Server Component streams. Presentation-only; reuses the kit Skeleton + Card.
import { Card } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function EntitlementsLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-[30rem] max-w-full" />
        </div>
        <Skeleton className="h-9 w-48" />
      </div>

      {/* Read-binding notice */}
      <Skeleton className="h-20 w-full rounded-lg" />

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
