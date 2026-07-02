"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuFeatured (SPEC + Approval Addendum MAJOR-03, pulled to Phase 1).
// Right-rail curated tiles for the ACTIVE root: overlay `featured` nodes (editorial flags
// pending real analytics). Renders NOTHING when no featured data — never invents (GI-03).
// Counts/featured-suppliers remain contract-gated and are absent until [ESC-7-API-CATNAV].

import * as React from "react";
import { cn } from "../../lib/cn";
import { useTaxonomy } from "../providers/taxonomy-provider";
import { useMenuState } from "../providers/menu-state-provider";
import { useMenuInstance } from "./menu-context";
import { CategoryCard } from "../category-tree/category-card";
import type { CategoryNodeVM } from "../model/types";

export interface MegaMenuFeaturedProps {
  /** Explicit tiles; default = overlay-featured children within the active root (or roots). */
  nodes?: CategoryNodeVM[];
  title?: string;
  max?: number;
  className?: string;
}

export function MegaMenuFeatured({
  nodes,
  title = "Featured",
  max = 4,
  className,
}: MegaMenuFeaturedProps) {
  const { roots, byId } = useTaxonomy();
  const { activePath } = useMenuState();
  const { hrefFor } = useMenuInstance();

  const activeRoot = activePath[0] ? byId.get(activePath[0]) : undefined;
  const tiles = (
    nodes ??
    (activeRoot ? activeRoot.children.filter((c) => c.featured) : roots.filter((r) => r.featured))
  ).slice(0, max);

  if (tiles.length === 0) return null;

  return (
    <section aria-label={title} className={cn("space-y-2 p-3", className)}>
      <h3 className="px-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
        {activeRoot ? ` in ${activeRoot.name}` : ""}
      </h3>
      <div className="grid gap-2">
        {tiles.map((node) => (
          <CategoryCard
            key={node.id}
            node={node}
            href={hrefFor(node)}
            rootSlug={activeRoot?.slug ?? node.slug}
            size="sm"
          />
        ))}
      </div>
    </section>
  );
}
