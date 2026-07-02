// FE-PUB-09 MEGA_MENU — CategoryIcon (MEGA_MENU_COMPONENT_SPEC.md §Category-tree tier).
// Resolves a node's overlay `icon` key through the registry; falls back to the node's ROOT
// glyph (registry keys the 13 root slugs), then to the neutral shape. Never inline-imports
// arbitrary icons — overlay data stays serializable.

import * as React from "react";
import { cn } from "../../lib/cn";
import { FALLBACK_CATEGORY_ICON, resolveCategoryIcon } from "../model/icon-registry";
import type { CategoryNodeVM } from "../model/types";

export interface CategoryIconProps extends React.SVGAttributes<SVGSVGElement> {
  node?: Pick<CategoryNodeVM, "icon" | "slug">;
  iconKey?: string;
  /** Root slug for glyph inheritance when the node itself has no overlay icon. */
  rootSlug?: string;
  size?: number;
}

export function CategoryIcon({
  node,
  iconKey,
  rootSlug,
  size = 20,
  className,
  ...props
}: CategoryIconProps) {
  const Icon =
    resolveCategoryIcon(iconKey ?? node?.icon) ??
    resolveCategoryIcon(node?.slug) ??
    resolveCategoryIcon(rootSlug) ??
    FALLBACK_CATEGORY_ICON;
  return (
    <Icon
      aria-hidden
      width={size}
      height={size}
      className={cn("shrink-0 text-muted-foreground", className)}
      {...props}
    />
  );
}
