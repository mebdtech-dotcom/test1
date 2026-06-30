// S14 Preview & Publish — presentation-only. Read-only preview + the FROZEN publish/unpublish state
// machine (Doc-4M: draft / published / unpublished). The live preview connects in the integration
// phase (no backend here). Publish consumes no quota and never affects matching (DP5). Buttons are
// disabled (no mock business logic). marketplace.publish_microsite.v1 is the distinct contract
// ([ESC-7G-06] CLOSED) — wired in integration.
import { ExternalLink, Eye } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { PresentationContextBanner } from "./presentation-context-banner";
import { MicrositeStatusChip } from "./status-chips";
import { PresentationFormNote } from "../company/presentation-form-note";
import type { MicrositeView } from "./types";

export interface PreviewPublishPanelProps {
  microsite?: MicrositeView;
}

export function PreviewPublishPanel({ microsite }: PreviewPublishPanelProps) {
  const isPublished = microsite?.status === "published";

  return (
    <div className="space-y-6">
      <PresentationContextBanner />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye aria-hidden="true" className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Preview &amp; publish</p>
        </div>
        <MicrositeStatusChip status={microsite?.status} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Live preview</CardTitle>
          {microsite?.live_url ? (
            <Button asChild variant="ghost" size="sm">
              <a href={microsite.live_url} target="_blank" rel="noreferrer">
                Open <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-border bg-muted px-4 text-center text-sm text-muted-foreground">
            The live preview connects in the integration phase.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isPublished
              ? "Your microsite is live. Unpublishing hides it; your content and branding are kept."
              : "Publishing makes your microsite public. It does not affect matching and uses no quota."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled>
              Publish microsite
            </Button>
            <Button type="button" variant="outline" disabled>
              Unpublish
            </Button>
          </div>
          <PresentationFormNote />
        </CardContent>
      </Card>
    </div>
  );
}
