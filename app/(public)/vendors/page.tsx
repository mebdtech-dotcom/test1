import type { Metadata } from "next";
import { FilterSidebar } from "@/frontend/components/filter-sidebar";
import { VendorCard } from "@/frontend/components/vendor-card";
import { ResultsGrid } from "@/frontend/components/results-grid";
import { SearchBar } from "@/frontend/components/search-bar";
import { Container } from "@/frontend/components/container";
import { VENDOR_FACETS } from "../_components/discovery/seed";
import { getVendorDirectoryPage } from "../_components/discovery/vendor-directory";
import { CursorPaginationNav } from "../_components/discovery/cursor-pagination-nav";
import { vendorHref } from "../_components/vendor-url";

// P-PUB-12 Vendor Directory (Doc-7D Public surface · landing_page_spec §5). COMPOSITION ONLY:
// anonymous, read-only. Composes the M2.1 VendorCard (no new card type) behind a presentational
// FilterSidebar + ResultsGrid + REAL cursor pagination (CursorPaginationNav / PaginationControl).
//
// WIRED (Wave-3 M2 second slice, 2026-07-11): the vendor grid now calls the real
// `marketplace.list_vendor_directory.v1` read (`../_components/discovery/vendor-directory.ts`) instead
// of the static `VENDORS` seed. `FilterSidebar` stays PRESENTATIONAL (kit-level "Apply/Clear are inert
// affordances until wired" — its checkboxes carry no name/value/category-id and the contract's
// `capability` filter accepts only ONE flag per call; wiring it is a disproportionate kit-level change
// outside this slice's scope, not an oversight).
//
// FE-PUB-06 delta: added the spec's Toolbar search entry point (`SearchBar`, Doc-7B kit, already
// promoted for Public-surface use by /categories). Points at `/search` — not this page — because
// /search already owns the real `?q=`-consuming filter logic (incl. a Vendors result tab, now ALSO
// wired to the same real read); this page stays a pure listing, never a second fork of that logic.
//
// GOVERNANCE: cursor pagination only — no offset, no page numbers, no client-computed total (GI-03);
// the empty branch is byte-identical to absence and an excluded vendor still appears (Invariant #11).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vendor directory · iVendorz",
  description: "Browse verified industrial suppliers across Bangladesh by category and capability.",
};

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const sp = await searchParams;
  const page = await getVendorDirectoryPage(sp.cursor);

  return (
    <Container className="py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
          Vendor directory
        </h1>
        <p className="mt-2 text-iv-ink-secondary">
          Browse verified industrial suppliers across Bangladesh.
        </p>
        <div className="mt-4 max-w-2xl">
          <SearchBar
            action="/search"
            label="Search suppliers"
            placeholder="Search suppliers by name or category…"
          />
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-lg border border-border bg-card p-4 lg:sticky lg:top-20">
            <FilterSidebar facets={VENDOR_FACETS} label="Filter vendors" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <ResultsGrid
            count={page.items.length}
            columnsClassName="grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            footer={<CursorPaginationNav hasMore={page.hasMore} nextCursor={page.nextCursor} />}
          >
            {page.items.map((vendor) => (
              <VendorCard key={vendor.slug} vendor={vendor} href={vendorHref(vendor.slug)} />
            ))}
          </ResultsGrid>
        </div>
      </div>
    </Container>
  );
}
