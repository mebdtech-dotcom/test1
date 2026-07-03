"use client";

// Documents shared home — DocumentPreviewDialog (FE-DOC, owner finding NIT-1). A preview
// AFFORDANCE with an HONEST placeholder: the presentation-only build fabricates no document
// render. When backend wiring lands, the dialog body swaps to the resolved `storage_ref` artifact
// (signed-URL viewer) — the kit embeds no blob (Doc-7B BR10). Client component (kit Dialog).

import * as React from "react";
import { Eye, FileSearch } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/primitives/dialog";
import { Button } from "@/frontend/primitives/button";

export interface DocumentPreviewDialogProps {
  /** Display name of the document being previewed (e.g. its human ref). */
  documentName: string;
}

export function DocumentPreviewDialog({ documentName }: DocumentPreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Preview ${documentName}`}>
          <Eye aria-hidden className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{documentName}</DialogTitle>
          <DialogDescription>
            Inline preview renders the stored file here once backend wiring lands. This presentation
            build shows no fabricated document content.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
          <FileSearch aria-hidden className="size-8" />
          <span className="sr-only">Preview unavailable in the presentation build</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
