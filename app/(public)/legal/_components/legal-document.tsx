import { Info } from "lucide-react";
import { Separator } from "@/frontend/primitives/separator";

// Reusable legal-document scaffold for the public Legal pages (P-PUB-21 Terms / P-PUB-22 Privacy;
// Doc-7D Public surface · T-STATIC). PURE SERVER COMPONENT, presentation-only. It renders a long-form
// reading layout: a prominent placeholder notice, an in-page anchor nav, and the sectioned document body
// with separators + document landmarks (heading outline, `id` anchors).
//
// FIELD DISCIPLINE: this is a SCAFFOLD, not legal content. Callers pass honest placeholder section text —
// no binding terms, clauses, governing law, entity details, or real dates are coined. `lastUpdated` is a
// placeholder token string (e.g. "Pending"), never a fabricated date. Reading width uses a utility because
// `--iv-reading-max` is not yet defined in tokens (globals.css defines `--iv-content-max` only) — flagged
// to the token owner (RV-0030 pattern). The page owns the single `<h1>`.

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

export function LegalDocument({
  title,
  intro,
  lastUpdated,
  sections,
}: {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <section className="bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-iv-ink-heading sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          <p className="mt-5 text-base text-iv-ink-secondary">{intro}</p>
        </header>

        {/* Placeholder notice — this content is not yet legally binding. */}
        <div
          role="note"
          className="mt-6 flex items-start gap-2 rounded-md border border-iv-amber-100 bg-iv-amber-50 px-4 py-3 text-sm text-iv-amber-700"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            This document is a placeholder. Its wording is pending Legal review and is not yet
            binding — it is shown to preview the structure only.
          </p>
        </div>

        {/* In-page anchor navigation. */}
        <nav aria-label="On this page" className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            On this page
          </h2>
          <ol className="mt-3 space-y-1.5">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-iv-brand-600 underline-offset-2 hover:underline"
                >
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Separator className="my-8" />

        {/* Document body. */}
        <div className="space-y-10">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-heading`}
              className="scroll-mt-20"
            >
              <h2 id={`${s.id}-heading`} className="text-xl font-semibold text-iv-ink-heading">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
