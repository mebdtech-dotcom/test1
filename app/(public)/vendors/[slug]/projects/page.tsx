import type { Metadata } from "next";
import {
  ProjectShowcase,
  VendorPageHeading,
  VendorSection,
  getCompanyContent,
} from "../../../_components/microsite";
import { getPublicVendorProfile } from "../../../_components/discovery/seed";
import { vendorHref } from "../../../_components/vendor-url";
import { getVendorOr404 } from "../get-vendor";

// Vendor Microsite — PROJECTS page (M2.7 · ADR-022 / Doc-7D §10). Selected work: project cards with scope,
// industry, equipment, and decorative galleries; "View details" disabled until the frozen `showcase_projects`
// read is wired. Presentation-only; editorial stand-in (sector/role "client" only — never a fabricated name).
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
  const canonical = vendorHref(slug, "projects");
  return {
    title: `Projects · ${profile.name} · iVendorz`,
    description: `Selected work delivered by ${profile.name}.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function VendorProjectsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getVendorOr404(slug);
  const content = getCompanyContent(profile);

  return (
    <>
      <VendorPageHeading title="Projects" subtitle={profile.name} />

      <VendorSection
        id="projects"
        title="Selected work"
        description="Projects this supplier has delivered."
      >
        <ProjectShowcase projects={content.projects} />
      </VendorSection>
    </>
  );
}
