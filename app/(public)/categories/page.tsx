import type { Metadata } from "next";
import Link from "next/link";
import { Package, Wrench, Hammer, MessageSquare } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { PublicPageHead } from "../_components/public-page-head";
import { CategoryTile } from "@/frontend/components/category-tile";
import { SearchBar } from "@/frontend/components/search-bar";
import { LandingSection } from "@/frontend/components/landing-section";
import taxonomySeed from "@/frontend/navigation/model/taxonomy.v1.json";
import { CategoryCard, OVERLAY_V1, buildTaxonomyIndex, categoryHref } from "@/frontend/navigation";
import type { CategoryNodeData } from "@/frontend/navigation";
import { FEATURED_CATEGORIES } from "../_components/discovery/seed";
import { SupplierShowcase } from "../_components/landing/supplier-showcase";
import { PopularProducts } from "../_components/landing/popular-products";
import { CategoriesExplorer } from "./categories-explorer";

// P-PUB-07 Categories index (Doc-7D Public surface · landing_page_spec §4; FE-PUB-02 delta;
// FE-PUB-09 taxonomy cutover). PRESENTATION & COMPOSITION ONLY: anonymous, read-only, binds NO
// Doc-5 contract. Curated "Popular categories" strip, capability-browse, and the showcases are
// the FE-PUB-02 surface unchanged.
//
// FE-PUB-09 delta: the interim CURATED 15-category navigation seed (CATEGORY_GROUPS) is replaced
// by **Taxonomy Content v1.0** (794 nodes, Board P1-approved 2026-07-03) served from the
// build-time seed (`taxonomy.v1.json`, generated from CATEGORY_MIGRATION_PLAN.md Appendix C —
// never hand-copied). This page is the Explorer's no-JS/SEO fallback destination (UX doc §8):
// the full tree renders server-side as real links (root groups + Browse A–Z), and the inline
// column explorer enhances on desktop. Counts stay contract-gated ([ESC-7-API-CATNAV] soft gate
// — live counts/featured-suppliers arrive with the projection; GI-03: nothing fabricated).
const CAPABILITY_CARDS = [
  { key: "can_supply", label: "Supply", description: "Sell or supply goods", icon: Package },
  { key: "can_service", label: "Service", description: "Provide services", icon: Wrench },
  { key: "can_fabricate", label: "Fabricate", description: "Custom fabrication", icon: Hammer },
  {
    key: "can_consult",
    label: "Consult",
    description: "Consulting / advisory",
    icon: MessageSquare,
  },
] as const;
export const metadata: Metadata = {
  title: "Categories · iVendorz",
  description:
    "Browse industrial categories — mechanical, metals, electrical, process, and safety.",
};

// Server-side taxonomy resolution: build-time seed + overlay → index (pure, module-scope once).
const TAXONOMY = buildTaxonomyIndex(taxonomySeed.nodes as CategoryNodeData[], OVERLAY_V1);

// A–Z groups over ALL active nodes (hidden-vetoed nodes excluded via the forest roots walk).
const AZ_GROUPS: [string, ReturnType<typeof TAXONOMY.pathTo>][] = (() => {
  const flat: ReturnType<typeof TAXONOMY.pathTo> = [];
  const walk = (nodes: typeof TAXONOMY.roots) =>
    nodes.forEach((n) => {
      flat.push(n);
      walk(n.children);
    });
  walk(TAXONOMY.roots);
  const groups = new Map<string, typeof flat>();
  for (const node of flat) {
    const letter = /^[A-Za-z]/.test(node.name) ? node.name[0]!.toUpperCase() : "#";
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(node);
  }
  return [...groups.entries()]
    .map(([letter, nodes]): [string, typeof flat] => [
      letter,
      [...nodes].sort((a, b) => a.name.localeCompare(b.name, "en")),
    ])
    .sort(([a], [b]) => a.localeCompare(b));
})();

export default function CategoriesPage() {
  return (
    <>
      {/* Page head — the reference's shared `.pghead` (see file header). Copy unchanged; the search
          bar keeps its place inside the head exactly as the reference composes it. */}
      <PublicPageHead
        eyebrow="All categories"
        crumbs={[{ label: "Categories" }]}
        title="Browse by category"
        description="Browse industrial categories and jump straight to the suppliers and products you need."
      >
        <div className="max-w-2xl">
          <SearchBar action="/search" />
        </div>
      </PublicPageHead>

      <LandingSection
        id="sec-popular-categories"
        title="Popular categories"
        description="A quick shortlist of frequently sourced categories."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FEATURED_CATEGORIES.map((category) => (
            <CategoryTile
              key={category.slug}
              category={category}
              href={`/marketplace/category/${encodeURIComponent(category.slug)}`}
            />
          ))}
        </div>
      </LandingSection>

      <LandingSection
        id="sec-capability"
        title="Browse by capability"
        description="Every supplier's capability is shown as four independent flags — supply, service, fabrication, and consulting are never combined into one label."
      >
        <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CAPABILITY_CARDS.map((cap) => {
            const Icon = cap.icon;
            return (
              <li key={cap.key}>
                <Link
                  href={`/marketplace?capability=${cap.key}`}
                  className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="flex h-full flex-col gap-2 p-4 transition-colors group-hover:border-iv-brand-200 group-hover:bg-iv-brand-50/40">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-iv-navy-50 text-iv-navy-700">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="text-sm font-semibold text-iv-ink-heading">{cap.label}</span>
                    <span className="text-xs text-muted-foreground">{cap.description}</span>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </LandingSection>

      {/* FE-PUB-09: interactive inline Explorer (desktop enhancement — same components as the
          header instance, no popover) over Taxonomy Content v1.0. */}
      <LandingSection
        id="sec-category-explorer"
        title="Explore all categories"
        description="Drill through the full industrial classification — every row is a direct link."
      >
        <CategoriesExplorer />
        {/* No-JS/SEO fallback + tablet/mobile server render: 13 root groups with L2 links. */}
        <div className="mt-6 flex flex-col gap-8 lg:hidden">
          {TAXONOMY.roots.map((root) => (
            <div key={root.id}>
              <h3 className="mb-3 text-lg font-semibold tracking-tight text-iv-ink-heading">
                <Link href={categoryHref(root)} className="rounded-sm hover:underline">
                  {root.name}
                </Link>
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {root.children.map((child) => (
                  <CategoryCard
                    key={child.id}
                    node={child}
                    href={categoryHref(child)}
                    rootSlug={root.slug}
                    size="sm"
                    showDescription={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* Browse A–Z (Approval Addendum MINOR-06): alphabetical secondary view over all active
          nodes — taxonomy order stays primary. <details> disclosure keeps it usable without JS. */}
      <LandingSection
        id="sec-category-az"
        title="Browse A–Z"
        description="Find any category alphabetically across all levels of the classification."
      >
        <div className="flex flex-col gap-2">
          {AZ_GROUPS.map(([letter, nodes]) => (
            <details key={letter} className="group rounded-lg border border-border bg-card">
              <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold text-iv-ink-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {letter}
                <span className="text-xs font-normal text-muted-foreground">
                  {nodes.length} categor{nodes.length === 1 ? "y" : "ies"}
                </span>
              </summary>
              <ul className="grid grid-cols-1 gap-x-4 px-4 pb-3 sm:grid-cols-2 lg:grid-cols-3">
                {nodes.map((node) => (
                  <li key={node.id}>
                    {/* prefetch={false}: 794 A–Z links must never viewport-prefetch (R2-NITPICK-04). */}
                    <Link
                      prefetch={false}
                      href={categoryHref(node)}
                      className="block truncate rounded-sm py-1 text-sm text-iv-ink-secondary hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {node.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </LandingSection>

      {/* Vendor grouping — verified suppliers across these categories (reuses the showcase section). */}
      <SupplierShowcase />

      {/* Featured products across these categories (reuses the showcase section — no new card type). */}
      <PopularProducts />
    </>
  );
}
