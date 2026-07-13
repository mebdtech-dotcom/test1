// Route-segment loading (Doc-7C SR7; companion §7.2 pattern 1). Renders inside the workspace shell
// (the shell is static; only the content streams). Skeleton-first; identical for every vendor.
import { VendorContentSkeleton } from "../../_components/vendor";

export default function WorkspaceLoading() {
  return <VendorContentSkeleton />;
}
