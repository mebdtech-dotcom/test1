// E1 Engagement index (companion §13.3 → (app)/engagements). Post-award relationships awarded to the
// vendor's organization (read = ops.list_engagements.v1, cursor, no totals). Own-party only; role is
// pinned to vendor server-side. Engagements are created out-of-wire on award — no create affordance.
// Presentation-only; renders genuine-empty (one canonical, byte-equivalent copy) until reads are wired.
// Uses the platform shell PageHeader.
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { EngagementList } from "../../../_components/vendor/engagements";

export const metadata: Metadata = { title: "Engagements" };

export default function EngagementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Engagements"
        description="Post-award relationships awarded to your organization — documents and off-platform finance records."
      />
      <EngagementList />
    </div>
  );
}
