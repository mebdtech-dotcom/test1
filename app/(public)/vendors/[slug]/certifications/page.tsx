import { redirect } from "next/navigation";
import { vendorHref } from "../../../_components/vendor-url";

// M2.7 back-compat redirect (ADR-022 / Doc-7D §10.2). "Certifications" is NOT a top-level route; its content
// now lives on the Resources page. This stub preserves any existing/linked `/certifications` URL. (The
// route-group layout resolves the vendor first, so an unknown slug 404s before this redirect runs.)
export default async function VendorCertificationsRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(vendorHref(slug, "resources"));
}
