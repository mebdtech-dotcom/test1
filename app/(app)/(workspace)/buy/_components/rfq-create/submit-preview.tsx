"use client";

// P-BUY-RFQ Phase 8 — submit action + FLOATING preview. PRESENTATION-ONLY: clicking "Submit RFQ" does
// not submit anything (the audit-backed `submit_rfq` write is Wave-4/PARKED, see rfq-create-view.tsx);
// it instead opens a FULL-SCREEN document preview (owner directive 2026-07-07 — same document
// convention as the vendor's quotation preview, but BUYER content only, no vendor features) with
// "Edit" (dismiss, back to the form) and "Confirm" (local-only acknowledgement — no write occurs).
// Reuses the kit `Dialog` primitive; the document itself is `RfqPreviewDocument`.

import * as React from "react";
import { CheckCircle2, Info, Plus, Save } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/frontend/primitives/dialog";
import { RfqPreviewDocument } from "./rfq-preview-document";
import type { RfqDraftForm } from "./rfq-form-models";

export function SubmitPreview({ form, submitting }: { form: RfqDraftForm; submitting?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  return (
    <>
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0 text-iv-brand-600" />
          Drafts and submission connect in the integration phase.
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" disabled className="gap-1.5">
            <Save aria-hidden className="size-4" />
            Save draft
          </Button>
          <Button
            type="button"
            disabled={submitting}
            className="gap-1.5"
            onClick={() => {
              setConfirmed(false);
              setOpen(true);
            }}
          >
            <Plus aria-hidden className="size-4" />
            {submitting ? "Submitting…" : "Submit RFQ"}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        {confirmed ? (
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 aria-hidden className="size-10 text-iv-success-base" />
              <DialogTitle>Request confirmed</DialogTitle>
              <DialogDescription>
                Your RFQ is confirmed as a draft. Submission connects to the routing engine once the
                integration phase lands.
              </DialogDescription>
              <Button type="button" onClick={() => setOpen(false)} className="mt-2">
                Close
              </Button>
            </div>
          </DialogContent>
        ) : (
          <DialogContent className="flex h-[92dvh] w-[96vw] max-w-5xl flex-col gap-0 overflow-hidden p-0">
            <DialogHeader className="border-b border-border px-6 py-4">
              <DialogTitle>RFQ preview</DialogTitle>
              <DialogDescription>
                Read-only — your RFQ as vendors will receive it. You can still edit anything before
                confirming.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto bg-slate-100 px-4 py-6 sm:px-6">
              <RfqPreviewDocument form={form} />
            </div>

            <DialogFooter className="items-center gap-3 border-t border-border px-6 py-4 sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Submission connects to the routing engine in the integration phase.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Edit
                </Button>
                <Button type="button" onClick={() => setConfirmed(true)}>
                  Confirm
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
