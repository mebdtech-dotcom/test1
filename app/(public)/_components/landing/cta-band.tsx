// SEC-CTA — Final conversion band (landing_page_spec §13 · Doc-7D). STATIC. CTAs ROUTE (no anonymous
// mutation): "Post an RFQ" → `(auth)` (Doc-7E); "Talk to us" → the public contact page (P-PUB-24). No
// anonymous lead-capture POST. Navy brand band; amber stays reserved (not used decoratively here).
//
// 2026-07-16 — the "iVendorz Public Pages" reference composes this band as two columns with a
// decorative image beside the copy ("Drop an image (factory / team / product)"). This band stays
// CENTERED, deliberately. The owner's media ruling allows a decorative slot to reuse an existing
// approved project visual "where appropriate" — but the repo's only photograph (`hero-bg.jpg`)
// already opens THIS SAME PAGE as the hero, so repeating it two screens down would read as a
// duplication artifact rather than a design, and there is no second approved visual to use. A stock
// or AI image is out (the same ruling), and an empty media frame in a conversion band would be worse
// than none. Revisit when a second real project visual exists.
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Container } from "@/frontend/components/container";

export function CtaBand() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--iv-navy-800),var(--iv-navy-950))] px-8 py-10 text-center sm:px-12 sm:py-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to source smarter?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            Post your first RFQ in under two minutes and get competing quotes from verified
            suppliers.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/login">
                <Plus aria-hidden="true" />
                Post an RFQ
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            >
              <Link href="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
