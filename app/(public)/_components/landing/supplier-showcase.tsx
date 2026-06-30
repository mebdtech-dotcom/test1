// SEC-SUPPLIERS — Verified Supplier Showcase (landing_page_spec §5 · Doc-7D). PRESENTATION-ONLY Server
// Component bound (by VM) to `list_vendor_directory` + `get_public_vendor_profile` + the public trust
// badge (Doc-5G). The trust centerpiece among content sections.
//
// GOVERNANCE: capability = the four-flag MATRIX (Invariant #1); "Verified" is the binary M5 public
// signal (absence = no badge, not a "pending" state). Showcase order is PRESENTATION over a contract
// result — it implies no matching/ranking/recommendation and never re-ranks M3 (GI-04). The curated
// "featured" selection is editorial, not a computed score sort. Published-only: a vendor blacklisted by
// some buyer still appears, byte-identical (Invariant #11; GI-12). One card is intentionally unverified
// to demonstrate that absence renders as absence — never a fabricated state.
import { LandingSection } from "@/frontend/components/landing-section";
import { VendorCard } from "@/frontend/components/vendor-card";
import { FEATURED_VENDORS } from "../discovery/seed";

export function SupplierShowcase() {
  return (
    <LandingSection
      id="sec-suppliers"
      title="Verified suppliers"
      description="Credible industrial suppliers, with verification and capabilities you can check at a glance."
      viewAllHref="/vendors"
      viewAllLabel="Browse directory"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURED_VENDORS.map((vendor) => (
          <VendorCard key={vendor.slug} vendor={vendor} href={`/vendors/${vendor.slug}`} />
        ))}
      </div>
    </LandingSection>
  );
}
