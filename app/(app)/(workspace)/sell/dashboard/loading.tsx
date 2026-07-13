// Dashboard route-segment loading (Doc-7C SR7; companion §7.2 pattern 1). Skeleton-first; identical
// for every vendor (byte-equivalence BE-6). Renders inside the workspace shell.
import { VendorContentSkeleton } from "../../../_components/vendor";

export default function DashboardLoading() {
  return <VendorContentSkeleton />;
}
