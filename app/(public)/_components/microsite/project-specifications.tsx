// ProjectSpecifications (FE-PUB-11 · P-PUB-25) — technical specifications as label/value display rows
// (semantically a description list, not a data table). Auto-hides when absent. Values are display strings,
// never computed. Presentation-only; reuses the kit; RSC-friendly.
import { VendorSection } from "./vendor-section";
import { Card, CardContent } from "@/frontend/primitives/card";
import type { ProjectSpecRowVM } from "./company-content-seed";

export interface ProjectSpecificationsProps {
  specs?: ProjectSpecRowVM[];
}

export function ProjectSpecifications({ specs }: ProjectSpecificationsProps) {
  if (!specs || specs.length === 0) return null;
  return (
    <VendorSection id="specifications" title="Technical Specifications">
      <Card>
        <CardContent className="p-5">
          <dl className="grid gap-x-8 sm:grid-cols-2">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between gap-4 border-b border-border py-2.5"
              >
                <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                <dd className="text-right text-sm font-semibold tabular-nums text-foreground">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </VendorSection>
  );
}
