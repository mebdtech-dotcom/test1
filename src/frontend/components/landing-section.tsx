// LandingSection (Doc-7B kit, App tier; promoted from the Public surface after M2.2). PRESENTATION-ONLY
// section shell: a consistent header (title + optional description + a generic `action` slot) and a
// content slot. ONE canonical implementation. A11y: each section is an `aria-labelledby` region keyed to
// its <h2>. Width caps at --iv-content-max.
//
// EXTENSION CONTRACT: `action` = a generic header-right slot (a "view all" link, a filter, a ribbon…);
// `viewAllHref` is a convenience for the common case. Content STATES (loading/empty/pagination) are owned
// by the content / the ResultsGrid, NOT by this chrome.
//
// 2026-07-16 — ADDITIVE: optional `eyebrow`. The "iVendorz Public Pages" reference composes every
// section head as eyebrow → h2 → description; this carries that first line. Purely additive and
// optional: omitted ⇒ the header renders exactly as before, so every existing caller is byte-identical.
// It is a presentation LABEL only and never a figure or a claim. Added here rather than re-implementing
// a section header per surface (duplicating a kit primitive is a Review-A finding).
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "../primitives/button";
import { Container } from "./container";

export interface LandingSectionProps {
  /** Section element id (also seeds the heading id) — e.g. "sec-suppliers". */
  id: string;
  /** Optional small label above the title (the reference's `.eyebrow`). A label, never a figure. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Generic header-right slot. When provided it REPLACES the `viewAll` convenience button. */
  action?: ReactNode;
  /** Convenience: a "view all" link in the header. Ignored when `action` is provided. */
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
}

export function LandingSection({
  id,
  eyebrow,
  title,
  description,
  action,
  viewAllHref,
  viewAllLabel = "View all",
  children,
}: LandingSectionProps) {
  const headingId = `${id}-heading`;
  const headerAction =
    action ??
    (viewAllHref ? (
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link href={viewAllHref}>
          {viewAllLabel}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </Button>
    ) : null);

  return (
    <section id={id} aria-labelledby={headingId} className="border-b border-border py-9 sm:py-12">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-2xl">
            {/* Eyebrow styling matches the landing's INCUMBENT idiom (`landing/how-it-works.tsx`,
                `landing/faq.tsx`, which already carry the reference's eyebrows) — the same font-mono
                / text-xs / tracking-wider / ink-heading-strong recipe, so a page composing both kinds
                of section head shows ONE eyebrow style, not two. */}
            {eyebrow ? (
              <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-iv-ink-heading-strong">
                {eyebrow}
              </p>
            ) : null}
            <h2 id={headingId} className="text-2xl font-bold tracking-tight text-iv-ink-heading">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-iv-ink-secondary">{description}</p>
            ) : null}
          </div>
          {headerAction}
        </div>
        {children}
      </Container>
    </section>
  );
}
