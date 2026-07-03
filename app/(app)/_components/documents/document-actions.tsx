// Documents shared home — DocumentActions (FE-DOC, the owner's Round-2 strategic abstraction +
// findings NIT-1/NIT-2). The per-artifact affordance cluster every documents listing renders:
// Download (kit `FileLink` over the surface-resolved storage ref) + Preview (honest dialog).
// ASYNC honesty: a still-generating artifact renders the pending note, never a fake link
// (the `GeneratedArtifactView` precedent). Absent artifact ⇒ em dash — no existence claim
// (ESC-7G-ENG-03 discipline). Disabled affordances follow the FE-DOC visibility matrix
// (WP fe-doc-01): this cluster is read-only — it never renders grant/revoke/generate.

import { FileLink } from "@/frontend/components/file-link";
import { DocumentPreviewDialog } from "./document-preview-dialog";

export interface DocumentArtifactView {
  /** Resolved link for the storage ref (seeded today; a signed URL when wired). */
  href?: string;
  /** File display name (falls back to the document's human ref). */
  name?: string;
  sizeLabel?: string;
  /** Async generation still running (`generation_job_id` in flight) — show the pending note. */
  isPending?: boolean;
}

export interface DocumentActionsProps {
  /** Human ref / display name of the owning document (labels the preview). */
  documentName: string;
  artifact?: DocumentArtifactView;
}

export function DocumentActions({ documentName, artifact }: DocumentActionsProps) {
  if (artifact?.isPending) {
    return <span className="text-xs text-muted-foreground">PDF generating…</span>;
  }
  if (!artifact?.href) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className="flex items-center justify-end gap-1">
      <FileLink
        href={artifact.href}
        name={artifact.name ?? documentName}
        sizeLabel={artifact.sizeLabel}
        className="max-w-52 px-2 py-1"
      />
      <DocumentPreviewDialog documentName={artifact.name ?? documentName} />
    </span>
  );
}
