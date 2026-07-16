// SEC-PROCESS — How it works (landing_page_spec §8 · Doc-7D). STATIC marketing, PRESENTATION-ONLY.
// Describes the governed RFQ → match → compare → award flow. Copy stays faithful to EXPLICIT, unranked
// award (Content ≠ Presentation; R6) — it never implies the platform auto-picks or ranks a winner.
import { ClipboardList, Waypoints, Scale, Award, type LucideIcon } from "lucide-react";
import { Container } from "@/frontend/components/container";
import { Card } from "@/frontend/primitives/card";

interface Step {
  n: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

const STEPS: readonly Step[] = [
  {
    n: "01",
    icon: ClipboardList,
    title: "Post an RFQ",
    desc: "Describe what you need — quantity, specification, budget. Takes under two minutes.",
  },
  {
    n: "02",
    icon: Waypoints,
    title: "Get matched",
    desc: "Your request is routed to verified vendors that specialise in your category.",
  },
  {
    n: "03",
    icon: Scale,
    title: "Compare quotes",
    desc: "Line up bids side by side with trust badges, lead times, and vendor capabilities.",
  },
  {
    n: "04",
    icon: Award,
    title: "Award & track",
    desc: "Award your chosen vendor, then track delivery and documents in-platform.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="border-b border-border py-9 sm:py-12"
    >
      <Container>
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-iv-ink-heading-strong">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight text-iv-ink-heading"
          >
            From request to awarded contract in four steps
          </h2>
          <p className="mt-3 text-iv-ink-secondary">
            Post once and let verified vendors compete — no cold-calling, no spreadsheets.
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.n}>
                <Card className="h-full p-6">
                  <span className="flex size-9 items-center justify-center rounded-md bg-iv-navy-50 font-mono text-sm font-semibold text-iv-navy-700">
                    {s.n}
                  </span>
                  <Icon aria-hidden="true" className="mt-4 size-6 text-iv-navy-500" />
                  <h3 className="mt-3 font-semibold text-iv-ink-heading">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-iv-ink-secondary">{s.desc}</p>
                </Card>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
