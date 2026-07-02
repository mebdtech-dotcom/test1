"use client";

// FE-PUB-09 MEGA_MENU — CategoryNodeItem (MEGA_MENU_COMPONENT_SPEC.md §Category-tree tier).
// One row in tree/accordion modes: expander + icon + name + badge + optional selection control
// (picker groundwork — the tree only RENDERS selected/disabled states it is told; caps and
// validation stay app-side). MegaMenuCategory is its column-mode sibling.

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { CategoryIcon } from "./category-icon";
import { CategoryBadge } from "./category-badge";
import type { CategoryNodeVM } from "../model/types";

export interface CategoryNodeItemProps {
  node: CategoryNodeVM;
  href?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  current?: boolean;
  depth?: number;
  showIcon?: boolean;
  rootSlug?: string;
  selectable?: "none" | "single" | "multi";
  className?: string;
  onToggle?(node: CategoryNodeVM): void;
  onSelect?(node: CategoryNodeVM): void;
  onNavigate?(node: CategoryNodeVM): void;
}

export function CategoryNodeItem({
  node,
  href,
  expanded,
  selected,
  disabled,
  current,
  depth = 0,
  showIcon,
  rootSlug,
  selectable = "none",
  className,
  onToggle,
  onSelect,
  onNavigate,
}: CategoryNodeItemProps) {
  const hasChildren = node.children.length > 0;
  const label = (
    <>
      {showIcon ? <CategoryIcon node={node} rootSlug={rootSlug} size={18} /> : null}
      <span className="min-w-0 flex-1 truncate text-start">{node.name}</span>
      <CategoryBadge node={node} />
    </>
  );

  return (
    <div
      className={cn(
        "flex min-h-[48px] items-center gap-1 rounded-md pe-1 text-sm",
        current && "bg-accent",
        disabled && "opacity-50",
        className,
      )}
      style={depth > 0 ? { paddingInlineStart: `${depth * 16}px` } : undefined}
    >
      {hasChildren ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${node.name}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onToggle?.(node)}
        >
          {expanded ? (
            <ChevronDown aria-hidden className="size-4" />
          ) : (
            <ChevronRight aria-hidden className="size-4" />
          )}
        </button>
      ) : (
        <span aria-hidden className="size-9 shrink-0" />
      )}

      {selectable !== "none" ? (
        <button
          type="button"
          role={selectable === "multi" ? "checkbox" : "radio"}
          aria-checked={Boolean(selected)}
          disabled={disabled}
          className={cn(
            "flex min-h-[44px] min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selected && "bg-accent font-medium",
          )}
          onClick={() => onSelect?.(node)}
        >
          <span
            aria-hidden
            className={cn(
              "flex size-4 shrink-0 items-center justify-center border border-border",
              selectable === "multi" ? "rounded-sm" : "rounded-full",
              selected && "border-iv-navy-700 bg-iv-navy-700",
            )}
          >
            {selected ? <span className="size-1.5 rounded-full bg-primary-foreground" /> : null}
          </span>
          {label}
        </button>
      ) : node.comingSoon || !href ? (
        <span className="flex min-h-[44px] min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-muted-foreground">
          {label}
        </span>
      ) : (
        <Link
          prefetch={false}
          href={href}
          aria-current={current ? "page" : undefined}
          className="flex min-h-[44px] min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onNavigate?.(node)}
        >
          {label}
        </Link>
      )}
    </div>
  );
}
