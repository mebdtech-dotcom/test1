import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  Scale,
  FileCheck,
  Lock,
  ClipboardCheck,
} from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Container } from "@/frontend/components/container";

// Public "For Buyers" segment route (`/for-buyers`) — P-PUB-05 (Doc-7D Public surface · T-STATIC ·
// TB-NONE; screen_specifications §P-PUB-02..06, journey J-GST-01). A pure SERVER COMPONENT mounted in the
// Doc-7C `(public)` shell (layout.tsx adds header + footer). ROUTING + COMPOSITION ONLY.
//
// SCOPE: STATIC SEGMENT MARKETING — anonymous, SSG-friendly + SEO-indexable, binds NO Doc-5 contract and
// fabricates no data. Every value prop is a TRUE product commitment (CLAUDE.md §1/§4/§5), NOT invented:
// structured RFQs, verified suppliers (trust DISPLAYED not self-set — M5-owned), objective side-by-side
// comparison, an EXPLICIT + UNRANKED award (R6, Doc-3 §9.1 — iVendorz never picks a winner or ranks
// vendors), a PRIVATE buyer vendor CRM (Inv #11 — private exclusion stays private forever), and post-award
// document operations (M4). Matching is governed the same way for everyone — placement can't be bought
// (the moat, Doc-3 §11.8). No metrics/customers/funding invented. CTAs route to sign-up (/login, Doc-7D
// PR5) + discovery. This page owns the single `<h1>`.
export const metadata = {
  title: "For buyers — iVendorz",
  description:
    "For industrial buyers: post structured RFQs, reach verified suppliers, compare quotes objectively, and award on your terms — with a private vendor CRM that stays yours.",
};

const VALUE_PROPS = [
  {
    icon: FileText,
    title: "Structured RFQs",
    body: "Turn a requirement into a clear, structured request for quotation — specifications, quantities, and terms — instead of scattered emails and calls.",
  },
  {
    icon: ShieldCheck,
    title: "Verified suppliers",
    body: "Reach suppliers with verification you can see. Trust is shown on the platform, never something a vendor sets for themselves.",
  },
  {
    icon: Scale,
    title: "Compare objectively",
    body: "Quotations come back in a comparable form, so you review them side by side on the details that matter — not on who shouted loudest.",
  },
  {
    icon: FileCheck,
    title: "Award on your terms",
    body: "The award is your explicit decision. iVendorz never picks a winner for you and never ranks the vendors — and placement can't be bought.",
  },
  {
    icon: Lock,
    title: "A private vendor CRM",
    body: "Track the suppliers you work with in a CRM that's private to your organization. Your supplier decisions stay yours — always.",
  },
  {
    icon: ClipboardCheck,
    title: "Through to delivery",
    body: "After the award, the post-award document workflow keeps the order moving — from letter of intent to delivery.",
  },
];

export default function ForBuyersPage() {
  return (
    <>
      {/* Intro. */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-iv-brand-600">
            For buyers
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-iv-ink-heading sm:text-5xl">
            Source with confidence
          </h1>
          <p className="mx-auto mt-5 text-lg text-iv-ink-secondary">
            For the factories, plants, and EPC contractors that keep industry running — bring
            sourcing onto one governed workflow, from the first RFQ to a delivered order.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Get started <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/marketplace">Explore the marketplace</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value props. */}
      <section className="bg-muted/30">
        <Container className="py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
              Built for procurement teams
            </h2>
            <p className="mt-3 text-iv-ink-secondary">
              Everything you need to run sourcing with discipline — and keep control of the outcome.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="flex flex-col gap-3 p-6">
                <span className="flex size-10 items-center justify-center rounded-md bg-iv-brand-50 text-iv-brand-600">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing CTA. */}
      <section className="border-t border-border bg-background">
        <Container className="py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
            Ready to run your next RFQ?
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
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
