// Buyer sidebar IA (BX-04) — "Active Orders" / "Order History" (Purchase Orders group). RESERVED
// ROUTE, no contract yet: the frozen PO read (`issue_po`/PO detail, P-BUY-21) is scoped to ONE
// engagement (`/buy/engagements/[id]/po`, already built) — there is no cross-engagement "all my purchase
// orders" list read in the corpus. Both sidebar entries land here; `?status=` (allowlisted,
// active | history — the P-BUY-19 query-param convention) only varies the page copy, never fabricated
// data. `ImplementationPendingView` reserves the destination without inventing a list.
import { Package } from "lucide-react";
import { ImplementationPendingView } from "../_components/implementation-pending-view";

export const metadata = {
  title: "Purchase Orders",
};

const STATUS_COPY = {
  active: {
    label: "Active Orders",
    description: "Purchase orders currently in progress across your engagements.",
  },
  history: {
    label: "Order History",
    description: "Completed and closed purchase orders across your engagements.",
  },
} as const;

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status === "history" ? "history" : "active";
  const copy = STATUS_COPY[status];

  return (
    <ImplementationPendingView
      breadcrumb={[{ label: "Purchase Orders" }, { label: copy.label }]}
      title={copy.label}
      description={copy.description}
      icon={<Package aria-hidden />}
    />
  );
}
