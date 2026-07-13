// Buyer-mounted "Team" (BX-04 bug fix, sidebar IA) — composes the EXISTING, UNMODIFIED `MembersView`
// (P-ACC-06) inside the Buyer shell. Composition-not-fork, same pattern as the Vendor track's
// `workspace/organization` (FE-VEN-11), which bundled Members into its combined "Organization" page —
// the buyer sidebar instead names "Team" and "Organization" as two SEPARATE nav items, so this page
// stays single-purpose (Members only); Roles/Permissions/Delegation aren't in the requested sidebar
// and aren't composed here (not fabricated, not requested).
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { MembersView } from "../../../account/members/members-view";

export const metadata: Metadata = { title: "Team" };

export default function BuyerTeamPage() {
  return (
    <div>
      <PageHeader title="Team" description="Members of your organization." />
      <MembersView />
    </div>
  );
}
