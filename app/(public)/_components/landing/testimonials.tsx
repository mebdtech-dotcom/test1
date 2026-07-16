// SEC-SUCCESS — Testimonials (landing_page_spec §10 · Doc-7D). SHELL ONLY — deliberately NOT composed
// into the page. The mockup's quotes are fabricated (named people at named companies); the spec requires
// CURATED, PERMISSIONED testimonials, and we have none yet — so rendering any would be fabricated social
// proof (GI-03), the same reason this section is deferred. `TESTIMONIALS` is intentionally empty and the
// component renders nothing until real, permissioned quotes are supplied. Kept here, wired-ready, so the
// layout exists the moment content lands.
import { Container } from "@/frontend/components/container";
import { Card } from "@/frontend/primitives/card";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

// No fabricated content — populate ONLY with real, permissioned quotes before composing into page.tsx.
const TESTIMONIALS: readonly Testimonial[] = [];

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="border-b border-border py-14 sm:py-20"
    >
      <Container>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-iv-ink-heading-strong">
            What buyers say
          </p>
          <h2
            id="testimonials-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight text-iv-ink-heading"
          >
            Procurement teams source faster with iVendorz
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="flex h-full flex-col p-6">
              <blockquote className="flex-1 text-[15px] leading-relaxed text-iv-ink-heading">
                “{t.quote}”
              </blockquote>
              <div className="mt-5">
                <p className="font-semibold text-iv-ink-heading">{t.name}</p>
                <p className="text-sm text-iv-ink-muted">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
