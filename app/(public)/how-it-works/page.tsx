import Link from "next/link";
import { ArrowRight, ClipboardList, Route, FileSpreadsheet, FileCheck, Truck } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Container } from "@/frontend/components/container";

// Public "How it works" route (`/how-it-works`) — P-PUB-03 (Doc-7D Public surface · T-STATIC · TB-NONE;
// screen_specifications §P-PUB-02..06, journey J-GST-01; realizes landing_page_spec SEC-PROCESS §8). A
// pure SERVER COMPONENT mounted in the Doc-7C `(public)` shell (layout.tsx adds header + footer).
//
// SCOPE: STATIC MARKETING — anonymous, SSG-friendly + SEO-indexable, binds NO Doc-5 contract and
// fabricates no data. It DESCRIBES the governed RFQ → route → compare → award → deliver flow (SEC-PROCESS
// §8). CONTENT ≠ PRESENTATION / R6: the copy must NOT imply the platform auto-recommends a winner or ranks
// vendors — the award is EXPLICIT and UNRANKED (Doc-3 §9.1). It references the lifecycle conceptually only
// and coins/restates NO Doc-4M state (Doc-4M is authoritative). Rendered as an ordered-list stepper: step
// numbers are TEXT (not colour-only), icons are decorative (aria-hidden), horizontal on desktop collapsing
// to vertical on mobile (GI-07). Conversion CTAs route to sign-up (/login, Doc-7D PR5) + discovery. This
// page owns the single `<h1>`.
export const metadata = {
  title: "How it works — iVendorz",
  description:
    "How procurement works on iVendorz: post an RFQ, route it to matching suppliers, compare quotes, award explicitly, and track delivery — one governed workflow.",
};

const STEPS = [
  {
    icon: ClipboardList,
    title: "Post your RFQ",
    body: "Describe what you need — specifications, quantities, and terms — in a structured request for quotation.",
  },
  {
    icon: Route,
    title: "Smart routing",
    body: "A governed engine routes your RFQ to relevant, matching suppliers. The same rules apply to everyone — placement can't be bought.",
  },
  {
    icon: FileSpreadsheet,
    title: "Compare quotes",
    body: "Quotations come back in a comparable form so you can review them side by side, on the details that matter to you.",
  },
  {
    icon: FileCheck,
    title: "Award — your decision",
    body: "You award the RFQ explicitly. iVendorz never picks a winner for you and never ranks the vendors — the choice is yours.",
  },
  {
    icon: Truck,
    title: "Deliver & close out",
    body: "After the award, the post-award document workflow keeps the order moving through to delivery.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Intro. */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-iv-ink-heading sm:text-5xl">
            How procurement works on iVendorz
          </h1>
          <p className="mx-auto mt-5 text-lg text-iv-ink-secondary">
            One governed workflow, from the first request to a delivered order — designed so every
            award is explicit and every supplier is treated by the same rules.
          </p>
        </div>
      </section>

      {/* Governed flow — ordered-list stepper. */}
      <section className="bg-muted/30">
        <Container className="py-16">
          <ol className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li
                key={title}
                className="flex flex-col items-start gap-3 md:items-center md:text-center"
              >
                <div className="flex items-center gap-3 md:flex-col md:gap-2">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-iv-brand-50 text-iv-brand-600">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">Step {i + 1}</span>
                </div>
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>

          <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted-foreground">
            Matching and routing are governed the same way for everyone — a subscription never buys
            a better position, and iVendorz never ranks vendors or recommends a winner. The award is
            always your explicit decision.
          </p>
        </Container>
      </section>

      {/* Closing CTA. */}
      <section className="border-t border-border bg-background">
        <Container className="py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
            Start your first RFQ
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-iv-ink-secondary">
            Create an account to post a request and invite verified suppliers.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Get started <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/marketplace">Explore the marketplace</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
