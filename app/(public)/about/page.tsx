import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  FileText,
  ClipboardCheck,
  Users,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Container } from "@/frontend/components/container";

// Public About route (`/about`) — P-PUB-02 (Doc-7D Public surface · T-STATIC · TB-NONE;
// screen_specifications §P-PUB-02, journey J-GST-01). A pure SERVER COMPONENT mounted in the Doc-7C
// `(public)` shell (layout.tsx adds header + footer). ROUTING + COMPOSITION ONLY.
//
// SCOPE: STATIC MARKETING — anonymous, SSG-friendly + SEO-indexable, binds NO Doc-5 contract and
// fabricates no data. Copy is grounded ONLY in the product definition (CLAUDE.md §1 / Master Overview):
// no invented metrics, customer counts, funding, team, or dates. Section blocks + cards + CTA per the
// spec's Required set; conversion CTAs route anonymously to sign-up (/login, Doc-7D PR5) and discovery.
// Reading blocks use a reading-width utility because `--iv-reading-max` is not yet defined in tokens
// (globals.css defines `--iv-content-max` only) — flagged to the token owner (RV-0030 pattern). This
// page owns the single `<h1>`.
export const metadata = {
  title: "About iVendorz — Industrial Procurement OS for Bangladesh",
  description:
    "iVendorz is the industrial procurement operating system for Bangladesh — connecting factories, plants, and EPC contractors with verified suppliers, from RFQ to award to delivery.",
};

// The four product surfaces, stated verbatim from the product definition (CLAUDE.md §1 blend).
const WHAT_WE_DO = [
  {
    icon: Boxes,
    title: "B2B marketplace",
    body: "A discovery surface where industrial buyers find verified suppliers across a deep category taxonomy — capabilities, products, and projects, presented honestly.",
  },
  {
    icon: FileText,
    title: "Structured RFQ procurement",
    body: "A governed RFQ → quote → award workflow. Requirements go out, comparable quotations come back, and awards are made on a clear, auditable trail.",
  },
  {
    icon: ClipboardCheck,
    title: "Post-award operations",
    body: "Lightweight operations after the award — the document workflow (LOI, PO, challan, invoice, WCC) that keeps a purchase moving to delivery.",
  },
  {
    icon: Users,
    title: "Vendor network & CRM",
    body: "A private vendor CRM for each buyer to track the suppliers they work with — their own view, kept private to their organization.",
  },
];

// Principles — each is a TRUE architectural commitment (CLAUDE.md §1/§4/§5), not marketing invention.
const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "A governed matching engine",
    body: "Sourcing runs on a governed routing and matching engine — not pay-to-win placement. A subscription never buys a better position in an RFQ; matching is decided the same way for everyone.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "The organization is the boundary. Business records are private to the organization that owns them, and a buyer's private supplier decisions stay private — forever.",
  },
  {
    icon: FileText,
    title: "We never touch your transaction money",
    body: "iVendorz carries no escrow, wallet, or settlement between buyers and vendors. Payments happen off-platform; we record them, we never move them.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Intro. */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-iv-ink-heading sm:text-5xl">
            The procurement backbone of industrial Bangladesh
          </h1>
          <p className="mx-auto mt-5 text-lg text-iv-ink-secondary">
            iVendorz is a procurement operating system for the factories, plants, and EPC
            contractors that keep industry running — and for the suppliers who serve them. We bring
            sourcing, quoting, and awarding onto one governed, verifiable workflow.
          </p>
        </div>
      </section>

      {/* What we do. */}
      <section className="bg-muted/30">
        <Container className="py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
              What iVendorz is
            </h2>
            <p className="mt-3 text-iv-ink-secondary">
              One platform across the whole procurement journey — from finding a supplier to closing
              out a delivered order.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {WHAT_WE_DO.map(({ icon: Icon, title, body }) => (
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

      {/* How we're different. */}
      <section className="border-t border-border bg-background">
        <Container className="py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
              What we stand on
            </h2>
            <p className="mt-3 text-iv-ink-secondary">
              A few commitments are wired into how the platform works — not slogans, but rules the
              system enforces.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-iv-brand-50 text-iv-brand-600">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing CTA. */}
      <section className="border-t border-border bg-muted/30">
        <Container className="py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
            Built for Bangladeshi industry
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-iv-ink-secondary">
            Join the buyers and suppliers sourcing with confidence on iVendorz.
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
