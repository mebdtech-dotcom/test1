import type { Metadata } from "next";
import { CategoryTile } from "@/frontend/components/category-tile";
import { CATEGORY_GROUPS } from "../_components/discovery/seed";
import { SupplierShowcase } from "../_components/landing/supplier-showcase";

// P-PUB-11 Category Browse (Doc-7D Public surface · landing_page_spec §4). PRESENTATION & COMPOSITION
// ONLY: anonymous, read-only, binds NO Doc-5 contract. Composes the M2.1 CategoryTile (no new card
// type) into an industry-grouped navigation tree, with a Verified-Suppliers grouping reused below.
//
// GOVERNANCE: interim per [ESC-7-API-CATNAV] — the full anonymous taxonomy tree is blocked, so the tree
// is a CURATED navigation seed (industries are wayfinding only, NOT a coined corpus taxonomy). Tiles
// link into `search_catalog` facet views (/marketplace?category=…). No counts are fabricated (GI-03).
export const metadata: Metadata = {
  title: "Categories · iVendorz",
  description:
    "Browse industrial categories — mechanical, metals, electrical, process, and safety.",
};

export default function CategoriesPage() {
  return (
    <>
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-10 sm:px-6 sm:py-12">
          <h1 className="text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
            Browse by category
          </h1>
          <p className="mt-2 max-w-2xl text-iv-ink-secondary">
            Browse industrial categories and jump straight to the suppliers and products you need.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="category-tree-heading"
        className="border-b border-border py-12 sm:py-16"
      >
        <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 sm:px-6">
          <h2 id="category-tree-heading" className="sr-only">
            Category navigation
          </h2>
          <div className="flex flex-col gap-10">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.industry}>
                <h3 className="mb-4 text-lg font-semibold tracking-tight text-iv-ink-heading">
                  {group.industry}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {group.categories.map((category) => (
                    <CategoryTile
                      key={category.slug}
                      category={category}
                      href={`/marketplace?category=${encodeURIComponent(category.slug)}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor grouping — verified suppliers across these categories (reuses the showcase section). */}
      <SupplierShowcase />
    </>
  );
}
