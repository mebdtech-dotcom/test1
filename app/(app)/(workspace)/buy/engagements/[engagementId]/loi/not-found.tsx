// P-BUY-21 Letter of intent NOT-FOUND boundary (Doc-7A §8.2 · Inv #11 / GI-12). Rendered by `notFound()`
// for an unknown/absent LOI AND for a non-party engagement alike — the two are INDISTINGUISHABLE here: same
// copy, same layout, no leaf ref (the breadcrumb shows only the `Engagements` ancestor, never the requested
// engagement or document id). This is the byte-identical genuine-absence guarantee that keeps another
// party's letter of intent — and even the existence of one — undisclosable.

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { Breadcrumbs } from "../../../../../_components/shell";

export default function LetterOfIntentNotFound() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Engagements", href: "/buy/engagements" }]} className="mb-4" />
      {/* A standalone not-found page still needs a page heading; kept sr-only so the visual stays the
          minimal genuine-absence card (EmptyState renders its title as a <p>, not a heading). */}
      <h1 className="sr-only">Letter of intent not available</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="Letter of intent not available"
        description="This letter of intent doesn't exist or isn't available to you."
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
