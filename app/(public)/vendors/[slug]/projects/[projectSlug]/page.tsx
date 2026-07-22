// Vendor Microsite - PROJECT DETAIL page (P-PUB-25 / FE-PUB-11 / realizes the design companion S6). A
// reusable Portfolio Project Detail TEMPLATE: this page is a thin COMPOSER that resolves the editorial
// project VM and hands each slice to a prop-driven section component. Every section owns its own heading
// and auto-hides (renders nothing) when its data is absent, so any project renders from data alone — the
// only literals here are the auth href and the two breadcrumb-trail labels.
//
// Nested under the existing microsite chrome (`vendors/[slug]/layout.tsx` supplies the global SiteHeader +
// vendor brand header + route nav + footer + the fixed mobile "Request quote" bar). Completes the Vendor
// Profile -> Project Card -> PROJECT DETAIL journey; the projects list's "View details" links here.
//
// PRESENTATION-ONLY, like every other public surface in this program: renders the editorial project SEED
// (`getShowcaseProject`) — a stand-in for the frozen `showcase_projects` M2 entity, which is NOT wired into
// a public read (that lands at Wave-4 wiring). Coins no contract; unknown project slug -> byte-equivalent
// `notFound()` (Invariant #11).
//
// GOVERNANCE RULINGS honored (design companion S6.9, owner Board 2026-07-03; re-affirmed at the 2026-07-08
// prototype Visual Approval):
//  - R1: the vendor card shows the binary Verified badge ONLY; NO tier/rank/score badge (Inv #6 / R6).
//  - R2: the NAMED client is shown here (detail page only); vendor-authored + consent-responsible, coins no
//    platform signal, never exposes a buyer-private/blacklisted relationship. The list cards keep the
//    sector/role `client` descriptor (R2 scoped to this page).
//  - R3: NO "Verify Project Data" affordance; the Compliance Repository renders disabled-honest grouped
//    documents (no fabricated file/URL) OR a genuine empty state — the platform never verifies or holds
//    these files.
//  - R4: media are decorative placeholder tiles (no fabricated <img> source) until the asset pipeline.
//  - Gold stays reserved: the category label is navy, not gold (premium/verified/featured only).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ProjectComplianceRepository,
  ProjectDeliverablesCard,
  ProjectDetailHeader,
  ProjectDetailsCard,
  ProjectGallery,
  ProjectMaterials,
  ProjectMediaGallery,
  ProjectNarrative,
  ProjectRelated,
  ProjectSpecifications,
  ProjectTechnologies,
  ProjectTestimonial,
  ProjectVendorSummaryCard,
  VendorBreadcrumb,
  getCompanyContent,
  getShowcaseProject,
} from "../../../../_components/microsite";
import { getPublicVendorProfile } from "../../../../_components/discovery/seed";
import { vendorHref, vendorProjectHref } from "../../../../_components/vendor-url";
import { getVendorOr404 } from "../../get-vendor";

const AUTH_HREF = "/login";

// Never statically render or cache this route (Invariant #11 non-disclosure — see `../../layout.tsx`).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}): Promise<Metadata> {
  const { slug, projectSlug } = await params;
  const profile = getPublicVendorProfile(slug);
  if (!profile) return { title: "Project - iVendorz" };
  const project = getShowcaseProject(profile, projectSlug);
  if (!project) return { title: `Projects - ${profile.name} - iVendorz` };
  const canonical = vendorProjectHref(slug, projectSlug);
  return {
    title: `${project.name} - ${profile.name} - iVendorz`,
    description: project.scope ?? `A project delivered by ${profile.name}.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function VendorProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}) {
  const { slug, projectSlug } = await params;
  const profile = await getVendorOr404(slug);
  const project = getShowcaseProject(profile, projectSlug);
  // Unknown project -> the SAME byte-equivalent 404 an unknown vendor renders (Invariant #11).
  if (!project) notFound();

  const vendorHomeHref = vendorHref(slug);
  const projectsHref = vendorHref(slug, "projects");
  // Same-vendor projects for the related rail (never a cross-vendor match).
  const vendorProjects = getCompanyContent(profile).projects;

  return (
    <>
      {/* Vendors › {vendor} › Projects › {project}. The layout's chrome breadcrumb carries only the vendor,
          so this page renders the deeper trail itself with a distinct landmark label. */}
      <VendorBreadcrumb
        name={profile.name}
        vendorHomeHref={vendorHomeHref}
        trail={[{ label: "Projects", href: projectsHref }, { label: project.name }]}
        ariaLabel="Project breadcrumb"
        className="mb-4"
      />

      <ProjectDetailHeader
        title={project.name}
        categoryLabel={project.industry}
        vendorName={profile.name}
        backHref={projectsHref}
        quoteHref={AUTH_HREF}
        shareUrl={vendorProjectHref(slug, projectSlug)}
      />

      {/* Two-column body: main content + info sidebar (companion S6.2). */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* MAIN — each section auto-hides when its data is absent. */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          <ProjectMediaGallery media={project.media} />
          <ProjectNarrative
            challenge={project.challenge}
            solution={project.solution}
            result={project.result}
          />
          <ProjectSpecifications specs={project.specifications} />
          <ProjectMaterials items={project.materialsEquipment} />
          <ProjectTechnologies technologies={project.technologies} />
          <ProjectComplianceRepository groups={project.documents} />
          <ProjectGallery items={project.gallery} />
          <ProjectTestimonial testimonial={project.testimonial} />
        </div>

        {/* SIDEBAR */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <ProjectVendorSummaryCard
            profile={profile}
            vendorHomeHref={vendorHomeHref}
            tags={project.tags}
          />
          <ProjectDetailsCard project={project} />
          <ProjectDeliverablesCard items={project.deliverables} />
        </aside>
      </div>

      <div className="mt-10">
        <ProjectRelated
          projects={vendorProjects}
          currentProjectSlug={projectSlug}
          vendorSlug={slug}
        />
      </div>
    </>
  );
}
