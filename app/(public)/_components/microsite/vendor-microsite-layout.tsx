// VendorMicrositeLayout (M2.5 · refactored M2.7 for ADR-022 / Doc-7D §10.3 · sticky mobile CTA
// FE-PUB-03) — the shared per-vendor CHROME SHELL for the multi-page microsite. It is now rendered by
// the route-group layout (`vendors/[slug]/layout.tsx`) and wraps ALL seven pages: breadcrumb → brand
// header → sticky ROUTE nav → {active page} → closing CTA band → (mobile-only) fixed enquire bar. It
// mounts INSIDE the (public) shell (which already supplies SiteHeader + SiteFooter, Doc-7C).
// Presentation only — no chrome replacement, no page-data fetching here (the layout resolves `profile`
// for chrome only; each page resolves its own data — Doc-7D §10.4). Reuses the kit + sibling microsite
// components; imports nothing from the Vendor workspace. RSC-friendly (the only client piece is the
// nav's mobile drawer + active state). The fixed CTA bar reuses `--iv-z-sticky` (same tier as the route
// nav) — no new z-index token.
import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Container } from "@/frontend/components/container";
import { VendorBreadcrumb } from "./vendor-breadcrumb";
import { VendorMicrositeHeader } from "./vendor-microsite-header";
import { VendorMicrositeNavigation } from "./vendor-microsite-navigation";
import { VendorMicrositeFooter } from "./vendor-microsite-footer";
import type { PublicVendorProfileVM } from "../discovery/seed";

export interface VendorMicrositeLayoutProps {
  profile: PublicVendorProfileVM;
  /** Anonymous-intent destination — routes to `(auth)`, never mutates. */
  authHref: string;
  /** The composed page sections (Hero + VendorSection blocks). */
  children: ReactNode;
}

export function VendorMicrositeLayout({ profile, authHref, children }: VendorMicrositeLayoutProps) {
  return (
    <Container className="py-8 pb-24 sm:pb-8">
      <VendorBreadcrumb name={profile.name} />
      <div className="mt-4">
        <VendorMicrositeHeader profile={profile} authHref={authHref} />
      </div>
      <VendorMicrositeNavigation slug={profile.slug} />
      <div className="mt-8 flex flex-col gap-12">{children}</div>
      <div className="mt-12">
        <VendorMicrositeFooter profile={profile} authHref={authHref} />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-[var(--iv-z-sticky)] border-t border-border bg-background/95 p-3 backdrop-blur sm:hidden">
        <Button asChild className="w-full">
          <Link href={authHref}>Request quote</Link>
        </Button>
      </div>
    </Container>
  );
}
