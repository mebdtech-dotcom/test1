// P-BUY-02 Buyer Discover vendors — PRESENTATION (`T-LISTING`, Doc-7F · UX §7 discovery). Pure function of
// its view-model (a Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9).
// The server page resolves the data via the wired `marketplace.list_vendor_directory.v1` /
// `marketplace.search_catalog.v1` (Doc-4D §B, GI-02) and passes it here.
//
// REUSE: canonical platform-shell `PageHeader`; buyer `ListToolbar` (search + filters stub); the shared kit
// `VendorCard` (identity + binary Verified + capability matrix); kit `PaginationControl`/`EmptyState`.
//
// GOVERNANCE (load-bearing):
//  • TRUST via `VendorCard` = BINARY "Verified" only — NO numeric/band score ([ESC-7G-SCORE-DISPLAY]);
//    trust is displayed, never computed (M5 owns it). CAPABILITY = the 4-flag matrix (Inv #1).
//  • NON-DISCLOSURE (Inv #11 / §7.5): a blacklisted/never-matched vendor still appears here byte-identical
//    (no buyer-private field exists on the card); only published/non-excluded rows appear. The empty state
//    never implies exclusion.
//  • DISCOVERY ≠ MATCHING (DD-2): cards render in the contract's order — never re-ranked/scored/recommended
//    client-side. Cursor pagination only (Doc-4D §B.6). Cards link by OPAQUE slug (Inv #5).

import { Search } from "lucide-react";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { VendorCard } from "@/frontend/components/vendor-card";
import { PageHeader } from "../../_components/shell";
import { ListToolbar } from "../_components/list-toolbar";
import type { DiscoverData } from "../_components/discover-view-models";

export function DiscoverView({ data }: { data: DiscoverData | null }) {
  const items = data?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <>
      <PageHeader
        title="Discover vendors"
        description="Search verified industrial vendors by capability, category and location."
      />

      <div className="mt-4 flex flex-col gap-4">
        {/* search_catalog has a `query` param, so a search field is contract-legitimate here (unlike the
            attribute-only CRM/engagement lists). Filters (category/geography/capability) bind server-side. */}
        <ListToolbar searchLabel="Search vendors" />

        {isEmpty ? (
          <EmptyState
            icon={<Search aria-hidden />}
            title="No vendors match"
            description="Try broadening your search or clearing filters."
            className="py-16"
          />
        ) : (
          <>
            {/* sr-only section heading so the outline is h1 (PageHeader) → h2 → h3 (VendorCard) — the kit
                VendorCard renders an <h3>, so a peer-grid needs an h2 here to avoid a heading-order skip. */}
            <h2 className="sr-only">Vendor results</h2>
            <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((v) => (
                <li key={v.slug}>
                  {/* Link-out to the public vendor microsite (P-PUB-13, /vendors/[slug]) — owner-ruled
                      reuse (FE-BUY-10, 2026-07-03): no separate in-app profile route for P-BUY-04.
                      Opaque slug (Inv #5). */}
                  <VendorCard vendor={v} href={`/vendors/${v.slug}`} />
                </li>
              ))}
            </ul>
            {/* Cursor pagination (Doc-4D §B.6); the cursor handler attaches at the data-wiring milestone. */}
            <PaginationControl hasMore={Boolean(data?.nextCursor)} />
          </>
        )}
      </div>
    </>
  );
}
