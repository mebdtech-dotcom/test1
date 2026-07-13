// S5 Categories (companion §4 → (app)/company/categories). Vendor proposes; Admin approves out-of-
// wire. Presentation-only; renders genuine-empty until the Doc-5D reads are wired.
import type { Metadata } from "next";
import { Breadcrumbs } from "../../../../_components/shell";
import { CategoriesPanel } from "../../../../_components/vendor/company";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: "Company Profile", href: "/sell/company" }, { label: "Categories" }]}
      />
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Propose categories for matching. An admin approves each proposal.
        </p>
      </header>

      <CategoriesPanel />
    </div>
  );
}
