// Compare Quotes route-level loading (Doc-7F §II.6 / GI-05). Rendered while the server page resolves the
// RFQ option set and, when one is selected, the comparison reads. Presentation-only.
//
// Mirrors the populated layout (picker band → workspace body) so the page does not reflow on arrival.

import { Card, CardContent } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function CompareQuotesLoading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-2 border-b border-border pb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-[32rem] max-w-full" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-2 p-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="flex flex-col gap-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="hidden h-5 w-28 sm:block" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
