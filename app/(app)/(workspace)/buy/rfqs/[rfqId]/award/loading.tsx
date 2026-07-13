// P-BUY-17 route-level loading (SK-WIZARD/detail preset, Doc-7F §II.6 / GI-05). Presentation-only; kit Skeleton.

import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerAwardLoading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-48" />
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-6 h-4 w-96" />
      <Skeleton className="mb-6 h-14 w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </>
  );
}
