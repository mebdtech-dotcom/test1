// ProjectRelated (FE-PUB-11 · P-PUB-25) — the "More Projects From This Supplier" rail. Same-vendor-only is
// STRUCTURAL: the input is the vendor's own project list (never a cross-vendor match — that read is an
// unresolved ESC for products). Filters out the current project, caps at three, and renders via the existing
// ProjectShowcase card grid. Auto-hides when nothing remains. Owns the stable #related anchor.
// Presentation-only; reuses the kit + the canonical vendor URL builder; RSC-friendly.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VendorSection } from "./vendor-section";
import { ProjectShowcase } from "./project-showcase";
import { vendorHref } from "../vendor-url";
import type { ProjectShowcaseVM } from "./company-content-seed";

export interface ProjectRelatedProps {
  /** The vendor's own projects (same-vendor-only is enforced by passing this list). */
  projects?: ProjectShowcaseVM[];
  currentProjectSlug: string;
  vendorSlug: string;
}

export function ProjectRelated({ projects, currentProjectSlug, vendorSlug }: ProjectRelatedProps) {
  const related = (projects ?? [])
    .filter((project) => project.slug && project.slug !== currentProjectSlug)
    .slice(0, 3);
  if (related.length === 0) return null;
  return (
    <VendorSection
      id="related"
      title="More Projects From This Supplier"
      action={
        <Link
          href={vendorHref(vendorSlug, "projects")}
          className="inline-flex items-center gap-1 text-sm font-medium text-iv-brand-600 hover:underline"
        >
          View all projects
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      }
    >
      <ProjectShowcase projects={related} vendorSlug={vendorSlug} />
    </VendorSection>
  );
}
