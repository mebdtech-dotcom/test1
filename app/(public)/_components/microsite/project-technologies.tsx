// ProjectTechnologies (FE-PUB-11 · P-PUB-25) — "Technologies & Methods" as editorial descriptor badges
// (not a coined governance signal). Auto-hides when absent. Owns the stable #technologies anchor.
// Presentation-only; reuses the kit; RSC-friendly.
import { Badge } from "@/frontend/primitives/badge";
import { VendorSection } from "./vendor-section";

export interface ProjectTechnologiesProps {
  technologies?: string[];
}

export function ProjectTechnologies({ technologies }: ProjectTechnologiesProps) {
  if (!technologies || technologies.length === 0) return null;
  return (
    <VendorSection id="technologies" title="Technologies & Methods">
      <div className="flex flex-wrap gap-1.5">
        {technologies.map((tech) => (
          <Badge key={tech} variant="neutral">
            {tech}
          </Badge>
        ))}
      </div>
    </VendorSection>
  );
}
