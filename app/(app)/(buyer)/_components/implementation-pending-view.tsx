// Buyer Workspace — Implementation Pending scaffold (BX-04 sidebar IA). A buyer-scoped Tier-2
// composition of the canonical page template (shell `Breadcrumbs` + `PageHeader` + kit `EmptyState`)
// for a nav destination whose CONTRACT/read doesn't exist in the frozen corpus yet — reserves the
// route + establishes the page shell now, so the nav is stable, without fabricating data, filters, or
// a business-logic surface for a page that has none to show yet (GI-12: no widget implies
// functionality the surface does not have). An "Action Bar" / "Filters" row is deliberately NOT
// rendered here — there is no real, contract-backed action or filter to offer; adding disabled chrome
// for its own sake would itself be a fabricated affordance. Reuses the SAME shell primitives every
// built buyer page uses; no new kit primitive.
//
// PRESENTATION-ONLY: Server Component, no hooks/fetch/mutation (Content ≠ Presentation, Inv #9).

import type { ReactNode } from "react";
import { Breadcrumbs, PageHeader, type BreadcrumbItem } from "../../_components/shell";
import { EmptyState } from "@/frontend/components/empty-state";

export interface ImplementationPendingViewProps {
  /** Full trail incl. the current (last) page — the shell `Breadcrumbs` convention. */
  breadcrumb: BreadcrumbItem[];
  title: string;
  description?: string;
  icon: ReactNode;
}

export function ImplementationPendingView({
  breadcrumb,
  title,
  description,
  icon,
}: ImplementationPendingViewProps) {
  return (
    <>
      <Breadcrumbs items={breadcrumb} className="mb-4" />
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title="Implementation pending"
        description="This page is reserved in the navigation but not yet built — the underlying read/write contract for this surface isn't in the frozen corpus yet. It will be populated in a future milestone."
        className="py-16"
      />
    </>
  );
}
