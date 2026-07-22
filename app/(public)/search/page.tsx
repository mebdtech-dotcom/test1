import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { SearchBar } from "@/frontend/components/search-bar";
import { FilterSidebar } from "@/frontend/components/filter-sidebar";
import { PRODUCTS, CATEGORY_GROUPS, VENDOR_FACETS } from "../_components/discovery/seed";
import { getVendorDirectoryPage } from "../_components/discovery/vendor-directory";
import { CursorPaginationNav } from "../_components/discovery/cursor-pagination-nav";
import { VendorCard } from "@/frontend/components/vendor-card";
import { ProductCard } from "@/frontend/components/product-card";
import { CategoryTile } from "@/frontend/components/category-tile";
import { ResultsGrid } from "@/frontend/components/results-grid";
import { ErrorState } from "@/frontend/components/error-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { productHref } from "../_components/product-url";
import { vendorHref } from "../_components/vendor-url";
import { Skeleton } from "@/frontend/primitives/skeleton";
import { Button } from "@/frontend/primitives/button";
import { Container } from "@/frontend/components/container";
import { cn } from "@/frontend/lib/cn";

// P-PUB-10 Search Experience (Doc-7D Public surface · landing_page_spec §2 · M2.3). COMPOSITION ONLY:
// anonymous, read-only. Reuses the kit cards + ONE ResultsGrid across Products / Vendors / Categories
// (no new card types).
//
// WIRED (Wave-3 M2 second slice, 2026-07-11): the "Vendors" tab now calls the real
// `marketplace.list_vendor_directory.v1` read (`../_components/discovery/vendor-directory.ts`) with REAL
// cursor pagination — no longer the static seed. `list_vendor_directory` has NO free-text `query`
// parameter (Doc-4D §D6 — only `filters`/`cursor`/`page_size`), so the `?q=` search box does not
// actually narrow the Vendors tab yet; a scoped disclosure covers exactly that gap (never silently
// presented as a real name/category match — GI-04). Products/Categories tabs are UNCHANGED — still the
// seed-backed interim standing in for `search_catalog` (BC-MKT-6 §8), with their existing disclosure.
//
// GOVERNANCE: cursor pagination only, no offset/page-number/total (GI-03); empty = byte-identical to
// absence (Invariant #11). The `?state=` loading/partial/error preview is a DEV/QA harness — honored ONLY
// outside production so a real visitor can never be shown a fabricated system state.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search · iVendorz",
  description: "Search verified industrial suppliers and products across Bangladesh.",
};

type SearchParams = { q?: string; tab?: string; state?: string; cursor?: string };

const TABS = [
  { key: "products", label: "Products" },
  { key: "vendors", label: "Vendors" },
  { key: "categories", label: "Categories" },
] as const;

// Per-tab grid geometry — used for BOTH the loading skeleton and the real grid so they don't layout-shift.
const TAB_GRID: Record<
  string,
  { columnsClassName: string; variant: "vendor" | "product" | "category" }
> = {
  vendors: {
    columnsClassName: "grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
    variant: "vendor",
  },
  products: {
    columnsClassName: "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
    variant: "product",
  },
  categories: {
    columnsClassName: "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
    variant: "category",
  },
};

function contains(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle);
}

/** Tab-shaped loading skeleton (kit Skeleton). aria-hidden + a visually-hidden status announce loading. */
function ResultSkeleton({
  columnsClassName,
  variant,
}: {
  columnsClassName: string;
  variant: "vendor" | "product" | "category";
}) {
  const count = variant === "category" ? 8 : 6;
  return (
    <>
      <span role="status" className="sr-only">
        Loading results…
      </span>
      <div aria-hidden="true" className={cn("grid", columnsClassName)}>
        {Array.from({ length: count }).map((_, i) => {
          if (variant === "product") {
            return (
              <div key={i} className="overflow-hidden rounded-lg border border-border">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            );
          }
          if (variant === "category") {
            return (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-4">
                <Skeleton className="size-10 rounded-md" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            );
          }
          return (
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
          );
        })}
      </div>
    </>
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
  // The `?state=` preview harness is honored ONLY outside production (never shown to a real visitor).
  const demoState = process.env.NODE_ENV !== "production" ? sp.state : undefined;

  // INTERIM stand-in for `search_catalog`: a substring filter over the curated seed. NOT a real
  // search/match/rank (GI-04) — Array.filter preserves seed order; replaced wholesale when wired.
  const allCategories = CATEGORY_GROUPS.flatMap((g) => g.categories);
  const products = ql
    ? PRODUCTS.filter(
        (p) => contains(p.name, ql) || contains(p.category ?? "", ql) || contains(p.vendorName, ql),
      )
    : PRODUCTS;
  const categories = ql ? allCategories.filter((c) => contains(c.name, ql)) : allCategories;

  // WIRED: the real `marketplace.list_vendor_directory.v1` read — only fetched for the active tab
  // (avoid an unnecessary DB round trip on the Products/Categories tabs). `list_vendor_directory` has
  // no `query` param, so `q` does NOT filter these results (see the file-top comment / the disclosure
  // rendered below when `q` is set).
  const vendorPage = activeTab === "vendors" ? await getVendorDirectoryPage(sp.cursor) : null;
  const vendors = vendorPage?.items ?? [];

  const tabHref = (tab: string) =>
    q ? `/search?q=${encodeURIComponent(q)}&tab=${tab}` : `/search?tab=${tab}`;
  const grid = TAB_GRID[activeTab];

  function renderResults() {
    if (demoState === "error") {
      return (
        <ErrorState
          errorClass="DEPENDENCY"
          message="We couldn’t complete your search. Please try again in a moment."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}>Try again</Link>
            </Button>
          }
        />
      );
    }
    if (demoState === "loading")
      return <ResultSkeleton columnsClassName={grid.columnsClassName} variant={grid.variant} />;

    if (activeTab === "vendors") {
      return (
        <ResultsGrid
          count={vendors.length}
          columnsClassName={grid.columnsClassName}
          footer={
            <CursorPaginationNav
              hasMore={vendorPage?.hasMore ?? false}
              nextCursor={vendorPage?.nextCursor}
            />
          }
        >
          {vendors.map((v) => (
            <VendorCard key={v.slug} vendor={v} href={vendorHref(v.slug)} />
          ))}
        </ResultsGrid>
      );
    }
    if (activeTab === "categories") {
      return (
        <ResultsGrid count={categories.length} columnsClassName={grid.columnsClassName}>
          {categories.map((c) => (
            <CategoryTile
              key={c.slug}
              category={c}
              href={`/marketplace/category/${encodeURIComponent(c.slug)}`}
            />
          ))}
        </ResultsGrid>
      );
    }
    return (
      <ResultsGrid
        count={products.length}
        columnsClassName={grid.columnsClassName}
        footer={<PaginationControl hasMore hasPrevious={false} />}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} href={productHref(p)} />
        ))}
      </ResultsGrid>
    );
  }

  return (
    <Container className="py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
          {q ? (
            <>
              Search results for <span className="text-iv-navy-700">“{q}”</span>
            </>
          ) : (
            "Search the marketplace"
          )}
        </h1>
        <div className="mt-4 max-w-2xl">
          <SearchBar action="/search" defaultQuery={q} />
        </div>
        {/* Honest interim disclosure (byte-neutral). Products/Categories: `search_catalog` isn't wired
            yet (example listings). Vendors: the directory read IS real, but `list_vendor_directory` has
            no `query` param, so a non-empty `q` doesn't actually narrow it — only disclosed then. */}
        {activeTab === "vendors" ? (
          q ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Vendor name/category search isn’t live yet — showing the full vendor directory.
            </p>
          ) : null
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Live catalog search is coming soon — showing example listings from across the
            marketplace.
          </p>
        )}
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
            className="mb-4 inline-flex h-9 items-center justify-center gap-1 rounded-md bg-muted p-1"
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

          {/* Labelled live region so loading→loaded / partial / error transitions are perceivable to AT. */}
          <section
            aria-label="Search results"
            aria-live="polite"
            aria-busy={demoState === "loading" ? true : undefined}
          >
            {demoState === "partial" ? (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-base">
                <Info aria-hidden="true" className="size-4 shrink-0" />
                Showing partial results while we finish searching…
              </div>
            ) : null}

            {renderResults()}
          </section>
        </div>
      </div>
    </Container>
  );
}
