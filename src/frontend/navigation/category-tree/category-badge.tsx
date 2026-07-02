// FE-PUB-09 MEGA_MENU — CategoryBadge (MEGA_MENU_COMPONENT_SPEC.md §Category-tree tier).
// Overlay-state chips ONLY: new / featured / comingSoon / custom badge text. Renders nothing
// without overlay data. NEVER renders governance signals — trust/tier/performance are not
// navigation chips (ARCH §8 boundary; Invariant #6).

import * as React from "react";
import { Badge } from "../../primitives/badge";
import { cn } from "../../lib/cn";
import type { CategoryNodeVM } from "../model/types";

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  node: Pick<CategoryNodeVM, "isNew" | "featured" | "comingSoon" | "badge">;
}

export function CategoryBadge({ node, className, ...props }: CategoryBadgeProps) {
  if (node.comingSoon)
    return (
      <Badge variant="neutral" className={cn("shrink-0", className)} {...props}>
        Coming soon
      </Badge>
    );
  if (node.isNew)
    return (
      <Badge variant="info" className={cn("shrink-0", className)} {...props}>
        New
      </Badge>
    );
  if (node.badge)
    return (
      <Badge variant="brand" className={cn("shrink-0", className)} {...props}>
        {node.badge}
      </Badge>
    );
  if (node.featured)
    return (
      <Badge variant="amber" className={cn("shrink-0", className)} {...props}>
        Featured
      </Badge>
    );
  return null;
}
