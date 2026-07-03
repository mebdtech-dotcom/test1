import type { Metadata } from "next";
import { ProductShowcase, VendorPageHeading, VendorSection } from "../../../_components/microsite";
import {
  getPublicVendorProducts,
  getPublicVendorProfile,
} from "../../../_components/discovery/seed";
import { vendorHref } from "../../../_components/vendor-url";
import { getVendorOr404 } from "../get-vendor";

// Vendor Microsite — PRODUCTS page (M2.7 · ADR-022 / Doc-7D §10). Categories + product grid + featured +
// per-product detail links ([ESC-7-API-PRODDETAIL] in-search detail) + RFQ CTA — all via ProductShowcase.
// Presentation-only; no standalone anonymous product page invented.
const AUTH_HREF = "/login";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = getPublicVendorProfile(slug);
  if (!profile) return { title: "Vendor · iVendorz" };
  // FE-PUB-10: canonical + og:url via the ONE canonical URL builder (ADR-024 Decision 6 / Doc-7D
  // §11.8) — see `vendors/[slug]/page.tsx` for the full rationale.
  const canonical = vendorHref(slug, "products");
  return {
    title: `Products · ${profile.name} · iVendorz`,
    description: `Published products from ${profile.name}.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function VendorProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getVendorOr404(slug);
  const products = getPublicVendorProducts(slug);

  return (
    <>
      <VendorPageHeading title="Products" subtitle={profile.name} />

      <VendorSection
        id="products"
        title="Product catalog"
        description="Published products from this supplier."
      >
        <ProductShowcase products={products} authHref={AUTH_HREF} />
      </VendorSection>
    </>
  );
}
