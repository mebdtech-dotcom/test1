"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuMobile (MEGA_MENU_COMPONENT_SPEC.md · UX doc §3).
// The <lg surface: kit Sheet drawer with the HYBRID drill model — roots render as an accordion
// (expand-in-place to L2, cheap scanning without losing context); tapping an L2 branch DRILLS
// IN (full-width pane, thumb-friendly); MegaMenuBreadcrumb pins on top with `‹ Back`. Every
// pane offers "View all {name}" as its first row; leaves navigate directly. Depth is bounded
// by DATA (recursion), never a code constant. This component never owns app nav —
// `extraSections` passes non-category items through.

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../primitives/accordion";
import { useTaxonomy } from "../providers/taxonomy-provider";
import { useMenuState } from "../providers/menu-state-provider";
import { useMenuInstance } from "./menu-context";
import { CategoryIcon } from "../category-tree/category-icon";
import { CategoryBadge } from "../category-tree/category-badge";
import { MegaMenuBreadcrumb } from "./mega-menu-breadcrumb";
import { MegaMenuEmptyState } from "./mega-menu-empty";
import { MegaMenuSearch } from "./mega-menu-search";
import type { CategoryNodeVM } from "../model/types";

export interface MegaMenuMobileProps {
  className?: string;
  /** Rendered on the ROOT pane below the tree (popular searches, quick actions, app nav). */
  extraSections?: React.ReactNode;
  onNavigate?(node: CategoryNodeVM): void;
}

function MobileRow({
  node,
  rootSlug,
  showIcon,
  onDrill,
  onNavigate,
}: {
  node: CategoryNodeVM;
  rootSlug: string;
  showIcon?: boolean;
  onDrill(node: CategoryNodeVM): void;
  onNavigate?(node: CategoryNodeVM): void;
}) {
  const { hrefFor, emit } = useMenuInstance();
  const hasChildren = node.children.length > 0;
  const rowClass =
    "flex h-12 w-full min-w-0 items-center gap-2.5 rounded-md px-2.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (node.comingSoon) {
    return (
      <div className={cn(rowClass, "cursor-default text-muted-foreground hover:bg-transparent")}>
        {showIcon ? <CategoryIcon node={node} rootSlug={rootSlug} size={18} /> : null}
        <span className="min-w-0 flex-1 truncate text-start">{node.name}</span>
        <CategoryBadge node={node} />
      </div>
    );
  }

  // Branch rows DRILL on first tap (UX §3.2); leaves navigate directly (UX §3.3).
  if (hasChildren) {
    return (
      <button
        type="button"
        className={rowClass}
        onClick={() => {
          emit({ type: "node_drill" }, node);
          onDrill(node);
        }}
      >
        {showIcon ? <CategoryIcon node={node} rootSlug={rootSlug} size={18} /> : null}
        <span className="min-w-0 flex-1 truncate text-start font-medium">{node.name}</span>
        <CategoryBadge node={node} />
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </button>
    );
  }

  return (
    <Link
      prefetch={false}
      href={hrefFor(node)}
      className={rowClass}
      onClick={() => {
        emit({ type: "node_navigate" }, node);
        onNavigate?.(node);
      }}
    >
      {showIcon ? <CategoryIcon node={node} rootSlug={rootSlug} size={18} /> : null}
      <span className="min-w-0 flex-1 truncate text-start">{node.name}</span>
      <CategoryBadge node={node} />
    </Link>
  );
}

export function MegaMenuMobile({ className, extraSections, onNavigate }: MegaMenuMobileProps) {
  const taxonomy = useTaxonomy();
  const { activePath, openPath } = useMenuState();
  const { hrefFor, emit } = useMenuInstance();

  if (taxonomy.roots.length === 0) return <MegaMenuEmptyState />;

  const currentId = activePath[activePath.length - 1];
  const current = currentId ? taxonomy.byId.get(currentId) : undefined;
  const rootSlug = current ? taxonomy.pathTo(current.id)[0]!.slug : undefined;

  // Drill always sets the ABSOLUTE ancestor path (root-first) so the breadcrumb trail is
  // complete even when entering from a root-pane accordion (root not yet on the stack).
  const drillTo = (node: CategoryNodeVM) => openPath(taxonomy.pathTo(node.id).map((n) => n.id));

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <MegaMenuSearch className="border-b-0 px-0" />
      <MegaMenuBreadcrumb />

      {current ? (
        /* Drilled pane — full-width children list, "View all {name}" first (UX §3.3).
           Key change re-mounts per node → token-driven pane slide (Phase 4); instant under
           prefers-reduced-motion. */
        <nav
          key={current.id}
          aria-label={current.name}
          className="flex-1 animate-iv-slide-up overflow-y-auto py-1 motion-reduce:animate-none"
        >
          <Link
            prefetch={false}
            href={hrefFor(current)}
            className="flex h-12 items-center rounded-md px-2.5 text-sm font-semibold text-iv-ink-heading hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              emit({ type: "node_navigate" }, current);
              onNavigate?.(current);
            }}
          >
            View all {current.name}
          </Link>
          {current.children.map((child) => (
            <MobileRow
              key={child.id}
              node={child}
              rootSlug={rootSlug ?? child.slug}
              onDrill={drillTo}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      ) : (
        /* Root pane — accordion of the 13 roots, expand-in-place to L2 (UX §3.2). */
        <nav aria-label="All categories" className="flex-1 overflow-y-auto">
          <Accordion type="multiple">
            {taxonomy.roots.map((root) => (
              <AccordionItem key={root.id} value={root.id} className="border-b-0">
                <AccordionTrigger className="min-h-[48px] rounded-md px-2.5 hover:bg-accent hover:no-underline">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <CategoryIcon node={root} rootSlug={root.slug} size={18} />
                    <span className="truncate">{root.name}</span>
                    <CategoryBadge node={root} />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-1 ps-4">
                  <Link
                    prefetch={false}
                    href={hrefFor(root)}
                    className="flex h-12 items-center rounded-md px-2.5 text-sm font-medium text-iv-ink-heading hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => {
                      emit({ type: "node_navigate" }, root);
                      onNavigate?.(root);
                    }}
                  >
                    View all {root.name}
                  </Link>
                  {root.children.map((child) => (
                    <MobileRow
                      key={child.id}
                      node={child}
                      rootSlug={root.slug}
                      onDrill={drillTo}
                      onNavigate={onNavigate}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {extraSections}
        </nav>
      )}
    </div>
  );
}
