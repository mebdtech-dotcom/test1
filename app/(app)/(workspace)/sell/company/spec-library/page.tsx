// P-VND-09 Spec Library (companion §5 → (app)/company/spec-library). Reusable specification library
// entries, sibling to Products/Categories under the Company Catalog group. Presentation-only; renders
// genuine-empty until the Doc-5D BC-MKT-3 reads are wired. Uses the consolidated platform shell
// PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../../_components/shell";
import { SpecLibraryList } from "../../../../_components/vendor/catalog";

export const metadata: Metadata = { title: "Spec Library" };

export default function SpecLibraryPage() {
  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Company Profile", href: "/sell/company" }, { label: "Spec Library" }]}
        className="mb-4"
      />
      <PageHeader
        title="Spec Library"
        description="Reusable specification entries you can link to any product."
      />
      <SpecLibraryList />
    </div>
  );
}
