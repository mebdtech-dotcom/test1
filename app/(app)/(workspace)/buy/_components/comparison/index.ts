// P-BUY-15 Buyer Supplier Comparison — barrel (the single import point for the comparison composition).
// `ComparisonTable`/`ComparisonSummary`/`ComparisonEmpty`/`ComparisonData`/`ComparisonSupplier` were
// PROMOTED to the Doc-7B kit (Shared Platform Component Registry §4.2 CTO override — 2026-07-03); this
// barrel re-exports them alongside the buyer-scoped page host so existing imports of this folder are
// unaffected.
export { ComparisonView } from "./comparison-view";
export {
  ComparisonTable,
  ComparisonSummary,
  ComparisonEmpty,
  type ComparisonData,
  type ComparisonSupplier,
} from "@/frontend/components/comparison";
