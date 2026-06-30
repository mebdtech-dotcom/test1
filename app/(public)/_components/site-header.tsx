"use client";

// Public top-nav chrome (Doc-7C SR2 `(public)` group / Doc-7D PR1, PR7). ANONYMOUS: there is NO
// org-switcher and NO notification center here (those are authenticated shell slots — Doc-7C §4/§6).
// Conversion CTAs route to the auth-entry area (Doc-7E owns the auth action — Doc-7D PR5).
// Nav items marked (*) target Wave-3 public views (P-PUB-*) not yet built — placeholdered to "/".
import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { BrandLogo } from "@/frontend/brand";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/frontend/primitives/sheet";
import { Separator } from "@/frontend/primitives/separator";

const NAV_LINKS = [
  { href: "/", label: "Marketplace" }, // *
  { href: "/", label: "Vendors" }, // *
  { href: "/", label: "Pricing" }, // *
  { href: "/", label: "Resources" }, // *
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-[var(--iv-z-sticky)] border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-[var(--iv-page-max)] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandLogo height={32} />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Button
              key={l.label}
              asChild
              variant="ghost"
              size="sm"
              className="hover:text-iv-ink-heading"
            >
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Get started</Link>
          </Button>
        </div>

        <div className="ml-auto md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile">
                {NAV_LINKS.map((l) => (
                  <SheetClose asChild key={l.label}>
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href={l.href}>{l.label}</Link>
                    </Button>
                  </SheetClose>
                ))}
              </nav>
              <Separator className="my-4" />
              <div className="flex flex-col gap-2">
                <SheetClose asChild>
                  <Button asChild variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild>
                    <Link href="/login">Get started</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
