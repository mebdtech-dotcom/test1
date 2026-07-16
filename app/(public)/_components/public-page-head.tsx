// Public page head — the shared navy band that opens every inner `(public)` page.
//
// ── 2026-07-16 · PORTED FROM THE "iVendorz Public Pages" REFERENCE ────────────────────────────────
// (design project `14497856-6435-433d-b191-2a32431d642b`, `iVendorz Public Pages.dc.html` → its
// `.pghead` block). The reference uses this one band on 15 of its 20 screens, so it ships as ONE
// component rather than being re-inlined per page — a per-page copy would be a duplication finding,
// and the 15 heads would drift apart on the first edit.
//
// Anatomy, exactly as the reference composes it (top → bottom):
//   breadcrumb (mono, small)  →  eyebrow  →  h1  →  lead paragraph
//
// Static presentation only: a Server Component, no hooks, no fetch, no data (Content ≠ Presentation,
// Inv #9). It renders exactly the crumbs it is GIVEN and never derives ancestry — same non-disclosing
// posture as `microsite/vendor-breadcrumb.tsx`.
//
// ── IMPLEMENTATION NOTES (why this is not a copy of the reference's CSS) ──────────────────────────
//  • GRADIENT. The reference hardcodes `linear-gradient(120deg,#0f1e3f,#23438f)`. Those are not
//    arbitrary: `#23438f` IS `--iv-brand-600` (our `--primary`), and `#0f1e3f` sits on `--iv-brand-900`
//    (#101f40). So the band is expressed with the real ramp — `from-iv-brand-900 to-iv-brand-600` —
//    and no hex is hand-picked. Tailwind's `to-br` is 135° vs the reference's 120°; the ratified
//    utility wins over a bespoke angle (`visual_reference_implementation.md` §3 — where a token and
//    the reference differ, the token wins and the divergence is correct).
//  • TYPE SIZE. The reference's h1 is 44px, which is NOT a step on the ratified scale (`text-4xl` =
//    36px, `text-5xl` = 48px). Typography values never come from a reference — a reference may only
//    inform WHICH ratified step an element uses (§2, BX-06 carve-out). This takes the nearest step
//    responsively: `text-4xl sm:text-5xl`. Never `text-[44px]`.
//  • ON-NAVY TEXT. The reference's `#9fb4dd`/`#a9c3ff`/`#c7d3e6` are hand-mixed light-on-navy inks.
//    This uses the established repo idiom for text on a navy band (`text-white/70` etc.) rather than
//    minting three new one-off ink tokens for a single surface.
//  • BREADCRUMB. Not `VendorBreadcrumb` (microsite-scoped: it is rooted at "Vendors", requires a
//    vendor `name`, and is styled for a light surface) and not the shell `Breadcrumbs` (an `(app)`
//    internal — the public group never imports workspace code). The crumb here is a generic
//    `Home › …` trail styled for this band; the two stay separate on purpose.
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/frontend/components/container";
import { cn } from "@/frontend/lib/cn";

/**
 * Focus-ring override for any interactive element a caller places INSIDE this band (`children`).
 *
 * WHY IT EXISTS (Review-A/B finding, 2026-07-16). The kit `Button` focuses with
 * `ring-ring` + `ring-offset-background` — correct on a light page, wrong here: `--ring` is
 * `--iv-brand-500` (#2f5eb8) and this band ends at `--iv-brand-600` (#23438f), so the ring measures
 * ~1.5:1 against it, below the 3:1 WCAG 2.1 SC 1.4.11 requires of a focus indicator. Focus stayed
 * *perceivable* only because the near-white `ring-offset-background` halo happened to show — i.e. the
 * page background leaking onto a dark band, which is an accident, not a design.
 *
 * This band is navy in EVERY theme, so it opts out of the theme-following ring the same way the
 * on-navy button colours already opt out of the semantic variants. White ring, navy offset.
 * The head's own crumb links carry the same treatment inline (measured 6.3:1).
 */
export const ON_NAVY_FOCUS =
  "focus-visible:ring-white/70 focus-visible:ring-offset-iv-brand-800" as const;

/** One crumb. Linked when `href` is given; the final crumb is the current page and is never linked. */
export interface PublicCrumb {
  label: string;
  href?: string;
}

export interface PublicPageHeadProps {
  /** Small label above the title (the reference's `.eyebrow`). */
  eyebrow?: string;
  /** The page's single `<h1>`. */
  title: string;
  /** Lead paragraph under the title. */
  description?: ReactNode;
  /**
   * Trail AFTER "Home" — e.g. `[{ label: "About" }]` renders `Home › About`. Rendered verbatim;
   * ancestry is never derived. The last crumb is marked `aria-current="page"`.
   */
  crumbs: PublicCrumb[];
  /** Extra content under the lead paragraph (e.g. a CTA pair). Presentation only. */
  children?: ReactNode;
  className?: string;
}

export function PublicPageHead({
  eyebrow,
  title,
  description,
  crumbs,
  children,
  className,
}: PublicPageHeadProps) {
  return (
    <section
      className={cn(
        "border-b border-border bg-gradient-to-br from-iv-brand-900 to-iv-brand-600",
        className,
      )}
    >
      <Container className="py-12 sm:pb-14 sm:pt-16">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5">
          <Link
            href="/"
            className="rounded-sm font-mono text-xs uppercase tracking-wider text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Home
          </Link>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              // Keyed by index, not by `label`: a crumb label is display text, and a trail may legally
              // repeat one (a category named like its ancestor). No collision is reachable in today's
              // taxonomy — all 794 nodes checked, 0 duplicate trails — but the list is static and
              // never reordered, so the index is both safe and collision-proof.
              <span key={index} className="flex items-center gap-1.5">
                <ChevronRight aria-hidden className="size-3 shrink-0 text-white/40" />
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="rounded-sm font-mono text-xs uppercase tracking-wider text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className="font-mono text-xs uppercase tracking-wider text-white/85"
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>

        {eyebrow ? (
          <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-widest text-iv-brand-200">
            {eyebrow}
          </p>
        ) : null}

        {/* `max-w-[20ch]`-equivalent: the reference caps the h1 at ~20ch and the lead at ~60ch so
            neither runs the full band width. `max-w-*ch` is a content-measure, not a design token —
            it is the same reading-measure device the ratified prose widths already use. */}
        <h1 className="mt-3 max-w-[20ch] text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          {title}
        </h1>

        {description ? (
          <div className="mt-4 max-w-[60ch] text-base text-white/80 sm:text-lg">{description}</div>
        ) : null}

        {children ? <div className="mt-6">{children}</div> : null}
      </Container>
    </section>
  );
}
