// SEC-PRODUCTS — Popular Products (landing_page_spec §6 · Doc-7D). PRESENTATION-ONLY Server Component
// bound (by VM) to `search_catalog`. Interim per [ESC-7-API-PRODDETAIL]: no standalone anonymous
// product page — a card opens the result in context (the supplier's public microsite).
//
// GOVERNANCE: "Popular" is curated/facet-backed, NEVER labelled "Recommended" (no computed signal —
// GI-04). Prices are the {amount, currency} pair the field carries, via the kit CurrencyDisplay
// (default BDT); items without a price render "On request" — never a fabricated number (GI-08).
import { LandingSection } from "@/frontend/components/landing-section";
import { ProductCard } from "@/frontend/components/product-card";
import { FEATURED_PRODUCTS } from "../discovery/seed";

export function PopularProducts() {
  return (
    <LandingSection
      id="sec-products"
      title="Popular products"
      description="A representative slice of the industrial catalog — open any item to view the supplier."
      viewAllHref="/marketplace"
      viewAllLabel="Search the catalog"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {FEATURED_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} href={`/vendors/${product.vendorSlug}`} />
        ))}
      </div>
    </LandingSection>
  );
}
