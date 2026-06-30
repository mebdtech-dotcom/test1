// SEC-CATEGORY + SEC-INDUSTRY — Featured Categories grid + Industry Explorer entry (landing_page_spec
// §4 · Doc-7D). PRESENTATION-ONLY Server Component. Interim per [ESC-7-API-CATNAV]: the full anonymous
// taxonomy tree is blocked, so the featured selection is a CURATED STATIC SEED and each tile/entry
// navigates into a `search_catalog` facet view (/marketplace · /categories, activated in M2.2). No
// taxonomy tree or product counts are fabricated here (GI-03/GI-12).
import Link from "next/link";
import { LayoutGrid, ArrowRight } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { LandingSection } from "@/frontend/components/landing-section";
import { CategoryTile } from "@/frontend/components/category-tile";
import { FEATURED_CATEGORIES } from "../discovery/seed";

export function FeaturedCategories() {
  return (
    <LandingSection
      id="sec-category"
      title="Browse industrial categories"
      description="Source across industrial categories — from valves and steel to electrical drives, pumps, and safety."
      viewAllHref="/categories"
      viewAllLabel="All categories"
    >
      {/* Count-agnostic grid (N3): renders whatever number of tiles a future facet read returns — the
          six here is the curated seed, not a layout assumption (the grid wraps any N). */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FEATURED_CATEGORIES.map((category) => (
          <CategoryTile
            key={category.slug}
            category={category}
            href={`/marketplace?category=${encodeURIComponent(category.slug)}`}
          />
        ))}
      </div>

      {/* SEC-INDUSTRY — Industry Explorer entry; opens the category browse page (/categories, M2.2). */}
      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-iv-navy-50/40 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-iv-navy-100 text-iv-navy-700">
            <LayoutGrid aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-iv-ink-heading">Browse more categories</p>
            <p className="text-xs text-muted-foreground">
              Drill through industries, categories, and specialisations to find the right suppliers.
            </p>
          </div>
        </div>
        <Button asChild variant="secondary" size="sm" className="gap-1.5">
          <Link href="/categories">
            Browse all categories
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </Card>
    </LandingSection>
  );
}
