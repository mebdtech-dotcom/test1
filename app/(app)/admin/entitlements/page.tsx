// P-ADM-24 Entitlements / bundles (Doc-7H · Management · `create_entitlement` + `bundle_plan_entitlement` ·
// J-ADM-06). PRESENTATION ONLY: the entitlement catalog and its plan bundling. READ BINDING: there is NO
// standalone `list_entitlements` contract — the frozen read pair `get_plan`/`list_plans` "serves both plan
// catalog and entitlement definitions" (Doc-4I §Part-1 reconciliation); so the catalog is DERIVED from the plan
// reads (no invented list read). Entitlements are `{slug UNIQUE, type<boolean|numeric|enum>}` — INVARIANT #10:
// entitlements are granted by VALUE (boolean/numeric/enum), NEVER by plan name. Creating an entitlement
// (`create_entitlement`) and bundling it to a plan (`bundle_plan_entitlement`) are owned by M7/Billing (R5) —
// both affordances RENDERED BUT DISABLED. No fabricated total (GI-03). Reuses PageHeader + shared AdminQueueTable.
import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  listEntitlementCatalog,
  type EntitlementCatalogRowVM,
} from "../../_components/admin/plans/plans-seed";

export const metadata: Metadata = { title: "Entitlements · Admin" };

const COLUMNS: AdminQueueColumn<EntitlementCatalogRowVM>[] = [
  {
    key: "slug",
    header: "Slug",
    className: "whitespace-nowrap font-mono text-xs text-muted-foreground",
    cell: (e) => e.slug,
  },
  {
    key: "type",
    header: "Type",
    className: "whitespace-nowrap capitalize text-muted-foreground",
    cell: (e) => e.type,
  },
  {
    key: "plans",
    header: "Bundled in",
    cell: (e) => (
      <div className="flex flex-wrap gap-1.5">
        {e.plans.map((p) => (
          <span key={p} className="rounded bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground">
            {p}
          </span>
        ))}
      </div>
    ),
  },
];

export default function EntitlementsPage() {
  const rows = listEntitlementCatalog();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entitlements"
        description="The entitlement catalog and its plan bundling. Entitlements are granted by value — boolean, numeric, or enum — never by plan name."
        actions={
          <div className="flex flex-wrap gap-2">
            {/* Disabled — `create_entitlement` is owned by M7/Billing (R5). */}
            <Button size="sm" variant="outline" disabled>
              New entitlement
            </Button>
            {/* Disabled — `bundle_plan_entitlement` is owned by M7/Billing (R5). */}
            <Button size="sm" disabled>
              Bundle to plan
            </Button>
          </div>
        }
      />

      <Card className="border-dashed p-4">
        <div className="flex items-start gap-3">
          <KeyRound aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">Read via the plan catalog</p>
            <p className="text-muted-foreground">
              Entitlement definitions are surfaced through the plan reads — there is no separate
              entitlements list. Each entitlement is resolved by value (boolean / numeric / enum),
              never by plan name.
            </p>
          </div>
        </div>
      </Card>

      {rows.length > 0 ? (
        <AdminQueueTable
          columns={COLUMNS}
          rows={rows}
          rowKey={(e) => e.slug}
          caption="Entitlement catalog"
          minWidthClassName="min-w-[44rem]"
        />
      ) : (
        <EmptyState
          icon={<KeyRound aria-hidden="true" />}
          title="No entitlements defined"
          description="There are no entitlements in the catalog right now."
        />
      )}
    </div>
  );
}
