// P-VND-14 Ad submission / status (companion → (app)/microsite/ads/[adId]). Read =
// `marketplace.get_advertisement.v1` (owning-org scope). Vendor-side actions only: Submit
// (`submit_advertisement.v1`, draft → pending_review) and Pause/Resume (`set_advertisement_state.v1`,
// active ⇄ paused) — Approve/Reject is staff-only (`review_advertisement.v1`, P-ADM-11), never
// offered here. NOTE: no `update_advertisement` contract exists anywhere in the frozen corpus, so a
// draft ad's fields are NOT editable after `create_advertisement.v1` — this is a read-only status
// view for every state including draft, not an editor (never invented past the real contract set).
// Non-owned/absent adId → byte-identical not-found (Invariant #11). Presentation-only; RSC-friendly.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../../../_components/shell";
import { AdDetailPanel } from "../../../../../_components/vendor/ads";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ adId: string }>;
}): Promise<Metadata> {
  const { adId } = await params;
  return { title: `Ad ${adId} · Advertising` };
}

export default async function AdDetailPage({ params }: { params: Promise<{ adId: string }> }) {
  const { adId } = await params;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Microsite & Branding", href: "/sell/microsite" },
          { label: "Advertising", href: "/sell/microsite/ads" },
          { label: "Ad detail" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Ad detail"
        description="Presentation only — submitting and pausing connect in the integration phase."
        meta={<span className="font-mono text-xs text-muted-foreground">{adId}</span>}
      />
      <AdDetailPanel />
    </div>
  );
}
