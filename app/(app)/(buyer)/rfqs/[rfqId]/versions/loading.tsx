// P-BUY-11 route-level loading (SK-DETAIL preset, Doc-7F §II.6 / GI-05). Presentation-only; kit Skeleton.

import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerRfqVersionsLoading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-64" />
      <Skeleton className="mb-6 h-8 w-56" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-48 w-full rounded-md" />
        <Skeleton className="h-48 w-full rounded-md lg:col-span-2" />
      </div>
    </>
  );
}
