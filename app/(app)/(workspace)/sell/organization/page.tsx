// P-VND-equivalent Organization (FE-VEN-11, companion "vendor-context view reusing P-ACC-04..11").
// Board-ruled Option B (2026-07-03, `FE-VEN-14` report §9): a vendor-mounted page composing the
// EXISTING, UNMODIFIED Account components inside vendor-shell chrome — composition only, never a
// fork. Each tab renders the real `/account/*` component unchanged; only the outer shell/chrome and
// the three drill-down action links below are vendor-authored.
//
// Known, disclosed trade-off (not a defect, same class as FE-VEN-10's): "Invite member"/"New
// role" link to the existing `/account/members/invite` and `/account/roles/new` routes — those
// creation flows live on separate Account routes, not reusable components, so composing them here
// means the actions leave vendor chrome for that one destination (real, already-reviewed data)
// rather than staying inside `/sell/*`. "New grant" is disabled, not linked — see the inline
// comment on the Delegation tab below for why.
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, UserPlus } from "lucide-react";
import { PageHeader } from "../../../_components/shell";
import { Button } from "@/frontend/primitives/button";
import { OrganizationTabs } from "../../../_components/vendor/organization";
import { OrganizationProfile } from "../../../account/organization/organization-profile";
import { OrganizationLifecycle } from "../../../account/organization-lifecycle/organization-lifecycle";
import { MembersView } from "../../../account/members/members-view";
import { RolesView } from "../../../account/roles/roles-view";
import { PermissionsView } from "../../../account/permissions/permissions-view";
import { DelegationView } from "../../../account/delegation/delegation-view";

export const metadata: Metadata = { title: "Team & Organization" };

export default function OrganizationPage() {
  return (
    <div>
      <PageHeader
        title="Team & Organization"
        description="Your organization profile, members, roles, permissions, and delegation."
      />
      <OrganizationTabs
        organization={<OrganizationProfile />}
        lifecycle={<OrganizationLifecycle deleted={false} />}
        members={
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/account/members/invite">
                  <UserPlus aria-hidden="true" />
                  Invite member
                </Link>
              </Button>
            </div>
            <MembersView />
          </div>
        }
        roles={
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/account/roles/new">
                  <Plus aria-hidden="true" />
                  New role
                </Link>
              </Button>
            </div>
            <RolesView />
          </div>
        }
        permissions={<PermissionsView />}
        delegation={
          <div className="space-y-4">
            <div className="flex justify-end">
              {/* Unlike Invite member/New role, /account/delegation/new does not exist yet on the
                  Account track itself (pre-existing gap, not introduced here) — disabled rather
                  than linking to a 404. */}
              <Button type="button" disabled>
                <Plus aria-hidden="true" />
                New grant
              </Button>
            </div>
            <DelegationView />
          </div>
        }
      />
    </div>
  );
}
