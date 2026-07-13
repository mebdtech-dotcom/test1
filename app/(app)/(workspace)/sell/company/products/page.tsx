// S6 Products List (companion §5 → (app)/company/products). Matching-relevant catalog content (DP5).
// Presentation-only; renders genuine-empty until the Doc-5D BC-MKT-2/3 reads are wired. Uses the
// consolidated platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../../_components/shell";
import { ProductsList } from "../../../../_components/vendor/catalog";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Company Profile", href: "/sell/company" }, { label: "Products" }]}
        className="mb-4"
      />
      <PageHeader
        title="Products"
        description="Your product catalog — drafts, published items and specifications."
      />
      <ProductsList />
    </div>
  );
}
