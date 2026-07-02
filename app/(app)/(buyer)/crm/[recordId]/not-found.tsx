// P-BUY-27 CRM detail NOT-FOUND boundary (Doc-7A §8.2 · Inv #11 / GI-12 / §7.5). Rendered by `notFound()`
// for an unknown/absent record AND for a NON-OWNED record alike — INDISTINGUISHABLE: same copy, same layout,
// no leaf ref (the breadcrumb shows only the `Vendor CRM` ancestor, never the requested record id). A CRM
// record is buyer-private; this byte-identical genuine-absence keeps another org's private CRM undisclosable.

import Link from "next/link";
import { Contact } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { Breadcrumbs } from "../../../_components/shell";

export default function CrmDetailNotFound() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Breadcrumbs items={[{ label: "Vendor CRM", href: "/crm" }]} className="mb-4" />
      {/* A standalone not-found page still needs a page heading; kept sr-only so the visual stays the
          minimal genuine-absence card (EmptyState renders its title as a <p>, not a heading). */}
      <h1 className="sr-only">Vendor not available</h1>
      <EmptyState
        icon={<Contact aria-hidden />}
        title="Vendor not available"
        description="This vendor record doesn't exist or isn't available to you."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/crm">Back to Vendor CRM</Link>
          </Button>
        }
        className="py-16"
      />
    </div>
  );
}
