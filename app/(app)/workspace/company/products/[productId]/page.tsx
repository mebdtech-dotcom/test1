// S7 Product Editor (companion §5 → (app)/company/products/[productId]). Tabbed editor: Content /
// Specifications (immutable versions) / Publishing (active-category + allowance gated). Presentation-
// only; sections render genuine-empty until the Doc-5D reads are wired. Uses the platform shell
// PageHeader + Breadcrumbs. `productId` is a URL param (display only) — no data is fetched here.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../../_components/shell";
import {
  ProductContentForm,
  ProductEditorTabs,
  ProductPublishPanel,
  ProductSpecsPanel,
} from "../../../../_components/vendor/catalog";

export const metadata: Metadata = { title: "Edit product" };

export default async function ProductEditorPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Company Profile", href: "/workspace/company" },
          { label: "Products", href: "/workspace/company/products" },
          { label: "Edit" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Edit product"
        description="Presentation only — saving connects in the integration phase."
        meta={<span className="font-mono text-xs text-muted-foreground">{productId}</span>}
      />
      <ProductEditorTabs
        content={<ProductContentForm />}
        specifications={<ProductSpecsPanel />}
        publishing={<ProductPublishPanel />}
      />
    </div>
  );
}
