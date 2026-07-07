// ProjectShowcase (M2.6 · FE-PUB-11 detail-link) — a presentation showcase of selected work the
// supplier has delivered. The frozen `showcase_projects` M2 entity is NOT wired into the public read,
// so this renders EDITORIAL, supplier-provided project cards (no frozen field; coins nothing) with
// DECORATIVE image tiles (no fabricated <img> source). "View details" now links to the per-project
// detail page (FE-PUB-11, `/vendors/[slug]/projects/[projectSlug]`) WHEN a `vendorSlug` is supplied and
// the project carries a `slug`; without either it stays DISABLED (no route fabricated). The list card's
// "Client" is the sector/role descriptor only — the NAMED client renders on the DETAIL page only
// (companion §6.9 R2, scoped there). Presentation-only; genuine-empty when absent. Reuses the kit
// (Card/Badge/Button) + the canonical vendor URL builder; RSC-friendly.
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { vendorProjectHref } from "../vendor-url";
import type { ProjectShowcaseVM } from "./company-content-seed";

export interface ProjectShowcaseProps {
  projects?: ProjectShowcaseVM[];
  /** Vendor slug — enables the per-project "View details" link (FE-PUB-11). Omit → link stays disabled. */
  vendorSlug?: string;
}

export function ProjectShowcase({ projects, vendorSlug }: ProjectShowcaseProps) {
  if (!projects || projects.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.name}>
            <Card className="flex h-full flex-col overflow-hidden p-0">
              {/* Decorative tile — no fabricated image source. */}
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border-b border-border bg-muted text-muted-foreground">
                <ImageIcon aria-hidden="true" className="size-6" />
                {project.imageLabel ? (
                  <span className="text-xs font-medium text-foreground">{project.imageLabel}</span>
                ) : null}
              </div>
              <CardContent className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {project.industry ? <Badge variant="brand">{project.industry}</Badge> : null}
                  {project.year ? (
                    <span className="text-xs text-muted-foreground">{project.year}</span>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-iv-ink-heading">{project.name}</p>
                {project.client ? (
                  <p className="text-xs text-muted-foreground">Client: {project.client}</p>
                ) : null}
                {project.scope ? (
                  <p className="text-sm text-muted-foreground">{project.scope}</p>
                ) : null}
                {project.equipment && project.equipment.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {project.equipment.map((item) => (
                      <Badge key={item} variant="neutral">
                        {item}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mt-auto pt-1">
                  {vendorSlug && project.slug ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={vendorProjectHref(vendorSlug, project.slug)}>View details</Link>
                    </Button>
                  ) : (
                    // No vendor slug or no project slug -> no deep route fabricated (stays disabled).
                    <Button size="sm" variant="outline" disabled>
                      View details
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Project information is provided by the supplier.
      </p>
    </div>
  );
}
