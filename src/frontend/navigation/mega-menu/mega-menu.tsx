"use client";

// FE-PUB-09 MEGA_MENU — MegaMenu root (MEGA_MENU_COMPONENT_SPEC.md §Mega-menu tier).
// Desktop (≥lg) Industrial Category Explorer: composes the vendored NavigationMenu primitive
// (disclosure semantics, hover intent, ESC/outside-click close, focus return) around the
// column drill surface + Approval-Addendum slots. Owns nothing but composition.
//
// Touch hover suppression (R2-NITPICK-02): the vendored trigger's hover-open only fires for
// fine pointers (Radix gates hover on pointer type); tap/click parity is native. Breakpoints
// (ARCH §9.3): the right rail (featured/vendors) appears ≥xl (1280 — the 5-column tier); the
// panel is capped at --iv-mega-menu-max and centered (>1600).

import * as React from "react";
import { cn } from "../../lib/cn";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../primitives/navigation-menu";
import { useTaxonomyOrNull } from "../providers/taxonomy-provider";
import { NavigationMenuStateProvider, useMenuState } from "../providers/menu-state-provider";
import { MenuInstanceProvider, useMenuInstance } from "./menu-context";
import type { MenuInstanceProviderProps } from "./menu-context";
import { MegaMenuColumns } from "./mega-menu-column";
import { MegaMenuEmptyState } from "./mega-menu-empty";
import { MegaMenuFeatured } from "./mega-menu-featured";
import { MegaMenuVendors } from "./mega-menu-vendors";
import { MegaMenuTrail } from "./mega-menu-trail";
import { MegaMenuPopular } from "./mega-menu-popular";
import { MegaMenuIndustryStrip } from "./mega-menu-industry-strip";
import { MegaMenuQuickActions } from "./mega-menu-quick-actions";
import { MegaMenuFooter } from "./mega-menu-footer";
import { MegaMenuSearch } from "./mega-menu-search";
import type { IndustryShortcut, MenuVendorVM, PopularSearchTerm } from "../model/types";

export interface MegaMenuProps extends Pick<
  MenuInstanceProviderProps,
  "source" | "hrefFor" | "onEvent" | "authenticated"
> {
  label?: string;
  /** Open on mount — used by the app-layer preload ladder when the user opened via click. */
  defaultOpen?: boolean;
  /** Addendum slot data — every slot collapses when its data is absent (GI-03). */
  popularSearches?: PopularSearchTerm[];
  industryShortcuts?: IndustryShortcut[];
  vendors?: MenuVendorVM[];
  vendorsViewAllHref?: string;
  viewAllHref?: string;
  className?: string;
  /** Extra panel content (e.g. MegaMenuSearch in Phase 3). */
  children?: React.ReactNode;
}

function MegaMenuPanel({
  popularSearches,
  industryShortcuts,
  vendors,
  vendorsViewAllHref = "/vendors",
  viewAllHref = "/categories",
  children,
}: Pick<
  MegaMenuProps,
  | "popularSearches"
  | "industryShortcuts"
  | "vendors"
  | "vendorsViewAllHref"
  | "viewAllHref"
  | "children"
>) {
  const taxonomy = useTaxonomyOrNull();
  if (!taxonomy || taxonomy.roots.length === 0) return <MegaMenuEmptyState />;

  return (
    // `/` anywhere in the panel focuses the search (SPEC addendum keyboard table).

    <div
      className="flex flex-col"
      onKeyDown={(e) => {
        if (e.key !== "/" || (e.target as HTMLElement).closest("[data-mega-menu-search]")) return;
        const search = document.querySelector<HTMLInputElement>("[data-mega-menu-search]");
        if (search) {
          e.preventDefault();
          search.focus();
        }
      }}
    >
      <MegaMenuSearch />
      {children}
      <div className="flex min-w-0">
        <MegaMenuColumns className="min-w-0 flex-1" />
        {/* Right rail — the 5th column tier (≥1280 per ARCH §9.3). */}
        <aside className="hidden w-72 shrink-0 border-l border-border xl:block">
          <MegaMenuFeatured />
          <MegaMenuVendors vendors={vendors} viewAllHref={vendorsViewAllHref} />
        </aside>
      </div>
      <MegaMenuTrail className="border-t border-border" />
      <MegaMenuPopular terms={popularSearches} />
      <MegaMenuIndustryStrip shortcuts={industryShortcuts} />
      <MegaMenuQuickActions />
      <MegaMenuFooter viewAllHref={viewAllHref} />
    </div>
  );
}

function MegaMenuTriggerWithEvents({ label }: { label: string }) {
  const { open, setOpen } = useMenuState();
  const { emit } = useMenuInstance();
  const markOpen = () => {
    if (!open) emit({ type: "menu_open" });
    setOpen(true);
  };
  return (
    <NavigationMenuTrigger
      onClick={markOpen}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") markOpen();
      }}
    >
      {label}
    </NavigationMenuTrigger>
  );
}

export function MegaMenu({
  source,
  hrefFor,
  onEvent,
  authenticated,
  label = "All Categories",
  defaultOpen = false,
  className,
  ...panelProps
}: MegaMenuProps) {
  const taxonomy = useTaxonomyOrNull();
  return (
    <MenuInstanceProvider
      source={source}
      hrefFor={hrefFor}
      onEvent={onEvent}
      authenticated={authenticated}
      pathFor={taxonomy ? (node) => taxonomy.pathTo(node.id) : undefined}
    >
      <NavigationMenuStateProvider>
        <NavigationMenu
          delayDuration={80}
          defaultValue={defaultOpen ? "explorer" : undefined}
          className={cn("hidden lg:flex", className)}
        >
          <NavigationMenuList>
            <NavigationMenuItem value="explorer">
              <MegaMenuTriggerWithEvents label={label} />
              <NavigationMenuContent>
                <MegaMenuPanel {...panelProps} />
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </NavigationMenuStateProvider>
    </MenuInstanceProvider>
  );
}
