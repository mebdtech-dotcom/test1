// P-BUY-01 route-level loading UI (SK-DASHBOARD preset, Doc-7F §9.1 / GI-05). Next.js renders this while
// the server page streams. Presentation-only; composed from kit Skeleton primitives.

import { DashboardSkeleton } from "../_components/dashboard-skeletons";

export default function BuyerDashboardLoading() {
  return (
    <>
      <DashboardSkeleton />
    </>
  );
}
