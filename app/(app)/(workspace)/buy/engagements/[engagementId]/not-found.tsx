// P-BUY-20 Engagement detail NOT-FOUND boundary (Doc-7A §8.2 · Inv #11 / GI-12). Rendered by `notFound()`
// for an unknown/absent id AND for a non-party id alike — the two are INDISTINGUISHABLE here: same copy,
// same layout, no leaf ref (the breadcrumb shows only the `Engagements` ancestor, never the requested id).
// This is the byte-identical genuine-absence guarantee that keeps another party's engagement undisclosable.

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { Breadcrumbs } from "../../../../_components/shell";

export default function EngagementNotFound() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Engagements", href: "/buy/engagements" }]} className="mb-4" />
      {/* A standalone not-found page still needs a page heading; kept sr-only so the visual stays the
          minimal genuine-absence card (EmptyState renders its title as a <p>, not a heading). */}
      <h1 className="sr-only">Engagement not available</h1>
      <EmptyState
        icon={<Briefcase aria-hidden />}
        title="Engagement not available"
        description="This engagement doesn't exist or isn't available to you."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/buy/engagements">Back to engagements</Link>
          </Button>
        }
        className="py-16"
      />
    </>
  );
}
