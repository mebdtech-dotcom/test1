import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Card } from "@/frontend/primitives/card";
import {
  CapabilitySection,
  CompanyOverview,
  IndustryGrid,
  ProductShowcase,
  ProjectShowcase,
  VendorHero,
  VendorSection,
  getCompanyContent,
} from "../../_components/microsite";
import { getPublicVendorProfile, getPublicVendorProducts } from "../../_components/discovery/seed";
import { vendorHref } from "../../_components/vendor-url";
import { getVendorOr404 } from "./get-vendor";

// P-PUB-13 Vendor Microsite — HOME / landing page (M2.7 · ADR-022 / Doc-7D §10). PRESENTATION & COMPOSITION
// ONLY: anonymous, read-only, binds NO Doc-5 contract. One of seven routes; the shared chrome (header/nav/
// footer) is the route-group `layout.tsx`. The Home page is a curated landing — Hero + summary + capabilities +
// FEATURED products/projects + industries + CTA — with "View all" links into the dedicated pages (Doc-7D §10.1;
// the homepage does NOT carry every company section). Featured = an editorial slice of the seed, never a
// computed ranking (GI-04). Composes the shared kit + sibling microsite components ONLY.
const AUTH_HREF = "/login";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = getPublicVendorProfile(slug);
  if (!profile) return { title: "Vendor · iVendorz" };
  // FE-PUB-10: canonical + og:url built via the ONE canonical URL builder (ADR-024 Decision 6 /
  // Doc-7D §11.8) — the interim path shape today; CHR-resolved subdomain once the backend read
  // lands, still through this same builder (single swap point, no call-site change).
  const canonical = vendorHref(slug);
  return {
    title: `${profile.name} · iVendorz`,
    description: profile.about ?? `${profile.name} — ${profile.category} on iVendorz.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function VendorHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = getVendorOr404(slug);
  const products = getPublicVendorProducts(slug);
  const content = getCompanyContent(profile);

  // Editorial "featured" slices (curated seed order — NOT a computed score sort, GI-04).
  const featuredProducts = products.slice(0, 4);
  const featuredProjects = content.projects?.slice(0, 3);
  const topIndustries = content.industries?.slice(0, 8);
  const coreCapabilities = content.capabilities?.slice(0, 4);

  const viewAll = (href: string) => (
    <Link href={href} className="text-sm font-medium text-iv-navy-700 hover:underline">
      View all
    </Link>
  );

  return (
    <>
      <VendorHero profile={profile} authHref={AUTH_HREF} />

      <VendorSection id="summary" title="Company summary">
        <CompanyOverview overview={content.overview} businessOverview={content.businessOverview} />
      </VendorSection>

      <VendorSection
        id="capabilities"
        title="Capabilities"
        action={viewAll(vendorHref(slug, "about"))}
      >
        <CapabilitySection capabilityFlags={profile.capability} capabilities={coreCapabilities} />
      </VendorSection>

      <VendorSection
        id="featured-products"
        title="Featured products"
        action={viewAll(vendorHref(slug, "products"))}
      >
        <ProductShowcase products={featuredProducts} authHref={AUTH_HREF} />
      </VendorSection>

      <VendorSection
        id="featured-projects"
        title="Featured projects"
        action={viewAll(vendorHref(slug, "projects"))}
      >
        <ProjectShowcase projects={featuredProjects} />
      </VendorSection>

      <VendorSection
        id="industries"
        title="Industries served"
        action={viewAll(vendorHref(slug, "industries"))}
      >
        <IndustryGrid industries={topIndustries} />
      </VendorSection>

      <VendorSection id="cta" title="Ready to work together?">
        <Card className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Send a quote request to {profile.name} — you’ll be asked to sign in.
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild>
              <Link href={AUTH_HREF}>Request quote</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={vendorHref(slug, "contact")}>Contact</Link>
            </Button>
          </div>
        </Card>
      </VendorSection>
    </>
  );
}
