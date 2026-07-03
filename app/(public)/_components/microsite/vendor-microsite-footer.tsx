// VendorMicrositeFooter (M2.5, section links repointed to real routes FE-PUB-03) — the vendor's closing
// CALL-TO-ACTION band at the end of the microsite content. It is a CONTENT band (vendor-branded
// presentation, Doc-7D §4), NOT a chrome replacement: the platform public footer (SiteFooter) still
// renders below it from the (public) shell. Kept deliberately light to avoid duplicating the platform
// footer — a closing prompt + the two anonymous intents (→ auth) + section links. Reuses the kit; no
// Vendor-workspace imports. Presentation-only; RSC-friendly.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Card } from "@/frontend/primitives/card";
import type { PublicVendorProfileVM } from "../discovery/seed";
import { vendorHref } from "../vendor-url";

export interface VendorMicrositeFooterProps {
  profile: PublicVendorProfileVM;
  /** Anonymous-intent destination — routes to `(auth)`, never mutates. */
  authHref: string;
}

export function VendorMicrositeFooter({ profile, authHref }: VendorMicrositeFooterProps) {
  const sectionLinks = [
    { href: vendorHref(profile.slug, "about"), label: "About" },
    { href: vendorHref(profile.slug, "products"), label: "Products" },
    { href: vendorHref(profile.slug, "projects"), label: "Projects" },
    { href: vendorHref(profile.slug, "contact"), label: "Contact" },
  ];

  return (
    <Card className="flex flex-col gap-4 bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-base font-semibold text-iv-ink-heading">Work with {profile.name}</p>
        <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-1" aria-label="Vendor sections">
          {sectionLinks.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button asChild>
          <Link href={authHref}>Request quote</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={authHref}>Contact</Link>
        </Button>
      </div>
    </Card>
  );
}
