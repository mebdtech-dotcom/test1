// ProjectDetailHeader (FE-PUB-11 · P-PUB-25) — the project-context bar: back-to-projects, the vendor's
// identity mark (initials fallback only — no fabricated logo, R4), the project title, its category label
// (rendered navy, never gold — gold stays reserved for premium/verified/featured), a Share control, and the
// Request Quote CTA. Presentation-only; reuses the kit; renders a client Share leaf. RSC-friendly.
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Avatar, AvatarFallback } from "@/frontend/primitives/avatar";
import { vendorInitials } from "@/frontend/components/vendor-card";
import { ProjectShareButton } from "./project-share-button";

export interface ProjectDetailHeaderProps {
  title: string;
  /** Project category/industry label (navy, never gold). Hidden when absent. */
  categoryLabel?: string;
  /** Vendor display name — drives the identity-initials mark. */
  vendorName: string;
  /** Back destination (the vendor's projects list). */
  backHref: string;
  /** Request-quote destination. */
  quoteHref: string;
  /** Canonical project URL for the Share control. */
  shareUrl: string;
}

export function ProjectDetailHeader({
  title,
  categoryLabel,
  vendorName,
  backHref,
  quoteHref,
  shareUrl,
}: ProjectDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button asChild variant="outline" size="icon" aria-label="Back to projects">
          <Link href={backHref}>
            <ArrowLeft aria-hidden="true" />
          </Link>
        </Button>
        {/* Identity fallback only — no fabricated logo image (R4). */}
        <Avatar className="size-10 rounded-md">
          <AvatarFallback className="rounded-md text-2xs">
            {vendorInitials(vendorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-iv-ink-heading">
            {title}
          </h1>
          {categoryLabel ? (
            // Category label — navy, NOT gold (gold stays reserved for premium/verified/featured).
            <p className="text-xs font-semibold uppercase tracking-wide text-iv-navy-700">
              {categoryLabel}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ProjectShareButton url={shareUrl} title={title} />
        <Button asChild>
          <Link href={quoteHref}>Request Quote</Link>
        </Button>
      </div>
    </div>
  );
}
