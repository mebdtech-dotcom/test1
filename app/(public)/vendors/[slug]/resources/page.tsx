import type { Metadata } from "next";
import { Video } from "lucide-react";
import { EmptyState } from "@/frontend/components/empty-state";
import {
  CertificationGrid,
  CompanyFaq,
  CompanyGallery,
  DownloadCenter,
  VendorPageHeading,
  VendorSection,
  getCompanyContent,
} from "../../../_components/microsite";
import { getPublicVendorProfile } from "../../../_components/discovery/seed";
import { vendorHref } from "../../../_components/vendor-url";
import { getVendorOr404 } from "../get-vendor";

// Vendor Microsite — RESOURCES page (M2.7 · ADR-022 / Doc-7D §10.1). The umbrella route for documents,
// certifications, gallery, and videos (NOT separate top-level nav items — Doc-7D §10.2). Presentation-only:
// downloads are DISABLED (no fabricated files), certifications are SELF-DECLARED (never the platform Verified
// signal), gallery is decorative placeholders, videos is a genuine-empty placeholder (no video field is wired).
// ("FAQ" is not in the Board page spec — placed here pending Board confirmation; flagged.)

// Never statically render or cache this route (Invariant #11 non-disclosure — see `../layout.tsx`).
export const dynamic = "force-dynamic";

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
  const canonical = vendorHref(slug, "resources");
  return {
    title: `Resources · ${profile.name} · iVendorz`,
    description: `Documents, certifications, and media from ${profile.name}.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function VendorResourcesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getVendorOr404(slug);
  const content = getCompanyContent(profile);

  return (
    <>
      <VendorPageHeading title="Resources" subtitle={profile.name} />

      <VendorSection
        id="downloads"
        title="Documents & downloads"
        description="Company profile, brochures, and datasheets."
      >
        <DownloadCenter downloads={content.downloads} />
      </VendorSection>

      <VendorSection
        id="certifications"
        title="Certifications & licenses"
        description="Standards and registrations declared by this supplier."
      >
        <CertificationGrid certifications={content.certifications} />
      </VendorSection>

      <VendorSection id="gallery" title="Gallery">
        <CompanyGallery gallery={content.gallery} />
      </VendorSection>

      <VendorSection id="videos" title="Videos">
        <EmptyState
          icon={<Video aria-hidden="true" />}
          title="No videos yet"
          description="Company and product videos appear here when published."
        />
      </VendorSection>

      <VendorSection id="faq" title="Frequently asked questions">
        <CompanyFaq items={content.faq} />
      </VendorSection>
    </>
  );
}
