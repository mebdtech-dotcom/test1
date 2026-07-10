import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronRight, Info, Package, Store } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { categoryHref } from "@/frontend/navigation/model/types";
import {
  getPublicProductDetail,
  type PublicProductDetailVM,
} from "../../../_components/discovery/seed";
import { productHref, parseProductSlugParam } from "../../../_components/product-url";
import { vendorHref } from "../../../_components/vendor-url";
import { VendorVerifiedBadge } from "../../../_components/microsite/vendor-verified-badge";
import { Container } from "@/frontend/components/container";

// P-PUB-11 Product Detail (FE-PUB-05 · ADR-025 + Doc-4D v1.0.3 / Doc-5D v1.0.1, folded 2026-07-03,
// RV-0130). The real standalone anonymous product page — the prior interim never had one ("there is
// NO standalone anonymous product page" was `product-detail.tsx`'s own governing comment; that file
// is retired at this cutover). PRESENTATION-ONLY: no backend read exists, this composes the seed
// into the shape the now-ratified `marketplace.get_public_product_detail.v1` projection defines,
// same posture as FE-PUB-10's vendor URL law.
//
// GOVERNANCE:
//  • R9 non-disclosure — an unknown/unresolvable id 404s byte-identically via `getProductOr404`
//    (one gate, one branch — there is no suspended/banned-vendor variant to render differently in
//    this seed, so every absence cause already collapses to the same outcome by construction).
//  • Id-anchored canonical URL (ADR-025 Decision 2/3) — the UUID tail is the sole resolution key; a
//    non-canonical name-slug prefix, or a bare-id request with no prefix, 301-redirects to the
//    current canonical (`permanentRedirect`, Decision 5 / Doc-5D conformance row F-2).
//  • Normative exclusion manifest honored — NO price/currency (a correction over the retired
//    interim, which showed one; the folded contract's exclusion list is binding), NO
//    trust/performance SCORE, NO counts, NO related items (carried separately to
//    `ESC-7-API/related`, not this milestone's to build — Review-A MAJOR, corrected: the retired
//    interim's "More from {vendor}" section was initially carried forward unchanged and is now
//    dropped), NO buyer-private/entitlement facts. The vendor summary card shows only the
//    binary Verified signal (`VendorVerifiedBadge`, M5 public projection) — never a fabricated
//    tier/score the seed doesn't carry.
//  • `vendor_slug` is resolved server-side for `vendorHref()` link construction only — never
//    rendered as bare text (ADR-024/ADR-025 builder-only discipline, same as FE-PUB-10).

function getProductOr404(id: string): PublicProductDetailVM {
  const detail = getPublicProductDetail(id);
  if (!detail) notFound();
  return detail;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseProductSlugParam(slug);
  if (!parsed) return { title: "Product · iVendorz" };
  const detail = getPublicProductDetail(parsed.id);
  if (!detail) return { title: "Product · iVendorz" };
  const canonical = productHref(detail);
  return {
    title: `${detail.name} · ${detail.vendorName} · iVendorz`,
    description: detail.description ?? `${detail.name} from ${detail.vendorName} on iVendorz.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = parseProductSlugParam(slug);
  if (!parsed) notFound();

  const detail = getProductOr404(parsed.id);
  const canonical = productHref(detail);
  const canonicalSlug = canonical.split("/").pop();

  // ADR-025 Decision 5 / F-2: a non-canonical name-slug prefix (including a bare-id request, whose
  // empty prefix never matches) 301-redirects to the current canonical — the id-only leg resolves
  // via this redirect, never as a second canonical.
  if (slug !== canonicalSlug) {
    permanentRedirect(canonical);
  }

  const breadcrumb = detail.primaryCategoryPath;

  return (
    <Container className="flex flex-col gap-6 py-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/marketplace" className="rounded-sm hover:text-foreground hover:underline">
          Marketplace
        </Link>
        {breadcrumb.map((segment) => (
          <span key={segment.categoryId} className="flex items-center gap-1">
            <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
            <Link
              href={categoryHref({ slug: segment.slug })}
              className="rounded-sm hover:text-foreground hover:underline"
            >
              {segment.name}
            </Link>
          </span>
        ))}
        <span className="flex items-center gap-1">
          <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
          <span aria-current="page" className="max-w-[16rem] truncate text-foreground">
            {detail.name}
          </span>
        </span>
      </nav>

      <Card>
        <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[minmax(0,18rem)_1fr]">
          {/* Decorative product tile (no <img>; media refs are storage-only per the frozen contract —
              none exist in this seed, so this stays the honest glyph fallback, never a fabricated URL). */}
          <div
            aria-hidden="true"
            className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"
          >
            <Package className="size-10" />
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-iv-ink-heading">
                {detail.name}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Link
                  href={vendorHref(detail.vendorSlug)}
                  className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {detail.vendorName}
                </Link>
                <VendorVerifiedBadge verified={detail.vendorVerified} />
              </p>
            </div>

            {detail.description ? (
              <p className="text-sm text-foreground">{detail.description}</p>
            ) : null}

            {/* Anonymous intents → (auth) / supplier microsite; never a mutation here (Doc-7D §5). */}
            <div className="mt-1 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/login">Request quote</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={vendorHref(detail.vendorSlug)}>
                  <Store aria-hidden="true" />
                  View supplier
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="specifications-heading">
        <h2
          id="specifications-heading"
          className="mb-3 text-base font-semibold text-iv-ink-heading"
        >
          Specifications
        </h2>
        {detail.spec ? (
          <Card>
            <CardContent className="p-4 text-sm text-foreground">{detail.spec}</CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={<Info aria-hidden="true" />}
            title="No specifications published"
            description="This supplier hasn't published detailed specifications for this product yet."
          />
        )}
      </section>

      <section aria-labelledby="documents-heading">
        <h2 id="documents-heading" className="mb-3 text-base font-semibold text-iv-ink-heading">
          Documents
        </h2>
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No documents published"
          description="Datasheets, drawings, and standards documents appear here when the supplier publishes them."
        />
      </section>
    </Container>
  );
}
