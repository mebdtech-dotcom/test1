import type { Metadata } from "next";
import { SearchBar } from "@/frontend/components/search-bar";
import { PublicPageHead } from "../_components/public-page-head";
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
      {/* Page head — the reference's shared `.pghead` (`isMarketplace`). Copy unchanged; the search
          bar keeps its place inside the head exactly as the reference composes it. */}
      <PublicPageHead
        eyebrow="Marketplace"
        crumbs={[{ label: "Marketplace" }]}
        title="Marketplace"
        description="Discover verified industrial suppliers and products across Bangladesh."
      >
        <div className="max-w-2xl">
          <SearchBar action="/search" />
        </div>
      </PublicPageHead>

      <FeaturedCategories />
      <SupplierShowcase />
      <PopularProducts />
    </>
  );
}
