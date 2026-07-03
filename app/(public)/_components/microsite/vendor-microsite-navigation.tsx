"use client";

// VendorMicrositeNavigation (M2.5 · refactored M2.7 for ADR-022 / Doc-7D §10). The microsite is now a
// MULTI-PAGE site (seven routes under /vendors/[slug]); this is the persistent primary nav rendered by the
// route-group chrome layout. Links are ROUTE links (Next <Link>), no longer in-page anchors, with active-route
// highlighting via `usePathname` (`aria-current="page"`). Exactly seven items (Doc-7D §10.2 — no additions
// without Board approval). Client component because the mobile drawer (kit Sheet) and the active-state read
// need the browser; the markup is otherwise static. Reuses the kit; imports nothing from the Vendor workspace.
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/frontend/primitives/sheet";
import { cn } from "@/frontend/lib/cn";
import { vendorHref, type VendorSubpage } from "../vendor-url";

export interface VendorMicrositeNavigationProps {
  /** Vendor slug — the base for every route link (`/vendors/[slug]/…`). */
  slug: string;
}

// The canonical seven (Doc-7D §10.2). Resources is the umbrella for certifications/downloads/gallery/videos —
// NOT separate top-level items.
const NAV = [
  { segment: "", label: "Home" },
  { segment: "about", label: "About" },
  { segment: "products", label: "Products" },
  { segment: "projects", label: "Projects" },
  { segment: "industries", label: "Industries" },
  { segment: "resources", label: "Resources" },
  { segment: "contact", label: "Contact" },
] as const;

export function VendorMicrositeNavigation({ slug }: VendorMicrositeNavigationProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname() ?? "";
  const base = vendorHref(slug);

  const items = NAV.map((n) => {
    const href = n.segment ? vendorHref(slug, n.segment as VendorSubpage) : base;
    // Home is active only on the exact base; a sub-route never lights Home. Others match exact or nested.
    const active = n.segment
      ? pathname === href || pathname.startsWith(`${href}/`)
      : pathname === base;
    return { ...n, href, active };
  });

  return (
    <div className="sticky top-14 z-[var(--iv-z-sticky)] -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex h-12 items-center justify-between">
        <nav
          className="hidden min-w-0 items-center gap-1 overflow-x-auto sm:flex"
          aria-label="Vendor sections"
        >
          {items.map((item) => (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                item.active ? "font-semibold text-iv-ink-heading" : "hover:text-iv-ink-heading",
              )}
            >
              <Link href={item.href} aria-current={item.active ? "page" : undefined}>
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        <span className="text-sm font-medium text-muted-foreground sm:hidden">Sections</span>

        <div className="sm:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open sections menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Sections</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Vendor sections">
                {items.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Button
                      asChild
                      variant="ghost"
                      className={cn(
                        "justify-start",
                        item.active ? "font-semibold text-iv-ink-heading" : undefined,
                      )}
                    >
                      <Link href={item.href} aria-current={item.active ? "page" : undefined}>
                        {item.label}
                      </Link>
                    </Button>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
