// Buyer Relationships — canonical detail route (Amendment A1; design plan v0.2 §5: drawer primary,
// THIS page canonical — copied URLs / new tabs / mobile land here; drawer and page will share one
// detail projection at wiring, `ops.get_buyer_relationship.v1`). PRESENTATION-ONLY pre-wiring: no
// read exists yet, so the page renders the honest pending state (VX-03) — never a fabricated record.
// The identity header / provenance timeline / activity / pointer sections mount at wiring.
import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PageHeader } from "../../../../_components/shell";

export const metadata: Metadata = { title: "Buyer Relationships" };

export default function BuyerRelationshipDetailPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer relationship"
        description="The relationship record — verified provenance history, your stage, and private activity."
      />
      <EmptyState
        icon={<Users aria-hidden />}
        title="This record isn't available yet"
        description="Relationship details load once Buyer Relationships reads are connected."
        className="py-12"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/sell/buyer-relationships">← Back to Buyer Relationships</Link>
          </Button>
        }
      />
    </div>
  );
}
