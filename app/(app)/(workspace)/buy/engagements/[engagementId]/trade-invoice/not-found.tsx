// P-BUY-23 Trade invoice NOT-FOUND boundary (Doc-7A §8.2 · Inv #11 / GI-12). Rendered by `notFound()` for
// an unknown/absent invoice AND for a non-party engagement alike — INDISTINGUISHABLE: same copy, same
// layout, no leaf ref (the breadcrumb shows only the `Engagements` ancestor, never the requested engagement
// or invoice id). This is the byte-identical genuine-absence guarantee that keeps another party's trade
// invoice — and even its existence — undisclosable.

import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { Breadcrumbs } from "../../../../../_components/shell";

export default function TradeInvoiceNotFound() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Engagements", href: "/buy/engagements" }]} className="mb-4" />
      {/* A standalone not-found page still needs a page heading; kept sr-only so the visual stays the
          minimal genuine-absence card (EmptyState renders its title as a <p>, not a heading). */}
      <h1 className="sr-only">Trade invoice not available</h1>
      <EmptyState
        icon={<ScrollText aria-hidden />}
        title="Trade invoice not available"
        description="This invoice doesn't exist or isn't available to you."
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
