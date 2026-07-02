// Members route (`/account/members`) — P-ACC-06 (Doc-7E · T-LISTING; page_inventory §13). A SERVER
// COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the canonical
// Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: lists + manages org members via the frozen commands
// `identity.set_membership_status.v1` (suspend ⇄ reinstate) and `identity.remove_member.v1` (Doc-4C §C6,
// `can_manage_users`) — but this build performs NO mutation (honest interims). The shell owns the
// `<main>` container + the page `<h1>` (PageHeader).
import { PageHeader } from "../../_components/shell/page-header";
import { Button } from "@/frontend/primitives/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { MembersView } from "./members-view";

export const metadata = {
  title: "Members — iVendorz",
};

export default function MembersPage() {
  return (
    <>
      <PageHeader
        title="Members"
        description="Manage who belongs to your organization and their access."
        actions={
          <Button asChild>
            <Link href="/account/members/invite">
              <UserPlus aria-hidden="true" />
              Invite member
            </Link>
          </Button>
        }
      />
      <MembersView />
    </>
  );
}
