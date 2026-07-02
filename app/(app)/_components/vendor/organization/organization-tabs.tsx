// OrganizationTabs (FE-VEN-11, P-ACC-04..11 composition). Thin feature adapter over the shared
// WorkspaceTabs infrastructure (Milestone 8 pattern — mirrors CompanyProfileTabs/BillingTabs
// exactly): it only maps six named section slots to tabs and owns no tab logic. Section contents
// are the EXISTING, UNMODIFIED Account components, server-rendered and passed in as props —
// composition only, never a fork (Board ruling 2026-07-03, `FE-VEN-14` report §9, Option B).
// RSC-friendly.
import type { ReactNode } from "react";
import { WorkspaceTabs } from "../shared";

export interface OrganizationTabsProps {
  organization: ReactNode;
  lifecycle: ReactNode;
  members: ReactNode;
  roles: ReactNode;
  permissions: ReactNode;
  delegation: ReactNode;
}

export function OrganizationTabs({
  organization,
  lifecycle,
  members,
  roles,
  permissions,
  delegation,
}: OrganizationTabsProps) {
  return (
    <WorkspaceTabs
      ariaLabel="Organization sections"
      tabs={[
        { value: "organization", label: "Organization", content: organization },
        { value: "lifecycle", label: "Lifecycle", content: lifecycle },
        { value: "members", label: "Members", content: members },
        { value: "roles", label: "Roles", content: roles },
        { value: "permissions", label: "Permissions", content: permissions },
        { value: "delegation", label: "Delegation", content: delegation },
      ]}
    />
  );
}
