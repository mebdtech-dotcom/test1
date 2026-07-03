import type { Metadata } from "next";
import {
  CompanyOverview,
  CompanyStatistics,
  CompanyTimeline,
  ManagementMessage,
  MissionVision,
  VendorPageHeading,
  VendorSection,
  WhyChooseUs,
  getCompanyContent,
} from "../../../_components/microsite";
import { getPublicVendorProfile } from "../../../_components/discovery/seed";
import { vendorHref } from "../../../_components/vendor-url";
import { getVendorOr404 } from "../get-vendor";

// Vendor Microsite — ABOUT page (M2.7 · ADR-022 / Doc-7D §10). Everything corporate: overview + mission/vision +
// core values + why-choose-us + history/timeline + statistics + management. Presentation-only; composes existing
// components. ("Why choose us" is not in the Board page spec — placed here pending Board confirmation; flagged.)
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
  const canonical = vendorHref(slug, "about");
  return {
    title: `About · ${profile.name} · iVendorz`,
    description: profile.about ?? `About ${profile.name}.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function VendorAboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = getVendorOr404(slug);
  const content = getCompanyContent(profile);

  return (
    <>
      <VendorPageHeading title="About" subtitle={profile.name} />

      <VendorSection id="overview" title="Overview">
        <CompanyOverview
          overview={content.overview}
          businessOverview={content.businessOverview}
          facilities={content.facilities}
        />
      </VendorSection>

      <VendorSection id="mission" title="Mission & vision">
        <MissionVision mission={content.mission} vision={content.vision} values={content.values} />
      </VendorSection>

      <VendorSection id="why" title="Why choose us" description="What sets this supplier apart.">
        <WhyChooseUs items={content.whyChooseUs} />
      </VendorSection>

      <VendorSection id="history" title="Company history">
        <CompanyTimeline entries={content.history} />
      </VendorSection>

      <VendorSection id="statistics" title="At a glance">
        <CompanyStatistics stats={content.stats} />
      </VendorSection>

      <VendorSection id="management" title="Message from management">
        <ManagementMessage management={content.management} />
      </VendorSection>
    </>
  );
}
