// S11 Branding — presentation-only. Binds the FROZEN marketplace.branding_assets model: one slot per
// asset_type (logo | banner | colors | video | brochure | gallery), each a file_ref shown via the kit
// FileLink (no uploads — file_ref only; Doc-7C file-link model) + a draft/public visibility chip.
//
// NO INVENTION (flagged): the companion's granular primary/secondary/accent colour pickers and
// font_family/favicon are NOT frozen columns ("colors" is an unstructured asset object). They are a
// companion↔corpus reconciliation item — bound to the asset model only, never fabricated here.
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { FileLink } from "@/frontend/components/file-link";
import { PresentationContextBanner } from "./presentation-context-banner";
import { VisibilityChip } from "./status-chips";
import { PresentationFormNote } from "../company/presentation-form-note";
import type { BrandingAssetType, BrandingAssetView } from "./types";

const ASSET_TYPES: { type: BrandingAssetType; label: string; description: string }[] = [
  { type: "logo", label: "Logo", description: "Your company logo" },
  { type: "banner", label: "Banner", description: "Hero banner image" },
  { type: "colors", label: "Colours", description: "Brand colour configuration" },
  { type: "video", label: "Video", description: "Intro or showcase video" },
  { type: "brochure", label: "Brochure", description: "Downloadable brochure" },
  { type: "gallery", label: "Gallery", description: "Image gallery" },
];

export interface BrandingPanelProps {
  assets?: BrandingAssetView[];
}

export function BrandingPanel({ assets }: BrandingPanelProps) {
  const byType = new Map((assets ?? []).map((asset) => [asset.asset_type, asset]));

  return (
    <div className="space-y-6">
      <PresentationContextBanner />
      <p className="text-sm text-muted-foreground">
        Branding assets are linked from your file library — there are no uploads here. Each asset
        stays a draft until your microsite is published.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {ASSET_TYPES.map((meta) => {
          const asset = byType.get(meta.type);
          return (
            <li key={meta.type}>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base">{meta.label}</CardTitle>
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                  </div>
                  <VisibilityChip visibility={asset?.visibility} />
                </CardHeader>
                <CardContent className="space-y-3">
                  {asset?.href ? (
                    <FileLink href={asset.href} name={asset.name ?? meta.label} />
                  ) : (
                    <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                      <ImageIcon aria-hidden="true" className="size-4 shrink-0" /> Not set
                    </div>
                  )}
                  <Button type="button" variant="outline" size="sm" disabled>
                    Choose from library
                  </Button>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <PresentationFormNote />
        <Button type="button" disabled>
          Save branding
        </Button>
      </div>
    </div>
  );
}
