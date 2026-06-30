// Product status chip — maps the FROZEN marketplace.product_status (Doc-4M) to a presentation tone
// via the kit StatusChip (label text always present; never colour-alone). No "deleted" state exists
// (soft-delete only, DP11). RSC-friendly.
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { ProductStatus } from "./types";

const TONE: Record<ProductStatus, StatusTone> = {
  draft: "neutral",
  published: "success",
  unpublished: "warning",
};
const LABEL: Record<ProductStatus, string> = {
  draft: "Draft",
  published: "Published",
  unpublished: "Unpublished",
};

export function ProductStatusChip({ status }: { status?: ProductStatus }) {
  const value: ProductStatus = status ?? "draft";
  return <StatusChip label={LABEL[value]} tone={TONE[value]} />;
}
