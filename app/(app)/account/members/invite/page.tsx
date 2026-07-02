// Invite member route (`/account/members/invite`) — P-ACC-07 (Doc-7E · T-SETTINGS; page_inventory §13).
// A SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Nested UNDER
// `/account/members`, so it inherits that segment's Platform Shell (one shell, no double-wrap) — no
// co-located layout.
//
// PRESENTATION ONLY: invites a user + manages pending invites via the frozen commands
// `identity.invite_member.v1` and `identity.revoke_invitation.v1` (Doc-4C §C6, `can_manage_users`) — but
// this build performs NO mutation (honest interims). The shell owns the `<main>` container + the page
// `<h1>` (PageHeader).
import { PageHeader } from "../../../_components/shell/page-header";
import { InviteMemberView } from "./invite-member-view";

export const metadata = {
  title: "Invite member — iVendorz",
};

export default function InviteMemberPage() {
  return (
    <>
      <PageHeader
        title="Invite member"
        description="Invite someone to your organization and manage pending invitations."
      />
      <InviteMemberView />
    </>
  );
}
