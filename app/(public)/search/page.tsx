import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Info } from "lucide-react";
import { SearchBar, FilterSidebar } from "../_components/discovery";
import { VENDORS, PRODUCTS, CATEGORY_GROUPS, VENDOR_FACETS } from "../_components/discovery/seed";
import { VendorCard } from "@/frontend/components/vendor-card";
import { ProductCard } from "@/frontend/components/product-card";
import { CategoryTile } from "@/frontend/components/category-tile";
import { ResultsGrid } from "@/frontend/components/results-grid";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { Skeleton } from "@/frontend/primitives/skeleton";
import { cn } from "@/frontend/lib/cn";

// P-PUB-10 Search Experience (Doc-7D Public surface · landing_page_spec §2 · M2.3). PRESENTATION &
// COMPOSITION ONLY: anonymous, read-only, binds NO Doc-5 contract. Reuses the kit cards + ONE ResultsGrid
// across Products / Vendors / Categories (no new card types). The query is URL-synced (?q=); results are
// an INTERIM seed filter standing in for `search_catalog` (BC-MKT-6 §8) — never a real search/rank (GI-04).
//
// GOVERNANCE: cursor pagination only, no offset/page-number/total (GI-03); empty = byte-identical to
// absence (Invariant #11). The `?state=` param is a PRESENTATION/QA HARNESS to preview the loading /
// partial / error states (which a wired search will drive) — it fabricates no data and is not user-facing.
export const metadata: Metadata = {
  title: "Search · iVendorz",
  description: "Search verified industrial suppliers and products across Bangladesh.",
};

type SearchParams = { q?: string; tab?: string; state?: string };

const TABS = [
  { key: "products", label: "Products" },
  { key: "vendors", label: "Vendors" },
  { key: "categories", label: "Categories" },
] as const;

function contains(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle);
}

/** Presentation skeleton grid for the loading state (kit Skeleton). */
function ResultSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="mt-3 h-6 w-full" />
          <Skeleton className="mt-4 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const ql = q.toLowerCase();
  const activeTab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as string) : "products";
  const demoState = sp.state; // "loading" | "partial" | "error" — presentation/QA harness only.

  // INTERIM stand-in for `search_catalog`: a substring filter over the curated seed. NOT a real
  // search/match/rank (GI-04) — replaced wholesale when the public read is wired.
  const allCategories = CATEGORY_GROUPS.flatMap((g) => g.categories);
  const products = ql
    ? PRODUCTS.filter(
        (p) => contains(p.name, ql) || contains(p.category ?? "", ql) || contains(p.vendorName, ql),
      )
    : PRODUCTS;
  const vendors = ql
    ? VENDORS.filter((v) => contains(v.name, ql) || contains(v.category, ql))
    : VENDORS;
  const categories = ql ? allCategories.filter((c) => contains(c.name, ql)) : allCategories;

  const tabHref = (tab: string) =>
    q ? `/search?q=${encodeURIComponent(q)}&tab=${tab}` : `/search?tab=${tab}`;

  function renderResults() {
    if (demoState === "error") {
      // A wired error would branch on `error_class` and show a `reference_id` (GI-05); this is the shell.
      return (
        <EmptyState
          icon={<AlertTriangle aria-hidden="true" />}
          title="Search is unavailable right now"
          description="We couldn’t complete your search. Please try again in a moment."
        />
      );
    }
    if (demoState === "loading") return <ResultSkeleton />;

    if (activeTab === "vendors") {
      return (
        <ResultsGrid
          count={vendors.length}
          footer={<PaginationControl hasMore hasPrevious={false} />}
        >
          {vendors.map((v) => (
            <VendorCard key={v.slug} vendor={v} href={`/vendors/${v.slug}`} />
          ))}
        </ResultsGrid>
      );
    }
    if (activeTab === "categories") {
      return (
        <ResultsGrid
          count={categories.length}
          columnsClassName="grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {categories.map((c) => (
            <CategoryTile
              key={c.slug}
              category={c}
              href={`/marketplace?category=${encodeURIComponent(c.slug)}`}
            />
          ))}
        </ResultsGrid>
      );
    }
    return (
      <ResultsGrid
        count={products.length}
        columnsClassName="grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
        footer={<PaginationControl hasMore hasPrevious={false} />}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} href={`/vendors/${p.vendorSlug}`} />
        ))}
      </ResultsGrid>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
          {q ? (
            <>
              Search results for <span className="text-iv-navy-700">“{q}”</span>
            </>
          ) : (
            "Search the marketplace"
          )}
        </h1>
        <div className="mt-4 max-w-2xl">
          <SearchBar key={q} defaultQuery={q} />
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-lg border border-border bg-card p-4 lg:sticky lg:top-20">
            <FilterSidebar facets={VENDOR_FACETS} label="Filter search results" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Result-type tabs as URL links (server-rendered; aria-current, no client-computed counts — GI-03). */}
          <nav
            aria-label="Result type"
            className="mb-4 inline-flex items-center gap-1 rounded-md bg-muted p-1"
          >
            {TABS.map((t) => {
              const active = t.key === activeTab;
              return (
                <Link
                  key={t.key}
                  href={tabHref(t.key)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-sm px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-card text-foreground shadow-iv-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>

          {demoState === "partial" ? (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-base">
              <Info aria-hidden="true" className="size-4 shrink-0" />
              Showing partial results while we finish searching…
            </div>
          ) : null}

          {renderResults()}
        </div>
      </div>
    </div>
  );
}
