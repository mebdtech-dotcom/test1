// PL-2 Lead Detail — RFQ CONTEXT pane (companion §13.2). The lead carries `rfq_id` / `invitation_id` as
// BARE UUIDs (not a window into RFQ data — DF-3): RFQ details are owned by M3 and read only on the M3
// surface via the grant. So this pane offers NAVIGATION only (cross-module read, never a write — DP10 /
// Inv 7): "Open RFQ detail" (→ rfq.get_rfq.v1, grant-scoped) and "Open your quotation" (→ the vendor's
// own submitted quotation, when present). If the grant is gone, the M3 surface returns a byte-identical
// not-found — never "you lost access". The RFQ title is OPTIONAL enrichment (resolved on M3), not
// lead-owned. Presentation-only; RSC-friendly.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import type { LeadView } from "./types";

export interface LeadRfqContextProps {
  lead?: LeadView;
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function LeadRfqContext({ lead, basePath = "/sell" }: LeadRfqContextProps) {
  const rfqId = lead?.rfq_id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">RFQ context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            {lead?.rfq_summary ?? lead?.rfq_human_ref ?? "Linked RFQ"}
          </p>
          {lead?.rfq_human_ref && lead?.rfq_summary ? (
            <p className="font-mono text-xs text-muted-foreground">{lead.rfq_human_ref}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {rfqId ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`${basePath}/rfqs/${rfqId}`}>Open RFQ detail</Link>
            </Button>
          ) : null}
          {rfqId && lead?.has_quotation ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`${basePath}/rfqs/${rfqId}/quotation`}>Open your quotation</Link>
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          RFQ data is owned by the RFQ module — this lead shows only what your grant entitles you to
          see.
        </p>
      </CardContent>
    </Card>
  );
}
