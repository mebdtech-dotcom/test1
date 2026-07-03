import type { Metadata } from "next";
import { FilterSidebar } from "@/frontend/components/filter-sidebar";
import { VendorCard } from "@/frontend/components/vendor-card";
import { ResultsGrid } from "@/frontend/components/results-grid";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { SearchBar } from "@/frontend/components/search-bar";
import { VENDORS, VENDOR_FACETS } from "../_components/discovery/seed";
import { vendorHref } from "../_components/vendor-url";

// P-PUB-12 Vendor Directory (Doc-7D Public surface · landing_page_spec §5). PRESENTATION & COMPOSITION
// ONLY: anonymous, read-only, binds NO Doc-5 contract. Composes the M2.1 VendorCard (no new card type)
// behind a presentational FilterSidebar + ResultsGrid + cursor PaginationControl.
//
// FE-PUB-06 delta: added the spec's Toolbar search entry point (`SearchBar`, Doc-7B kit, already
// promoted for Public-surface use by /categories). Points at `/search` — not this page — because
// /search already owns the real `?q=`-consuming filter logic (incl. a Vendors result tab over the
// same seed); this page stays a pure listing, never a second fork of that filter logic.
//
// GOVERNANCE: cursor pagination only — no offset, no page numbers, no client-computed total (GI-03);
// the empty branch is byte-identical to absence and an excluded vendor still appears (Invariant #11).
export const metadata: Metadata = {
  title: "Vendor directory · iVendorz",
  description: "Browse verified industrial suppliers across Bangladesh by category and capability.",
};

export default function VendorsPage() {
  return (
    <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-8 sm:px-6">
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
            count={VENDORS.length}
            columnsClassName="grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            // Presentation cursor state: a forward page is available; the cursor handlers wire later
            // (no offset/total — GI-03). The Next control is an inert affordance until wired.
            footer={<PaginationControl hasMore hasPrevious={false} />}
          >
            {VENDORS.map((vendor) => (
              <VendorCard key={vendor.slug} vendor={vendor} href={vendorHref(vendor.slug)} />
            ))}
          </ResultsGrid>
        </div>
      </div>
    </div>
  );
}
