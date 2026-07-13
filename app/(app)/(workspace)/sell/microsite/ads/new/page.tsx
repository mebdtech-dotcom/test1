// P-VND-13 Ad create (companion → (app)/microsite/ads/new). Authors a new advertisement in
// `draft` state via `marketplace.create_advertisement.v1` (Doc-4D PassB Part D). Presentation-only;
// the form renders genuine-empty and Save is disabled — creation connects in the integration
// phase. Uses the platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../../../_components/shell";
import { AdForm } from "../../../../../_components/vendor/ads";

export const metadata: Metadata = { title: "New ad" };

export default function NewAdPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Microsite & Branding", href: "/sell/microsite" },
          { label: "Advertising", href: "/sell/microsite/ads" },
          { label: "New ad" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="New ad"
        description="Presentation only — saving connects in the integration phase."
      />
      <AdForm />
    </div>
  );
}
