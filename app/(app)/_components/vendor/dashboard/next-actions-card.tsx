// Vendor Workspace — Dashboard "Next actions" panel (VX-02, owner-directed dashboard layout
// revision 2026-07-15). The real, backed stand-in for the reference mockup's "Follow-ups due" card.
// Pure presentation over caller-supplied rows — invents nothing; the dashboard page supplies an
// explicitly-labelled presentation-fixture SEED until the M4 BC-OPS-3 lead read is wired.
//
// ND-8 — WHY THERE IS NO COUNT BADGE (binding, do not "fix" this):
// The reference's card header carries a "12" badge and its KPI band carries a "Follow-ups due: 12"
// tile. Neither is renderable here. An aggregate over leads is FORBIDDEN (ND-8: the only permitted
// analytics denominators are invitations-received and quotations-submitted) — leads are
// received-only, created out-of-wire from `VendorInvited`, so a tally over them leaks the
// matched-but-excluded universe and breaks byte-equivalence (Invariant #11 / GR11 / CHK-7-040).
// `next-action-pill.tsx` states the same rule at its own head. This card therefore renders ROWS
// ONLY — each pill is driven purely by its own row's date, which is exactly what that component is
// for. No header badge, no total, no "N due".
//
// NO CREATE AFFORDANCE: the reference's "Add follow-up" footer button has no analogue — the vendor
// NEVER self-creates a lead (`../leads/types.ts`), so the footer is a NAVIGATION action to the merged
// RFQ Pipeline lens (`/sell/rfqs?view=board` — Cluster #1 merge, Team-1 F1/F4) instead, preserving the
// card's footprint without a fabricated command. Per-lead rows still deep-link the KEPT detail route
// (`/sell/leads/[leadId]`, F3), so the two destinations are separate props below.
//
// NO PARTY NAME / AVATAR: the reference rows lead with a counterparty's initials. A lead projects no
// buyer name (rfq_id is a bare UUID, "not a window into RFQ data" — DF-3), so the leading 34px slot
// is a neutral icon and the row is titled by its REAL `rfq_human_ref`. No name is coined.
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { NextActionPill } from "../leads/next-action-pill";
import type { LeadView } from "../leads/types";

export interface NextActionsCardProps {
  /** Lead rows carrying their own `next_action_*` fields — order is the caller's. */
  leads: LeadView[];
  /** The pipeline INDEX destination (the "All →" link + footer CTA) — the merged Pipeline lens
   *  (Cluster #1 merge; Team-1 F1). */
  pipelineHref?: string;
  /** Base path for a per-lead deep-link — the KEPT lead-detail route (F3). Rows link `${base}/${id}`. */
  leadHrefBase?: string;
}

export function NextActionsCard({
  leads,
  pipelineHref = "/sell/rfqs?view=board",
  leadHrefBase = "/sell/leads",
}: NextActionsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5">
        {/* No count badge — see the ND-8 note in this file's header. */}
        <h2 className="text-base font-semibold leading-none tracking-tight">Next actions</h2>
        <Link
          href={pipelineHref}
          className="shrink-0 text-sm font-medium text-iv-brand-600 hover:underline"
        >
          All <span aria-hidden>→</span>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {leads.length === 0 ? (
          <EmptyState title="No next actions scheduled" className="py-10" />
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {leads.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`${leadHrefBase}/${lead.id}`}
                  className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <CalendarClock aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-xs font-semibold text-foreground">
                      {lead.rfq_human_ref ?? "Lead"}
                    </span>
                    {(lead.next_action_label ?? lead.rfq_summary) ? (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {lead.next_action_label ?? lead.rfq_summary}
                      </span>
                    ) : null}
                  </span>
                  <NextActionPill
                    urgency={lead.next_action_urgency}
                    label={lead.next_action_at}
                    className="shrink-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <div className="border-t border-border p-4">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={pipelineHref}>View pipeline</Link>
        </Button>
      </div>
    </Card>
  );
}
