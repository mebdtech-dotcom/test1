// P-ADM-19 Routing rules (Doc-7H · Management · `rfq.manage_routing_rule.v1` · J-ADM-05 · STAGE-GATED). PRESENTATION
// ONLY: the routing control-plane rule list. `routing_rules` are owned by RFQ/Module 3 (BC-7), platform-owned
// (Doc-2 §3.4); the control plane is STAGE-GATED (Doc-3 §0.1/§18B operating-stage) — it activates in a later
// operating stage. Manage actions are RENDERED BUT DISABLED — `manage_routing_rule` is owned by RFQ (R5:
// staff_super_admin, §5.6 platform-staff) AND stage-gated. Rule parameters resolve from
// `core.system_configuration` (not edited here). No score, no matching/fairness math re-derived here (moat —
// RFQ owns selection/fairness/routing). No fabricated total (GI-03). Reuses the shell PageHeader + shared
// AdminQueueTable + kit.
import type { Metadata } from "next";
import { Waypoints } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  ROUTING_RULES,
  ROUTING_STATE_META,
  type RoutingRuleVM,
} from "../../_components/admin/routing/routing-seed";

export const metadata: Metadata = { title: "Routing rules · Admin" };

const COLUMNS: AdminQueueColumn<RoutingRuleVM>[] = [
  {
    key: "rule",
    header: "Rule",
    cell: (r) => (
      <>
        <div className="font-medium text-foreground">{r.label}</div>
        <div className="text-xs text-muted-foreground">{r.summary}</div>
      </>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => {
      const m = ROUTING_STATE_META[r.enabled ? "on" : "off"];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: () => (
      // Disabled — `manage_routing_rule` is owned by RFQ/Module 3 (R5) and the control plane is stage-gated.
      <Button size="sm" variant="outline" disabled>
        Manage
      </Button>
    ),
  },
];

export default function RoutingRulesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Routing rules"
        description="The RFQ routing control plane. Rules govern how invitations are selected and distributed; parameters resolve from platform configuration."
        actions={
          // Disabled — stage-gated + owned by RFQ (R5).
          <Button size="sm" disabled>
            New rule
          </Button>
        }
      />

      <Card className="border-dashed p-4">
        <div className="flex items-start gap-3">
          <Waypoints aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">Stage-gated control plane</p>
            <p className="text-muted-foreground">
              The routing control plane activates in a later operating stage. Rules are shown
              read-only; managing them is owned by the RFQ engine and enabled once the stage opens.
            </p>
          </div>
        </div>
      </Card>

      <AdminQueueTable
        columns={COLUMNS}
        rows={ROUTING_RULES}
        rowKey={(r) => r.id}
        caption="Routing control-plane rules"
        minWidthClassName="min-w-[48rem]"
      />
    </div>
  );
}
