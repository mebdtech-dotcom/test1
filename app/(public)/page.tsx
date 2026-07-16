import { Hero } from "./_components/landing/hero";
import { LogoMarquee } from "./_components/landing/logo-marquee";
import { CommandCenter } from "./_components/landing/command-center";
import { PopularProducts } from "./_components/landing/popular-products";
import { FeaturedCategories } from "./_components/landing/featured-categories";
import { HowItWorks } from "./_components/landing/how-it-works";
import { SupplierShowcase } from "./_components/landing/supplier-showcase";
import { Faq } from "./_components/landing/faq";
import { CtaBand } from "./_components/landing/cta-band";
import { Container } from "@/frontend/components/container";

// Public landing route (`/`) — P-PUB-01, the anonymous Public surface (Doc-7D · landing_page_spec.md),
// mounted in the Doc-7C `(public)` shell (layout.tsx adds the header + footer chrome).
//
// SCOPE (parallel-implementation authorization): PRESENTATION & COMPOSITION ONLY — anonymous,
// read-only, binds NO Doc-5 contract and fabricates no data; all backend wiring is left for later.
//
// 2026-07-12 redesign (iVendorz Kit landing mockup). Section order:
//   Hero (dark photo band + demo-preview RFQ ticker) → LogoMarquee (honest sector strip) →
//   CommandCenter (search/intents band, moved out of the hero) → PopularProducts → FeaturedCategories
//   ("Sourcing categories") → SupplierShowcase ("Featured Vendors"). How-it-works · FAQ · CTA band ·
//   testimonials-shell follow in the next slice (all static). Section data remains a CURATED STATIC
//   SEED per the registered interim ESCs (CATNAV / PRODDETAIL) — no fabrication (GI-03/GI-12).
export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoMarquee />

      {/* Command Center — the search + procurement-intents block. Relocated from the hero (the hero
          now hosts the RFQ ticker); framed as its own band just above the discovery sections. */}
      <section className="border-b border-iv-light-border bg-iv-light-base py-9 sm:py-12">
        <Container>
          <div className="mx-auto mb-6 max-w-2xl text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-iv-ink-heading-strong">
              Start here
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-iv-ink-heading">
              Search the industrial marketplace
            </h2>
            <p className="mt-2 text-iv-ink-secondary">
              Find products, suppliers, and categories — or jump straight into an RFQ.
            </p>
          </div>
          <CommandCenter />
        </Container>
      </section>

      <PopularProducts />
      <FeaturedCategories />
      <HowItWorks />
      <SupplierShowcase />
      <Faq />
      <CtaBand />
    </>
  );
}
