import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilterSidebar } from "@/frontend/components/filter-sidebar";
import { VendorCard } from "@/frontend/components/vendor-card";
import { ProductCard } from "@/frontend/components/product-card";
import { ResultsGrid } from "@/frontend/components/results-grid";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { cn } from "@/frontend/lib/cn";
import taxonomySeed from "@/frontend/navigation/model/taxonomy.v1.json";
import { CategoryCard, OVERLAY_V1, buildTaxonomyIndex, categoryHref } from "@/frontend/navigation";
import type { CategoryNodeData, CategoryNodeVM } from "@/frontend/navigation";
import {
  VENDORS,
  PRODUCTS,
  CATEGORY_GROUPS,
  VENDOR_FACETS,
} from "../../../_components/discovery/seed";
import { productHref } from "../../../_components/product-url";
import { vendorHref } from "../../../_components/vendor-url";
import { Container } from "@/frontend/components/container";
import { CategorySidebarTree } from "./category-sidebar-tree";

// P-PUB-08 Category page (Doc-7D Public surface · FE-PUB-04; FE-PUB-09 **Category Landing
// Contract** — MEGA_MENU_ARCHITECTURE §9.1). PRESENTATION & COMPOSITION ONLY: anonymous,
// read-only, binds NO Doc-5 contract.
//
// FE-PUB-09 rebind: `findCategory` now resolves against **Taxonomy Content v1.0** (794 active
// slugs from the build-time seed — every mega-menu row lands here) UNION the legacy curated
// 15-slug interim set (CATEGORY_GROUPS — keeps every previously-shipped link alive; additive,
// no regression on closed surfaces). Unknown slug 404s byte-identically (Invariant #11).
// Enrichment (additive): full ancestor breadcrumb (taxonomy `pathTo`), overlay description,
// and a Related Categories rail (siblings + children — DERIVED from the taxonomy, never
// fabricated). Vendor/product results remain the same exact-match read over the curated
// discovery seed standing in for `search_catalog` under the registered interim
// [ESC-7-API-CATNAV] (disclosed in-page); taxonomy nodes the seed doesn't cover render the
// honest empty grid — counts/featured-suppliers stay contract-gated (GI-03, never fabricated).
const TAXONOMY = buildTaxonomyIndex(taxonomySeed.nodes as CategoryNodeData[], OVERLAY_V1);
const LEGACY_CATEGORIES = CATEGORY_GROUPS.flatMap((group) => group.categories);

interface ResolvedCategory {
  slug: string;
  name: string;
  /** Present only for taxonomy-resolved slugs. */
  node?: CategoryNodeVM;
}

function findCategory(slug: string): ResolvedCategory | undefined {
  const node = TAXONOMY.bySlug.get(slug);
  if (node && !node.hidden) return { slug: node.slug, name: node.name, node };
  const legacy = LEGACY_CATEGORIES.find((c) => c.slug === slug);
  if (legacy) return { slug: legacy.slug, name: legacy.name };
  return undefined;
}

type SearchParams = { tab?: string };

const TABS = [
  { key: "vendors", label: "Vendors" },
  { key: "products", label: "Products" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) return { title: "Category · iVendorz" };
  return {
    // Overlay SEO fields are reserved for future landing pages; used here when authored.
    title: category.node?.seoTitle ?? `${category.name} · iVendorz`,
    description:
      category.node?.seoDescription ??
      `Browse ${category.name} suppliers and products on iVendorz.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const activeTab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as string) : "vendors";

  // INTERIM stand-in for a `search_catalog` category-facet read: an exact-match filter over the
  // curated seed (not a substring search — the category is already selected). Replaced wholesale
  // when wired. Taxonomy nodes without seed coverage honestly show the empty grid.
  const vendors = VENDORS.filter((v) => v.category === category.name);
  const products = PRODUCTS.filter((p) => p.category === category.name);

  const tabHref = (tab: string) => `/marketplace/category/${slug}?tab=${tab}`;

  // Ancestor breadcrumb + Related Categories (taxonomy-resolved slugs only — all DERIVED).
  const trail = category.node ? TAXONOMY.pathTo(category.node.id) : [];
  const parent =
    category.node?.parentId != null ? TAXONOMY.byId.get(category.node.parentId) : undefined;
  const siblings = category.node
    ? (parent?.children ?? TAXONOMY.roots).filter((n) => n.id !== category.node!.id)
    : [];
  const related = [...(category.node?.children ?? []), ...siblings].slice(0, 8);
  const rootSlug = trail[0]?.slug;

  return (
    <Container className="py-8">
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">
          <Link href="/marketplace" className="rounded-sm hover:text-foreground hover:underline">
            Marketplace
          </Link>
          {" / "}
          <Link href="/categories" className="rounded-sm hover:text-foreground hover:underline">
            Categories
          </Link>
          {trail.slice(0, -1).map((ancestor) => (
            <span key={ancestor.id}>
              {" / "}
              <Link
                href={categoryHref(ancestor)}
                className="rounded-sm hover:text-foreground hover:underline"
              >
                {ancestor.name}
              </Link>
            </span>
          ))}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-2 max-w-2xl text-iv-ink-secondary">
          {category.node?.description ?? `Verified suppliers and products in ${category.name}.`}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Live catalog search is coming soon — showing example listings for this category.
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-lg border border-border bg-card p-4 lg:sticky lg:top-20">
            <FilterSidebar facets={VENDOR_FACETS} label="Filter category results" />
            {/* FE-PUB-09 Phase 2: route-aware category tree (taxonomy-resolved slugs only). */}
            {category.node ? <CategorySidebarTree slug={category.node.slug} /> : null}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
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

          {activeTab === "vendors" ? (
            <ResultsGrid
              count={vendors.length}
              columnsClassName="grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              footer={<PaginationControl hasMore hasPrevious={false} />}
            >
              {vendors.map((v) => (
                <VendorCard key={v.slug} vendor={v} href={vendorHref(v.slug)} />
              ))}
            </ResultsGrid>
          ) : (
            <ResultsGrid
              count={products.length}
              columnsClassName="grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
              footer={<PaginationControl hasMore hasPrevious={false} />}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} href={productHref(p)} />
              ))}
            </ResultsGrid>
          )}

          {/* Related Categories rail (ARCH §9.1) — children first, then siblings; DERIVED from
              the taxonomy, collapses entirely for legacy-only slugs. */}
          {related.length > 0 ? (
            <section aria-label="Related categories" className="mt-8">
              <h2 className="mb-3 text-lg font-semibold tracking-tight text-iv-ink-heading">
                Related categories
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {related.map((node) => (
                  <CategoryCard
                    key={node.id}
                    node={node}
                    href={categoryHref(node)}
                    rootSlug={rootSlug ?? node.slug}
                    size="sm"
                    showDescription={false}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
