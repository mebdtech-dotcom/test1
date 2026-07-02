// Subscription route (`/account/subscription`) — P-ACC-17 (Doc-7E · T-DETAILS; page_inventory §13). A
// SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the
// canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: manages the active subscription + its events via the frozen BC-BILL-2 contracts
// `get_subscription`, `list_subscription_events`, `purchase_subscription`, `cancel_subscription`
// (Doc-4I) — but this build performs NO mutation (honest interim). The shell owns the `<main>` container
// + the page `<h1>` (PageHeader).
//
// The `?state=none` preview (empty subscription) is a DEV/QA harness — honored ONLY outside production.
import { PageHeader } from "../../_components/shell/page-header";
import { SubscriptionView } from "./subscription-view";

export const metadata = {
  title: "Subscription — iVendorz",
};

type SearchParams = { state?: string };

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const preview = process.env.NODE_ENV !== "production" ? sp.state : undefined;
  const empty = preview === "none";

  return (
    <>
      <PageHeader title="Subscription" description="Your plan, usage, and billing history." />
      <SubscriptionView empty={empty} />
    </>
  );
}
