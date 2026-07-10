// P-ADM-23 Plan editor (Doc-7H · Settings · `create/update/retire_plan` + `activate_plan` · J-ADM-06).
// PRESENTATION ONLY: the editor for one commercial plan. Fields bind to the frozen `get_plan` projection
// (Doc-4I §HB-1.4: plan_id, name, billing_cycle, price, currency, status, is_active, entitlements). Save /
// Activate / Retire are RENDERED BUT DISABLED — `update_plan` / `activate_plan` (draft→active, Admin-only) /
// `retire_plan` are owned by M7/Billing (R5). `is_active` (marketing-visibility) is EDITABLE here (it is a
// get_plan/detail field, not a list column). INVARIANT #10: a plan (commercial) is NOT a Financial Tier
// (capability); entitlements resolve by VALUE (boolean/numeric/enum), never by plan name — the bundled
// entitlements are shown read-only (managed on P-ADM-24). Unknown/absent plan → byte-equivalent `notFound()`
// (Invariant #11). Composes the shell PageHeader + generic DashboardSection / DescriptionList /
// PresentationFormNote + kit FormField; Admin-self-contained controls; no new primitive.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { FormField } from "@/frontend/components/form-field";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { DescriptionList } from "../../../_components/vendor/shared/description-list";
import { PresentationFormNote } from "../../../_components/vendor/shared/presentation-form-note";
import { ADMIN_SELECT_CLASS } from "../../../_components/admin/form-control-classes";
import {
  getPlan,
  getPlanDetail,
  PLAN_STATUS_META,
} from "../../../_components/admin/plans/plans-seed";

const LIST = "/admin/plans";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planId: string }>;
}): Promise<Metadata> {
  const { planId } = await params;
  const plan = getPlan(planId);
  return { title: plan ? `${plan.name} · Plans · Admin` : "Plan · Admin" };
}

export default async function PlanEditorPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const plan = getPlanDetail(planId);
  if (!plan) notFound();

  const meta = PLAN_STATUS_META[plan.status];
  const isDraft = plan.status === "draft";
  const canRetire = plan.status === "draft" || plan.status === "active";

  return (
    <div className="space-y-6">
      <Link
        href={LIST}
        className="-mx-1.5 inline-flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to plans
      </Link>

      <PageHeader
        title={plan.name}
        description="Edit the commercial plan. A plan is a commercial package — entitlements are granted by value, never by plan name."
        meta={<StatusChip label={meta.label} tone={meta.tone} />}
        actions={
          // Disabled — `update_plan` is owned by M7/Billing (R5).
          <Button size="sm" disabled>
            Save
          </Button>
        }
      />

      <form className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Plan details" className="lg:col-span-2">
          <div className="space-y-5">
            <FormField
              id="plan-name"
              label="Name"
              required
              inputProps={{ name: "name", defaultValue: plan.name, disabled: true }}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="plan-cycle" label="Billing cycle" required>
                <select
                  id="plan-cycle"
                  name="billing_cycle"
                  className={ADMIN_SELECT_CLASS}
                  defaultValue={plan.billingCycle}
                  disabled
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </FormField>
              <FormField
                id="plan-price"
                label="Price"
                required
                inputProps={{
                  name: "price",
                  type: "number",
                  defaultValue: plan.price,
                  disabled: true,
                }}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="plan-currency"
                label="Currency"
                required
                inputProps={{ name: "currency", defaultValue: plan.currency, disabled: true }}
              />
              <FormField
                id="plan-visibility"
                label="Marketing visibility"
                description="Whether the plan is publicly offered — separate from its lifecycle status."
              >
                <select
                  id="plan-visibility"
                  name="is_active"
                  className={ADMIN_SELECT_CLASS}
                  defaultValue={plan.isVisible ? "true" : "false"}
                  disabled
                >
                  <option value="true">Visible</option>
                  <option value="false">Hidden</option>
                </select>
              </FormField>
            </div>
            <PresentationFormNote />
          </div>
        </DashboardSection>

        <div className="space-y-4">
          <DashboardSection title="Lifecycle">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Publish or retire this plan. Admin decides; Billing applies the effect.
              </p>
              <div className="flex flex-wrap gap-2">
                {isDraft ? (
                  // Disabled — `activate_plan` (draft→active) is Admin-only, owned by M7/Billing (R5).
                  <Button size="sm" variant="outline" disabled>
                    Activate
                  </Button>
                ) : null}
                {canRetire ? (
                  // Disabled — `retire_plan` is owned by M7/Billing (R5).
                  <Button size="sm" variant="outline" disabled>
                    Retire
                  </Button>
                ) : null}
                {!isDraft && !canRetire ? (
                  <span className="text-xs text-muted-foreground">
                    No lifecycle actions available
                  </span>
                ) : null}
              </div>
            </div>
          </DashboardSection>

          <DashboardSection
            title="Entitlements"
            description="Granted by value, not plan name (Invariant #10). Bundling is managed in Entitlements."
          >
            {plan.entitlements.length > 0 ? (
              <DescriptionList
                items={plan.entitlements.map((e) => ({
                  label: e.slug,
                  value: (
                    <span>
                      <span className="font-medium text-foreground">{e.value}</span>{" "}
                      <span className="text-2xs uppercase tracking-wide text-muted-foreground">
                        {e.type}
                      </span>
                    </span>
                  ),
                }))}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No entitlements bundled.</p>
            )}
          </DashboardSection>
        </div>
      </form>
    </div>
  );
}
