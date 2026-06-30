// S7 Product Editor — Specifications. IMMUTABLE versioned (Invariant 8 / DP11): each spec document is
// a new version (version_no), only is_active_revision toggles — nothing is overwritten or deleted.
// Current vs superseded shown via a labelled chip; superseded versions are kept for reference. Add
// version is integration-phase (disabled). Progressive disclosure ([ESC-7B-VERSION-LIST]) deferred.
import { FileText, Plus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PresentationFormNote } from "../company/presentation-form-note";
import type { SpecDocType, SpecDocumentView } from "./types";

const DOC_TYPE_LABEL: Record<SpecDocType, string> = {
  urs: "URS",
  datasheet: "Datasheet",
  checklist: "Checklist",
  drawing: "Drawing",
  standard: "Standard",
};

export interface ProductSpecsPanelProps {
  specs?: SpecDocumentView[];
}

export function ProductSpecsPanel({ specs }: ProductSpecsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Specification documents are versioned and never overwritten — each revision is kept.
        </p>
        <Button type="button" variant="outline" size="sm" disabled>
          <Plus aria-hidden="true" className="size-4" /> Add version
        </Button>
      </div>

      {specs && specs.length > 0 ? (
        <ul className="space-y-2">
          {specs.map((spec) => {
            const superseded = spec.is_active_revision === false;
            return (
              <li
                key={spec.id}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <FileText aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {spec.doc_type ? DOC_TYPE_LABEL[spec.doc_type] : "Document"} · v
                    {spec.version_no}
                    {spec.revision_label ? ` (${spec.revision_label})` : ""}
                  </p>
                  {spec.created_at ? (
                    <p className="truncate text-xs text-muted-foreground">{spec.created_at}</p>
                  ) : null}
                </div>
                <StatusChip
                  label={superseded ? "Superseded" : "Current"}
                  tone={superseded ? "neutral" : "success"}
                />
                {spec.href ? (
                  <Button asChild variant="ghost" size="sm">
                    <a href={spec.href}>Open</a>
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          title="No specifications yet"
          description="Add a specification document. New versions supersede earlier ones, which are kept for reference."
        />
      )}

      <PresentationFormNote />
    </div>
  );
}
