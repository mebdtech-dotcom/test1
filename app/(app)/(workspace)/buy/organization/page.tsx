// Buyer-mounted "Organization" (BX-04 bug fix, sidebar IA) — composes the EXISTING, UNMODIFIED
// `OrganizationProfile` (P-ACC-04) inside the Buyer shell. Composition-not-fork, same pattern as the
// Vendor track's `workspace/organization` (FE-VEN-11). `OrganizationLifecycle` (soft-delete/restore)
// isn't composed here — the buyer sidebar names a single "Organization" nav item with no lifecycle
// sub-destination requested; not fabricated, a natural forward candidate if ever asked for.
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { OrganizationProfile } from "../../../account/organization/organization-profile";

export const metadata: Metadata = { title: "Organization" };

export default function BuyerOrganizationPage() {
  return (
    <div>
      <PageHeader title="Organization" description="Your organization's profile." />
      <OrganizationProfile />
    </div>
  );
}
