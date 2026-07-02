"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuCategory (MEGA_MENU_COMPONENT_SPEC.md §Mega-menu tier).
// One node row: icon + name + optional description + badge + chevron when drillable. ALWAYS a
// real link (click navigates regardless of children — UX doc §1); `comingSoon` suppresses the
// href (no dead links). Hover drill is intent-delayed by the column; this row only reports.

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { CategoryIcon } from "../category-tree/category-icon";
import { CategoryBadge } from "../category-tree/category-badge";
import { useMenuInstance } from "./menu-context";
import type { CategoryNodeVM } from "../model/types";

export interface MegaMenuCategoryProps {
  node: CategoryNodeVM;
  active?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  rootSlug?: string;
  className?: string;
  onActivate?(node: CategoryNodeVM): void;
  onNavigate?(node: CategoryNodeVM): void;
}

export function MegaMenuCategory({
  node,
  active,
  showDescription,
  showIcon = true,
  rootSlug,
  className,
  onActivate,
  onNavigate,
}: MegaMenuCategoryProps) {
  const { hrefFor, emit } = useMenuInstance();
  const hasChildren = node.children.length > 0;

  const rowClass = cn(
    "flex min-h-[44px] w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm outline-none transition-colors",
    active
      ? "bg-accent text-accent-foreground"
      : "text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
    node.comingSoon && "cursor-default text-muted-foreground hover:bg-transparent",
    className,
  );

  const body = (
    <>
      {showIcon ? <CategoryIcon node={node} rootSlug={rootSlug} size={18} /> : null}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium">{node.name}</span>
          <CategoryBadge node={node} />
        </span>
        {showDescription && node.description ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {node.description}
          </span>
        ) : null}
      </span>
      {hasChildren ? (
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      ) : null}
    </>
  );

  // comingSoon: visible, muted, chip, non-navigable (UX doc §7) — a div, never a dead <a>.
  if (node.comingSoon) {
    return (
      <div role="listitem" data-menu-row aria-disabled className={rowClass}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={hrefFor(node)}
      data-menu-row
      aria-haspopup={hasChildren || undefined}
      aria-expanded={hasChildren ? active : undefined}
      aria-current={active ? "true" : undefined}
      className={rowClass}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onActivate?.(node);
      }}
      onFocus={() => onActivate?.(node)}
      onClick={() => {
        emit({ type: "node_navigate" }, node);
        onNavigate?.(node);
      }}
    >
      {body}
    </Link>
  );
}
