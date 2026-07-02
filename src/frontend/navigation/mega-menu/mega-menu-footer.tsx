"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuFooter (MEGA_MENU_COMPONENT_SPEC.md §Mega-menu tier).
// "View all categories" + optional per-branch "View all in {parent}" + an optional PRE-FORMATTED
// contract-provided count line (GI-03: rendered when supplied, never computed here; absence
// renders nothing — no "0 products").

import * as React from "react";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { useTaxonomy } from "../providers/taxonomy-provider";
import { useMenuState } from "../providers/menu-state-provider";
import { useMenuInstance } from "./menu-context";

export interface MegaMenuFooterProps {
  viewAllHref: string;
  /** Pre-formatted, contract-provided line — never computed by the kit. */
  counts?: { label: string };
  className?: string;
}

export function MegaMenuFooter({ viewAllHref, counts, className }: MegaMenuFooterProps) {
  const { byId } = useTaxonomy();
  const { activePath } = useMenuState();
  const { hrefFor, emit } = useMenuInstance();
  const activeParent =
    activePath.length > 0 ? byId.get(activePath[activePath.length - 1]!) : undefined;
  const branchTarget = activeParent && activeParent.children.length > 0 ? activeParent : undefined;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href={viewAllHref}
          className="font-medium text-iv-ink-heading hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => emit({ type: "quick_action_clicked", action: "view_all_categories" })}
        >
          View all categories
        </Link>
        {branchTarget ? (
          <Link
            href={hrefFor(branchTarget)}
            className="text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all in {branchTarget.name}
          </Link>
        ) : null}
      </div>
      {counts?.label ? <p className="text-xs text-muted-foreground">{counts.label}</p> : null}
    </div>
  );
}
