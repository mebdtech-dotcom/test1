import Link from "next/link";
import { ArrowRight, ShieldCheck, Layers, Lock, EyeOff } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { VendorVerifiedBadge } from "../_components/microsite/vendor-verified-badge";
import { Container } from "@/frontend/components/container";

// Public "Trust & verification" explainer route (`/trust`) — P-PUB-18 (Doc-7D Public surface · T-STATIC ·
// TB-NONE; screen_specifications §P-PUB-18, journey J-GST-04). A pure SERVER COMPONENT mounted in the
// Doc-7C `(public)` shell. ROUTING + COMPOSITION ONLY. Educational marketing about how trust works.
//
// FIELD DISCIPLINE — the load-bearing decision on this page:
//  • The ONLY trust signal ever shown on a public surface is the BINARY "Verified" badge (M5 public
//    projection). It is illustrative here and reuses the shipped `VendorVerifiedBadge`.
//  • The spec's Required set lists "score-ring (illustrative)". That self-classification is OVERRIDDEN
//    (Raise ≠ Accept; an independent review may override a document's self-classification): NO numeric
//    trust score, NO trust/performance band, NO financial tier is rendered or implied. Public score/band
//    display is DEFERRED behind [ESC-7G-SCORE-DISPLAY] (human Board) and is not part of the public read
//    (Doc-5G R10, Doc-7D §4, non-disclosure §7.5). Rendering an "illustrative" number here would set the
//    exact public precedent that ESC has withheld — so the page instead EXPLAINS why only a binary mark
//    is shown.
//  • Governance signals are FIREWALLED (Invariant #6 / CLAUDE.md §4): the page states signals are kept
//    independent and no single factor can be gamed, WITHOUT enumerating the private internals.
//  • Buyer Vendor Status is PRIVATE to a buyer (Invariant #11) and is NEVER named or surfaced here.
//  • Trust is M5-owned and DISPLAYED, never computed by this page. Binds no Doc-5 contract; fabricates no
//    data. CTA routes to discovery (/vendors). This page owns the single `<h1>`.
export const metadata = {
  title: "Trust & verification — iVendorz",
  description:
    "How trust works on iVendorz: verification is earned and shown on the platform, never self-set — a simple, honest Verified mark, not a public score or ranking.",
};

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Verification is earned",
    body: "The Verified mark reflects checks the platform performs on a supplier. It's earned and shown on the platform — never something a vendor can switch on for themselves.",
  },
  {
    icon: Layers,
    title: "Signals are kept separate",
    body: "iVendorz keeps its trust factors independent, so no single factor can inflate another and none can be gamed. What you see is a straightforward status, not a manufactured number.",
  },
  {
    icon: EyeOff,
    title: "No public score, no ranking",
    body: "We deliberately show trust as a simple Verified mark — not a public score, band, or leaderboard. Suppliers aren't ranked for you, and standing can't be bought.",
  },
  {
    icon: Lock,
    title: "Your private view stays private",
    body: "Anything you decide about a supplier for your own organization stays private to you — it never becomes a public signal, and it never affects anyone else's standing.",
  },
];

export default function TrustPage() {
  return (
    <>
      {/* Intro. */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-iv-brand-600">
            Trust &amp; verification
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-iv-ink-heading sm:text-5xl">
            Trust you can verify
          </h1>
          <p className="mx-auto mt-5 text-lg text-iv-ink-secondary">
            On iVendorz, trust is kept simple and honest: verification is earned and shown on the
            platform — not a score you have to decode, and not something a supplier sets themselves.
          </p>
        </div>
      </section>

      {/* The Verified mark. */}
      <section className="bg-muted/30">
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
          <Card className="flex flex-col items-center gap-4 p-8 text-center">
            <VendorVerifiedBadge verified />
            <h2 className="text-xl font-semibold text-foreground">What “Verified” means</h2>
            <p className="text-sm text-muted-foreground">
              A supplier either carries the Verified mark or they don’t — there’s no “pending” or
              “unverified” label to interpret. The mark is shown by the platform based on checks it
              performs; a supplier can never grant it to themselves. That’s the only trust signal we
              show publicly, on purpose.
            </p>
          </Card>
        </div>
      </section>

      {/* Principles. */}
      <section className="border-t border-border bg-background">
        <Container className="py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
              How we keep trust honest
            </h2>
            <p className="mt-3 text-iv-ink-secondary">
              A few rules keep trust meaningful — and keep it from being gamed.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
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
      <section className="border-t border-border bg-muted/30">
        <Container className="py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
            Find verified suppliers
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-iv-ink-secondary">
            Browse the directory and look for the Verified mark as you source.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/vendors">
                Browse the directory <ArrowRight aria-hidden="true" />
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
