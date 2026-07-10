import Link from "next/link";
import { ArrowRight, Search, Inbox, Grid3x3, Store, BadgeCheck, FileText } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Container } from "@/frontend/components/container";

// Public "For Vendors" segment route (`/for-vendors`) — P-PUB-06 (Doc-7D Public surface · T-STATIC ·
// TB-NONE; screen_specifications §P-PUB-02..06, journey J-GST-01). A pure SERVER COMPONENT mounted in the
// Doc-7C `(public)` shell (layout.tsx adds header + footer). ROUTING + COMPOSITION ONLY.
//
// SCOPE: STATIC SEGMENT MARKETING — anonymous, SSG-friendly + SEO-indexable, binds NO Doc-5 contract and
// fabricates no data. Every value prop is a TRUE product commitment (CLAUDE.md §1/§4/§5), NOT invented:
//  • Get discovered via a public microsite + directory (M2).
//  • Receive RFQ invitations and leads — work comes TO the vendor (M3 invitations / M7 lead credits).
//  • Capability is a MATRIX of four flags — can_supply / can_service / can_fabricate / can_consult
//    (Invariant #1) — presented as a matrix, never a single label.
//  • Trust/verification is DISPLAYED, never self-set (M5-owned) — NO score/band/number is shown or
//    implied (firewall + non-disclosure §7.5).
//  • Respond with quotations.
// It must NOT imply a vendor can BUY ranking or placement — matching is governed the same way for everyone
// (the moat, Doc-3 §11.8) — and it must NOT expose any buyer-private CRM / blacklist status (Invariant #11,
// non-disclosure §7.5). No metrics/customers/funding invented. CTAs route to sign-up (/login, Doc-7D PR5)
// + discovery. This page owns the single `<h1>`.
export const metadata = {
  title: "For vendors — iVendorz",
  description:
    "For suppliers: get discovered by industrial buyers, receive RFQ invitations and leads, show your capabilities, and respond with quotations — on the merits.",
};

const VALUE_PROPS = [
  {
    icon: Search,
    title: "Get discovered",
    body: "Be found by industrial buyers searching the marketplace and category taxonomy for what you supply, service, fabricate, or consult on.",
  },
  {
    icon: Inbox,
    title: "RFQs come to you",
    body: "Receive RFQ invitations and leads for work that matches you — the request comes to your inbox, and you choose which to pursue.",
  },
  {
    icon: Grid3x3,
    title: "Show your full capability",
    body: "Your capability is a matrix, not a label — supply, service, fabricate, and consult are four separate flags, so buyers see exactly what you do.",
  },
  {
    icon: Store,
    title: "Your public microsite",
    body: "Present your company, products, and projects on a public microsite that works as your storefront on the platform.",
  },
  {
    icon: BadgeCheck,
    title: "Verification you earn",
    body: "Verification is shown on the platform based on what you've proven — it's earned and displayed, never something set by hand.",
  },
  {
    icon: FileText,
    title: "Quote and win on merit",
    body: "Respond to RFQs with structured quotations. Buyers award explicitly — placement can't be bought, so work is won on the merits.",
  },
];

export default function ForVendorsPage() {
  return (
    <>
      {/* Intro. */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-iv-brand-600">
            For vendors
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-iv-ink-heading sm:text-5xl">
            Get found. Win real work.
          </h1>
          <p className="mx-auto mt-5 text-lg text-iv-ink-secondary">
            Put your capabilities in front of industrial buyers across Bangladesh — and let
            qualified RFQs come to you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Get started <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/vendors">Browse the directory</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value props. */}
      <section className="bg-muted/30">
        <Container className="py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
              Built for suppliers
            </h2>
            <p className="mt-3 text-iv-ink-secondary">
              Everything you need to be discovered and win work — on a level field.
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
            Ready to be found?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-iv-ink-secondary">
            Create an account to build your microsite and start receiving RFQs.
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
