"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuTrail (Approval Addendum, MINOR-07 breadcrumb preview).
// Desktop status row: the active/hovered node's ancestor trail (Mechanical › Pumps ›
// Centrifugal) BEFORE any click — the same trail idiom search results use. Collapses when no
// path is active.

import * as React from "react";
import { cn } from "../../lib/cn";
import { useTaxonomy } from "../providers/taxonomy-provider";
import { useMenuState } from "../providers/menu-state-provider";

export function MegaMenuTrail({ className }: { className?: string }) {
  const { byId, pathTo } = useTaxonomy();
  const { activePath } = useMenuState();
  const leafId = activePath[activePath.length - 1];
  const leaf = leafId ? byId.get(leafId) : undefined;
  if (!leaf) return null;
  const trail = pathTo(leaf.id);
  return (
    <p
      aria-live="polite"
      className={cn("truncate px-3 py-1.5 text-xs text-muted-foreground", className)}
    >
      {trail.map((node, i) => (
        <React.Fragment key={node.id}>
          {i > 0 ? <span aria-hidden> › </span> : null}
          <span className={i === trail.length - 1 ? "font-medium text-foreground" : undefined}>
            {node.name}
          </span>
        </React.Fragment>
      ))}
    </p>
  );
}
