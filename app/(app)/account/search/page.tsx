import { Search as SearchIcon, Info } from "lucide-react";
import { PageHeader } from "../../_components/shell/page-header";
import { SearchBar } from "@/frontend/components/search-bar";
import { EmptyState } from "@/frontend/components/empty-state";
import { cn } from "@/frontend/lib/cn";

// Global search results (`/account/search`) — P-SH-01 (Doc-7C Shared Authenticated Shell · T-LISTING; IA
// §5.1). A SERVER COMPONENT in the `(app)` route group; ROUTING + COMPOSITION ONLY, mounted in the Platform
// Shell by the co-located layout. (Path note: the public catalog search owns `/search`; this authenticated
// global search lives at `/account/search` — see layout.tsx shell-placement OBS.)
//
// FIELD DISCIPLINE (invent nothing):
//  • Search across a surface's entity set is served by SURFACE-SCOPED WIRED READS (search_catalog /
//    list_vendor_directory / list_rfqs / list_quotations_for_rfq / post-award reads — IA §5.1), never an
//    unbound type. None of those reads is callable in a presentation-only build, so NO results are
//    fabricated: the results region shows an honest interim EmptyState and cites [ESC-7-API]. No result
//    rows, no counts, no grand totals (GI-03), no relevance/score.
//  • DISCOVERY ≠ MATCHING: this surface presents hits; it NEVER re-ranks or implies it re-ranks the M3 RFQ
//    matching/routing engine (R6/R7). There is no ranking here at all.
//  • NON-DISCLOSURE ABSOLUTE: a hidden entity never appears (absent ≡ excluded — Invariant #11).
//  • The kit `SearchBar` is reused as-is (route-agnostic, URL-syncs `?q=`, fetches nothing). The page owns
//    the single `<h1>` (via PageHeader).

// Scope tabs (IA §5.1) — the entity sets searchable from the active surface. Presentation labels only.
const SCOPES = [
  { key: "products", label: "Products" },
  { key: "vendors", label: "Vendors" },
  { key: "rfqs", label: "RFQs" },
  { key: "quotations", label: "Quotations" },
  { key: "docs", label: "Documents" },
] as const;

type ScopeKey = (typeof SCOPES)[number]["key"];

function resolveScope(raw: string | undefined): ScopeKey {
  return SCOPES.some((s) => s.key === raw) ? (raw as ScopeKey) : "products";
}

export const metadata = {
  title: "Search — iVendorz",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; scope?: string }>;
}) {
  const { q, scope } = await searchParams;
  const query = (q ?? "").trim();
  const activeScope = resolveScope(scope);

  const hrefFor = (s: ScopeKey) => {
    const params = new URLSearchParams();
    params.set("scope", s);
    if (query) params.set("q", query);
    return `/account/search?${params.toString()}`;
  };

  return (
    <>
      <PageHeader title="Search" description="Find products, suppliers, RFQs, and documents." />

      <div className="max-w-3xl space-y-6">
        <SearchBar
          action="/account/search"
          defaultQuery={query}
          label="Search"
          placeholder="Search products, suppliers, RFQs…"
        />

        {/* Scope tabs (IA §5.1) — links, active reflects ?scope=. */}
        <nav aria-label="Search scopes">
          <ul className="flex flex-wrap gap-1 border-b border-border">
            {SCOPES.map((s) => {
              const active = s.key === activeScope;
              return (
                <li key={s.key}>
                  <a
                    href={hrefFor(s.key)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "-mb-px inline-block border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-iv-brand-500 text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Results region — no wired read available, so an honest interim state (never fabricated hits). */}
        <div>
          {query ? (
            <EmptyState
              icon={<SearchIcon aria-hidden="true" />}
              title={`Search for “${query}”`}
              description="Live search results aren’t connected yet — this is a preview of the search surface."
            />
          ) : (
            <EmptyState
              icon={<SearchIcon aria-hidden="true" />}
              title="Search iVendorz"
              description="Enter a term above to search within the selected scope."
            />
          )}
        </div>

        <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            Search reads are scoped per surface and are not wired in this preview. Results only ever
            include entities you’re permitted to see.
          </p>
        </div>
      </div>
    </>
  );
}
