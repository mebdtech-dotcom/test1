// P-ADM-20 Routing rule editor (Doc-7H · Settings · `manage_routing_rule` / `assist_routing` · J-ADM-05 ·
// STAGE-GATED). PRESENTATION ONLY: the editor for one routing control-plane rule. `routing_rules` are owned by
// RFQ/Module 3 (BC-7), platform-owned (Doc-2 §3.4); the control plane is STAGE-GATED (Doc-3 §0.1/§18B) and
// activates in a later operating stage. Save / enable / human-assist are RENDERED BUT DISABLED —
// `manage_routing_rule` and `assist_routing` are owned by RFQ (R5: staff_super_admin, §5.6 platform-staff) and
// stage-gated. Rule PARAMETERS resolve from `core.system_configuration` (Doc-2:762) — not free-form here, so no
// rule-field schema is invented. Unknown/absent rule → byte-equivalent `notFound()` (Invariant #11). Moat: no
// matching/fairness math re-derived; no score. Composes the shell PageHeader + generic DashboardSection /
// DescriptionList / PresentationFormNote + kit.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { DescriptionList } from "../../../_components/vendor/shared/description-list";
import { PresentationFormNote } from "../../../_components/vendor/shared/presentation-form-note";
import {
  getRoutingRule,
  ROUTING_STATE_META,
} from "../../../_components/admin/routing/routing-seed";

const LIST = "/admin/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ruleId: string }>;
}): Promise<Metadata> {
  const { ruleId } = await params;
  const rule = getRoutingRule(ruleId);
  return { title: rule ? `${rule.label} · Routing · Admin` : "Routing rule · Admin" };
}

export default async function RoutingRuleEditorPage({
  params,
}: {
  params: Promise<{ ruleId: string }>;
}) {
  const { ruleId } = await params;
  const rule = getRoutingRule(ruleId);
  if (!rule) notFound();

  const meta = ROUTING_STATE_META[rule.enabled ? "on" : "off"];

  return (
    <div className="space-y-6">
      <Link
        href={LIST}
        className="-mx-1.5 inline-flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to routing rules
      </Link>

      <PageHeader
        title={rule.label}
        description="Routing rules govern how invitations are selected and distributed. The control plane is stage-gated; editing activates in a later operating stage."
        meta={
          <>
            <span className="font-mono text-xs text-muted-foreground">{rule.id}</span>
            <StatusChip label={meta.label} tone={meta.tone} />
          </>
        }
        actions={
          // Disabled — `manage_routing_rule` is owned by RFQ (R5) and stage-gated.
          <Button size="sm" disabled>
            Save
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Rule" className="lg:col-span-2">
          <DescriptionList
            items={[
              { label: "Rule", value: rule.label },
              { label: "Summary", value: rule.summary },
              { label: "Status", value: meta.label },
            ]}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Rule parameters resolve from platform configuration — they are governed centrally, not
            edited free-form here.
          </p>
        </DashboardSection>

        <DashboardSection title="Configuration">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Enable or disable this rule and human-assist routing. Owned by the RFQ engine; enabled
              once the operating stage opens.
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Disabled — stage-gated + owned by RFQ (R5). */}
              <Button size="sm" variant="outline" disabled>
                {rule.enabled ? "Disable" : "Enable"}
              </Button>
              {/* Disabled — `assist_routing` (human-assisted routing) is stage-gated + RFQ-owned (R5). */}
              <Button size="sm" variant="outline" disabled>
                Assist routing
              </Button>
            </div>
            <PresentationFormNote />
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
