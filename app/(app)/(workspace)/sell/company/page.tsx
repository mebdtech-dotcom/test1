// Company Profile surface (companion §4: S1–S4 all map to (app)/company → tabs). Presentation-only:
// the four sections render their genuine-empty / first-run states with no data (integration wires the
// Doc-5D reads). S5 Categories is a sibling route (/company/categories).
import type { Metadata } from "next";
import {
  CapabilitiesCapacityForm,
  CompanyProfileTabs,
  FinancialTierPanel,
  IdentityGeographyForm,
  ProfileOverview,
} from "../../../_components/vendor/company";

export const metadata: Metadata = { title: "Company Profile" };

export default function CompanyPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Company Profile</h1>
        <p className="text-sm text-muted-foreground">
          Identity, capabilities, capacity, financial tier and categories.
        </p>
      </header>

      <CompanyProfileTabs
        overview={<ProfileOverview />}
        identity={<IdentityGeographyForm />}
        capabilities={<CapabilitiesCapacityForm />}
        financialTier={<FinancialTierPanel />}
      />
    </div>
  );
}
