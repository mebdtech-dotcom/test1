// P-BUY-18 route-level loading (SK-DETAIL preset, Doc-7F §II.6 / GI-05). Presentation-only; kit Skeleton.

import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerCloseLostLoading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-48" />
      <Skeleton className="mb-6 h-8 w-56" />
      <div className="flex max-w-2xl flex-col gap-5">
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-9 w-40 self-end rounded-md" />
      </div>
    </>
  );
}
