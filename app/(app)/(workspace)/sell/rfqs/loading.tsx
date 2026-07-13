// Skeleton-first loading for the RFQ inbox (companion §7.2 pattern 1). State-agnostic and identical
// for every vendor (byte-equivalence BE-6).
import { VendorContentSkeleton } from "../../../_components/vendor";

export default function RfqsLoading() {
  return <VendorContentSkeleton />;
}
