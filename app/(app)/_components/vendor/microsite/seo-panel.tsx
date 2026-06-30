// S12 SEO — presentation-only. Binds the FROZEN marketplace.seo_settings fields: title,
// meta_description, keywords, og_image (file_ref), canonical_url (server-derived, read-only).
// NO INVENTION: there are no frozen og_title / og_description columns → omitted. schema_jsonb
// (advanced structured data) is integration-phase. Uncontrolled controls; native textarea is the
// interim multi-line control ([ESC-7B-TEXTAREA] pending). Save disabled (no mock business logic).
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { FileLink } from "@/frontend/components/file-link";
import { FormField } from "@/frontend/components/form-field";
import { PresentationContextBanner } from "./presentation-context-banner";
import { VisibilityChip } from "./status-chips";
import { PresentationFormNote } from "../company/presentation-form-note";
import type { SeoSettingsView } from "./types";

const TEXTAREA_CLASS =
  "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface SeoPanelProps {
  seo?: SeoSettingsView;
}

export function SeoPanel({ seo }: SeoPanelProps) {
  return (
    <form className="space-y-6" aria-label="SEO settings">
      <PresentationContextBanner />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Visibility</p>
        <VisibilityChip visibility={seo?.visibility} />
      </div>

      <div className="grid gap-5">
        <FormField
          id="seo-title"
          label="Page title"
          description="Shown in search results and browser tabs."
          inputProps={{
            defaultValue: seo?.title ?? "",
            placeholder: "Your company — industrial supplier",
          }}
        />
        <FormField
          id="seo-meta-description"
          label="Meta description"
          description="A short summary for search engines."
        >
          <textarea
            id="seo-meta-description"
            name="meta_description"
            defaultValue={seo?.meta_description ?? ""}
            className={TEXTAREA_CLASS}
          />
        </FormField>
        <FormField
          id="seo-keywords"
          label="Keywords"
          description="Comma-separated."
          inputProps={{ defaultValue: seo?.keywords ?? "" }}
        />
        <FormField
          id="seo-canonical"
          label="Canonical URL"
          description="Set automatically from your domain — read-only."
        >
          <Input
            id="seo-canonical"
            name="canonical_url"
            defaultValue={seo?.canonical_url ?? ""}
            readOnly
            disabled
            placeholder="Derived from your domain"
          />
        </FormField>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open Graph image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {seo?.og_image_href ? (
            <FileLink href={seo.og_image_href} name={seo.og_image_name ?? "Open Graph image"} />
          ) : (
            <div className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              Not set
            </div>
          )}
          <Button type="button" variant="outline" size="sm" disabled>
            Choose from library
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <PresentationFormNote />
        <Button type="button" disabled>
          Save SEO
        </Button>
      </div>
    </form>
  );
}
