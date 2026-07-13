// P-VND-12 Ads (companion — sibling route to (app)/microsite). Read = `marketplace.list_advertisements.v1`
// (owning-org scope, cursor, no totals). Replaces the pre-cutover placeholder stub with the real,
// contract-bound list. Presentation-only; renders genuine-empty (one canonical, byte-equivalent
// copy) until the read is wired. Uses the platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../../_components/shell";
import { AdList } from "../../../../_components/vendor/ads";

export const metadata: Metadata = { title: "Advertising" };

export default function AdvertisingPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Microsite & Branding", href: "/sell/microsite" },
          { label: "Advertising" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Advertising"
        description="Advertising placements you submit for admin review. Ads govern visibility and placement only — they never affect trust, eligibility, routing, or matching."
      />
      <AdList />
    </div>
  );
}
