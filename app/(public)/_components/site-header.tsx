"use client";

// Public top-nav chrome (Doc-7C SR2 `(public)` group / Doc-7D PR1, PR7). ANONYMOUS: there is NO
// org-switcher and NO notification center here (those are authenticated shell slots — Doc-7C §4/§6).
// Conversion CTAs (Sign in · Get started · Request for Quotation) route to the auth-entry area
// (Doc-7E owns the auth action — Doc-7D PR5). That rule is unchanged and still governs those three.
// FE-PUB-09: hosts the Industrial Category Explorer (IA §5.3 — MEGA_MENU package instance).
//
// 2026-07-16 — STALE PLACEHOLDERS RETIRED (verified against the "iVendorz Public Pages" reference,
// design project `14497856-6435-433d-b191-2a32431d642b`). This file previously read "Nav items marked
// (*) target Wave-3 public views not yet built — placeholdered to '/'", and Pricing · Resources ·
// Help Center all pointed at "/" — three nav links silently dead-ending on the homepage. All of those
// pages EXIST and are built today (`/pricing` · `/resources` · `/how-it-works` · `/contact`), so the
// placeholders had outlived their cause: the note, not the routes, was the stale thing. Every href in
// this file is now a real route. The reference's own nav set maps 1:1 onto them, which is what
// surfaced the drift. If a future nav label has no route, it does not ship — it does not get "/".
//
// NOT taken from the reference (it is a click-through prototype and routes these loosely): its
// `Sign in`→/for-vendors, `Get started`→/for-buyers, `Request for Quotation`→/marketplace and
// `Suppliers`→/marketplace. Those are auth/workflow and directory destinations, which a visual
// reference must never influence (`visual_reference_implementation.md` §2) — Sign in/Get started/RFQ
// keep the Doc-7E auth entry, Suppliers keeps the real vendor directory (`/vendors`).
//
// Two-row layout (owner reference mockup, 2026-07-04): row 1 = logo + catalog search + auth
// entry; row 2 = Categories/Suppliers/More/Sell-on-iVendorz + Support/Request-for-Quotation.
// "Suppliers" is the existing vendor directory (P-PUB-12), relabeled for this row — not a new
// destination. "Sell on iVendorz" routes to the same shared auth-entry area as every other
// conversion CTA (Doc-7E owns auth; no distinct vendor-signup flow exists to invent a route for)
// — see `SELL_ON_IVENDORZ_HREF` for the 2026-07-16 revert that restored this. "More" groups
// Pricing/Resources/How-it-works, all of which are now BUILT (see the placeholder note below).
// "Support" routes to `/contact`; no help-centre surface exists, so no label promises one.
// No language switcher / account-menu affordance is rendered: this codebase has no i18n system and
// no anonymous "account" concept, so a decorative toggle for either would be pure fabrication (GI-03).
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
/** "More" group — the reference's own three items. Each is a real, built route (see file header:
 *  these were the stale `/` placeholders). */
const MORE_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/how-it-works", label: "How it works" },
];
/**
 * REVERTED 2026-07-16 (Review-A MAJOR) — back to the Doc-7E auth entry, pending an owner ruling.
 *
 * This briefly pointed at `/for-vendors` on the reference's authority, reclassified in a comment as
 * "not a conversion CTA". That was wrong on process: **Doc-7D is FROZEN** and PR5 says conversion CTAs
 * route to the `(auth)` group; this file's own note (below) already classified "Sell on iVendorz" AS a
 * conversion CTA. Re-deciding that in a code comment is precisely what §11 requires Flag-and-Halt for,
 * and `visual_reference_implementation.md` §2 lists "Navigation shell" under MUST-NOT. Worse, this file
 * refuses the reference's `Sign in`→/for-vendors as loose prototype routing (see header) and then
 * adopted that same destination for a neighbouring label — one rule, applied to three CTAs, abandoned
 * for the fourth.
 *
 * `/for-vendors` may well be the better IA — that is for the owner to rule, not for this file to
 * assume. ESCALATED; restore only on an owner-attributed ruling recorded here.
 */
const SELL_ON_IVENDORZ_HREF = "/login";
/** Routes to the real `/contact` page ("Contact & support"). Labelled "Support" — see `SUPPORT_LABEL`. */
const HELP_CENTER_HREF = "/contact";
/**
 * "Support", not the reference's "Help Center": no help-centre surface exists in this codebase, and a
 * label must not promise one. The sibling footer, changed in the same commit, DROPPED "Help center" for
 * exactly this reason ("if a future label has no route, it does not go in this footer") — the same rule
 * has to reach the header. `/contact` titles itself "Contact & support", so this label describes what
 * the destination actually is. Copy is ours; a reference defines the visual design, not the words.
 */
const SUPPORT_LABEL = "Support";

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
                    <Link href={HELP_CENTER_HREF}>{SUPPORT_LABEL}</Link>
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

      {/* Row 2 — Categories · Suppliers · More · Sell on iVendorz · Support · Request for Quotation */}
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
              <Link href={HELP_CENTER_HREF}>{SUPPORT_LABEL}</Link>
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
