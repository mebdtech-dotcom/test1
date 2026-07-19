// PL-1 Pipeline — BOARD view (companion §13.2; a desktop convenience, NOT offered on mobile). Six
// stage columns. Mounted under the merged RFQ workspace's Pipeline lens (`/sell/rfqs?view=board` —
// Cluster #1 merge, Team-1 F1/F3); the column "View →" links point at that lens, not the retired index.
// CRITICAL byte-equivalence rules: each column header carries the stage label + a
// NON-NUMERIC "View →" link — NEVER a count ([ESC-7-API] #1: no received-only count read exists). There
// is NO client cross-column tally [MINOR-2]; each column is its own lazy cursor-paged read. A zero-row
// column uses the SAME canonical empty token as every other (excluded ≡ not-matched ≡ zero). In the
// presentation phase every column renders genuine-empty. Presentation-only; RSC-friendly.
//
// FE-VEN-07 delta (P-VND-21): each card now also renders `NextActionPill` (own CRM
// `next_action_urgency`/`next_action_label`) — matches the List view's information density instead
// of silently dropping the same underlying field. Not an aggregate, not a count (ND-8 unaffected).
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/frontend/primitives/card";
import { LeadStageChip } from "./lead-stage-chip";
import { NextActionPill } from "./next-action-pill";
import type { LeadStage, LeadView } from "./types";

const COLUMNS: LeadStage[] = ["received", "quoted", "negotiation", "won", "lost", "follow_up"];

export interface LeadBoardProps {
  /** Optional pre-grouped leads by stage; absent → every column renders genuine-empty. */
  leadsByStage?: Partial<Record<LeadStage, LeadView[]>>;
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function LeadBoard({ leadsByStage, basePath = "/sell" }: LeadBoardProps) {
  return (
    <div className="hidden gap-3 overflow-x-auto md:flex">
      {COLUMNS.map((stage) => {
        const items = leadsByStage?.[stage] ?? [];
        return (
          <Card key={stage} className="w-64 shrink-0">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
              <LeadStageChip stage={stage} />
              <Link
                href={`${basePath}/rfqs?view=board`}
                className="text-xs font-medium text-iv-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View →
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.length > 0 ? (
                items.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`${basePath}/leads/${lead.id}`}
                    className="block space-y-1 rounded-md border border-border p-2 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <p>{lead.rfq_summary ?? lead.rfq_human_ref ?? "Lead"}</p>
                    <NextActionPill
                      urgency={lead.next_action_urgency}
                      label={lead.next_action_label ?? lead.next_action_at}
                    />
                  </Link>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-muted-foreground">No leads</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
