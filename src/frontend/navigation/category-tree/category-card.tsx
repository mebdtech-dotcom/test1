// FE-PUB-09 MEGA_MENU — CategoryCard (MEGA_MENU_COMPONENT_SPEC.md §Category-tree tier).
// Rich tile (icon box + name + optional description) for featured grids and the /categories
// landing — the grown-up sibling of the kit CategoryTile (same VM idiom, overlay-extended);
// existing CategoryTile consumers are untouched.

import * as React from "react";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { CategoryIcon } from "./category-icon";
import { CategoryBadge } from "./category-badge";
import type { CategoryNodeVM } from "../model/types";

export interface CategoryCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  node: CategoryNodeVM;
  href: string;
  rootSlug?: string;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}

export function CategoryCard({
  node,
  href,
  rootSlug,
  size = "md",
  showDescription = true,
  className,
  ...props
}: CategoryCardProps) {
  return (
    <Link
      prefetch={false}
      href={href}
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-iv-navy-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        size === "sm" && "p-2",
        size === "lg" && "p-4",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md bg-iv-navy-50 text-iv-navy-700",
          size === "lg" && "size-11",
        )}
      >
        <CategoryIcon node={node} rootSlug={rootSlug} size={size === "lg" ? 22 : 18} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-iv-ink-heading group-hover:underline">
            {node.name}
          </span>
          <CategoryBadge node={node} />
        </span>
        {showDescription && node.description ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {node.description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
