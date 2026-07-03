"use client";

import { Menu, Package } from "lucide-react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { NavList } from "./nav-list";

export interface MobileNavProps {
  /** Id of the active nav slot (decided by the caller). */
  activeId?: string;
  /** Optional per-nav badge labels, keyed by nav id. */
  badges?: Record<string, string>;
}

/**
 * Mobile navigation drawer. Shown only below `lg`; holds ephemeral open/close
 * UI state and renders the same structural nav as the desktop sidebar.
 */
export function MobileNav({ activeId, badges }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex size-9 items-center justify-center rounded-[var(--radius)] text-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 gap-0 bg-sidebar p-0">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex size-8 items-center justify-center rounded-[var(--radius)] bg-primary text-primary-foreground">
            <Package className="size-5" aria-hidden="true" />
          </div>
          <SheetTitle className="text-base font-semibold text-sidebar-foreground">
            iVendorz
          </SheetTitle>
        </div>
        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4">
          <NavList activeId={activeId} badges={badges} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
