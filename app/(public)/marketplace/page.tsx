import type { Metadata } from "next";
import { SearchBar } from "@/frontend/components/search-bar";
import { Container } from "@/frontend/components/container";
import { FeaturedCategories } from "../_components/landing/featured-categories";
import { SupplierShowcase } from "../_components/landing/supplier-showcase";
import { PopularProducts } from "../_components/landing/popular-products";

// P-PUB-10 Marketplace (Doc-7D Public surface · landing_page_spec). PRESENTATION & COMPOSITION ONLY:
// anonymous, read-only, binds NO Doc-5 contract. The discovery hub — composes the M2.1 components
// (no new card types): a presentational SearchBar + the Featured Categories / Verified Suppliers /
// Popular Products sections. The live search EXPERIENCE is M2.3; section data is the curated seed.
export const metadata: Metadata = {
  title: "Marketplace · iVendorz",
  description:
    "Discover verified industrial suppliers and products across Bangladesh — valves, steel, electrical, pumps, safety, and more.",
};

export default function MarketplacePage() {
  return (
    <>
      <section className="border-b border-border bg-background">
        <Container className="py-10 sm:py-12">
          <h1 className="text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
            Marketplace
          </h1>
          <p className="mt-2 max-w-2xl text-iv-ink-secondary">
            Discover verified industrial suppliers and products across Bangladesh.
          </p>
          <div className="mt-5 max-w-2xl">
            <SearchBar action="/search" />
          </div>
        </Container>
      </section>

      <FeaturedCategories />
      <SupplierShowcase />
      <PopularProducts />
    </>
  );
}
