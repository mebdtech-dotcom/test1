// P-BUY-RFQ Phase 4 — Attachments. PRESENTATION-ONLY: a drag-&-drop AREA (visual only — no file input, no
// real upload) and an uploaded-file list with preview rows + per-file validation state. With zero files
// the drop-zone's own copy ("Drag & drop… / No attachments") IS the empty state — no separate `EmptyState`
// block underneath (that doubled the section's height with a redundant "nothing here" message).
// The real upload (→ `spec_document_ids[]`) is capped by `[ESC-7-API/upload]` and connects at integration —
// this milestone renders the UI and handles no files (Board scope: "no uploads").

import { UploadCloud, Paperclip, AlertTriangle } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import type { RfqAttachment } from "./rfq-form-models";

export function UploadArea({ attachments }: { attachments?: RfqAttachment[] }) {
  const files = attachments ?? [];
  return (
    <div className="flex flex-col gap-3">
      {/* FZ-10: visual drop zone only — non-interactive (no functional upload this milestone).
          `aria-disabled` marks it as such for AT, since the dashed border + copy could otherwise read as
          an interactive control; the note below already states when it connects. Full fix (labelled
          <label>+file-input/button) lands when upload is wired — `[ESC-7-API/upload]`. */}
      <div
        aria-disabled="true"
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-6 text-center"
      >
        <UploadCloud aria-hidden className="size-7 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Drag &amp; drop spec documents here</p>
        <p className="text-xs text-muted-foreground">
          PDF, DOCX, XLSX or images, up to 20&nbsp;MB each. Uploading connects in the integration
          phase.
        </p>
      </div>
      {files.length === 0 ? null : (
        <ul className="flex flex-col gap-2">
          {files.map((f) => {
            const invalid = f.status === "too-large" || f.status === "unsupported";
            return (
              <li
                key={f.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                  invalid ? "border-destructive/40 bg-destructive/5" : "border-border bg-card",
                )}
              >
                {invalid ? (
                  <AlertTriangle aria-hidden className="size-4 shrink-0 text-destructive" />
                ) : (
                  <Paperclip aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate text-foreground">{f.name}</span>
                {f.sizeLabel ? (
                  <span className="shrink-0 text-xs text-muted-foreground">{f.sizeLabel}</span>
                ) : null}
                {invalid ? (
                  <span className="ml-auto shrink-0 text-xs font-medium text-destructive">
                    {f.status === "too-large" ? "Too large" : "Unsupported type"}
                  </span>
                ) : (
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">Ready</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
