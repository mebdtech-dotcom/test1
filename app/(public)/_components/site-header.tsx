"use client";

// Public top-nav chrome (Doc-7C SR2 `(public)` group / Doc-7D PR1, PR7). ANONYMOUS: there is NO
// org-switcher and NO notification center here (those are authenticated shell slots — Doc-7C §4/§6).
// Conversion CTAs route to the auth-entry area (Doc-7E owns the auth action — Doc-7D PR5).
// Nav items marked (*) target Wave-3 public views (P-PUB-*) not yet built — placeholdered to "/".
// FE-PUB-09: hosts the Industrial Category Explorer (IA §5.3 — MEGA_MENU package instance).
//
// Two-row layout (owner reference mockup, 2026-07-04): row 1 = logo + catalog search + auth
// entry; row 2 = Categories/Suppliers/More/Sell-on-iVendorz + Help Center/Request-for-Quotation.
// "Suppliers" is the existing vendor directory (P-PUB-12), relabeled for this row — not a new
// destination. "Sell on iVendorz" routes to the same shared auth-entry area as every other
// conversion CTA (Doc-7E owns auth; no distinct vendor-signup flow exists to invent a route for).
// "More" groups the two still-unbuilt Wave-3 placeholders (Pricing/Resources) rather than
// inventing new destinations. "Help Center" is placeholdered to "/" — same Wave-3 convention, no
// help-center surface exists yet. No language switcher / account-menu affordance is rendered:
// this codebase has no i18n system and no anonymous "account" concept, so a decorative toggle for
// either would be pure fabrication (GI-03).
import * as React from "react";
import Link from "next/link";
import { ChevronDown, FilePlus2, Menu } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { BrandLogo } from "@/frontend/brand";
import { SearchBar } from "@/frontend/components/search-bar";
import { Container } from "@/frontend/components/container";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/frontend/primitives/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/frontend/primitives/sheet";
import { Separator } from "@/frontend/primitives/separator";
import { Explorer } from "./explorer/explorer";
import type { ExplorerMobileProps } from "./explorer/explorer-mobile";

type ExplorerMobileComponent = React.ComponentType<ExplorerMobileProps>;

const MARKETPLACE_LINK = { href: "/marketplace", label: "Marketplace" }; // P-PUB-10 (M2.2)
const SUPPLIERS_LINK = { href: "/vendors", label: "Suppliers" }; // P-PUB-12 (M2.2), relabeled
const MORE_LINKS = [
  { href: "/", label: "Pricing" }, // * Wave-3, not yet built
  { href: "/", label: "Resources" }, // * Wave-3, not yet built
];
const SELL_ON_IVENDORZ_HREF = "/login";
const HELP_CENTER_HREF = "/"; // * Wave-3, not yet built

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [MobileExplorer, setMobileExplorer] = React.useState<ExplorerMobileComponent | null>(null);
  const importingMobile = React.useRef(false);

  // FE-PUB-09 fix, take 2 (Review-B RV-0126 re-review REGRESSION): a `next/dynamic`/`React.lazy`
  // boundary declared at module scope — even with `ssr: false` — still gets registered in Next's
  // client-reference-manifest for this route and Turbopack's production bundler eagerly
  // `<script async>`s it, because `SiteHeader` is reachable from the root layout (shared by every
  // route); a runtime conditional can't suppress a build-time manifest entry. Fix: no lazy
  // boundary at module scope at all — a bare `import()`, made only inside this handler on first
  // sheet-open, is invisible to the hydration manifest (see `explorer.tsx` for the fuller
  // rationale — same fix pattern, applied here for the mobile drawer's chunk).
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !importingMobile.current && !MobileExplorer) {
      importingMobile.current = true;
      import("./explorer/explorer-mobile").then((mod) => setMobileExplorer(() => mod.default));
    }
  }

  return (
    <header className="sticky top-0 z-[var(--iv-z-sticky)] border-b border-border bg-background">
      {/* Row 1 — logo · catalog search · auth entry. Shares the page-content Container so the
          chrome aligns to the same grid as body content (one max-width across header/body/footer). */}
      <Container className="flex h-16 items-center gap-4">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandLogo height={32} />
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBar
            action="/search"
            label="Search the marketplace"
            placeholder="Search products, suppliers, equipment…"
            className="max-w-xl"
          />
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Get started</Link>
          </Button>
        </div>

        <div className="ml-auto md:hidden">
          <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-80 flex-col overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-2">
                <SearchBar action="/search" label="Search the marketplace" autoFocus={false} />
              </div>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile">
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href={MARKETPLACE_LINK.href}>{MARKETPLACE_LINK.label}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href={SUPPLIERS_LINK.href}>{SUPPLIERS_LINK.label}</Link>
                  </Button>
                </SheetClose>
                {MORE_LINKS.map((l) => (
                  <SheetClose asChild key={l.label}>
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href={l.href}>{l.label}</Link>
                    </Button>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href={SELL_ON_IVENDORZ_HREF}>Sell on iVendorz</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href={HELP_CENTER_HREF}>Help Center</Link>
                  </Button>
                </SheetClose>
              </nav>
              <Separator className="my-4" />
              {/* FE-PUB-09: "All Categories" — hybrid accordion/drill-in Explorer (UX doc §3).
                  shrink-0: the sheet scrolls as a whole; a shrinkable section would paint its
                  overflow underneath the CTA block below. */}
              <section aria-label="All categories" className="shrink-0">
                <h3 className="mb-1 px-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                  All categories
                </h3>
                {MobileExplorer ? (
                  <MobileExplorer onNavigate={() => setOpen(false)} />
                ) : (
                  <p className="px-1 py-2 text-sm text-muted-foreground">Loading categories…</p>
                )}
              </section>
              <Separator className="my-4" />
              <div className="flex flex-col gap-2">
                <SheetClose asChild>
                  <Button asChild>
                    <Link href="/login">
                      <FilePlus2 aria-hidden />
                      Request for Quotation
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline">
                    <Link href="/login">Get started</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>

      {/* Row 2 — Categories · Suppliers · More · Sell on iVendorz · Help Center · Request for Quotation */}
      <div className="hidden border-t border-border md:block">
        <Container className="flex h-11 items-center gap-1">
          <Explorer />
          <nav className="flex items-center gap-1" aria-label="Primary">
            <Button asChild variant="ghost" size="sm" className="hover:text-iv-ink-heading">
              <Link href={MARKETPLACE_LINK.href}>{MARKETPLACE_LINK.label}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hover:text-iv-ink-heading">
              <Link href={SUPPLIERS_LINK.href}>{SUPPLIERS_LINK.label}</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 hover:text-iv-ink-heading">
                  More
                  <ChevronDown aria-hidden="true" className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {MORE_LINKS.map((l) => (
                  <DropdownMenuItem key={l.label} asChild>
                    <Link href={l.href}>{l.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild variant="ghost" size="sm" className="hover:text-iv-ink-heading">
              <Link href={SELL_ON_IVENDORZ_HREF}>Sell on iVendorz</Link>
            </Button>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hover:text-iv-ink-heading">
              <Link href={HELP_CENTER_HREF}>Help Center</Link>
            </Button>
            {/* Request for Quotation = the visually dominant row-2 action (owner delta; Smart
                RFQ is the moat) — same destination/intent as the prior "Post RFQ" CTA, restyled
                as a pill to match the reference layout; current button color kept (not gold —
                gold stays reserved for premium/verified/featured contexts). */}
            <Button asChild size="sm" className="rounded-full">
              <Link href="/login">
                <FilePlus2 aria-hidden />
                Request for Quotation
              </Link>
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
