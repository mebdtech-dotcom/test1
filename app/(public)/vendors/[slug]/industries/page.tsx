import type { Metadata } from "next";
import {
  IndustryGrid,
  VendorPageHeading,
  VendorSection,
  getCompanyContent,
} from "../../../_components/microsite";
import { getPublicVendorProfile } from "../../../_components/discovery/seed";
import { vendorHref } from "../../../_components/vendor-url";
import { getVendorOr404 } from "../get-vendor";

// Vendor Microsite — INDUSTRIES page (M2.7 · ADR-022 / Doc-7D §10). All sectors the supplier serves.
// Industries are a presentation reference (not modeled in the frozen corpus); editorial, coins nothing.
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
  const canonical = vendorHref(slug, "industries");
  return {
    title: `Industries · ${profile.name} · iVendorz`,
    description: `Industries served by ${profile.name}.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function VendorIndustriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getVendorOr404(slug);
  const content = getCompanyContent(profile);

  return (
    <>
      <VendorPageHeading title="Industries served" subtitle={profile.name} />

      <VendorSection id="industries" title="Industries" description="Sectors this supplier serves.">
        <IndustryGrid industries={content.industries} />
      </VendorSection>
    </>
  );
}
