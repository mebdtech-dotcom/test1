import { redirect } from "next/navigation";
import { vendorHref } from "../../../_components/vendor-url";

// M2.7 back-compat redirect (ADR-022 / Doc-7D §10.2). "Capabilities" is NOT one of the seven top-level routes;
// its content now lives on the About page. This stub preserves any existing/linked `/capabilities` URL. (The
// route-group layout resolves the vendor first, so an unknown slug 404s before this redirect runs.)
export default async function VendorCapabilitiesRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(vendorHref(slug, "about"));
}
