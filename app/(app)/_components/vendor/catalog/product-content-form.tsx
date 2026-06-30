// S7 Product Editor — Content. Matching-relevant CONTENT (DP5 banner). Binds the FROZEN
// marketplace.products fields: name (required), description, images (file_ref via images_jsonb). NO
// SKU (not a frozen column — omitted, flagged). Images are linked from the file library (no uploads;
// file_ref only). Uncontrolled controls; native textarea interim ([ESC-7B-TEXTAREA]); Save disabled.
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { FileLink } from "@/frontend/components/file-link";
import { FormField } from "@/frontend/components/form-field";
import { MatchingContextBanner } from "../company/matching-context-banner";
import { PresentationFormNote } from "../company/presentation-form-note";
import type { ProductView } from "./types";

const TEXTAREA_CLASS =
  "min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface ProductContentFormProps {
  product?: ProductView;
}

export function ProductContentForm({ product }: ProductContentFormProps) {
  const images = (product?.images ?? []).filter((image) => image.href);

  return (
    <form className="space-y-6" aria-label="Product content">
      <MatchingContextBanner>
        Editing your products affects how buyers match with you.
      </MatchingContextBanner>

      <div className="grid gap-5">
        <FormField
          id="product-name"
          label="Product name"
          required
          inputProps={{
            defaultValue: product?.name ?? "",
            placeholder: "e.g. Centrifugal pump CP-200",
          }}
        />
        <FormField
          id="product-description"
          label="Description"
          description="Describe the product for buyers."
        >
          <textarea
            id="product-description"
            name="description"
            defaultValue={product?.description ?? ""}
            className={TEXTAREA_CLASS}
          />
        </FormField>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {images.length > 0 ? (
            <ul className="space-y-2">
              {images.map((image, index) => (
                <li key={image.href}>
                  <FileLink href={image.href as string} name={image.name ?? `Image ${index + 1}`} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              <ImageIcon aria-hidden="true" className="size-4 shrink-0" /> No images linked
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
          Save product
        </Button>
      </div>
    </form>
  );
}
