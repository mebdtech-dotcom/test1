// Buyer Workspace — DataListTable re-export shim. PROMOTED to the Doc-7B kit (Shared Platform Component
// Registry §4.2 CTO override — 2026-07-03): `@/frontend/components/data-list-table` is now the single
// canonical implementation. Kept as a re-export so existing buyer imports (`../data-list-table`) continue
// to resolve unchanged — zero behavior change. New code should import from the kit directly.
export {
  DataListTable,
  type DataColumn,
  type DataListTableProps,
} from "@/frontend/components/data-list-table";
