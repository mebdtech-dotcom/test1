// CompanyProfileTabs (companion §4: S1–S4 map to (app)/company). Thin feature adapter over the shared
// WorkspaceTabs infrastructure (Milestone 8): it only maps the four named section slots to tabs and
// owns no tab logic. The section contents are server-rendered and passed in as props. Render is
// byte-identical to the pre-extraction wrapper. RSC-friendly.
import type { ReactNode } from "react";
import { WorkspaceTabs } from "../shared";

export interface CompanyProfileTabsProps {
  overview: ReactNode;
  identity: ReactNode;
  capabilities: ReactNode;
  financialTier: ReactNode;
}

export function CompanyProfileTabs({
  overview,
  identity,
  capabilities,
  financialTier,
}: CompanyProfileTabsProps) {
  return (
    <WorkspaceTabs
      tabs={[
        { value: "overview", label: "Overview", content: overview },
        { value: "identity", label: "Identity & geography", content: identity },
        { value: "capabilities", label: "Capabilities & capacity", content: capabilities },
        { value: "financial-tier", label: "Financial tier", content: financialTier },
      ]}
    />
  );
}
