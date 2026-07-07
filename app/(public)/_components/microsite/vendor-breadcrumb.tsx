// Vendor microsite breadcrumb (M2.5). Vendors directory → this vendor → optional deeper trail. Non-
// disclosing: renders exactly the trail it is given (it never derives ancestry). Reuses the established
// public breadcrumb pattern (the one previously inlined on the vendor profile page). Presentation-only;
// RSC-friendly.
//
// The default (no `trail`, no `className`) render is BYTE-IDENTICAL to the original — the microsite chrome
// instance in `vendor-microsite-layout.tsx` is untouched. A deeper page (e.g. the Project Detail page,
// P-PUB-25) passes a `trail` to render `Vendors › {vendor} › Projects › {project}`; the layout cannot render
// that itself because a Next.js layout never receives the child segment's params. Callers pass a distinct
// `ariaLabel` so the two breadcrumb landmarks stay uniquely named on the same page.
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

/** A deeper breadcrumb crumb: linked when `href` is given, otherwise the current (non-linked) page. */
export interface VendorBreadcrumbCrumb {
  label: string;
  href?: string;
}

export interface VendorBreadcrumbProps {
  /** The vendor's display name. The current crumb when there is no `trail`; a linked crumb when there is. */
  name: string;
  /** Directory href (the parent crumb). Defaults to the public vendors directory. */
  vendorsHref?: string;
  /** Vendor microsite home href — makes the vendor name a link when a deeper `trail` follows it. */
  vendorHomeHref?: string;
  /** Deeper crumbs beyond the vendor (e.g. [{label:"Projects",href}, {label:project.name}]). */
  trail?: VendorBreadcrumbCrumb[];
  /** Landmark label — pass a distinct value when a second breadcrumb exists on the page. */
  ariaLabel?: string;
  className?: string;
}

export function VendorBreadcrumb({
  name,
  vendorsHref = "/vendors",
  vendorHomeHref,
  trail,
  ariaLabel = "Breadcrumb",
  className,
}: VendorBreadcrumbProps) {
  // Simple case (no trail) — byte-identical to the original chrome breadcrumb.
  if (!trail || trail.length === 0) {
    return (
      <nav
        aria-label={ariaLabel}
        className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}
      >
        <Link href={vendorsHref} className="rounded-sm hover:text-foreground">
          Vendors
        </Link>
        <ChevronRight aria-hidden="true" className="size-4" />
        <span aria-current="page" className="truncate text-foreground">
          {name}
        </span>
      </nav>
    );
  }

  // Deeper trail — the vendor name becomes a link back to its microsite home; the last crumb is current.
  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex flex-wrap items-center gap-1 text-sm text-muted-foreground", className)}
    >
      <Link href={vendorsHref} className="rounded-sm hover:text-foreground">
        Vendors
      </Link>
      <ChevronRight aria-hidden="true" className="size-4" />
      {vendorHomeHref ? (
        <Link href={vendorHomeHref} className="rounded-sm hover:text-foreground">
          {name}
        </Link>
      ) : (
        <span className="text-foreground">{name}</span>
      )}
      {trail.map((crumb, index) => {
        const isLast = index === trail.length - 1;
        return (
          <span key={crumb.label} className="flex items-center gap-1">
            <ChevronRight aria-hidden="true" className="size-4" />
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="rounded-sm hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined} className="truncate text-foreground">
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
