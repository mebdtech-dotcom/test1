// New delegation grant route (`/account/delegation/new`) — P-ACC-12 (create mode; Doc-7E · T-SETTINGS). A
// SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Nested under
// `/account/delegation`, so it inherits that segment's Platform Shell (one shell).
//
// PRESENTATION ONLY: issues a grant via the frozen `identity.create_delegation_grant.v1` (Doc-4C §C9) — but
// this build performs NO mutation. The shell owns the `<main>` container + the page `<h1>` (PageHeader).
import { PageHeader } from "../../../_components/shell/page-header";
import { DelegationEditor } from "../delegation-editor";

export const metadata = {
  title: "New delegation grant — iVendorz",
};

export default function NewDelegationGrantPage() {
  return (
    <>
      <PageHeader
        title="New delegation grant"
        description="Let another organization act on one of your vendor profiles on your behalf."
      />
      <DelegationEditor mode="create" />
    </>
  );
}
