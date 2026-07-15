// Delegation grant editor route (`/account/delegation/[grantId]`) — P-ACC-12 (edit mode; Doc-7E ·
// T-SETTINGS). A SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Nested
// under `/account/delegation`, so it inherits that segment's Platform Shell (one shell).
//
// PRESENTATION ONLY: edits a grant via the frozen `suspend/reinstate/revoke_delegation_grant.v1` (Doc-4C
// §C9) — but this build performs NO mutation. An unknown grant id resolves to a genuine not-found (never a
// fabricated grant). The shell owns the `<main>` container + the page `<h1>` (PageHeader).
import { notFound } from "next/navigation";
import { PageHeader } from "../../../_components/shell/page-header";
import { StatusChip } from "@/frontend/components/status-chip";
import { DelegationEditor } from "../delegation-editor";
import { getGrantSeed, STATUS_META } from "../delegation-seed";

export const metadata = {
  title: "Delegation grant — iVendorz",
};

export default async function DelegationGrantPage({
  params,
}: {
  params: Promise<{ grantId: string }>;
}) {
  const { grantId } = await params;
  const grant = getGrantSeed(grantId);
  if (!grant) notFound();

  return (
    <>
      <PageHeader
        title="Delegation grant"
        description="The authority this grant delegates, and the window it applies for."
        meta={
          <StatusChip
            label={STATUS_META[grant.status].label}
            tone={STATUS_META[grant.status].tone}
          />
        }
      />
      <DelegationEditor mode="edit" grant={grant} />
    </>
  );
}
