// PL-1 Pipeline — LIST view (companion §13.2; default + low-bandwidth recommendation). Read =
// `ops.list_leads.v1` (cursor, NO offset/total). RECEIVED-ONLY: leads are created out-of-wire on the
// VendorInvited event — the vendor never self-creates one (NO "add lead" affordance). Byte-equivalence
// (Inv 11 / GR11): one canonical empty copy, no counts/totals, no "leads you didn't get".
//
// FROZEN LIST PROJECTION IS MINIMAL — `ops.list_leads.v1` returns only `{vendor_lead_id, stage,
// next_action_at}` (Doc-4F §F6.4). So a row renders stage + next-action + link; the RFQ label is
// OPTIONAL enrichment resolved by integration (lead carries rfq_id as a bare UUID — DF-3), and
// `value_estimate` is DETAIL-only (PL-2 / `get_lead`). The companion PL-1 wireframe's EST.-VALUE and
// RFQ-title columns exceed this projection — flagged (companion↔corpus), mirrors engagements MINOR-C3.
// Presentation-only; RSC-friendly.
import Link from "next/link";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { LeadStageChip } from "./lead-stage-chip";
import { NextActionPill } from "./next-action-pill";
import type { LeadView } from "./types";

export interface LeadListProps {
  leads?: LeadView[];
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function LeadList({ leads, basePath = "/sell" }: LeadListProps) {
  if (!leads || leads.length === 0) {
    // The single canonical empty copy (fixed per list type — [ESC-7B-EMPTY-LOCK]); also the first-run
    // guidance [m-4]. Byte-identical for excluded ≡ never-matched ≡ zero — asserts nothing about matching.
    return (
      <EmptyState
        title="No leads yet"
        description="Leads appear here automatically when a buyer invites you to an RFQ. You don't create them."
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {leads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`${basePath}/leads/${lead.id}`}
                className="flex flex-col gap-2 p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <LeadStageChip stage={lead.stage} />
                  <span className="truncate text-sm font-medium text-foreground">
                    {lead.rfq_summary ?? lead.rfq_human_ref ?? "Lead"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <NextActionPill
                    urgency={lead.next_action_urgency}
                    label={lead.next_action_label ?? lead.next_action_at}
                  />
                  {lead.updated_at ? <span>Updated {lead.updated_at}</span> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
