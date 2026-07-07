// ProjectMaterials (FE-PUB-11 · P-PUB-25) — the "Materials & Equipment Used" list (a detail-page superset;
// the list card keeps its short `equipment` tags). Auto-hides when absent. Presentation-only; reuses the
// kit; RSC-friendly.
import { Package } from "lucide-react";
import { VendorSection } from "./vendor-section";
import { Card, CardContent } from "@/frontend/primitives/card";

export interface ProjectMaterialsProps {
  items?: string[];
}

export function ProjectMaterials({ items }: ProjectMaterialsProps) {
  if (!items || items.length === 0) return null;
  return (
    <VendorSection id="materials" title="Materials & Equipment Used">
      <Card>
        <CardContent className="p-5">
          <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <Package aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-iv-navy-400" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </VendorSection>
  );
}
