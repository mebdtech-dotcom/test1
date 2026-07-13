// Buyer Workspace — EngagementDocumentFileCard (Tier-2). The single "Document file" card for a versioned
// engagement document's rendered artifact (BC-OPS-4-generated), reached off the frozen `storage_ref`
// (Doc-4F §F5.8). Extracted at the third consumer (rule of three) — PO (P-BUY-21), Challan (P-BUY-24) and
// WCC (P-BUY-25) rendered byte-identical copies of this card; they now all compose this one, joined by
// the LOI view (the P-BUY-21 LOI face, WP-1) as the fourth composer. Pure
// presentation (Server Component, no hooks/fetch).
//
// GOVERNANCE: the artifact is a FILE-LINK off the opaque `storage_ref` — the document BODY (`content_jsonb`)
// is NOT a projected read field and is never inlined/fabricated here (Content ≠ Presentation, Inv #9). The
// "Open document" affordance is DISABLED this milestone: the storage-ref → file-URL resolution wires at the
// integration phase (an adjacent hint states why). When absent, an honest empty-file state renders.

import { FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";

export interface EngagementDocumentFileCardProps {
  /** Opaque `storage_ref` to the rendered artifact; a file-link only (never the body). Absent ⇒ empty state. */
  storageRef?: string;
  /** The document noun used in copy (e.g. "purchase order", "delivery challan", "work completion certificate"). */
  documentNoun: string;
}

export function EngagementDocumentFileCard({
  storageRef,
  documentNoun,
}: EngagementDocumentFileCardProps) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Document file</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {storageRef ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText aria-hidden className="size-4 shrink-0" />
              The generated {documentNoun} document.
            </p>
            {/* Disabled: the storage-ref → file-URL resolution wires at the integration milestone.
                An adjacent hint explains WHY it is disabled (not just "not now"). */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Opens in the integration phase.</span>
              <Button type="button" variant="secondary" size="sm" disabled>
                Open document
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<FileText aria-hidden />}
            title="No document file yet"
            description={`The rendered ${documentNoun} will appear here once it is generated.`}
            className="py-8"
          />
        )}
      </CardContent>
    </Card>
  );
}
